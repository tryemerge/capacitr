---
title: Simulator — Expected Behavior & Page Inventory
date: 2026-03-02
status: active
---

# Simulator — Expected Behavior & Page Inventory

## What This Simulator Is For

The simulator exists to demonstrate that Capacitor's economic design works as intended — and to surface where it breaks. It is a research tool, not a product demo.

The long-term goal is a **single unified simulation** where:

1. A token launches on a bonding curve and agents start trading
2. Participants earn emissions through work
3. Qualitative work accumulates, triggering governance deliberations
4. Agents deliberate under economic pressure (buy anode → speak → vote → settle)
5. Adversarial behavior is visible and measurable throughout

Today this is split across multiple pages with different codebases, different data models, and no cross-system connection. This document catalogs what each page is, what it's supposed to do, and what needs to happen to make the whole thing coherent.

---

## Page Inventory

### Governance section

#### `/` — Simulator (legacy)

**Current state:** A static calculator using `simulation-legacy.ts`. Runs immediately on page load from preset configs. Shows pool P&L for a fixed set of agents. No lifecycle, no AMM math, no deliberation rounds.

**Intended purpose:** Was the original proof-of-concept for deliberation economics. Shows whether the speaking/voting reward structure produces positive expected value for honest participants.

**Problem:** It uses a completely different codebase (`simulation-legacy.ts`, `presets.ts`) than everything else. The math is hardcoded, not connected to the dual-AMM. Predates the proposal/deliberation lifecycle entirely.

**Verdict: Remove or archive.** The Walkthrough and Sim Runs pages cover this use case with real mechanics. The legacy sim adds cognitive noise without adding information.

---

#### `/walkthrough` — Governance Walkthrough

**Current state:** A 4-phase step-by-step story (intro → entry → deliberation → settlement). Uses `walkthrough.ts` to build scripted steps with agent states. Interactive step-through with explanatory text, flow diagrams, and agent P&L.

**Intended purpose:** Explain the dual-AMM governance mechanism to a new visitor. Answer: "How does this actually work?" Walk through one deliberation from first principles — why agents buy anode, what it costs to speak, how settlement distributes rewards.

**Expected behavior:**
- A visitor who has never seen the system can follow it and understand the mechanics
- Each step shows one thing: entry, then a message, then voting, then settlement
- Numbers are concrete and consistent (same agents, same starting state)
- By the end, you can see clearly: who made money, who lost, why

**Problem:** Currently functional but isolated from the main simulation. The scripted state doesn't connect to anything.

**Verdict: Keep, but treat as a read-only explainer, not a sim.** It's doing its job — educational narrative. Don't add interactivity beyond what's already there.

---

#### `/amm` — AMM Sandbox

**Current state:** A manual interactive explorer for the dual-AMM pricing math. You can buy/sell cathode and anode, see price impact, adjust reserves, test fee rates. No agent lifecycle, no proposals, no deliberation. Runs in isolation.

**Intended purpose:** A scratchpad for understanding the AMM mechanics before building on them. "If I buy X anode at these reserves, what's the price impact? What happens when deliberation reserves reset?"

**Expected behavior:**
- Full manual control over both AMMs
- Instant price feedback as you adjust inputs
- Useful for checking: is the pricing function behaving correctly?
- Makes clear when deliberation AMM is active vs inactive

**Verdict: Keep as an isolated tool.** It does exactly what it should. It is explicitly NOT part of the main simulation loop — it's a sandbox to test one layer of the stack in isolation. Label it accordingly so it's not confusing.

---

#### `/runs` — Governance Sim Runs

**Current state:** The main agent-based simulation. Bot distribution (Whales, Builders, Activists, etc.), configurable AMM parameters, N-round simulation with a deliberation lifecycle (proposal threshold → deliberation opens → speak/vote → idle settle → discharge). Post-run analysis includes adversarial scenario analysis (free-rider, sybil, speaking equilibrium, death spiral).

**Intended purpose:** The primary research tool. Run a population of agents through N rounds of governance activity. See whether the economics produce healthy deliberation, what adversarial profiles can extract, whether the equilibrium holds under different parameter sets.

**Expected behavior:**
- Start with config: agent distribution, AMM params, rounds
- Watch live: prices, deliberation status, activity feed
- Fast-forward when needed
- After completion: analysis dashboard with price history, participation, deliberation outcomes, adversarial risk scores
- Save runs, compare parameter sets
- FreeRider and SybilOperator available in the bot distribution at count=0

**Current gaps:**
- No way to see inside a specific deliberation after the run (who voted for whom, what proposals said)
- No cross-run comparison (run A vs run B under different params)
- FreeRider and SybilOperator profiles need manual testing to confirm they behave as expected

**Verdict: This is the core sim. All energy should go here.**

---

#### `/deliberate` — Facilitator (AI Deliberation)

**Current state:** A live viewer for the `@capacitr/facilitator` pipeline. Posts a topic to `/api/deliberate`, receives a stream of `PipelineEvent`s (claims extracted, research results, positions formed, decision menu), and displays them in a chat-like UI. Looks like a Discord channel showing AI agent activity.

**Intended purpose:** Demonstrate that the governance deliberation can be run by AI agents, not just simulated bots. The facilitator extracts claims, researches them, identifies positions, and produces a structured decision menu. This is the "qualitative work evaluation" layer described in the whitepaper.

**Why it looks like a Discord clone:** It IS a chat/pipeline viewer. The deliberation happens via Claude agents; the UI just displays the stream of events as they come in. The problem is that it's disconnected from the economics — there's no anode being bought, no speaking pool, no settlement. It's a proof-of-concept for the AI reasoning layer, not the economics.

**What it's supposed to show:** Given a proposal topic, AI agents can structure a deliberation into claims, research findings, positions, and a ranked decision menu — automatically. The economic layer would then reward the best claims at settlement.

**The missing connection:** The facilitator does the *reasoning* part. The sim does the *economics* part. They've never been connected. A unified simulation would pipe facilitator output into the deliberation lifecycle (claims become speak events, positions become votes, the economic settlement happens after the AI deliberation closes).

**Verdict: Keep but clearly label it as "AI Reasoning Layer" not "Governance Sim."** It's a demonstration of one component, not the whole system. The long-term plan is to connect it to `/runs` so AI agents can participate in deliberations alongside scripted bots.

---

### Launchpad section

#### `/emitter/walkthrough` — Launchpad Walkthrough

**Current state:** A 6-phase step-by-step story (launch → trade → work → compound → growth → outcome). Uses `EmitterState` from `emitter.ts`. Shows bonding curve pricing, how emissions work, how the pool compounds, and final outcome.

**Intended purpose:** Explain the launchpad economics to a new visitor. Same role as the Governance walkthrough but for the capital formation layer.

**Expected behavior:**
- New visitor can follow: token launches → trading sets price → work earns emissions → pool compounds → community owns more over time
- Each step is concrete with real numbers
- The "outcome" step makes the ownership accumulation effect visible

**Verdict: Keep as explainer.** Same role as Governance Walkthrough.

---

#### `/emitter` — Launchpad Setup

**Current state:** An interactive parameter explorer for bonding curve + emissions math. Adjust config, see live charts of token price curves, emission decay, pool value projections.

**Intended purpose:** Understand the parameter space before running a simulation. "What does K=0.002 mean for emission distribution? How does the pool grow at different fee rates?"

**Expected behavior:**
- Adjust any config parameter and see the impact immediately
- Shows: price curve shape, decay curve, pool value projection, reserve depletion estimate
- Not a simulation — no agents, no time steps, just math visualization

**Verdict: Keep as isolated parameter explorer.**

---

#### `/emitter/runs` — Launchpad Sim Runs

**Current state:** Agent-based simulation of launchpad activity. Agents trade, do work, earn emissions. Shows pool growth, emission distribution, token price over time.

**Intended purpose:** Same role as Governance Sim Runs but for the capital formation layer. Run many agents through N rounds of trading and work. See whether the compounding pool actually grows, whether early contributors beat late ones, whether wash trading is self-defeating.

**Verdict: This is the launchpad counterpart to `/runs`. Both should eventually converge into one unified sim.**

---

## The Unified Simulation — What It Should Look Like

The goal is one simulation that shows the full Capacitor loop:

```
Round 1–N:  Agents buy token on bonding curve
            Trading fees split: 40% emissions pool, 50% creator, 10% protocol
            Agents do Work → earn emissions (decay curve)

Round M:    A qualitative work submission triggers a proposal
            Proposal reaches threshold → Deliberation opens
            Agents buy anode (incentivized by bounty)
            Agents speak, vote for speakers
            [Optional: AI agents deliberate via facilitator pipeline]
            Idle period → Settlement
            Winner earns; non-winners discharge anode to cathode with fee
            Emissions pool compounds from all trading activity

End:        Who owns what? Was free-riding profitable?
            Did the coordination layer produce good decisions?
```

This is the simulation that needs to exist. Right now:
- The launchpad and governance simulations are separate codebases with separate state
- The AI deliberation layer has no economic connection
- There's no single "watch the whole thing run" experience

**Building the unified sim is the next big milestone.** The adversarial analysis we built in `/runs` is the right foundation — it's measuring the governance economics correctly. The launchpad economics in `/emitter/runs` need to be the funding mechanism that makes deliberation worth participating in.

---

## Summary Table

| Page | Section | Purpose | Current State | Action |
|------|---------|---------|--------------|--------|
| `/` | Governance | Legacy calculator | Disconnected, uses old codebase | **Archive** |
| `/walkthrough` | Governance | Explainer: how deliberation works | Working, narrative is good | **Keep as-is** |
| `/amm` | Governance | AMM math sandbox | Isolated, working correctly | **Keep, label as isolated tool** |
| `/runs` | Governance | Main agent sim + analysis | Feature complete, adversarial analysis added | **Primary focus** |
| `/deliberate` | Governance | AI reasoning layer demo | Working, no economic connection | **Keep, label clearly, connect later** |
| `/emitter/walkthrough` | Launchpad | Explainer: how launchpad works | Working, narrative is good | **Keep as-is** |
| `/emitter` | Launchpad | Parameter explorer | Working | **Keep** |
| `/emitter/runs` | Launchpad | Launchpad agent sim | Working | **Will merge into unified sim** |

---

## What "Working" Means for Each Page

These are the behaviors to verify before considering a page correct:

### `/runs` (primary target)
- [ ] Default run completes 200 rounds without errors
- [ ] At least one deliberation settles per run (if enough agents and rounds)
- [ ] Adversarial analysis panel appears after a run with settled deliberations
- [ ] FreeRider agents never speak or vote
- [ ] SybilOperator agents dominate deliberation vote counts when present
- [ ] Free-rider ROI is > 1.0 with default config (early anode is cheap relative to discharge)
- [ ] Sybil ROI scales with number of personas added
- [ ] Saved runs load and display correctly
- [ ] AMM Sandbox `/amm` is unaffected by any changes to simulation lifecycle

### `/deliberate` (secondary)
- [ ] Posting a topic initiates a deliberation pipeline
- [ ] Claims, research, positions, and decision menu all appear
- [ ] The deliberation produces a clear ranked decision output
- [ ] Error states are handled (API timeout, no Claude key)

### `/emitter/runs` (launchpad counterpart)
- [ ] Agents buy tokens on bonding curve over N rounds
- [ ] Work emissions accumulate and decay correctly
- [ ] Pool value grows monotonically with trading volume
- [ ] Early workers hold more value than late workers at end of run
