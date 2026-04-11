# Capacitr Trading Insights — Feature Plan

## The Big Picture

Capacitr absorbs chatter, processes it, and releases precise tradeable exposure. Today we present markets based on interests — that's table stakes. The defensible moat is **understanding what users believe** and giving them personalized trade recommendations that reflect their worldview, risk appetite, and the real-time signal landscape.

No major platform currently does all three: (1) captures user beliefs systematically, (2) maps beliefs to prediction markets, and (3) recommends trades where user beliefs diverge from market consensus. **This is white space.**

---

## Architecture: Three Pillars

### Pillar 1 — User Profile (Who Are You?)

Captured during onboarding and refined over time.

**A. Interests** (already planned)
- Topic categories: Politics, Tech, Crypto, Sports, Climate, Culture, etc.
- Selected during onboarding, editable anytime

**B. Risk Profile** (new — implementing now)
- 3 simple questions during onboarding (after interests)
- Produces a risk tier: Cautious / Balanced / Conviction
- Editable from profile/settings at any time
- Drives position sizing recommendations and guardrail nudges

**C. Beliefs** (new — the moat)
- Captured progressively through micro-interactions on the feed
- Not a one-time survey — an evolving model of how the user thinks
- Stored as structured belief objects with confidence levels

### Pillar 2 — Belief Capture (What Do You Think?)

This is the core defensible layer. We learn what users believe through three channels:

**Channel 1: Feed Reactions (Passive)**
When a user reads a story about their interest (e.g., "Fed signals rate cut"), we present a lightweight prompt:

> "Do you think rates will drop before September?"
> 🟢 Yes (confident) | 🟡 Maybe | 🔴 No way

This takes 1 second, feels natural next to the story, and gives us:
- A directional belief (bullish/bearish on rates)
- A confidence level (high/medium/low)
- A topic tag (interest rates → Fed → macro)

**Channel 2: Story Predictions (Active)**
After reading a story, users can make a quick prediction:

> "Where do you think oil goes in the next 30 days?"
> Slider: $55 ←——●——→ $85

Or for binary topics:
> "Will TikTok get banned by Q3?"
> Slider: 0% ←——●——→ 100%

These build a calibration profile over time — we can track how often users' predictions come true and use that to weight recommendations.

**Channel 3: Trade Feedback Loop (Behavioral)**
When a user takes a trade we recommended, the outcome data feeds back:
- Did they hold to resolution or exit early?
- Did they size up or down from the suggestion?
- Win/loss patterns by topic category

This behavioral signal is more honest than stated preferences (Wealthfront's insight).

**Belief Data Model:**
```
user_beliefs:
  id, user_id
  topic          -- "fed_rate_cut", "oil_prices", "tiktok_ban"
  direction      -- "bullish" | "bearish" | "neutral"
  confidence     -- 1-5 scale
  source         -- "feed_reaction" | "prediction" | "trade_behavior"
  context_url    -- the story that prompted this belief
  market_id      -- linked Polymarket/Hyperliquid market if applicable
  created_at
  expires_at     -- beliefs decay; a Fed belief from 6 months ago is stale
```

### Pillar 3 — Signal Engine (What's Happening?)

Real-time market intelligence that combines with user beliefs:

**Signal Types:**
1. **Chatter Spike** — Uptick in news/social mentions on a topic (e.g., oil mentioned 3x more than baseline)
2. **Volume Surge** — More liquidity flowing into a specific market or trade direction
3. **Price Movement** — Market odds shifting rapidly (someone knows something)
4. **Consensus Divergence** — User's belief significantly differs from current market price

**Signal Sources:**
- News RSS feeds + entity extraction (we already do this in capacitr-markets)
- Social media monitoring (Twitter/X API, Reddit, Farcaster)
- Polymarket CLOB data (price, volume, open interest)
- Hyperliquid perps data (funding rates, OI, volume)

**Signal Data Model:**
```
market_signals:
  id
  market_id      -- Polymarket/Hyperliquid market
  signal_type    -- "chatter_spike" | "volume_surge" | "price_movement" | "new_market"
  magnitude      -- 1-10 (how significant)
  topic_tags     -- ["oil", "energy", "geopolitics"]
  detected_at
  expires_at     -- signals are time-sensitive
  metadata       -- JSON: source URLs, volume numbers, price deltas
```

---

## The Recommendation Engine

When all three pillars have data, we can make **the killer recommendation**:

### The Formula

```
Recommendation Score = 
  (Belief Divergence from Market × Confidence) 
  × Signal Strength 
  × Risk Profile Fit
```

**Example Flow:**

1. User interested in "Energy" → we show them oil-related stories
2. User reacts: "I think oil goes above $80" (belief: bullish oil, confidence: high)
3. Signal engine detects: Polymarket has "Oil above $80 by July" at $0.35 (market says 35% likely)
4. **Divergence**: User believes it's likely, market says unlikely → HIGH divergence
5. Signal engine also detects: Oil chatter up 2x this week, volume increasing on YES side
6. User's risk profile: "Balanced" → suggest 15% of bankroll
7. **Recommendation**: "You think oil's going above $80 and the market disagrees. Chatter is surging. Consider YES at $0.35 — a $15 position could return $43."

### Recommendation Types

**"Your Belief, Your Trade"** — Direct belief-to-market match
> Based on your take that [X], here's a market trading at [Y]% — you could express your view here.

**"Signal Alert"** — Time-sensitive opportunity matching interests
> Oil chatter just spiked 3x. You follow energy. Here's what's moving.

**"Consensus Check"** — Your belief vs. the crowd
> You said rates won't drop. The market just moved to 72% chance they will. Changed your mind, or want to bet against the crowd?

**"Calibration Nudge"** — Learning from past predictions
> Last month you predicted 3 things about crypto — you were right on 2. Your crypto instincts are strong. Here's a new market.

---

## Implementation Phases

### Phase 1: Foundation (Now)
- [x] Interest selection during onboarding
- [ ] **Risk profile capture** (3 questions, after interests) ← BUILDING NOW
- [ ] Risk profile editable from settings
- [ ] Database tables: `risk_profiles`

### Phase 2: Belief Capture (Next)
- [ ] Feed reactions UI — lightweight prompts next to stories
- [ ] Binary prediction slider on stories
- [ ] Database tables: `user_beliefs`, `user_predictions`
- [ ] Belief decay logic (old beliefs lose weight)
- [ ] Basic calibration tracking (were predictions right?)

### Phase 3: Signal Engine (After)
- [ ] Expand capacitr-markets entity extraction to run continuously
- [ ] Chatter monitoring pipeline (news RSS + social APIs)
- [ ] Polymarket + Hyperliquid real-time data feeds
- [ ] Database tables: `market_signals`
- [ ] Signal scoring algorithm

### Phase 4: Recommendations (The Payoff)
- [ ] Divergence calculator (user belief vs. market price)
- [ ] Recommendation scoring engine
- [ ] "Your Trade" cards in the feed
- [ ] Signal alerts (push notifications for time-sensitive opportunities)
- [ ] Calibration dashboard (your prediction track record)
- [ ] Position sizing suggestions based on risk profile

### Phase 5: Social Layer (Moat Deepening)
- [ ] Anonymous aggregate: "73% of Capacitr users think oil goes up"
- [ ] Leaderboard: top predictors by category
- [ ] "Follow the signal" — see what high-calibration users are trading
- [ ] Community beliefs as a proprietary data source

---

## Risk Profile Design (Phase 1 — Building Now)

### Why 3 Questions Work

Traditional robo-advisors (Wealthfront, Betterment) use 5-12 questions. But prediction markets are different:
- Binary outcomes (win/lose), not gradual returns
- Time-bounded, not open-ended
- Position sizing matters more than asset allocation
- Behavioral impulse risk is amplified (fast feedback loops)

We need to capture: (1) loss tolerance, (2) sizing instinct, (3) behavioral tendency.

### The 3 Questions

**Q1 — "How do you handle a loss?"** (Emotional/behavioral)
> You put $50 on a prediction and lost. What's your next move?

- A) Take a break — I need to think before trading again → CAUTIOUS
- B) Make a smaller bet next time — lesson learned → BALANCED  
- C) Find another good trade — losses happen → CONVICTION

**Q2 — "How much skin in the game?"** (Position sizing instinct)
> You have $100 to trade with. A prediction you feel good about shows up. How much do you put on it?

- A) $5-10 — I like to spread my bets → CAUTIOUS
- B) $15-25 — enough to matter, not enough to hurt → BALANCED
- C) $30-50 — if I believe it, I back it → CONVICTION

**Q3 — "What's your speed?"** (Time horizon / frequency)
> How often do you want to be trading?

- A) A few times a month when something really stands out → CAUTIOUS
- B) A few times a week — I like staying active → BALANCED
- C) Daily — I want to catch every opportunity → CONVICTION

### Scoring

Each answer maps to: Cautious=1, Balanced=2, Conviction=3

- Average 1.0-1.5 → **Cautious Predictor** 🛡️
  - Max 10% per position, daily loss limits, cooling-off nudges
- Average 1.6-2.4 → **Balanced Predictor** ⚖️
  - Max 20% per position, weekly review prompts
- Average 2.5-3.0 → **Conviction Trader** 🎯
  - Up to 33% per position, streak tracking, P&L alerts

### UX Notes
- Presented as a conversational flow, one question at a time
- Tan background, orange/green accents matching brand
- Each answer is a full-width card you tap to select
- After completing, show a fun summary: "You're a Balanced Predictor ⚖️ — you pick your spots carefully and size them right."
- Skip option available (defaults to Balanced)
- Editable anytime from Profile → Trading Style

---

## Why This Is Defensible

1. **Belief data is proprietary** — No one else has a structured graph of what users believe about hundreds of topics with confidence levels and calibration scores
2. **The recommendation engine improves with data** — More beliefs + more outcomes = better calibration weights = better suggestions
3. **Network effects** — Aggregate belief data becomes a signal source itself ("Capacitr users are 80% bullish on oil" is valuable intelligence)
4. **Progressive lock-in** — The more a user interacts, the better their recommendations get. Switching means starting over.
5. **Market-making opportunity** — If we know what users believe and want to trade, we can eventually create markets specifically for our user base

---

## Competitive Landscape

| Platform | Interests | Risk Profile | Belief Capture | Signals | Recommendations |
|----------|-----------|-------------|----------------|---------|-----------------|
| Polymarket | ❌ | ❌ | ❌ (via trades only) | ❌ | ❌ |
| Kalshi | Categories | Reg-required | ❌ | ❌ | ❌ |
| Robinhood | ❌ | Yes (compliance) | ❌ | ❌ | Managed only |
| Metaculus | Topics | ❌ | ✅ (predictions) | ❌ | ❌ |
| Embed (MBD) | Onchain inference | ❌ | Behavioral only | ✅ | ✅ (API) |
| **Capacitr** | ✅ | ✅ | ✅ (explicit+behavioral) | ✅ | ✅ |

We're the only one doing all five.
