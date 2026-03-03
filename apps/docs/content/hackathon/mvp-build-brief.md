---
title: "MVP Build Brief"
version: 0.2
date: 2026-03-03
status: active
supersedes: /hackathon/versions/mvp-build-brief-v0-1
outline: [2, 3]
---

# Hackathon MVP Build Brief

**Version:** v0.2  
**Date:** 2026-03-03  
**Status:** Active working brief  
**Audience:** Core team (3 developers + founder/ops support)

## 1) Objective

Ship a usable MVP where projects launch tokens, publish context packs, post measurable tasks, and pay agents in derivative rewards, while reputation and entry friction route incentives toward useful outcomes.

This MVP is designed to tighten scope while maximizing strategic impact.

## 2) Product Framing

- **Product name:** Capacitor
- **Layer naming:** Emitter (capital-formation layer) within the Capacitor stack
- **MVP concept:** Task marketplace for agents on top of project launch rails
- **Operating thesis:** reward verified outcomes, not raw effort
- **Access model:** bring your own agent or deploy a starter agent into the same market
- **Launch primitive:** context first, then task execution and measurement

## 3) Core Problem

Capacitor/Emitter can fund and distribute participation.  
The unresolved problem is quality selection.

In agent markets, effort is near-infinite. Without quality controls, the system overpays for noise. The MVP must prove we can route capital toward net-positive work.

## 4) Capability-Curve Principle

We are a small, fast team. We should ship robust primitives before deep mechanism complexity.

- Near-term: measurable rules, clear verification, operational reliability
- Later: stronger mechanism design and fragile-work governance

We do not position fragile-work governance as solved in MVP.

## 5) Work-Value Curve (New Framing)

| Work Class | Marginal Value vs Volume | Example | MVP Status |
|---|---|---|---|
| **Abundant Work** | More is usually better | purchases, installs, API actions | In scope |
| **Saturating Work** | Useful until duplication/noise dominates | promotion, referrals, social distribution | In scope (with reputation/signal filters) |
| **Fragile Work** | Too much participation can reduce quality | design selection, strategy, proposal judgment | Out of scope for MVP |

Incentives must match the work curve, not treat all work the same.

## 6) MVP Scope

### In Scope

1. Project launch flow with project token + derivative reward token mechanics
2. Task creation and fulfillment for quantitative, civil-resistant tasks
3. Reputation system with global protocol-level and per-project policies
4. Entry friction (fee/stake/hybrid) to reduce spam farming
5. Derivative reward lock behavior
6. v0 integration rails for external quality-signal/reputation providers
7. Context Repository v0 for project-uploaded context packs (required for launch)
8. Agent Access Layer v0 (BYO agent + starter agent deployment path)

### Out of Scope (Now)

1. Agent Builder product surface
2. Qualitative winner-take-all task settlement
3. Full Facilitator orchestration
4. Token-per-task launch model
5. Exclusive provider partnerships

## 7) System Model

### Actors

- **Project**: launches token, defines tasks, chooses reputation/signal policy, and publishes context packs
- **Agent operator**: runs one or more agents (BYO or starter) and allocates effort by expected value
- **Signal provider (optional)**: supplies quality scores/confidence for saturating work
- **Protocol**: enforces settlement, lock rules, and base reputation primitives

### Core Loop

1. Project launches token (Capacitor launchpad / Emitter layer)
2. Project publishes context pack `vN` (context repository)
3. Project posts measurable tasks referencing context pack `vN`
4. Agent enters via BYO connection or starter-agent deployment
5. Agent evaluates expected value using project market signals, reward terms, entry friction, context quality, and reputation/signal requirements
6. Agent performs task and submits proof
7. System verifies outcomes and settles derivative rewards
8. Reputation state updates (global + per-project)
9. Next task routing adapts to updated reputation/signal state

## 8) Reputation and Quality Routing

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
- `decay_factor`

### Economic Effects

- Higher trust can reduce entry cost or increase access priority
- Lower trust increases friction and lowers payout efficiency
- Decay forces ongoing performance, not one-time farming

## 9) Integration Partner Strategy (Build-on-Top Incentives)

We do not pick one reputation winner. We provide rails for many signal providers.

Signal-provider v0 contract shape:

- `score`
- `confidence`
- `reason_code`
- `source`

Design goals:

- non-exclusive integrations
- replaceable providers if one degrades or is gamed
- partner differentiation through measurable performance on our rails

This makes Capacitor the settlement layer where quality systems compete.

## 10) Context Repository and Agent Access (MVP)

### Context Repository v0

Projects can publish structured context packs to improve agent task performance:

- project description and goals
- task definitions and verification rules
- allowed data sources and constraints
- brand/policy guidance

MVP intent: close the context gap without requiring full agent-builder UX.
This is treated as a launch requirement, not an optional add-on.

### Context Pack role in the flow

- Context Pack is the operating contract between project, agents, and verifiers.
- Tasks must reference a specific context version before rewards can be settled.
- Context versions are immutable for auditability; updates publish as new versions.

### Agent Access Layer v0

- **BYO Agent**: connect an external agent/runtime to the task market
- **Starter Agent**: one-click baseline agent template for non-technical users

MVP intent: maximize market participation while keeping implementation thin.

## 11) Economic Messaging (Investor-Safe)

- Protocol economics come from a share of AMM trading fees
- We do not "take fees off everything"
- As derivative/emissions ownership compounds, ecosystem-aligned ownership grows and protocol dominance should not be the only long-term value source

## 12) Economic Guardrails (MVP)

- Rewards are derivative project tokens, not points
- Rewards may be locked before full liquidity/exit
- Participation should have a cost (stake, fee, or risk of slash)
- Reputation must decay over time to reward continued performance

## 13) What Success Looks Like

By end of MVP sprint, we should be able to run this end-to-end:

1. Launch a project token
2. Post at least 3 task types
3. Have multiple agents compete/fulfill tasks
4. Settle rewards in derivative tokens with lockup
5. Show reputation updates affecting later task access/cost
6. Integrate at least one external signal provider in v0 form
7. Show lower spam/noise at similar or higher task throughput
8. Have at least one project publish a usable context pack
9. Run both BYO and starter agents against the same task market

## 14) Open Decisions To Resolve Early

1. Entry friction type: flat fee, stake, or hybrid
2. Slashing policy: none vs minimal vs strict
3. Reputation update formula and decay cadence
4. Lock duration defaults for derivative rewards
5. Signal-provider weighting policy (single vs blended)
6. Context-pack schema and file size limits
7. Starter-agent template capabilities and safety limits
8. Which chain/environment to run MVP settlement on

## 15) Team Build Tracks

1. **Launchpad Track**: token launch + derivative reward plumbing
2. **Task Track**: task schema, posting, verification, settlement hooks
3. **Reputation Track**: scoring service, decay job, access/price modifiers
4. **Integration Track**: v0 provider adapter and score ingestion
5. **Agent Access + Context Track**: BYO connector, starter template, context-pack ingestion
6. **Ops Track**: seed projects/tasks, run internal agent trials, capture metrics

## 16) Team Collaboration Contract (Interfaces Over Implementations)

### What Is Fixed (Non-Negotiables)

1. Context-first launch: projects publish Context Pack(s) before task execution
2. MVP work focus: quantitative, civil-resistant tasks only
3. Agent access: BYO agent and starter-agent path both supported
4. Integration model: non-exclusive, replaceable quality-signal providers
5. Settlement model: rewards settle through Capacitor economics

### What Is Open (Design Space for Team Leads and Partners)

1. Best runtime pattern for agent instruction and skill execution
2. Best format for how agents ingest and apply Context Packs
3. Best machine-readable contract for third-party provider instructions
4. Best adapter model for OpenCLAUDE/OpenClaw-style skills tooling

### Requested Technical Outputs (MVP)

1. `Context Pack v0` schema and validation contract
2. `Agent Runtime Contract v0` (inputs, outputs, auth, error handling)
3. `Provider Instruction Contract v0` for third-party integrations
4. One end-to-end demo path: starter or BYO agent + context pack + measurable task + settlement

### Team Message

We are defining the rails, not prescribing your internals.  
Your team should shape the instruction and skills layer so best-in-class agent systems can plug in quickly and compete on outcomes.

## 17) Post-MVP Expansion Path

After quantitative task market proves out:

1. Expand saturating-work provider marketplace
2. Add facilitator-lite workflow (summaries, challenge prompts, flow control)
3. Add constrained fragile-work pilots
4. Expand toward full Capacitor deliberation economics
