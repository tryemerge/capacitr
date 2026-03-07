"use client"

import { useMemo } from 'react'
import { useIdeas } from '@/lib/ideas-context'
import { AppHeader } from '@/components/app-header'
import { IdeaCard } from '@/components/idea-card'
import { Button } from '@/components/ui/button'
import { Plus, Lightbulb } from 'lucide-react'
import Link from 'next/link'

export default function MyIdeasPage() {
  const { ideas } = useIdeas()

  // Mock: ideas owned by current user
  const userOwnedIdeaIds = ['idea_1', 'idea_6']

  const myIdeas = useMemo(() => {
    return ideas
      .filter(idea => userOwnedIdeaIds.includes(idea.id))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [ideas])

  const stats = {
    total: myIdeas.length,
    live: myIdeas.filter(i => i.status === 'active').length,
    bonding: myIdeas.filter(i => i.status === 'bonding').length,
    draft: myIdeas.filter(i => i.status === 'draft' || i.status === 'published').length,
    totalRaised: myIdeas.reduce((sum, i) => sum + (i.ethRaised || 0), 0),
    totalInvestors: myIdeas.reduce((sum, i) => sum + i.investorCount, 0),
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-z900 mb-2">
              MY IDEAS
            </h1>
            <p className="text-z600 text-base">
              Manage and track your submitted ideas.
            </p>
          </div>
          <Link href="/submit">
            <Button className="bg-brand-green hover:bg-brand-green/90 text-white gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Idea</span>
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-brand-canvas rounded-xl border border-z200 p-4">
            <p className="text-xs text-z500 uppercase tracking-wider mb-1">Total Ideas</p>
            <p className="text-2xl font-bold text-z800">{stats.total}</p>
          </div>
          <div className="bg-brand-canvas rounded-xl border border-z200 p-4">
            <p className="text-xs text-z500 uppercase tracking-wider mb-1">Live Projects</p>
            <p className="text-2xl font-bold text-brand-green">{stats.live}</p>
          </div>
          <div className="bg-brand-canvas rounded-xl border border-z200 p-4">
            <p className="text-xs text-z500 uppercase tracking-wider mb-1">Total Raised</p>
            <p className="text-2xl font-bold text-z800">{stats.totalRaised.toFixed(2)} ETH</p>
          </div>
          <div className="bg-brand-canvas rounded-xl border border-z200 p-4">
            <p className="text-xs text-z500 uppercase tracking-wider mb-1">Total Investors</p>
            <p className="text-2xl font-bold text-z800">{stats.totalInvestors}</p>
          </div>
        </div>

        {/* Ideas Grid */}
        {myIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myIdeas.map((idea) => (
              <IdeaCard 
                key={idea.id} 
                idea={idea} 
                isOwned={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-brand-canvas rounded-xl border border-z200">
            <Lightbulb className="h-12 w-12 text-z300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-z700 mb-2 normal-case">No ideas yet</h3>
            <p className="text-z500 mb-6">
              Submit your first idea to get started!
            </p>
            <Link href="/submit">
              <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                Submit an Idea
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
