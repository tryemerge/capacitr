---
title: "ADR v1: Adversarial Analysis Enhancements for Deliberation Sim"
date: 2026-03-01
status: proposed
---

# ADR v1: Adversarial Analysis Enhancements for Deliberation Sim

## Y-Statement

In the context of **the Capacitor deliberation simulator and its governance economics**,
facing **documented attack vectors (free-riding, sybil attacks, speaking equilibrium collapse, death spirals) that could undermine the entire governance model if left unquantified**,
we decided for **post-hoc adversarial analysis functions that run against completed simulation data, plus two new adversarial agent profiles (FreeRider, SybilOperator) integrated into the existing simulation engine**
and against **a separate adversarial simulation mode, pre-built adversarial scenarios as presets only, and formal verification approaches**,
to achieve **quantified answers to "is this attack profitable?" for each documented threat, directly within the existing sim runner UI**,
accepting **that analysis is approximate (stochastic simulation, not formal proof) and adversarial profiles add complexity to the agent pool**,
because **the adversarial analysis document identifies specific attacks but provides no numbers — investors and the team need to see whether the economics actually hold under adversarial conditions, using the same simulation infrastructure already proven in Stages 1-3**.

## Context

The [adversarial analysis document](/notes/adversarial-analysis) catalogs attack vectors against the Capacitor governance system:

- **Free-rider**: Enter early (cheap anode), do nothing, collect flat discharge at profit because anode cost < discharge rate
- **Sybil deliberation**: Multiple coordinated personas — one speaks the "winning" argument, all others vote for it, capturing both speaking and voting pools
- **Speaking equilibrium collapse**: Winner-take-all speaking pool makes rational agents avoid speaking entirely, degenerating to a single speaker rubber stamp
- **Death spiral**: One bad deliberation → token drops → smaller pools → fewer agents → worse decisions → further decline

The existing deliberation sim ([simulation.ts](apps/sim/src/lib/simulation.ts)) already models the full lifecycle — buy cathode/anode, speak, vote, settle deliberations — with 8 agent profiles (Whale, Builder, Activist, Voter, Lurker, Speculator, Debater, Late Entrant). But it has no mechanism to quantify whether these attacks are actually profitable under given parameters.

The sim runner ([SimulationRuns.tsx](apps/sim/src/components/SimulationRuns.tsx)) captures per-round snapshots and computes end-of-run summaries but has no adversarial analysis tab.

## Decision

### 1. Post-hoc analysis functions in `adversarial.ts`

Create a new library (`apps/sim/src/lib/adversarial.ts`) with four analysis functions, each taking completed simulation data (`SimulationState`, `RoundSnapshot[]`, `RunSummary`) and returning a standardized result:

```typescript
interface AdversarialResult {
  scenarioName: string;
  profitable: boolean;
  roi: number;           // return on investment as ratio (1.0 = break-even)
  riskLevel: "low" | "medium" | "high" | "critical";
  details: string;       // human-readable explanation
}
```

- `analyzeFreeRider()` — Simulates an agent entering at round 1, buying minimal anode, doing nothing, collecting flat discharge. Compares discharge received vs anode cost.
- `analyzeSybil()` — Models N coordinated personas: 1 speaks, N-1 vote for that speaker. Computes total investment (anode across all personas) vs total reward (speaking pool + voting pool shares).
- `analyzeSpeakingEquilibrium()` — Examines settled deliberations: how many unique speakers per deliberation? Does the count trend toward 1 over time? At what point does rational avoidance dominate?
- `analyzeDeathSpiral()` — Looks at token price trajectory after a "bad" deliberation (one where the winning speaker had low engagement). Does the system recover or enter a reflexive decline?

### 2. Adversarial agent profiles in `simulation.ts`

Add two new profiles to the existing `PROFILES` record:

- **FreeRider**: `buyProb: 0.3, buyAnodeProb: 0.2, speakProb: 0.0, voteDelibProb: 0.0, exitProb: 0.0` — Buys anode but never participates in deliberation. Collects discharge passively.
- **SybilOperator**: `buyProb: 0.4, buyAnodeProb: 0.35, speakProb: 0.5, voteDelibProb: 0.8` — High speak + vote probability, representing coordinated personas acting in concert.

### 3. Adversarial analysis tab in `SimulationRuns.tsx`

Add an "Adversarial Analysis" tab to the completed-run view. Displays a grid of result cards, one per attack vector, showing: scenario name, profitable (yes/no with color), ROI percentage, risk level badge, and details text.

## Alternatives Considered

### Separate adversarial simulation mode

A standalone adversarial sim with pre-built attack scenarios. Rejected because it duplicates the simulation engine and diverges from the proven round-stepping architecture. Post-hoc analysis on the same data is simpler and reuses everything.

### Presets only (no analysis functions)

Add "Adversarial" presets to the existing sim (e.g., "Include 5 FreeRiders") and let users observe outcomes. Rejected because presets show what happens but don't answer "is it profitable?" — the key question for investors. Analysis functions compute the ROI explicitly.

### Formal verification

Mathematically prove properties about the governance mechanism. Rejected as out of scope for a simulation tool — the sim provides empirical evidence, not formal proofs. Formal verification would require an entirely different toolchain.

## Consequences

### Positive
- Quantifies attack viability under any parameter configuration — users can tune parameters and immediately see adversarial impact
- Directly addresses investor concerns from the adversarial analysis document with numbers, not theory
- FreeRider and SybilOperator profiles let users observe adversarial behavior in real-time during simulation runs
- Analysis runs on completed data — zero performance impact on the simulation itself

### Negative
- Adversarial results are approximate, not definitive — stochastic simulation means results vary between runs
- Adding two new profiles increases the agent pool complexity and may affect simulation dynamics even when adversarial analysis isn't the focus
- The SybilOperator profile is a simplification — real sybil attacks involve off-chain coordination that can't be fully modeled in a single-agent simulation

### Risks
- Analysis functions could give false confidence if users treat approximate ROI numbers as exact. Mitigated by showing result ranges across multiple runs and clear "approximate" labeling.
- FreeRider profile could skew non-adversarial runs if included by default. Mitigated by not including adversarial profiles in the default bot distribution.

## References

- [Adversarial Analysis](/notes/adversarial-analysis) — Source document for all attack vectors
- [simulation.ts](apps/sim/src/lib/simulation.ts) — Existing simulation engine with agent profiles
- [SimulationRuns.tsx](apps/sim/src/components/SimulationRuns.tsx) — Existing sim runner UI
- [runs.ts](apps/sim/src/lib/runs.ts) — Snapshot and summary data model
- Stage 4 of the [multistage plan](/.claude/plans/abstract-cuddling-fairy.md)
