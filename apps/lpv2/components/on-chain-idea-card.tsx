"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Activity, Clock, ExternalLink, Zap } from "lucide-react"
import type { OnChainIdeaSummary } from "@/hooks/use-all-ideas"

const ARBISCAN_BASE = "https://sepolia.arbiscan.io"

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

const statusColors: Record<string, string> = {
  Seeding: "bg-brand-orange/15 text-brand-orange border-brand-orange/30",
  Graduated: "bg-blue-900/20 text-blue-700 border-blue-700/30",
  Active: "bg-brand-green/15 text-brand-green border-brand-green/30",
}

function formatNumber(num: string | number) {
  const n = typeof num === "string" ? parseFloat(num) : num
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`
  if (n === 0) return "0"
  if (n < 0.0001) return `<0.0001`
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 })
}

function formatDate(date: Date) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
}

export function OnChainIdeaCard({ idea }: { idea: OnChainIdeaSummary }) {
  const ethRaised = parseFloat(idea.ethRaised)
  const graduationTarget = parseFloat(idea.graduationThreshold)
  const remaining = Math.max(0, graduationTarget - ethRaised)

  return (
    <Card className="h-full bg-brand-canvas border-z200 hover:border-z300 transition-colors group flex flex-col">
      <Link href={`/ideas/${idea.ideaId}`} className="flex-1 cursor-pointer">
        <CardHeader className="pb-3">
          {/* Status & Ticker */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-[10px] uppercase tracking-wider font-mono ${statusColors[idea.statusLabel] ?? ""}`}
              >
                {idea.statusLabel}
              </Badge>
              <span className="text-[10px] font-mono text-z400">#{idea.ideaId}</span>
            </div>
            <span className="text-[10px] font-mono text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded">
              ${idea.symbol}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-z800 leading-tight group-hover:text-brand-green transition-colors normal-case">
            {idea.name}
          </h3>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col">
          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-3.5 w-3.5 text-brand-orange" />
            <span className="text-sm font-mono font-semibold text-z800">
              {formatNumber(idea.price)} ETH
            </span>
            <span className="text-[10px] text-z400">per token</span>
          </div>

          {/* Bonding Progress */}
          {idea.status === 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <svg
                    className="h-4 w-4 text-z600"
                    viewBox="0 0 256 417"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid"
                  >
                    <path
                      fill="currentColor"
                      d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"
                    />
                    <path
                      fill="currentColor"
                      opacity="0.6"
                      d="M127.962 0L0 212.32l127.962 75.639V154.158z"
                    />
                    <path
                      fill="currentColor"
                      d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"
                    />
                    <path
                      fill="currentColor"
                      opacity="0.6"
                      d="M127.962 416.905v-104.72L0 236.585z"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-z800">
                    {formatNumber(idea.ethRaised)} ETH
                  </span>
                  <span className="text-xs text-z500">
                    / {formatNumber(idea.graduationThreshold)} ETH
                  </span>
                </div>
                <span
                  className={`text-xs font-medium ${
                    idea.progressPercent >= 100
                      ? "text-brand-green"
                      : "text-brand-orange"
                  }`}
                >
                  {idea.progressPercent.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-z200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    idea.progressPercent >= 100
                      ? "bg-brand-green"
                      : "bg-brand-orange"
                  }`}
                  style={{ width: `${Math.min(100, idea.progressPercent)}%` }}
                />
              </div>
              {idea.progressPercent < 100 && (
                <p className="text-[10px] text-z500 mt-1">
                  {formatNumber(remaining)} ETH to graduation
                </p>
              )}
            </div>
          )}

          {/* Footer: Launcher & Date */}
          <div className="flex items-center justify-between pt-3 border-t border-z200 mt-auto">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-z200 text-z600 text-[10px]">
                  {idea.launcher.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-z500 font-mono">
                {shortenAddress(idea.launcher)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-z400">
              <Clock className="h-3 w-3" />
              <span className="text-[10px]">{formatDate(idea.createdAt)}</span>
            </div>
          </div>

        </CardContent>
      </Link>

      {/* Actions — outside the Link to avoid nested <a> */}
      <div className="px-6 pb-4 space-y-3">
        <Link href={`/ideas/${idea.ideaId}`}>
          <Button className="w-full bg-brand-green hover:bg-brand-green/90 text-brand-canvas font-semibold">
            <Zap className="h-4 w-4 mr-2" />
            Invest
          </Button>
        </Link>
        <a
          href={`${ARBISCAN_BASE}/address/${idea.ideaToken}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-z400 hover:text-brand-green transition-colors font-mono"
        >
          View on Arbiscan
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </Card>
  )
}
