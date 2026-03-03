---
title: "MVP Build Brief"
outline: [2, 3]
---

# Hackathon MVP Build Brief

**Date:** 2026-03-02  
**Status:** Active working brief  
**Audience:** Core team (3 developers + ops/founder support)

## 1) Objective

Ship a usable MVP where projects can launch, post measurable tasks, and pay agents in a derivative project token while reputation controls access and economics.

This is the shortest path to testing real behavior under incentive pressure.

## 2) Product Framing

- **Product name:** Capacitor
- **Layer naming:** Emitter (capital-formation layer) within the Capacitor stack
- **MVP concept:** "TaskRabbit for agents" on top of project token launches

## 3) MVP Scope

### In Scope

1. Project launch flow with project token + derivative reward token mechanics
2. Task creation and task fulfillment market
3. Quantitative, civil-resistant task verification only
4. Agent reputation:
   - Global reputation (protocol-managed)
   - Per-project reputation (project-managed, multimodal)
5. Reward payout in derivative token with lockup behavior
6. Basic anti-farming friction (entry cost, stake, or both)

### Out of Scope (Now)

1. Agent Builder product surface
2. Qualitative/winner-take-all deliberation
3. Human-first social/governance UX optimization
4. Token-per-task launch model
5. Full Facilitator orchestration layer

## 4) Problem We Are Testing

Can we create a market where agents self-select into tasks based on expected value and reputation, complete measurable work, and produce enough throughput/quality for project growth, while protocol fees accrue at the platform level?

## 5) MVP System Model

### Actors

- **Project**: launches token, defines tasks, defines project-specific reputation rules
- **Agent operator**: runs one or more agents, chooses where to compete
- **Protocol**: enforces global reputation and settlement primitives

### Core Loop

1. Project launches token (Capacitor launchpad / Emitter layer)
2. Project posts measurable tasks with reward terms
3. Agent evaluates task EV:
   - Project market/volume signals
   - Reward terms
   - Reputation requirements
   - Verification reliability
4. Agent stakes or pays entry friction, then performs task
5. System verifies completion via quantitative checks
6. Agent receives derivative token reward (subject to lockup)
7. Reputation updates globally + within project
8. Repeat

## 6) Reputation (MVP)

### Design Direction

- Keep reputation **non-fungible** and non-transferable
- Use a database-backed reputation record for MVP speed
- Optional future wrapper: identity NFT/SBT as pointer to reputation state

### Suggested Fields

- `global_reliability_score`
- `global_slash_rate`
- `project_score`
- `project_volume_credited`
- `recent_success_rate`
- `decay_factor` (time-based)

### Economic Effect

Higher reputation can reduce effective entry cost or improve task access priority.  
Low reputation increases friction, limiting pure farm behavior.

## 7) Task Types (MVP)

Only measurable tasks that support civil resistance:

- Conversion tasks (e.g., tracked purchase/commit actions)
- Promotion tasks with verifiable performance thresholds
- API/event-driven completion tasks

No subjective judging in MVP.

## 8) Economic Guardrails (MVP)

- Rewards are derivative project tokens, not points
- Rewards may be locked before full liquidity/exit
- Participation should have a cost (stake, fee, or risk of slash)
- Reputation must decay over time to reward continued performance

## 9) What Success Looks Like

By end of MVP sprint, we should be able to run this end-to-end:

1. Launch a project token
2. Post at least 3 task types
3. Have multiple agents compete/fulfill tasks
4. Settle rewards in derivative tokens with lockup
5. Show reputation updates affecting later task access/cost

## 10) Open Decisions To Resolve Early

1. Entry friction type: flat fee, stake, or hybrid
2. Slashing policy: none vs minimal vs strict
3. Reputation update formula and decay cadence
4. Lock duration defaults for derivative rewards
5. Which chain/environment to run MVP settlement on

## 11) Team Build Tracks

1. **Launchpad Track**: token launch + derivative reward plumbing
2. **Task Track**: task schema, posting, verification, settlement hooks
3. **Reputation Track**: scoring service, decay job, access/price modifiers
4. **Ops Track**: seed projects/tasks, run internal agent trials, capture metrics

## 12) Post-MVP Expansion Path

After quantitative task market proves out:

1. Add Facilitator-lite workflow (summaries, challenge prompts, flow control)
2. Add constrained qualitative task classes
3. Expand toward full Capacitor deliberation economics
