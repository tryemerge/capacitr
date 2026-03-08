"use client"

import { useState, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/auth-guard'
import { AppHeader } from '@/components/app-header'
import { IdeaCard } from '@/components/idea-card'
import { fromOnChainIdea } from '@/lib/normalized-idea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Sparkles, TrendingUp, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { useAllIdeas } from '@/hooks/use-all-ideas'
import { useIdeaMetadata } from '@/hooks/use-idea-metadata'

type FilterType = 'all' | 'live' | 'bonding' | 'new' | 'my-ideas'
type SortType = 'recent' | 'trending' | 'contributors'

export default function HomePage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [activeSort, setActiveSort] = useState<SortType>('recent')

  const { data: onChainIdeas, isLoading: isLoadingOnChain } = useAllIdeas()
  const { data: metadataMap } = useIdeaMetadata()

  const filteredIdeas = useMemo(() => {
    if (!onChainIdeas) return []
    let result = onChainIdeas.map((i) => fromOnChainIdea(i, metadataMap?.[i.ideaId]))

    // Filter by status
    switch (activeFilter) {
      case 'live':
        result = result.filter(i => i.status === 'Graduated' || i.status === 'Active')
        break
      case 'bonding':
        result = result.filter(i => i.status === 'Seeding')
        break
      case 'new': {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        result = result.filter(i => i.createdAt > weekAgo)
        break
      }
      case 'my-ideas':
        result = result.filter(i => 
          user?.walletAddress && i.creatorName.toLowerCase().includes(user.walletAddress.slice(0, 6).toLowerCase())
        )
        break
      case 'all':
      default:
        break
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.tokenSymbol.toLowerCase().includes(q) ||
        (i.pitch?.toLowerCase().includes(q)) ||
        i.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    // Sort
    switch (activeSort) {
      case 'trending':
        result.sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0))
        break
      case 'contributors':
        result.sort((a, b) => b.bondingProgress - a.bondingProgress)
        break
      case 'recent':
      default:
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
    }

    return result
  }, [onChainIdeas, metadataMap, searchQuery, activeFilter, activeSort, user?.walletAddress])

  const allNormalized = useMemo(() => 
    (onChainIdeas ?? []).map((i) => fromOnChainIdea(i, metadataMap?.[i.ideaId])), [onChainIdeas, metadataMap]
  )

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All Ideas', count: allNormalized.length },
    { key: 'live', label: 'Live', count: allNormalized.filter(i => i.status === 'Graduated' || i.status === 'Active').length },
    { key: 'bonding', label: 'Seeding', count: allNormalized.filter(i => i.status === 'Seeding').length },
    { key: 'new', label: 'New', count: allNormalized.filter(i => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return i.createdAt > weekAgo
    }).length },
    { key: 'my-ideas', label: 'My Ideas', count: allNormalized.filter(i => 
      user?.walletAddress && i.creatorName.toLowerCase().includes(user.walletAddress.slice(0, 6).toLowerCase())
    ).length },
  ]

  const sorts: { key: SortType; label: string; icon: React.ReactNode }[] = [
    { key: 'recent', label: 'Recent', icon: <Clock className="h-3.5 w-3.5" /> },
    { key: 'trending', label: 'Trending', icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { key: 'contributors', label: 'Most Active', icon: <Users className="h-3.5 w-3.5" /> },
  ]

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-brand-cream">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-z900 mb-2">
            DISCOVER IDEAS
          </h1>
          <p className="text-z600 text-base">
            Browse tokenized ideas, back the ones you believe in, and contribute your skills.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-z400" />
            <Input
              type="text"
              placeholder="Search ideas, tags, or creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-brand-canvas border-z300 focus:border-brand-green text-z700 placeholder:text-z400"
            />
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            {sorts.map((sort) => (
              <Button
                key={sort.key}
                variant="outline"
                size="sm"
                onClick={() => setActiveSort(sort.key)}
                className={`gap-1.5 ${
                  activeSort === sort.key
                    ? 'bg-brand-green text-white border-brand-green hover:bg-brand-green/90 hover:text-white'
                    : 'bg-brand-cream border-z300 text-z600 hover:border-z400 hover:bg-z100'
                }`}
              >
                {sort.icon}
                <span className="hidden sm:inline">{sort.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === filter.key
                  ? filter.key === 'my-ideas' 
                    ? 'bg-brand-orange text-brand-cream'
                    : 'bg-z800 text-brand-cream'
                  : filter.key === 'my-ideas'
                    ? 'bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20'
                    : 'bg-z100 text-z600 hover:bg-z200'
              }`}
            >
              {filter.label}
              <span className={`ml-2 text-xs ${
                activeFilter === filter.key ? 'text-z300' : 'text-z400'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Ideas Grid (on-chain + mock combined) ──────── */}
        {isLoadingOnChain ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIdeas.map((idea) => (
              <IdeaCard 
                key={`oc-${idea.id}`}
                idea={idea} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-brand-canvas rounded-xl border border-z200">
            <Sparkles className="h-12 w-12 text-z300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-z700 mb-2 normal-case">No ideas found</h3>
            <p className="text-z500 mb-6">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : activeFilter === 'my-ideas'
                  ? "You haven't submitted any ideas yet"
                  : 'Be the first to submit an idea!'}
            </p>
            <Link href="/submit">
              <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                Submit an Idea
              </Button>
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-z200 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-orange rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-z700 font-bold tracking-[0.1em] text-sm">CAPACITR</span>
          </div>
          <div className="flex items-center gap-4 text-z500 text-xs">
            <span className="px-2 py-1 bg-brand-green/5 text-brand-green font-mono rounded">ERC-8004</span>
            <span className="px-2 py-1 bg-brand-green/5 text-brand-green font-mono rounded">x402</span>
            <span className="px-2 py-1 bg-brand-green/5 text-brand-green font-mono rounded">Arbitrum</span>
          </div>
          <div className="flex items-center gap-6 text-z500 text-xs">
            <a href="https://docs.capacitr.xyz/" target="_blank" rel="noopener noreferrer" className="hover:text-z700">Docs</a>
            <a href="#" className="hover:text-z700">Terms</a>
            <a href="#" className="hover:text-z700">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
    </ProtectedRoute>
  )
}
