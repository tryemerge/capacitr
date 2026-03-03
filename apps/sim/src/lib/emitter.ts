// ── Work Actions ─────────────────────────────────────────────────────

export type WorkActionType = "A" | "B";

export interface WorkActionDef {
  label: string;          // "Tweet", "Purchase"
  workUnits: number;      // work units awarded
  costUSDC: number;       // USDC cost to perform (0 = free)
}

export const WORK_ACTIONS: Record<WorkActionType, WorkActionDef> = {
  A: { label: "Tweet",    workUnits: 1, costUSDC: 0 },
  B: { label: "Purchase", workUnits: 5, costUSDC: 1 },
};

// ── Types ────────────────────────────────────────────────────────────

export interface EmitterConfig {
  // Bonding curve
  /** @deprecated Not used by createEmitter() — curve tokens derived from allocation percentages */
  initialSupplyToken: number;    // tokens in bonding curve reserve (default: 950M — 95% of supply)
  initialReserveUSDC: number;    // initial USDC in bonding curve (default: 1)
  totalSupply: number;           // total token supply (default: 1B)

  // Initial token allocation (must sum ≤ 1.0; remainder → bonding curve)
  reservePct: number;            // % of supply → emission reserve (default: 0.05)
  projectPct: number;            // % of supply → project treasury (default: 0)
  bountyPct: number;             // % of supply → bounty pool (default: 0)

  // Fee structure: 1.5% total, 60:40 USDC:TOKEN split
  tradeFeeRate: number;          // total fee per trade (default: 0.015 = 1.5%)
  creatorPct: number;            // % of fee → creator as USDC (default: 0.50)
  protocolPct: number;           // % of fee → protocol as USDC (default: 0.10)
  // implicit: poolPct = 1 - creatorPct - protocolPct → emission pool as TOKEN

  // Decay curve: Tokens(n) = emissionBase / (1 + decayK × n)
  decayK: number;                // decay steepness (default: 0.002)
  emissionBase: number;          // tokens per emission at n=0

  // Compounding
  compoundThresholdUSDC: number; // min accrued value before compound triggers
  lpFeeRate: number;             // DEX-level LP fee rate (default: 0.003 = 0.3%)
}

export interface BondingCurveState {
  reserveUSDC: number;
  reserveToken: number;
  k: number;                     // constant product invariant
}

export interface EmissionPoolState {
  lpTokens: number;              // LP position size (√(usdcSide × tokenSide))
  lpReserveUSDC: number;         // USDC side of LP position
  lpReserveToken: number;        // Token side of LP position
  accruedFeesUSDC: number;       // USDC fees waiting to compound (from LP fees)
  accruedFeesToken: number;      // TOKEN fees waiting to compound (from trade fees)
  totalCompounds: number;        // lifetime compound count
  totalTokenFeesReceived: number;// lifetime TOKEN received from trade fees
  totalLpFeesEarned: number;     // lifetime USDC earned from LP trading fees
}

export interface EmitterState {
  config: EmitterConfig;
  bondingCurve: BondingCurveState;
  emissionPool: EmissionPoolState;

  // Reserve tracking
  reserveRemaining: number;      // tokens left in emission reserve
  reserveTotal: number;          // original reserve size
  projectAllocation: number;     // tokens locked for project treasury
  bountyAllocation: number;      // tokens locked for bounty pool
  totalWorkUnits: number;        // cumulative work units (n for decay curve)
  totalEmissionEvents: number;   // count of emitWork() calls

  // Fee accumulation (USDC)
  creatorFeesTotal: number;
  protocolFeesTotal: number;
  workRevenue: number;           // USDC earned from paid work actions (Action B)

  // emToken tracking
  totalEmTokenSupply: number;    // total emTokens outstanding

  // Volume tracking
  totalVolumeUSDC: number;       // lifetime trading volume
  roundVolumeUSDC: number;       // this round's volume (reset each round)

  // Time
  round: number;
}

// ── Result Types ────────────────────────────────────────────────────

export interface TradeResult {
  tokensTraded: number;          // net tokens (after token fee deducted for buys)
  usdcTraded: number;            // net USDC (after USDC fee deducted for sells)
  fee: number;                   // total fee in USDC equivalent
  creatorFee: number;            // USDC to creator
  protocolFee: number;           // USDC to protocol
  poolFeeToken: number;          // TOKEN to emission pool
  priceAfter: number;
  newState: EmitterState;
}

export interface EmissionResult {
  emTokensMinted: number;
  tokensFromReserve: number;
  decayMultiplier: number;       // position on decay curve (1.0 at n=0)
  reserveRemainingPct: number;
  actionType: WorkActionType;
  workUnits: number;
  revenueGenerated: number;      // USDC cost of action (→ creator revenue)
  newState: EmitterState;
}

export interface CompoundResult {
  lpTokensMinted: number;
  feesCompounded: number;        // total value compounded (USDC equiv)
  usdcCompounded: number;        // USDC from LP fees
  tokensCompounded: number;      // TOKEN from trade fees
  usdcAddedToLp: number;
  tokensAddedToLp: number;
  newState: EmitterState;
}

export interface EmitterEventLog {
  id: number;
  round: number;
  type: "buy" | "sell" | "work" | "compound" | "lp-fees";
  agentName: string;
  detail: string;
  tokenPrice: number;
  emTokenPrice: number;
}

// ── Default Config ──────────────────────────────────────────────────

export const DEFAULT_EMITTER_CONFIG: EmitterConfig = {
  totalSupply: 1_000_000_000,
  initialSupplyToken: 950_000_000,    // deprecated — derived from allocation percentages
  initialReserveUSDC: 1,              // 1 USDC starting liquidity
  reservePct: 0.05,                   // 5% of supply for emissions
  projectPct: 0,                      // 0% to project treasury
  bountyPct: 0,                       // 0% to bounty pool

  tradeFeeRate: 0.015,                // 1.5% per trade
  creatorPct: 0.50,                   // 50% of fee → creator (USDC)
  protocolPct: 0.10,                  // 10% of fee → protocol (USDC)
  // pool gets remaining 40% as TOKEN

  decayK: 0.002,                      // gentle decay
  emissionBase: 100_000,              // 100k tokens for first emission

  compoundThresholdUSDC: 0.001,       // compound when pool accrued value > threshold
  lpFeeRate: 0.003,                   // 0.3% DEX-level LP fee → 100% to emission pool
};

// ── Factory ─────────────────────────────────────────────────────────

export function createEmitter(overrides: Partial<EmitterConfig> = {}): EmitterState {
  const config = { ...DEFAULT_EMITTER_CONFIG, ...overrides };

  const reserveTotal = Math.floor(config.totalSupply * config.reservePct);
  const projectTotal = Math.floor(config.totalSupply * (config.projectPct ?? 0));
  const bountyTotal = Math.floor(config.totalSupply * (config.bountyPct ?? 0));
  const curveTokens = config.totalSupply - reserveTotal - projectTotal - bountyTotal;

  const bondingCurve: BondingCurveState = {
    reserveUSDC: config.initialReserveUSDC,
    reserveToken: curveTokens,
    k: config.initialReserveUSDC * curveTokens,
  };

  const emissionPool: EmissionPoolState = {
    lpTokens: 0,
    lpReserveUSDC: 0,
    lpReserveToken: 0,
    accruedFeesUSDC: 0,
    accruedFeesToken: 0,
    totalCompounds: 0,
    totalTokenFeesReceived: 0,
    totalLpFeesEarned: 0,
  };

  return {
    config,
    bondingCurve,
    emissionPool,
    reserveRemaining: reserveTotal,
    reserveTotal,
    projectAllocation: projectTotal,
    bountyAllocation: bountyTotal,
    totalWorkUnits: 0,
    totalEmissionEvents: 0,
    creatorFeesTotal: 0,
    protocolFeesTotal: 0,
    workRevenue: 0,
    totalEmTokenSupply: 0,
    totalVolumeUSDC: 0,
    roundVolumeUSDC: 0,
    round: 0,
  };
}

// ── Bonding Curve Math ──────────────────────────────────────────────

/** Spot price of token in USDC */
export function tokenSpotPrice(state: EmitterState): number {
  const { reserveUSDC, reserveToken } = state.bondingCurve;
  if (reserveToken <= 0) return Infinity;
  return reserveUSDC / reserveToken;
}

/** Buy tokens with USDC. Returns tokens received after fee.
 *  Fee structure: 1.5% total
 *    - 60% taken from input USDC → creator (50%) + protocol (10%)
 *    - 40% taken from output TOKEN → emission pool
 */
export function buyToken(state: EmitterState, usdcAmount: number): TradeResult {
  if (usdcAmount <= 0) {
    return {
      tokensTraded: 0, usdcTraded: 0, fee: 0,
      creatorFee: 0, protocolFee: 0, poolFeeToken: 0,
      priceAfter: tokenSpotPrice(state),
      newState: { ...state },
    };
  }

  const { config, bondingCurve } = state;
  const usdcFeePct = config.creatorPct + config.protocolPct; // 0.60
  const tokenFeePct = 1 - usdcFeePct;                        // 0.40

  // USDC fee taken from input
  const usdcFee = usdcAmount * config.tradeFeeRate * usdcFeePct;
  const creatorFee = usdcAmount * config.tradeFeeRate * config.creatorPct;
  const protocolFee = usdcAmount * config.tradeFeeRate * config.protocolPct;
  const effectiveUSDC = usdcAmount - usdcFee;

  // Constant product swap: USDC → Token
  const newReserveUSDC = bondingCurve.reserveUSDC + effectiveUSDC;
  const newReserveToken = bondingCurve.k / newReserveUSDC;
  const grossTokensOut = bondingCurve.reserveToken - newReserveToken;

  // TOKEN fee taken from output → emission pool
  const poolFeeToken = grossTokensOut * config.tradeFeeRate * tokenFeePct;
  const netTokensOut = grossTokensOut - poolFeeToken;

  const newBondingCurve: BondingCurveState = {
    reserveUSDC: newReserveUSDC,
    reserveToken: newReserveToken,
    k: newReserveUSDC * newReserveToken,
  };

  // Total fee in USDC equivalent (for display)
  const priceAfter = newBondingCurve.reserveUSDC / newBondingCurve.reserveToken;
  const fee = usdcFee + poolFeeToken * priceAfter;

  const newEmissionPool: EmissionPoolState = {
    ...state.emissionPool,
    accruedFeesToken: state.emissionPool.accruedFeesToken + poolFeeToken,
    totalTokenFeesReceived: state.emissionPool.totalTokenFeesReceived + poolFeeToken,
  };

  const newState: EmitterState = {
    ...state,
    bondingCurve: newBondingCurve,
    emissionPool: newEmissionPool,
    creatorFeesTotal: state.creatorFeesTotal + creatorFee,
    protocolFeesTotal: state.protocolFeesTotal + protocolFee,
    totalVolumeUSDC: state.totalVolumeUSDC + usdcAmount,
    roundVolumeUSDC: state.roundVolumeUSDC + usdcAmount,
  };

  return {
    tokensTraded: netTokensOut,
    usdcTraded: usdcAmount,
    fee,
    creatorFee,
    protocolFee,
    poolFeeToken,
    priceAfter,
    newState,
  };
}

/** Sell tokens for USDC. Returns USDC received after fee.
 *  Fee structure: 1.5% total
 *    - 40% taken from input TOKEN → emission pool
 *    - 60% taken from output USDC → creator (50%) + protocol (10%)
 */
export function sellToken(state: EmitterState, tokenAmount: number): TradeResult {
  if (tokenAmount <= 0) {
    return {
      tokensTraded: 0, usdcTraded: 0, fee: 0,
      creatorFee: 0, protocolFee: 0, poolFeeToken: 0,
      priceAfter: tokenSpotPrice(state),
      newState: { ...state },
    };
  }

  const { config, bondingCurve } = state;
  const usdcFeePct = config.creatorPct + config.protocolPct; // 0.60
  const tokenFeePct = 1 - usdcFeePct;                        // 0.40

  // TOKEN fee taken from input → emission pool
  const poolFeeToken = tokenAmount * config.tradeFeeRate * tokenFeePct;
  const effectiveTokens = tokenAmount - poolFeeToken;

  // Constant product swap: Token → USDC
  const newReserveToken = bondingCurve.reserveToken + effectiveTokens;
  const newReserveUSDC = bondingCurve.k / newReserveToken;
  const grossUSDC = bondingCurve.reserveUSDC - newReserveUSDC;

  // USDC fee taken from output → creator + protocol
  const usdcFee = grossUSDC * config.tradeFeeRate * usdcFeePct;
  const creatorFee = grossUSDC * config.tradeFeeRate * config.creatorPct;
  const protocolFee = grossUSDC * config.tradeFeeRate * config.protocolPct;
  const netUSDC = grossUSDC - usdcFee;

  const newBondingCurve: BondingCurveState = {
    reserveUSDC: newReserveUSDC,
    reserveToken: newReserveToken,
    k: newReserveUSDC * newReserveToken,
  };

  // Total fee in USDC equivalent (for display)
  const priceAfter = newBondingCurve.reserveUSDC / newBondingCurve.reserveToken;
  const fee = usdcFee + poolFeeToken * priceAfter;

  const newEmissionPool: EmissionPoolState = {
    ...state.emissionPool,
    accruedFeesToken: state.emissionPool.accruedFeesToken + poolFeeToken,
    totalTokenFeesReceived: state.emissionPool.totalTokenFeesReceived + poolFeeToken,
  };

  const newState: EmitterState = {
    ...state,
    bondingCurve: newBondingCurve,
    emissionPool: newEmissionPool,
    creatorFeesTotal: state.creatorFeesTotal + creatorFee,
    protocolFeesTotal: state.protocolFeesTotal + protocolFee,
    totalVolumeUSDC: state.totalVolumeUSDC + grossUSDC,
    roundVolumeUSDC: state.roundVolumeUSDC + grossUSDC,
  };

  return {
    tokensTraded: tokenAmount,
    usdcTraded: netUSDC,
    fee,
    creatorFee,
    protocolFee,
    poolFeeToken,
    priceAfter,
    newState,
  };
}

// ── Emissions ───────────────────────────────────────────────────────

/** Decay curve: how many tokens emission #n produces */
export function decayCurveTokens(config: EmitterConfig, n: number): number {
  return config.emissionBase / (1 + config.decayK * n);
}

/** Issue an emission for Work. Mints emTokens backed by reserve tokens.
 *  Action A (Tweet) = 1 work unit, free
 *  Action B (Purchase) = 5 work units, costs 1 USDC → creator revenue
 */
export function emitWork(state: EmitterState, action: WorkActionType = "A"): EmissionResult {
  const { config, reserveRemaining, totalWorkUnits } = state;
  const actionDef = WORK_ACTIONS[action];
  const { workUnits, costUSDC } = actionDef;

  // Calculate tokens: workUnits × base decay rate at current position
  const tokensPerUnit = decayCurveTokens(config, totalWorkUnits);
  const tokensForEmission = workUnits * tokensPerUnit;

  // Can't emit more than remaining reserve
  const actualTokens = Math.min(tokensForEmission, reserveRemaining);

  if (actualTokens <= 0) {
    return {
      emTokensMinted: 0,
      tokensFromReserve: 0,
      decayMultiplier: 0,
      reserveRemainingPct: 0,
      actionType: action,
      workUnits: 0,
      revenueGenerated: 0,
      newState: { ...state },
    };
  }

  // emTokens minted = actualTokens (1:1 initially — value comes from LP backing)
  const emTokensMinted = actualTokens;

  const newState: EmitterState = {
    ...state,
    reserveRemaining: state.reserveRemaining - actualTokens,
    totalWorkUnits: state.totalWorkUnits + workUnits,
    totalEmissionEvents: state.totalEmissionEvents + 1,
    totalEmTokenSupply: state.totalEmTokenSupply + emTokensMinted,
    creatorFeesTotal: state.creatorFeesTotal + costUSDC,
    workRevenue: state.workRevenue + costUSDC,
  };

  return {
    emTokensMinted,
    tokensFromReserve: actualTokens,
    decayMultiplier: 1 / (1 + config.decayK * totalWorkUnits),
    reserveRemainingPct: (newState.reserveRemaining / state.reserveTotal) * 100,
    actionType: action,
    workUnits,
    revenueGenerated: costUSDC,
    newState,
  };
}

// ── Compounding ─────────────────────────────────────────────────────

/**
 * Auto-compound the emission pool:
 * Pool accrues TOKEN (from trade fees) and USDC (from LP fees).
 * 1. Value both sides at spot price
 * 2. Rebalance to 50/50 by selling excess TOKEN or buying TOKEN with excess USDC
 * 3. Mint LP tokens from the balanced USDC + TOKEN pair
 * 4. Add to pool position
 */
export function compound(state: EmitterState): CompoundResult {
  const { emissionPool, config } = state;
  const usdcFees = emissionPool.accruedFeesUSDC;
  const tokenFees = emissionPool.accruedFeesToken;

  const price = tokenSpotPrice(state);
  const tokenFeesValue = tokenFees * price;
  const totalValue = usdcFees + tokenFeesValue;

  if (totalValue < config.compoundThresholdUSDC) {
    return {
      lpTokensMinted: 0,
      feesCompounded: 0,
      usdcCompounded: 0,
      tokensCompounded: 0,
      usdcAddedToLp: 0,
      tokensAddedToLp: 0,
      newState: { ...state },
    };
  }

  let usdcForLp: number;
  let tokensForLp: number;
  let curveState: EmitterState = state;

  if (tokenFeesValue > usdcFees && tokenFees > 0) {
    // More TOKEN value than USDC — sell some TOKEN for USDC to balance
    const excessTokenValue = (tokenFeesValue - usdcFees) / 2;
    const tokensToSell = price > 0 ? excessTokenValue / price : 0;
    if (tokensToSell > 0) {
      const sellResult = sellToken(state, tokensToSell);
      curveState = sellResult.newState;
      usdcForLp = usdcFees + sellResult.usdcTraded;
      tokensForLp = tokenFees - tokensToSell;
    } else {
      usdcForLp = usdcFees;
      tokensForLp = tokenFees;
    }
  } else if (usdcFees > tokenFeesValue && usdcFees > 0) {
    // More USDC than TOKEN value — buy TOKEN with excess USDC
    const excessUSDC = (usdcFees - tokenFeesValue) / 2;
    if (excessUSDC > 0) {
      const buyResult = buyToken(state, excessUSDC);
      curveState = buyResult.newState;
      usdcForLp = usdcFees - excessUSDC;
      tokensForLp = tokenFees + buyResult.tokensTraded;
    } else {
      usdcForLp = usdcFees;
      tokensForLp = tokenFees;
    }
  } else {
    // Already balanced (or both zero)
    usdcForLp = usdcFees;
    tokensForLp = tokenFees;
  }

  if (usdcForLp <= 0 || tokensForLp <= 0) {
    return {
      lpTokensMinted: 0,
      feesCompounded: 0,
      usdcCompounded: 0,
      tokensCompounded: 0,
      usdcAddedToLp: 0,
      tokensAddedToLp: 0,
      newState: { ...state },
    };
  }

  // Mint LP tokens: √(usdcSide × tokenSide)
  const newLpTokens = Math.sqrt(usdcForLp * tokensForLp);

  const newEmissionPool: EmissionPoolState = {
    ...curveState.emissionPool,
    lpTokens: emissionPool.lpTokens + newLpTokens,
    lpReserveUSDC: emissionPool.lpReserveUSDC + usdcForLp,
    lpReserveToken: emissionPool.lpReserveToken + tokensForLp,
    accruedFeesUSDC: 0,
    accruedFeesToken: 0,
    totalCompounds: emissionPool.totalCompounds + 1,
  };

  const newState: EmitterState = {
    ...curveState,
    emissionPool: newEmissionPool,
  };

  return {
    lpTokensMinted: newLpTokens,
    feesCompounded: totalValue,
    usdcCompounded: usdcFees,
    tokensCompounded: tokenFees,
    usdcAddedToLp: usdcForLp,
    tokensAddedToLp: tokensForLp,
    newState,
  };
}

// ── LP Fee Simulation ───────────────────────────────────────────────

/**
 * The emission pool earns LP fees proportional to its share of total liquidity.
 * In a real DEX, this happens per-swap. In the sim, we approximate per-round.
 */
export function simulateLpFees(state: EmitterState, roundVolume: number): EmitterState {
  const { emissionPool, bondingCurve, config } = state;

  if (emissionPool.lpTokens <= 0 || roundVolume <= 0) {
    return state;
  }

  // Total liquidity = bonding curve USDC + pool's USDC position
  const totalLiquidityUSDC = bondingCurve.reserveUSDC + emissionPool.lpReserveUSDC;
  if (totalLiquidityUSDC <= 0) return state;

  // Pool's share of liquidity
  const poolShare = emissionPool.lpReserveUSDC / totalLiquidityUSDC;

  // LP fees earned this round
  const lpFeesEarned = roundVolume * config.lpFeeRate * poolShare;

  const newEmissionPool: EmissionPoolState = {
    ...emissionPool,
    accruedFeesUSDC: emissionPool.accruedFeesUSDC + lpFeesEarned,
    totalLpFeesEarned: emissionPool.totalLpFeesEarned + lpFeesEarned,
  };

  return { ...state, emissionPool: newEmissionPool };
}

// ── Price & Metric Queries ──────────────────────────────────────────

/** Value of one emToken in USDC (backed by LP position) */
export function emTokenValue(state: EmitterState): number {
  if (state.totalEmTokenSupply <= 0) return 0;
  // emToken value = total pool USDC value / total emTokens outstanding
  // Pool holds both USDC and tokens. Value in USDC = usdcSide + tokenSide × spotPrice
  const tokenPriceUSDC = tokenSpotPrice(state);
  const poolValueUSDC =
    state.emissionPool.lpReserveUSDC +
    state.emissionPool.lpReserveToken * tokenPriceUSDC;
  return poolValueUSDC / state.totalEmTokenSupply;
}

/** Reserve depletion percentage (0 = full, 100 = empty) */
export function reserveDepletionPct(state: EmitterState): number {
  if (state.reserveTotal <= 0) return 100;
  return ((state.reserveTotal - state.reserveRemaining) / state.reserveTotal) * 100;
}

/** Pool's share of total liquidity (0-1) */
export function poolShareOfLiquidity(state: EmitterState): number {
  const totalUSDC = state.bondingCurve.reserveUSDC + state.emissionPool.lpReserveUSDC;
  if (totalUSDC <= 0) return 0;
  return state.emissionPool.lpReserveUSDC / totalUSDC;
}

/** Total value locked in the emission pool (USDC) */
export function poolTotalValueUSDC(state: EmitterState): number {
  const tokenPriceUSDC = tokenSpotPrice(state);
  return (
    state.emissionPool.lpReserveUSDC +
    state.emissionPool.lpReserveToken * tokenPriceUSDC +
    state.emissionPool.accruedFeesUSDC
  );
}

/** Pool's share of total fee (the TOKEN portion: 1 - creatorPct - protocolPct) */
export function poolFeePct(config: EmitterConfig): number {
  return Math.max(0, 1 - config.creatorPct - config.protocolPct);
}

/** Estimate round at which reserve depletes given an average work rate.
 *  avgWorkUnitsPerEvent accounts for Action A (1) vs B (5) mix.
 */
export function estimateReserveDepletionRound(
  config: EmitterConfig,
  eventsPerRound: number,
  avgWorkUnitsPerEvent: number = 1,
): number {
  if (eventsPerRound <= 0) return Infinity;
  const reserveTotal = Math.floor(config.totalSupply * config.reservePct);
  let remaining = reserveTotal;
  let n = 0; // cumulative work units
  let round = 0;

  const maxRounds = 10_000;
  while (remaining > 0 && round < maxRounds) {
    for (let w = 0; w < eventsPerRound; w++) {
      const tokensPerUnit = decayCurveTokens(config, n);
      const tokens = avgWorkUnitsPerEvent * tokensPerUnit;
      remaining -= tokens;
      n += avgWorkUnitsPerEvent;
      if (remaining <= 0) return round;
    }
    round++;
  }

  return round >= maxRounds ? Infinity : round;
}

/** Reset round volume (call at start of each round) */
export function resetRoundVolume(state: EmitterState): EmitterState {
  return { ...state, roundVolumeUSDC: 0 };
}

/** Advance round counter */
export function advanceRound(state: EmitterState): EmitterState {
  return { ...state, round: state.round + 1 };
}
