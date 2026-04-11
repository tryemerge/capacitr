"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ensureSupabaseUser, saveUserRiskProfile } from '@/lib/supabase-user'
import { Button } from '@/components/ui/button'

const QUESTIONS = [
  {
    id: 1,
    label: 'How do you handle a loss?',
    prompt: 'You put $50 on a prediction and lost. What\'s your next move?',
    options: [
      { key: 'A', text: 'Take a break — I need to think before trading again', score: 1 },
      { key: 'B', text: 'Make a smaller bet next time — lesson learned', score: 2 },
      { key: 'C', text: 'Find another good trade — losses happen', score: 3 },
    ],
  },
  {
    id: 2,
    label: 'How much skin in the game?',
    prompt: 'You have $100 to trade with. A prediction you feel good about shows up. How much do you put on it?',
    options: [
      { key: 'A', text: '$5-10 — I like to spread my bets', score: 1 },
      { key: 'B', text: '$15-25 — enough to matter, not enough to hurt', score: 2 },
      { key: 'C', text: '$30-50 — if I believe it, I back it', score: 3 },
    ],
  },
  {
    id: 3,
    label: "What's your speed?",
    prompt: 'How often do you want to be trading?',
    options: [
      { key: 'A', text: 'A few times a month when something really stands out', score: 1 },
      { key: 'B', text: 'A few times a week — I like staying active', score: 2 },
      { key: 'C', text: 'Daily — I want to catch every opportunity', score: 3 },
    ],
  },
] as const

type Tier = 'cautious' | 'balanced' | 'conviction'

interface TierMeta {
  name: string
  emoji: string
  description: string
}

const TIER_META: Record<Tier, TierMeta> = {
  cautious: {
    name: 'Cautious Predictor',
    emoji: '🛡️',
    description: 'You play it safe and think before you act. You\'d rather miss an opportunity than take a bad bet. Steady wins the race.',
  },
  balanced: {
    name: 'Balanced Predictor',
    emoji: '⚖️',
    description: 'You weigh risk and reward carefully. You\'re not afraid to commit, but you keep things measured. Smart and adaptable.',
  },
  conviction: {
    name: 'Conviction Trader',
    emoji: '🎯',
    description: 'When you see it, you go for it. You trust your instincts and aren\'t scared of bold moves. High energy, high conviction.',
  },
}

function computeTier(scores: number[]): Tier {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  if (avg <= 1.5) return 'cautious'
  if (avg <= 2.4) return 'balanced'
  return 'conviction'
}

function saveProfile(tier: Tier, scores: number[]) {
  const payload = {
    tier,
    scores,
    completedAt: new Date().toISOString(),
  }
  localStorage.setItem('capacitr_risk_profile', JSON.stringify(payload))
}

export default function RiskProfileOnboarding() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(0) // 0,1,2 = questions; 3 = result
  const [scores, setScores] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'in' | 'out'>('in')

  const isResult = step === 3
  const question = step < 3 ? QUESTIONS[step] : null
  const tier = isResult ? computeTier(scores) : null

  const handleSkip = useCallback(async () => {
    saveProfile('balanced', [2, 2, 2])
    try {
      if (user?.id) {
        const supabaseUserId = await ensureSupabaseUser(user.id, user.loginMethod, user.displayName)
        await saveUserRiskProfile(supabaseUserId, 'balanced', [2, 2, 2])
      }
    } catch (err) {
      console.error('Error saving risk profile to Supabase:', err)
    }
    router.push('/home')
  }, [router, user])

  const handleSelect = useCallback((score: number) => {
    if (animating) return
    setSelected(score)

    // Brief delay to show selected state, then advance
    setTimeout(() => {
      const newScores = [...scores, score]
      setScores(newScores)
      setDirection('out')
      setAnimating(true)

      setTimeout(() => {
        setSelected(null)
        setStep((s) => s + 1)
        setDirection('in')

        setTimeout(() => {
          setAnimating(false)
        }, 50)
      }, 250)
    }, 300)
  }, [animating, scores])

  const handleContinue = useCallback(async () => {
    if (tier) {
      saveProfile(tier, scores)
      try {
        if (user?.id) {
          const supabaseUserId = await ensureSupabaseUser(user.id, user.loginMethod, user.displayName)
          await saveUserRiskProfile(supabaseUserId, tier, scores)
        }
      } catch (err) {
        console.error('Error saving risk profile to Supabase:', err)
      }
    }
    router.push('/home')
  }, [tier, scores, router, user])

  // Animation classes
  const contentClass = direction === 'out'
    ? 'opacity-0 translate-x-[-20px] transition-all duration-200 ease-in'
    : animating
      ? 'opacity-0 translate-x-[20px]'
      : 'opacity-100 translate-x-0 transition-all duration-300 ease-out'

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
        {!isResult && (
          <button
            onClick={handleSkip}
            className="text-z500 text-sm hover:text-z700 transition-colors"
          >
            Skip
          </button>
        )}
      </header>

      {/* Progress */}
      {!isResult && (
        <div className="px-6 pb-2">
          <div className="flex gap-2 max-w-md mx-auto w-full">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  i <= step ? 'bg-brand-orange' : 'bg-z200'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-z500 text-xs mt-2">{step + 1} of 3</p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className={`w-full max-w-md ${contentClass}`}>
          {!isResult && question ? (
            <div>
              {/* Question */}
              <h2 className="text-xl font-bold text-z900 mb-2">
                {question.label}
              </h2>
              <p className="text-z600 text-sm leading-relaxed mb-8">
                {question.prompt}
              </p>

              {/* Options */}
              <div className="space-y-3">
                {question.options.map((opt) => {
                  const isSelected = selected === opt.score
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelect(opt.score)}
                      disabled={animating || selected !== null}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'bg-brand-orange border-brand-orange text-white'
                          : 'bg-brand-canvas border-z200 text-z800 hover:border-brand-orange active:border-brand-orange'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-brand-orange/10 text-brand-orange'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="text-sm font-medium leading-snug pt-0.5">
                          {opt.text}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : tier ? (
            /* Result Screen */
            <div className="text-center">
              <div className="text-6xl mb-6">{TIER_META[tier].emoji}</div>
              <h2 className="text-2xl font-bold text-z900 mb-2">
                You&apos;re a {TIER_META[tier].name}
              </h2>
              <p className="text-z600 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
                {TIER_META[tier].description}
              </p>

              <Button
                onClick={handleContinue}
                className="w-full h-14 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl font-semibold text-base transition-all"
              >
                Continue
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}
