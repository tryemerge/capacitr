---
title: Capacitor Brief
version: "0.6.0"
date: 2026-03-06
subtitle: "Launchpad and Operating System for Agentic DAOs"
lineage: "v0.5 -> v0.5.1 -> v0.6.0"
---

<ExportButtons filename="Capacitor_Brief_v0.6.0" />

# Capacitr

Launchpad and Operating System for Agentic DAOs

*The people who build a project should own more of it over time.*

## The Problem

Token launchpads proved the demand for permissionless capital formation. But capital without labor is just speculation. The people who grow a project --- content, code, distribution, strategy --- get nothing. Meanwhile, AI agents with wallets and inference capabilities have no marketplace for their intelligence. Capacitr connects ideas to both capital and labor.

## What Capacitr Is

Capacitr is an idea launchpad where anyone can turn a concept into a funded, agent-managed project. Write an enterprise prompt describing your idea. Deploy a token on a bonding curve. The platform spins up an orchestration agent seeded with your prompt to manage the project --- reviewing work, approving proposals, enforcing your vision. Contributors earn work tokens (wTkn) backed by real trading fees.

## The Enterprise Prompt

The enterprise prompt is the project's DNA. It defines what the project is, what work matters, and how the orchestration agent should behave. The prompt is stored off-chain (IPFS) with an on-chain `contextURI` pointer. It can be updated by the creator --- or by governance, if the project opts into a governance module. Updates publish as new versions; the agent refetches automatically.

The enterprise prompt can evolve over time: adding capabilities, skills, brand guidelines, and decision criteria as the project grows.

## Modules

Projects on Capacitr are composable. The core contracts handle token launch, bonding curve, fee routing, and wTkn minting. Everything else is a **module** --- a contract or service registered with the project that extends its capabilities.

The idea creator chooses initial modules at launch. Examples:

- **Governance module** --- proposal voting, parameter changes, module management
- **Farcaster module** --- auto-verified cast incentives
- **Twitter module** --- auto-verified tweet incentives
- **Shopify module** --- commerce integration and purchase verification

Modules are how projects bootstrap functionality. A creator who wants community governance installs a governance module. A creator who wants to incentivize social distribution installs a Farcaster module. The module registry is the project's operating system.

Critically, the governance module can itself manage the module registry --- allowing token holders to vote on adding or removing modules after launch. This makes the project's capability set a community decision, not just a founder decision.

## Two Types of Work

All work during the pre-graduation phase falls into two categories:

### Auto-Judged Work

Deterministically verifiable actions. A module defines what counts (e.g. "cast on Farcaster mentioning the project") and verification happens automatically --- no human vote required. Approved work mints wTkn to the contributor.

Examples: tweeting, Farcaster casts, referrals, purchases, API actions.

### Proposal Work

Subjective or complex contributions submitted as proposals. The proposer stakes Token or wTkn on their submission. Token holders vote in two stages:

1. **Spam check (66% supermajority)** --- is this proposal spam? If yes, the proposer loses their stake.
2. **Approval (simple majority)** --- should the work be accepted? Requires a minimum token holding threshold to vote.

Accepted proposals mint wTkn. Rejected (non-spam) proposals return the stake. This creates a cost for noise without punishing honest failed attempts.

The project name itself is the first proposal work --- chosen through this mechanism.

## Economics

### Fee Split

Every bonding curve trade generates fees. 90% flows to the project, 10% to the protocol.

Of the project's 90%:
- **50% in ETH** goes to the **ecosystem pool** --- funding operations, growth, and project needs
- **50% in the project token** goes to the **derivative pool** --- the reserve that backs wTkn value

### wTkn (Work Tokens)

wTkn represents earned ownership. It is minted when work is approved (auto-judged or proposal) and is pegged to the derivative pool:

> wTkn price = derivative pool value / total wTkn supply

As trading continues, fees compound the derivative pool, and wTkn appreciates. Early contributors earn more via a decay curve --- the first contributions mint more wTkn than later ones.

## Two-Phase Lifecycle

### Phase 1: Bonding Curve (Pre-Graduation)

The token trades on a pump.fun-style bonding curve. Trading fees build the derivative pool. Work is done, wTkn is minted, and the project takes shape --- all before any DEX listing.

During this phase:
- Auto-judged modules verify work and mint wTkn
- Proposals are submitted, staked, and voted on
- The orchestration agent manages the project via the enterprise prompt
- The derivative pool grows with every trade

### Phase 2: DEX (Post-Graduation)

When the bonding curve reaches a market cap threshold, the token graduates --- liquidity migrates to a DEX pool. wTkn is now backed by the accumulated derivative pool. Trading fees continue flowing through the same split. Modules can be added or removed via governance.

## The Flywheel

Work drives project quality. Quality drives investor confidence. Confidence drives trading volume. Volume generates fees. Fees compound the derivative pool. A growing pool makes wTkn more valuable. Valuable wTkn attracts more contributors. The loop runs itself.

*v0.6.0 --- March 2026 --- DRAFT*
