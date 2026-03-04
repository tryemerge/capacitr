---
title: "V0 Prompt Pack"
version: 0.2
date: 2026-03-04
status: archived
superseded_by: /ux/v0-prompt-pack
supersedes: /ux/versions/v0-prompt-pack-v0-1
outline: [2, 3]
---

# Capacitor UX Prompt Pack

**Version:** v0.2  
**Date:** 2026-03-04  
**Status:** Archived snapshot

## 1) Purpose

Provide copy-paste prompts to generate first-vision UI concepts in v0 for:

1. Marketplace-first product surface
2. Marketing-first narrative surface
3. Mobile-first discovery and command surface
4. Launchpad-first project creation flow

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

## 4) Launchpad Flow Requirement (Must Be Present)

Every generated UI concept should include a clear multi-step launchpad flow where a user can create a project card from scratch.

Required steps:

1. **Idea Intake**: project concept, category, one-line pitch
2. **Preset Configuration**: choose preset profile for token, reward, and task defaults
3. **Context Repository Builder**: add goals, constraints, verification rules, allowed sources
4. **Project Card Composer**: auto-generate Work + Investment card faces from configured inputs
5. **Deploy + Share**: launch project and generate share/distribution links

This flow is the bridge between launchpad and marketplace.

## 5) Prompt A — Marketplace-First (Desktop Core)

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
- Global command/chat bar ("Ask Capacitor...")
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

## 6) Prompt B — Marketing-First (Narrative Landing)

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

## 7) Prompt C — Mobile-First (Discovery + Command)

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

## 8) Prompt D — Launchpad-First (Project Card Creation System)

```md
Design the Capacitor Launchpad as a multi-step builder that turns an idea into a live project card in the marketplace.

Primary objective:
Make project creation feel fast, guided, and high-signal for both builders and observers.

Flow requirements:
1. Idea Intake
   - project name, short thesis, category, target audience
2. Preset Configuration
   - choose profile (Consumer App, Agent Tool, Marketplace, Community)
   - auto-fill token/reward/task defaults with editable advanced settings
3. Context Repository Builder
   - upload docs
   - define project goals
   - define task verification criteria
   - define policy/constraint rules
4. Project Card Composer
   - generate Work and Investment card faces from entered data
   - allow quick edits to card labels and priority metrics
   - preview in grid with other marketplace cards
5. Deploy + Share
   - final preflight checklist
   - launch transaction confirmation
   - generate share links and embeddable card snippet

UX constraints:
- Show step progress clearly
- Keep default path short; hide complexity under advanced toggles
- Keep data model explicit for future agentic/programmatic creation

Visual constraints:
- Same marketplace card style language
- Circuit-board accents and CAPACITR identity cues
- Professional product feel, not gamified toy UI

Output requirements:
- Desktop and mobile launch flow mockups
- Reusable component structure
- Realistic placeholder copy and metrics
```

## 9) Component Evaluation Checklist (For Reviewing v0 Outputs)

Use this checklist to compare generated variants quickly.

| Category | Check | Pass/Fail |
|---|---|---|
| Product accuracy | AMM-linked exposure is correctly described | |
| Product accuracy | No equity-ownership misstatement | |
| Launchpad clarity | Idea -> Presets -> Context -> Card -> Deploy -> Share flow is present | |
| Launchpad usability | Stepper, defaults, and advanced settings are understandable | |
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

## 10) Recommended Workflow

1. Generate Prompt D first to lock launchpad structure.
2. Generate Prompt A to lock marketplace density and card behavior.
3. Generate Prompt B for investor-facing narrative polish.
4. Generate Prompt C for mobile adaptation.
5. Score all outputs with the checklist.
6. Merge best patterns into one direction and export to Figma.
