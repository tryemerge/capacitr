"use client"

import { createContext, useContext, useMemo, ReactNode } from 'react'
import { useAuth as usePrivyAuth } from "@capacitr/auth"

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
  login: (method?: 'wallet' | 'social', provider?: string) => Promise<void>
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const privy = usePrivyAuth()

  const user: User | null = useMemo(() => {
    if (!privy.authenticated || !privy.user) return null

    return {
      id: privy.user.id,
      walletAddress: '',
      displayName: privy.user.displayName || 'Anonymous',
      bio: '',
      avatar: undefined,
      socialConnections: [],
      connectedAgents: [],
      loginMethod: 'wallet' as const,
      operatorTier: 'connected' as const,
      operatorVerified: true,
      maxAgents: 1,
      createdAt: new Date(),
    }
  }, [privy.authenticated, privy.user])

  const value: AuthContextType = useMemo(() => ({
    user,
    isAuthenticated: privy.authenticated,
    isLoading: !privy.ready,
    login: async () => { privy.login() },
    logout: async () => {
      await privy.logout()
      window.location.href = '/'
    },
    // These are stubs — the upstream UI references them but they're
    // not wired to a backend yet. They no-op so pages don't break.
    updateProfile: () => {},
    updateAvatar: () => {},
    connectSocial: async () => {},
    disconnectSocial: () => {},
    connectParentWallet: async () => {},
    connectAgent: () => {},
    disconnectAgent: () => {},
    updateAgentStatus: () => {},
  }), [user, privy])

  return (
    <AuthContext.Provider value={value}>
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
