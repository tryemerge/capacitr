"use client"

import { use, useState, useEffect } from "react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Share2,
  Clock,
  ExternalLink,
  Wallet,
  Check,
  Copy,
  Activity,
  Droplets,
  Vault,
  Sparkles,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useOnChainIdea } from "@/hooks/use-on-chain-idea"
import { getCoverImage } from "@/lib/cover-image-store"
import Image from "next/image"

const PLACEHOLDER_IMAGES = [
  "/ideas/openclaw_opensource.png",
  "/ideas/indie-video-game.png",
  "/ideas/image.png",
  "/ideas/3d-printed-camera-box.png",
  "/ideas/event-space.png",
  "/ideas/smart-stove-knobs.png",
  "/ideas/table-top-game.png",
  "/ideas/creative-agency.png",
]

function getPlaceholderImage(id: string) {
  const n = parseInt(id, 10)
  const idx = (isNaN(n) ? 0 : n - 1) % PLACEHOLDER_IMAGES.length
  return PLACEHOLDER_IMAGES[idx >= 0 ? idx : 0]
}

interface IdeaDetailPageProps {
  params: Promise<{ id: string }>
}

const ARBISCAN_BASE = "https://sepolia.arbiscan.io"

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="text-z400 hover:text-z600 transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-brand-green" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

function AddressLink({ address, label }: { address: string; label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <code className="text-xs bg-z800 px-2 py-1 rounded text-z300 font-mono">
        {label ?? shortenAddress(address)}
      </code>
      <CopyButton text={address} />
      <a
        href={`${ARBISCAN_BASE}/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-z400 hover:text-brand-green transition-colors"
      >
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  )
}

// ── Loading Skeleton ─────────────────────────────────────────────

function IdeaSkeleton() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Skeleton className="h-4 w-32 mb-6" />
        <Skeleton className="h-8 w-2/3 mb-3" />
        <Skeleton className="h-5 w-full mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </main>
    </div>
  )
}

// ── Error State ──────────────────────────────────────────────────

function IdeaNotFound({ id }: { id: string }) {
  return (
    <div className="min-h-screen bg-brand-cream">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-z500 hover:text-z700 text-sm mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ideas
        </Link>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-z900 mb-3">Idea #{id} not found</h1>
          <p className="text-z500 mb-6">
            This idea doesn't exist on-chain yet, or the ID is invalid.
          </p>
          <Link href="/home">
            <Button className="bg-brand-green hover:bg-brand-green/90 text-white">
              Browse Ideas
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────

export default function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const { id } = use(params)
  const { data, isLoading, isError } = useOnChainIdea(id)
  const [copiedLink, setCopiedLink] = useState(false)
  const [coverImage, setCoverImageState] = useState<string | null>(null)

  useEffect(() => {
    const stored = getCoverImage(id)
    if (stored) setCoverImageState(stored)
  }, [id])

  if (isLoading) return <IdeaSkeleton />
  if (isError || !data) return <IdeaNotFound id={id} />

  const { idea: ideaData, curve, derived } = data

  const ticker = ideaData.symbol
  const statusColors: Record<string, string> = {
    Seeding: "bg-brand-orange/15 text-brand-orange border-brand-orange/30",
    Graduated: "bg-blue-900/20 text-blue-700 border-blue-700/30",
    Active: "bg-brand-green/15 text-brand-green border-brand-green/30",
  }

  const formatNumber = (num: string | number) => {
    const n = typeof num === "string" ? parseFloat(num) : num
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`
    return n.toLocaleString(undefined, { maximumFractionDigits: 6 })
  }

  const formatDate = (date: Date) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ]
    return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
  }

  const copyShareLink = () => {
    const link = typeof window !== "undefined" ? window.location.href : ""
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Back */}
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-z500 hover:text-z700 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ideas
        </Link>

        {/* ── Header with Image ────────────────────────────── */}
        <div className="mb-8 flex gap-6">
          {/* Idea Image — fixed size thumbnail */}
          <div className="shrink-0 h-32 w-32 md:h-40 md:w-40 rounded-xl overflow-hidden border border-z200 bg-z100">
            <div className="relative h-full w-full">
              {coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImage}
                  alt={ideaData.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={getPlaceholderImage(id)}
                  alt={ideaData.name}
                  fill
                  className="object-cover"
                  priority
                />
              )}
            </div>
          </div>

          {/* Header content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase tracking-wider font-mono ${statusColors[derived.statusLabel] ?? ""}`}
                >
                  {derived.statusLabel}
                </Badge>
                <span className="text-sm font-mono text-brand-orange bg-brand-orange/10 px-2 py-1 rounded">
                  ${ticker}
                </span>
                <span className="text-xs font-mono text-z400">
                  Idea #{ideaData.ideaId.toString()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-z300 text-z600 hover:text-z800"
                onClick={copyShareLink}
              >
                {copiedLink ? (
                  <Check className="h-4 w-4 text-brand-green" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                {copiedLink ? "Copied!" : "Share"}
              </Button>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-z900 mb-3 normal-case text-balance">
              {ideaData.name}
            </h1>

            {/* Creator & Timestamp */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-z200 text-z600 text-sm">
                    {ideaData.launcher.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-z700 font-medium font-mono text-xs">
                    {shortenAddress(ideaData.launcher)}
                  </p>
                  <p className="text-xs text-z500">Launcher</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-z500">
                <Clock className="h-4 w-4" />
                <span>{formatDate(derived.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Metrics Cards ──────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Token Price */}
          <Card className="bg-z900 border-z700">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-brand-orange" />
                <span className="text-xs text-z400 uppercase tracking-wider">Price</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">
                {formatNumber(derived.priceFormatted)}
              </p>
              <p className="text-xs text-brand-orange mt-1 font-mono">ETH / ${ticker}</p>
            </CardContent>
          </Card>

          {/* ETH Raised */}
          <Card className="bg-z900 border-z700">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-brand-green" />
                <span className="text-xs text-z400 uppercase tracking-wider">ETH Raised</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">
                {formatNumber(derived.ethRaisedFormatted)}
              </p>
              <p className="text-xs text-brand-green mt-1 font-mono">ETH</p>
            </CardContent>
          </Card>

          {/* Tokens Sold */}
          <Card className="bg-z900 border-z700">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-z400 uppercase tracking-wider">Tokens Sold</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">
                {formatNumber(derived.tokensSoldFormatted)}
              </p>
              <p className="text-xs text-blue-400 mt-1 font-mono">${ticker}</p>
            </CardContent>
          </Card>

          {/* Team Reserve */}
          <Card className="bg-z900 border-z700">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Vault className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-z400 uppercase tracking-wider">Reserve</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">
                {formatNumber(derived.teamReserveFormatted)}
              </p>
              <p className="text-xs text-purple-400 mt-1 font-mono">5% supply</p>
            </CardContent>
          </Card>
        </div>

        {/* ── Market Cap & Bonding Progress ────────────────────── */}
        <Card className="bg-brand-canvas border-z200 mb-8">
          <CardContent className="pt-6">
            {/* Market Cap */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-z200">
              <span className="text-sm font-medium text-z700">Market Cap</span>
              <span className={`text-2xl font-bold font-mono ${derived.progressPercent >= 100 ? 'text-brand-green' : 'text-z800'}`}>
                {derived.marketCapFormatted
                  ? `$${formatNumber(derived.marketCapFormatted)}`
                  : '--'}
              </span>
            </div>

            {/* Bonding Progress */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-brand-orange" />
                <span className="font-medium text-z800">
                  {derived.progressPercent >= 100 ? 'Graduated' : 'Bonding Progress'}
                </span>
              </div>
              <span className={`text-xl font-bold font-mono ${derived.progressPercent >= 100 ? 'text-brand-green' : 'text-brand-orange'}`}>
                {formatNumber(derived.ethRaisedFormatted)} / {formatNumber(derived.graduationThresholdFormatted)} ETH
              </span>
            </div>
            <div className="h-4 bg-z200 rounded-full overflow-hidden mb-4">
              <div
                className={`h-full rounded-full transition-all ${derived.progressPercent >= 100 ? 'bg-brand-green' : 'bg-brand-orange'}`}
                style={{ width: `${Math.min(derived.progressPercent, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-z500">
              <span>
                {derived.progressPercent >= 100 ? (
                  <span className="text-brand-green font-medium">Goal Reached - Project Funded</span>
                ) : (
                  `${derived.progressPercent.toFixed(1)}% complete`
                )}
              </span>
              <span>
                Fee: {derived.ethFeePercent}% ETH / {derived.tokenFeePercent}% token
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Tabs ───────────────────────────────────────────── */}
        <Tabs defaultValue="contracts" className="w-full">
          <TabsList className="bg-z100 border border-z200 p-1 h-auto">
            <TabsTrigger
              value="contracts"
              className="data-[state=active]:bg-brand-cream data-[state=active]:text-z800 text-z600"
            >
              On-Chain
            </TabsTrigger>
            <TabsTrigger
              value="curve"
              className="data-[state=active]:bg-brand-cream data-[state=active]:text-z800 text-z600"
            >
              Bonding Curve
            </TabsTrigger>
          </TabsList>

          {/* ── On-Chain Tab ─────────────────────────────────── */}
          <TabsContent value="contracts" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contract Addresses */}
              <Card className="bg-brand-canvas border-z200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-z700 uppercase tracking-wider normal-case">
                    Contract Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Diamond</span>
                    <AddressLink address="0x98033F10c00306a6a4D64Af84Fb6fAabCA420967" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Idea Token</span>
                    <AddressLink address={ideaData.ideaToken} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Work Token</span>
                    <AddressLink address={ideaData.workToken} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Launcher</span>
                    <AddressLink address={ideaData.launcher} />
                  </div>
                </CardContent>
              </Card>

              {/* Token Info */}
              <Card className="bg-brand-canvas border-z200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-z700 uppercase tracking-wider normal-case">
                    Token Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Name</span>
                    <span className="text-sm text-z800 font-medium">{ideaData.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Symbol</span>
                    <span className="text-sm font-mono text-brand-orange">${ticker}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Total Supply</span>
                    <span className="text-sm font-mono text-z800">
                      {formatNumber(derived.totalSupplyFormatted)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Graduation Threshold</span>
                    <span className="text-sm font-mono text-z800">
                      {formatNumber(derived.graduationThresholdFormatted)} ETH
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Status</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase tracking-wider font-mono ${statusColors[derived.statusLabel] ?? ""}`}
                    >
                      {derived.statusLabel}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Created</span>
                    <span className="text-sm text-z800">{formatDate(derived.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Bonding Curve Tab ────────────────────────────── */}
          <TabsContent value="curve" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-brand-canvas border-z200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-z700 uppercase tracking-wider normal-case">
                    Curve Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Active</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${curve.active ? "border-brand-green/30 text-brand-green" : "border-red-500/30 text-red-500"}`}
                    >
                      {curve.active ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Virtual ETH Reserve</span>
                    <span className="text-sm font-mono text-z800">
                      {formatNumber(Number(curve.virtualEthReserve) / 1e18)} ETH
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Virtual Token Reserve</span>
                    <span className="text-sm font-mono text-z800">
                      {formatNumber(Number(curve.virtualTokenReserve) / 1e18)} ${ticker}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">ETH Fee</span>
                    <span className="text-sm font-mono text-z800">{derived.ethFeePercent}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Token Fee</span>
                    <span className="text-sm font-mono text-z800">{derived.tokenFeePercent}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-brand-canvas border-z200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-z700 uppercase tracking-wider normal-case">
                    Real Reserves
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Current Price</span>
                    <span className="text-lg font-mono font-bold text-brand-orange">
                      {formatNumber(derived.priceFormatted)} ETH
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Real ETH Reserve</span>
                    <span className="text-sm font-mono text-z800">
                      {formatNumber(derived.ethRaisedFormatted)} ETH
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Real Token Reserve</span>
                    <span className="text-sm font-mono text-z800">
                      {formatNumber(Number(curve.realTokenReserve) / 1e18)} ${ticker}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-z500">Tokens Sold</span>
                    <span className="text-sm font-mono text-brand-green">
                      {formatNumber(derived.tokensSoldFormatted)} ${ticker}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
