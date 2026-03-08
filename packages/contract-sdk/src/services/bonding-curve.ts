import { type WalletClient } from "viem";
import { publicClient } from "../client";
import { bondingCurveFacetAbi } from "../abis";
import { getDiamondAddress } from "../addresses";

const diamond = getDiamondAddress();

// ── Read Functions ──────────────────────────────────────────────

export async function getPrice(ideaId: bigint) {
  return publicClient.readContract({
    address: diamond,
    abi: bondingCurveFacetAbi,
    functionName: "getPrice",
    args: [ideaId],
  });
}

export async function getQuoteBuy(ideaId: bigint, ethAmount: bigint) {
  return publicClient.readContract({
    address: diamond,
    abi: bondingCurveFacetAbi,
    functionName: "getQuoteBuy",
    args: [ideaId, ethAmount],
  });
}

export async function getQuoteSell(ideaId: bigint, tokenAmount: bigint) {
  return publicClient.readContract({
    address: diamond,
    abi: bondingCurveFacetAbi,
    functionName: "getQuoteSell",
    args: [ideaId, tokenAmount],
  });
}

export async function getCurveConfig(ideaId: bigint) {
  return publicClient.readContract({
    address: diamond,
    abi: bondingCurveFacetAbi,
    functionName: "getCurveConfig",
    args: [ideaId],
  });
}

// ── Write Functions ─────────────────────────────────────────────

export async function buy(
  walletClient: WalletClient,
  params: { ideaId: bigint; minTokensOut: bigint; ethAmount: bigint }
) {
  const { ideaId, minTokensOut, ethAmount } = params;

  const hash = await walletClient.writeContract({
    address: diamond,
    abi: bondingCurveFacetAbi,
    functionName: "buy",
    args: [ideaId, minTokensOut],
    value: ethAmount,
    chain: walletClient.chain,
    account: walletClient.account!,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}

export async function sell(
  walletClient: WalletClient,
  params: { ideaId: bigint; tokenAmount: bigint; minEthOut: bigint }
) {
  const { ideaId, tokenAmount, minEthOut } = params;

  const hash = await walletClient.writeContract({
    address: diamond,
    abi: bondingCurveFacetAbi,
    functionName: "sell",
    args: [ideaId, tokenAmount, minEthOut],
    chain: walletClient.chain,
    account: walletClient.account!,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}
