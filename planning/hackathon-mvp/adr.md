---
title: "Capacitr Hackathon MVP — Idea Launchpad"
date: 2026-03-04
status: accepted
---

# Capacitr Hackathon MVP — Idea Launchpad

## Y-Statement

In the context of **building the Capacitr Idea Launchpad for a hackathon demo**,
facing **limited time and the need to prove the core loop (launch → work → earn → trade)**,
we decided for **a focused MVP covering the launch process only (bonding curve, work attestation, snap polls, rolodex) with mock-first contract integration**
and against **building the full lifecycle including post-graduation governance, reserve pool emissions, Work SDK, and platform-spun agents**,
to achieve **a working demo where creators launch ideas, workers register and submit work, the community validates via snap polls, and tokens trade on a bonding curve**,
accepting **no post-graduation features, no third-party integrations, and contracts built separately by dedicated devs**,
because **proving the core loop is the single most important thing — everything else is an expansion on it**.

## Context

The co-founder's v0.5 brief defines a two-phase token lifecycle (bonding curve → graduation → DEX trading). The previous planning docs (hackathon/todo.md, hackathon/mvp-scope.md) scoped too broadly — 4 tracks, 10 priority items, post-graduation governance. For the hackathon, we need to ship the launch process end-to-end. Pump.fun is the competitive reference.

The existing codebase has:
- Next.js simulator app (`apps/sim/`) with governance and emitter simulation UIs
- Database layer (`packages/database/`) with Drizzle ORM, Better Auth tables, simulation data
- Facilitator agent (`packages/facilitator/`) using Claude Agent SDK
- VitePress docs (`apps/docs/`)

No smart contracts, web3 libraries, or blockchain integration exist yet.

## Decision

### What We're Building

**The launch process**: a place to buy the token, register for work, and see everyone there with you.

1. **Contract specifications** (interfaces for devs to implement separately — not Solidity in this repo)
   - Bonding Curve AMM (PumpFun-style, 2% fee, 40/50/10 split)
   - Derivative Token (wToken ERC-20, 14-day lock on mint)
   - Work Token Pool (accumulates 40% of fees)
   - Work Submission Registry (on-chain proof recording)
   - Snap Poll (quadratic voting, 1 wToken OR 200 project tokens)
   - Graduation (market cap threshold → Uniswap migration → wToken bonding)

2. **New app** (`apps/launchpad/`) — separate Next.js app, keeps `apps/sim/` untouched
   - Rolodex landing page (projects, agents, investors with metric cards)
   - Project launch flow (system prompt, K value, token settings)
   - Token buy/sell UI on bonding curve
   - Agent/worker registration with "builder codes"
   - Referral codes (Twitter share → 1 wToken per purchase)
   - Arbitrary work attestation (proof + token ask + supporting assets)
   - Snap poll voting UI
   - Agent + project configuration (system prompts, thresholds)
   - Worker dashboard (earnings, wToken balances, lock timers)

3. **Mock-first strategy** — app works fully without deployed contracts, copying bonding curve math from `apps/sim/src/lib/emitter.ts`. Real contract integration is Phase 7.

### What's Out of Scope

- Post-graduation governance (quadratic voting with 1.5x wToken weight)
- Post-graduation work rewards / reserve pool emissions
- Work SDK for third-party signal providers
- Platform-spun agents
- Context packs
- Multi-chain support
- CCA (Continuous Clearing Auctions) — parked
- Three-phase launch (bonding curve → fundraising → AMM) — parked

## Alternatives Considered

### Full Lifecycle MVP
Build through graduation and post-graduation governance in one shot. Rejected because it's too much scope for a hackathon — proving the launch loop is sufficient.

### Contracts in This Repo (Foundry/Hardhat)
Set up a `packages/contracts/` with Solidity tooling. Rejected because this is a docs/sim repo — contract devs will set up their own environment. We provide specs, they provide code.

### Skip Mock Mode
Wait for contracts before building the frontend. Rejected because it blocks frontend development entirely. Mock mode using existing `emitter.ts` math lets us build and demo the full UI flow immediately.

## Consequences

### Positive
- Focused scope ships faster
- Mock-first means frontend and contract work happen in parallel
- Contract specs serve as clear handoff documentation for devs
- Existing simulator app (`apps/sim/`) untouched — no risk of breaking it

### Negative
- No real on-chain transactions in the demo without contracts
- Dual auth model (Better Auth + wallet) adds complexity
- 7 new database tables is significant schema growth

### Risks
- Contract devs may need spec revisions once they start building — mitigated by keeping specs interface-level (functions + events, not implementation)
- Mock mode may diverge from real contract behavior — mitigated by using the same bonding curve math from `emitter.ts`

## References

- [Capacitr Brief v0.5.1](../../apps/docs/content/brief/index.md)
- [Previous MVP Scope](../hackathon/mvp-scope.md)
- [Previous Hackathon Todo](../hackathon/todo.md)
- [System Diagrams](../hackathon/system-diagrams.md)
- [Requirements Doc](../hackathon/requirements.md)
