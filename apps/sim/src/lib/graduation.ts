/**
 * Graduation state machine and post-DEX math.
 *
 * Composes with emitter.ts — all bonding curve math is delegated,
 * never duplicated. Graduation wraps EmitterState for the bonding
 * curve phase, then transitions to a standalone DEX pool.
 */

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
  decayCurveTokens,
  type EmitterConfig,
  type EmitterState,
  type TradeResult,
  type EmissionResult,
  type WorkActionType,
} from "./emitter";

// ── Types ────────────────────────────────────────────────────────────

export type LifecyclePhase = "bonding-curve" | "graduating" | "dex";

export interface GraduationConfig {
  graduationMarketCapUSDC: number;   // threshold (default 69_000)
  dexFeeRate: number;                // post-graduation fee rate (default same as emitter)
  postGradCreatorPct: number;        // can differ post-grad
  postGradProtocolPct: number;
}

export const DEFAULT_GRADUATION_CONFIG: GraduationConfig = {
  graduationMarketCapUSDC: 69_000,
  dexFeeRate: 0.015,
  postGradCreatorPct: 0.50,
  postGradProtocolPct: 0.10,
};

export interface DexPoolState {
  reserveUSDC: number;
  reserveToken: number;
  k: number;
}

export interface WorkTokenBondingState {
  totalSupply: number;
  poolValueUSDC: number;
  price: number;                     // poolValueUSDC / totalSupply
}

export interface GraduationFees {
  creator: number;
  protocol: number;
  pool: number;
}

export interface GraduationState {
  phase: LifecyclePhase;
  emitterState: EmitterState;
  config: GraduationConfig;

  // Graduation tracking
  currentMarketCapUSDC: number;
  graduationProgress: number;        // 0-1
  graduationRound: number | null;

  // Post-graduation (null before)
  dexPool: DexPoolState | null;
  workTokenBonding: WorkTokenBondingState | null;

  // Fee tracking
  preGradFees: GraduationFees;
  postGradFees: GraduationFees;

  // Aggregate
  totalVolumeUSDC: number;
  round: number;
}

// ── Result Types ────────────────────────────────────────────────────

export interface GraduationTradeResult {
  tokensTraded: number;
  usdcTraded: number;
  fee: number;
  creatorFee: number;
  protocolFee: number;
  poolFee: number;
  priceAfter: number;
  newState: GraduationState;
}

export interface GraduationEmissionResult {
  emTokensMinted: number;
  tokensFromReserve: number;
  decayMultiplier: number;
  actionType: WorkActionType;
  workUnits: number;
  revenueGenerated: number;
  newState: GraduationState;
}

export interface GraduationEventLog {
  id: number;
  round: number;
  type: "buy" | "sell" | "work" | "compound" | "lp-fees" | "graduation";
  agentName: string;
  detail: string;
  tokenPrice: number;
  wTokenPrice: number;
  marketCapUSDC: number;
  phase: LifecyclePhase;
}

// ── Factory ─────────────────────────────────────────────────────────

export function createGraduationState(
  emitterOverrides?: Partial<EmitterConfig>,
  gradOverrides?: Partial<GraduationConfig>,
): GraduationState {
  const emitterState = createEmitter(emitterOverrides);
  const config = { ...DEFAULT_GRADUATION_CONFIG, ...gradOverrides };
  const mcap = tokenSpotPrice(emitterState) * emitterState.config.totalSupply;

  return {
    phase: "bonding-curve",
    emitterState,
    config,
    currentMarketCapUSDC: mcap,
    graduationProgress: Math.min(1, mcap / config.graduationMarketCapUSDC),
    graduationRound: null,
    dexPool: null,
    workTokenBonding: null,
    preGradFees: { creator: 0, protocol: 0, pool: 0 },
    postGradFees: { creator: 0, protocol: 0, pool: 0 },
    totalVolumeUSDC: 0,
    round: 0,
  };
}

// ── Market Cap ──────────────────────────────────────────────────────

export function currentMarketCap(state: GraduationState): number {
  if (state.phase === "dex" && state.dexPool) {
    const price = state.dexPool.reserveUSDC / state.dexPool.reserveToken;
    return price * state.emitterState.config.totalSupply;
  }
  return tokenSpotPrice(state.emitterState) * state.emitterState.config.totalSupply;
}

export function currentTokenPrice(state: GraduationState): number {
  if (state.phase === "dex" && state.dexPool) {
    return state.dexPool.reserveUSDC / state.dexPool.reserveToken;
  }
  return tokenSpotPrice(state.emitterState);
}

export function currentWTokenPrice(state: GraduationState): number {
  if (state.workTokenBonding && state.workTokenBonding.totalSupply > 0) {
    return state.workTokenBonding.price;
  }
  return emTokenValue(state.emitterState);
}

// ── Graduation Check & Migration ────────────────────────────────────

function updateMarketCap(state: GraduationState): GraduationState {
  const mcap = currentMarketCap(state);
  return {
    ...state,
    currentMarketCapUSDC: mcap,
    graduationProgress: Math.min(1, mcap / state.config.graduationMarketCapUSDC),
  };
}

export function checkGraduation(state: GraduationState): GraduationState {
  if (state.phase !== "bonding-curve") return state;
  if (state.currentMarketCapUSDC < state.config.graduationMarketCapUSDC) return state;
  return migrateToDeX(state);
}

function migrateToDeX(state: GraduationState): GraduationState {
  const { bondingCurve, emissionPool } = state.emitterState;

  // Seed DEX pool with bonding curve liquidity
  const dexPool: DexPoolState = {
    reserveUSDC: bondingCurve.reserveUSDC,
    reserveToken: bondingCurve.reserveToken,
    k: bondingCurve.reserveUSDC * bondingCurve.reserveToken,
  };

  // Bond wTokens: price = pool value / total supply
  const tokenPrice = bondingCurve.reserveUSDC / bondingCurve.reserveToken;
  const poolValueUSDC =
    emissionPool.lpReserveUSDC +
    emissionPool.lpReserveToken * tokenPrice +
    emissionPool.accruedFeesUSDC +
    emissionPool.accruedFeesToken * tokenPrice;
  const totalWTokenSupply = state.emitterState.totalEmTokenSupply;
  const wTokenPrice = totalWTokenSupply > 0 ? poolValueUSDC / totalWTokenSupply : 0;

  const workTokenBonding: WorkTokenBondingState = {
    totalSupply: totalWTokenSupply,
    poolValueUSDC,
    price: wTokenPrice,
  };

  return {
    ...state,
    phase: "dex",
    graduationRound: state.round,
    graduationProgress: 1,
    dexPool,
    workTokenBonding,
  };
}

// ── Trading ─────────────────────────────────────────────────────────

export function graduationBuy(
  state: GraduationState,
  usdcAmount: number,
): GraduationTradeResult {
  if (usdcAmount <= 0) {
    return emptyTradeResult(state);
  }

  if (state.phase === "bonding-curve") {
    return bondingCurveBuy(state, usdcAmount);
  }
  return dexBuy(state, usdcAmount);
}

export function graduationSell(
  state: GraduationState,
  tokenAmount: number,
): GraduationTradeResult {
  if (tokenAmount <= 0) {
    return emptyTradeResult(state);
  }

  if (state.phase === "bonding-curve") {
    return bondingCurveSell(state, tokenAmount);
  }
  return dexSell(state, tokenAmount);
}

function bondingCurveBuy(state: GraduationState, usdcAmount: number): GraduationTradeResult {
  const result = buyToken(state.emitterState, usdcAmount);
  let newState: GraduationState = {
    ...state,
    emitterState: result.newState,
    preGradFees: {
      creator: state.preGradFees.creator + result.creatorFee,
      protocol: state.preGradFees.protocol + result.protocolFee,
      pool: state.preGradFees.pool + result.poolFeeToken * result.priceAfter,
    },
    totalVolumeUSDC: state.totalVolumeUSDC + usdcAmount,
  };
  newState = updateMarketCap(newState);
  newState = checkGraduation(newState);

  return {
    tokensTraded: result.tokensTraded,
    usdcTraded: usdcAmount,
    fee: result.fee,
    creatorFee: result.creatorFee,
    protocolFee: result.protocolFee,
    poolFee: result.poolFeeToken * result.priceAfter,
    priceAfter: result.priceAfter,
    newState,
  };
}

function bondingCurveSell(state: GraduationState, tokenAmount: number): GraduationTradeResult {
  const result = sellToken(state.emitterState, tokenAmount);
  let newState: GraduationState = {
    ...state,
    emitterState: result.newState,
    preGradFees: {
      creator: state.preGradFees.creator + result.creatorFee,
      protocol: state.preGradFees.protocol + result.protocolFee,
      pool: state.preGradFees.pool + result.poolFeeToken * result.priceAfter,
    },
    totalVolumeUSDC: state.totalVolumeUSDC + result.usdcTraded,
  };
  newState = updateMarketCap(newState);

  return {
    tokensTraded: tokenAmount,
    usdcTraded: result.usdcTraded,
    fee: result.fee,
    creatorFee: result.creatorFee,
    protocolFee: result.protocolFee,
    poolFee: result.poolFeeToken * result.priceAfter,
    priceAfter: result.priceAfter,
    newState,
  };
}

function dexBuy(state: GraduationState, usdcAmount: number): GraduationTradeResult {
  const dex = state.dexPool!;
  const { dexFeeRate, postGradCreatorPct, postGradProtocolPct } = state.config;
  const poolPct = 1 - postGradCreatorPct - postGradProtocolPct;

  const usdcFeePct = postGradCreatorPct + postGradProtocolPct;
  const usdcFee = usdcAmount * dexFeeRate * usdcFeePct;
  const creatorFee = usdcAmount * dexFeeRate * postGradCreatorPct;
  const protocolFee = usdcAmount * dexFeeRate * postGradProtocolPct;
  const effectiveUSDC = usdcAmount - usdcFee;

  const newReserveUSDC = dex.reserveUSDC + effectiveUSDC;
  const newReserveToken = dex.k / newReserveUSDC;
  const grossTokensOut = dex.reserveToken - newReserveToken;

  const tokenFee = grossTokensOut * dexFeeRate * poolPct;
  const netTokensOut = grossTokensOut - tokenFee;

  const newDex: DexPoolState = {
    reserveUSDC: newReserveUSDC,
    reserveToken: newReserveToken,
    k: newReserveUSDC * newReserveToken,
  };

  const priceAfter = newDex.reserveUSDC / newDex.reserveToken;
  const poolFeeUSDC = tokenFee * priceAfter;
  const fee = usdcFee + poolFeeUSDC;

  // Update wToken bonding pool value
  const wb = state.workTokenBonding!;
  const newWb: WorkTokenBondingState = {
    ...wb,
    poolValueUSDC: wb.poolValueUSDC + poolFeeUSDC,
    price: wb.totalSupply > 0 ? (wb.poolValueUSDC + poolFeeUSDC) / wb.totalSupply : 0,
  };

  let newState: GraduationState = {
    ...state,
    dexPool: newDex,
    workTokenBonding: newWb,
    postGradFees: {
      creator: state.postGradFees.creator + creatorFee,
      protocol: state.postGradFees.protocol + protocolFee,
      pool: state.postGradFees.pool + poolFeeUSDC,
    },
    totalVolumeUSDC: state.totalVolumeUSDC + usdcAmount,
  };
  newState = updateMarketCap(newState);

  return {
    tokensTraded: netTokensOut,
    usdcTraded: usdcAmount,
    fee,
    creatorFee,
    protocolFee,
    poolFee: poolFeeUSDC,
    priceAfter,
    newState,
  };
}

function dexSell(state: GraduationState, tokenAmount: number): GraduationTradeResult {
  const dex = state.dexPool!;
  const { dexFeeRate, postGradCreatorPct, postGradProtocolPct } = state.config;
  const poolPct = 1 - postGradCreatorPct - postGradProtocolPct;

  const tokenFee = tokenAmount * dexFeeRate * poolPct;
  const effectiveTokens = tokenAmount - tokenFee;

  const newReserveToken = dex.reserveToken + effectiveTokens;
  const newReserveUSDC = dex.k / newReserveToken;
  const grossUSDC = dex.reserveUSDC - newReserveUSDC;

  const usdcFeePct = postGradCreatorPct + postGradProtocolPct;
  const usdcFee = grossUSDC * dexFeeRate * usdcFeePct;
  const creatorFee = grossUSDC * dexFeeRate * postGradCreatorPct;
  const protocolFee = grossUSDC * dexFeeRate * postGradProtocolPct;
  const netUSDC = grossUSDC - usdcFee;

  const newDex: DexPoolState = {
    reserveUSDC: newReserveUSDC,
    reserveToken: newReserveToken,
    k: newReserveUSDC * newReserveToken,
  };

  const priceAfter = newDex.reserveUSDC / newDex.reserveToken;
  const poolFeeUSDC = tokenFee * priceAfter;
  const fee = usdcFee + poolFeeUSDC;

  const wb = state.workTokenBonding!;
  const newWb: WorkTokenBondingState = {
    ...wb,
    poolValueUSDC: wb.poolValueUSDC + poolFeeUSDC,
    price: wb.totalSupply > 0 ? (wb.poolValueUSDC + poolFeeUSDC) / wb.totalSupply : 0,
  };

  let newState: GraduationState = {
    ...state,
    dexPool: newDex,
    workTokenBonding: newWb,
    postGradFees: {
      creator: state.postGradFees.creator + creatorFee,
      protocol: state.postGradFees.protocol + protocolFee,
      pool: state.postGradFees.pool + poolFeeUSDC,
    },
    totalVolumeUSDC: state.totalVolumeUSDC + netUSDC,
  };
  newState = updateMarketCap(newState);

  return {
    tokensTraded: tokenAmount,
    usdcTraded: netUSDC,
    fee,
    creatorFee,
    protocolFee,
    poolFee: poolFeeUSDC,
    priceAfter,
    newState,
  };
}

// ── Work Emissions ──────────────────────────────────────────────────

export function graduationWork(
  state: GraduationState,
  action: WorkActionType = "A",
): GraduationEmissionResult {
  if (state.phase === "bonding-curve") {
    return bondingCurveWork(state, action);
  }
  return postGradWork(state, action);
}

function bondingCurveWork(state: GraduationState, action: WorkActionType): GraduationEmissionResult {
  const result = emitWork(state.emitterState, action);
  let newState: GraduationState = {
    ...state,
    emitterState: result.newState,
  };
  newState = updateMarketCap(newState);

  return {
    emTokensMinted: result.emTokensMinted,
    tokensFromReserve: result.tokensFromReserve,
    decayMultiplier: result.decayMultiplier,
    actionType: result.actionType,
    workUnits: result.workUnits,
    revenueGenerated: result.revenueGenerated,
    newState,
  };
}

function postGradWork(state: GraduationState, action: WorkActionType): GraduationEmissionResult {
  // Post-graduation: still emit from reserve using decay curve, but wTokens are bonded
  const result = emitWork(state.emitterState, action);
  const wb = state.workTokenBonding!;

  const newWb: WorkTokenBondingState = {
    totalSupply: wb.totalSupply + result.emTokensMinted,
    poolValueUSDC: wb.poolValueUSDC,
    price: (wb.totalSupply + result.emTokensMinted) > 0
      ? wb.poolValueUSDC / (wb.totalSupply + result.emTokensMinted)
      : 0,
  };

  return {
    emTokensMinted: result.emTokensMinted,
    tokensFromReserve: result.tokensFromReserve,
    decayMultiplier: result.decayMultiplier,
    actionType: result.actionType,
    workUnits: result.workUnits,
    revenueGenerated: result.revenueGenerated,
    newState: {
      ...state,
      emitterState: result.newState,
      workTokenBonding: newWb,
    },
  };
}

// ── Round Management ────────────────────────────────────────────────

export function graduationAdvanceRound(state: GraduationState): GraduationState {
  let emitterState = state.emitterState;

  if (state.phase === "bonding-curve") {
    // Compound and LP fees during bonding curve phase
    const compResult = compound(emitterState);
    if (compResult.lpTokensMinted > 0) {
      emitterState = compResult.newState;
    }
    emitterState = simulateLpFees(emitterState, emitterState.roundVolumeUSDC);
  }

  emitterState = resetRoundVolume(advanceRound(emitterState));

  return {
    ...state,
    emitterState,
    round: state.round + 1,
  };
}

// ── Snapshot ────────────────────────────────────────────────────────

export interface GraduationRoundSnapshot {
  round: number;
  phase: LifecyclePhase;
  tokenPrice: number;
  marketCapUSDC: number;
  graduationProgress: number;
  wTokenPrice: number;
  totalVolumeUSDC: number;
  creatorFeesUSDC: number;
  protocolFeesUSDC: number;
  poolFeesUSDC: number;
  poolValueUSDC: number;
  reserveRemainingPct: number;
  totalEmissionEvents: number;
  roundVolumeUSDC: number;
  marketCondition: string;
  // DEX-specific
  dexReserveUSDC: number;
  dexReserveToken: number;
}

export function captureGraduationSnapshot(
  state: GraduationState,
  marketCondition: string = "neutral",
): GraduationRoundSnapshot {
  const { emitterState } = state;
  const reservePct = emitterState.reserveTotal > 0
    ? (emitterState.reserveRemaining / emitterState.reserveTotal) * 100
    : 0;

  return {
    round: state.round,
    phase: state.phase,
    tokenPrice: currentTokenPrice(state),
    marketCapUSDC: state.currentMarketCapUSDC,
    graduationProgress: state.graduationProgress,
    wTokenPrice: currentWTokenPrice(state),
    totalVolumeUSDC: state.totalVolumeUSDC,
    creatorFeesUSDC: state.preGradFees.creator + state.postGradFees.creator,
    protocolFeesUSDC: state.preGradFees.protocol + state.postGradFees.protocol,
    poolFeesUSDC: state.preGradFees.pool + state.postGradFees.pool,
    poolValueUSDC: state.workTokenBonding?.poolValueUSDC ?? emTokenValue(emitterState) * emitterState.totalEmTokenSupply,
    reserveRemainingPct: reservePct,
    totalEmissionEvents: emitterState.totalEmissionEvents,
    roundVolumeUSDC: emitterState.roundVolumeUSDC,
    marketCondition,
    dexReserveUSDC: state.dexPool?.reserveUSDC ?? 0,
    dexReserveToken: state.dexPool?.reserveToken ?? 0,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────

function emptyTradeResult(state: GraduationState): GraduationTradeResult {
  return {
    tokensTraded: 0,
    usdcTraded: 0,
    fee: 0,
    creatorFee: 0,
    protocolFee: 0,
    poolFee: 0,
    priceAfter: currentTokenPrice(state),
    newState: state,
  };
}
