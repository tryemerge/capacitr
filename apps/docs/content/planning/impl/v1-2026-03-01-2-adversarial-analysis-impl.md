---
title: "Impl v1: Adversarial Analysis Enhancements"
date: 2026-03-01
status: in-progress
adr: v1-2026-03-01-1-adversarial-analysis-adr.md
---

# Impl v1: Adversarial Analysis Enhancements

## Goal

Add adversarial scenario analysis to the existing Capacitor deliberation sim so that each documented attack vector (free-rider, sybil, speaking equilibrium, death spiral) can be quantified as profitable or unprofitable under any given parameter set.

## Scope

### In Scope
- `adversarial.ts` — four analysis functions with standardized result types
- Two new agent profiles (FreeRider, SybilOperator) added to `simulation.ts`
- "Adversarial Analysis" tab in `SimulationRuns.tsx` for completed runs
- Adversarial profiles available in the bot distribution editor but not in the default distribution

### Out of Scope
- Formal verification or mathematical proofs
- Adversarial analysis for the Emitter sim (Stage 5 territory)
- New presets specifically for adversarial scenarios (can be added later)
- Off-chain coordination modeling (vote buying, cartels)
- Changes to the simulation engine core loop

## Checklist

### Phase 1: Analysis Library

- [x] Create `apps/sim/src/lib/adversarial.ts`
- [x] Define `AdversarialResult` interface: `{ scenarioName, profitable, roi, riskLevel, details }`
- [x] Implement `analyzeFreeRider(state, snapshots, summary)`:
  - Calculate cheapest anode entry (round 1 price from snapshots)
  - Calculate flat discharge received per agent from settled deliberations
  - ROI = discharge / anodeCost
  - Profitable if ROI > 1.0
  - Risk level: critical if ROI > 2.0, high if > 1.5, medium if > 1.0, low otherwise
- [x] Implement `analyzeSybil(state, snapshots, summary, numPersonas = 5)`:
  - Total investment = anode cost × numPersonas (all enter at average anode price)
  - Best-case reward = full speaking pool + (numPersonas-1)/total_voters share of voting pool
  - ROI = reward / investment
  - Profitable if ROI > 1.0 accounting for entry costs across all personas
- [x] Implement `analyzeSpeakingEquilibrium(deliberations)`:
  - For each settled deliberation, count unique speakers
  - Track trend: is speaker count declining over successive deliberations?
  - Risk = high if final deliberations have ≤ 1 speaker, medium if trending down, low if stable
  - Not an ROI metric — instead reports equilibrium health
- [x] Implement `analyzeDeathSpiral(snapshots, deliberations)`:
  - Identify deliberations where winning speaker had fewest votes (low-quality outcomes)
  - Track cathode price in the 5 rounds after each such deliberation
  - Death spiral = price drops > 20% and doesn't recover within 10 rounds
  - Risk level based on frequency and severity of spirals

### Phase 2: Adversarial Agent Profiles

- [x] Add `FreeRider` profile to `PROFILES` in `simulation.ts`:
  ```
  buyProb: 0.3, buyAnodeProb: 0.2, discussProb: 0.0, proposeProb: 0.0,
  voteProposalProb: 0.0, speakProb: 0.0, voteDelibProb: 0.0,
  exitProb: 0.0, minRound: 0, buySizePct: [0.1, 0.25]
  ```
- [x] Add `SybilOperator` profile to `PROFILES` in `simulation.ts`:
  ```
  buyProb: 0.4, buyAnodeProb: 0.35, discussProb: 0.05, proposeProb: 0.0,
  voteProposalProb: 0.1, speakProb: 0.5, voteDelibProb: 0.8,
  exitProb: 0.0, minRound: 0, buySizePct: [0.1, 0.3]
  ```
- [x] Verify new profiles are available in `PROFILES` export but NOT in `BOT_DISTRIBUTION` default
- [ ] Test: run simulation with 3 FreeRiders added — they should buy anode but never speak/vote (manual)
- [ ] Test: run simulation with 5 SybilOperators — they should dominate deliberation outcomes (manual)

### Phase 3: UI Integration

- [x] Add adversarial analysis tab to `SimulationRuns.tsx` completed-run view
- [x] Import analysis functions from `adversarial.ts`
- [x] Run all four analyses when user views a completed run
- [x] Display result cards in a 2×2 grid:
  - Each card: scenario name header, profitable badge (green/red), ROI percentage, risk level badge (color-coded), details paragraph
- [x] Add FreeRider and SybilOperator to the bot distribution editor dropdown
- [x] Ensure adversarial tab is hidden when no deliberations were settled (analysis needs deliberation data)

### Verification

- [ ] Free-rider analysis correctly identifies profitable/unprofitable conditions
  - With default config + low anode prices: should show profitable (ROI > 1.0)
  - With high anode prices: should show unprofitable
- [ ] Sybil analysis shows coordination ROI scales with number of personas
- [ ] Speaking equilibrium analysis detects declining speaker counts
- [ ] Death spiral analysis identifies reflexive price declines after bad deliberations
- [ ] All existing sim functionality unchanged — run a default simulation and compare to pre-change behavior
- [x] `pnpm build` passes with no TypeScript errors
- [x] Adversarial profiles don't appear in default bot distribution (FreeRider/SybilOperator at count=0 in editor, absent from BOT_DISTRIBUTION)

## Files Affected

| File | Change |
|------|--------|
| `apps/sim/src/lib/adversarial.ts` | **New** — AdversarialResult type + 4 analysis functions |
| `apps/sim/src/lib/simulation.ts` | Add FreeRider and SybilOperator to PROFILES |
| `apps/sim/src/components/SimulationRuns.tsx` | Add adversarial analysis tab to completed-run view |

## Dependencies

- Completed deliberation sim (Stages 1-3 of existing Capacitor sim — already done)
- `SimulationState`, `Deliberation`, `DelibSettlement` types from `simulation.ts`
- `RoundSnapshot`, `RunSummary` types from `runs.ts`
- At least one settled deliberation in a completed run for analysis to produce meaningful results

## Notes

- The analysis functions are pure — they read completed data and return results. No side effects, no state mutation.
- SybilOperator is a simplification: real sybil attacks involve multiple distinct agents coordinating off-chain. In the sim, we model it as a single high-activity profile and extrapolate coordination ROI mathematically.
- Consider adding a "Run 10x" option in a future iteration to show result distributions instead of single-run values.
- The free-rider analysis is the most investor-relevant: if free-riding is profitable, the governance economics are broken. This should be the most prominent card in the UI.
