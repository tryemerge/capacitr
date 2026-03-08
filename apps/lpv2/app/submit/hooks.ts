/**
 * Custom mutation hooks for the submit wizard.
 *
 * Flow:
 *  Step 1 (Basics)  → launchIdea on-chain + save basics to server
 *  Step 2 (Context) → setModuleContext on-chain + save context to server
 *  Step 3 (Review)  → final server persist only (no on-chain call)
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { parseEther } from "viem"
import { idea, context } from "@capacitr/contract-sdk"
import { publicClient } from "@capacitr/contract-sdk"
import { useSendTransaction } from "@capacitr/auth"
import { ideaKeys } from "@/lib/query-keys"
import { saveBasics, saveContext, submitIdeaAction } from "./actions"
import type { BasicsPayload, ContextPayload, SubmitPayload } from "./schemas"

const DEFAULT_TOTAL_SUPPLY = parseEther("1000000") // 1M tokens

// ---- Step 1: Save Basics + launchIdea on-chain ----

export function useSaveBasics() {
  const queryClient = useQueryClient()
  const { sendTransaction } = useSendTransaction()

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
        const result = await sendTransaction(launchTx)
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

      // 3. Save basics to server (with on-chain references)
      const serverResult = await saveBasics(payload)

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
  const { sendTransaction } = useSendTransaction()

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
            const { hash } = await sendTransaction(contextTx)
            contextHash = hash
          } catch {
            // Non-fatal — idea is already on-chain
            console.warn("Context tx skipped by user")
          }
        }
      }

      // 2. Save context to server
      const serverResult = await saveContext(payload)

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

// ---- Step 3: Final Submit (server only — no on-chain call) ----

export function useSubmitIdea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SubmitPayload) => {
      return submitIdeaAction(payload)
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ideaKeys.lists() })
      queryClient.removeQueries({ queryKey: ideaKeys.drafts() })
    },
  })
}
