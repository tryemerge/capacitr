/**
 * Custom mutation hooks for the submit wizard.
 *
 * Flow:
 *  Step 1 (Basics)  → launchIdea on-chain + save basics to server + persist to repository
 *  Step 2 (Context) → setModuleContext on-chain + save context to server + persist to repository
 *  Step 3 (Review)  → final server persist + persist to repository (no on-chain call)
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { parseEther } from "viem"
import { useSendTransaction, useWallets } from "@capacitr/auth"
import { idea, context } from "@capacitr/contract-sdk"
import { publicClient } from "@capacitr/contract-sdk"
import { ideaKeys } from "@/lib/query-keys"
import { ideaRepository } from "@/lib/idea-repository"
import { saveBasics, saveContext, submitIdeaAction } from "./actions"
import type { BasicsPayload, ContextPayload, SubmitPayload } from "./schemas"
import { useCallback } from "react"

const DEFAULT_TOTAL_SUPPLY = parseEther("1000000") // 1M tokens

/**
 * Sends a transaction using the best available wallet.
 * - Embedded Privy wallet → Privy's useSendTransaction (built-in UI)
 * - External EOA (MetaMask etc.) → wallet's EIP-1193 provider
 */
function useSendTx() {
  const { sendTransaction } = useSendTransaction()
  const { wallets } = useWallets()

  const sendTx = useCallback(
    async (tx: { to: string; data: string; value?: string; chainId?: number }) => {
      const embeddedWallet = wallets.find((w) => w.walletClientType === "privy")
      const externalWallet = wallets.find((w) => w.walletClientType !== "privy")

      // Prefer external EOA, fall back to embedded
      const wallet = externalWallet ?? embeddedWallet

      if (!wallet) {
        throw new Error("No wallet connected. Please connect a wallet first.")
      }

      if (wallet.walletClientType === "privy") {
        // Privy embedded wallet — use Privy's built-in send UI
        return sendTransaction(tx)
      }

      // External EOA — switch to Arbitrum Sepolia if needed, then send
      await wallet.switchChain(421614) // Arbitrum Sepolia chainId

      const provider = await wallet.getEthereumProvider()
      const hash = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: wallet.address,
            to: tx.to,
            data: tx.data,
            ...(tx.value ? { value: tx.value } : {}),
          },
        ],
      })
      return { hash: hash as `0x${string}` }
    },
    [sendTransaction, wallets],
  )

  return { sendTx }
}

// ---- Step 1: Save Basics + launchIdea on-chain ----

export function useSaveBasics() {
  const queryClient = useQueryClient()
  const { sendTx } = useSendTx()

  return useMutation({
    mutationFn: async (payload: BasicsPayload) => {
      // 1. Launch idea on-chain (1 approval)
      const launchTx = idea.buildLaunchIdeaTx({
        name: payload.title,
        symbol: payload.tokenTicker,
        totalSupply: DEFAULT_TOTAL_SUPPLY,
      })

      let launchHash: `0x${string}`
      try {
        const result = await sendTx(launchTx)
        launchHash = result.hash
      } catch (err: any) {
        throw new Error(err?.message ?? "Transaction cancelled")
      }

      // 2. Wait for receipt and extract ideaId
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: launchHash,
      })
      const launchEvent = idea.parseIdeaLaunchedEvent(receipt)
      if (!launchEvent) {
        throw new Error("Failed to parse IdeaLaunched event from receipt")
      }

      // 3. Validate via server action
      const serverResult = await saveBasics(payload)

      // 4. Persist to local repository (localStorage) — use the server-generated draftId
      await ideaRepository.saveBasics({ ...payload, draftId: serverResult.draftId })

      return {
        ...serverResult,
        txHash: launchHash,
        onChainIdeaId: launchEvent.ideaId.toString(),
        ideaToken: launchEvent.ideaToken,
      }
    },

    onSuccess: (result) => {
      queryClient.setQueryData(ideaKeys.draft(result.draftId), result)
    },
  })
}

// ---- Step 2: Save Context + setModuleContext on-chain ----

export function useSaveContext() {
  const queryClient = useQueryClient()
  const { sendTx } = useSendTx()

  return useMutation({
    mutationFn: async (payload: ContextPayload & { onChainIdeaId?: string }) => {
      // 1. Store context hash on-chain if we have an ideaId (1 approval)
      let contextHash: string | undefined

      if (payload.onChainIdeaId) {
        const ideaId = BigInt(payload.onChainIdeaId)
        const contextTx = context.buildSetAllContextTx(ideaId, {
          problemStatement: payload.problemStatement,
          targetCustomers: payload.targetCustomers,
          comparables: payload.comparables?.length
            ? JSON.stringify(payload.comparables)
            : undefined,
          businessModel: payload.businessModel,
          marketSize: payload.marketSize,
        })

        if (contextTx) {
          try {
            const result = await sendTx(contextTx)
            contextHash = result.hash
          } catch {
            // Non-fatal — idea is already on-chain
            console.warn("Context tx skipped by user")
          }
        }
      }

      // 2. Validate via server action
      const serverResult = await saveContext(payload)

      // 3. Persist to local repository (localStorage)
      await ideaRepository.saveContext(payload)

      return {
        ...serverResult,
        contextHash,
      }
    },

    onSuccess: (result) => {
      queryClient.setQueryData(ideaKeys.draft(result.draftId), result)
    },
  })
}

// ---- Step 3: Final Submit (server + repository — no on-chain call) ----

export function useSubmitIdea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SubmitPayload) => {
      // 1. Validate via server action
      const serverResult = await submitIdeaAction(payload)

      // 2. Persist final state to local repository (localStorage)
      await ideaRepository.submit(payload)

      return serverResult
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ideaKeys.lists() })
      queryClient.removeQueries({ queryKey: ideaKeys.drafts() })
    },
  })
}
