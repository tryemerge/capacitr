import { encodeFunctionData, keccak256, toBytes, toHex } from "viem";
import { publicClient } from "../client";
import { contextFacetAbi } from "../abis";
import { getDiamondAddress, CHAIN_IDS } from "../addresses";

const diamond = getDiamondAddress();

// ── Well-known context keys ─────────────────────────────────────

export const CONTEXT_KEYS = {
  allContext: keccak256(toBytes("context.all")),
  problemStatement: keccak256(toBytes("context.problemStatement")),
  targetCustomers: keccak256(toBytes("context.targetCustomers")),
  comparables: keccak256(toBytes("context.comparables")),
  businessModel: keccak256(toBytes("context.businessModel")),
  marketSize: keccak256(toBytes("context.marketSize")),
  briefsAndMemos: keccak256(toBytes("context.briefsAndMemos")),
} as const;

export type ContextKeyName = keyof typeof CONTEXT_KEYS;

// ── Helpers ─────────────────────────────────────────────────────

/**
 * Hash arbitrary content into a bytes32 content hash for on-chain storage.
 * The actual content should be stored off-chain (IPFS, DB, etc.)
 * and this hash serves as a verifiable reference.
 */
export function hashContent(content: string): `0x${string}` {
  return keccak256(toBytes(content));
}

// ── Read Functions ──────────────────────────────────────────────

export async function getModuleContext(ideaId: bigint, key: `0x${string}`) {
  return publicClient.readContract({
    address: diamond,
    abi: contextFacetAbi,
    functionName: "getModuleContext",
    args: [ideaId, key],
  });
}

export async function getModuleContextHistory(
  ideaId: bigint,
  key: `0x${string}`
) {
  return publicClient.readContract({
    address: diamond,
    abi: contextFacetAbi,
    functionName: "getModuleContextHistory",
    args: [ideaId, key],
  });
}

export async function getModuleKeys(ideaId: bigint) {
  return publicClient.readContract({
    address: diamond,
    abi: contextFacetAbi,
    functionName: "getModuleKeys",
    args: [ideaId],
  });
}

// ── Write Helpers (for Privy sendTransaction) ───────────────────

/**
 * Build a tx to store a single context entry on-chain.
 */
export function buildSetModuleContextTx(params: {
  ideaId: bigint;
  key: `0x${string}`;
  contentHash: `0x${string}`;
}) {
  return {
    to: diamond as `0x${string}`,
    data: encodeFunctionData({
      abi: contextFacetAbi,
      functionName: "setModuleContext",
      args: [params.ideaId, params.key, params.contentHash],
    }),
    chainId: CHAIN_IDS.arbitrumSepolia,
  };
}

/**
 * Build a single tx that stores a hash of ALL context fields at once.
 * The full JSON is stored off-chain (server DB); only the content hash goes on-chain.
 * This means just 1 approval popup instead of N.
 */
export function buildSetAllContextTx(
  ideaId: bigint,
  fields: Partial<Record<ContextKeyName, string>>
) {
  // Strip empty fields and build a canonical JSON blob
  const clean: Record<string, string> = {};
  for (const [name, value] of Object.entries(fields)) {
    if (value && value.trim()) clean[name] = value.trim();
  }

  if (Object.keys(clean).length === 0) return null;

  // Hash the full JSON blob — content is stored off-chain, hash is on-chain proof
  const contentHash = hashContent(JSON.stringify(clean));

  return buildSetModuleContextTx({
    ideaId,
    key: CONTEXT_KEYS.allContext,
    contentHash,
  });
}
