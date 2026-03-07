"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface IdeaContext {
  targetCustomers?: string
  comparables?: Array<{ name: string; url: string; description: string }>
  businessModel?: string
  marketSize?: string
  briefsAndMemos?: string
}

export interface Idea {
  id: string
  title: string
  pitch: string
  problemStatement: string
  context: IdeaContext
  status: 'draft' | 'published' | 'bonding' | 'active' | 'closed'
  creatorId: string
  creatorName: string
  creatorAvatar?: string
  tokenSymbol?: string
  bondingProgress?: number
  ethRaised?: number
  bondingTarget?: number
  contributorCount: number
  investorCount: number
  createdAt: Date
  tags: string[]
}

interface IdeasContextType {
  ideas: Idea[]
  getIdea: (id: string) => Idea | undefined
  submitIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'contributorCount' | 'investorCount'>) => string
  updateIdea: (id: string, updates: Partial<Idea>) => void
}

const IdeasContext = createContext<IdeasContextType | undefined>(undefined)

// Mock ideas for prototype
const mockIdeas: Idea[] = [
  {
    id: 'idea_1',
    title: 'AI-Powered Code Review',
    pitch: 'Automated code review that learns from your team\'s patterns',
    problemStatement: 'Code reviews take too long and often miss critical issues. Teams need a smarter way to catch bugs and maintain code quality without slowing down development.',
    context: {
      targetCustomers: 'Engineering teams at mid-size startups (50-500 employees) with established codebases',
      comparables: [
        { name: 'CodeClimate', url: 'https://codeclimate.com', description: 'Static analysis platform' },
        { name: 'DeepCode', url: 'https://deepcode.ai', description: 'AI-powered code review' },
      ],
      businessModel: 'SaaS subscription per seat',
      marketSize: 'TAM: $2.5B developer tools market',
    },
    status: 'bonding',
    creatorId: 'user_1',
    creatorName: 'Maya Chen',
    tokenSymbol: 'AICR',
    bondingProgress: 67,
    ethRaised: 13.4,
    bondingTarget: 20,
    contributorCount: 12,
    investorCount: 45,
    createdAt: new Date('2026-02-15'),
    tags: ['AI/ML', 'Developer Tools', 'B2B SaaS'],
  },
  {
    id: 'idea_2',
    title: 'Decentralized Talent Network',
    pitch: 'Reputation-based hiring for the Web3 economy',
    problemStatement: 'Traditional hiring is broken for remote, global talent. Credentials don\'t transfer across platforms, and reputation is siloed.',
    context: {
      targetCustomers: 'DAOs, Web3 startups, and remote-first companies hiring globally',
      businessModel: 'Transaction fee on successful placements',
    },
    status: 'published',
    creatorId: 'user_2',
    creatorName: 'Raj Patel',
    tokenSymbol: 'DTN',
    bondingProgress: 23,
    ethRaised: 4.6,
    bondingTarget: 20,
    contributorCount: 5,
    investorCount: 18,
    createdAt: new Date('2026-02-28'),
    tags: ['Web3', 'HR Tech', 'Marketplace'],
  },
  {
    id: 'idea_3',
    title: 'Smart Contract Insurance',
    pitch: 'Automated coverage for DeFi protocol risks',
    problemStatement: 'DeFi users face significant smart contract risk with no easy way to protect their assets. Insurance protocols are complex and expensive.',
    context: {
      targetCustomers: 'DeFi power users, institutional investors, and DAOs with treasury exposure',
      comparables: [
        { name: 'Nexus Mutual', url: 'https://nexusmutual.io', description: 'Decentralized insurance' },
      ],
      businessModel: 'Premium-based insurance model',
      marketSize: 'TAM: $150B DeFi TVL requiring protection',
    },
    status: 'active',
    creatorId: 'user_3',
    creatorName: 'Lisa Hoffman',
    tokenSymbol: 'SCIP',
    bondingProgress: 100,
    ethRaised: 25,
    bondingTarget: 25,
    contributorCount: 28,
    investorCount: 156,
    createdAt: new Date('2026-01-10'),
    tags: ['DeFi', 'Insurance', 'Risk Management'],
  },
  {
    id: 'idea_4',
    title: 'Agent Orchestration Layer',
    pitch: 'Coordination protocol for autonomous AI agents',
    problemStatement: 'AI agents are siloed and can\'t collaborate effectively. We need infrastructure for agent-to-agent communication and task delegation.',
    context: {
      targetCustomers: 'AI companies, agent operators, and enterprises deploying multiple AI systems',
      businessModel: 'Protocol fees on agent transactions',
    },
    status: 'bonding',
    creatorId: 'user_4',
    creatorName: 'Sam Okonkwo',
    tokenSymbol: 'ORCH',
    bondingProgress: 89,
    ethRaised: 17.8,
    bondingTarget: 20,
    contributorCount: 19,
    investorCount: 72,
    createdAt: new Date('2026-02-20'),
    tags: ['AI Infrastructure', 'Protocols', 'Agent Economy'],
  },
  {
    id: 'idea_5',
    title: 'Carbon Credit Marketplace',
    pitch: 'Transparent trading platform for verified carbon offsets',
    problemStatement: 'The voluntary carbon market lacks transparency and liquidity. Buyers can\'t verify offset quality, and sellers face high intermediary costs.',
    context: {
      targetCustomers: 'Corporations with net-zero commitments, carbon project developers',
      businessModel: 'Marketplace transaction fees',
      marketSize: 'TAM: $50B by 2030',
    },
    status: 'draft',
    creatorId: 'user_5',
    creatorName: 'Elena Rodriguez',
    ethRaised: 0,
    bondingTarget: 15,
    contributorCount: 0,
    investorCount: 0,
    createdAt: new Date('2026-03-01'),
    tags: ['Climate', 'Marketplace', 'ESG'],
  },
  {
    id: 'idea_6',
    title: 'Predictive Maintenance IoT',
    pitch: 'AI-driven equipment failure prediction for manufacturing',
    problemStatement: 'Unplanned equipment downtime costs manufacturers billions annually. Current monitoring systems are reactive, not predictive.',
    context: {
      targetCustomers: 'Manufacturing plants, logistics companies, and industrial operators',
      businessModel: 'SaaS with hardware partnerships',
    },
    status: 'published',
    creatorId: 'user_1',
    creatorName: 'Maya Chen',
    tokenSymbol: 'PMIOT',
    bondingProgress: 45,
    ethRaised: 9,
    bondingTarget: 20,
    contributorCount: 8,
    investorCount: 31,
    createdAt: new Date('2026-02-25'),
    tags: ['IoT', 'AI/ML', 'Industrial'],
  },
]

export function IdeasProvider({ children }: { children: ReactNode }) {
  const [ideas, setIdeas] = useState<Idea[]>(mockIdeas)

  const getIdea = useCallback((id: string) => {
    return ideas.find(idea => idea.id === id)
  }, [ideas])

  const submitIdea = useCallback((idea: Omit<Idea, 'id' | 'createdAt' | 'contributorCount' | 'investorCount'>) => {
    const newId = `idea_${Date.now()}`
    const newIdea: Idea = {
      ...idea,
      id: newId,
      createdAt: new Date(),
      contributorCount: 0,
      investorCount: 0,
    }
    setIdeas(prev => [newIdea, ...prev])
    return newId
  }, [])

  const updateIdea = useCallback((id: string, updates: Partial<Idea>) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id ? { ...idea, ...updates } : idea
    ))
  }, [])

  return (
    <IdeasContext.Provider value={{ ideas, getIdea, submitIdea, updateIdea }}>
      {children}
    </IdeasContext.Provider>
  )
}

export function useIdeas() {
  const context = useContext(IdeasContext)
  if (context === undefined) {
    throw new Error('useIdeas must be used within an IdeasProvider')
  }
  return context
}
