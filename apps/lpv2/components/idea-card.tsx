"use client"

import { useState } from 'react'
import Link from 'next/link'
import type { NormalizedIdea } from '@/lib/normalized-idea'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Zap, Crown, TrendingUp, Check, Clock, ExternalLink, ArrowRight, Bot } from 'lucide-react'

interface IdeaCardProps {
  idea: NormalizedIdea
  isOwned?: boolean
}

const mockAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
]

const statusColors: Record<string, string> = {
  draft: 'bg-z300 text-z700 border-z400',
  published: 'bg-blue-900/20 text-blue-700 border-blue-700/30',
  bonding: 'bg-brand-orange/15 text-brand-orange border-brand-orange/30',
  active: 'bg-brand-green/15 text-brand-green border-brand-green/30',
  Live: 'bg-brand-green/15 text-brand-green border-brand-green/30',
  Seeding: 'bg-brand-orange/15 text-brand-orange border-brand-orange/30',
  Graduated: 'bg-blue-900/20 text-blue-700 border-blue-700/30',
  Active: 'bg-brand-green/15 text-brand-green border-brand-green/30',
  closed: 'bg-red-900/20 text-red-700 border-red-700/30',
}

const formatDate = (date: Date) => {
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${m[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
}

export function IdeaCard({ idea, isOwned = false }: IdeaCardProps) {
  const { user } = useAuth()
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false)
  const [investAmount, setInvestAmount] = useState('')
  const [isInvesting, setIsInvesting] = useState(false)
  const [investSuccess, setInvestSuccess] = useState(false)

  const opportunityScore = idea.opportunityScore
  const feeVelocity = (0.1 + (opportunityScore / 100) * 0.5).toFixed(3)
  const activeWorkers = Math.floor(5 + (100 - opportunityScore) / 5)
  const workCompletionRate = Math.floor(10 + (100 - opportunityScore) / 3)
  const saturationLevel = Math.floor(20 + (100 - opportunityScore) * 0.4)
  const dailyEarnings = Math.floor(20 + opportunityScore * 0.5)
  const tokenValue = (0.01 + (opportunityScore / 100) * 0.04).toFixed(4)
  const dailyUsd = (1 + opportunityScore * 0.05).toFixed(2)

  const linkHref = `/ideas/${idea.id}`
  const remaining = Math.max(0, idea.bondingTarget - idea.ethRaised)
  const goalReached = idea.bondingProgress >= 100
  const visibleInvestors = Math.min(idea.investorCount, 5)
  const extraInvestors = Math.max(0, idea.investorCount - 5)

  const handleInvest = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsInvestModalOpen(true)
  }

  const handleConfirmInvest = async () => {
    if (!investAmount || parseFloat(investAmount) <= 0) return
    setIsInvesting(true)
    // TODO: replace with real bonding curve buy tx via Privy
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsInvesting(false)
    setInvestSuccess(true)
    setTimeout(() => {
      setIsInvestModalOpen(false)
      setInvestSuccess(false)
      setInvestAmount('')
    }, 2000)
  }

  const handleCloseModal = () => {
    setIsInvestModalOpen(false)
    setInvestSuccess(false)
    setInvestAmount('')
  }

  return (
    <>
      <Card className="h-full bg-brand-canvas border-z200 hover:border-z300 transition-colors group flex flex-col overflow-hidden !py-0 !gap-0">
        <Link href={linkHref} className="flex-1 flex flex-col">
          {/* Hero Image — aspect-square, object-contain to preserve ratio */}
          {idea.image && (
            <div className="aspect-square w-full bg-z100">
              <img
                src={idea.image}
                alt={idea.title}
                className="w-full h-full object-contain"
              />
              {idea.isOnChain && (
                <div className="absolute top-3 right-3">
                  <span className="text-[9px] font-mono bg-black/50 text-white/70 px-2 py-0.5 rounded backdrop-blur-sm">
                    Arbitrum Sepolia
                  </span>
                </div>
              )}
            </div>
          )}

          <CardHeader className={idea.image ? 'pb-3 pt-3' : 'pb-3'}>
            {/* Status & Badges */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-mono ${statusColors[idea.status] ?? ''}`}>
                  {idea.status}
                </Badge>
                {isOwned && (
                  <Badge className="bg-brand-orange/15 text-brand-orange border-brand-orange/30 text-[10px] uppercase tracking-wider font-mono gap-1">
                    <Crown className="h-3 w-3" /> Yours
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-mono text-brand-orange">${idea.tokenSymbol}</span>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-z800 leading-tight group-hover:text-brand-green transition-colors normal-case">
              {idea.title}
            </h3>

            {/* Pitch */}
            {idea.pitch && (
              <p className="text-sm text-z600 leading-relaxed line-clamp-2 mt-1">{idea.pitch}</p>
            )}
          </CardHeader>

          <CardContent className="pt-0 flex-1 flex flex-col">
            {/* Tags */}
            {idea.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {idea.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[10px] font-mono text-z500 bg-z100 px-2 py-0.5 rounded">{tag}</span>
                ))}
              </div>
            )}

            {/* Market Cap */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-z500">Market Cap</span>
              <span className={`text-sm font-bold font-mono ${goalReached ? 'text-brand-green' : 'text-z800'}`}>
                {idea.marketCap
                  ? idea.marketCap >= 1_000_000
                    ? `$${(idea.marketCap / 1_000_000).toFixed(2)}M`
                    : `$${(idea.marketCap / 1_000).toFixed(0)}K`
                  : '--'}
              </span>
            </div>

            {/* ETH Raised / Bonding Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-z600" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                    <path fill="currentColor" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
                    <path fill="currentColor" opacity="0.6" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/>
                    <path fill="currentColor" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"/>
                    <path fill="currentColor" opacity="0.6" d="M127.962 416.905v-104.72L0 236.585z"/>
                  </svg>
                  <span className="text-sm font-semibold text-z800">{idea.ethRaised.toFixed(2)} ETH</span>
                  <span className="text-xs text-z500">/ {idea.bondingTarget} ETH</span>
                </div>
                <span className={`text-xs font-medium ${goalReached ? 'text-brand-green' : 'text-brand-orange'}`}>
                  {idea.bondingProgress}%
                </span>
              </div>
              <div className="h-2 bg-z200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${goalReached ? 'bg-brand-green' : 'bg-brand-orange'}`}
                  style={{ width: `${Math.min(100, idea.bondingProgress)}%` }}
                />
              </div>
              {goalReached ? (
                <p className="text-[10px] text-brand-green font-medium mt-1">Goal Reached - Project Funded</p>
              ) : (
                <p className="text-[10px] text-z500 mt-1">{remaining.toFixed(2)} ETH to {idea.isOnChain ? 'graduation' : 'bonding target'}</p>
              )}
            </div>

            {/* Agent Opportunity (clickable) */}
            {opportunityScore > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsOpportunityModalOpen(true)
                }}
                className="flex items-center gap-2 p-2 bg-z100 rounded-lg hover:bg-z200 transition-colors mb-3 w-full"
              >
                <div className="flex items-center gap-1.5">
                  <Bot className="h-4 w-4 text-brand-green" />
                  <span className="text-xs font-medium text-z700">Agent Opportunity</span>
                </div>
                <div className="flex-1 h-1.5 bg-z200 rounded-full overflow-hidden mx-2">
                  <div
                    className={`h-full rounded-full ${opportunityScore >= 70 ? 'bg-brand-green' : opportunityScore >= 40 ? 'bg-brand-orange' : 'bg-z400'}`}
                    style={{ width: `${opportunityScore}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${opportunityScore >= 70 ? 'text-brand-green' : opportunityScore >= 40 ? 'text-brand-orange' : 'text-z500'}`}>
                  {opportunityScore}
                </span>
                <TrendingUp className="h-3 w-3 text-z400" />
              </button>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-z200 mt-auto">
              {idea.investorCount > 0 ? (
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {mockAvatars.slice(0, visibleInvestors).map((av, i) => (
                      <Avatar key={i} className="h-6 w-6 border-2 border-brand-canvas">
                        <AvatarImage src={av} />
                        <AvatarFallback className="bg-z200 text-z600 text-[10px]">{i+1}</AvatarFallback>
                      </Avatar>
                    ))}
                    {extraInvestors > 0 && (
                      <div className="h-6 w-6 rounded-full bg-z200 border-2 border-brand-canvas flex items-center justify-center">
                        <span className="text-[10px] font-medium text-z600">+{extraInvestors}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-z500 ml-2">{idea.investorCount} investors</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={idea.creatorAvatar} />
                    <AvatarFallback className="bg-z200 text-z600 text-[10px]">
                      {idea.creatorName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-z500 font-mono">{idea.creatorName}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-z400">
                <Clock className="h-3 w-3" />
                <span className="text-[10px]">{formatDate(idea.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Link>

        {/* Actions — outside Link to avoid nested <a> */}
        <div className="px-6 pb-4 pt-3 space-y-2">
          {goalReached ? (
            <Button disabled className="w-full bg-brand-green/20 text-brand-green font-semibold cursor-not-allowed">
              <Check className="h-4 w-4 mr-2" /> Goal Reached
            </Button>
          ) : (
            <Button
              onClick={handleInvest}
              className="w-full bg-brand-green hover:bg-brand-green/90 text-brand-canvas font-semibold"
              disabled={idea.status === 'closed' || idea.status === 'draft'}
            >
              <Zap className="h-4 w-4 mr-2" /> Invest
            </Button>
          )}
          {idea.arbiscanUrl && (
            <a href={idea.arbiscanUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-z400 hover:text-brand-green transition-colors font-mono">
              View on Arbiscan <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      </Card>

      {/* ── Agent Opportunity Modal ──────────────────────── */}
      <Dialog open={isOpportunityModalOpen} onOpenChange={setIsOpportunityModalOpen}>
        <DialogContent className="bg-brand-canvas border-z200 sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-z800 text-xl flex items-center gap-2">
              <Bot className="h-5 w-5 text-brand-green" />
              Agent Opportunity Analysis
            </DialogTitle>
            <DialogDescription className="text-z600">
              How AI agents evaluate {idea.title} for work opportunities
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 font-mono text-sm">
            {/* Score Summary */}
            <div className="bg-z900 text-z100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-z400">// OPPORTUNITY_SCORE</span>
                <span className={`text-2xl font-bold ${opportunityScore >= 70 ? 'text-brand-green' : opportunityScore >= 40 ? 'text-brand-orange' : 'text-z400'}`}>
                  {opportunityScore}/100
                </span>
              </div>
              <div className="h-2 bg-z700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${opportunityScore >= 70 ? 'bg-brand-green' : opportunityScore >= 40 ? 'bg-brand-orange' : 'bg-z500'}`}
                  style={{ width: `${opportunityScore}%` }}
                />
              </div>
            </div>

            {/* Analysis Steps */}
            <div className="space-y-4">
              <div className="border border-z200 rounded-lg overflow-hidden">
                <div className="bg-z100 px-4 py-2 border-b border-z200">
                  <span className="text-brand-green">1. FEE_VELOCITY_CHECK</span>
                </div>
                <div className="p-4 bg-brand-canvas space-y-2">
                  <p className="text-z600">{">"} Scanning fee pool accumulation rate...</p>
                  <p className="text-z600">{">"} Current velocity: <span className="text-brand-green">+{feeVelocity} ETH/hour</span></p>
                  <p className="text-z600">{">"} 24h trend: <span className="text-brand-green">{opportunityScore >= 50 ? 'INCREASING' : 'STABLE'}</span></p>
                  <p className="text-z500 text-xs mt-2">// High fee velocity indicates active trading and protocol usage</p>
                </div>
              </div>

              <div className="border border-z200 rounded-lg overflow-hidden">
                <div className="bg-z100 px-4 py-2 border-b border-z200">
                  <span className="text-brand-orange">2. WORK_SATURATION_CHECK</span>
                </div>
                <div className="p-4 bg-brand-canvas space-y-2">
                  <p className="text-z600">{">"} Analyzing work token emission rate...</p>
                  <p className="text-z600">{">"} Active workers: <span className="text-brand-orange">{activeWorkers}</span></p>
                  <p className="text-z600">{">"} Work completion rate: <span className="text-brand-orange">{workCompletionRate} tasks/day</span></p>
                  <p className="text-z600">{">"} Saturation level: <span className="text-brand-orange">{saturationLevel}%</span></p>
                  <p className="text-z500 text-xs mt-2">// Low saturation = opportunity for new agents to capture work</p>
                </div>
              </div>

              <div className="border border-z200 rounded-lg overflow-hidden">
                <div className="bg-z100 px-4 py-2 border-b border-z200">
                  <span className="text-blue-500">3. SKILL_MATCH_ANALYSIS</span>
                </div>
                <div className="p-4 bg-brand-canvas space-y-2">
                  <p className="text-z600">{">"} Matching available work types to agent capabilities...</p>
                  <div className="mt-2 space-y-1">
                    {idea.workTasks?.slice(0, 3).map((task, i) => (
                      <p key={i} className="text-z600">
                        {">"} {task.type.toUpperCase()}: <span className="text-blue-500">{task.title}</span>
                        <span className="text-z500"> ({task.reward} tokens)</span>
                      </p>
                    )) || (
                      <>
                        <p className="text-z600">{">"} SOCIAL: Content creation <span className="text-z500">(10 tokens)</span></p>
                        <p className="text-z600">{">"} COMMUNITY: Moderation <span className="text-z500">(15 tokens)</span></p>
                      </>
                    )}
                  </div>
                  <p className="text-z500 text-xs mt-2">// Agent selects highest-reward tasks matching its skill profile</p>
                </div>
              </div>

              <div className="border border-z200 rounded-lg overflow-hidden">
                <div className="bg-z100 px-4 py-2 border-b border-z200">
                  <span className="text-purple-500">4. ROI_PROJECTION</span>
                </div>
                <div className="p-4 bg-brand-canvas space-y-2">
                  <p className="text-z600">{">"} Calculating expected return on compute...</p>
                  <p className="text-z600">{">"} Est. daily earnings: <span className="text-purple-500">{dailyEarnings} ${idea.tokenSymbol}</span></p>
                  <p className="text-z600">{">"} Token value (current): <span className="text-purple-500">${tokenValue}</span></p>
                  <p className="text-z600">{">"} Projected daily USD: <span className="text-purple-500">${dailyUsd}</span></p>
                  <p className="text-z500 text-xs mt-2">// ROI accounts for gas costs and compute overhead</p>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className={`rounded-lg p-4 ${opportunityScore >= 70 ? 'bg-brand-green/10 border border-brand-green/30' : opportunityScore >= 40 ? 'bg-brand-orange/10 border border-brand-orange/30' : 'bg-z100 border border-z200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-wider text-z500">RECOMMENDATION</span>
              </div>
              <p className={`font-bold ${opportunityScore >= 70 ? 'text-brand-green' : opportunityScore >= 40 ? 'text-brand-orange' : 'text-z600'}`}>
                {opportunityScore >= 70
                  ? '>> DEPLOY_AGENT: High opportunity detected. Fee pool growing faster than work output.'
                  : opportunityScore >= 40
                  ? '>> MONITOR: Moderate opportunity. Consider deploying during low-competition hours.'
                  : '>> SKIP: Low opportunity. Work saturation exceeds fee accumulation.'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpportunityModalOpen(false)}
              className="border-z300 text-z600"
            >
              Close
            </Button>
            <Button
              onClick={() => setIsOpportunityModalOpen(false)}
              className="bg-brand-green hover:bg-brand-green/90 text-brand-canvas"
            >
              <Bot className="h-4 w-4 mr-2" />
              Deploy Agent to This Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Invest Modal ───────────────────────────────────── */}
      <Dialog open={isInvestModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="bg-brand-canvas border-z200 sm:max-w-md">
          {!investSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-z800 text-xl">
                  Invest in {idea.title}
                </DialogTitle>
                <DialogDescription className="text-z600">
                  Deposit ETH from your connected wallet to support this idea and earn ${idea.tokenSymbol || 'tokens'} in return.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Wallet Info */}
                <div className="bg-z100 rounded-lg p-3 border border-z200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-z500">Connected Wallet</span>
                    <span className="text-xs font-mono text-z600">
                      {user?.walletAddress
                        ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                        : 'Not connected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-z500">Balance</span>
                    <span className="text-sm font-semibold text-z800">-- ETH</span>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="invest-amount" className="text-z700">
                    Investment Amount
                  </Label>
                  <div className="relative">
                    <Input
                      id="invest-amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value)}
                      className="bg-brand-canvas border-z300 focus:border-brand-green pr-16 text-lg font-semibold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-z500 font-medium">
                      ETH
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[0.1, 0.5, 1].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setInvestAmount(amount.toString())}
                        className="text-xs px-3 py-1 rounded bg-z100 text-z600 hover:bg-z200 transition-colors"
                      >
                        {amount} ETH
                      </button>
                    ))}
                    <button
                      onClick={() => setInvestAmount('2.45')}
                      className="text-xs px-3 py-1 rounded bg-z100 text-z600 hover:bg-z200 transition-colors"
                    >
                      Max
                    </button>
                  </div>
                </div>

                {/* Token Preview */}
                {investAmount && parseFloat(investAmount) > 0 && (
                  <div className="bg-brand-green/5 border border-brand-green/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-z600">You will receive</span>
                      <span className="text-lg font-bold text-brand-green">
                        ~{(parseFloat(investAmount) * 1000).toLocaleString()} ${idea.tokenSymbol || 'TOKENS'}
                      </span>
                    </div>
                    <p className="text-[10px] text-z500 mt-1">
                      Token price is determined by the bonding curve. Early investors get better rates.
                    </p>
                  </div>
                )}

                {/* Bonding Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-z500">Bonding Progress</span>
                    <span className="text-z700 font-medium">{idea.ethRaised.toFixed(1)} / {idea.bondingTarget} ETH</span>
                  </div>
                  <div className="h-2 bg-z200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-orange rounded-full"
                      style={{ width: `${Math.min(100, idea.bondingProgress)}%` }}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="border-z300 text-z600 hover:bg-z100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmInvest}
                  disabled={!investAmount || parseFloat(investAmount) <= 0 || isInvesting}
                  className="bg-brand-green hover:bg-brand-green/90 text-brand-canvas font-semibold"
                >
                  {isInvesting ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-brand-canvas/30 border-t-brand-canvas rounded-full animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      Confirm Investment
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="h-16 w-16 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-z800 mb-2">Investment Successful!</h3>
              <p className="text-z600">
                You invested {investAmount} ETH in {idea.title}
              </p>
              <p className="text-sm text-brand-green font-medium mt-2">
                +{(parseFloat(investAmount) * 1000).toLocaleString()} ${idea.tokenSymbol || 'TOKENS'}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
