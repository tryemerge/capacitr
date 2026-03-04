---
title: "V0 Prompt Pack"
version: 0.1
date: 2026-03-03
status: archived
superseded_by: /ux/v0-prompt-pack
outline: [2, 3]
---

# Capacitor UX Prompt Pack

**Version:** v0.1  
**Date:** 2026-03-03  
**Status:** Archived snapshot

## 1) Purpose

Provide copy-paste prompts to generate first-vision UI concepts in v0 for:

1. Marketplace-first product surface
2. Marketing-first narrative surface
3. Mobile-first discovery and command surface

These prompts are for direction-setting and promotion, not final production UX.

## 2) Product Truths (Must Preserve)

- Projects launch tokens and publish measurable tasks.
- Agents/humans complete tasks and earn derivative rewards.
- Rewards provide AMM-linked exposure:
  - project-token performance
  - trading-fee accrual
- This is not equity ownership; it is fee-linked market exposure.
- Activity and investment should reinforce each other in visible, measurable ways.

## 3) Shared Art Direction

- Mood: massive multiplayer strategy market.
- Visual influence: modern card-tournament energy (Magic-like intensity), without skeuomorphic fantasy UI.
- Look: institutional + technical + energetic.
- Motif: CAPACITR and subtle circuit-board traces/nodes.
- Palette suggestion: dark graphite base + electric cyan + amber + signal green.
- Avoid generic purple gradients and toy-like game visuals.

## 4) Prompt A — Marketplace-First (Desktop Core)

```md
Build a polished web app UI concept for Capacitor: a marketplace where projects, agents, and investors meet.

Primary goal:
Design a dense, high-signal "Marketplace Command Center" where users can scan many opportunities quickly.

Core model to represent:
- Projects launch tokens.
- Projects post measurable tasks.
- Contributors complete tasks and earn derivative rewards.
- Rewards are AMM-linked exposure (token performance + fee accrual), not equity claims.

Experience direction:
- Massive multiplayer strategy market vibe.
- Modernized trading-card tournament energy; not skeuomorphic.
- Circuit-board visual motifs integrated subtly.

Required layout:
- Top nav (brand, role toggle: Investor/Project/Agent, wallet/profile)
- Global command/chat bar ("Ask Capacitor…")
- Left filter rail
- Main card grid area
- Right insights rail (top movers, fee leaders, trending tasks)

Card system:
1. Project Card with dual-state view (flip or tab):
   - Work view: verified completions, active agents, task spend, completion velocity, rejection rate
   - Investment view: market cap, 24h volume, fee generation, liquidity depth, lock profile
2. Task Card:
   - reward, lock duration, verification type, success/rejection rate, participant count, status
3. Agent Card:
   - reliability score, specialization tags, success rate, payout efficiency

Interactions:
- Fast filtering/sorting
- Compare mode for selected cards
- Card quick actions (watch, compare, open)
- Smooth but restrained motion

Tech constraints:
- Next.js + React + TypeScript + Tailwind
- Reusable components
- Mock realistic data
- Desktop and mobile responsive
- Accessibility (AA contrast, keyboard focus, semantic labels)
```

## 5) Prompt B — Marketing-First (Narrative Landing)

```md
Create a marketing-forward homepage for Capacitor that still feels product-real.

Messaging priorities:
1. Where useful activity earns market exposure
2. Activity informs investment, investment informs activity
3. Launchpad + marketplace + measurable outcomes in one system

Visual direction:
- Premium, technical, high-energy
- CAPACITR branding and circuit motifs
- Minimal but meaningful animation

Required sections:
- Hero with primary value proposition
- "How it works" in 4-5 steps
- Why different vs pump.fun and Clanker
- Marketplace preview with project/task cards
- Metrics strip (volume, fees, verified completions, active agents)
- CTA block (Launch Project / Explore Marketplace)

Product accuracy constraints:
- Use explicit AMM-linked derivative exposure language
- Avoid saying users receive equity ownership

Output quality:
- Should look investor-demo ready
- Should include reusable components that can be brought into product UI
```

## 6) Prompt C — Mobile-First (Discovery + Command)

```md
Design a mobile-first Capacitor experience focused on discovery and action.

Core use case:
A user (agent operator, contributor, or investor) opens the app, scans live opportunities, and acts quickly.

Mobile IA:
- Bottom nav: Home, Market, Tasks, Watchlist, Profile
- Sticky command input: "Ask Capacitor"
- Card feed with segmented toggles for Work vs Investment views
- Saved filters and watchlist support

Cards on mobile:
- Project cards with compact metrics and expandable detail
- Task cards optimized for quick claim/skip decisions
- Agent cards for ranking and trust context

Interaction rules:
- No heavy flip animations on small screens; use tabs/toggles where needed
- Prioritize scan speed and tap clarity
- Strong visual hierarchy for reward/lock/verification metrics

Visual direction:
- Same CAPACITR design language as desktop
- Clean market terminal feel with modern card accents
```

## 7) Component Evaluation Checklist (For Reviewing v0 Outputs)

Use this checklist to compare generated variants quickly.

| Category | Check | Pass/Fail |
|---|---|---|
| Product accuracy | AMM-linked exposure is correctly described | |
| Product accuracy | No equity-ownership misstatement | |
| Marketplace utility | Project/task cards are scannable at density | |
| Marketplace utility | Filtering/sorting/compare actions are clear | |
| Investor readability | Fee/volume/liquidity signal is visible | |
| Agent usability | Reward/lock/verification data is obvious | |
| Visual identity | CAPACITR/circuit language is present but subtle | |
| Visual identity | Not skeuomorphic; not generic SaaS template | |
| Motion quality | Animation improves comprehension, not noise | |
| Responsiveness | Mobile layout preserves decision clarity | |
| Accessibility | Keyboard focus + contrast + readable type | |
| Reusability | Components can transition from marketing to product | |

## 8) Recommended Workflow

1. Generate all three prompts in v0.
2. Score each output with the checklist.
3. Merge the strongest patterns into one direction.
4. Export to Figma for component cleanup and systemization.
