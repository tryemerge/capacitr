import type { Idea } from "@/lib/ideas-context"
import type { OnChainIdeaSummary } from "@/hooks/use-all-ideas"

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
  workTasks?: Idea["workTasks"]
}

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

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

const ARBISCAN = "https://sepolia.arbiscan.io"

export function fromMockIdea(idea: Idea): NormalizedIdea {
  const ethRaised = idea.ethRaised ?? 0
  const bondingTarget = idea.bondingTarget ?? 20
  return {
    id: idea.id,
    title: idea.title,
    pitch: idea.pitch,
    image: idea.image,
    status: idea.status === "active" ? "Live" : idea.status,
    tokenSymbol: idea.tokenSymbol || "TOKEN",
    tags: idea.tags,
    creatorName: idea.creatorName,
    creatorAvatar: idea.creatorAvatar,
    marketCap: idea.marketCap,
    ethRaised,
    bondingTarget,
    bondingProgress: idea.bondingProgress ?? Math.round((ethRaised / bondingTarget) * 100),
    investorCount: idea.investorCount,
    contributorCount: idea.contributorCount,
    opportunityScore: idea.opportunityScore ?? 50,
    createdAt: idea.createdAt,
    isOnChain: false,
    workTasks: idea.workTasks,
  }
}

export function fromOnChainIdea(idea: OnChainIdeaSummary): NormalizedIdea {
  const price = parseFloat(idea.price)
  const totalSupply = parseFloat(idea.totalSupply)
  const marketCap = price * totalSupply

  return {
    id: idea.ideaId,
    title: idea.name,
    image: getPlaceholderImage(idea.ideaId),
    status: idea.statusLabel,
    tokenSymbol: idea.symbol,
    tags: [],
    creatorName: shortenAddress(idea.launcher),
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
