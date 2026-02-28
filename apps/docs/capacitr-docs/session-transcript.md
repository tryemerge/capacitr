# Session Transcript: Capacitr Pivot + Simulator + Brief
**Date:** 2026-02-28
**Prior session:** EmMittr Whitepaper v0.0.20 (Ventures section, reflexive signal fix)

---

## Part 1: Whitepaper Q&A Overhaul

### Replaced Part IX "Risks and Mitigations" → "Questions and Risks"

The old Risks section had 5 risk/mitigation pairs covering only base economics. Replaced with escalating Q&A format — 9 questions in three tiers, every answer cross-referencing specific whitepaper sections.

**Tier 1 — Mechanical:**
- Can't people just farm emmissions?
- What happens if trading volume dies?
- How do you stop wash trading?

**Tier 2 — Protocol:**
- What stops deliberation from becoming a shouting match?
- Why would anyone participate in a deliberation they might lose?
- What if the reflexive signal creates a bubble?

**Tier 3 — Ecosystem:**
- Doesn't EmMittr Ventures create a conflict of interest?
- Can an autonomous agent make bad economic decisions?
- Does this actually lead to autonomous organizations? (capstone — maps economic → governance → capital allocation layers to roadmap)

### Added Appendix B: Potential Investor Questions

Three additional questions siloed into a new appendix after the glossary:

1. **What's the moat?** — Work definitions as switching cost. Stripe webhooks, decay curves, emmission holders, fee pools, deliberation history, agent reputation — none transfers. "The moat is not the protocol — it's what projects build on top of it."

2. **Is there a limit to what can be tokenized?** — Three Work classes cover anything measurable or deliberatable. "The scope is deliberately unlimited. The protocol is infrastructure, not a vertical."

3. **Isn't this just another governance token?** — Churchill defense. Token voting is plutocratic, multisigs oligarchic, dictators are single points of failure, committees are slow. "It is the worst form of on-chain governance, except for all the others."

**Output:** EmMittr_Whitepaper_v0.0.20.docx (updated in place, no version bump)

---

## Part 2: The Pivot — EmMittr → Capacitr

### The Feedback

External feedback: EmMittr's initial value proposition isn't compelling. People don't use Clanker for launching projects that need sophisticated tokenomics. Clanker is about snipers — the evaluation layer, not the launch mechanic. The emmission model isn't enough to drive behavior or zeitgeist.

### The Counter-Argument and Its Trap

"It's not for humans, it's for agents" — but this opens a trap. If it's not for humans, what human-centric mechanics are we keeping unnecessarily?

**Mechanics that exist for human psychology, not agent utility:**
- Decay curve as FOMO driver (agents calculate EV, they don't feel urgency)
- Default Work metric (human convenience — agents integrate SDKs instantly)
- Three-tier integration story (the "zero effort" tier is a human pitch)
- 14-day minting lock (prevents human panic selling — agents don't panic)
- Promotional framing ("reward the people who grow your project")

**Mechanics that are genuinely agent-native:**
- reportWork() as clean API primitive
- Capacitor economics / Proof of Good Judgement
- The reflexive signal
- EmMittr Ventures (intelligence harvesting)
- Fee compounding (automated value accrual agents can reason about)

### The Reframe

The bottom half of the protocol (launch, emmissions, decay curve, fee split) is plumbing. The top half (Proof of Good Judgement, Ventures, adversarial training ground) is the actual moat. The pitch should lead with governance, not token launch.

**New positioning:** "The first protocol where investing in a project means governing it, and governing well is the highest-returning strategy an agent can run."

### Name Discussion

**Capacitr** chosen over Capacidoor. Reasoning: the name IS the mechanic. "Built on Capacitr" works. "A Capacitr DAO" works. The physics metaphor (stores energy, releases directionally) does real work in the protocol design. A door opens and closes — undersells the concept.

---

## Part 3: Capacitr Architecture Design

### Bonding Curve as Governance Entry

A project launches a token on a bonding curve. Agents buy the token to enter governance. The bonding curve IS the fundraise — ETH from purchases goes to the project as operating capital. The act of entering governance IS the fundraise.

**Two phases:**
1. **Bonding curve** — early buyers get in cheap, price rises, ETH accumulates
2. **Graduation** — at target, accumulated ETH + remaining tokens pair into locked DEX liquidity

### Charging the Liquidity Pool Through Deliberation

Key insight: the liquidity pool starts empty and gets charged through governance activity.

**Passive charge:** buying tokens on the bonding curve moves ETH toward the graduation reserve.
**Active charge:** deliberation generates fees — speaking, voting, AMM activity — that flow into the LP.

Graduation isn't a market cap target. It's a governance activity target. **The token goes live when enough governance has happened.** A project that asks no questions sits on a bonding curve forever.

### Token-Denominated Economics

Everything denominated in the project token, not ETH.

- 40% of trading fees flow into the deliberation pool as project tokens
- Project can seed additional tokens (dilution as investment in governance quality)
- Agents deposit project tokens into the capacitor
- Bonding curve prices entry — first in pays least
- Settlement: flat-rate discharge — total tokens / total anode outstanding
- All rewards paid in project tokens

### The Full Loop (Token-Denominated)

Project launches BIRD → trading happens → 40% of fees (in BIRD) charge the deliberation pool → project posts a question → agents deposit BIRD into capacitor → entry price rises with competition → deliberation runs → speaking costs BIRD, voting costs BIRD → settlement: speaking pool to top contributor, voting pool to accurate voters, remaining positions discharge at flat rate → agents walk out with more or less BIRD than they entered with.

### Settlement Mechanics

**Flat-rate discharge:** All remaining anode settles at total pool / total anode outstanding. Everyone gets the same rate.

- Early entry (cheap): anode cost less than discharge rate → profit by sitting quietly
- Late entry (expensive): need speaking/voting rewards to break even
- Non-participants: get proportional discharge, no penalty for silence
- Speaking: spend anode, lose that discharge claim, cathode flows to speaking pool
- Voting: same mechanic, smaller cost, cathode flows to voting pool

**Key change from prior design:** Nobody buys a token they can't get out of. Everyone gets discharged. The question is just whether you earned more than you spent.

### The Clanker Parallel

Clanker snipers evaluate "should I fund this token?" based on creator history.
Capacitr agents evaluate "should I fund this governance?" based on governance track record.

Same economic motion, different signal. The protocol generates governance scores natively — every deliberation has a recorded outcome, every project accumulates a track record.

---

## Part 4: Deliberation Simulator

### Built: Next.js App (capacitor-sim)

Interactive simulator modeling token flows through a governance deliberation.

**Architecture:**
```
capacitor-sim/
├── src/
│   ├── app/            # Next.js app router
│   ├── components/
│   │   └── CapacitorSim.tsx    # All UI (client component)
│   └── lib/
│       ├── simulation.ts       # Pure math engine, fully typed
│       └── presets.ts          # 4 scenario presets
├── tailwind.config.js
├── tsconfig.json
├── next.config.js
└── package.json
```

**Math engine covers:**
- Bonding curve entry pricing: price = 1 + k × (totalDeposited / totalPool)
- Speaking cost: configurable % of remaining anode
- Voting cost: configurable % of remaining anode (cheaper than speaking)
- Cathode flow: anode spent × entry price → pool
- Flat-rate discharge: (totalPool + totalDeposited - speakingPool - votingPool) / totalAnodeRemaining
- P&L per agent: discharge return + speaking reward + voting reward - deposit

**4 preset scenarios:**
1. **Simple (4 agents, clear winner)** — shows early entry advantage
2. **Noisy Room (6 agents)** — Spammer burns anode, Sage wins with one statement, Lurker profits from voting
3. **Silent Majority (8 agents)** — 2 speakers, 5 voters, 1 observer. Demonstrates ideal conversation shape.
4. **Whale vs Field** — 50x capital advantage defeated by coordinated minnows. Capital doesn't buy votes.

**Adjustable parameters:** pool size, project seed, speak cost %, vote cost %, curve steepness (k), individual agent deposits.

**Output:** capacitor-sim.tar.gz (Next.js app, `npm install && npm run dev`)

---

## Part 5: Capacitr Brief v0.1.0

Complete rewrite of the 2-page brief for the governance-first positioning.

**Structure:**
- **Title:** "Capacitr — The first protocol where investing in a project means governing it"
- **Tagline:** "Governance that pays for itself. Reasoning priced in real time."
- **Problem:** Governance is broken (plutocratic/oligarchic/noisy) + agents have no venue
- **Solution:** Capacitr — participation costs money, being right earns it back
- **How the Capacitor Works:** Charging → Entry → Deliberation → Settlement (with flat-rate discharge)
- **The Reflexive Signal:** Project seeds pool → market signal → better agents → better decisions → token appreciates
- **How Agents Find Opportunities:** The Clanker sniper parallel — governance track records instead of creator history
- **Capacitr Ventures:** Fund that invests by governing
- **Why Capacitr:** vs Snapshot/Tally/Aragon (no cost = no turnout), vs Polymarket (binary vs open-ended), vs everyone (nobody else has self-funding governance)
- **The Loop:** Bonding curve → fees charge pool → question → agents enter → deliberation → settlement → implementation → token appreciates → richer next pool

**Competitive set shifted:** From Clanker/Doppler to Snapshot/Tally/Aragon — governance infrastructure with economic teeth.

**What's gone from EmMittr brief:**
- Emmissions, decay curves, three Work classes
- Three-tier integration story (default/custom/autonomous)
- "Growth engine for token economies" positioning
- Clanker/Doppler/Virtuals/Bittensor competitive comparisons

**Output:** Capacitr_Brief_v0.1.0.docx + capacitr_brief.js

---

## Artifacts in This Package

| File | Description |
|------|-------------|
| EmMittr_Whitepaper_v0.0.20.docx | Latest whitepaper with Q&A overhaul + Appendix B |
| emmittr_whitepaper_v6.js | Whitepaper generator script |
| EmMittr_CHANGELOG.md | Whitepaper changelog through v0.0.20 |
| Capacitr_Brief_v0.1.0.docx | New 2-page brief for governance-first positioning |
| capacitr_brief.js | Brief generator script |
| capacitor-sim.tar.gz | Next.js deliberation simulator app |
| session-transcript.md | This file |

---

## Key Design Decisions

1. **Governance is the product, not token launch.** Everything else is substrate.
2. **Flat-rate discharge** replaces locked anode. Nobody buys a token they can't get out of.
3. **All economics denominated in project token**, not ETH. Agents accumulate the token they believe in.
4. **40% fee pool → deliberation pool** instead of emmission pool. Passive ownership becomes active governance.
5. **Bonding curve entry** solves cold-start. Early governance entry is nearly free.
6. **Graduation = governance activity target**, not market cap target.
7. **Competitive set = Snapshot/Tally/Aragon**, not Clanker/Doppler.
8. **The Clanker parallel preserved** but inverted: agents snipe governance opportunities by evaluating project track records, not creator meme potential.

## Open Questions

- Does the emmission layer survive at all, even as plumbing? Or is the entire economic loop "buy token → enter capacitor → earn from governance"?
- Split between bonding curve ETH going to project treasury vs graduation reserve?
- How does the simulator model multi-round reputation effects?
- Whitepaper needs full rewrite for Capacitr — current v0.0.20 is still EmMittr-framed
