"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Idea } from '@/lib/ideas-context'
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
import { Users, Zap, ArrowRight, Crown } from 'lucide-react'

interface IdeaCardProps {
  idea: Idea
  isOwned?: boolean
}

// Mock contributor avatars
const mockContributorAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
]

export function IdeaCard({ idea, isOwned = false }: IdeaCardProps) {
  const { user } = useAuth()
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)
  const [investAmount, setInvestAmount] = useState('')
  const [isInvesting, setIsInvesting] = useState(false)
  const [investSuccess, setInvestSuccess] = useState(false)

  const statusColors: Record<string, string> = {
    draft: 'bg-z300 text-z700 border-z400',
    published: 'bg-blue-900/20 text-blue-700 border-blue-700/30',
    bonding: 'bg-brand-orange/15 text-brand-orange border-brand-orange/30',
    active: 'bg-brand-green/15 text-brand-green border-brand-green/30',
    closed: 'bg-red-900/20 text-red-700 border-red-700/30',
  }

  const ethRaised = idea.ethRaised ?? 0
  const bondingTarget = idea.bondingTarget ?? 20
  const bondingProgress = idea.bondingProgress ?? Math.round((ethRaised / bondingTarget) * 100)
  const remainingEth = Math.max(0, bondingTarget - ethRaised)

  const handleInvest = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsInvestModalOpen(true)
  }

  const handleConfirmInvest = async () => {
    if (!investAmount || parseFloat(investAmount) <= 0) return
    
    setIsInvesting(true)
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsInvesting(false)
    setInvestSuccess(true)
    
    // Reset after showing success
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

  // Get contributor avatars based on count
  const visibleContributors = Math.min(idea.investorCount, 5)
  const extraContributors = Math.max(0, idea.investorCount - 5)

  return (
    <>
      <Card className="h-full bg-brand-canvas border-z200 hover:border-z300 transition-colors cursor-pointer group flex flex-col">
        <Link href={`/ideas/${idea.id}`} className="flex-1">
          <CardHeader className="pb-3">
            {/* Owner Badge & Status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-mono ${statusColors[idea.status]}`}>
                  {idea.status}
                </Badge>
                {isOwned && (
                  <Badge className="bg-brand-orange/15 text-brand-orange border-brand-orange/30 text-[10px] uppercase tracking-wider font-mono gap-1">
                    <Crown className="h-3 w-3" />
                    Yours
                  </Badge>
                )}
              </div>
              {idea.tokenSymbol && (
                <span className="text-[10px] font-mono text-z500 bg-z100 px-2 py-0.5 rounded">
                  ${idea.tokenSymbol}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-z800 leading-tight group-hover:text-brand-green transition-colors normal-case">
              {idea.title}
            </h3>

            {/* Pitch */}
            <p className="text-sm text-z600 leading-relaxed line-clamp-2 mt-1">
              {idea.pitch}
            </p>
          </CardHeader>

          <CardContent className="pt-0 flex-1 flex flex-col">
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {idea.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono text-z500 bg-z100 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* ETH Raised & Bonding Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-z600" viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                    <path fill="currentColor" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
                    <path fill="currentColor" opacity="0.6" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/>
                    <path fill="currentColor" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"/>
                    <path fill="currentColor" opacity="0.6" d="M127.962 416.905v-104.72L0 236.585z"/>
                  </svg>
                  <span className="text-sm font-semibold text-z800">{ethRaised.toFixed(2)} ETH</span>
                  <span className="text-xs text-z500">/ {bondingTarget} ETH</span>
                </div>
                <span className={`text-xs font-medium ${bondingProgress >= 100 ? 'text-brand-green' : 'text-brand-orange'}`}>
                  {bondingProgress}%
                </span>
              </div>
              <div className="h-2 bg-z200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${bondingProgress >= 100 ? 'bg-brand-green' : 'bg-brand-orange'}`}
                  style={{ width: `${Math.min(100, bondingProgress)}%` }}
                />
              </div>
              {bondingProgress < 100 && (
                <p className="text-[10px] text-z500 mt-1">
                  {remainingEth.toFixed(2)} ETH to bonding target
                </p>
              )}
            </div>

            {/* Contributors Avatars & Stats */}
            <div className="flex items-center justify-between pt-3 border-t border-z200 mt-auto">
              <div className="flex items-center">
                {/* Stacked avatars */}
                <div className="flex -space-x-2">
                  {mockContributorAvatars.slice(0, visibleContributors).map((avatar, i) => (
                    <Avatar key={i} className="h-6 w-6 border-2 border-brand-canvas">
                      <AvatarImage src={avatar} />
                      <AvatarFallback className="bg-z200 text-z600 text-[10px]">
                        {i + 1}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {extraContributors > 0 && (
                    <div className="h-6 w-6 rounded-full bg-z200 border-2 border-brand-canvas flex items-center justify-center">
                      <span className="text-[10px] font-medium text-z600">+{extraContributors}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-z500 ml-2">
                  {idea.investorCount} {idea.investorCount === 1 ? 'investor' : 'investors'}
                </span>
              </div>
            </div>
          </CardContent>
        </Link>

        {/* Invest Button - Outside the Link */}
        <div className="px-6 pb-4">
          <Button
            onClick={handleInvest}
            className="w-full bg-brand-green hover:bg-brand-green/90 text-brand-canvas font-semibold"
            disabled={idea.status === 'closed' || idea.status === 'draft'}
          >
            <Zap className="h-4 w-4 mr-2" />
            Invest
          </Button>
        </div>
      </Card>

      {/* Invest Modal */}
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
                      {user?.walletAddress?.slice(0, 6)}...{user?.walletAddress?.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-z500">Balance</span>
                    <span className="text-sm font-semibold text-z800">2.45 ETH</span>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-z700">
                    Investment Amount
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
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

                {/* Project Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-z500">Bonding Progress</span>
                    <span className="text-z700 font-medium">{ethRaised} / {bondingTarget} ETH</span>
                  </div>
                  <div className="h-2 bg-z200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-orange rounded-full"
                      style={{ width: `${bondingProgress}%` }}
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
