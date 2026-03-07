---
title: Pitch Deck
version: "0.1.0"
date: 2026-03-06
subtitle: "Launchpad and Operating System for Agentic DAOs"
outline: [2, 2]
---

<style>
.pitch-slide {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.pitch-slide:last-child {
  border-bottom: none;
}
.pitch-slide h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
}
.pitch-slide blockquote {
  font-size: 1.2rem;
  border-left: 4px solid var(--vp-c-brand-1);
  padding-left: 1rem;
  margin: 1.5rem 0;
}
</style>

# Capacitr

<ExportButtons filename="Capacitr_Pitch_v0.1.0" />

<PptxExport filename="Capacitr_Pitch_v0.1.0" />

<div class="pitch-slide">

## Launchpad and Operating System for Agentic DAOs

> *The people who build a project should own more of it over time.*

A lucrative launch mechanic on day one. A modular operating system that scales with agent capability.

</div>

<div class="pitch-slide">

## The Problem

**DAOs don't build real businesses.** They govern treasuries, vote on proposals, and argue on forums --- but they haven't produced enterprises that create value the way a real company does. The organizational model is broken.

**Capital formation can't bootstrap what doesn't work.** Token launchpads proved massive demand --- pump.fun did billions, Clanker did $600M+. But money goes in, tokens come out, and nothing gets built. Even if you could make a DAO work, there's no capital formation layer designed to bootstrap one.

Two broken halves of the same problem.

</div>

<div class="pitch-slide">

## Work Is the Missing Piece

Every company is built by work. DAOs forgot this. Launchpads ignored it.

Capacitr puts work at the center of everything:

- **Work earns ownership** --- not votes, not points, not vibes. Real tokens backed by real fees.
- **Work funds itself** --- trading fees flow to a pool that backs work token value. More trading = more incentive to work.
- **Work builds the organization** --- each contribution makes the project more real, which attracts more capital, which funds more work.

The path from token launch to autonomous organization isn't a leap. It's a gradual escalation --- and work drives every step.

</div>

<div class="pitch-slide">

## The Escalation

### Step 1: Launch

Write an enterprise prompt. Deploy a token on a bonding curve. An orchestration agent spins up from your prompt to manage the project. That's it --- you have a funded project with an AI manager.

### Step 2: Bootstrap with Work

Contributors do real work --- tweeting, building, designing --- and earn wTkn backed by trading fees. The agent verifies and approves. The derivative pool grows with every trade.

### Step 3: Add Capabilities

Install modules to extend the project: governance, Farcaster incentives, commerce. Each module adds new ways to contribute and new ways to organize.

### Step 4: Graduate to Autonomy

The token graduates to a DEX. Governance modules let token holders manage the project --- adding modules, updating the enterprise prompt, directing the ecosystem pool. The DAO emerges from the work, not the other way around.

</div>

<div class="pitch-slide">

## The Enterprise Prompt

The prompt is the project's DNA. It defines what the project is, what work matters, and how the orchestration agent should behave.

- Stored off-chain (IPFS), on-chain `contextURI` pointer
- Updateable by the creator --- or by governance
- Evolves over time: capabilities, skills, brand guidelines, decision criteria

**The prompt creates the company. The company updates the prompt.**

</div>

<div class="pitch-slide">

## Modules

The core contracts handle the token, the curve, and the fees. Everything else is a **module** --- registered with the project to extend its capabilities.

| Module | What It Does |
|---|---|
| **Governance** | Proposal voting, parameter changes, module management |
| **Farcaster** | Auto-verified cast incentives |
| **Twitter** | Auto-verified tweet incentives |
| **Shopify** | Commerce integration, purchase verification |

The creator picks starter modules at launch. If they install a governance module, the community can vote to add or remove modules over time.

**The module registry is the project's operating system.**

</div>

<div class="pitch-slide">

## Two Types of Work

### Auto-Judged

Deterministic. A module defines what counts, verification is automatic, wTkn mints on approval.

*Tweet about the project. Cast on Farcaster. Make a purchase. No vote needed.*

### Proposal

Subjective. Stake tokens to submit. Two-stage vote:

- **Spam check (66%)** --- supermajority flags spam, stake is slashed
- **Approval (51%)** --- simple majority accepts, wTkn mints

Honest failures get their stake back. Noise gets expensive.

</div>

<div class="pitch-slide">

## Economics

**Every trade generates fees. 90% goes to the project. 10% to the protocol.**

Of the project's 90%:

| Pool | Source | Purpose |
|---|---|---|
| **Ecosystem Pool** | 50% in ETH | Operations, growth, project needs |
| **Derivative Pool** | 50% in project token | Backs wTkn value |

> **wTkn price = derivative pool value / total wTkn supply**

As trading continues, fees compound the pool, and wTkn appreciates. Early contributors earn more via a decay curve.

</div>

<div class="pitch-slide">

## The Flywheel

```
        Work improves the project
                |
        Quality drives confidence
                |
        Confidence drives trading
                |
        Trading generates fees
                |
        Fees compound the derivative pool
                |
        A growing pool makes wTkn more valuable
                |
        Valuable wTkn attracts more contributors
                |
                +---> (loop)
```

Work is at the center. Everything else follows from it.

</div>

<div class="pitch-slide">

## Day One and Day One Thousand

**Day one is lucrative.** The bonding curve launch mechanic works now --- it generates fees, funds work, and creates real economic activity from the first trade. This isn't a roadmap promise. It's a revenue-generating launch primitive.

**Day one thousand is massive.** Two exponential curves compound in our favor:

1. **Agent capability** --- agents get better every month. Work that requires human judgment today becomes auto-verifiable tomorrow. The system doesn't need to be redesigned --- new modules extend what counts as work, how it's recognized, and how decisions get made.

2. **Modular extensibility** --- we don't have to build every capability. Anyone can write a module. Every module added to the ecosystem expands what projects can do, which attracts more projects, which attracts more module builders.

The launch mechanic is the wedge. The module ecosystem is the moat. Agent capability is the tailwind.

</div>

<div class="pitch-slide">

## What We're Building

- Contracts: Diamond proxy with bonding curve, fee routing, module registry, wTkn minting --- **built**
- Agent layer: orchestration agent seeded from enterprise prompt --- **working**
- Launchpad UI: idea launch flow with module selection --- **in progress**
- Modules: governance, Farcaster, Twitter --- **designed, building**

We're raising to ship this to mainnet.

</div>

<div class="pitch-slide">

## Capacitr

> *The people who build a project should own more of it over time.*

A lucrative launch mechanic today. A pathway to truly autonomous organizations tomorrow. The bridge between them is work --- and every improvement in agent capability makes the system more powerful without changing a line of the protocol.

</div>
