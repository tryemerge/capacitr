"use client"

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useWallets, useFundWallet } from '@capacitr/auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, User, Bot, LogOut, ChevronDown, Lightbulb, Wallet, Copy, Check, DollarSign, KeyRound } from 'lucide-react'
import { useState, useCallback } from 'react'
import { useWalletBalance } from '@/hooks/use-wallet-balance'

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function AppHeader() {
  const { user, logout } = useAuth()
  const { wallets } = useWallets()
  const { fundWallet } = useFundWallet()
  const [copied, setCopied] = useState(false)

  const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy')
  const activeWallet = embeddedWallet ?? wallets[0]
  const balance = useWalletBalance(activeWallet?.address)

  const copyAddress = useCallback(async () => {
    if (!activeWallet?.address) return
    await navigator.clipboard.writeText(activeWallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [activeWallet?.address])

  const handleFund = useCallback(() => {
    if (!activeWallet?.address) return
    fundWallet(activeWallet.address)
  }, [activeWallet?.address, fundWallet])

  const handleExportWallet = useCallback(async () => {
    if (!embeddedWallet) return
    try {
      await (embeddedWallet as any).exportWallet()
    } catch (e) {
      console.error('Export wallet failed:', e)
    }
  }, [embeddedWallet])

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-cream/95 backdrop-blur border-b border-z200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-orange rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-z800 font-bold tracking-[0.1em] text-lg hidden sm:block">CAPACITR</span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link href="/submit">
            <Button className="bg-brand-green hover:bg-brand-green/90 text-white gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Submit Idea</span>
            </Button>
          </Link>

          {/* ETH Balance */}
          {balance !== null && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-z100 rounded-full border border-z200">
              <span className="text-sm font-medium text-z700">{balance} ETH</span>
            </div>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 hover:bg-z100">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-z200 text-z700 text-sm">
                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-z500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-brand-cream border-z200">
              <div className="px-3 py-2 flex items-center gap-2">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-z200 text-z700 text-sm">
                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                <p className="text-sm font-medium text-z800 truncate">{user?.displayName || 'Anonymous'}</p>
                {activeWallet && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <p className="text-xs text-z500 font-mono truncate">{truncateAddress(activeWallet.address)}</p>
                    <button onClick={copyAddress} className="text-z400 hover:text-z700">
                      {copied ? <Check className="h-3 w-3 text-brand-green" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                )}
                </div>
              </div>
              {activeWallet && (
                <div className="mx-3 my-1.5 flex items-center gap-1.5 px-2 py-1 bg-z100 rounded border border-z200">
                  <div className="w-2 h-2 rounded-full bg-brand-orange" />
                  <span className="text-[10px] font-medium text-z500">Arb Sepolia</span>
                </div>
              )}
              <DropdownMenuSeparator className="bg-z200" />
              {activeWallet && (
                <>
                  <DropdownMenuItem onClick={handleFund} className="cursor-pointer">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>Fund Wallet</span>
                  </DropdownMenuItem>
                  {embeddedWallet && (
                    <DropdownMenuItem onClick={handleExportWallet} className="cursor-pointer">
                      <KeyRound className="h-4 w-4 mr-2" />
                      <span>Export Wallet</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-z200" />
                </>
              )}
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile" className="flex items-center gap-2 text-z700">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/my-ideas" className="flex items-center gap-2 text-z700">
                  <Lightbulb className="h-4 w-4" />
                  <span>My Ideas</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/my-investments" className="flex items-center gap-2 text-z700">
                  <Wallet className="h-4 w-4" />
                  <span>My Investments</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/profile?tab=agents" className="flex items-center gap-2 text-z700">
                  <Bot className="h-4 w-4" />
                  <span>My Agents</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-z200" />
              <DropdownMenuItem 
                onClick={logout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Disconnect</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
