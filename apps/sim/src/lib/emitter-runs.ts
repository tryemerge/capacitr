import {
  tokenSpotPrice,
  emTokenValue,
  reserveDepletionPct,
  poolShareOfLiquidity,
  poolTotalValueUSDC,
} from "./emitter";
import type { EmitterSimState, MarketCondition, EmitterAgentState } from "./emitter-simulation";

// ── Snapshot ────────────────────────────────────────────────────────

export interface EmitterRoundSnapshot {
  round: number;
  tokenPrice: number;
  emTokenPrice: number;
  emTokenPriceInToken: number;
  reserveRemainingPct: number;
  poolLpTokens: number;
  poolShareOfLiq: number;
  poolTotalValueUSDC: number;
  creatorFeesTotal: number;
  protocolFeesTotal: number;
  emissionPoolFeesTotal: number;    // USDC-equivalent: token fees × price + LP fees
  poolTokenFeesTotal: number;       // lifetime TOKEN received from trade fees
  poolLpFeesTotal: number;          // lifetime USDC received from LP fees
  totalEmissionEvents: number;      // cumulative emitWork() calls
  totalWorkUnits: number;           // cumulative work units (decay curve position)
  roundEmissions: number;           // emission events this round
  roundEmissionAmount: number;
  roundActionACount: number;        // Action A events this round
  roundActionBCount: number;        // Action B events this round
  totalVolumeUSDC: number;
  roundVolumeUSDC: number;
  workRevenue: number;              // cumulative USDC from Action B
  marketCondition: MarketCondition;
  // Key comparison metrics
  creatorCumulativeUSDC: number;
  poolCumulativeUSDC: number;
  // Agent summary
  agentsWithTokens: number;
  agentsWithEmTokens: number;
  totalWorkDoneThisRound: number;
}

export function captureEmitterSnapshot(
  state: EmitterSimState,
  prevSnapshot?: EmitterRoundSnapshot,
): EmitterRoundSnapshot {
  const es = state.emitterState;

  // Cumulative agent totals
  const cumulativeWork = state.agents.reduce((s, a) => s + a.totalWorkDone, 0);
  const cumulativeActionA = state.agents.reduce((s, a) => s + a.totalActionA, 0);
  const cumulativeActionB = state.agents.reduce((s, a) => s + a.totalActionB, 0);

  // Round deltas
  const prevTotalEvents = prevSnapshot ? prevSnapshot.totalEmissionEvents : 0;
  const roundEmissions = es.totalEmissionEvents - prevTotalEvents;
  const prevWork = prevSnapshot ? prevSnapshot.totalWorkUnits : 0;
  const workThisRound = cumulativeWork - prevWork;

  const price = tokenSpotPrice(es);
  const emPrice = emTokenValue(es);
  const emPriceInToken = price > 0 ? emPrice / price : 0;

  return {
    round: state.round,
    tokenPrice: price,
    emTokenPrice: emPrice,
    emTokenPriceInToken: emPriceInToken,
    reserveRemainingPct: 100 - reserveDepletionPct(es),
    poolLpTokens: es.emissionPool.lpTokens,
    poolShareOfLiq: poolShareOfLiquidity(es),
    poolTotalValueUSDC: poolTotalValueUSDC(es),
    creatorFeesTotal: es.creatorFeesTotal,
    protocolFeesTotal: es.protocolFeesTotal,
    emissionPoolFeesTotal: es.emissionPool.totalTokenFeesReceived * price + es.emissionPool.totalLpFeesEarned,
    poolTokenFeesTotal: es.emissionPool.totalTokenFeesReceived,
    poolLpFeesTotal: es.emissionPool.totalLpFeesEarned,
    totalEmissionEvents: es.totalEmissionEvents,
    totalWorkUnits: es.totalWorkUnits,
    roundEmissions,
    roundEmissionAmount: roundEmissions * emPrice,
    roundActionACount: cumulativeActionA,  // cumulative — UI computes round delta
    roundActionBCount: cumulativeActionB,  // cumulative — UI computes round delta
    totalVolumeUSDC: es.totalVolumeUSDC,
    roundVolumeUSDC: es.roundVolumeUSDC,
    workRevenue: es.workRevenue,
    marketCondition: state.marketCondition,
    creatorCumulativeUSDC: es.creatorFeesTotal,
    poolCumulativeUSDC: poolTotalValueUSDC(es),
    agentsWithTokens: state.agents.filter((a) => a.tokenBalance > 0).length,
    agentsWithEmTokens: state.agents.filter(
      (a) => a.emTokenBalance > 0 || a.lockedEmTokens.length > 0,
    ).length,
    totalWorkDoneThisRound: Math.max(0, workThisRound),
  };
}

// ── Run Summary ─────────────────────────────────────────────────────

export interface EmitterRunSummary {
  totalRounds: number;
  finalTokenPrice: number;
  finalEmTokenPrice: number;
  finalEmTokenPriceInToken: number;
  reserveDepletedPct: number;
  totalVolumeUSDC: number;
  creatorTotalUSDC: number;
  poolTotalUSDC: number;
  protocolTotalUSDC: number;
  totalCompounds: number;
  totalEmissionEvents: number;
  totalWorkUnits: number;
  totalEmissionValueUSDC: number;
  totalWorkRevenue: number;        // USDC from Action B
  totalActionA: number;            // cumulative Action A count
  totalActionB: number;            // cumulative Action B count
  poolShareOfLiquidity: number;
  // Creator vs Community comparison
  creatorToPoolRatio: number;
  // Agent leaderboards
  topWorkers: { name: string; profileType: string; workDone: number; emTokens: number; actionA: number; actionB: number }[];
  topTraders: { name: string; profileType: string; usdcPnL: number }[];
  // Market condition breakdown
  bullRounds: number;
  neutralRounds: number;
  bearRounds: number;
}

export function computeEmitterSummary(
  state: EmitterSimState,
  snapshots: EmitterRoundSnapshot[],
): EmitterRunSummary {
  const es = state.emitterState;
  const poolValue = poolTotalValueUSDC(es);
  const price = tokenSpotPrice(es);
  const emPrice = emTokenValue(es);

  // Sort agents by work done (descending) for top workers
  const workersSorted = [...state.agents]
    .filter((a) => a.totalWorkDone > 0)
    .sort((a, b) => b.totalWorkDone - a.totalWorkDone)
    .slice(0, 5)
    .map((a) => ({
      name: a.name,
      profileType: a.profileType,
      workDone: a.totalWorkDone,
      emTokens: a.totalEmissionsEarned,
      actionA: a.totalActionA,
      actionB: a.totalActionB,
    }));

  // Sort agents by USDC PnL (most profitable first)
  const tradersSorted = [...state.agents]
    .filter((a) => a.totalUsdcSpent > 0)
    .map((a) => {
      const tokenValueUSDC = a.tokenBalance * price;
      const emTokenValueUSDC = a.totalEmissionsEarned * emPrice;
      const pnl = a.usdcBalance + tokenValueUSDC + emTokenValueUSDC - a.totalUsdcSpent;
      return { name: a.name, profileType: a.profileType, usdcPnL: pnl };
    })
    .sort((a, b) => b.usdcPnL - a.usdcPnL)
    .slice(0, 5);

  // Count market condition rounds
  let bullRounds = 0;
  let neutralRounds = 0;
  let bearRounds = 0;
  for (const snap of snapshots) {
    if (snap.marketCondition === "bull") bullRounds++;
    else if (snap.marketCondition === "bear") bearRounds++;
    else neutralRounds++;
  }

  return {
    totalRounds: state.round,
    finalTokenPrice: price,
    finalEmTokenPrice: emPrice,
    finalEmTokenPriceInToken: price > 0 ? emPrice / price : 0,
    reserveDepletedPct: reserveDepletionPct(es),
    totalVolumeUSDC: es.totalVolumeUSDC,
    creatorTotalUSDC: es.creatorFeesTotal,
    poolTotalUSDC: poolValue,
    protocolTotalUSDC: es.protocolFeesTotal,
    totalCompounds: es.emissionPool.totalCompounds,
    totalEmissionEvents: es.totalEmissionEvents,
    totalWorkUnits: es.totalWorkUnits,
    totalEmissionValueUSDC: es.totalEmissionEvents * emPrice,
    totalWorkRevenue: es.workRevenue,
    totalActionA: state.agents.reduce((s, a) => s + a.totalActionA, 0),
    totalActionB: state.agents.reduce((s, a) => s + a.totalActionB, 0),
    poolShareOfLiquidity: poolShareOfLiquidity(es),
    creatorToPoolRatio: poolValue > 0 ? es.creatorFeesTotal / poolValue : 0,
    topWorkers: workersSorted,
    topTraders: tradersSorted,
    bullRounds,
    neutralRounds,
    bearRounds,
  };
}

// ── Saved Runs (localStorage) ───────────────────────────────────────

export interface SavedEmitterRun {
  id: string;
  name: string;
  timestamp: number;
  snapshots: EmitterRoundSnapshot[];
  summary: EmitterRunSummary;
  configUsed: Record<string, unknown>;
}

const STORAGE_KEY = "capacitor-emitter-runs";

/** Patch old saved runs that predate field renames (totalEmissions → totalEmissionEvents, etc.) */
function migrateRun(run: SavedEmitterRun): SavedEmitterRun {
  const s = run.summary as unknown as Record<string, unknown>;
  // Summary migrations
  if (s.totalEmissionEvents == null) s.totalEmissionEvents = (s as any).totalEmissionsIssued ?? 0;
  if (s.totalWorkUnits == null) s.totalWorkUnits = s.totalEmissionEvents ?? 0;
  if (s.totalWorkRevenue == null) s.totalWorkRevenue = 0;
  if (s.totalActionA == null) s.totalActionA = 0;
  if (s.totalActionB == null) s.totalActionB = 0;
  // Top workers migration
  if (Array.isArray(s.topWorkers)) {
    for (const w of s.topWorkers as Record<string, unknown>[]) {
      if (w.actionA == null) w.actionA = 0;
      if (w.actionB == null) w.actionB = 0;
    }
  }
  // Snapshot migrations
  for (const snap of run.snapshots as unknown as Record<string, unknown>[]) {
    if (snap.totalEmissionEvents == null) snap.totalEmissionEvents = (snap as any).totalEmissions ?? 0;
    if (snap.totalWorkUnits == null) snap.totalWorkUnits = snap.totalEmissionEvents ?? 0;
    if (snap.roundActionACount == null) snap.roundActionACount = 0;
    if (snap.roundActionBCount == null) snap.roundActionBCount = 0;
    if (snap.workRevenue == null) snap.workRevenue = 0;
  }
  return run;
}

export function loadEmitterRuns(): SavedEmitterRun[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const runs: SavedEmitterRun[] = raw ? JSON.parse(raw) : [];
    return runs.map(migrateRun);
  } catch {
    return [];
  }
}

export function saveEmitterRun(run: SavedEmitterRun): void {
  if (typeof window === "undefined") return;
  const runs = loadEmitterRuns();
  runs.unshift(run);
  // Keep last 20 runs
  if (runs.length > 20) runs.length = 20;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

export function deleteEmitterRun(id: string): void {
  if (typeof window === "undefined") return;
  const runs = loadEmitterRuns().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}
