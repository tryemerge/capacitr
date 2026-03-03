---
title: "Impl v1: Cross-System Integration — Emitter ↔ Capacitor"
date: 2026-03-01
status: draft
adr: v1-2026-03-01-3-cross-system-integration-adr.md
---

# Impl v1: Cross-System Integration — Emitter ↔ Capacitor

## Goal

Connect the Emitter and Capacitor simulations through a bridge module that models the full economic loop: emissions fund governance participation, governance outcomes feed back into emitter health, demonstrating the "governance that pays for itself" thesis with real numbers.

## Scope

### In Scope
- `bridge.ts` — bridge module converting Emitter state ↔ Capacitor inputs
- `integrated-simulation.ts` — combined round-stepper running both engines
- `integrated-runs.ts` — snapshot, summary, and localStorage for combined runs
- `IntegratedSim.tsx` — combined simulation UI with cross-system flow visualization
- Route at `/integrated` for the combined view
- Self-funding ratio metric as the key output
- Configurable round-mapping between Emitter and Capacitor time scales

### Out of Scope
- Facilitator economics (compute costs, agent orchestration)
- Executor automation layer
- Smart contract implementation details
- Real DEX integration or on-chain simulation
- Formal game-theoretic proofs
- Adversarial analysis of the integrated system (separate future work)

## Checklist

### Phase 1: Bridge Module

- [ ] Create `apps/sim/src/lib/bridge.ts`
- [ ] Define `BridgeConfig` interface:
  - `emTokenToGovernancePct` — % of emToken holders who convert to governance participants (default: 0.3)
  - `volumeToDelibFundingRate` — share of pool fees that funds deliberation bounties (default: 0.5)
  - `governanceQualityImpact` — multiplier: good governance → price boost factor (default: 0.02 per quality point)
  - `emitterRoundsPerGovCycle` — how many emitter rounds = 1 governance cycle (default: 10)
  - `delibBountyThreshold` — min pool ETH to trigger a deliberation (default: 0.01)
- [ ] Implement `emitterToGovernanceTransfer(emitterState, bridgeConfig)`:
  - Calculate cathode funding: `emissionPool.totalFeesReceived * volumeToDelibFundingRate`
  - Generate governance participants from emitter agent pool (emToken holders → cathode buyers)
  - Return: `{ cathodeFunding, newParticipants, emitterStateAfterTransfer }`
- [ ] Implement `governanceToEmitterFeedback(deliberation, emitterState, bridgeConfig)`:
  - Score deliberation quality: speakers count, voter turnout, vote margin
  - Map quality → buy/sell pressure adjustment for next emitter cycle
  - Return: `{ qualityScore, buyPressureMultiplier, sellPressureMultiplier }`
- [ ] Implement `computeSelfFundingRatio(emitterState, governanceState)`:
  - Numerator: additional trading volume attributable to governance quality signals
  - Denominator: total cost of governance operations (bounties, anode purchases)
  - Ratio > 1.0 = governance generates more value than it consumes

### Phase 2: Combined Simulation Engine

- [ ] Create `apps/sim/src/lib/integrated-simulation.ts`
- [ ] Define `IntegratedState` combining `EmitterState` + `SimulationState` + bridge metrics:
  ```typescript
  interface IntegratedState {
    emitter: EmitterState;
    governance: SimulationState;
    bridge: {
      totalTransferred: number;       // cumulative ETH from emitter → governance
      totalFeedbackEvents: number;    // governance outcomes applied
      selfFundingRatio: number;       // rolling ratio
      governanceQualityHistory: number[]; // quality score per governance cycle
    };
    emitterRound: number;
    governanceCycle: number;
  }
  ```
- [ ] Implement `integratedRound(state, configs, profiles)`:
  - Step emitter for `emitterRoundsPerGovCycle` rounds
  - At cycle boundary: run bridge transfer, step governance for 1 cycle
  - After governance: apply feedback to emitter agent behavior
  - Return new `IntegratedState`
- [ ] Implement governance cycle stepping (wrapper around existing `simulateRound` that handles multiple rounds as one governance cycle)

### Phase 3: Snapshot & Persistence

- [ ] Create `apps/sim/src/lib/integrated-runs.ts`
- [ ] Define `IntegratedSnapshot` capturing both systems per cycle:
  - Emitter metrics: tokenPrice, emTokenPrice, reserveDepletion, poolShare, creatorFees
  - Governance metrics: cathodePrice, anodePrice, deliberationsSettled, speakingPoolSize
  - Bridge metrics: selfFundingRatio, transferAmount, qualityScore, participantConversion
- [ ] Define `IntegratedSummary` with end-of-run analysis:
  - Final self-funding ratio (the key number)
  - Peak vs trough self-funding ratio
  - Total value transferred in each direction
  - Governance quality trend (improving, stable, declining)
  - Whether the system reached steady state or diverged
- [ ] Implement localStorage CRUD following `runs.ts` patterns

### Phase 4: UI

- [ ] Create `apps/sim/src/components/IntegratedSim.tsx`
- [ ] Config panel: side-by-side Emitter + Capacitor parameter sections, plus bridge config
- [ ] Running panel: dual sparkline rows:
  - Top row: Emitter metrics (token price, reserve depletion, pool value)
  - Bottom row: Governance metrics (cathode price, deliberation quality, pool sizes)
  - Center: self-funding ratio as a large, prominent gauge/number
  - Flow visualization: arrows showing ETH flowing from emitter → governance and quality signal flowing governance → emitter
- [ ] Completed panel:
  - Self-funding ratio front and center with trajectory chart
  - Split-screen summary: Emitter summary left, Governance summary right
  - Bridge metrics: total transferred, conversion rates, quality scores
  - Key insight text: "Governance [did/didn't] pay for itself — self-funding ratio: X.XX"
- [ ] Create route file: `apps/sim/src/app/integrated/page.tsx`
- [ ] Add "Integrated" section to SideNav between Launchpad and Governance sections

### Verification

- [ ] Bridge transfer correctly converts emitter fees into governance funding
  - Run 50 emitter rounds → trigger bridge → governance should have cathode pool
- [ ] Governance feedback correctly adjusts emitter agent behavior
  - Good deliberation → increased buy probability in subsequent emitter rounds
  - Bad deliberation → increased sell probability
- [ ] Self-funding ratio computation makes economic sense
  - With high trading volume: ratio > 1.0 (governance pays for itself)
  - With low trading volume: ratio < 1.0 (governance is subsidized)
- [ ] 100-cycle integrated simulation completes without errors, NaN, or negative balances
- [ ] Both individual sims still work independently — no regressions
- [ ] `pnpm build` passes cleanly
- [ ] The key chart — self-funding ratio over time — clearly shows whether governance reaches sustainability

## Files Affected

| File | Change |
|------|--------|
| `apps/sim/src/lib/bridge.ts` | **New** — Bridge config, transfer functions, feedback functions, self-funding ratio |
| `apps/sim/src/lib/integrated-simulation.ts` | **New** — Combined simulation engine stepping both systems |
| `apps/sim/src/lib/integrated-runs.ts` | **New** — Snapshot, summary, localStorage for integrated runs |
| `apps/sim/src/components/IntegratedSim.tsx` | **New** — Combined simulation UI |
| `apps/sim/src/app/integrated/page.tsx` | **New** — Route wrapper |
| `apps/sim/src/components/SideNav.tsx` | Add "Integrated" section with link to `/integrated` |

## Dependencies

- Emitter simulation engine (Stages 1-3) — complete
- Deliberation simulation engine — existing, complete
- Adversarial analysis (Stage 4) — should be complete first to validate governance economics independently
- Both sims proven to produce reasonable results in isolation before connecting them

## Notes

- **Time scale challenge**: Emitter rounds (trading sessions) happen faster than governance cycles (deliberations). The `emitterRoundsPerGovCycle` parameter controls this mapping. Default of 10 means 10 trading rounds pass between each governance cycle.
- **The self-funding ratio is the pitch**: If this number is consistently > 1.0 under realistic parameters, the "governance that pays for itself" thesis holds. If it's consistently < 1.0, the mechanism needs redesign. Either result is valuable.
- **Honest presentation**: The UI should not hide unfavorable results. If governance doesn't self-fund under default parameters, that's important information — show it clearly and let users explore what parameter changes would achieve sustainability.
- **Future work**: After the bridge is validated, extend to model Facilitator compute costs (Stage 5b) and Executor automation (Stage 5c). Each would be its own bridge module following the same pattern.
- **Consider presets**: "Bull Market Integration", "Bear Market Stress Test", "Minimal Governance" — but defer to a follow-up pass after the core engine is working.
