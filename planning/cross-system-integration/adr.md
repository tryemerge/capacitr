---
title: "ADR v1: Cross-System Integration — Emitter ↔ Capacitor"
date: 2026-03-01
status: proposed
---

# ADR v1: Cross-System Integration — Emitter ↔ Capacitor

## Y-Statement

In the context of **the Capacitor Stack where the Emitter (launchpad) and Capacitor (governance) are separate simulation engines that model different parts of the same economic system**,
facing **the need to demonstrate the full economic loop where emissions fund governance participation and governance outcomes influence emitter rewards — the core thesis of "governance that pays for itself"**,
we decided for **a bridge module that connects completed Emitter and Capacitor simulations through shared economic state, running as a third combined simulation mode**
and against **merging the two engines into one monolithic simulator, real-time bidirectional coupling during simulation, and a purely narrative/static connection**,
to achieve **a demonstrable end-to-end economic loop where users can see emitter emissions flowing into governance participation and governance quality feeding back into emitter health**,
accepting **that the integration is a simulation approximation (not a smart contract implementation) and both individual simulators must be proven independently first**,
because **investors need to see the full loop working — not just "the launchpad works" and "governance works" separately, but "the launchpad funds governance and governance makes the launchpad better," which is the entire value proposition of the Capacitor Stack**.

## Context

The Capacitor Stack's thesis is that four systems (Emitter → Capacitor → Facilitator → Executor) create a self-funding governance loop. Stages 1-3 built the Emitter simulation (bonding curve, decay emissions, auto-compounding LP pool). The existing deliberation sim models Capacitor governance (cathode/anode AMM, speaking/voting pools, deliberation settlement).

These run independently:
- **Emitter** ([emitter.ts](apps/sim/src/lib/emitter.ts)): Models launchpad economics — trading, emissions for Work, fee splitting, LP compounding
- **Capacitor** ([simulation.ts](apps/sim/src/lib/simulation.ts), [amm.ts](apps/sim/src/lib/amm.ts)): Models governance economics — cathode/anode bonding curve, deliberation lifecycle, speaking/voting pools, settlement rewards

The missing link is: **how do emissions from the Emitter become governance participation in the Capacitor, and how do governance outcomes affect the Emitter's health?**

In the whitepaper, the connection is:
1. emTokens (earned by doing Work in the Emitter) can be used to buy cathode (entry to governance)
2. Good governance outcomes increase token price → more trading volume → more fees → more emissions → more governance funding
3. Bad governance outcomes decrease token price → less volume → system contracts

Neither sim currently models this connection.

## Decision

### Bridge module architecture

Create a `bridge.ts` module that:

1. **Takes a completed Emitter state and a Capacitor config** as inputs
2. **Converts emitter economics into capacitor inputs**: emToken holders become governance participants, emission pool value determines governance pool sizes, trading volume drives deliberation funding
3. **Runs a combined simulation** where each round steps both engines and transfers value between them
4. **Tracks cross-system metrics**: emission-to-governance conversion rate, governance feedback on token price, self-funding ratio (does governance fee income exceed governance cost?)

### Economic bridge rules

- **Emission → Governance**: Each emission creates emTokens. A configurable percentage of emToken holders convert their emTokens into cathode (governance entry). The conversion uses the bonding curve price at that round.
- **Volume → Deliberation funding**: A share of Emitter trading fees (the 40% emission pool allocation) funds governance bounties. When the pool reaches a threshold, a deliberation can open.
- **Governance outcome → Token price**: Successful deliberations (high participation, multiple speakers) create a positive signal that increases buy probability for non-adversarial agents. Failed deliberations (single speaker, low turnout) create sell pressure.
- **Feedback loop metric**: The "self-funding ratio" — does the governance system generate enough positive price impact to fund its own operation through increased trading fees?

### Combined simulation UI

A new route (`/integrated` or `/combined`) that:
- Lets users configure both Emitter and Capacitor parameters
- Runs the combined simulation showing both systems side-by-side
- Highlights the cross-system flows with a Sankey-style or flow diagram
- Shows the self-funding ratio as the key metric

### Sequencing

This work only begins after both individual simulators are independently validated:
- Emitter sim (Stages 1-3): complete
- Adversarial analysis (Stage 4): should be complete first so we know the governance economics hold under attack before connecting them to the emitter

## Alternatives Considered

### Merge into one monolithic simulator

Combine `emitter.ts` and `simulation.ts` into a single engine. Rejected because: the individual engines are well-tested and modular; merging creates a massive codebase that's harder to maintain; users lose the ability to explore each system independently; and the individual sims are valuable demo tools on their own.

### Real-time bidirectional coupling

Have each round of one sim immediately affect the other in both directions. Rejected because: the two engines operate on different time scales (emitter rounds represent trading sessions, capacitor rounds represent governance cycles); tight coupling creates complex feedback loops that are hard to debug; and the approximation of bridge-level transfers between rounds is sufficient for demonstration purposes.

### Static/narrative connection only

Document the connection in the whitepaper and walkthrough but don't simulate it. Rejected because: the whole point of building simulations is to prove the math works — a narrative connection says "this should work" while a simulation says "here's what happens when it does."

## Consequences

### Positive
- Demonstrates the complete economic loop — the core thesis — with actual numbers
- "Self-funding ratio" metric gives investors a concrete answer to "does this actually pay for itself?"
- Users can tune parameters across both systems and see cascading effects
- Validates or invalidates the reflexive signal thesis (good governance → more volume → more governance funding)

### Negative
- The bridge introduces approximations (e.g., "governance quality" → "price impact" is a model, not a measurement)
- Combined simulation is more complex to configure and understand than either individual sim
- Cross-system bugs are harder to isolate than bugs in individual engines

### Risks
- The integration could show the system doesn't self-fund under realistic parameters. This is actually a positive outcome (better to know in simulation than in production) but requires honest presentation rather than parameter-tuning to force a positive result.
- Time scale mismatch between emitter rounds and governance cycles may require significant abstraction. Mitigated by making the round-mapping configurable (e.g., 1 governance cycle = 10 emitter rounds).
- Scope creep: the bridge could grow to model Facilitator and Executor economics too. Explicitly out of scope — this ADR covers only Emitter ↔ Capacitor.

## References

- [emitter.ts](apps/sim/src/lib/emitter.ts) — Emitter engine (Stages 1-3)
- [simulation.ts](apps/sim/src/lib/simulation.ts) — Deliberation engine
- [amm.ts](apps/sim/src/lib/amm.ts) — Cathode/anode dual AMM
- [Adversarial Analysis](/notes/adversarial-analysis) — Attack vectors that the integrated system must handle
- [Capacitor Brief v0.3.0](/brief/) — "Governance that pays for itself" thesis
- [Whitepaper](/whitepaper/) — Full economic model description
- Stage 5 of the [multistage plan](/.claude/plans/abstract-cuddling-fairy.md)
