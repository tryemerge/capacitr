/**
 * Bonding curve math for the Launchpad token trading UI.
 * Adapted from apps/sim/src/lib/emitter.ts.
 *
 * Uses a constant product AMM (like Uniswap v2) with fee splitting:
 *   2% total fee → 40% work pool, 50% creator, 10% protocol
 */

export interface BondingCurveState {
  reserveETH: number;
  reserveToken: number;
  k: number;
}

export interface TradeResult {
  tokensTraded: number;
  ethTraded: number;
  fee: number;
  creatorFee: number;
  protocolFee: number;
  workPoolFee: number;
  priceAfter: number;
  newState: BondingCurveState;
}

const FEE_RATE = 0.02;            // 2% total fee
const WORK_POOL_PCT = 0.40;       // 40% → work pool (in tokens)
const CREATOR_PCT = 0.50;         // 50% → creator (in ETH)
const PROTOCOL_PCT = 0.10;        // 10% → protocol (in ETH)
const ETH_FEE_PCT = CREATOR_PCT + PROTOCOL_PCT; // 0.60

/** Get spot price of token in ETH */
export function spotPrice(state: BondingCurveState): number {
  if (state.reserveToken <= 0) return Infinity;
  return state.reserveETH / state.reserveToken;
}

/** Get market cap given total supply and spot price */
export function marketCap(
  state: BondingCurveState,
  totalSupply: number,
): number {
  return spotPrice(state) * totalSupply;
}

/** Create initial bonding curve state */
export function createBondingCurve(
  initialETH: number,
  initialTokens: number,
): BondingCurveState {
  return {
    reserveETH: initialETH,
    reserveToken: initialTokens,
    k: initialETH * initialTokens,
  };
}

/** Buy tokens with ETH */
export function buyToken(
  state: BondingCurveState,
  ethAmount: number,
): TradeResult {
  if (ethAmount <= 0) {
    return {
      tokensTraded: 0, ethTraded: 0, fee: 0,
      creatorFee: 0, protocolFee: 0, workPoolFee: 0,
      priceAfter: spotPrice(state), newState: { ...state },
    };
  }

  // ETH fee from input
  const ethFee = ethAmount * FEE_RATE * ETH_FEE_PCT;
  const creatorFee = ethAmount * FEE_RATE * CREATOR_PCT;
  const protocolFee = ethAmount * FEE_RATE * PROTOCOL_PCT;
  const effectiveETH = ethAmount - ethFee;

  // Constant product swap: ETH → Token
  const newReserveETH = state.reserveETH + effectiveETH;
  const newReserveToken = state.k / newReserveETH;
  const grossTokensOut = state.reserveToken - newReserveToken;

  // Token fee from output → work pool
  const workPoolFee = grossTokensOut * FEE_RATE * WORK_POOL_PCT;
  const netTokensOut = grossTokensOut - workPoolFee;

  const newState: BondingCurveState = {
    reserveETH: newReserveETH,
    reserveToken: newReserveToken,
    k: newReserveETH * newReserveToken,
  };

  const priceAfter = newState.reserveETH / newState.reserveToken;
  const fee = ethFee + workPoolFee * priceAfter;

  return {
    tokensTraded: netTokensOut,
    ethTraded: ethAmount,
    fee,
    creatorFee,
    protocolFee,
    workPoolFee,
    priceAfter,
    newState,
  };
}

/** Sell tokens for ETH */
export function sellToken(
  state: BondingCurveState,
  tokenAmount: number,
): TradeResult {
  if (tokenAmount <= 0) {
    return {
      tokensTraded: 0, ethTraded: 0, fee: 0,
      creatorFee: 0, protocolFee: 0, workPoolFee: 0,
      priceAfter: spotPrice(state), newState: { ...state },
    };
  }

  // Token fee from input → work pool
  const workPoolFee = tokenAmount * FEE_RATE * WORK_POOL_PCT;
  const effectiveTokens = tokenAmount - workPoolFee;

  // Constant product swap: Token → ETH
  const newReserveToken = state.reserveToken + effectiveTokens;
  const newReserveETH = state.k / newReserveToken;
  const grossETH = state.reserveETH - newReserveETH;

  // ETH fee from output → creator + protocol
  const ethFee = grossETH * FEE_RATE * ETH_FEE_PCT;
  const creatorFee = grossETH * FEE_RATE * CREATOR_PCT;
  const protocolFee = grossETH * FEE_RATE * PROTOCOL_PCT;
  const netETH = grossETH - ethFee;

  const newState: BondingCurveState = {
    reserveETH: newReserveETH,
    reserveToken: newReserveToken,
    k: newReserveETH * newReserveToken,
  };

  const priceAfter = newState.reserveETH / newState.reserveToken;
  const fee = ethFee + workPoolFee * priceAfter;

  return {
    tokensTraded: tokenAmount,
    ethTraded: netETH,
    fee,
    creatorFee,
    protocolFee,
    workPoolFee,
    priceAfter,
    newState,
  };
}

/** Generate points for a bonding curve chart (CSS-only) */
export function curvePoints(
  state: BondingCurveState,
  steps: number = 50,
): Array<{ supply: number; price: number }> {
  const points: Array<{ supply: number; price: number }> = [];
  const minToken = state.reserveToken * 0.1;
  const maxToken = state.reserveToken * 3;
  const step = (maxToken - minToken) / steps;

  for (let i = 0; i <= steps; i++) {
    const token = minToken + step * i;
    const eth = state.k / token;
    points.push({ supply: token, price: eth / token });
  }

  return points;
}
