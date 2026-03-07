"use client"

import { use, useState } from 'react'
import { useIdeas } from '@/lib/ideas-context'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Share2,
  Clock,
  ExternalLink,
  Target,
  Building2,
  DollarSign,
  FileText,
  Wallet,
  Twitter,
  Link2,
  Check,
  Copy,
  Plus,
  Activity,
  Droplets,
  Layers,
  Bot,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Vault,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface IdeaDetailPageProps {
  params: Promise<{ id: string }>
}

// Mock work tasks
const mockWorkTasks = [
  {
    id: 'work_1',
    type: 'social_follow',
    title: 'Follow on X (Twitter)',
    description: 'Follow @capacitr_ai on X',
    workTokenReward: 50,
    completedCount: 127,
    icon: Twitter,
  },
  {
    id: 'work_2',
    type: 'social_rt',
    title: 'Retweet Launch Post',
    description: 'RT the pinned announcement tweet',
    workTokenReward: 100,
    completedCount: 89,
    icon: Twitter,
  },
  {
    id: 'work_3',
    type: 'referral',
    title: 'Share Referral Link',
    description: 'Invite others to invest with your referral link',
    workTokenReward: 250,
    completedCount: 34,
    completedPerReferral: true,
    icon: Link2,
  },
]

// Mock contributors
const mockContributors = [
  { id: '1', name: 'Alex Rivera', avatar: null, type: 'human', role: 'Lead Developer', workTokens: 1250 },
  { id: '2', name: 'Sarah Chen', avatar: null, type: 'human', role: 'Product Designer', workTokens: 890 },
  { id: '3', name: 'OpenClaw Agent #42', avatar: null, type: 'agent', role: 'Research Agent', workTokens: 2100 },
  { id: '4', name: 'Marcus Thompson', avatar: null, type: 'human', role: 'Community Lead', workTokens: 450 },
  { id: '5', name: 'AutoDev v2.1', avatar: null, type: 'agent', role: 'Code Review Agent', workTokens: 1800 },
]

// Mock investors
const mockInvestors = [
  { address: '0x742d...F8c2', ensName: 'vitalik.eth', amount: 5.2 },
  { address: '0x8f3A...9B1e', ensName: 'punk6529.eth', amount: 3.8 },
  { address: '0x1234...5678', ensName: null, amount: 2.1 },
  { address: '0xABCD...EF01', ensName: 'sassal.eth', amount: 1.5 },
  { address: '0x9876...5432', ensName: null, amount: 1.2 },
  { address: '0xDEAD...BEEF', ensName: 'cobie.eth', amount: 0.8 },
]

export default function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const { id } = use(params)
  const { getIdea } = useIdeas()
  const idea = getIdea(id)

  const [showContributorsModal, setShowContributorsModal] = useState(false)
  const [showInvestorsModal, setShowInvestorsModal] = useState(false)
  const [showAddWorkModal, setShowAddWorkModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [volumePeriod, setVolumePeriod] = useState<'24h' | '7d' | '30d'>('24h')

  // New work task form state
  const [newWorkTask, setNewWorkTask] = useState({
    type: '',
    title: '',
    description: '',
    reward: '',
  })

  if (!idea) {
    notFound()
  }

  const ticker = idea.tokenSymbol || 'TOKEN'
  const emTicker = `em${ticker}`

  // Mock data for metrics - denominated properly
  const ammVolume = {
    '24h': { eth: 12.45, change: 8.3 },
    '7d': { eth: 89.23, change: -2.1 },
    '30d': { eth: 342.67, change: 15.7 },
  }
  
  const feePool = 48920 // In project tokens
  const derivativePool = 231500 // In emTicker tokens
  const reservePool = 50000000 // 5% of 1B initial supply
  const workTokenValue = 0.0042 // ETH per work token
  const workTokenInProjectToken = 1.25 // Project tokens per work token

  // LP Pool data for post-bonded tokens
  const lpPoolData = {
    pairCreated: '2mo 8d ago',
    pooledToken: 48820000,
    pooledTokenUsd: 124000,
    pooledWeth: 23.64,
    pooledWethUsd: 46000,
    pairAddress: '0x0f4...58cc',
    tokenAddress: '0x69d...7b07',
    wethAddress: '0x420...0006',
  }

  const isPostBonded = idea.status === 'active'

  const statusColors: Record<string, string> = {
    draft: 'bg-z300 text-z700 border-z400',
    published: 'bg-blue-900/20 text-blue-700 border-blue-700/30',
    bonding: 'bg-brand-orange/15 text-brand-orange border-brand-orange/30',
    active: 'bg-brand-green/15 text-brand-green border-brand-green/30',
    closed: 'bg-red-900/20 text-red-700 border-red-700/30',
  }

const formatDate = (date: Date) => {
  // Use UTC to avoid hydration mismatch between server/client
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
}

const _formatDateOld = (date: Date) => {
  return date.toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
      year: 'numeric' 
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
    return num.toLocaleString()
  }

  const copyReferralLink = () => {
    const link = `${typeof window !== 'undefined' ? window.location.href : ''}?ref=user123`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleAddWorkTask = () => {
    setShowAddWorkModal(false)
    setNewWorkTask({ type: '', title: '', description: '', reward: '' })
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-z500 hover:text-z700 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ideas
        </Link>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-mono ${statusColors[idea.status]}`}>
                {idea.status}
              </Badge>
              {idea.tokenSymbol && (
                <span className="text-sm font-mono text-brand-orange bg-brand-orange/10 px-2 py-1 rounded">
                  ${ticker}
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" className="gap-2 border-z300 text-z600 hover:text-z800" onClick={copyReferralLink}>
              {copiedLink ? <Check className="h-4 w-4 text-brand-green" /> : <Share2 className="h-4 w-4" />}
              {copiedLink ? 'Copied!' : 'Share'}
            </Button>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-z900 mb-3 normal-case text-balance">
            {idea.title}
          </h1>
          <p className="text-lg text-z600 leading-relaxed mb-6">
            {idea.pitch}
          </p>

          {/* Creator & Stats */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={idea.creatorAvatar} />
                <AvatarFallback className="bg-z200 text-z600 text-sm">
                  {idea.creatorName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-z700 font-medium">{idea.creatorName}</p>
                <p className="text-xs text-z500">Creator</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-z500">
              <Clock className="h-4 w-4" />
              <span>{formatDate(idea.createdAt)}</span>
            </div>
            
            {/* Clickable Contributors */}
            <button 
              onClick={() => setShowContributorsModal(true)}
              className="flex items-center gap-2 text-z500 hover:text-brand-green transition-colors cursor-pointer group"
            >
              <div className="flex -space-x-2">
                {mockContributors.slice(0, 4).map((c) => (
                  <Avatar key={c.id} className="h-6 w-6 border-2 border-brand-cream">
                    <AvatarFallback className={`text-[10px] ${c.type === 'agent' ? 'bg-brand-orange/20 text-brand-orange' : 'bg-z200 text-z600'}`}>
                      {c.type === 'agent' ? <Bot className="h-3 w-3" /> : c.name[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="group-hover:underline">{idea.contributorCount} contributors</span>
            </button>
            
            {/* Clickable Investors */}
            <button 
              onClick={() => setShowInvestorsModal(true)}
              className="flex items-center gap-2 text-z500 hover:text-brand-green transition-colors cursor-pointer group"
            >
              <div className="flex -space-x-2">
                {mockInvestors.slice(0, 4).map((inv) => (
                  <Avatar key={inv.address} className="h-6 w-6 border-2 border-brand-cream">
                    <AvatarFallback className="bg-brand-green/20 text-brand-green text-[10px]">
                      {inv.ensName ? inv.ensName[0].toUpperCase() : '0x'}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="group-hover:underline">{idea.investorCount} investors</span>
            </button>
          </div>
        </div>

        {/* Token Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* AMM Volume - ETH with time periods */}
          <Card className="bg-z900 border-z700 col-span-2 lg:col-span-1">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-brand-orange" />
                <span className="text-xs text-z400 uppercase tracking-wider">AMM Volume</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">
                {ammVolume[volumePeriod].eth.toFixed(2)} ETH
              </p>
              <div className="flex items-center gap-1 mt-1">
                {ammVolume[volumePeriod].change >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-brand-green" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs font-mono ${ammVolume[volumePeriod].change >= 0 ? 'text-brand-green' : 'text-red-500'}`}>
                  {ammVolume[volumePeriod].change >= 0 ? '+' : ''}{ammVolume[volumePeriod].change}%
                </span>
              </div>
              {/* Time period tabs */}
              <div className="flex gap-1 mt-3 bg-z800 rounded p-0.5">
                {(['24h', '7d', '30d'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setVolumePeriod(period)}
                    className={`flex-1 text-[10px] font-mono py-1 rounded transition-colors ${
                      volumePeriod === period 
                        ? 'bg-z700 text-white' 
                        : 'text-z400 hover:text-z300'
                    }`}
                  >
                    {period.toUpperCase()}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fee Pool - in project token */}
          <Card className="bg-z900 border-z700">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="h-4 w-4 text-brand-green" />
                <span className="text-xs text-z400 uppercase tracking-wider">Fee Pool</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">{formatNumber(feePool)}</p>
              <p className="text-xs text-brand-green mt-1 font-mono">${ticker}</p>
            </CardContent>
          </Card>

          {/* Derivative Pool - in emTicker */}
          <Card className="bg-z900 border-z700">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-z400 uppercase tracking-wider">Deriv Pool</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">{formatNumber(derivativePool)}</p>
              <p className="text-xs text-blue-400 mt-1 font-mono">${emTicker}</p>
            </CardContent>
          </Card>

          {/* Reserve Pool - 5% of supply */}
          <Card className="bg-z900 border-z700">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Vault className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-z400 uppercase tracking-wider">Reserve</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">{formatNumber(reservePool)}</p>
              <p className="text-xs text-purple-400 mt-1 font-mono">5% supply</p>
            </CardContent>
          </Card>

          {/* Work Token Value - in project token with ETH equivalent */}
          <Card className="bg-z900 border-z700">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-brand-orange" />
                <span className="text-xs text-z400 uppercase tracking-wider">Work Token</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">{workTokenInProjectToken}</p>
              <p className="text-xs text-brand-orange mt-1 font-mono">${ticker}/WORK</p>
              <p className="text-[10px] text-z500 mt-0.5">~{workTokenValue} ETH</p>
            </CardContent>
          </Card>
        </div>

        {/* LP Pool Info for Post-Bonded Tokens */}
        {isPostBonded && (
          <Card className="bg-z900 border-z700 mb-8">
            <CardContent className="py-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center">
                    <Droplets className="h-4 w-4 text-brand-green" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Liquidity Pool</p>
                    <p className="text-xs text-z400">${ticker} / WETH</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] border-brand-green/30 text-brand-green">
                  Active LP
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-z700">
                  <span className="text-sm text-z400">Pair created</span>
                  <span className="text-sm text-white font-mono">{lpPoolData.pairCreated}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-z700">
                  <span className="text-sm text-z400">Pooled {ticker}</span>
                  <div className="text-right">
                    <span className="text-sm text-white font-mono">{formatNumber(lpPoolData.pooledToken)}</span>
                    <span className="text-xs text-z500 ml-2">${formatNumber(lpPoolData.pooledTokenUsd)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-z700">
                  <span className="text-sm text-z400">Pooled WETH</span>
                  <div className="text-right">
                    <span className="text-sm text-white font-mono">{lpPoolData.pooledWeth}</span>
                    <span className="text-xs text-z500 ml-2">${formatNumber(lpPoolData.pooledWethUsd)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-z700">
                  <span className="text-sm text-z400">Pair</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-z800 px-2 py-1 rounded text-z300 font-mono">{lpPoolData.pairAddress}</code>
                    <button className="text-z400 hover:text-white">
                      <Copy className="h-3 w-3" />
                    </button>
                    <a href="#" className="text-z400 hover:text-white flex items-center gap-1 text-xs">
                      EXP <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-z700">
                  <span className="text-sm text-z400">{ticker}</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-z800 px-2 py-1 rounded text-z300 font-mono">{lpPoolData.tokenAddress}</code>
                    <a href="#" className="text-z400 hover:text-white text-xs">HLD</a>
                    <a href="#" className="text-z400 hover:text-white flex items-center gap-1 text-xs">
                      EXP <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-z400">WETH</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-z800 px-2 py-1 rounded text-z300 font-mono">{lpPoolData.wethAddress}</code>
                    <a href="#" className="text-z400 hover:text-white text-xs">HLD</a>
                    <a href="#" className="text-z400 hover:text-white flex items-center gap-1 text-xs">
                      EXP <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-z700">
                <Button variant="outline" className="flex-1 border-z600 text-z300 hover:bg-z800 gap-2">
                  <Twitter className="h-4 w-4" />
                  Search on Twitter
                </Button>
                <Button variant="outline" className="flex-1 border-z600 text-z300 hover:bg-z800 gap-2">
                  Other pairs
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bonding Progress (if applicable) */}
        {(idea.status === 'bonding' || idea.status === 'published') && idea.ethRaised !== undefined && (
          <Card className="bg-brand-canvas border-z200 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-brand-orange" />
                  <span className="font-medium text-z800">Bonding Progress</span>
                </div>
                <span className="text-2xl font-bold font-mono text-brand-orange">
                  {idea.ethRaised?.toFixed(2)} / {idea.bondingTarget} ETH
                </span>
              </div>
              <div className="h-4 bg-z200 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-brand-orange rounded-full transition-all"
                  style={{ width: `${Math.min(((idea.ethRaised || 0) / (idea.bondingTarget || 1)) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-z500">
                <span>{idea.bondingProgress || 0}% complete</span>
                <span>{idea.investorCount} backers</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-z100 border border-z200 p-1 h-auto">
              <TabsTrigger value="overview" className="data-[state=active]:bg-brand-cream data-[state=active]:text-z800 text-z600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="work" className="data-[state=active]:bg-brand-cream data-[state=active]:text-z800 text-z600">
                Work Registry
              </TabsTrigger>
              <TabsTrigger value="context" className="data-[state=active]:bg-brand-cream data-[state=active]:text-z800 text-z600">
                Context
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-brand-canvas border-z200">
                    <CardHeader>
                      <CardTitle className="text-base text-z800 normal-case">Problem Statement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-z600 leading-relaxed">{idea.problemStatement}</p>
                    </CardContent>
                  </Card>

                  {/* Tags */}
                  <div className="mt-6">
                    <p className="text-xs text-z500 uppercase tracking-wider font-medium mb-3">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {idea.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-sm font-mono text-brand-green bg-brand-green/10 px-3 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Work Tasks */}
                <div>
                  <Card className="bg-brand-canvas border-z200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-z700 uppercase tracking-wider">Quick Earn</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mockWorkTasks.slice(0, 3).map((task) => (
                        <button
                          key={task.id}
                          className="w-full flex items-center gap-3 p-3 bg-brand-cream rounded-lg hover:bg-z100 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center">
                            <task.icon className="h-4 w-4 text-brand-green" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-z700 truncate">{task.title}</p>
                            <p className="text-xs text-z500">+{task.workTokenReward} WORK</p>
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="work" className="mt-6">
              {/* Work Registry Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-z800">Work Registry</h2>
                  <p className="text-sm text-z500">Complete tasks to earn work tokens</p>
                </div>
                <Button 
                  onClick={() => setShowAddWorkModal(true)}
                  className="bg-brand-green hover:bg-brand-green/90 text-white gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Work Task
                </Button>
              </div>

              {/* Work Tasks List */}
              <div className="space-y-4">
                {mockWorkTasks.map((task) => (
                  <Card key={task.id} className="bg-brand-canvas border-z200">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                          <task.icon className="h-6 w-6 text-brand-green" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-medium text-z800">{task.title}</h3>
                              <p className="text-sm text-z500 mt-1">{task.description}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-mono font-bold text-brand-orange">+{task.workTokenReward}</p>
                              <p className="text-xs text-z500">WORK tokens</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-xs text-z500">
                              {task.completedCount} completed
                            </span>
                            <span className="text-xs text-z400">|</span>
                            <span className="text-xs font-mono text-brand-green">
                              = {(task.workTokenReward * workTokenInProjectToken).toFixed(0)} ${ticker}
                            </span>
                            <span className="text-[10px] text-z400">
                              (~{(task.workTokenReward * workTokenValue).toFixed(4)} ETH)
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white flex-shrink-0"
                          onClick={() => {
                            if (task.type === 'referral') {
                              copyReferralLink()
                            }
                          }}
                        >
                          {task.type === 'referral' ? (
                            copiedLink ? 'Copied!' : 'Copy Link'
                          ) : (
                            'Complete'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Work Token Summary */}
              <Card className="bg-brand-green/5 border-brand-green/20 mt-6">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-z600">Work Token Rate</p>
                      <p className="text-xs text-z500 mt-1">Based on current bonding curve</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold font-mono text-brand-green">{workTokenInProjectToken} ${ticker}</p>
                      <p className="text-xs text-z500">per WORK token (~{workTokenValue} ETH)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="context" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Customers */}
                {idea.context.targetCustomers && (
                  <Card className="bg-brand-canvas border-z200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-z700 flex items-center gap-2 normal-case">
                        <Target className="h-4 w-4 text-brand-orange" />
                        Target Customers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-z600 text-sm leading-relaxed">{idea.context.targetCustomers}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Business Model */}
                {idea.context.businessModel && (
                  <Card className="bg-brand-canvas border-z200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-z700 flex items-center gap-2 normal-case">
                        <DollarSign className="h-4 w-4 text-brand-orange" />
                        Business Model
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-z600 text-sm leading-relaxed">{idea.context.businessModel}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Market Size */}
                {idea.context.marketSize && (
                  <Card className="bg-brand-canvas border-z200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-z700 flex items-center gap-2 normal-case">
                        <TrendingUp className="h-4 w-4 text-brand-orange" />
                        Market Size
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-z600 text-sm leading-relaxed">{idea.context.marketSize}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Comparables */}
                {idea.context.comparables && idea.context.comparables.length > 0 && (
                  <Card className="bg-brand-canvas border-z200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-z700 flex items-center gap-2 normal-case">
                        <Building2 className="h-4 w-4 text-brand-orange" />
                        Comparable Companies
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {idea.context.comparables.map((comp, i) => (
                        <div key={i} className="flex items-start justify-between gap-4 p-3 bg-brand-cream rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-z700">{comp.name}</p>
                            <p className="text-xs text-z500">{comp.description}</p>
                          </div>
                          <a
                            href={comp.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-z400 hover:text-brand-green"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* No context provided */}
                {!idea.context.targetCustomers && 
                 !idea.context.comparables?.length && 
                 !idea.context.businessModel && 
                 !idea.context.marketSize && (
                  <div className="col-span-2 text-center py-12 bg-brand-canvas rounded-xl border border-z200">
                    <FileText className="h-10 w-10 text-z300 mx-auto mb-3" />
                    <p className="text-z500 text-sm">No additional context provided yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Contributors Modal */}
      <Dialog open={showContributorsModal} onOpenChange={setShowContributorsModal}>
        <DialogContent className="bg-brand-canvas border-z200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-z800 normal-case">Contributors</DialogTitle>
            <DialogDescription className="text-z500">
              Humans and agents contributing to this project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4 max-h-80 overflow-y-auto">
            {mockContributors.map((contributor) => (
              <div key={contributor.id} className="flex items-center gap-3 p-3 bg-brand-cream rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={`text-sm ${contributor.type === 'agent' ? 'bg-brand-orange/20 text-brand-orange' : 'bg-z200 text-z600'}`}>
                    {contributor.type === 'agent' ? <Bot className="h-5 w-5" /> : contributor.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-z700 truncate">{contributor.name}</p>
                    {contributor.type === 'agent' && (
                      <Badge variant="outline" className="text-[10px] border-brand-orange/30 text-brand-orange">
                        Agent
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-z500">{contributor.role}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-brand-green">{contributor.workTokens}</p>
                  <p className="text-[10px] text-z400">WORK</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Investors Modal */}
      <Dialog open={showInvestorsModal} onOpenChange={setShowInvestorsModal}>
        <DialogContent className="bg-brand-canvas border-z200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-z800 normal-case">Investors</DialogTitle>
            <DialogDescription className="text-z500">
              Wallet addresses backing this project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4 max-h-80 overflow-y-auto">
            {mockInvestors.map((investor) => (
              <div key={investor.address} className="flex items-center gap-3 p-3 bg-brand-cream rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-brand-green/20 text-brand-green text-sm">
                    {investor.ensName ? investor.ensName[0].toUpperCase() : '0x'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  {investor.ensName ? (
                    <>
                      <p className="font-medium text-z700">{investor.ensName}</p>
                      <p className="text-xs text-z400 font-mono">{investor.address}</p>
                    </>
                  ) : (
                    <p className="font-mono text-sm text-z700">{investor.address}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-brand-orange">{investor.amount} ETH</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-z200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-z500">Total Invested</span>
              <span className="font-mono font-bold text-brand-orange">
                {mockInvestors.reduce((sum, inv) => sum + inv.amount, 0).toFixed(1)} ETH
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Work Task Modal */}
      <Dialog open={showAddWorkModal} onOpenChange={setShowAddWorkModal}>
        <DialogContent className="bg-brand-canvas border-z200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-z800 normal-case">Add Work Task</DialogTitle>
            <DialogDescription className="text-z500">
              Create a new task for contributors to earn work tokens
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-z700">Task Type</Label>
              <Select 
                value={newWorkTask.type} 
                onValueChange={(value) => setNewWorkTask({ ...newWorkTask, type: value })}
              >
                <SelectTrigger className="bg-brand-cream border-z300">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">Social Engagement</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="content">Content Creation</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-z700">Task Title</Label>
              <Input
                placeholder="e.g., Share project on LinkedIn"
                value={newWorkTask.title}
                onChange={(e) => setNewWorkTask({ ...newWorkTask, title: e.target.value })}
                className="bg-brand-cream border-z300 focus:border-brand-green"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-z700">Description</Label>
              <Textarea
                placeholder="Describe what needs to be done..."
                value={newWorkTask.description}
                onChange={(e) => setNewWorkTask({ ...newWorkTask, description: e.target.value })}
                className="bg-brand-cream border-z300 focus:border-brand-green min-h-20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-z700">Work Token Reward</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="100"
                  value={newWorkTask.reward}
                  onChange={(e) => setNewWorkTask({ ...newWorkTask, reward: e.target.value })}
                  className="bg-brand-cream border-z300 focus:border-brand-green"
                />
                <span className="text-sm text-z500 font-mono">WORK</span>
              </div>
              {newWorkTask.reward && (
                <p className="text-xs text-z500">
                  = {(parseFloat(newWorkTask.reward) * workTokenInProjectToken).toFixed(0)} ${ticker} (~{(parseFloat(newWorkTask.reward) * workTokenValue).toFixed(4)} ETH)
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowAddWorkModal(false)}
                className="flex-1 border-z300 text-z600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddWorkTask}
                className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white"
                disabled={!newWorkTask.type || !newWorkTask.title || !newWorkTask.reward}
              >
                Add Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
