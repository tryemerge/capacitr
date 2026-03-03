import {
  createEmitter,
  buyToken,
  sellToken,
  emitWork,
  compound,
  simulateLpFees,
  tokenSpotPrice,
  emTokenValue,
  resetRoundVolume,
  advanceRound,
  WORK_ACTIONS,
  type WorkActionType,
  type EmitterConfig,
  type EmitterState,
  type EmitterEventLog,
} from "./emitter";

// ── Agent Profiles ──────────────────────────────────────────────────

export interface EmitterAgentProfile {
  type: string;
  buyProb: number;              // probability of buying token each round
  sellProb: number;             // probability of selling token each round
  actionAProb: number;          // probability of Action A (Tweet, free, 1 work unit)
  actionBProb: number;          // probability of Action B (Purchase, 1 USDC, 5 work units)
  holdEmissions: boolean;       // does this agent hold emTokens long-term?
  redeemProb: number;           // probability of redeeming emTokens
  buySizePct: [number, number]; // [min%, max%] of USDC to spend
  sellSizePct: [number, number]; // [min%, max%] of tokens to sell
  minRound: number;             // agent doesn't participate before this round
  // Market sensitivity
  bearSellMultiplier: number;   // how much more likely to sell in bear
  bullBuyMultiplier: number;    // how much more likely to buy in bull
}

export const EMITTER_PROFILES: Record<string, Omit<EmitterAgentProfile, "type">> = {
  Degen: {
    buyProb: 0.6, sellProb: 0.3, actionAProb: 0.0, actionBProb: 0.0, holdEmissions: false,
    redeemProb: 0.0, buySizePct: [0.1, 0.4], sellSizePct: [0.1, 0.3],
    minRound: 0, bearSellMultiplier: 2.0, bullBuyMultiplier: 1.5,
  },
  Builder: {
    buyProb: 0.2, sellProb: 0.05, actionAProb: 0.5, actionBProb: 0.2, holdEmissions: true,
    redeemProb: 0.02, buySizePct: [0.05, 0.15], sellSizePct: [0.05, 0.1],
    minRound: 0, bearSellMultiplier: 1.2, bullBuyMultiplier: 1.0,
  },
  Creator: {
    buyProb: 0.0, sellProb: 0.0, actionAProb: 0.3, actionBProb: 0.0, holdEmissions: true,
    redeemProb: 0.0, buySizePct: [0, 0], sellSizePct: [0, 0],
    minRound: 0, bearSellMultiplier: 1.0, bullBuyMultiplier: 1.0,
  },
  Speculator: {
    buyProb: 0.4, sellProb: 0.15, actionAProb: 0.0, actionBProb: 0.0, holdEmissions: false,
    redeemProb: 0.0, buySizePct: [0.1, 0.3], sellSizePct: [0.2, 0.5],
    minRound: 0, bearSellMultiplier: 3.0, bullBuyMultiplier: 2.0,
  },
  Contributor: {
    buyProb: 0.15, sellProb: 0.02, actionAProb: 0.4, actionBProb: 0.1, holdEmissions: true,
    redeemProb: 0.05, buySizePct: [0.03, 0.1], sellSizePct: [0.05, 0.1],
    minRound: 0, bearSellMultiplier: 1.0, bullBuyMultiplier: 1.0,
  },
  LateSpeculator: {
    buyProb: 0.7, sellProb: 0.2, actionAProb: 0.0, actionBProb: 0.0, holdEmissions: false,
    redeemProb: 0.0, buySizePct: [0.15, 0.4], sellSizePct: [0.1, 0.3],
    minRound: 20, bearSellMultiplier: 2.5, bullBuyMultiplier: 2.0,
  },
  Farmer: {
    buyProb: 0.05, sellProb: 0.0, actionAProb: 0.6, actionBProb: 0.2, holdEmissions: false,
    redeemProb: 0.3, buySizePct: [0.02, 0.05], sellSizePct: [0, 0],
    minRound: 0, bearSellMultiplier: 1.0, bullBuyMultiplier: 1.0,
  },
};

// ── Market Conditions ───────────────────────────────────────────────

export type MarketCondition = "bull" | "neutral" | "bear";

export interface MarketScenario {
  condition: MarketCondition;
  volumeMultiplier: number;
  startRound: number;
  endRound: number;
}

export const DEFAULT_MARKET_SCENARIOS: MarketScenario[] = [
  { condition: "bull", volumeMultiplier: 1.5, startRound: 0, endRound: 30 },
  { condition: "neutral", volumeMultiplier: 1.0, startRound: 30, endRound: 60 },
  { condition: "bear", volumeMultiplier: 0.4, startRound: 60, endRound: 80 },
  { condition: "neutral", volumeMultiplier: 0.8, startRound: 80, endRound: 100 },
];

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

// ── Bot Generation ──────────────────────────────────────────────────

export interface EmitterBotSpec {
  profileType: string;
  count: number;
  usdcBalance: number;
}

export const DEFAULT_BOT_DISTRIBUTION: EmitterBotSpec[] = [
  { profileType: "Creator",        count: 1,  usdcBalance: 0 },
  { profileType: "Degen",          count: 8,  usdcBalance: 5 },
  { profileType: "Speculator",     count: 6,  usdcBalance: 3 },
  { profileType: "Builder",        count: 10, usdcBalance: 1 },
  { profileType: "Contributor",    count: 12, usdcBalance: 0.5 },
  { profileType: "Farmer",         count: 5,  usdcBalance: 0.2 },
  { profileType: "LateSpeculator", count: 8,  usdcBalance: 4 },
];

// ── Agent State ─────────────────────────────────────────────────────

export interface EmitterAgentState {
  id: string;
  name: string;
  profileType: string;
  usdcBalance: number;
  tokenBalance: number;
  emTokenBalance: number;
  lockedEmTokens: { amount: number; unlockRound: number }[];
  totalUsdcSpent: number;
  totalWorkDone: number;        // cumulative work units
  totalActionA: number;         // count of Action A (Tweet) performed
  totalActionB: number;         // count of Action B (Purchase) performed
  totalEmissionsEarned: number;
}

// ── Simulation State ────────────────────────────────────────────────

export interface EmitterSimState {
  emitterState: EmitterState;
  agents: EmitterAgentState[];
  eventLog: EmitterEventLog[];
  round: number;
  marketCondition: MarketCondition;
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

const FIRST_NAMES = [
  "Alex", "Jordan", "Sam", "Morgan", "Casey", "Riley", "Quinn", "Avery",
  "Harper", "Sage", "Rowan", "Finley", "Emery", "Blair", "Hayden", "Drew",
  "Sky", "Reese", "Tatum", "Arden", "Lane", "Kai", "Nova", "Wren",
  "Ellis", "Remy", "Phoenix", "Shea", "Briar", "Lennox", "River", "Dakota",
  "Marlowe", "Oakley", "Jules", "Indigo", "Sterling", "Ashton", "Blake", "Cameron",
  "Devon", "Eden", "Frankie", "Gray", "Haven", "Ira", "Jesse", "Kit",
  "Lark", "Milan", "Nico", "Onyx", "Pax", "Raven", "Scout", "Teal",
];

// ── Bot Generator ───────────────────────────────────────────────────

export function generateEmitterBots(customDistribution?: EmitterBotSpec[]): {
  agents: EmitterAgentState[];
  profiles: Map<string, EmitterAgentProfile>;
} {
  const distribution = customDistribution ?? DEFAULT_BOT_DISTRIBUTION;
  const agents: EmitterAgentState[] = [];
  const profiles = new Map<string, EmitterAgentProfile>();

  const shuffledNames = [...FIRST_NAMES].sort(() => Math.random() - 0.5);
  let nameIdx = 0;

  for (const spec of distribution) {
    const profileDef = EMITTER_PROFILES[spec.profileType];
    if (!profileDef) continue;

    for (let i = 0; i < spec.count; i++) {
      const name = shuffledNames[nameIdx] || `Bot-${nameIdx + 1}`;
      const id = `em-bot-${nameIdx + 1}`;
      nameIdx++;

      // ±30% variance on USDC balance
      const variance = 0.7 + Math.random() * 0.6;
      agents.push({
        id,
        name,
        profileType: spec.profileType,
        usdcBalance: spec.usdcBalance * variance,
        tokenBalance: 0,
        emTokenBalance: 0,
        lockedEmTokens: [],
        totalUsdcSpent: 0,
        totalWorkDone: 0,
        totalActionA: 0,
        totalActionB: 0,
        totalEmissionsEarned: 0,
      });
      profiles.set(id, { type: spec.profileType, ...profileDef });
    }
  }

  return { agents, profiles };
}

// ── Initialize Simulation ───────────────────────────────────────────

export function initEmitterSim(
  configOverrides?: Partial<EmitterConfig>,
  customBots?: EmitterBotSpec[],
): { state: EmitterSimState; profiles: Map<string, EmitterAgentProfile> } {
  const emitterState = createEmitter(configOverrides);
  const { agents, profiles } = generateEmitterBots(customBots);

  return {
    state: {
      emitterState,
      agents,
      eventLog: [],
      round: 0,
      marketCondition: "neutral",
    },
    profiles,
  };
}

// ── Core Simulation Round ───────────────────────────────────────────

export function simulateEmitterRound(
  state: EmitterSimState,
  profiles: Map<string, EmitterAgentProfile>,
  scenarios: MarketScenario[] = DEFAULT_MARKET_SCENARIOS,
  lockDuration: number = 14,
): EmitterSimState {
  const round = state.round + 1;
  const { condition, volumeMultiplier } = getMarketCondition(round, scenarios);

  // Copy state immutably
  let emitterState = resetRoundVolume(advanceRound(state.emitterState));
  const agents = state.agents.map((a) => ({
    ...a,
    lockedEmTokens: a.lockedEmTokens.map((l) => ({ ...l })),
  }));
  const eventLog = [...state.eventLog];
  let nextEventId = eventLog.length + 1;

  function addEvent(
    type: EmitterEventLog["type"],
    agentName: string,
    detail: string,
  ) {
    eventLog.push({
      id: nextEventId++,
      round,
      type,
      agentName,
      detail,
      tokenPrice: tokenSpotPrice(emitterState),
      emTokenPrice: emTokenValue(emitterState),
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
      sellP *= 0.5; // less selling in bull
    } else if (condition === "bear") {
      sellP *= profile.bearSellMultiplier;
      buyP *= 0.3; // less buying in bear
    }

    // Apply volume multiplier to buy/sell probability
    buyP *= volumeMultiplier;
    sellP *= volumeMultiplier;

    // Clamp probabilities to [0, 0.95]
    buyP = Math.min(buyP, 0.95);
    sellP = Math.min(sellP, 0.95);
    actionAP = Math.min(actionAP, 0.95);
    actionBP = Math.min(actionBP, 0.95);

    // ── Agent actions (one primary action per round) ──

    // Try buy
    if (roll(buyP) && agent.usdcBalance > 0.001) {
      const pct = rand(profile.buySizePct[0], profile.buySizePct[1]);
      const usdcToSpend = agent.usdcBalance * pct;
      if (usdcToSpend > 0.0001) {
        const result = buyToken(emitterState, usdcToSpend);
        emitterState = result.newState;
        agent.usdcBalance -= usdcToSpend;
        agent.tokenBalance += result.tokensTraded;
        agent.totalUsdcSpent += usdcToSpend;
        addEvent("buy", agent.name,
          `Bought ${fmt(result.tokensTraded, 0)} tokens for ${fmtUSDC(usdcToSpend)} USDC`);
        continue; // one action per round
      }
    }

    // Try sell
    if (roll(sellP) && agent.tokenBalance > 0) {
      const pct = rand(profile.sellSizePct[0], profile.sellSizePct[1]);
      const tokensToSell = agent.tokenBalance * pct;
      if (tokensToSell > 0) {
        const result = sellToken(emitterState, tokensToSell);
        emitterState = result.newState;
        agent.tokenBalance -= tokensToSell;
        agent.usdcBalance += result.usdcTraded;
        addEvent("sell", agent.name,
          `Sold ${fmt(tokensToSell, 0)} tokens for ${fmtUSDC(result.usdcTraded)} USDC`);
        continue;
      }
    }

    // Try work — Action B first (higher reward, costs 1 USDC), then Action A (free)
    const actionBCost = WORK_ACTIONS.B.costUSDC;
    if (roll(actionBP) && agent.usdcBalance >= actionBCost && emitterState.reserveRemaining > 0) {
      const result = emitWork(emitterState, "B");
      if (result.emTokensMinted > 0) {
        emitterState = result.newState;
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
          `Action B (${WORK_ACTIONS.B.label}) → ${fmt(result.emTokensMinted, 0)} emTokens (${result.workUnits} units, $${actionBCost} cost, decay: ${fmt(result.decayMultiplier * 100, 1)}%)`);
        continue;
      }
    }

    if (roll(actionAP) && emitterState.reserveRemaining > 0) {
      const result = emitWork(emitterState, "A");
      if (result.emTokensMinted > 0) {
        emitterState = result.newState;
        agent.lockedEmTokens.push({
          amount: result.emTokensMinted,
          unlockRound: round + lockDuration,
        });
        agent.totalWorkDone += result.workUnits;
        agent.totalActionA += 1;
        agent.totalEmissionsEarned += result.emTokensMinted;
        addEvent("work", agent.name,
          `Action A (${WORK_ACTIONS.A.label}) → ${fmt(result.emTokensMinted, 0)} emTokens (${result.workUnits} unit, decay: ${fmt(result.decayMultiplier * 100, 1)}%)`);
        continue;
      }
    }
  }

  // ── Unlock expired emTokens ──
  for (const agent of agents) {
    const unlocked: number[] = [];
    const remaining: typeof agent.lockedEmTokens = [];
    for (const lock of agent.lockedEmTokens) {
      if (round >= lock.unlockRound) {
        unlocked.push(lock.amount);
      } else {
        remaining.push(lock);
      }
    }
    if (unlocked.length > 0) {
      const totalUnlocked = unlocked.reduce((s, a) => s + a, 0);
      agent.emTokenBalance += totalUnlocked;
      agent.lockedEmTokens = remaining;
    } else {
      agent.lockedEmTokens = remaining;
    }
  }

  // ── Auto-compound if threshold met ──
  const compResult = compound(emitterState);
  if (compResult.lpTokensMinted > 0) {
    emitterState = compResult.newState;
    addEvent("compound", "System",
      `Compounded ${fmt(compResult.tokensCompounded, 0)} TKN + ${fmtUSDC(compResult.usdcCompounded)} USDC → +${fmt(compResult.lpTokensMinted, 4)} LP tokens`);
  }

  // ── Simulate LP fees from this round's volume ──
  emitterState = simulateLpFees(emitterState, emitterState.roundVolumeUSDC);
  if (emitterState.roundVolumeUSDC > 0 && emitterState.emissionPool.lpTokens > 0) {
    addEvent("lp-fees", "System",
      `Pool earned LP fees from ${fmtUSDC(emitterState.roundVolumeUSDC)} USDC volume`);
  }

  return {
    emitterState,
    agents,
    eventLog,
    round,
    marketCondition: condition,
  };
}
