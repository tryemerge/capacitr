"use client"

import { useQuery } from "@tanstack/react-query"
import { formatEther } from "viem"
import { idea, bondingCurve } from "@capacitr/contract-sdk"

export const STATUS_LABELS = ["Seeding", "Graduated", "Active"] as const

export interface OnChainIdeaSummary {
  ideaId: string
  name: string
  symbol: string
  ideaToken: string
  workToken: string
  launcher: string
  status: number
  statusLabel: string
  totalSupply: string
  createdAt: Date
  // Curve data
  price: string
  ethRaised: string
  graduationThreshold: string
  progressPercent: number
  curveActive: boolean
}

export function useAllIdeas() {
  return useQuery({
    queryKey: ["on-chain-ideas"],
    queryFn: async () => {
      const allIdeas = (await idea.getAllIdeas()) as any[]

      if (!allIdeas || allIdeas.length === 0) return []

      // Fetch curve + price for each idea in parallel
      const enriched = await Promise.all(
        allIdeas.map(async (i) => {
          let price = 0n
          let ethRaised = 0n
          let graduationThreshold = 0n
          let curveActive = false

          try {
            const [curveData, priceData] = await Promise.all([
              bondingCurve.getCurveConfig(i.ideaId) as Promise<any>,
              bondingCurve.getPrice(i.ideaId) as Promise<bigint>,
            ])
            price = priceData
            ethRaised = curveData.realEthReserve
            curveActive = curveData.active
          } catch {
            // Curve might not be initialized
          }

          graduationThreshold = i.graduationThreshold

          const progressPercent =
            graduationThreshold > 0n
              ? Math.min(
                  Number((ethRaised * 10000n) / graduationThreshold) / 100,
                  100
                )
              : 0

          return {
            ideaId: i.ideaId.toString(),
            name: i.name,
            symbol: i.symbol,
            ideaToken: i.ideaToken,
            workToken: i.workToken,
            launcher: i.launcher,
            status: i.status,
            statusLabel: STATUS_LABELS[i.status] ?? "Unknown",
            totalSupply: formatEther(i.totalSupply),
            createdAt: new Date(Number(i.createdAt) * 1000),
            price: formatEther(price),
            ethRaised: formatEther(ethRaised),
            graduationThreshold: formatEther(graduationThreshold),
            progressPercent,
            curveActive,
          } satisfies OnChainIdeaSummary
        })
      )

      // Sort by newest first
      return enriched.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )
    },
    refetchInterval: 30_000, // refresh every 30s
  })
}
