"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface IdeaContext {
  targetCustomers?: string
  comparables?: Array<{ name: string; url: string; description: string }>
  businessModel?: string
  marketSize?: string
  briefsAndMemos?: string
}

export interface WorkTask {
  id: string
  type: 'social' | 'development' | 'content' | 'community' | 'marketing' | 'bounty'
  title: string
  description: string
  reward: number
  completions: number
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
  image?: string
  tokenSymbol?: string
  bondingProgress?: number
  ethRaised?: number
  bondingTarget?: number
  marketCap?: number // in USD
  contributorCount: number
  investorCount: number
  createdAt: Date
  tags: string[]
  workTasks?: WorkTask[]
  opportunityScore?: number
}

interface IdeasContextType {
  ideas: Idea[]
  getIdea: (id: string) => Idea | undefined
  submitIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'contributorCount' | 'investorCount'>) => string
  updateIdea: (id: string, updates: Partial<Idea>) => void
}

const IdeasContext = createContext<IdeasContextType | undefined>(undefined)

// Mock ideas for prototype - Real-world solopreneur use cases
const mockIdeas: Idea[] = [
  {
    id: 'idea_1',
    title: 'OpenClaw Agent Framework',
    pitch: 'Open-source agent infrastructure that lets anyone deploy, monitor, and monetize AI agents',
    problemStatement: 'Building production AI agents requires expertise in orchestration, monitoring, and deployment. Developers need a framework that handles the hard parts so they can focus on agent logic.',
    context: {
      targetCustomers: 'AI developers, startups building agent-powered products, and enterprises deploying AI automation',
      comparables: [
        { name: 'LangChain', url: 'https://langchain.com', description: 'LLM application framework' },
        { name: 'AutoGPT', url: 'https://autogpt.net', description: 'Autonomous AI agent' },
      ],
      businessModel: 'Open-source core + hosted enterprise features',
      marketSize: 'TAM: $5.1B AI infrastructure market',
    },
    status: 'active',
    creatorId: 'user_1',
    creatorName: 'Alex Reeves',
    image: '/ideas/openclaw_opensource.png',
    tokenSymbol: 'CLAW',
    bondingProgress: 100,
    ethRaised: 10,
    bondingTarget: 10,
    marketCap: 2400000, // $2.4M - graduated project with traction
    contributorCount: 47,
    investorCount: 234,
    createdAt: new Date('2026-03-07'),
    tags: ['Developer Tools', 'Infrastructure', 'AI/ML'],
    workTasks: [
      { id: 'w1', type: 'development', title: 'Build Plugin', description: 'Create a new plugin for the OpenClaw ecosystem', reward: 50, completions: 12 },
      { id: 'w2', type: 'development', title: 'Contribute to Core Repo', description: 'Submit PRs to improve core framework functionality', reward: 25, completions: 34 },
      { id: 'w3', type: 'content', title: 'Write Documentation', description: 'Improve docs, tutorials, and examples', reward: 15, completions: 8 },
      { id: 'w4', type: 'bounty', title: 'Bug Bounty', description: 'Find and report security vulnerabilities', reward: 100, completions: 3 },
      { id: 'w5', type: 'community', title: 'Answer Discord Questions', description: 'Help developers in the community Discord', reward: 5, completions: 89 },
    ],
    opportunityScore: 82,
  },
  {
    id: 'idea_2',
    title: 'Runebound Chronicles',
    pitch: 'Norse-inspired action RPG built by a solo dev with AI agents handling art, QA, and community',
    problemStatement: 'Indie game developers struggle to compete with studio budgets. A single developer can build core gameplay, but needs help with art assets, testing, marketing, and community management to ship a polished product.',
    context: {
      targetCustomers: 'Steam gamers who love indie RPGs, roguelikes, and Norse mythology',
      comparables: [
        { name: 'Hades', url: 'https://supergiantgames.com/hades', description: 'Indie roguelike success story' },
        { name: 'Valheim', url: 'https://valheim.com', description: 'Viral indie Viking survival game' },
      ],
      businessModel: 'Premium game sale ($19.99) + optional cosmetic DLC',
      marketSize: 'TAM: $3.2B indie gaming market on Steam',
    },
    status: 'bonding',
    creatorId: 'user_2',
    creatorName: 'Erik Thornsen',
    image: '/ideas/indie-video-game.png',
    tokenSymbol: 'RUNE',
    bondingProgress: 67,
    ethRaised: 6.7,
    bondingTarget: 10,
    marketCap: 134000, // $134K - correlates to 67% bonding
    contributorCount: 12,
    investorCount: 45,
    createdAt: new Date('2026-03-06'),
    tags: ['Gaming', 'Creator Economy', 'Consumer'],
    workTasks: [
      { id: 'w1', type: 'bounty', title: 'Bug Bounty', description: 'Find and report gameplay bugs with reproduction steps', reward: 20, completions: 15 },
      { id: 'w2', type: 'content', title: 'Create Fan Art', description: 'Design character art, wallpapers, or promotional images', reward: 30, completions: 8 },
      { id: 'w3', type: 'community', title: 'Moderate Discord', description: 'Help manage the community Discord server', reward: 10, completions: 4 },
      { id: 'w4', type: 'social', title: 'Stream the Demo', description: 'Stream gameplay on Twitch with #RuneboundChronicles', reward: 15, completions: 22 },
      { id: 'w5', type: 'content', title: 'Write Game Guide', description: 'Create walkthroughs, tips, and strategy guides', reward: 25, completions: 6 },
    ],
    opportunityScore: 67,
  },
  {
    id: 'idea_3',
    title: 'Frogcoin',
    pitch: 'Community-driven memecoin with AI agents handling social engagement, listings, and community moderation',
    problemStatement: 'Launching a memecoin requires 24/7 community management, constant social media presence, and expensive exchange listings. Solo founders burn out trying to maintain momentum.',
    context: {
      targetCustomers: 'Crypto degens, meme enthusiasts, and speculative traders looking for the next 100x',
      comparables: [
        { name: 'PEPE', url: 'https://pepe.vip', description: 'OG Pepe memecoin' },
        { name: 'DOGE', url: 'https://dogecoin.com', description: 'The original memecoin' },
      ],
      businessModel: 'Token-native economics with transaction taxes funding treasury',
      marketSize: 'TAM: $25B memecoin market cap',
    },
    status: 'bonding',
    creatorId: 'user_3',
    creatorName: 'Anon Frog',
    image: '/ideas/image.png',
    tokenSymbol: 'FROG',
    bondingProgress: 80,
    ethRaised: 8.0,
    bondingTarget: 10,
    marketCap: 160000, // $160K - correlates to 80% bonding
    contributorCount: 156,
    investorCount: 892,
    createdAt: new Date('2026-03-01'),
    tags: ['Web3', 'Consumer', 'Social'],
    workTasks: [
      { id: 'w1', type: 'social', title: 'Create Meme Content', description: 'Make viral memes featuring Frogcoin for Twitter/X', reward: 10, completions: 234 },
      { id: 'w2', type: 'marketing', title: 'DexScreener Boost', description: 'Fund trending placement on DexScreener', reward: 100, completions: 2 },
      { id: 'w3', type: 'community', title: 'Moderate Telegram', description: 'Keep the TG chat clean and ban scammers', reward: 15, completions: 8 },
      { id: 'w4', type: 'social', title: 'Raid Twitter Spaces', description: 'Join crypto Twitter Spaces and shill $FROG', reward: 5, completions: 67 },
      { id: 'w5', type: 'content', title: 'Make TikToks', description: 'Create viral TikTok videos about Frogcoin', reward: 20, completions: 12 },
    ],
    opportunityScore: 91,
  },
  {
    id: 'idea_4',
    title: 'ModularGear Camera Cases',
    pitch: '3D printed custom camera cases designed and fulfilled by AI agents',
    problemStatement: 'Photographers need protective gear customized to their specific kit. Mass-produced cases don\'t fit mixed brand setups, and custom solutions are expensive.',
    context: {
      targetCustomers: 'Professional photographers, videographers, and content creators with multi-brand gear',
      businessModel: 'Ecommerce direct-to-consumer with on-demand 3D printing',
      marketSize: 'TAM: $850M camera accessories market',
    },
    status: 'published',
    creatorId: 'user_4',
    creatorName: 'Priya Sharma',
    image: '/ideas/3d-printed-camera-box.png',
    tokenSymbol: 'GEAR',
    bondingProgress: 34,
    ethRaised: 3.4,
    bondingTarget: 10,
    marketCap: 68000, // $68K - correlates to 34% bonding
    contributorCount: 6,
    investorCount: 22,
    createdAt: new Date('2026-02-28'),
    tags: ['Ecommerce', 'Consumer', 'Creator Economy'],
    workTasks: [
      { id: 'w1', type: 'content', title: 'Product Photography', description: 'Take high-quality photos of cases for the store', reward: 25, completions: 4 },
      { id: 'w2', type: 'social', title: 'Post on r/photography', description: 'Share authentic reviews on photography subreddits', reward: 10, completions: 8 },
      { id: 'w3', type: 'development', title: 'Design New Case Model', description: 'Create 3D printable case designs for new camera models', reward: 50, completions: 2 },
    ],
    opportunityScore: 45,
  },
  {
    id: 'idea_5',
    title: 'The Foundry',
    pitch: 'AI-managed creative event space that handles bookings, vendors, and promotion autonomously',
    problemStatement: 'Running an event space requires constant coordination—bookings, vendor management, marketing, and operations. Solo operators can\'t scale without hiring expensive staff.',
    context: {
      targetCustomers: 'Corporate event planners, wedding coordinators, and community organizers',
      comparables: [
        { name: 'Peerspace', url: 'https://peerspace.com', description: 'Venue marketplace' },
        { name: 'Splacer', url: 'https://splacer.co', description: 'Unique venue rentals' },
      ],
      businessModel: 'Venue rental fees + vendor commissions',
      marketSize: 'TAM: $1.1B event venue market',
    },
    status: 'active',
    creatorId: 'user_5',
    creatorName: 'Marcus Webb',
    image: '/ideas/event-space.png',
    tokenSymbol: 'FNDRY',
    bondingProgress: 100,
    ethRaised: 10,
    bondingTarget: 10,
    marketCap: 1850000, // $1.85M - graduated project with traction
    contributorCount: 28,
    investorCount: 156,
    createdAt: new Date('2026-01-10'),
    tags: ['Professional Services', 'Marketplace', 'Consumer'],
    workTasks: [
      { id: 'w1', type: 'social', title: 'Share Event Photos', description: 'Post photos from events at The Foundry with location tag', reward: 8, completions: 45 },
      { id: 'w2', type: 'content', title: 'Write Venue Review', description: 'Leave detailed reviews on Yelp, Google, and venue sites', reward: 15, completions: 12 },
      { id: 'w3', type: 'community', title: 'Refer a Booking', description: 'Refer clients who book events at The Foundry', reward: 50, completions: 8 },
    ],
    opportunityScore: 58,
  },
  {
    id: 'idea_6',
    title: 'OME Smart Kitchen',
    pitch: 'Retrofit smart stove knobs with AI agents that manage recipes, safety, and grocery ordering',
    problemStatement: 'Smart home cooking requires expensive appliance replacements. Existing stoves work fine—they just need smarter controls and integration with modern AI assistants.',
    context: {
      targetCustomers: 'Home cooks, busy parents, and aging-in-place seniors who want smart cooking without replacing appliances',
      comparables: [
        { name: 'Inirv', url: 'https://inirv.com', description: 'Smart stove knobs for safety' },
        { name: 'June Oven', url: 'https://juneoven.com', description: 'AI-powered smart oven' },
      ],
      businessModel: 'Hardware sale + optional subscription for AI features',
      marketSize: 'TAM: $2.8B smart kitchen appliance market',
    },
    status: 'bonding',
    creatorId: 'user_6',
    creatorName: 'Kenji Nakamura',
    image: '/ideas/smart-stove-knobs.png',
    tokenSymbol: 'OME',
    bondingProgress: 89,
    ethRaised: 8.9,
    bondingTarget: 10,
    marketCap: 178000, // $178K - correlates to 89% bonding
    contributorCount: 19,
    investorCount: 72,
    createdAt: new Date('2026-02-20'),
    tags: ['Consumer', 'Infrastructure', 'AI/ML'],
    workTasks: [
      { id: 'w1', type: 'content', title: 'Recipe Integration', description: 'Add recipes with timing presets to the OME library', reward: 10, completions: 28 },
      { id: 'w2', type: 'bounty', title: 'Hardware Testing', description: 'Test prototypes and report issues with detailed feedback', reward: 40, completions: 5 },
      { id: 'w3', type: 'social', title: 'Demo Video', description: 'Create unboxing or demo videos for YouTube/TikTok', reward: 30, completions: 7 },
    ],
    opportunityScore: 73,
  },
  {
    id: 'idea_7',
    title: 'Realm Tactics',
    pitch: 'Premium tabletop strategy game with AI agents managing playtesting, balancing, and community tournaments',
    problemStatement: 'Board game designers spend years on manual playtesting and balancing. Small publishers can\'t afford the QA and community management that big studios have.',
    context: {
      targetCustomers: 'Tabletop gaming enthusiasts, strategy game collectors, and board game cafe owners',
      comparables: [
        { name: 'Gloomhaven', url: 'https://cephalofair.com', description: 'Crowdfunded dungeon crawler' },
        { name: 'Wingspan', url: 'https://stonemaiergames.com', description: 'Award-winning strategy game' },
      ],
      businessModel: 'Ecommerce premium game sales + expansion packs',
      marketSize: 'TAM: $4.2B tabletop gaming market',
    },
    status: 'published',
    creatorId: 'user_7',
    creatorName: 'Diana Cross',
    image: '/ideas/table-top-game.png',
    tokenSymbol: 'REALM',
    bondingProgress: 45,
    ethRaised: 4.5,
    bondingTarget: 10,
    marketCap: 90000, // $90K - correlates to 45% bonding
    contributorCount: 8,
    investorCount: 31,
    createdAt: new Date('2026-02-25'),
    tags: ['Gaming', 'Ecommerce', 'Consumer'],
    workTasks: [
      { id: 'w1', type: 'bounty', title: 'Playtest Session', description: 'Run a playtest and submit detailed balance feedback', reward: 20, completions: 14 },
      { id: 'w2', type: 'content', title: 'Faction Guide', description: 'Write strategy guides for each faction', reward: 15, completions: 6 },
      { id: 'w3', type: 'social', title: 'Board Game Night Photo', description: 'Share photos of Realm Tactics game nights', reward: 5, completions: 23 },
    ],
    opportunityScore: 38,
  },
  {
    id: 'idea_8',
    title: 'Force Creative Agency',
    pitch: 'Solo creative agency scaled by AI agents handling client comms, project management, and delivery',
    problemStatement: 'Freelance creatives hit a ceiling—they can only take on so many clients before burning out. Hiring is expensive and risky. AI agents can handle the operational overhead.',
    context: {
      targetCustomers: 'Startups, DTC brands, and Web3 projects needing brand identity, motion graphics, and creative direction',
      businessModel: 'Professional services with project-based and retainer pricing',
      marketSize: 'TAM: $58B creative services market',
    },
    status: 'bonding',
    creatorId: 'user_8',
    creatorName: 'Zara Mitchell',
    image: '/ideas/creative-agency.png',
    tokenSymbol: 'FORCE',
    bondingProgress: 52,
    ethRaised: 5.2,
    bondingTarget: 10,
    marketCap: 104000, // $104K - correlates to 52% bonding
    contributorCount: 9,
    investorCount: 38,
    createdAt: new Date('2026-03-01'),
    tags: ['Professional Services', 'Creator Economy', 'Consumer'],
    workTasks: [
      { id: 'w1', type: 'content', title: 'Case Study Write-up', description: 'Document client projects as portfolio case studies', reward: 25, completions: 4 },
      { id: 'w2', type: 'social', title: 'Share Portfolio Work', description: 'Post Force creative work on design communities', reward: 10, completions: 15 },
      { id: 'w3', type: 'community', title: 'Client Referral', description: 'Refer new clients who sign retainer agreements', reward: 100, completions: 2 },
    ],
    opportunityScore: 54,
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
