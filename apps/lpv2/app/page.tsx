"use client"

import { useAuth } from '@/lib/auth-context'
import { AuthGuard } from '@/components/auth-guard'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function LoginPage() {
  const { login, isLoading } = useAuth()

  return (
    <AuthGuard>
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
        <div className="w-full max-w-md text-center">
          {/* App Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border border-z100">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/C%20logo-CGFdgDnMtYmhvbg6hX416emVkdAZYn.png"
                alt="Capacitr"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Hero Text */}
          <h1 className="text-3xl md:text-4xl font-bold text-z900 mb-4 leading-tight">
            FROM PROMPT<br />
            <span className="text-brand-orange">TO ENTERPRISE</span>
          </h1>
          <p className="text-z600 text-base leading-relaxed mb-10">
            Launch ideas, raise capital through bonding curves, and deploy AI agents to build.
          </p>

          {/* Sign In Button */}
          <Button
            className="w-full max-w-xs h-14 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl font-semibold text-base transition-all"
            onClick={() => login()}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Connect'}
          </Button>

          {/* Protocol Tags */}
          <div className="flex items-center justify-center gap-2 mt-8">
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
    </AuthGuard>
  )
}
