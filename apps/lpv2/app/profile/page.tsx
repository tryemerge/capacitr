"use client"

import { useState, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth, Agent, SocialConnection } from '@/lib/auth-context'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TradingStyleCard } from '@/components/trading-style-card'
import {
  User,
  Bot,
  Wallet,
  Twitter,
  MessageCircle,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Zap,
  Star,
  ExternalLink,
  Copy,
  Check,
  Upload,
  Camera,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Link2,
  AlertCircle,
  ArrowRight,
  Key,
  FileCode,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'

const agentCapabilities = [
  'Code Generation',
  'Code Review',
  'Research',
  'Data Analysis',
  'Content Writing',
  'Design',
  'Smart Contracts',
  'Testing',
  'Documentation',
  'Translation',
  'Social Media',
  'Community Management',
]

const tierInfo = {
  unverified: { label: 'Unverified', color: 'text-z500', bg: 'bg-z200', maxAgents: 0 },
  connected: { label: 'Connected', color: 'text-brand-green', bg: 'bg-brand-green/10', maxAgents: 1 },
  trusted: { label: 'Trusted', color: 'text-brand-orange', bg: 'bg-brand-orange/10', maxAgents: 3 },
  high_trust: { label: 'High Trust', color: 'text-brand-green', bg: 'bg-brand-green/10', maxAgents: 10 },
}

function ProfileContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = searchParams.get('tab') === 'agents' ? 'agents' : 'profile'
  
  const { 
    user, 
    updateProfile, 
    updateAvatar,
    connectSocial,
    disconnectSocial,
    connectParentWallet,
    connectAgent, 
    disconnectAgent 
  } = useAuth()
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [copiedWallet, setCopiedWallet] = useState(false)
  const [activeTab, setActiveTab] = useState(initialTab)
  
  // Social connection states
  const [connectingSocial, setConnectingSocial] = useState<'twitter' | 'farcaster' | null>(null)
  const [socialHandle, setSocialHandle] = useState('')
  const [socialConnecting, setSocialConnecting] = useState(false)
  
  // Additional wallets states
  const [showParentWalletModal, setShowParentWalletModal] = useState(false)
  const [parentWalletAddress, setParentWalletAddress] = useState('')
  const [connectingParentWallet, setConnectingParentWallet] = useState(false)
  
  // Agent wizard states
  const [showAgentWizard, setShowAgentWizard] = useState(false)
  const [agentWizardStep, setAgentWizardStep] = useState(1)
  const [agentForm, setAgentForm] = useState({
    identifyMethod: 'wallet' as 'wallet' | 'id' | 'handle' | 'manifest',
    identifier: '',
    name: '',
    verificationMethod: 'wallet_signature' as 'wallet_signature' | 'challenge_code' | 'social_verification',
    challengeCode: '',
    publicAttribution: 'full' as 'full' | 'handle_only' | 'hidden',
    capabilities: [] as string[],
  })
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  
  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
  })

  const updateFormField = (field: string, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleCapability = (cap: string) => {
    setAgentForm(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter(c => c !== cap)
        : [...prev.capabilities, cap].slice(0, 5),
    }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploadingAvatar(true)
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Create a mock URL (in real app, this would be uploaded to storage)
    const mockUrl = URL.createObjectURL(file)
    updateAvatar(mockUrl)
    setUploadingAvatar(false)
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    
    updateProfile({
      displayName: profileForm.displayName,
      bio: profileForm.bio,
    })
    
    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const handleConnectSocial = async () => {
    if (!connectingSocial || !socialHandle) return
    
    setSocialConnecting(true)
    await connectSocial(connectingSocial, socialHandle)
    setSocialConnecting(false)
    setConnectingSocial(null)
    setSocialHandle('')
  }

  const handleConnectParentWallet = async () => {
    if (!parentWalletAddress) return
    
    setConnectingParentWallet(true)
    await connectParentWallet(parentWalletAddress)
    setConnectingParentWallet(false)
    setShowParentWalletModal(false)
    setParentWalletAddress('')
  }

  const handleVerifyAgent = async () => {
    setVerifying(true)
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2500))
    setVerified(true)
    setVerifying(false)
  }

  const handleConnectAgent = async () => {
    if (!agentForm.identifier || !agentForm.name) return
    
    connectAgent({
      name: agentForm.name,
      walletAddress: agentForm.identifyMethod === 'wallet' 
        ? agentForm.identifier 
        : `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      capabilities: agentForm.capabilities,
      status: 'connected',
      reputationScore: Math.floor(Math.random() * 20) + 75,
      verificationMethod: agentForm.verificationMethod,
      publicAttribution: agentForm.publicAttribution,
    })
    
    // Reset wizard
    setShowAgentWizard(false)
    setAgentWizardStep(1)
    setAgentForm({
      identifyMethod: 'wallet',
      identifier: '',
      name: '',
      verificationMethod: 'wallet_signature',
      challengeCode: '',
      publicAttribution: 'full',
      capabilities: [],
    })
    setVerified(false)
  }

  const copyWalletAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress)
      setCopiedWallet(true)
      setTimeout(() => setCopiedWallet(false), 2000)
    }
  }

  const getTwitterConnection = () => user?.socialConnections.find(s => s.platform === 'twitter')
  const getFarcasterConnection = () => user?.socialConnections.find(s => s.platform === 'farcaster')

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <p className="text-z600">Please log in to view your profile.</p>
      </div>
    )
  }

  const tier = tierInfo[user.operatorTier]

  return (
    <div className="min-h-screen bg-brand-cream">
      <AppHeader />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          {/* Avatar with upload */}
          <div className="relative group">
            <Avatar className="h-24 w-24 border-4 border-brand-canvas">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-z200 text-z700 text-3xl">
                {user.displayName?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 bg-z900/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              {uploadingAvatar ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-z900 mb-1 normal-case">
              {user.displayName || 'Anonymous User'}
            </h1>
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={copyWalletAddress}
                className="flex items-center gap-2 text-sm font-mono text-z500 hover:text-z700 transition-colors"
              >
                <Wallet className="h-4 w-4" />
                {user.walletAddress}
                {copiedWallet ? (
                  <Check className="h-3.5 w-3.5 text-brand-green" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Operator Tier Badge */}
              <Badge className={`${tier.bg} ${tier.color} border-0 gap-1`}>
                {user.operatorVerified ? (
                  <ShieldCheck className="h-3.5 w-3.5" />
                ) : (
                  <ShieldAlert className="h-3.5 w-3.5" />
                )}
                {tier.label} Operator
              </Badge>
              
              {/* Connected Socials */}
              {getTwitterConnection()?.verified && (
                <Badge variant="outline" className="bg-z100 text-z700 border-z300 gap-1">
                  <Twitter className="h-3 w-3" />
                  {getTwitterConnection()?.handle}
                </Badge>
              )}
              {getFarcasterConnection()?.verified && (
                <Badge variant="outline" className="bg-z100 text-z700 border-z300 gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {getFarcasterConnection()?.handle}
                </Badge>
              )}
              
              {/* Agent Count */}
              {user.connectedAgents.length > 0 && (
                <Badge variant="outline" className="bg-brand-orange/10 text-brand-orange border-brand-orange/30 gap-1">
                  <Bot className="h-3 w-3" />
                  {user.connectedAgents.length}/{user.maxAgents} Agent{user.connectedAgents.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-z100 border border-z200 p-1 h-auto mb-6">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-brand-cream data-[state=active]:text-z800 text-z600 gap-2"
            >
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="agents" 
              className="data-[state=active]:bg-brand-cream data-[state=active]:text-z800 text-z600 gap-2"
            >
              <Bot className="h-4 w-4" />
              My Agents
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info Card */}
                <Card className="bg-brand-canvas border-z200">
                  <CardHeader>
                    <CardTitle className="text-base text-z800 normal-case">Basic Information</CardTitle>
                    <CardDescription className="text-z500">
                      How you appear to others on Capacitr
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-z700">Display Name</Label>
                      <Input
                        id="displayName"
                        placeholder="Your name or handle"
                        value={profileForm.displayName}
                        onChange={(e) => updateFormField('displayName', e.target.value)}
                        className="bg-brand-cream border-z300 focus:border-brand-green text-z700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-z700">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell others about yourself..."
                        value={profileForm.bio}
                        onChange={(e) => updateFormField('bio', e.target.value)}
                        maxLength={280}
                        rows={3}
                        className="bg-brand-cream border-z300 focus:border-brand-green text-z700 resize-none"
                      />
                      <p className="text-xs text-z400">{profileForm.bio.length}/280 characters</p>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="bg-brand-green hover:bg-brand-green/90 text-white gap-2"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : saveSuccess ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Saved!
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Trading Style Card */}
                <TradingStyleCard />

                {/* Operator Verification Card */}
                <Card className="bg-brand-canvas border-z200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base text-z800 normal-case flex items-center gap-2">
                          <Shield className="h-5 w-5 text-brand-green" />
                          Operator Verification
                        </CardTitle>
                        <CardDescription className="text-z500 mt-1">
                          Connect your social identity to verify as an operator and attach agents
                        </CardDescription>
                      </div>
                      <Badge className={`${tier.bg} ${tier.color} border-0`}>
                        {tier.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Trust Level Progress */}
                    <div className="p-4 bg-brand-cream rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-z600">Trust Level</span>
                        <span className="text-sm font-medium text-z800">
                          {user.connectedAgents.length}/{user.maxAgents} agents allowed
                        </span>
                      </div>
                      <Progress 
                        value={user.operatorTier === 'high_trust' ? 100 : user.operatorTier === 'trusted' ? 66 : user.operatorTier === 'connected' ? 33 : 0} 
                        className="h-2 bg-z200"
                      />
                      <p className="text-xs text-z500 mt-2">
                        Connect more verified accounts and build reputation to increase your trust level
                      </p>
                    </div>

                    {/* Social Connection - Twitter/X */}
                    <div className="flex items-center justify-between p-4 bg-brand-cream rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-z900 rounded-lg flex items-center justify-center overflow-hidden">
                          <img 
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-UV1H33WCgGyIfwxkIZG11tefDckJ9P.png" 
                            alt="X" 
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-z800">X (Twitter)</p>
                          {getTwitterConnection()?.verified ? (
                            <p className="text-sm text-brand-green flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" />
                              {getTwitterConnection()?.handle}
                            </p>
                          ) : (
                            <p className="text-sm text-z500">Not connected</p>
                          )}
                        </div>
                      </div>
                      {getTwitterConnection()?.verified ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectSocial('twitter')}
                          className="border-z300 text-z600 hover:text-destructive hover:border-destructive"
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setConnectingSocial('twitter')}
                          className="bg-z900 hover:bg-z800 text-white"
                        >
                          Connect
                        </Button>
                      )}
                    </div>

                    {/* Social Connection - Farcaster */}
                    <div className="flex items-center justify-between p-4 bg-brand-cream rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                          <img 
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-c3BJv8YoPKfhHnH0iPrdxwFtqWjEWY.png" 
                            alt="Farcaster" 
                            className="w-10 h-10 object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-z800">Farcaster</p>
                          {getFarcasterConnection()?.verified ? (
                            <p className="text-sm text-brand-green flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" />
                              {getFarcasterConnection()?.handle}
                            </p>
                          ) : (
                            <p className="text-sm text-z500">Not connected</p>
                          )}
                        </div>
                      </div>
                      {getFarcasterConnection()?.verified ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectSocial('farcaster')}
                          className="border-z300 text-z600 hover:text-destructive hover:border-destructive"
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setConnectingSocial('farcaster')}
                          className="bg-[#8465CB] hover:bg-[#7355BB] text-white"
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Wallet & Stats */}
              <div className="space-y-6">
                {/* Wallet Card */}
                <Card className="bg-brand-canvas border-z200">
                  <CardHeader>
                    <CardTitle className="text-base text-z800 normal-case flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-brand-orange" />
                      Wallets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Primary Wallet */}
                    <div className="p-3 bg-brand-cream rounded-lg">
                      <p className="text-xs text-z500 mb-1">Primary Wallet</p>
                      <p className="font-mono text-sm text-z800">{user.walletAddress}</p>
                      <Badge variant="outline" className="mt-2 text-xs bg-brand-green/10 text-brand-green border-brand-green/30">
                        Connected via Privy
                      </Badge>
                    </div>

                    {/* Additional Wallets */}
                    <div className="p-3 bg-brand-cream rounded-lg">
                      <p className="text-xs text-z500 mb-1">Additional Wallets</p>
                      {user.parentWallet ? (
                        <>
                          <p className="font-mono text-sm text-z800">{user.parentWallet}</p>
                          <Badge variant="outline" className="mt-2 text-xs bg-z100 text-z600 border-z300">
                            Linked
                          </Badge>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-z500 mb-2">No additional wallets linked</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowParentWalletModal(true)}
                            className="w-full border-z300 text-z600 hover:border-brand-green hover:text-brand-green gap-1"
                          >
                            <Link2 className="h-3.5 w-3.5" />
                            Link Additional Wallets
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Card */}
                <Card className="bg-brand-canvas border-z200">
                  <CardHeader>
                    <CardTitle className="text-base text-z800 normal-case">Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-z500">Ideas Created</span>
                      <span className="font-mono text-sm font-medium text-z800">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-z500">Ideas Invested</span>
                      <span className="font-mono text-sm font-medium text-z800">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-z500">Total ETH Invested</span>
                      <span className="font-mono text-sm font-medium text-z800">4.25 ETH</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-z500">Work Tokens Earned</span>
                      <span className="font-mono text-sm font-medium text-z800">1,250</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-z500">Member Since</span>
                      <span className="text-sm text-z800">Jan 15, 2026</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents">
            <div className="space-y-6">
              {/* Agents Header */}
              <Card className="bg-brand-canvas border-z200">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-z800 normal-case">Managed Agents</h2>
                      <p className="text-sm text-z500">
                        {user.operatorVerified 
                          ? `You can attach up to ${user.maxAgents} agents as a ${tier.label.toLowerCase()} operator`
                          : 'Verify your operator identity to attach agents'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => router.push('/launch-agent')}
                        disabled={!user.operatorVerified || user.connectedAgents.length >= user.maxAgents}
                        className="bg-brand-orange hover:bg-brand-orange/90 text-white gap-2"
                      >
                        <Zap className="h-4 w-4" />
                        Launch Agent
                      </Button>
                      <Button 
                        onClick={() => setShowAgentWizard(true)}
                        disabled={!user.operatorVerified || user.connectedAgents.length >= user.maxAgents}
                        variant="outline"
                        className="border-z300 text-z600 hover:border-brand-green hover:text-brand-green gap-2"
                      >
                        <Link2 className="h-4 w-4" />
                        Link Agent
                      </Button>
                    </div>
                  </div>

                  {!user.operatorVerified && (
                    <div className="mt-4 p-4 bg-brand-orange/10 rounded-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-brand-orange flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-z800">Verification Required</p>
                        <p className="text-sm text-z600 mt-1">
                          Connect your X or Farcaster account in the Profile tab to verify as an operator before attaching agents.
                        </p>
                        <Button
                          variant="link"
                          onClick={() => setActiveTab('profile')}
                          className="text-brand-orange hover:text-brand-orange/80 p-0 h-auto mt-2"
                        >
                          Go to Profile <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Agent List */}
              {user.connectedAgents.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {user.connectedAgents.map((agent) => (
                    <Card key={agent.id} className="bg-brand-canvas border-z200">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center">
                              <Bot className="h-6 w-6 text-brand-green" />
                            </div>
                            <div>
                              <h3 className="font-medium text-z800 normal-case">{agent.name}</h3>
                              <p className="text-xs font-mono text-z500">{agent.walletAddress}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {agent.status === 'connected' ? (
                                  <span className="flex items-center gap-1 text-xs text-brand-green">
                                    <CheckCircle className="h-3 w-3" />
                                    Active
                                  </span>
                                ) : agent.status === 'pending' ? (
                                  <span className="flex items-center gap-1 text-xs text-brand-orange">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Pending
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-xs text-z400">
                                    <XCircle className="h-3 w-3" />
                                    Inactive
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => disconnectAgent(agent.id)}
                            className="text-z400 hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Agent Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="p-2 bg-brand-cream rounded-lg text-center">
                            <p className="text-xs text-z500">Reputation</p>
                            <p className="font-mono font-medium text-z800">{agent.reputationScore}/100</p>
                          </div>
                          <div className="p-2 bg-brand-cream rounded-lg text-center">
                            <p className="text-xs text-z500">Earnings</p>
                            <p className="font-mono font-medium text-z800">{agent.totalEarnings?.toFixed(2) || '0.00'} ETH</p>
                          </div>
                          <div className="p-2 bg-brand-cream rounded-lg text-center">
                            <p className="text-xs text-z500">Projects</p>
                            <p className="font-mono font-medium text-z800">{agent.projectsDeployed || 0}</p>
                          </div>
                        </div>

                        {/* Attribution */}
                        <div className="flex items-center gap-2 mb-3 text-sm text-z600">
                          {agent.publicAttribution === 'full' ? (
                            <>
                              <Eye className="h-4 w-4" />
                              <span>Operated by {user.displayName}</span>
                            </>
                          ) : agent.publicAttribution === 'handle_only' ? (
                            <>
                              <Eye className="h-4 w-4" />
                              <span>Managed by {getTwitterConnection()?.handle || getFarcasterConnection()?.handle}</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4" />
                              <span>Operator hidden publicly</span>
                            </>
                          )}
                        </div>

                        {/* Capabilities */}
                        {agent.capabilities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {agent.capabilities.map((cap) => (
                              <span
                                key={cap}
                                className="text-[10px] font-mono text-z500 bg-z100 px-2 py-0.5 rounded"
                              >
                                {cap}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t border-z200">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-z300 text-z600 hover:border-brand-green hover:text-brand-green gap-1"
                          >
                            <Zap className="h-3.5 w-3.5" />
                            Deploy to Idea
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-z300 text-z600 hover:border-z400 hover:text-z700 gap-1"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View on OpenClaw
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-brand-canvas border-z200 border-dashed">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 bg-z100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Bot className="h-8 w-8 text-z400" />
                    </div>
                    <h3 className="text-lg font-medium text-z800 mb-2 normal-case">No agents yet</h3>
                    <p className="text-sm text-z500 mb-6 max-w-md mx-auto">
                      {user.operatorVerified 
                        ? 'Create a new agent or attach an existing OpenClaw agent to deploy them to ideas and earn work tokens.'
                        : 'Verify your operator identity first, then create or attach agents to start deploying to ideas.'
                      }
                    </p>
                    {user.operatorVerified && (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button
                          onClick={() => router.push('/launch-agent')}
                          className="bg-brand-orange hover:bg-brand-orange/90 text-white gap-2 w-full sm:w-auto"
                        >
                          <Zap className="h-4 w-4" />
                          Launch Agent
                        </Button>
                        <span className="text-sm text-z400">or</span>
                        <Button
                          onClick={() => setShowAgentWizard(true)}
                          variant="outline"
                          className="border-z300 text-z600 hover:border-brand-green hover:text-brand-green gap-2 w-full sm:w-auto"
                        >
                          <Link2 className="h-4 w-4" />
                          Link Existing Agent
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Social Connection Modal */}
      <Dialog open={!!connectingSocial} onOpenChange={() => setConnectingSocial(null)}>
        <DialogContent className="bg-brand-cream border-z200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-z800 normal-case flex items-center gap-2">
              {connectingSocial === 'twitter' ? (
                <Twitter className="h-5 w-5" />
              ) : (
                <MessageCircle className="h-5 w-5" />
              )}
              Connect {connectingSocial === 'twitter' ? 'X (Twitter)' : 'Farcaster'}
            </DialogTitle>
            <DialogDescription className="text-z500">
              Verify your {connectingSocial === 'twitter' ? 'X' : 'Farcaster'} account to increase your operator trust level.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="socialHandle" className="text-z700">
                {connectingSocial === 'twitter' ? 'X Username' : 'Farcaster Username'}
              </Label>
              <Input
                id="socialHandle"
                placeholder={connectingSocial === 'twitter' ? '@username' : '@username'}
                value={socialHandle}
                onChange={(e) => setSocialHandle(e.target.value)}
                className="bg-brand-canvas border-z300 focus:border-brand-green text-z700"
              />
            </div>
            <div className="p-3 bg-z100 rounded-lg">
              <p className="text-xs text-z600">
                This will open a Privy verification flow to confirm you own this account.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConnectingSocial(null)}
              className="border-z300 text-z600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnectSocial}
              disabled={!socialHandle || socialConnecting}
              className={connectingSocial === 'twitter' 
                ? 'bg-z900 hover:bg-z800 text-white'
                : 'bg-[#8465CB] hover:bg-[#7355BB] text-white'
              }
            >
              {socialConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify & Connect'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Additional Wallets Modal */}
      <Dialog open={showParentWalletModal} onOpenChange={setShowParentWalletModal}>
        <DialogContent className="bg-brand-cream border-z200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-z800 normal-case flex items-center gap-2">
              <Link2 className="h-5 w-5 text-brand-orange" />
              Link Additional Wallets
            </DialogTitle>
            <DialogDescription className="text-z500">
              Connect additional wallets for multi-sig or custody purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="parentWallet" className="text-z700">Wallet Address</Label>
              <Input
                id="parentWallet"
                placeholder="0x..."
                value={parentWalletAddress}
                onChange={(e) => setParentWalletAddress(e.target.value)}
                className="bg-brand-canvas border-z300 focus:border-brand-green text-z700 font-mono"
              />
            </div>
            <div className="p-3 bg-z100 rounded-lg">
              <p className="text-xs text-z600">
                You will need to sign a message from this wallet to confirm ownership.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowParentWalletModal(false)}
              className="border-z300 text-z600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnectParentWallet}
              disabled={!parentWalletAddress || connectingParentWallet}
              className="bg-brand-orange hover:bg-brand-orange/90 text-white"
            >
              {connectingParentWallet ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Linking...
                </>
              ) : (
                'Link Wallet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent Attachment Wizard */}
      <Dialog open={showAgentWizard} onOpenChange={setShowAgentWizard}>
        <DialogContent className="bg-brand-cream border-z200 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-z800 normal-case">
              Attach OpenClaw Agent
            </DialogTitle>
            <DialogDescription className="text-z500">
              Step {agentWizardStep} of 4: {
                agentWizardStep === 1 ? 'Identify the agent' :
                agentWizardStep === 2 ? 'Prove control' :
                agentWizardStep === 3 ? 'Set public attribution' :
                'Review and confirm'
              }
            </DialogDescription>
          </DialogHeader>

          {/* Progress */}
          <div className="flex gap-2 py-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full ${
                  step <= agentWizardStep ? 'bg-brand-orange' : 'bg-z200'
                }`}
              />
            ))}
          </div>

          <div className="py-4">
            {/* Step 1: Identify Agent */}
            {agentWizardStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-z700">How do you want to identify the agent?</Label>
                  <Select
                    value={agentForm.identifyMethod}
                    onValueChange={(v) => setAgentForm(prev => ({ 
                      ...prev, 
                      identifyMethod: v as typeof prev.identifyMethod,
                      identifier: ''
                    }))}
                  >
                    <SelectTrigger className="bg-brand-canvas border-z300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wallet">Agent Wallet Address</SelectItem>
                      <SelectItem value="id">Agent ID</SelectItem>
                      <SelectItem value="handle">Agent Handle</SelectItem>
                      <SelectItem value="manifest">Paste Manifest/Config</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-z700">
                    {agentForm.identifyMethod === 'wallet' ? 'Wallet Address' :
                     agentForm.identifyMethod === 'id' ? 'Agent ID' :
                     agentForm.identifyMethod === 'handle' ? 'Agent Handle' :
                     'Agent Manifest'}
                  </Label>
                  {agentForm.identifyMethod === 'manifest' ? (
                    <Textarea
                      id="identifier"
                      placeholder="Paste agent config or manifest JSON..."
                      value={agentForm.identifier}
                      onChange={(e) => setAgentForm(prev => ({ ...prev, identifier: e.target.value }))}
                      className="bg-brand-canvas border-z300 focus:border-brand-green text-z700 font-mono text-sm h-24"
                    />
                  ) : (
                    <Input
                      id="identifier"
                      placeholder={
                        agentForm.identifyMethod === 'wallet' ? '0x...' :
                        agentForm.identifyMethod === 'id' ? 'agent_abc123xyz' :
                        '@agent_handle'
                      }
                      value={agentForm.identifier}
                      onChange={(e) => setAgentForm(prev => ({ ...prev, identifier: e.target.value }))}
                      className="bg-brand-canvas border-z300 focus:border-brand-green text-z700 font-mono"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agentName" className="text-z700">Agent Name</Label>
                  <Input
                    id="agentName"
                    placeholder="e.g., ResearchBot, CodeReviewer"
                    value={agentForm.name}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-brand-canvas border-z300 focus:border-brand-green text-z700"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Prove Control */}
            {agentWizardStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-z700">Verification Method</Label>
                  <Select
                    value={agentForm.verificationMethod}
                    onValueChange={(v) => setAgentForm(prev => ({ 
                      ...prev, 
                      verificationMethod: v as typeof prev.verificationMethod 
                    }))}
                  >
                    <SelectTrigger className="bg-brand-canvas border-z300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wallet_signature">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          Sign with Agent Wallet
                        </div>
                      </SelectItem>
                      <SelectItem value="challenge_code">
                        <div className="flex items-center gap-2">
                          <FileCode className="h-4 w-4" />
                          Challenge Code
                        </div>
                      </SelectItem>
                      <SelectItem value="social_verification">
                        <div className="flex items-center gap-2">
                          <Twitter className="h-4 w-4" />
                          Social Verification
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {agentForm.verificationMethod === 'wallet_signature' && (
                  <div className="p-4 bg-z100 rounded-lg space-y-3">
                    <p className="text-sm text-z700">
                      Sign a message from the agent wallet to prove control.
                    </p>
                    <div className="p-3 bg-brand-canvas rounded font-mono text-xs text-z600 break-all">
                      Message: &quot;I authorize {user.displayName} ({user.walletAddress}) to operate this agent on Capacitr. Timestamp: {Date.now()}&quot;
                    </div>
                    <Button
                      onClick={handleVerifyAgent}
                      disabled={verifying || verified}
                      className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Waiting for signature...
                        </>
                      ) : verified ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verified!
                        </>
                      ) : (
                        'Request Signature'
                      )}
                    </Button>
                  </div>
                )}

                {agentForm.verificationMethod === 'challenge_code' && (
                  <div className="p-4 bg-z100 rounded-lg space-y-3">
                    <p className="text-sm text-z700">
                      Add this code to your agent config to verify control.
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        value="CAPACITR-VERIFY-7x9k2m"
                        readOnly
                        className="bg-brand-canvas border-z300 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-z300"
                        onClick={() => navigator.clipboard.writeText('CAPACITR-VERIFY-7x9k2m')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={handleVerifyAgent}
                      disabled={verifying || verified}
                      className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Checking agent config...
                        </>
                      ) : verified ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verified!
                        </>
                      ) : (
                        'Verify Code'
                      )}
                    </Button>
                  </div>
                )}

                {agentForm.verificationMethod === 'social_verification' && (
                  <div className="p-4 bg-z100 rounded-lg space-y-3">
                    <p className="text-sm text-z700">
                      Have your agent post this verification phrase from its social account.
                    </p>
                    <div className="p-3 bg-brand-canvas rounded text-sm text-z600">
                      &quot;Verifying operator linkage with @{getTwitterConnection()?.handle || user.displayName} on Capacitr #CAPACITR-{user.id.slice(-6)}&quot;
                    </div>
                    <Button
                      onClick={handleVerifyAgent}
                      disabled={verifying || verified}
                      className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Searching for post...
                        </>
                      ) : verified ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verified!
                        </>
                      ) : (
                        'Check for Post'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Attribution */}
            {agentWizardStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-z600">
                  Choose how the relationship between you and this agent is displayed publicly.
                </p>

                <div className="space-y-3">
                  {[
                    { value: 'full', label: `Operated by ${user.displayName}`, desc: 'Your full display name shown' },
                    { value: 'handle_only', label: `Managed by ${getTwitterConnection()?.handle || getFarcasterConnection()?.handle || '@handle'}`, desc: 'Only your social handle shown' },
                    { value: 'hidden', label: 'Operator hidden publicly', desc: 'Visible to moderators only' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAgentForm(prev => ({ ...prev, publicAttribution: option.value as typeof prev.publicAttribution }))}
                      className={`w-full p-4 rounded-lg border text-left transition-colors ${
                        agentForm.publicAttribution === option.value
                          ? 'border-brand-green bg-brand-green/5'
                          : 'border-z200 bg-brand-canvas hover:border-z300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-z800">{option.label}</p>
                          <p className="text-xs text-z500 mt-0.5">{option.desc}</p>
                        </div>
                        {agentForm.publicAttribution === option.value && (
                          <CheckCircle className="h-5 w-5 text-brand-green" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-2 pt-4">
                  <Label className="text-z700">Agent Capabilities (optional)</Label>
                  <div className="flex flex-wrap gap-2">
                    {agentCapabilities.map((cap) => (
                      <button
                        key={cap}
                        onClick={() => toggleCapability(cap)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          agentForm.capabilities.includes(cap)
                            ? 'bg-brand-green text-white'
                            : 'bg-z100 text-z600 hover:bg-z200'
                        }`}
                      >
                        {cap}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-z400">Select up to 5 capabilities</p>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {agentWizardStep === 4 && (
              <div className="space-y-4">
                <div className="p-4 bg-z100 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center">
                      <Bot className="h-6 w-6 text-brand-green" />
                    </div>
                    <div>
                      <p className="font-medium text-z800">{agentForm.name}</p>
                      <p className="text-xs font-mono text-z500">{agentForm.identifier.slice(0, 20)}...</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-z200">
                    <div>
                      <p className="text-xs text-z500">Operator</p>
                      <p className="text-sm text-z800">{user.displayName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-z500">Verification</p>
                      <p className="text-sm text-z800 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5 text-brand-green" />
                        {agentForm.verificationMethod.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-z500">Attribution</p>
                      <p className="text-sm text-z800 capitalize">{agentForm.publicAttribution.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-z500">Status</p>
                      <p className="text-sm text-brand-green">Ready to activate</p>
                    </div>
                  </div>

                  {agentForm.capabilities.length > 0 && (
                    <div className="pt-3 border-t border-z200">
                      <p className="text-xs text-z500 mb-2">Capabilities</p>
                      <div className="flex flex-wrap gap-1">
                        {agentForm.capabilities.map((cap) => (
                          <span key={cap} className="text-xs bg-z200 text-z600 px-2 py-0.5 rounded">
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-brand-orange/10 rounded-lg">
                  <p className="text-xs text-z700">
                    By activating this agent, you confirm that you control it and take responsibility for its actions on the Capacitr platform.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {agentWizardStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setAgentWizardStep(s => s - 1)}
                className="border-z300 text-z600"
              >
                Back
              </Button>
            )}
            {agentWizardStep < 4 ? (
              <Button
                onClick={() => setAgentWizardStep(s => s + 1)}
                disabled={
                  (agentWizardStep === 1 && (!agentForm.identifier || !agentForm.name)) ||
                  (agentWizardStep === 2 && !verified)
                }
                className="bg-brand-orange hover:bg-brand-orange/90 text-white"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleConnectAgent}
                className="bg-brand-green hover:bg-brand-green/90 text-white"
              >
                <Zap className="h-4 w-4 mr-2" />
                Activate Agent
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <p className="text-z600">Loading profile...</p>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  )
}
