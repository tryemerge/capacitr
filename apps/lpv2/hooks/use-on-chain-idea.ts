"use client"

import { useQuery } from "@tanstack/react-query"
import { formatEther, formatUnits } from "viem"
import { idea, bondingCurve, publicClient } from "@capacitr/contract-sdk"

// Matches the Solidity Idea struct
export interface OnChainIdea {
  ideaId: bigint
  name: string
  symbol: string
  ideaToken: string
  workToken: string
  launcher: string
  status: number // 0=SEEDING, 1=GRADUATED, 2=ACTIVE
  totalSupply: bigint
  graduationThreshold: bigint
  createdAt: bigint
  graduatedAt: bigint
}

export interface OnChainCurve {
  ideaId: bigint
  virtualEthReserve: bigint
  virtualTokenReserve: bigint
  realEthReserve: bigint
  realTokenReserve: bigint
  ethFeePercent: bigint
  tokenFeePercent: bigint
  active: boolean
}

export const STATUS_LABELS = ["Seeding", "Graduated", "Active"] as const

export function useOnChainIdea(ideaId: string | undefined) {
  return useQuery({
    queryKey: ["on-chain-idea", ideaId],
    enabled: !!ideaId && !isNaN(Number(ideaId)),
    queryFn: async () => {
      const id = BigInt(ideaId!)

      // Fetch idea + curve + price in parallel
      const [ideaData, curveData, price] = await Promise.all([
        idea.getIdea(id) as Promise<OnChainIdea>,
        bondingCurve.getCurveConfig(id) as Promise<OnChainCurve>,
        bondingCurve.getPrice(id) as Promise<bigint>,
      ])

      // Calculate derived metrics
      const totalSupplyFormatted = formatEther(ideaData.totalSupply)
      const teamReserve = (ideaData.totalSupply * 500n) / 10000n // 5%
      const curveSupply = ideaData.totalSupply - teamReserve
      const tokensSold = curveSupply - curveData.realTokenReserve
      const ethRaised = curveData.realEthReserve
      const progressPercent =
        ideaData.graduationThreshold > 0n
          ? Number((ethRaised * 10000n) / ideaData.graduationThreshold) / 100
          : 0

      return {
        idea: ideaData,
        curve: curveData,
        price,
        derived: {
          statusLabel: STATUS_LABELS[ideaData.status] ?? "Unknown",
          totalSupplyFormatted,
          teamReserveFormatted: formatEther(teamReserve),
          tokensSoldFormatted: formatEther(tokensSold),
          ethRaisedFormatted: formatEther(ethRaised),
          priceFormatted: formatEther(price),
          graduationThresholdFormatted: formatEther(ideaData.graduationThreshold),
          progressPercent: Math.min(progressPercent, 100),
          createdAt: new Date(Number(ideaData.createdAt) * 1000),
          curveActive: curveData.active,
          ethFeePercent: Number(curveData.ethFeePercent) / 100,
          tokenFeePercent: Number(curveData.tokenFeePercent) / 100,
        },
      }
    },
    refetchInterval: 15_000, // refresh every 15s
  })
}

/**
 * Fetch a buy quote for a given ETH amount.
 */
export function useBuyQuote(ideaId: string | undefined, ethAmount: bigint) {
  return useQuery({
    queryKey: ["buy-quote", ideaId, ethAmount.toString()],
    enabled: !!ideaId && ethAmount > 0n,
    queryFn: () => bondingCurve.getQuoteBuy(BigInt(ideaId!), ethAmount),
  })
}

/**
 * Fetch a sell quote for a given token amount.
 */
export function useSellQuote(ideaId: string | undefined, tokenAmount: bigint) {
  return useQuery({
    queryKey: ["sell-quote", ideaId, tokenAmount.toString()],
    enabled: !!ideaId && tokenAmount > 0n,
    queryFn: () => bondingCurve.getQuoteSell(BigInt(ideaId!), tokenAmount),
  })
}
