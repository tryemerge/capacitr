import {
  WORK_ACTIONS,
  type WorkActionType,
  type EmitterConfig,
} from "./emitter";
import {
  EMITTER_PROFILES,
  DEFAULT_MARKET_SCENARIOS,
  DEFAULT_BOT_DISTRIBUTION,
  generateEmitterBots,
  type EmitterAgentProfile,
  type EmitterAgentState,
  type EmitterBotSpec,
  type MarketCondition,
  type MarketScenario,
} from "./emitter-simulation";
import {
  createGraduationState,
  graduationBuy,
  graduationSell,
  graduationWork,
  graduationAdvanceRound,
  currentTokenPrice,
  currentWTokenPrice,
  currentMarketCap,
  captureGraduationSnapshot,
  type GraduationState,
  type GraduationConfig,
  type GraduationEventLog,
  type GraduationRoundSnapshot,
} from "./graduation";

// Re-export for convenience
export { EMITTER_PROFILES, DEFAULT_MARKET_SCENARIOS, DEFAULT_BOT_DISTRIBUTION };
export type { EmitterAgentProfile, EmitterAgentState, EmitterBotSpec, MarketCondition, MarketScenario };

// ── Simulation State ────────────────────────────────────────────────

export interface GraduationSimState {
  graduationState: GraduationState;
  agents: EmitterAgentState[];
  eventLog: GraduationEventLog[];
  round: number;
  marketCondition: MarketCondition;
  graduated: boolean;
  graduationRound: number | null;
}

// ── Summary ─────────────────────────────────────────────────────────

export interface GraduationRunSummary {
  totalRounds: number;
  graduated: boolean;
  graduationRound: number | null;
  finalTokenPrice: number;
  finalWTokenPrice: number;
  finalMarketCapUSDC: number;
  totalVolumeUSDC: number;
  creatorTotalUSDC: number;
  protocolTotalUSDC: number;
  poolTotalUSDC: number;
  totalEmissionEvents: number;
  totalWorkUnits: number;
  reserveRemainingPct: number;
  preGradVolume: number;
  postGradVolume: number;
}

// ── Helpers ─────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function roll(prob: number): boolean {
  return Math.random() < prob;
}

function fmt(n: number, d = 2): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
}

function fmtUSDC(n: number): string {
  return fmt(n, 4);
}

function getMarketCondition(round: number, scenarios: MarketScenario[]): {
  condition: MarketCondition;
  volumeMultiplier: number;
} {
  for (const s of scenarios) {
    if (round >= s.startRound && round < s.endRound) {
      return { condition: s.condition, volumeMultiplier: s.volumeMultiplier };
    }
  }
  return { condition: "neutral", volumeMultiplier: 1.0 };
}

// ── Init ────────────────────────────────────────────────────────────

export function initGraduationSim(
  emitterOverrides?: Partial<EmitterConfig>,
  gradOverrides?: Partial<GraduationConfig>,
  customBots?: EmitterBotSpec[],
): { state: GraduationSimState; profiles: Map<string, EmitterAgentProfile> } {
  const graduationState = createGraduationState(emitterOverrides, gradOverrides);
  const { agents, profiles } = generateEmitterBots(customBots);

  return {
    state: {
      graduationState,
      agents,
      eventLog: [],
      round: 0,
      marketCondition: "neutral",
      graduated: false,
      graduationRound: null,
    },
    profiles,
  };
}

// ── Core Round ──────────────────────────────────────────────────────

export function simulateGraduationRound(
  state: GraduationSimState,
  profiles: Map<string, EmitterAgentProfile>,
  scenarios: MarketScenario[] = DEFAULT_MARKET_SCENARIOS,
  lockDuration: number = 14,
): GraduationSimState {
  const round = state.round + 1;
  const { condition, volumeMultiplier } = getMarketCondition(round, scenarios);

  let gradState = state.graduationState;
  const agents = state.agents.map((a) => ({
    ...a,
    lockedEmTokens: a.lockedEmTokens.map((l) => ({ ...l })),
  }));
  const eventLog = [...state.eventLog];
  let nextEventId = eventLog.length + 1;
  let graduated = state.graduated;
  let graduationRound = state.graduationRound;
  const prevPhase = gradState.phase;

  function addEvent(
    type: GraduationEventLog["type"],
    agentName: string,
    detail: string,
  ) {
    eventLog.push({
      id: nextEventId++,
      round,
      type,
      agentName,
      detail,
      tokenPrice: currentTokenPrice(gradState),
      wTokenPrice: currentWTokenPrice(gradState),
      marketCapUSDC: currentMarketCap(gradState),
      phase: gradState.phase,
    });
  }

  // Shuffle agent order
  const shuffled = agents.map((_, i) => i).sort(() => Math.random() - 0.5);

  for (const idx of shuffled) {
    const agent = agents[idx];
    const profile = profiles.get(agent.id);
    if (!profile) continue;
    if (round < profile.minRound) continue;

    // Adjust probabilities for market condition
    let buyP = profile.buyProb;
    let sellP = profile.sellProb;
    let actionAP = profile.actionAProb;
    let actionBP = profile.actionBProb;

    if (condition === "bull") {
      buyP *= profile.bullBuyMultiplier;
      sellP *= 0.5;
    } else if (condition === "bear") {
      sellP *= profile.bearSellMultiplier;
      buyP *= 0.3;
    }

    buyP = Math.min(buyP * volumeMultiplier, 0.95);
    sellP = Math.min(sellP * volumeMultiplier, 0.95);
    actionAP = Math.min(actionAP, 0.95);
    actionBP = Math.min(actionBP, 0.95);

    // Try buy
    if (roll(buyP) && agent.usdcBalance > 0.001) {
      const pct = rand(profile.buySizePct[0], profile.buySizePct[1]);
      const usdcToSpend = agent.usdcBalance * pct;
      if (usdcToSpend > 0.0001) {
        const result = graduationBuy(gradState, usdcToSpend);
        gradState = result.newState;
        agent.usdcBalance -= usdcToSpend;
        agent.tokenBalance += result.tokensTraded;
        agent.totalUsdcSpent += usdcToSpend;
        addEvent("buy", agent.name,
          `Bought ${fmt(result.tokensTraded, 0)} tokens for ${fmtUSDC(usdcToSpend)} USDC`);

        // Check if graduation just happened
        if (!graduated && gradState.phase === "dex") {
          graduated = true;
          graduationRound = round;
          addEvent("graduation", "System",
            `Graduated at $${fmt(gradState.currentMarketCapUSDC, 0)} market cap!`);
        }
        continue;
      }
    }

    // Try sell
    if (roll(sellP) && agent.tokenBalance > 0) {
      const pct = rand(profile.sellSizePct[0], profile.sellSizePct[1]);
      const tokensToSell = agent.tokenBalance * pct;
      if (tokensToSell > 0) {
        const result = graduationSell(gradState, tokensToSell);
        gradState = result.newState;
        agent.tokenBalance -= tokensToSell;
        agent.usdcBalance += result.usdcTraded;
        addEvent("sell", agent.name,
          `Sold ${fmt(tokensToSell, 0)} tokens for ${fmtUSDC(result.usdcTraded)} USDC`);
        continue;
      }
    }

    // Try work
    const actionBCost = WORK_ACTIONS.B.costUSDC;
    if (roll(actionBP) && agent.usdcBalance >= actionBCost && gradState.emitterState.reserveRemaining > 0) {
      const result = graduationWork(gradState, "B");
      if (result.emTokensMinted > 0) {
        gradState = result.newState;
        agent.usdcBalance -= actionBCost;
        agent.totalUsdcSpent += actionBCost;
        agent.lockedEmTokens.push({
          amount: result.emTokensMinted,
          unlockRound: round + lockDuration,
        });
        agent.totalWorkDone += result.workUnits;
        agent.totalActionB += 1;
        agent.totalEmissionsEarned += result.emTokensMinted;
        addEvent("work", agent.name,
          `Action B → ${fmt(result.emTokensMinted, 0)} wTokens (decay: ${fmt(result.decayMultiplier * 100, 1)}%)`);
        continue;
      }
    }

    if (roll(actionAP) && gradState.emitterState.reserveRemaining > 0) {
      const result = graduationWork(gradState, "A");
      if (result.emTokensMinted > 0) {
        gradState = result.newState;
        agent.lockedEmTokens.push({
          amount: result.emTokensMinted,
          unlockRound: round + lockDuration,
        });
        agent.totalWorkDone += result.workUnits;
        agent.totalActionA += 1;
        agent.totalEmissionsEarned += result.emTokensMinted;
        addEvent("work", agent.name,
          `Action A → ${fmt(result.emTokensMinted, 0)} wTokens (decay: ${fmt(result.decayMultiplier * 100, 1)}%)`);
        continue;
      }
    }
  }

  // Unlock expired emTokens
  for (const agent of agents) {
    const remaining: typeof agent.lockedEmTokens = [];
    for (const lock of agent.lockedEmTokens) {
      if (round >= lock.unlockRound) {
        agent.emTokenBalance += lock.amount;
      } else {
        remaining.push(lock);
      }
    }
    agent.lockedEmTokens = remaining;
  }

  // Advance round (compound + LP fees during bonding curve)
  gradState = graduationAdvanceRound(gradState);

  return {
    graduationState: gradState,
    agents,
    eventLog,
    round,
    marketCondition: condition,
    graduated,
    graduationRound,
  };
}

// ── Summary ─────────────────────────────────────────────────────────

export function computeGraduationSummary(
  state: GraduationSimState,
  snapshots: GraduationRoundSnapshot[],
): GraduationRunSummary {
  const g = state.graduationState;
  const gradIdx = snapshots.findIndex((s) => s.phase === "dex");
  const preGradSnaps = gradIdx >= 0 ? snapshots.slice(0, gradIdx) : snapshots;
  const postGradSnaps = gradIdx >= 0 ? snapshots.slice(gradIdx) : [];

  const preGradVol = preGradSnaps.reduce((s, snap) => s + snap.roundVolumeUSDC, 0);
  const postGradVol = postGradSnaps.reduce((s, snap) => s + snap.roundVolumeUSDC, 0);

  return {
    totalRounds: state.round,
    graduated: state.graduated,
    graduationRound: state.graduationRound,
    finalTokenPrice: currentTokenPrice(g),
    finalWTokenPrice: currentWTokenPrice(g),
    finalMarketCapUSDC: g.currentMarketCapUSDC,
    totalVolumeUSDC: g.totalVolumeUSDC,
    creatorTotalUSDC: g.preGradFees.creator + g.postGradFees.creator,
    protocolTotalUSDC: g.preGradFees.protocol + g.postGradFees.protocol,
    poolTotalUSDC: g.preGradFees.pool + g.postGradFees.pool,
    totalEmissionEvents: g.emitterState.totalEmissionEvents,
    totalWorkUnits: g.emitterState.totalWorkUnits,
    reserveRemainingPct: g.emitterState.reserveTotal > 0
      ? (g.emitterState.reserveRemaining / g.emitterState.reserveTotal) * 100
      : 0,
    preGradVolume: preGradVol,
    postGradVolume: postGradVol,
  };
}
