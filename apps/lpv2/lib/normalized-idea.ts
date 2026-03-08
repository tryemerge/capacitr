import type { OnChainIdeaSummary } from "@/hooks/use-all-ideas"
import type { IdeaMetadataRow } from "@/hooks/use-idea-metadata"

export interface NormalizedIdea {
  id: string
  title: string
  pitch?: string
  image?: string
  status: string
  tokenSymbol: string
  tags: string[]
  creatorName: string
  creatorAvatar?: string
  marketCap?: number
  ethRaised: number
  bondingTarget: number
  bondingProgress: number
  investorCount: number
  contributorCount: number
  opportunityScore: number
  createdAt: Date
  isOnChain: boolean
  arbiscanUrl?: string
}

// Fallback images when DB has no imageUrl
const FALLBACK_IMAGES = [
  "/ideas/openclaw_opensource.png",
  "/ideas/indie-video-game.png",
  "/ideas/image.png",
  "/ideas/3d-printed-camera-box.png",
  "/ideas/event-space.png",
  "/ideas/smart-stove-knobs.png",
  "/ideas/table-top-game.png",
  "/ideas/creative-agency.png",
]

function fallbackImage(id: string) {
  const n = parseInt(id, 10)
  const idx = (isNaN(n) ? 0 : n - 1) % FALLBACK_IMAGES.length
  return FALLBACK_IMAGES[idx >= 0 ? idx : 0]
}

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

const ARBISCAN = "https://sepolia.arbiscan.io"

/**
 * Convert an on-chain idea + optional DB metadata into a NormalizedIdea.
 */
export function fromOnChainIdea(
  idea: OnChainIdeaSummary,
  meta?: IdeaMetadataRow | null,
): NormalizedIdea {
  const price = parseFloat(idea.price)
  const totalSupply = parseFloat(idea.totalSupply)
  const marketCap = price * totalSupply

  return {
    id: idea.ideaId,
    title: idea.name,
    image: meta?.imageUrl || fallbackImage(idea.ideaId),
    pitch: meta?.pitch ?? undefined,
    status: idea.statusLabel,
    tokenSymbol: idea.symbol,
    tags: meta?.tags ?? [],
    creatorName: meta?.creatorName || shortenAddress(idea.launcher),
    creatorAvatar: meta?.creatorAvatar ?? undefined,
    marketCap: marketCap > 0 ? marketCap : undefined,
    ethRaised: parseFloat(idea.ethRaised),
    bondingTarget: parseFloat(idea.graduationThreshold),
    bondingProgress: idea.progressPercent,
    investorCount: 0,
    contributorCount: 0,
    opportunityScore: Math.floor(30 + ((parseInt(idea.ideaId, 10) * 17) % 60)),
    createdAt: idea.createdAt,
    isOnChain: true,
    arbiscanUrl: `${ARBISCAN}/address/${idea.ideaToken}`,
  }
}
