"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export interface SocialConnection {
  platform: 'twitter' | 'farcaster'
  handle: string
  verified: boolean
  verifiedAt?: Date
  profileUrl: string
  followers?: number
  accountAge?: string
}

export interface Agent {
  id: string
  name: string
  walletAddress: string
  capabilities: string[]
  status: 'pending' | 'connected' | 'disconnected' | 'suspended'
  reputationScore: number
  verificationMethod?: 'wallet_signature' | 'challenge_code' | 'social_verification'
  publicAttribution: 'full' | 'handle_only' | 'hidden'
  linkedAt: Date
  lastActive?: Date
  totalEarnings?: number
  projectsDeployed?: number
}

export type OperatorTier = 'unverified' | 'connected' | 'trusted' | 'high_trust'

export interface User {
  id: string
  walletAddress: string
  parentWallet?: string
  displayName: string
  bio: string
  avatar?: string
  socialConnections: SocialConnection[]
  connectedAgents: Agent[]
  loginMethod: 'wallet' | 'social'
  operatorTier: OperatorTier
  operatorVerified: boolean
  maxAgents: number
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (method: 'wallet' | 'social', provider?: string) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
  updateAvatar: (avatarUrl: string) => void
  connectSocial: (platform: 'twitter' | 'farcaster', handle: string) => Promise<void>
  disconnectSocial: (platform: 'twitter' | 'farcaster') => void
  connectParentWallet: (address: string) => Promise<void>
  connectAgent: (agent: Omit<Agent, 'id' | 'linkedAt'>) => void
  disconnectAgent: (agentId: string) => void
  updateAgentStatus: (agentId: string, status: Agent['status']) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Calculate operator tier based on connections
const calculateOperatorTier = (socialConnections: SocialConnection[]): { tier: OperatorTier; maxAgents: number } => {
  const verifiedConnections = socialConnections.filter(s => s.verified)
  
  if (verifiedConnections.length === 0) {
    return { tier: 'unverified', maxAgents: 0 }
  }
  
  // Check for high trust indicators
  const hasHighFollowers = verifiedConnections.some(s => (s.followers || 0) > 10000)
  const hasOldAccount = verifiedConnections.some(s => s.accountAge && parseInt(s.accountAge) > 2)
  
  if (hasHighFollowers && hasOldAccount) {
    return { tier: 'high_trust', maxAgents: 10 }
  }
  
  if (hasHighFollowers || hasOldAccount || verifiedConnections.length >= 2) {
    return { tier: 'trusted', maxAgents: 3 }
  }
  
  return { tier: 'connected', maxAgents: 1 }
}

// Mock logged-in user for prototype
const createMockLoggedInUser = (): User => {
  return {
    id: 'user_demo_001',
    walletAddress: '0x7a25...3f91',
    displayName: 'Sayeed Mehrjerdian',
    bio: 'Building the future of decentralized idea validation. Founder exploring the intersection of AI agents and token economics.',
    avatar: undefined,
    socialConnections: [
      {
        platform: 'twitter',
        handle: '@atownbrown',
        verified: true,
        verifiedAt: new Date('2026-02-01'),
        profileUrl: 'https://x.com/atownbrown',
        followers: 4250,
        accountAge: '3 years',
      },
    ],
    connectedAgents: [
      {
        id: 'agent_001',
        name: 'ResearchBot',
        walletAddress: '0x9b3c...8e12',
        capabilities: ['Research', 'Data Analysis', 'Content Writing'],
        status: 'connected',
        reputationScore: 87,
        verificationMethod: 'wallet_signature',
        publicAttribution: 'full',
        linkedAt: new Date('2026-02-15'),
        lastActive: new Date('2026-03-05'),
        totalEarnings: 2.45,
        projectsDeployed: 3,
      },
    ],
    loginMethod: 'wallet',
    operatorTier: 'trusted',
    operatorVerified: true,
    maxAgents: 3,
    createdAt: new Date('2026-01-15'),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start with a mock logged-in user for the prototype
  const [user, setUser] = useState<User | null>(createMockLoggedInUser())
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const login = useCallback(async (method: 'wallet' | 'social', provider?: string) => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    const mockUser = createMockLoggedInUser()
    if (provider === 'twitter') {
      mockUser.displayName = '@capacitr_user'
    }
    setUser(mockUser)
    setIsLoading(false)
    router.push('/home')
  }, [router])

  const logout = useCallback(() => {
    setUser(null)
    router.push('/')
  }, [router])

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  const updateAvatar = useCallback((avatarUrl: string) => {
    setUser(prev => prev ? { ...prev, avatar: avatarUrl } : null)
  }, [])

  const connectSocial = useCallback(async (platform: 'twitter' | 'farcaster', handle: string) => {
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newConnection: SocialConnection = {
      platform,
      handle,
      verified: true,
      verifiedAt: new Date(),
      profileUrl: platform === 'twitter' 
        ? `https://x.com/${handle.replace('@', '')}` 
        : `https://warpcast.com/${handle.replace('@', '')}`,
      followers: Math.floor(Math.random() * 5000) + 500,
      accountAge: `${Math.floor(Math.random() * 4) + 1} years`,
    }
    
    setUser(prev => {
      if (!prev) return null
      const updatedConnections = [
        ...prev.socialConnections.filter(s => s.platform !== platform),
        newConnection,
      ]
      const { tier, maxAgents } = calculateOperatorTier(updatedConnections)
      return {
        ...prev,
        socialConnections: updatedConnections,
        operatorTier: tier,
        operatorVerified: tier !== 'unverified',
        maxAgents,
      }
    })
  }, [])

  const disconnectSocial = useCallback((platform: 'twitter' | 'farcaster') => {
    setUser(prev => {
      if (!prev) return null
      const updatedConnections = prev.socialConnections.filter(s => s.platform !== platform)
      const { tier, maxAgents } = calculateOperatorTier(updatedConnections)
      return {
        ...prev,
        socialConnections: updatedConnections,
        operatorTier: tier,
        operatorVerified: tier !== 'unverified',
        maxAgents,
      }
    })
  }, [])

  const connectParentWallet = useCallback(async (address: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    setUser(prev => prev ? { ...prev, parentWallet: address } : null)
  }, [])

  const connectAgent = useCallback((agent: Omit<Agent, 'id' | 'linkedAt'>) => {
    const newAgent: Agent = {
      ...agent,
      id: `agent_${Date.now()}`,
      linkedAt: new Date(),
    }
    setUser(prev => prev ? {
      ...prev,
      connectedAgents: [...prev.connectedAgents, newAgent]
    } : null)
  }, [])

  const disconnectAgent = useCallback((agentId: string) => {
    setUser(prev => prev ? {
      ...prev,
      connectedAgents: prev.connectedAgents.filter(a => a.id !== agentId)
    } : null)
  }, [])

  const updateAgentStatus = useCallback((agentId: string, status: Agent['status']) => {
    setUser(prev => prev ? {
      ...prev,
      connectedAgents: prev.connectedAgents.map(a => 
        a.id === agentId ? { ...a, status } : a
      )
    } : null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateProfile,
      updateAvatar,
      connectSocial,
      disconnectSocial,
      connectParentWallet,
      connectAgent,
      disconnectAgent,
      updateAgentStatus,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
