"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Loader2, Wallet } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const handleLogin = async (method: 'wallet' | 'social', provider?: string) => {
    setSelectedMethod(provider || method)
    await login(method, provider)
  }

  return (
    <main className="min-h-screen bg-brand-cream flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-orange rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-z800 font-bold tracking-[0.1em] text-lg">CAPACITR</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Hero Text */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-z900 mb-4 leading-tight">
              FROM PROMPT<br />
              <span className="text-brand-orange">TO ENTERPRISE</span>
            </h1>
            <p className="text-z600 text-base leading-relaxed">
              Launch ideas, raise capital through bonding curves, and deploy AI agents to build.
            </p>
          </div>

          {/* Privy-style Login Modal */}
          <div className="bg-white rounded-2xl shadow-lg border border-z200 overflow-hidden">
            {/* Modal Header with Close Button */}
            <div className="relative px-6 pt-4 pb-2 flex items-center justify-center">
              <span className="text-sm text-z500">Log in or sign up</span>
            </div>

            {/* App Logo */}
            <div className="flex justify-center py-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm border border-z100">
                <Image 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/C%20logo-CGFdgDnMtYmhvbg6hX416emVkdAZYn.png"
                  alt="Capacitr"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 pb-4 space-y-3">
              {/* External Wallet */}
              <Button
                variant="outline"
                className="w-full h-14 justify-between px-4 bg-white border-z200 hover:border-z400 hover:bg-z50 text-z800 rounded-xl group transition-all"
                onClick={() => handleLogin('wallet', 'external')}
                disabled={isLoading}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-z100 to-z200 rounded-lg flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-z600" />
                  </div>
                  <span className="font-medium">External wallet</span>
                </div>
                {isLoading && selectedMethod === 'external' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-brand-orange" />
                ) : (
                  <svg className="h-5 w-5 text-z400 group-hover:text-z600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Button>

              {/* Twitter/X */}
              <Button
                variant="outline"
                className="w-full h-14 justify-between px-4 bg-white border-z200 hover:border-z400 hover:bg-z50 text-z800 rounded-xl group transition-all"
                onClick={() => handleLogin('social', 'twitter')}
                disabled={isLoading}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <span className="font-medium">X</span>
                </div>
                {isLoading && selectedMethod === 'twitter' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-brand-orange" />
                ) : (
                  <svg className="h-5 w-5 text-z400 group-hover:text-z600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Button>

              {/* Farcaster */}
              <Button
                variant="outline"
                className="w-full h-14 justify-between px-4 bg-white border-z200 hover:border-z400 hover:bg-z50 text-z800 rounded-xl group transition-all"
                onClick={() => handleLogin('social', 'farcaster')}
                disabled={isLoading}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#8465CB] rounded-lg flex items-center justify-center">
                    <FarcasterIcon />
                  </div>
                  <span className="font-medium">Farcaster</span>
                </div>
                {isLoading && selectedMethod === 'farcaster' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-brand-orange" />
                ) : (
                  <svg className="h-5 w-5 text-z400 group-hover:text-z600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Button>
            </div>

            {/* Powered by Privy */}
            <div className="px-6 py-4 flex items-center justify-center gap-1.5 border-t border-z100">
              <span className="text-xs text-z400">Protected by</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-black rounded-full" />
                <span className="text-xs font-semibold text-z700">privy</span>
              </div>
            </div>
          </div>

          {/* Protocol Tags */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <span className="px-2 py-1 bg-brand-green/5 text-brand-green text-[10px] font-mono rounded">ERC-8004</span>
            <span className="px-2 py-1 bg-brand-green/5 text-brand-green text-[10px] font-mono rounded">x402</span>
            <span className="px-2 py-1 bg-brand-green/5 text-brand-green text-[10px] font-mono rounded">OpenClaw</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full px-6 py-4 border-t border-z200">
        <div className="flex items-center justify-center gap-6 text-z500 text-xs">
          <a href="#" className="hover:text-z700">Docs</a>
          <a href="#" className="hover:text-z700">Terms</a>
          <a href="#" className="hover:text-z700">Privacy</a>
        </div>
      </footer>
    </main>
  )
}

// Farcaster Icon
function FarcasterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 4H19V6H21V8H19V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V8H3V6H5V4ZM7 8V18H17V8H7ZM9 11H11V15H9V11ZM13 11H15V15H13V11Z" fill="white"/>
    </svg>
  )
}
