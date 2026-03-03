// ── Types ────────────────────────────────────────────────────────────

export interface AMMState {
  reserveA: number; // token A reserves
  reserveB: number; // token B reserves
  k: number; // invariant (reserveA × reserveB)
  feeRate: number; // e.g., 0.02 for 2%
  feesCollected: number;
  labelA: string;
  labelB: string;
}

export interface DualAMMState {
  market: AMMState; // USDC / Cathode
  deliberation: AMMState; // Cathode / Anode
  deliberationActive: boolean; // whether anode AMM is open for trading
  speakingPool: number; // cathode accumulated from speak actions
  votingPool: number; // cathode accumulated from vote actions
  feePool: number; // cathode collected from deliberation fee (20%)
  // Market fee pools (from 1% market fee split)
  capacitrPool: number; // 5% of market fee (USDC)
  projectPool: number; // 45% of market fee (USDC)
  derivativePool: number; // 50% of market fee (Cathode — swapped via AMM1)
  // Token supply
  totalCathodeSupply: number; // total cathode minted
  projectTreasury: number; // cathode held by project (30% of supply, for bounties)
}

export interface SwapResult {
  amountOut: number;
  fee: number;
  newState: AMMState;
}

export interface EnterResult {
  cathodeReceived: number;
  anodeReceived: number;
  marketFee: number;
  deliberationFee: number;
  newState: DualAMMState;
}

export interface ActionResult {
  anodeSpent: number;
  cathodeToPool: number;
  fee: number;
  newState: DualAMMState;
}

export interface ExitResult {
  anodeSold: number;
  cathodeBack: number;
  usdcBack: number;
  deliberationFee: number;
  marketFee: number;
  newState: DualAMMState;
}

export interface AgentState {
  id: string;
  name: string;
  usdcBalance: number;
  cathodeBalance: number;
  anodeBalance: number;
  totalUsdcSpent: number;
}

export interface BuyCathodeResult {
  cathodeReceived: number;
  fee: number;
  newState: DualAMMState;
}

export interface BuyAnodeResult {
  anodeReceived: number;
  fee: number;
  newState: DualAMMState;
}

export interface EventLogEntry {
  id: number;
  type: "buy-cathode" | "buy-anode" | "speak" | "vote" | "exit" | "delib-open" | "delib-settle" | "discharge";
  agentName: string;
  detail: string;
  anodePrice: number; // in USDC at time of event
  cathodePrice: number; // in USDC at time of event
}

export interface DiscussionEntry {
  id: number;
  agentId: string;
  agentName: string;
  wordCount: number;
  cathodeCost: number;
}

export interface Proposal {
  id: number;
  agentId: string;
  agentName: string;
  title: string;
  cathodeCost: number;
  upvotes: string[]; // agent IDs
  downvotes: string[]; // agent IDs
  status: "active" | "deliberation" | "settled";
}

export interface DischargeResult {
  cathodeReturned: number;
  fee: number;
  newState: DualAMMState;
}

// ── Core AMM Functions ──────────────────────────────────────────────

export function createAMM(
  reserveA: number,
  reserveB: number,
  feeRate: number,
  labelA: string,
  labelB: string,
): AMMState {
  return {
    reserveA,
    reserveB,
    k: reserveA * reserveB,
    feeRate,
    feesCollected: 0,
    labelA,
    labelB,
  };
}

/** Swap amountIn of token A for token B (AtoB) or vice versa */
export function swap(
  amm: AMMState,
  amountIn: number,
  direction: "AtoB" | "BtoA",
): SwapResult {
  if (amountIn <= 0) {
    return { amountOut: 0, fee: 0, newState: { ...amm } };
  }

  const fee = amountIn * amm.feeRate;
  const effectiveIn = amountIn - fee;

  let reserveIn: number;
  let reserveOut: number;

  if (direction === "AtoB") {
    reserveIn = amm.reserveA;
    reserveOut = amm.reserveB;
  } else {
    reserveIn = amm.reserveB;
    reserveOut = amm.reserveA;
  }

  // Constant product: amountOut = (reserveOut × effectiveIn) / (reserveIn + effectiveIn)
  const amountOut = (reserveOut * effectiveIn) / (reserveIn + effectiveIn);

  // Update reserves — full amountIn goes in (fee stays in pool), amountOut comes out
  let newState: AMMState;
  if (direction === "AtoB") {
    newState = {
      ...amm,
      reserveA: amm.reserveA + amountIn,
      reserveB: amm.reserveB - amountOut,
      feesCollected: amm.feesCollected + fee,
    };
  } else {
    newState = {
      ...amm,
      reserveA: amm.reserveA - amountOut,
      reserveB: amm.reserveB + amountIn,
      feesCollected: amm.feesCollected + fee,
    };
  }
  // k drifts slightly with fees (it grows), recalculate
  newState.k = newState.reserveA * newState.reserveB;

  return { amountOut, fee, newState };
}

/** Spot price of token B in terms of token A */
export function spotPrice(amm: AMMState, direction: "AtoB" | "BtoA"): number {
  if (direction === "AtoB") {
    // Price of B in A = reserveA / reserveB
    return amm.reserveA / amm.reserveB;
  } else {
    // Price of A in B = reserveB / reserveA
    return amm.reserveB / amm.reserveA;
  }
}

/** Calculate how much anode to sell (BtoA) to receive a target cathode amount */
export function anodeForCathodeOut(amm: AMMState, targetCathode: number): number {
  if (targetCathode >= amm.reserveA) return Infinity;
  const f = 1 - amm.feeRate;
  return (targetCathode * amm.reserveB) / (f * (amm.reserveA - targetCathode));
}

// ── Dual AMM Operations ─────────────────────────────────────────────

export function createDualAMM(config: {
  marketReserveUSDC: number;
  marketReserveCathode: number;
  marketFeeRate: number;
  delibReserveCathode: number;
  delibReserveAnode: number;
  delibFeeRate: number;
}): DualAMMState {
  // 70% of total cathode supply is locked in AMM liquidity, 30% is project treasury
  const lockedCathode = config.marketReserveCathode + config.delibReserveCathode;
  const totalSupply = lockedCathode / 0.70;
  const projectTreasury = totalSupply - lockedCathode;

  return {
    market: createAMM(
      config.marketReserveUSDC,
      config.marketReserveCathode,
      config.marketFeeRate,
      "USDC",
      "Cathode",
    ),
    deliberation: createAMM(
      config.delibReserveCathode,
      config.delibReserveAnode,
      config.delibFeeRate,
      "Cathode",
      "Anode",
    ),
    deliberationActive: true, // default on for backward compat (AMMSandbox)
    speakingPool: 0,
    votingPool: 0,
    feePool: 0,
    capacitrPool: 0,
    projectPool: 0,
    derivativePool: 0,
    totalCathodeSupply: totalSupply,
    projectTreasury,
  };
}

/** Buy cathode: USDC → 1% fee (5% Capacitor USDC, 45% Project USDC, 50% Derivative → Cathode via AMM1) → AMM1 → Cathode */
export function buyCathode(
  state: DualAMMState,
  usdcAmount: number,
  marketFeeRate = 0.01,
): BuyCathodeResult {
  const fee = usdcAmount * marketFeeRate;
  const effectiveUsdc = usdcAmount - fee;

  // Split fee: 5% Capacitor (USDC), 45% Project (USDC), 50% Derivative (→ Cathode via AMM1)
  const capacitrFee = fee * 0.05;
  const projectFee = fee * 0.45;
  const derivativeFeeUsdc = fee * 0.50;

  // Swap derivative portion through AMM1 to get cathode for the incentive pool
  const derivSwap = swap(state.market, derivativeFeeUsdc, "AtoB");
  // Then swap user's portion through the updated AMM
  const userSwap = swap(derivSwap.newState, effectiveUsdc, "AtoB");

  return {
    cathodeReceived: userSwap.amountOut,
    fee,
    newState: {
      ...state,
      market: userSwap.newState,
      capacitrPool: state.capacitrPool + capacitrFee,
      projectPool: state.projectPool + projectFee,
      derivativePool: state.derivativePool + derivSwap.amountOut,
    },
  };
}

/** Buy anode: Cathode → 20% fee → AMM2 → Anode (agent holds anode) */
export function buyAnode(
  state: DualAMMState,
  cathodeAmount: number,
  feeRate = 0.20,
): BuyAnodeResult {
  const fee = cathodeAmount * feeRate;
  const effectiveCathode = cathodeAmount - fee;
  const result = swap(state.deliberation, effectiveCathode, "AtoB");
  return {
    anodeReceived: result.amountOut,
    fee,
    newState: {
      ...state,
      deliberation: result.newState,
      feePool: state.feePool + fee,
    },
  };
}

/** Enter deliberation: USDC → AMM1 → Cathode → 20% fee → AMM2 → Anode (convenience) */
export function enterDeliberation(
  state: DualAMMState,
  usdcAmount: number,
  feeRate = 0.20,
): EnterResult {
  const step1 = swap(state.market, usdcAmount, "AtoB");
  const cathodeFee = step1.amountOut * feeRate;
  const effectiveCathode = step1.amountOut - cathodeFee;
  const step2 = swap(state.deliberation, effectiveCathode, "AtoB");

  return {
    cathodeReceived: step1.amountOut,
    anodeReceived: step2.amountOut,
    marketFee: step1.fee,
    deliberationFee: cathodeFee,
    newState: {
      ...state,
      market: step1.newState,
      deliberation: step2.newState,
      feePool: state.feePool + cathodeFee,
    },
  };
}

/** Speak: costs cathodeTarget cathode — sell enough anode → AMM2 → cathode → 20% fee → speaking pool */
export function speak(
  state: DualAMMState,
  cathodeTarget: number,
  feeRate = 0.20,
): ActionResult {
  // Calculate anode needed to produce cathodeTarget cathode from AMM2
  const anodeNeeded = anodeForCathodeOut(state.deliberation, cathodeTarget);
  const result = swap(state.deliberation, anodeNeeded, "BtoA");
  const fee = result.amountOut * feeRate;
  const cathodeToPool = result.amountOut - fee;

  return {
    anodeSpent: anodeNeeded,
    cathodeToPool,
    fee,
    newState: {
      ...state,
      deliberation: result.newState,
      speakingPool: state.speakingPool + cathodeToPool,
      feePool: state.feePool + fee,
    },
  };
}

/** Current anode cost to speak (for UI display) */
export function speakAnodeCost(state: DualAMMState, cathodePerSpeak: number): number {
  return anodeForCathodeOut(state.deliberation, cathodePerSpeak);
}

/** Vote: sell anode → AMM2 → cathode → 20% fee → voting pool */
export function vote(state: DualAMMState, anodeAmount: number, feeRate = 0.20): ActionResult {
  const result = swap(state.deliberation, anodeAmount, "BtoA");
  const fee = result.amountOut * feeRate;
  const cathodeToPool = result.amountOut - fee;

  return {
    anodeSpent: anodeAmount,
    cathodeToPool,
    fee,
    newState: {
      ...state,
      deliberation: result.newState,
      votingPool: state.votingPool + cathodeToPool,
      feePool: state.feePool + fee,
    },
  };
}

/** Exit: sell remaining anode → AMM2 → cathode (- 20% fee) → agent holds cathode */
export function exit(state: DualAMMState, anodeAmount: number, feeRate = 0.20): ExitResult {
  const step1 = swap(state.deliberation, anodeAmount, "BtoA");
  const fee = step1.amountOut * feeRate;
  const cathodeBack = step1.amountOut - fee;

  return {
    anodeSold: anodeAmount,
    cathodeBack,
    usdcBack: 0,
    deliberationFee: fee,
    marketFee: 0,
    newState: {
      ...state,
      deliberation: step1.newState,
      feePool: state.feePool + fee,
    },
  };
}

// ── Deliberation Lifecycle ───────────────────────────────────────────

/** Reset the deliberation AMM with fresh reserves (start of a new deliberation) */
export function resetDeliberationAMM(
  state: DualAMMState,
  delibReserveCathode: number,
  delibReserveAnode: number,
  delibFeeRate: number,
): DualAMMState {
  return {
    ...state,
    deliberation: createAMM(
      delibReserveCathode,
      delibReserveAnode,
      delibFeeRate,
      "Cathode",
      "Anode",
    ),
    deliberationActive: true,
    speakingPool: 0,
    votingPool: 0,
  };
}

/** Discharge anode at flat rate (settlement — not through AMM curve) */
export function dischargeAnode(
  state: DualAMMState,
  anodeAmount: number,
  dischargeRate: number,
  feeRate = 0.20,
): DischargeResult {
  const grossCathode = anodeAmount * dischargeRate;
  const fee = grossCathode * feeRate;
  const net = grossCathode - fee;
  return {
    cathodeReturned: net,
    fee,
    newState: {
      ...state,
      feePool: state.feePool + fee,
    },
  };
}

// ── Discussion & Proposal Operations ────────────────────────────────

/** Deduct cathode for a discussion post → feePool */
export function discussionPost(
  state: DualAMMState,
  cathodeCost: number,
): { newState: DualAMMState } {
  return {
    newState: { ...state, feePool: state.feePool + cathodeCost },
  };
}

/** Deduct cathode for posting a proposal → feePool */
export function postProposal(
  state: DualAMMState,
  cathodeCost: number,
): { newState: DualAMMState } {
  return {
    newState: { ...state, feePool: state.feePool + cathodeCost },
  };
}

/** Deduct cathode for voting on a proposal → feePool */
export function voteOnProposal(
  state: DualAMMState,
  cathodeCost: number,
): { newState: DualAMMState } {
  return {
    newState: { ...state, feePool: state.feePool + cathodeCost },
  };
}

// ── Price Queries ───────────────────────────────────────────────────

/** Cathode price in USDC */
export function cathodePrice(state: DualAMMState): number {
  return spotPrice(state.market, "AtoB"); // USDC per Cathode
}

/** Anode price in Cathode */
export function anodePriceInCathode(state: DualAMMState): number {
  return spotPrice(state.deliberation, "AtoB"); // Cathode per Anode
}

/** Anode price in USDC (derived) */
export function anodePrice(state: DualAMMState): number {
  return anodePriceInCathode(state) * cathodePrice(state);
}

/** Cost of voting (in USDC) given fixed anode amount */
export function voteCost(state: DualAMMState, anodePerVote: number): number {
  return anodePerVote * anodePrice(state);
}

// ── Default Config ──────────────────────────────────────────────────

export const DEFAULT_CONFIG = {
  // Total cathode supply: 100,000 — 70% locked liquidity, 30% project treasury (bounties)
  marketReserveUSDC: 50_000,
  marketReserveCathode: 50_000, // locked in AMM1
  marketFeeRate: 0, // internal AMM fee (0 — fee handled externally)
  marketExternalFeeRate: 0.01, // 1% fee split: 50% Incentive (→Cathode), 45% Project (USDC), 5% Capacitor (USDC)
  delibReserveCathode: 20_000, // locked in AMM2 (total locked: 50k + 20k = 70k = 70%)
  delibReserveAnode: 1_000,
  delibFeeRate: 0, // internal AMM fee (0 — fee handled externally)
  delibCathodeFeeRate: 0.20, // 20% cathode fee extracted to fee pool
  cathodePerSpeak: 10, // speaking costs 10 cathode (variable anode)
  anodePerVote: 5, // voting costs 5 anode (fixed)
  // Discussion & Proposals
  discussionMinCathode: 200, // min cathode to participate in discussion
  discussionCostPerWord: 0.01, // cathode per word in discussion
  proposalCost: 10, // cathode to post a proposal
  proposalVoteCost: 0.01, // cathode per up/downvote on proposals
  proposalThreshold: 10, // net upvotes to promote to deliberation
  proposerRewardPct: 0.05, // 5% of deliberation pool to proposer
  // Deliberation lifecycle
  bountyAmount: 1000, // cathode from treasury per deliberation
  idleRoundsToSettle: 3, // settle after this many low-activity rounds
  delibMaxDuration: 30, // hard cap on deliberation rounds
  bountyWinnerPct: 0.60, // 60% of bounty → speaking pool winner
  bountyVoterPct: 0.35, // 35% of bounty → winning voters
  cashOutProb: 0.70, // probability an agent cashes out at settlement
};

export const DEFAULT_AGENTS: Omit<AgentState, "id">[] = [
  { name: "Pioneer", usdcBalance: 500, cathodeBalance: 0, anodeBalance: 0, totalUsdcSpent: 0 },
  { name: "Builder", usdcBalance: 500, cathodeBalance: 0, anodeBalance: 0, totalUsdcSpent: 0 },
  { name: "Analyst", usdcBalance: 800, cathodeBalance: 0, anodeBalance: 0, totalUsdcSpent: 0 },
  { name: "Critic", usdcBalance: 400, cathodeBalance: 0, anodeBalance: 0, totalUsdcSpent: 0 },
  { name: "Evaluator", usdcBalance: 600, cathodeBalance: 0, anodeBalance: 0, totalUsdcSpent: 0 },
  { name: "Voter A", usdcBalance: 300, cathodeBalance: 0, anodeBalance: 0, totalUsdcSpent: 0 },
  { name: "Voter B", usdcBalance: 300, cathodeBalance: 0, anodeBalance: 0, totalUsdcSpent: 0 },
  { name: "Voter C", usdcBalance: 300, cathodeBalance: 0, anodeBalance: 0, totalUsdcSpent: 0 },
  { name: "Observer", usdcBalance: 200, cathodeBalance: 0, anodeBalance: 0, totalUsdcSpent: 0 },
  { name: "Latecomer", usdcBalance: 1000, cathodeBalance: 0, anodeBalance: 0, totalUsdcSpent: 0 },
];
