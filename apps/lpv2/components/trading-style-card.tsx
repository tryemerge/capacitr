"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { RefreshCw } from 'lucide-react'

// ─── Shared risk-profile types & data ───────────────────────────────────────

type Tier = 'cautious' | 'balanced' | 'conviction'

interface RiskProfile {
  tier: Tier
  scores: number[]
  completedAt: string
}

interface TierMeta {
  name: string
  emoji: string
  description: string
  badge: { bg: string; text: string }
}

const TIER_META: Record<Tier, TierMeta> = {
  cautious: {
    name: 'Cautious Predictor',
    emoji: '🛡️',
    description: 'You play it safe and think before you act. Steady wins the race.',
    badge: { bg: 'bg-brand-green/10', text: 'text-brand-green' },
  },
  balanced: {
    name: 'Balanced Predictor',
    emoji: '⚖️',
    description: 'You weigh risk and reward carefully. Smart and adaptable.',
    badge: { bg: 'bg-brand-orange/10', text: 'text-brand-orange' },
  },
  conviction: {
    name: 'Conviction Trader',
    emoji: '🎯',
    description: 'When you see it, you go for it. High energy, high conviction.',
    badge: { bg: 'bg-red-500/10', text: 'text-red-600' },
  },
}

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

function computeTier(scores: number[]): Tier {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  if (avg <= 1.5) return 'cautious'
  if (avg <= 2.4) return 'balanced'
  return 'conviction'
}

function saveProfile(tier: Tier, scores: number[]) {
  const payload: RiskProfile = {
    tier,
    scores,
    completedAt: new Date().toISOString(),
  }
  localStorage.setItem('capacitr_risk_profile', JSON.stringify(payload))
  return payload
}

function loadProfile(): RiskProfile | null {
  try {
    const raw = localStorage.getItem('capacitr_risk_profile')
    if (!raw) return null
    return JSON.parse(raw) as RiskProfile
  } catch {
    return null
  }
}

// ─── Retake Modal (inline quiz) ─────────────────────────────────────────────

function RetakeQuiz({ open, onClose, onComplete }: {
  open: boolean
  onClose: () => void
  onComplete: (profile: RiskProfile) => void
}) {
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'in' | 'out'>('in')

  const isResult = step === 3
  const question = step < 3 ? QUESTIONS[step] : null
  const tier = isResult ? computeTier(scores) : null

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setStep(0)
      setScores([])
      setSelected(null)
      setAnimating(false)
      setDirection('in')
    }
  }, [open])

  const handleSelect = useCallback((score: number) => {
    if (animating) return
    setSelected(score)

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

  const handleSave = useCallback(() => {
    if (tier) {
      const profile = saveProfile(tier, scores)
      onComplete(profile)
      onClose()
    }
  }, [tier, scores, onComplete, onClose])

  const contentClass = direction === 'out'
    ? 'opacity-0 -translate-x-3 transition-all duration-200 ease-in'
    : animating
      ? 'opacity-0 translate-x-3'
      : 'opacity-100 translate-x-0 transition-all duration-300 ease-out'

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="bg-brand-cream sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-z800">
            {isResult ? 'Your Result' : 'Retake Assessment'}
          </DialogTitle>
          <DialogDescription className="text-z500">
            {isResult ? 'Here\'s your updated trading style' : `Question ${step + 1} of 3`}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        {!isResult && (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  i <= step ? 'bg-brand-orange' : 'bg-z200'
                }`}
              />
            ))}
          </div>
        )}

        <div className={contentClass}>
          {!isResult && question ? (
            <div>
              <h3 className="text-base font-bold text-z900 mb-1">{question.label}</h3>
              <p className="text-z600 text-sm leading-relaxed mb-5">{question.prompt}</p>

              <div className="space-y-2.5">
                {question.options.map((opt) => {
                  const isSelected = selected === opt.score
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelect(opt.score)}
                      disabled={animating || selected !== null}
                      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'bg-brand-orange border-brand-orange text-white'
                          : 'bg-brand-canvas border-z200 text-z800 hover:border-brand-orange'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-brand-orange/10 text-brand-orange'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="text-sm font-medium leading-snug">{opt.text}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : tier ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">{TIER_META[tier].emoji}</div>
              <h3 className="text-xl font-bold text-z900 mb-1">
                You&apos;re a {TIER_META[tier].name}
              </h3>
              <p className="text-z600 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
                {TIER_META[tier].description}
              </p>
              <Button
                onClick={handleSave}
                className="w-full h-12 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl font-semibold transition-all"
              >
                Save Result
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Card Component ────────────────────────────────────────────────────

export function TradingStyleCard() {
  const [profile, setProfile] = useState<RiskProfile | null>(null)
  const [retakeOpen, setRetakeOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setProfile(loadProfile())
    setMounted(true)
  }, [])

  if (!mounted) return null

  const meta = profile ? TIER_META[profile.tier] : null
  const lastTaken = profile
    ? new Date(profile.completedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <>
      <Card className="bg-brand-canvas border-z200">
        <CardHeader>
          <CardTitle className="text-base text-z800 normal-case">Trading Style</CardTitle>
          <CardDescription className="text-z500">
            Your risk profile based on the onboarding assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile && meta ? (
            <div className="p-4 bg-brand-cream rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{meta.emoji}</span>
                  <div>
                    <p className="font-semibold text-z800">{meta.name}</p>
                    <p className="text-xs text-z500">Last taken {lastTaken}</p>
                  </div>
                </div>
                <Badge className={`${meta.badge.bg} ${meta.badge.text} border-0`}>
                  {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-z600 leading-relaxed">{meta.description}</p>
            </div>
          ) : (
            <div className="p-4 bg-brand-cream rounded-lg text-center">
              <p className="text-sm text-z600 mb-1">No assessment taken yet</p>
              <p className="text-xs text-z500">Take the quick quiz to discover your trading style</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setRetakeOpen(true)}
              className="gap-2 border-z300 text-z700 hover:text-brand-orange hover:border-brand-orange"
            >
              <RefreshCw className="h-4 w-4" />
              {profile ? 'Retake Assessment' : 'Take Assessment'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <RetakeQuiz
        open={retakeOpen}
        onClose={() => setRetakeOpen(false)}
        onComplete={(p) => setProfile(p)}
      />
    </>
  )
}
