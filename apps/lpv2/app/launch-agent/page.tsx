"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bot,
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Camera,
  Twitter,
  MessageCircle,
  Plus,
  Trash2,
  Globe,
  FileText,
  Database,
  Github,
  Link2,
  Zap,
  Shield,
  Clock,
  Wallet,
  Send,
  Search,
  BarChart3,
  MessageSquare,
  Code,
  FileCode,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  X,
  Eye,
  Settings,
} from 'lucide-react'

// Skill categories and skills
const skillCategories = [
  {
    id: 'social',
    name: 'Social Posting',
    icon: MessageSquare,
    color: 'bg-blue-500/10 text-blue-600',
    skills: [
      { id: 'twitter-posting', name: 'Twitter Posting', description: 'Post tweets and respond to mentions', requires: ['Internet access'], icon: Twitter },
      { id: 'farcaster-posting', name: 'Farcaster Posting', description: 'Cast and reply on Farcaster', requires: ['Internet access'], icon: MessageCircle },
      { id: 'community-mod', name: 'Community Moderation', description: 'Monitor and moderate community channels', requires: ['Internet access'], icon: Shield },
    ]
  },
  {
    id: 'research',
    name: 'Research',
    icon: Search,
    color: 'bg-green-500/10 text-green-600',
    skills: [
      { id: 'web-research', name: 'Web Research', description: 'Search and summarize web pages', requires: ['Internet access'], icon: Globe },
      { id: 'token-monitor', name: 'Token Monitor', description: 'Track new token launches and price movements', requires: ['Internet access', 'API access'], icon: BarChart3 },
      { id: 'competitor-analysis', name: 'Competitor Analysis', description: 'Analyze competitor products and strategies', requires: ['Internet access'], icon: Search },
    ]
  },
  {
    id: 'trading',
    name: 'Trading',
    icon: BarChart3,
    color: 'bg-orange-500/10 text-orange-600',
    skills: [
      { id: 'wallet-interaction', name: 'Wallet Interaction', description: 'Sign and send onchain transactions', requires: ['Agent wallet', 'Signing permissions'], icon: Wallet },
      { id: 'dex-trading', name: 'DEX Trading', description: 'Execute trades on decentralized exchanges', requires: ['Agent wallet', 'Signing permissions'], icon: BarChart3 },
      { id: 'portfolio-management', name: 'Portfolio Management', description: 'Track and rebalance token holdings', requires: ['Agent wallet'], icon: Database },
    ]
  },
  {
    id: 'content',
    name: 'Content Generation',
    icon: FileText,
    color: 'bg-purple-500/10 text-purple-600',
    skills: [
      { id: 'content-writing', name: 'Content Writing', description: 'Generate blog posts, articles, and copy', requires: [], icon: FileText },
      { id: 'code-generation', name: 'Code Generation', description: 'Write and review code', requires: [], icon: Code },
      { id: 'documentation', name: 'Documentation', description: 'Generate technical documentation', requires: [], icon: FileCode },
    ]
  },
  {
    id: 'data',
    name: 'Data Analysis',
    icon: Database,
    color: 'bg-cyan-500/10 text-cyan-600',
    skills: [
      { id: 'data-analysis', name: 'Data Analysis', description: 'Analyze datasets and generate insights', requires: ['File access'], icon: BarChart3 },
      { id: 'api-integration', name: 'API Integration', description: 'Connect to external APIs and services', requires: ['Internet access', 'API keys'], icon: Link2 },
    ]
  },
]

const allSkills = skillCategories.flatMap(cat => cat.skills)

// Knowledge source types
const knowledgeSourceTypes = [
  { id: 'file', name: 'Upload Files', icon: Upload, description: 'PDFs, Docs, CSV, Markdown' },
  { id: 'url', name: 'Add Website', icon: Globe, description: 'Web pages, documentation sites' },
  { id: 'github', name: 'Connect GitHub', icon: Github, description: 'Repositories, code bases' },
  { id: 'notion', name: 'Connect Notion', icon: FileText, description: 'Notion pages and databases' },
  { id: 'api', name: 'API Endpoint', icon: Database, description: 'REST APIs, GraphQL endpoints' },
]

export default function LaunchAgentPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6

  // Step 1: Agent Identity
  const [agentName, setAgentName] = useState('')
  const [agentRole, setAgentRole] = useState('')
  const [agentDescription, setAgentDescription] = useState('')
  const [agentAvatar, setAgentAvatar] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(true)
  const [allowInteractions, setAllowInteractions] = useState(true)

  // Step 2: Social Presence
  const [createFarcaster, setCreateFarcaster] = useState(false)
  const [farcasterHandle, setFarcasterHandle] = useState('')
  const [connectExistingFarcaster, setConnectExistingFarcaster] = useState(false)
  const [existingFarcasterHandle, setExistingFarcasterHandle] = useState('')

  // Step 3: Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skillSearch, setSkillSearch] = useState('')

  // Step 4: Knowledge/Context
  const [knowledgeSources, setKnowledgeSources] = useState<Array<{
    id: string
    type: string
    name: string
    status: 'pending' | 'processing' | 'ready' | 'error'
  }>>([])
  const [addingSourceType, setAddingSourceType] = useState<string | null>(null)
  const [sourceInput, setSourceInput] = useState('')

  // Step 5: Configuration
  const [operatingMode, setOperatingMode] = useState<'manual' | 'scheduled' | 'autonomous'>('manual')
  const [scheduleInterval, setScheduleInterval] = useState('6')
  const [maxPostsPerDay, setMaxPostsPerDay] = useState([10])
  const [maxSpendPerTx, setMaxSpendPerTx] = useState([0.05])
  const [allowedDomains, setAllowedDomains] = useState('')

  // Step 6: Deploy
  const [deploying, setDeploying] = useState(false)
  const [deployed, setDeployed] = useState(false)
  const [deployedAgentId, setDeployedAgentId] = useState<string | null>(null)

  // Check if user is verified operator
  if (!user?.operatorVerified) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <AppHeader />
        <main className="max-w-2xl mx-auto px-4 py-16">
          <Card className="bg-brand-canvas border-z200">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-brand-orange" />
              </div>
              <h2 className="text-xl font-semibold text-z800 mb-2">Operator Verification Required</h2>
              <p className="text-z500 mb-6 max-w-md mx-auto">
                You need to verify your identity as an operator before you can launch an agent. Connect your X or Farcaster account to get started.
              </p>
              <Button
                onClick={() => router.push('/profile')}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white gap-2"
              >
                Go to Profile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const handleAvatarUpload = () => {
    // Mock avatar upload
    setAgentAvatar('/placeholder-agent.jpg')
  }

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    )
  }

  const addKnowledgeSource = () => {
    if (!sourceInput || !addingSourceType) return
    
    const newSource = {
      id: `source_${Date.now()}`,
      type: addingSourceType,
      name: sourceInput,
      status: 'processing' as const
    }
    
    setKnowledgeSources(prev => [...prev, newSource])
    setSourceInput('')
    setAddingSourceType(null)
    
    // Simulate processing
    setTimeout(() => {
      setKnowledgeSources(prev => 
        prev.map(s => s.id === newSource.id ? { ...s, status: 'ready' as const } : s)
      )
    }, 2000)
  }

  const removeKnowledgeSource = (id: string) => {
    setKnowledgeSources(prev => prev.filter(s => s.id !== id))
  }

  const handleDeploy = async () => {
    setDeploying(true)
    
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setDeployed(true)
    setDeployedAgentId(`agent_${Date.now()}`)
    setDeploying(false)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return agentName.trim() && agentRole.trim()
      case 2:
        return true // Social is optional
      case 3:
        return selectedSkills.length > 0
      case 4:
        return true // Knowledge is optional
      case 5:
        return true // Config has defaults
      case 6:
        return true
      default:
        return false
    }
  }

  const filteredSkills = allSkills.filter(skill => 
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
    skill.description.toLowerCase().includes(skillSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-brand-cream">
      <AppHeader />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-z500 hover:text-z700 gap-2 mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
              <Bot className="h-5 w-5 text-brand-orange" />
            </div>
            <h1 className="text-2xl font-semibold text-z800">Launch Your Agent</h1>
          </div>
          <p className="text-z500">Create a custom AI agent in minutes. No infrastructure needed.</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-z500">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-z500">
              {currentStep === 1 && 'Agent Identity'}
              {currentStep === 2 && 'Social Presence'}
              {currentStep === 3 && 'Add Skills'}
              {currentStep === 4 && 'Knowledge Base'}
              {currentStep === 5 && 'Configuration'}
              {currentStep === 6 && 'Deploy'}
            </span>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i + 1 <= currentStep ? 'bg-brand-orange' : 'bg-z200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-brand-canvas border-z200 mb-6">
          <CardContent className="p-6">
            {/* Step 1: Agent Identity */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  {/* Avatar Upload */}
                  <div className="flex-shrink-0">
                    <div 
                      onClick={handleAvatarUpload}
                      className="w-24 h-24 bg-z100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-z200 transition-colors border-2 border-dashed border-z300 group"
                    >
                      {agentAvatar ? (
                        <Avatar className="w-full h-full rounded-2xl">
                          <AvatarImage src={agentAvatar} />
                          <AvatarFallback className="rounded-2xl">{agentName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <>
                          <Camera className="h-6 w-6 text-z400 group-hover:text-z500 mb-1" />
                          <span className="text-xs text-z400 group-hover:text-z500">Avatar</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="agentName" className="text-z700">Agent Name *</Label>
                      <Input
                        id="agentName"
                        placeholder="e.g., ResearchClaw, MarketBot"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        className="bg-brand-cream border-z300 focus:border-brand-green text-z700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agentRole" className="text-z700">Role / Specialty *</Label>
                      <Input
                        id="agentRole"
                        placeholder="e.g., Crypto market researcher, Content creator"
                        value={agentRole}
                        onChange={(e) => setAgentRole(e.target.value)}
                        className="bg-brand-cream border-z300 focus:border-brand-green text-z700"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agentDescription" className="text-z700">Description</Label>
                  <Textarea
                    id="agentDescription"
                    placeholder="What does this agent do? What's its personality?"
                    value={agentDescription}
                    onChange={(e) => setAgentDescription(e.target.value)}
                    className="bg-brand-cream border-z300 focus:border-brand-green text-z700 h-24"
                  />
                </div>

                {/* Visibility Settings */}
                <div className="p-4 bg-z50 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-z700">Public Agent</Label>
                      <p className="text-xs text-z500 mt-0.5">Others can discover and interact with this agent</p>
                    </div>
                    <Switch
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                  </div>
                  {isPublic && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-z700">Allow Interactions</Label>
                        <p className="text-xs text-z500 mt-0.5">Let other users trigger actions on this agent</p>
                      </div>
                      <Switch
                        checked={allowInteractions}
                        onCheckedChange={setAllowInteractions}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Social Presence */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-z800 mb-1">Social Presence</h3>
                  <p className="text-sm text-z500">Give your agent a public identity (optional)</p>
                </div>

                {/* Farcaster Options */}
                <Card className={`border-2 transition-colors cursor-pointer ${
                  createFarcaster ? 'border-[#8465CB] bg-[#8465CB]/5' : 'border-z200 hover:border-z300'
                }`} onClick={() => { setCreateFarcaster(!createFarcaster); setConnectExistingFarcaster(false) }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#8465CB]/10 rounded-xl flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-[#8465CB]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-z800">Create Farcaster Account</h4>
                        <p className="text-sm text-z500">Launch a new Farcaster account for your agent</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        createFarcaster ? 'border-[#8465CB] bg-[#8465CB]' : 'border-z300'
                      }`}>
                        {createFarcaster && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                    
                    {createFarcaster && (
                      <div className="mt-4 pt-4 border-t border-z200">
                        <Label htmlFor="farcasterHandle" className="text-z700 text-sm">Desired Handle</Label>
                        <div className="flex gap-2 mt-1">
                          <span className="flex items-center px-3 bg-z100 rounded-l-lg border border-r-0 border-z300 text-z500">@</span>
                          <Input
                            id="farcasterHandle"
                            placeholder="agent_handle"
                            value={farcasterHandle}
                            onChange={(e) => setFarcasterHandle(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-brand-cream border-z300 focus:border-[#8465CB] text-z700 rounded-l-none"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className={`border-2 transition-colors cursor-pointer ${
                  connectExistingFarcaster ? 'border-[#8465CB] bg-[#8465CB]/5' : 'border-z200 hover:border-z300'
                }`} onClick={() => { setConnectExistingFarcaster(!connectExistingFarcaster); setCreateFarcaster(false) }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-z100 rounded-xl flex items-center justify-center">
                        <Link2 className="h-6 w-6 text-z500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-z800">Connect Existing Bot</h4>
                        <p className="text-sm text-z500">Link an existing Farcaster bot account</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        connectExistingFarcaster ? 'border-[#8465CB] bg-[#8465CB]' : 'border-z300'
                      }`}>
                        {connectExistingFarcaster && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>

                    {connectExistingFarcaster && (
                      <div className="mt-4 pt-4 border-t border-z200">
                        <Label htmlFor="existingHandle" className="text-z700 text-sm">Bot Handle</Label>
                        <div className="flex gap-2 mt-1">
                          <span className="flex items-center px-3 bg-z100 rounded-l-lg border border-r-0 border-z300 text-z500">@</span>
                          <Input
                            id="existingHandle"
                            placeholder="existing_bot"
                            value={existingFarcasterHandle}
                            onChange={(e) => setExistingFarcasterHandle(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-brand-cream border-z300 focus:border-[#8465CB] text-z700 rounded-l-none"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Skip Option */}
                <div className="text-center pt-4">
                  <p className="text-sm text-z500">
                    Skip this step to run your agent privately via API or UI only.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Skills */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-medium text-z800 mb-1">Add Skills</h3>
                  <p className="text-sm text-z500">Choose capabilities for your agent</p>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-z400" />
                  <Input
                    placeholder="Search skills..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    className="pl-10 bg-brand-cream border-z300 focus:border-brand-green text-z700"
                  />
                </div>

                {/* Selected Skills Count */}
                {selectedSkills.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20">
                      {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSkills([])}
                      className="text-xs text-z500 hover:text-z700"
                    >
                      Clear all
                    </Button>
                  </div>
                )}

                {/* Skills Grid */}
                <div className="space-y-6">
                  {skillCategories.map((category) => {
                    const categorySkills = category.skills.filter(skill =>
                      skill.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
                      skill.description.toLowerCase().includes(skillSearch.toLowerCase())
                    )
                    
                    if (categorySkills.length === 0) return null
                    
                    return (
                      <div key={category.id}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${category.color}`}>
                            <category.icon className="h-4 w-4" />
                          </div>
                          <h4 className="font-medium text-z700">{category.name}</h4>
                        </div>
                        
                        <div className="grid gap-2">
                          {categorySkills.map((skill) => {
                            const isSelected = selectedSkills.includes(skill.id)
                            const SkillIcon = skill.icon
                            
                            return (
                              <div
                                key={skill.id}
                                onClick={() => toggleSkill(skill.id)}
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-brand-green bg-brand-green/5'
                                    : 'border-z200 hover:border-z300 bg-brand-cream'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    isSelected ? 'bg-brand-green/10' : 'bg-z100'
                                  }`}>
                                    <SkillIcon className={`h-4 w-4 ${isSelected ? 'text-brand-green' : 'text-z500'}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h5 className="font-medium text-z800 text-sm">{skill.name}</h5>
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        isSelected ? 'border-brand-green bg-brand-green' : 'border-z300'
                                      }`}>
                                        {isSelected && <Check className="h-3 w-3 text-white" />}
                                      </div>
                                    </div>
                                    <p className="text-xs text-z500 mt-0.5">{skill.description}</p>
                                    {skill.requires.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {skill.requires.map((req) => (
                                          <span key={req} className="text-[10px] text-z400 bg-z100 px-1.5 py-0.5 rounded">
                                            {req}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Knowledge Base */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-medium text-z800 mb-1">Knowledge Base</h3>
                  <p className="text-sm text-z500">Give your agent context and data to work with</p>
                </div>

                {/* Add Source Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {knowledgeSourceTypes.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => setAddingSourceType(source.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        addingSourceType === source.id
                          ? 'border-brand-orange bg-brand-orange/5'
                          : 'border-z200 hover:border-z300 bg-brand-cream'
                      }`}
                    >
                      <source.icon className={`h-5 w-5 mb-2 ${
                        addingSourceType === source.id ? 'text-brand-orange' : 'text-z500'
                      }`} />
                      <p className="text-sm font-medium text-z800">{source.name}</p>
                      <p className="text-xs text-z500 mt-0.5">{source.description}</p>
                    </button>
                  ))}
                </div>

                {/* Add Source Input */}
                {addingSourceType && (
                  <div className="p-4 bg-z50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-z700">
                        {addingSourceType === 'file' && 'Upload files'}
                        {addingSourceType === 'url' && 'Enter URL'}
                        {addingSourceType === 'github' && 'GitHub repository URL'}
                        {addingSourceType === 'notion' && 'Notion page URL'}
                        {addingSourceType === 'api' && 'API endpoint'}
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAddingSourceType(null)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {addingSourceType === 'file' ? (
                      <div className="border-2 border-dashed border-z300 rounded-lg p-6 text-center hover:border-brand-orange transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 text-z400 mx-auto mb-2" />
                        <p className="text-sm text-z600">Drag files here or click to upload</p>
                        <p className="text-xs text-z400 mt-1">PDF, DOC, CSV, MD up to 10MB</p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder={
                            addingSourceType === 'url' ? 'https://docs.example.com' :
                            addingSourceType === 'github' ? 'https://github.com/user/repo' :
                            addingSourceType === 'notion' ? 'https://notion.so/page-id' :
                            'https://api.example.com/data'
                          }
                          value={sourceInput}
                          onChange={(e) => setSourceInput(e.target.value)}
                          className="bg-brand-canvas border-z300 focus:border-brand-orange text-z700"
                        />
                        <Button
                          onClick={addKnowledgeSource}
                          disabled={!sourceInput}
                          className="bg-brand-orange hover:bg-brand-orange/90 text-white"
                        >
                          Add
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Added Sources */}
                {knowledgeSources.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-z700">Added Sources</Label>
                    {knowledgeSources.map((source) => {
                      const sourceType = knowledgeSourceTypes.find(t => t.id === source.type)
                      const SourceIcon = sourceType?.icon || FileText
                      
                      return (
                        <div
                          key={source.id}
                          className="flex items-center gap-3 p-3 bg-brand-cream rounded-lg border border-z200"
                        >
                          <SourceIcon className="h-5 w-5 text-z500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-z800 truncate">{source.name}</p>
                            <p className="text-xs text-z500">{sourceType?.name}</p>
                          </div>
                          {source.status === 'processing' && (
                            <Loader2 className="h-4 w-4 text-brand-orange animate-spin" />
                          )}
                          {source.status === 'ready' && (
                            <CheckCircle className="h-4 w-4 text-brand-green" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeKnowledgeSource(source.id)}
                            className="h-8 w-8 p-0 text-z400 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {knowledgeSources.length === 0 && !addingSourceType && (
                  <div className="text-center py-8">
                    <Database className="h-10 w-10 text-z300 mx-auto mb-3" />
                    <p className="text-sm text-z500">No knowledge sources added yet</p>
                    <p className="text-xs text-z400 mt-1">Your agent will work with general knowledge only</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Configuration */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-medium text-z800 mb-1">Configuration</h3>
                  <p className="text-sm text-z500">Set how your agent operates and its guardrails</p>
                </div>

                {/* Operating Mode */}
                <div className="space-y-3">
                  <Label className="text-z700">Operating Mode</Label>
                  <div className="grid gap-2">
                    {[
                      { id: 'manual', icon: Eye, title: 'Manual', desc: 'Runs only when you trigger it' },
                      { id: 'scheduled', icon: Clock, title: 'Scheduled', desc: 'Runs on a set interval' },
                      { id: 'autonomous', icon: Zap, title: 'Autonomous', desc: 'Runs continuously based on triggers' },
                    ].map((mode) => (
                      <div
                        key={mode.id}
                        onClick={() => setOperatingMode(mode.id as typeof operatingMode)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          operatingMode === mode.id
                            ? 'border-brand-green bg-brand-green/5'
                            : 'border-z200 hover:border-z300 bg-brand-cream'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <mode.icon className={`h-5 w-5 ${
                            operatingMode === mode.id ? 'text-brand-green' : 'text-z500'
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-z800">{mode.title}</p>
                            <p className="text-xs text-z500">{mode.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            operatingMode === mode.id ? 'border-brand-green bg-brand-green' : 'border-z300'
                          }`}>
                            {operatingMode === mode.id && <Check className="h-3 w-3 text-white" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {operatingMode === 'scheduled' && (
                  <div className="p-4 bg-z50 rounded-lg space-y-3">
                    <Label className="text-z700">Run Interval</Label>
                    <Select value={scheduleInterval} onValueChange={setScheduleInterval}>
                      <SelectTrigger className="bg-brand-canvas border-z300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Every hour</SelectItem>
                        <SelectItem value="6">Every 6 hours</SelectItem>
                        <SelectItem value="12">Every 12 hours</SelectItem>
                        <SelectItem value="24">Every day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Guardrails */}
                <div className="space-y-4 pt-4 border-t border-z200">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-brand-orange" />
                    <Label className="text-z700 text-base">Guardrails</Label>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-z600 text-sm">Max posts per day</Label>
                        <span className="text-sm font-mono text-z700">{maxPostsPerDay[0]}</span>
                      </div>
                      <Slider
                        value={maxPostsPerDay}
                        onValueChange={setMaxPostsPerDay}
                        max={50}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-z600 text-sm">Max spend per transaction (ETH)</Label>
                        <span className="text-sm font-mono text-z700">{maxSpendPerTx[0].toFixed(2)}</span>
                      </div>
                      <Slider
                        value={maxSpendPerTx}
                        onValueChange={setMaxSpendPerTx}
                        max={1}
                        min={0.01}
                        step={0.01}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-z600 text-sm">Allowed domains (comma-separated)</Label>
                      <Input
                        placeholder="twitter.com, farcaster.xyz, *.eth"
                        value={allowedDomains}
                        onChange={(e) => setAllowedDomains(e.target.value)}
                        className="bg-brand-cream border-z300 focus:border-brand-green text-z700 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Deploy */}
            {currentStep === 6 && (
              <div className="space-y-6">
                {!deployed ? (
                  <>
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-medium text-z800 mb-1">Ready to Launch</h3>
                      <p className="text-sm text-z500">Review your agent configuration</p>
                    </div>

                    {/* Summary */}
                    <div className="space-y-4">
                      {/* Agent Info */}
                      <div className="flex items-center gap-4 p-4 bg-z50 rounded-lg">
                        <Avatar className="w-14 h-14 rounded-xl">
                          {agentAvatar ? (
                            <AvatarImage src={agentAvatar} />
                          ) : null}
                          <AvatarFallback className="rounded-xl bg-brand-orange/10 text-brand-orange">
                            {agentName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-z800">{agentName}</h4>
                          <p className="text-sm text-z500">{agentRole}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {isPublic ? (
                              <Badge variant="outline" className="text-xs border-brand-green text-brand-green">Public</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs border-z400 text-z500">Private</Badge>
                            )}
                            <Badge variant="outline" className="text-xs border-z300 text-z500">
                              {operatingMode}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="p-4 bg-z50 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-z500" />
                          <span className="text-sm font-medium text-z700">Skills ({selectedSkills.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedSkills.map((skillId) => {
                            const skill = allSkills.find(s => s.id === skillId)
                            return skill ? (
                              <span
                                key={skillId}
                                className="text-xs bg-brand-green/10 text-brand-green px-2 py-1 rounded"
                              >
                                {skill.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>

                      {/* Knowledge Sources */}
                      {knowledgeSources.length > 0 && (
                        <div className="p-4 bg-z50 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Database className="h-4 w-4 text-z500" />
                            <span className="text-sm font-medium text-z700">Knowledge Sources ({knowledgeSources.length})</span>
                          </div>
                          <div className="space-y-1">
                            {knowledgeSources.map((source) => (
                              <p key={source.id} className="text-xs text-z500 truncate">{source.name}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* What happens */}
                      <div className="p-4 bg-brand-orange/5 border border-brand-orange/20 rounded-lg">
                        <h5 className="text-sm font-medium text-z800 mb-2">What happens when you deploy:</h5>
                        <ul className="space-y-1.5 text-xs text-z600">
                          <li className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-brand-green" />
                            Agent wallet is generated
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-brand-green" />
                            Operator link is stored
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-brand-green" />
                            Skill runtime is activated
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-brand-green" />
                            Agent dashboard becomes available
                          </li>
                        </ul>
                      </div>
                    </div>

                    <Button
                      onClick={handleDeploy}
                      disabled={deploying}
                      className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white h-12 text-base"
                    >
                      {deploying ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Deploying Agent...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Deploy Agent
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-brand-green" />
                    </div>
                    <h3 className="text-xl font-semibold text-z800 mb-2">Agent Deployed!</h3>
                    <p className="text-z500 mb-6">
                      Your agent <span className="font-medium text-z700">{agentName}</span> is now live.
                    </p>
                    
                    <div className="p-4 bg-z50 rounded-lg mb-6 text-left">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-z500">Agent ID</span>
                        <code className="text-xs font-mono text-z700 bg-z100 px-2 py-1 rounded">{deployedAgentId}</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-z500">Status</span>
                        <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20">Active</Badge>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => router.push('/profile?tab=agents')}
                        variant="outline"
                        className="flex-1 border-z300"
                      >
                        View in Profile
                      </Button>
                      <Button
                        onClick={() => router.push('/home')}
                        className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white"
                      >
                        Go to Ideas
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {!deployed && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1}
              className="border-z300 text-z600 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
                className="bg-brand-green hover:bg-brand-green/90 text-white gap-2"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        )}
      </main>
    </div>
  )
}
