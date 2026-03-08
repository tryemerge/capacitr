import {
  type Address,
  type WalletClient,
  type TransactionReceipt,
  encodeFunctionData,
  decodeEventLog,
} from "viem";
import { publicClient } from "../client";
import { ideaFacetAbi } from "../abis";
import { getDiamondAddress, CHAIN_IDS } from "../addresses";

const diamond = getDiamondAddress();

// ── Read Functions ──────────────────────────────────────────────

export async function getIdea(ideaId: bigint) {
  return publicClient.readContract({
    address: diamond,
    abi: ideaFacetAbi,
    functionName: "getIdea",
    args: [ideaId],
  });
}

export async function getAllIdeas() {
  return publicClient.readContract({
    address: diamond,
    abi: ideaFacetAbi,
    functionName: "getAllIdeas",
  });
}

export async function getIdeaCount() {
  return publicClient.readContract({
    address: diamond,
    abi: ideaFacetAbi,
    functionName: "getIdeaCount",
  });
}

export async function getIdeaByToken(tokenAddress: Address) {
  return publicClient.readContract({
    address: diamond,
    abi: ideaFacetAbi,
    functionName: "getIdeaByToken",
    args: [tokenAddress],
  });
}

// ── Write Helpers ───────────────────────────────────────────────

export function encodeLaunchIdea(
  name: string,
  symbol: string,
  totalSupply: bigint
) {
  return encodeFunctionData({
    abi: ideaFacetAbi,
    functionName: "launchIdea",
    args: [name, symbol, totalSupply],
  });
}

/**
 * Build a transaction object for Privy's `sendTransaction`.
 * Returns `{ to, data, chainId }` — no wallet/signer needed.
 */
export function buildLaunchIdeaTx(params: {
  name: string;
  symbol: string;
  totalSupply: bigint;
}) {
  return {
    to: diamond as `0x${string}`,
    data: encodeLaunchIdea(params.name, params.symbol, params.totalSupply),
    chainId: CHAIN_IDS.arbitrumSepolia,
  };
}

/**
 * Parse the IdeaLaunched event from a transaction receipt to extract the ideaId.
 */
export function parseIdeaLaunchedEvent(receipt: TransactionReceipt): {
  ideaId: bigint;
  ideaToken: Address;
} | null {
  for (const log of receipt.logs) {
    try {
      const event = decodeEventLog({
        abi: ideaFacetAbi,
        data: log.data,
        topics: log.topics,
      });
      if (event.eventName === "IdeaLaunched") {
        const args = event.args as any;
        return {
          ideaId: args.ideaId,
          ideaToken: args.ideaToken,
        };
      }
    } catch {
      // Not our event, skip
    }
  }
  return null;
}

/**
 * Launch idea using a viem WalletClient (for non-Privy wallets).
 */
export async function launchIdea(
  walletClient: WalletClient,
  params: {
    name: string;
    symbol: string;
    totalSupply: bigint;
  }
) {
  const { name, symbol, totalSupply } = params;

  const hash = await walletClient.writeContract({
    address: diamond,
    abi: ideaFacetAbi,
    functionName: "launchIdea",
    args: [name, symbol, totalSupply],
    chain: walletClient.chain,
    account: walletClient.account!,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}
