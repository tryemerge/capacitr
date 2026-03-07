"use client"

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, User, Bot, LogOut, ChevronDown, Lightbulb, Wallet } from 'lucide-react'

export function AppHeader() {
  const { user, logout } = useAuth()

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
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-z800">{user?.displayName || 'Anonymous'}</p>
                <p className="text-xs text-z500 font-mono truncate">{user?.walletAddress}</p>
              </div>
              <DropdownMenuSeparator className="bg-z200" />
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
