"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ensureSupabaseUser, saveUserInterests } from '@/lib/supabase-user'
import { Button } from '@/components/ui/button'

const INTERESTS = [
  'Crypto',
  'Politics',
  'Sports',
  'AI & Tech',
  'Finance',
  'Entertainment',
  'Science',
  'World News',
  'Commodities',
  'Climate',
  'Culture',
  'Health',
  'Gaming',
] as const

const MIN_INTERESTS = 3

export default function InterestsOnboarding() {
  const router = useRouter()
  const { user } = useAuth()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  const toggle = useCallback((interest: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(interest)) {
        next.delete(interest)
      } else {
        next.add(interest)
      }
      return next
    })
  }, [])

  const handleSkip = useCallback(() => {
    router.push('/onboarding/risk-profile')
  }, [router])

  const handleContinue = useCallback(async () => {
    const interests = Array.from(selected)
    setSaving(true)

    try {
      // Save to localStorage as fallback
      localStorage.setItem('capacitr_interests', JSON.stringify(interests))

      // Save to Supabase
      if (user?.id) {
        const supabaseUserId = await ensureSupabaseUser(
          user.id,
          user.loginMethod,
          user.displayName,
        )
        await saveUserInterests(supabaseUserId, interests)
      }
    } catch (err) {
      console.error('Error saving interests:', err)
      // localStorage is already saved, so proceed anyway
    }

    setSaving(false)
    router.push('/onboarding/risk-profile')
  }, [selected, user, router])

  const canContinue = selected.size >= MIN_INTERESTS

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
        <button
          onClick={handleSkip}
          className="text-z500 text-sm hover:text-z700 transition-colors"
        >
          Skip
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          {/* Heading */}
          <h2 className="text-xl font-bold text-z900 mb-2">
            What are you interested in?
          </h2>
          <p className="text-z600 text-sm leading-relaxed mb-8">
            Pick topics you care about. We&apos;ll use these to find markets that match.
          </p>

          {/* Interest Chips */}
          <div className="flex flex-wrap gap-3 mb-8">
            {INTERESTS.map((interest) => {
              const isSelected = selected.has(interest)
              return (
                <button
                  key={interest}
                  onClick={() => toggle(interest)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                    isSelected
                      ? 'bg-brand-orange border-brand-orange text-white'
                      : 'bg-brand-canvas border-z200 text-z700 hover:border-brand-orange'
                  }`}
                >
                  {interest}
                </button>
              )
            })}
          </div>

          {/* Counter */}
          <p className="text-z500 text-xs text-center mb-6">
            {selected.size < MIN_INTERESTS
              ? `Select at least ${MIN_INTERESTS - selected.size} more`
              : `${selected.size} selected`}
          </p>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!canContinue || saving}
            className="w-full h-14 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl font-semibold text-base transition-all disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </div>
    </main>
  )
}
