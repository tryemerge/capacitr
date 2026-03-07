"use client"

import { useState, useMemo } from 'react'
import { useIdeas } from '@/lib/ideas-context'
import { useAuth } from '@/lib/auth-context'
import { AppHeader } from '@/components/app-header'
import { IdeaCard } from '@/components/idea-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Sparkles, TrendingUp, Clock, Users } from 'lucide-react'
import Link from 'next/link'

type FilterType = 'all' | 'live' | 'in-progress' | 'bonding' | 'new' | 'my-ideas'
type SortType = 'recent' | 'trending' | 'contributors'

export default function HomePage() {
  const { ideas } = useIdeas()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [activeSort, setActiveSort] = useState<SortType>('recent')

  // Mock: add some ideas as "owned" by the current user for demo
  const userOwnedIdeaIds = ['idea_1', 'idea_6'] // Maya Chen's ideas

  const filteredIdeas = useMemo(() => {
    let result = [...ideas]

    // Filter by status/type
    switch (activeFilter) {
      case 'live':
        // Graduated/active projects
        result = result.filter(idea => idea.status === 'active')
        break
      case 'in-progress':
        // Pre-bonded, published but not yet bonding
        result = result.filter(idea => idea.status === 'published')
        break
      case 'bonding':
        // Active bonding phase
        result = result.filter(idea => idea.status === 'bonding')
        break
      case 'new':
        // Recently created (within last 7 days)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        result = result.filter(idea => idea.createdAt > weekAgo)
        break
      case 'my-ideas':
        result = result.filter(idea => userOwnedIdeaIds.includes(idea.id))
        break
      case 'all':
      default:
        // Show all except drafts
        result = result.filter(idea => idea.status !== 'draft')
        break
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(idea =>
        idea.title.toLowerCase().includes(query) ||
        idea.pitch.toLowerCase().includes(query) ||
        idea.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Sort
    switch (activeSort) {
      case 'trending':
        result.sort((a, b) => b.investorCount - a.investorCount)
        break
      case 'contributors':
        result.sort((a, b) => b.contributorCount - a.contributorCount)
        break
      case 'recent':
      default:
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
    }

    return result
  }, [ideas, searchQuery, activeFilter, activeSort, userOwnedIdeaIds])

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All Ideas', count: ideas.filter(i => i.status !== 'draft').length },
    { key: 'live', label: 'Live', count: ideas.filter(i => i.status === 'active').length },
    { key: 'in-progress', label: 'In Progress', count: ideas.filter(i => i.status === 'published').length },
    { key: 'bonding', label: 'Active Bonding', count: ideas.filter(i => i.status === 'bonding').length },
    { key: 'new', label: 'New', count: ideas.filter(i => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return i.createdAt > weekAgo
    }).length },
    { key: 'my-ideas', label: 'My Ideas', count: ideas.filter(i => userOwnedIdeaIds.includes(i.id)).length },
  ]

  const sorts: { key: SortType; label: string; icon: React.ReactNode }[] = [
    { key: 'recent', label: 'Recent', icon: <Clock className="h-3.5 w-3.5" /> },
    { key: 'trending', label: 'Trending', icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { key: 'contributors', label: 'Most Active', icon: <Users className="h-3.5 w-3.5" /> },
  ]

  return (
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

        {/* Ideas Grid */}
        {filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIdeas.map((idea) => (
              <IdeaCard 
                key={idea.id} 
                idea={idea} 
                isOwned={userOwnedIdeaIds.includes(idea.id)}
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
            <a href="#" className="hover:text-z700">Docs</a>
            <a href="#" className="hover:text-z700">Terms</a>
            <a href="#" className="hover:text-z700">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
