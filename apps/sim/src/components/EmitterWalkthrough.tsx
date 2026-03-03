"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  createEmitter,
  buyToken,
  sellToken,
  emitWork,
  compound,
  simulateLpFees,
  tokenSpotPrice,
  emTokenValue,
  reserveDepletionPct,
  poolTotalValueUSDC,
  advanceRound,
  WORK_ACTIONS,
  DEFAULT_EMITTER_CONFIG,
  type EmitterState,
} from "@/lib/emitter";

// ── Types ────────────────────────────────────────────────────────────

interface WalkthroughStep {
  id: string;
  phase: "launch" | "trade" | "work" | "compound" | "growth" | "outcome";
  title: string;
  narrative: string;
  state: EmitterState;
  highlight?: { label: string; value: string };
}

// ── Phase config ─────────────────────────────────────────────────────

const PHASE_COLORS: Record<string, string> = {
  launch: "bg-slate-400",
  trade: "bg-indigo-500",
  work: "bg-amber-500",
  compound: "bg-emerald-500",
  growth: "bg-blue-500",
  outcome: "bg-purple-500",
};

const PHASE_LABELS: Record<string, string> = {
  launch: "Launch",
  trade: "Trading",
  work: "Work & Emissions",
  compound: "Compounding",
  growth: "Growth",
  outcome: "Outcome",
};

// ── Formatting Helpers ───────────────────────────────────────────────

function fmtTkn(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n >= 1) return n.toFixed(0);
  return n.toFixed(2);
}

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  if (n > 0) {
    // Show enough decimals for 2-3 significant digits (no scientific notation)
    const digits = Math.max(4, -Math.floor(Math.log10(n)) + 2);
    return `$${n.toFixed(digits)}`;
  }
  return "$0";
}

/** "X.XM TKN ($Y.YY)" */
function fmtTknVal(tokens: number, pricePerToken: number): string {
  const usdc = tokens * pricePerToken;
  return `${fmtTkn(tokens)} TKN (${fmtUsd(usdc)})`;
}

/** "1 emToken = X.XX TKN ($Y.YY)" */
function fmtEmTokenVal(emPrice: number, tokenPrice: number): string {
  if (emPrice <= 0) return "—";
  const tokensPerEm = tokenPrice > 0 ? emPrice / tokenPrice : 0;
  return `${fmtTkn(tokensPerEm)} TKN (${fmtUsd(emPrice)})`;
}

// ── Small Components ─────────────────────────────────────────────────

function LedgerRow({ label, tokens, usdc, color = "text-gray-900", sub }: {
  label: string; tokens?: string; usdc?: string; color?: string; sub?: string;
}) {
  return (
    <div className="flex items-baseline justify-between py-1 border-b border-gray-50 last:border-0">
      <span className="text-[11px] text-gray-500 w-28">{label}</span>
      <span className={`text-[11px] font-mono font-bold ${color} flex-1 text-right`}>
        {tokens || "—"}
      </span>
      <span className="text-[10px] font-mono text-gray-400 w-20 text-right">
        {usdc || ""}
      </span>
      {sub && <span className="text-[9px] text-gray-400 w-16 text-right">{sub}</span>}
    </div>
  );
}

function FlowRow({ label, value, color = "text-gray-700" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className={`text-[11px] font-mono font-bold ${color}`}>{value}</span>
    </div>
  );
}

// ── State Panel ──────────────────────────────────────────────────────

function StatePanel({ state }: { state: EmitterState }) {
  const price = tokenSpotPrice(state);
  const emVal = emTokenValue(state);
  const totalSupply = state.config.totalSupply;

  // Token accounting — where are all the tokens?
  const inCurve = state.bondingCurve.reserveToken;
  const inReserve = state.reserveRemaining;
  const inPoolLp = state.emissionPool.lpReserveToken;
  const inCirculation = totalSupply - inCurve - inReserve - inPoolLp;

  // USDC accounting
  const curveUSDC = state.bondingCurve.reserveUSDC;
  const poolLpUSDC = state.emissionPool.lpReserveUSDC;
  const poolAccruedUSDC = state.emissionPool.accruedFeesUSDC;
  const poolAccruedToken = state.emissionPool.accruedFeesToken;
  const poolTotal = poolTotalValueUSDC(state);

  return (
    <div className="space-y-4">
      {/* Prices */}
      <div className="grid grid-cols-3 gap-2">
        <div className="px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50">
          <div className="text-[10px] text-indigo-500 uppercase tracking-wider">Market Cap</div>
          <div className="font-mono text-sm font-bold text-indigo-700">{fmtUsd(price * totalSupply)}</div>
        </div>
        <div className="px-3 py-2 rounded-lg border border-gray-200 bg-white">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">1 Token</div>
          <div className="font-mono text-sm font-bold text-gray-900">{fmtUsd(price)}</div>
        </div>
        <div className="px-3 py-2 rounded-lg border border-gray-200 bg-white">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">1 emToken</div>
          <div className="font-mono text-sm font-bold text-gray-900">{fmtEmTokenVal(emVal, price)}</div>
        </div>
      </div>

      {/* Token Ledger — where are the tokens? */}
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Token Ledger — {fmtTkn(totalSupply)} Total</div>
        <div className="bg-gray-50 rounded-lg p-2">
          <LedgerRow label="Bonding Curve" tokens={fmtTkn(inCurve)} usdc={fmtUsd(curveUSDC)} />
          <LedgerRow label="Emission Reserve" tokens={fmtTkn(inReserve)} usdc="—" color="text-amber-700" />
          <LedgerRow label="In Circulation" tokens={fmtTkn(inCirculation)} usdc={fmtUsd(inCirculation * price)} color="text-indigo-700" />
          {inPoolLp > 0 && (
            <LedgerRow label="Pool LP (token)" tokens={fmtTkn(inPoolLp)} usdc={fmtUsd(inPoolLp * price)} color="text-emerald-700" />
          )}
        </div>
      </div>

      {/* USDC Flows — value accumulation */}
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Cumulative USDC Flows</div>
        <div className="bg-gray-50 rounded-lg p-2">
          <FlowRow label="Creator Revenue" value={fmtUsd(state.creatorFeesTotal)} color="text-blue-700" />
          <FlowRow label="Pool Value" value={fmtUsd(poolTotal)} color="text-emerald-700" />
          <FlowRow label="Protocol Fees" value={fmtUsd(state.protocolFeesTotal)} color="text-gray-500" />
          <FlowRow label="Total Volume" value={fmtUsd(state.totalVolumeUSDC)} />
        </div>
      </div>

      {/* Pool detail — only when pool has substance */}
      {state.emissionPool.lpTokens > 0 && (
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Emission Pool Detail</div>
          <div className="bg-gray-50 rounded-lg p-2">
            <FlowRow label="LP Position" value={`${fmtTkn(inPoolLp)} TKN + ${fmtUsd(poolLpUSDC)}`} color="text-emerald-700" />
            <FlowRow label="Accrued TOKEN" value={`${fmtTkn(poolAccruedToken)} TKN (${fmtUsd(poolAccruedToken * tokenSpotPrice(state))})`} />
            <FlowRow label="Accrued USDC" value={fmtUsd(poolAccruedUSDC)} />
            <FlowRow label="Compounds" value={String(state.emissionPool.totalCompounds)} />
            <FlowRow label="LP Fees Earned" value={fmtUsd(state.emissionPool.totalLpFeesEarned)} />
            <FlowRow label="emTokens Outstanding" value={fmtTkn(state.totalEmTokenSupply)} />
          </div>
        </div>
      )}

      {/* Activity counters */}
      <div className="flex gap-4 text-[10px] text-gray-400">
        <span>Work Events: <span className="font-mono font-bold text-gray-600">{state.totalEmissionEvents}</span> ({state.totalWorkUnits} units)</span>
        <span>Compounds: <span className="font-mono font-bold text-gray-600">{state.emissionPool.totalCompounds}</span></span>
        <span>Round: <span className="font-mono font-bold text-gray-600">{state.round}</span></span>
      </div>
    </div>
  );
}

// ── Build Steps ──────────────────────────────────────────────────────

function buildSteps(): WalkthroughStep[] {
  const steps: WalkthroughStep[] = [];
  // $3K initial market cap: USDC liquidity determines starting FDV
  // FDV = (reserveUSDC / reserveToken) × totalSupply ≈ reserveUSDC² × totalSupply / k
  let state = createEmitter({ ...DEFAULT_EMITTER_CONFIG, initialReserveUSDC: 3000 });

  const mcap = (s: EmitterState) => tokenSpotPrice(s) * s.config.totalSupply;

  // 1. Launch — $3K market cap
  const curveTokens = state.bondingCurve.reserveToken;
  const reserveTokens = state.reserveRemaining;
  steps.push({
    id: "launch",
    phase: "launch",
    title: "A New Project Launches",
    narrative:
      `A creator deploys ${fmtTkn(state.config.totalSupply)} tokens on Capacitor.\n\n• ${fmtTkn(curveTokens)} TKN → Bonding Curve (priced by constant product AMM)\n• ${fmtTkn(reserveTokens)} TKN → Emission Reserve (distributed to contributors)\n\nThe bonding curve starts with ${fmtUsd(state.config.initialReserveUSDC)} of USDC liquidity. At this ratio, 1 TKN = ${fmtUsd(tokenSpotPrice(state))}.\n\nMarket cap: ${fmtUsd(mcap(state))}\n\nTrading begins immediately. No presale. No insiders.`,
    state: { ...state },
    highlight: { label: "Market Cap", value: fmtUsd(mcap(state)) },
  });

  // 2. First trade — $500 buy
  const priceBefore1 = tokenSpotPrice(state);
  const buy1 = buyToken(state, 500);
  state = buy1.newState;
  const priceAfter1 = tokenSpotPrice(state);
  steps.push({
    id: "first-trade",
    phase: "trade",
    title: "First Trade",
    narrative:
      `Someone spends ${fmtUsd(500)} to buy tokens. The bonding curve prices the swap:\n\n→ They receive ${fmtTkn(buy1.tokensTraded)} TKN (worth ${fmtUsd(buy1.tokensTraded * priceAfter1)} at new price)\n→ Price moved from ${fmtUsd(priceBefore1)} → ${fmtUsd(priceAfter1)} per TKN\n→ Market cap: ${fmtUsd(mcap(state))}\n\n1.5% fee (${fmtUsd(buy1.fee)} equiv), 60:40 USDC:TOKEN split:\n• ${fmtUsd(buy1.creatorFee)} USDC → Creator (50%)\n• ${fmtUsd(buy1.protocolFee)} USDC → Protocol (10%)\n• ${fmtTkn(buy1.poolFeeToken)} TKN → Emission Pool (40%)\n\n${fmtTkn(buy1.tokensTraded)} tokens left the bonding curve into the buyer's hands.`,
    state: { ...state },
    highlight: { label: "Market Cap", value: fmtUsd(mcap(state)) },
  });

  // 3. First work → Action A (Tweet, free, 1 work unit)
  const work1 = emitWork(state, "A");
  state = work1.newState;
  steps.push({
    id: "first-work",
    phase: "work",
    title: "First Work — Action A (Tweet)",
    narrative:
      `A contributor tweets about the project — Action A.\n\n→ ${fmtTkn(work1.emTokensMinted)} emTokens minted (${work1.workUnits} work unit)\n→ ${fmtTkn(work1.tokensFromReserve)} TKN drawn from emission reserve\n→ Reserve remaining: ${fmtTkn(state.reserveRemaining)} TKN (${work1.reserveRemainingPct.toFixed(1)}% left)\n→ Cost: Free\n\nTwo types of work:\n• Action A (${WORK_ACTIONS.A.label}) — ${WORK_ACTIONS.A.workUnits} work unit, free\n• Action B (${WORK_ACTIONS.B.label}) — ${WORK_ACTIONS.B.workUnits} work units, costs $${WORK_ACTIONS.B.costUSDC} USDC (→ creator revenue)\n\nDecay curve: Tokens(n) = ${DEFAULT_EMITTER_CONFIG.emissionBase.toLocaleString()} / (1 + ${DEFAULT_EMITTER_CONFIG.decayK} × n)\nEarly contributors earn more. Action B advances the curve 5× faster.`,
    state: { ...state },
    highlight: { label: "Action A — Tweet", value: `${fmtTkn(work1.emTokensMinted)} emTokens (${work1.workUnits} unit, free)` },
  });

  // 3b. Action B (Purchase, $1 USDC, 5 work units)
  const workB1 = emitWork(state, "B");
  state = workB1.newState;
  steps.push({
    id: "first-action-b",
    phase: "work",
    title: "Action B — Purchase ($1 USDC)",
    narrative:
      `A contributor makes a purchase — Action B. This costs $${WORK_ACTIONS.B.costUSDC} USDC, which goes to the creator as revenue.\n\n→ ${fmtTkn(workB1.emTokensMinted)} emTokens minted (${workB1.workUnits} work units)\n→ ${fmtTkn(workB1.tokensFromReserve)} TKN drawn from reserve\n→ $${workB1.revenueGenerated} → Creator revenue (total: ${fmtUsd(state.creatorFeesTotal)})\n→ Work revenue tracked: ${fmtUsd(state.workRevenue)}\n\nCompare to Action A's ${fmtTkn(work1.emTokensMinted)} emTokens:\nAction B earns ~${(workB1.emTokensMinted / work1.emTokensMinted).toFixed(1)}× more tokens, but advances the decay curve by ${workB1.workUnits} positions instead of ${work1.workUnits}.\n\nThe tradeoff: more tokens now, but future emissions decrease faster.`,
    state: { ...state },
    highlight: { label: "Action B — Purchase", value: `${fmtTkn(workB1.emTokensMinted)} emTokens (${workB1.workUnits} units, $${WORK_ACTIONS.B.costUSDC})` },
  });

  // 4. More trading — escalating buys drive market cap up
  const buy2 = buyToken(state, 2_000);
  state = buy2.newState;
  const buy3 = buyToken(state, 5_000);
  state = buy3.newState;
  const sell1 = sellToken(state, buy3.tokensTraded * 0.3);
  state = sell1.newState;
  const buy4 = buyToken(state, 10_000);
  state = buy4.newState;

  const tokensNowInCirc = state.config.totalSupply - state.bondingCurve.reserveToken - state.reserveRemaining - state.emissionPool.lpReserveToken;
  const circValue = tokensNowInCirc * tokenSpotPrice(state);
  steps.push({
    id: "more-trading",
    phase: "trade",
    title: "Trading Picks Up",
    narrative:
      `More traders arrive. Buys of $2K, $5K, and $10K USDC. One sells 30% of their position.\n\nToken movement so far:\n→ ${fmtTkn(tokensNowInCirc)} TKN have left the bonding curve (worth ${fmtUsd(circValue)})\n→ ${fmtTkn(state.bondingCurve.reserveToken)} TKN remain in curve\n→ Token price: ${fmtUsd(tokenSpotPrice(state))}\n→ Market cap: ${fmtUsd(mcap(state))}\n\nFee accumulation:\n→ Creator (USDC): ${fmtUsd(state.creatorFeesTotal)}\n→ Pool accrued (TOKEN): ${fmtTkn(state.emissionPool.accruedFeesToken)} TKN (${fmtUsd(state.emissionPool.accruedFeesToken * tokenSpotPrice(state))})\n→ Total volume: ${fmtUsd(state.totalVolumeUSDC)}`,
    state: { ...state },
    highlight: { label: "Market Cap", value: fmtUsd(mcap(state)) },
  });

  // 5. More work — alternate Action A and B to show decay
  const work2 = emitWork(state, "A");
  state = work2.newState;
  const work3 = emitWork(state, "B");
  state = work3.newState;
  const work4 = emitWork(state, "A");
  state = work4.newState;
  const work5 = emitWork(state, "B");
  state = work5.newState;

  const totalEmTokensSoFar = state.totalEmTokenSupply;
  const reserveUsed = state.reserveTotal - state.reserveRemaining;
  steps.push({
    id: "more-work",
    phase: "work",
    title: "More Contributors Arrive",
    narrative:
      `Four more contributors do qualifying work, mixing Action A and B:\n\n• Action A (Tweet): ${fmtTkn(work2.tokensFromReserve)} TKN → ${fmtTkn(work2.emTokensMinted)} emTokens (${work2.workUnits} unit)\n• Action B (Purchase): ${fmtTkn(work3.tokensFromReserve)} TKN → ${fmtTkn(work3.emTokensMinted)} emTokens (${work3.workUnits} units, $${work3.revenueGenerated})\n• Action A (Tweet): ${fmtTkn(work4.tokensFromReserve)} TKN → ${fmtTkn(work4.emTokensMinted)} emTokens (${work4.workUnits} unit)\n• Action B (Purchase): ${fmtTkn(work5.tokensFromReserve)} TKN → ${fmtTkn(work5.emTokensMinted)} emTokens (${work5.workUnits} units, $${work5.revenueGenerated})\n\nReserve: ${fmtTkn(reserveUsed)} TKN used of ${fmtTkn(state.reserveTotal)} → ${fmtTkn(state.reserveRemaining)} remaining\nWork revenue so far: ${fmtUsd(state.workRevenue)} (from Action B → creator)\nTotal emTokens outstanding: ${fmtTkn(totalEmTokensSoFar)}`,
    state: { ...state },
    highlight: { label: "Reserve Drawn", value: `${fmtTkn(reserveUsed)} TKN used → ${fmtTkn(state.reserveRemaining)} remaining` },
  });

  // 6. First compound — generate fees with more trades
  for (let i = 0; i < 3; i++) {
    const b = buyToken(state, 1_000);
    state = b.newState;
  }
  const preCompound = { ...state };
  const compResult = compound(state);
  state = compResult.newState;

  steps.push({
    id: "first-compound",
    phase: "compound",
    title: "First Compound",
    narrative:
      `The pool has accumulated ${fmtTkn(preCompound.emissionPool.accruedFeesToken)} TKN (from trade fees) + ${fmtUsd(preCompound.emissionPool.accruedFeesUSDC)} USDC (from LP fees). Time to compound.\n\nThe mechanism:\n1. Value TOKEN + USDC at spot price (total: ${fmtUsd(preCompound.emissionPool.accruedFeesToken * tokenSpotPrice(preCompound) + preCompound.emissionPool.accruedFeesUSDC)})\n2. Rebalance to 50/50 by selling/buying through the curve\n3. Pair ${fmtUsd(compResult.usdcAddedToLp)} USDC + ${fmtTkn(compResult.tokensAddedToLp)} TKN → mint LP\n\nPool LP position is now:\n→ ${fmtTkn(state.emissionPool.lpReserveToken)} TKN + ${fmtUsd(state.emissionPool.lpReserveUSDC)}\n→ Total pool value: ${fmtUsd(poolTotalValueUSDC(state))}\n\nThe key: the pool compounds. The creator's revenue doesn't.`,
    state: { ...state },
    highlight: { label: "Pool Position", value: `${fmtTkn(state.emissionPool.lpReserveToken)} TKN + ${fmtUsd(state.emissionPool.lpReserveUSDC)}` },
  });

  // 7. Simulate LP fees (volume proportional to recent trading)
  const poolBefore = poolTotalValueUSDC(state);
  state = simulateLpFees(state, 20_000);
  const poolAfter = poolTotalValueUSDC(state);
  steps.push({
    id: "lp-fees",
    phase: "compound",
    title: "LP Fees Compound Too",
    narrative:
      `The pool doesn't just earn from the 40% TOKEN fee allocation. As an LP position, it also earns DEX-level trading fees (0.3%).\n\nPool value: ${fmtUsd(poolBefore)} → ${fmtUsd(poolAfter)} (+${fmtUsd(poolAfter - poolBefore)} from LP fees)\n\nTwo income streams, both compound:\n1. 40% of 1.5% trade fee → collected as TOKEN, compounded into LP\n2. 0.3% LP trading fees → collected as USDC, compounded into LP\n\nThis dual-sided compounding is why the pool grows faster than linear.\n\nEvery emToken holder's share of this pool grows with it. 1 emToken = ${fmtEmTokenVal(emTokenValue(state), tokenSpotPrice(state))}`,
    state: { ...state },
    highlight: { label: "emToken Value", value: `1 emToken = ${fmtEmTokenVal(emTokenValue(state), tokenSpotPrice(state))}` },
  });

  // 8. Growth — 30 rounds of escalating activity → ~$500K market cap
  for (let round = 0; round < 30; round++) {
    // Escalating buy amounts: $300 → $938 per round
    const buyAmt = 300 + round * 22;
    const b = buyToken(state, buyAmt);
    state = b.newState;

    // Occasional profit-taking (smaller than buys → net growth)
    if (round % 4 === 0) {
      const s = sellToken(state, b.tokensTraded * 0.15);
      state = s.newState;
    }

    // Work every few rounds — alternate Action A and B
    if (round % 2 === 0 && reserveDepletionPct(state) < 100) {
      const action = round % 4 === 0 ? "B" : "A";
      const w = emitWork(state, action);
      state = w.newState;
    }

    // Compound when fees accumulate
    const accruedValue = state.emissionPool.accruedFeesToken * tokenSpotPrice(state) + state.emissionPool.accruedFeesUSDC;
    if (accruedValue >= state.config.compoundThresholdUSDC) {
      const c = compound(state);
      state = c.newState;
    }

    // LP fees from trading volume
    state = simulateLpFees(state, buyAmt * 2);
    state = advanceRound(state);
  }

  const peakMcap = mcap(state);
  const growthEmVal = emTokenValue(state);
  const growthPrice = tokenSpotPrice(state);
  const growthPoolVal = poolTotalValueUSDC(state);
  const tokensInPool30 = state.emissionPool.lpReserveToken;
  steps.push({
    id: "growth",
    phase: "growth",
    title: "30 Rounds Later",
    narrative:
      `30 rounds of trading, work, and compounding. Market cap: ${fmtUsd(mcap(state))}.\n\nToken accounting:\n→ ${fmtTkn(state.bondingCurve.reserveToken)} TKN in bonding curve\n→ ${fmtTkn(state.reserveRemaining)} TKN in emission reserve (${state.totalEmissionEvents} work events, ${state.totalWorkUnits} work units)\n→ ${fmtTkn(tokensInPool30)} TKN in pool LP position\n→ 1 TKN = ${fmtUsd(growthPrice)}\n\nValue accumulation:\n→ Creator: ${fmtUsd(state.creatorFeesTotal)} (fees + work revenue: ${fmtUsd(state.workRevenue)})\n→ Pool: ${fmtUsd(growthPoolVal)} (${fmtTkn(tokensInPool30)} TKN + ${fmtUsd(state.emissionPool.lpReserveUSDC)})\n→ ${state.emissionPool.totalCompounds} compounds\n\n1 emToken = ${fmtEmTokenVal(growthEmVal, growthPrice)}\n${fmtTkn(state.totalEmTokenSupply)} emTokens outstanding, backed by ${fmtUsd(growthPoolVal)}`,
    state: { ...state },
    highlight: { label: "Market Cap", value: fmtUsd(mcap(state)) },
  });

  // 9. Bear market — sells drive market cap down to ~$200K
  for (let round = 0; round < 10; round++) {
    // Heavy selling: 5.2% of curve's token reserve per round
    const s = sellToken(state, state.bondingCurve.reserveToken * 0.052);
    state = s.newState;

    // Some buying continues (much smaller)
    if (round % 3 === 0) {
      const b = buyToken(state, 200);
      state = b.newState;
    }

    // Compound continues — sells generate fees too
    const bearAccrued = state.emissionPool.accruedFeesToken * tokenSpotPrice(state) + state.emissionPool.accruedFeesUSDC;
    if (bearAccrued >= state.config.compoundThresholdUSDC) {
      const c = compound(state);
      state = c.newState;
    }

    state = simulateLpFees(state, 500);
    state = advanceRound(state);
  }

  const bearPoolVal = poolTotalValueUSDC(state);
  const bearEmVal = emTokenValue(state);
  const bearPrice = tokenSpotPrice(state);
  steps.push({
    id: "bear-market",
    phase: "growth",
    title: "Bear Market",
    narrative:
      `Selling increases. Market cap drops from ${fmtUsd(peakMcap)} → ${fmtUsd(mcap(state))}.\nToken price: ${fmtUsd(bearPrice)}.\n\nBut watch the pool:\n→ Pool value: ${fmtUsd(bearPoolVal)} (${fmtTkn(state.emissionPool.lpReserveToken)} TKN + ${fmtUsd(state.emissionPool.lpReserveUSDC)})\n→ ${state.emissionPool.totalCompounds} total compounds\n→ 1 emToken = ${fmtEmTokenVal(bearEmVal, bearPrice)}\n\nWhy? Every sell also generates fees. Volatility drives volume. Volume drives compounding.\n\nCreator revenue: ${fmtUsd(state.creatorFeesTotal)} (slows with volume)\nPool: keeps compounding on every trade, buy or sell.`,
    state: { ...state },
    highlight: { label: "Market Cap After Bear", value: `${fmtUsd(peakMcap)} → ${fmtUsd(mcap(state))}` },
  });

  // 10. Final state — the thesis
  const finalPoolVal = poolTotalValueUSDC(state);
  const finalEmVal = emTokenValue(state);
  const finalPrice = tokenSpotPrice(state);
  steps.push({
    id: "outcome",
    phase: "outcome",
    title: "The People Who Built It Own More of It",
    narrative:
      `This is the Capacitor thesis.\n\nCreator: ${fmtUsd(state.creatorFeesTotal)} liquid revenue. Immediately useful.\n\nPool: ${fmtUsd(finalPoolVal)} in value (${fmtTkn(state.emissionPool.lpReserveToken)} TKN + ${fmtUsd(state.emissionPool.lpReserveUSDC)}). Auto-compounding. ${state.emissionPool.totalCompounds} compounds so far.\n\n${fmtTkn(state.totalEmTokenSupply)} emTokens outstanding, each worth ${fmtEmTokenVal(finalEmVal, finalPrice)}.\n\nThe people who did the work hold emTokens backed by an LP position that grows with every trade. Their ownership compounds. Time favors the participants.\n\nThe creator gets revenue. The community gets ownership. The incentives are aligned.\n\nMarket cap: ${fmtUsd(mcap(state))}`,
    state: { ...state },
    highlight: { label: "1 emToken", value: `= ${fmtEmTokenVal(finalEmVal, finalPrice)}` },
  });

  return steps;
}

// ── Main Component ───────────────────────────────────────────────────

export default function EmitterWalkthrough() {
  const steps = useMemo(() => buildSteps(), []);
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];

  const goNext = useCallback(() => setStepIndex((i) => Math.min(i + 1, steps.length - 1)), [steps.length]);
  const goPrev = useCallback(() => setStepIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const phases = ["launch", "trade", "work", "compound", "growth", "outcome"];
  const phaseIndex = phases.indexOf(step.phase) + 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Emitter Walkthrough</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${PHASE_COLORS[step.phase]}`} />
              <span className="text-xs text-gray-500">
                Phase {phaseIndex} of {phases.length}: {PHASE_LABELS[step.phase]}
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-400">Step-by-step launchpad economics</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-5 pb-28">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-6">
          {/* Visual Panel — State */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <StatePanel state={step.state} />
            </div>
          </div>

          {/* Narrative Panel */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {step.narrative}
              </div>
              {step.highlight && (
                <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3">
                  <div className="text-[10px] text-indigo-500 uppercase tracking-wider">
                    {step.highlight.label}
                  </div>
                  <div className="text-lg font-bold font-mono text-indigo-700">
                    {step.highlight.value}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={goPrev}
              disabled={stepIndex === 0}
              className="px-4 py-1.5 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span className="text-xs text-gray-500">
              Step {stepIndex + 1} of {steps.length}
            </span>
            <button
              onClick={goNext}
              disabled={stepIndex === steps.length - 1}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex gap-0.5">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStepIndex(i)}
                className={`flex-1 h-1.5 rounded-full transition-all duration-200 ${
                  i === stepIndex
                    ? `${PHASE_COLORS[s.phase]} ring-2 ring-offset-1 ring-gray-300`
                    : i < stepIndex
                    ? PHASE_COLORS[s.phase]
                    : "bg-gray-200"
                }`}
                style={{ opacity: i <= stepIndex ? 1 : 0.4 }}
                title={s.title}
              />
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
