"use client"

import { useMemo } from 'react'
import { useIdeas } from '@/lib/ideas-context'
import { AppHeader } from '@/components/app-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Wallet, TrendingUp, TrendingDown, ExternalLink, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

// Mock investment data
interface Investment {
  ideaId: string
  investedAt: Date
  ethAmount: number
  tokensReceived: number
  currentTokenPrice: number
  purchaseTokenPrice: number
}

const mockInvestments: Investment[] = [
  {
    ideaId: 'idea_1',
    investedAt: new Date('2026-02-20'),
    ethAmount: 0.5,
    tokensReceived: 500,
    currentTokenPrice: 0.00125,
    purchaseTokenPrice: 0.001,
  },
  {
    ideaId: 'idea_3',
    investedAt: new Date('2026-01-25'),
    ethAmount: 1.2,
    tokensReceived: 1000,
    currentTokenPrice: 0.0018,
    purchaseTokenPrice: 0.0012,
  },
  {
    ideaId: 'idea_4',
    investedAt: new Date('2026-03-01'),
    ethAmount: 0.25,
    tokensReceived: 250,
    currentTokenPrice: 0.00095,
    purchaseTokenPrice: 0.001,
  },
]

export default function MyInvestmentsPage() {
  const { ideas } = useIdeas()

  const investments = useMemo(() => {
    return mockInvestments.map(inv => {
      const idea = ideas.find(i => i.id === inv.ideaId)
      const currentValue = inv.tokensReceived * inv.currentTokenPrice
      const purchaseValue = inv.ethAmount
      const pnl = currentValue - purchaseValue
      const pnlPercent = ((currentValue - purchaseValue) / purchaseValue) * 100
      
      return {
        ...inv,
        idea,
        currentValue,
        pnl,
        pnlPercent,
      }
    }).filter(inv => inv.idea)
  }, [ideas])

  const portfolioStats = useMemo(() => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.ethAmount, 0)
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0)
    const totalPnl = totalCurrentValue - totalInvested
    const totalPnlPercent = totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0
    
    return {
      totalInvested,
      totalCurrentValue,
      totalPnl,
      totalPnlPercent,
      projectCount: investments.length,
    }
  }, [investments])

  const statusColors: Record<string, string> = {
    draft: 'bg-z300 text-z700 border-z400',
    published: 'bg-blue-900/20 text-blue-700 border-blue-700/30',
    bonding: 'bg-brand-orange/15 text-brand-orange border-brand-orange/30',
    active: 'bg-brand-green/15 text-brand-green border-brand-green/30',
    closed: 'bg-red-900/20 text-red-700 border-red-700/30',
  }

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-z900 mb-2">
            MY INVESTMENTS
          </h1>
          <p className="text-z600 text-base">
            Track your portfolio and investment performance.
          </p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-brand-canvas border-z200">
            <CardContent className="p-4">
              <p className="text-xs text-z500 uppercase tracking-wider mb-1">Total Invested</p>
              <p className="text-2xl font-bold text-z800">{portfolioStats.totalInvested.toFixed(2)} ETH</p>
            </CardContent>
          </Card>
          <Card className="bg-brand-canvas border-z200">
            <CardContent className="p-4">
              <p className="text-xs text-z500 uppercase tracking-wider mb-1">Current Value</p>
              <p className="text-2xl font-bold text-z800">{portfolioStats.totalCurrentValue.toFixed(4)} ETH</p>
            </CardContent>
          </Card>
          <Card className="bg-brand-canvas border-z200">
            <CardContent className="p-4">
              <p className="text-xs text-z500 uppercase tracking-wider mb-1">Total P&L</p>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${portfolioStats.totalPnl >= 0 ? 'text-brand-green' : 'text-red-600'}`}>
                  {portfolioStats.totalPnl >= 0 ? '+' : ''}{portfolioStats.totalPnl.toFixed(4)} ETH
                </p>
                {portfolioStats.totalPnl >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-brand-green" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
              <p className={`text-xs ${portfolioStats.totalPnlPercent >= 0 ? 'text-brand-green' : 'text-red-600'}`}>
                {portfolioStats.totalPnlPercent >= 0 ? '+' : ''}{portfolioStats.totalPnlPercent.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
          <Card className="bg-brand-canvas border-z200">
            <CardContent className="p-4">
              <p className="text-xs text-z500 uppercase tracking-wider mb-1">Projects</p>
              <p className="text-2xl font-bold text-z800">{portfolioStats.projectCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Investments List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-z800">Your Positions</h2>
          
          {investments.length > 0 ? (
            <div className="space-y-3">
              {investments.map((inv) => (
                <Card key={inv.ideaId} className="bg-brand-canvas border-z200 hover:border-z300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Project Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-12 w-12 rounded-lg border border-z200">
                          <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${inv.idea?.id}`} />
                          <AvatarFallback className="bg-z100 text-z600 rounded-lg">
                            {inv.idea?.tokenSymbol?.slice(0, 2) || 'ID'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-z800 truncate">{inv.idea?.title}</h3>
                            <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-mono ${statusColors[inv.idea?.status || 'draft']}`}>
                              {inv.idea?.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-z500">
                            <span className="font-mono bg-z100 px-2 py-0.5 rounded">${inv.idea?.tokenSymbol}</span>
                            <span>Invested {formatDate(inv.investedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Investment Details */}
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="text-xs text-z500 mb-0.5">Invested</p>
                          <p className="font-semibold text-z800">{inv.ethAmount.toFixed(2)} ETH</p>
                        </div>
                        <div>
                          <p className="text-xs text-z500 mb-0.5">Tokens</p>
                          <p className="font-semibold text-z800">{inv.tokensReceived.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-z500 mb-0.5">Current Value</p>
                          <p className="font-semibold text-z800">{inv.currentValue.toFixed(4)} ETH</p>
                        </div>
                        <div className="min-w-[100px]">
                          <p className="text-xs text-z500 mb-0.5">P&L</p>
                          <div className="flex items-center justify-end gap-1">
                            <p className={`font-semibold ${inv.pnl >= 0 ? 'text-brand-green' : 'text-red-600'}`}>
                              {inv.pnl >= 0 ? '+' : ''}{inv.pnl.toFixed(4)} ETH
                            </p>
                            {inv.pnl >= 0 ? (
                              <ArrowUpRight className="h-4 w-4 text-brand-green" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <p className={`text-xs ${inv.pnlPercent >= 0 ? 'text-brand-green' : 'text-red-600'}`}>
                            {inv.pnlPercent >= 0 ? '+' : ''}{inv.pnlPercent.toFixed(2)}%
                          </p>
                        </div>
                        <Link href={`/ideas/${inv.ideaId}`}>
                          <Button variant="outline" size="sm" className="border-z300 text-z600 hover:bg-z100">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-brand-canvas rounded-xl border border-z200">
              <Wallet className="h-12 w-12 text-z300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-z700 mb-2 normal-case">No investments yet</h3>
              <p className="text-z500 mb-6">
                Browse ideas and make your first investment!
              </p>
              <Link href="/home">
                <Button className="bg-brand-green hover:bg-brand-green/90 text-white">
                  Discover Ideas
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
