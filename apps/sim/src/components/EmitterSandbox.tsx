"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  createEmitter,
  buyToken,
  compound,
  decayCurveTokens,
  tokenSpotPrice,
  emTokenValue,
  reserveDepletionPct,
  poolShareOfLiquidity,
  poolTotalValueUSDC,
  poolFeePct,
  estimateReserveDepletionRound,
  WORK_ACTIONS,
  DEFAULT_EMITTER_CONFIG,
  type EmitterConfig,
} from "@/lib/emitter";
import {
  DEFAULT_LAUNCHPAD_SETUP_VALUES,
  loadLaunchpadSetupValues,
  saveLaunchpadSetupValues,
  type LaunchpadSetupValues,
} from "@/lib/emitter-setup";

// ── Helpers ─────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${fmt(n / 1_000_000, 2)}M`;
  if (n >= 1_000) return `$${fmt(n / 1_000, 2)}K`;
  if (n >= 1) return `$${fmt(n, 2)}`;
  if (n >= 0.01) return `$${fmt(n, 4)}`;
  if (n > 0) {
    const digits = Math.max(4, -Math.floor(Math.log10(n)) + 2);
    return `$${n.toFixed(digits)}`;
  }
  return "$0";
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000_000) return `${fmt(n / 1_000_000_000, 2)}B`;
  if (n >= 1_000_000) return `${fmt(n / 1_000_000, 1)}M`;
  if (n >= 1_000) return `${fmt(n / 1_000, 1)}K`;
  return fmt(n, 0);
}

function pct(n: number): string {
  return `${fmt(n * 100, 1)}%`;
}

// ── Sparkline ───────────────────────────────────────────────────────

function Sparkline({
  data,
  color = "bg-indigo-400",
  height = "h-20",
  label,
  formatValue,
}: {
  data: number[];
  color?: string;
  height?: string;
  label?: string;
  formatValue?: (v: number) => string;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 0.001);
  const step = Math.max(1, Math.ceil(data.length / 120));
  const sampled = data.filter((_, i) => i % step === 0);

  return (
    <div>
      {label && (
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
          {label}
        </div>
      )}
      <div className={`flex items-end gap-px ${height}`}>
        {sampled.map((v, i) => (
          <div
            key={i}
            className={`flex-1 ${color} rounded-t-sm min-w-[2px]`}
            style={{ height: `${Math.max(1, (v / max) * 100)}%` }}
            title={formatValue ? formatValue(v) : fmt(v, 4)}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-gray-300 mt-0.5">
        <span>{formatValue ? formatValue(sampled[0]) : fmt(sampled[0], 2)}</span>
        <span>{formatValue ? formatValue(sampled[sampled.length - 1]) : fmt(sampled[sampled.length - 1], 2)}</span>
      </div>
    </div>
  );
}

// ── Dual Line Chart ─────────────────────────────────────────────────

function DualSparkline({
  dataA,
  dataB,
  colorA = "bg-emerald-400",
  colorB = "bg-indigo-400",
  labelA,
  labelB,
  height = "h-20",
  title,
}: {
  dataA: number[];
  dataB: number[];
  colorA?: string;
  colorB?: string;
  labelA: string;
  labelB: string;
  height?: string;
  title?: string;
}) {
  if (dataA.length === 0) return null;
  const allMax = Math.max(...dataA, ...dataB, 0.001);
  const step = Math.max(1, Math.ceil(dataA.length / 80));
  const sampledA = dataA.filter((_, i) => i % step === 0);
  const sampledB = dataB.filter((_, i) => i % step === 0);

  return (
    <div>
      {title && (
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
          {title}
        </div>
      )}
      <div className={`relative ${height}`}>
        <div className="absolute inset-0 flex items-end gap-px">
          {sampledA.map((v, i) => (
            <div
              key={`a-${i}`}
              className={`flex-1 ${colorA} rounded-t-sm min-w-[2px] opacity-60`}
              style={{ height: `${Math.max(1, (v / allMax) * 100)}%` }}
              title={`${labelA}: ${fmt(v, 4)}`}
            />
          ))}
        </div>
        <div className="absolute inset-0 flex items-end gap-px">
          {sampledB.map((v, i) => (
            <div
              key={`b-${i}`}
              className={`flex-1 ${colorB} rounded-t-sm min-w-[1px] opacity-60`}
              style={{ height: `${Math.max(1, (v / allMax) * 100)}%` }}
              title={`${labelB}: ${fmt(v, 4)}`}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-3 text-[9px] mt-1">
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-sm ${colorA}`} /> {labelA}
        </span>
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-sm ${colorB}`} /> {labelB}
        </span>
      </div>
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3">
      <div className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-lg font-mono font-bold text-gray-900 mt-0.5">{value}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export default function EmitterSandbox() {
  // Config state
  const [decayK, setDecayK] = useState(DEFAULT_LAUNCHPAD_SETUP_VALUES.decayK);
  const [creatorPct, setCreatorPct] = useState(DEFAULT_LAUNCHPAD_SETUP_VALUES.creatorPct);
  const [protocolPct, setProtocolPct] = useState(DEFAULT_LAUNCHPAD_SETUP_VALUES.protocolPct);
  const [reservePct, setReservePct] = useState(DEFAULT_LAUNCHPAD_SETUP_VALUES.reservePct);
  const [projectPct, setProjectPct] = useState(DEFAULT_LAUNCHPAD_SETUP_VALUES.projectPct);
  const [bountyPct, setBountyPct] = useState(DEFAULT_LAUNCHPAD_SETUP_VALUES.bountyPct);
  const [tradeFeeRate, setTradeFeeRate] = useState(DEFAULT_LAUNCHPAD_SETUP_VALUES.tradeFeeRate);
  const [lpFeeRate, setLpFeeRate] = useState(DEFAULT_LAUNCHPAD_SETUP_VALUES.lpFeeRate);
  const [marketCapInput, setMarketCapInput] = useState(DEFAULT_LAUNCHPAD_SETUP_VALUES.marketCapInput);
  const hydratedRef = useRef(false);

  useEffect(() => {
    const saved = loadLaunchpadSetupValues();
    if (saved) {
      setDecayK(saved.decayK);
      setCreatorPct(saved.creatorPct);
      setProtocolPct(saved.protocolPct);
      setReservePct(saved.reservePct);
      setProjectPct(saved.projectPct);
      setBountyPct(saved.bountyPct);
      setTradeFeeRate(saved.tradeFeeRate);
      setLpFeeRate(saved.lpFeeRate);
      setMarketCapInput(saved.marketCapInput);
    }
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const values: LaunchpadSetupValues = {
      decayK,
      creatorPct,
      protocolPct,
      reservePct,
      projectPct,
      bountyPct,
      tradeFeeRate,
      lpFeeRate,
      marketCapInput,
    };
    saveLaunchpadSetupValues(values);
  }, [
    decayK,
    creatorPct,
    protocolPct,
    reservePct,
    projectPct,
    bountyPct,
    tradeFeeRate,
    lpFeeRate,
    marketCapInput,
  ]);

  // Derived: pool gets whatever creator+protocol don't
  const emissionPoolPct = Math.max(0, 1 - creatorPct - protocolPct);
  const usdcPct = creatorPct + protocolPct; // USDC portion of fee

  // Derived: LP gets whatever allocation buckets don't
  const allocatedPct = reservePct + projectPct + bountyPct;
  const lpPct = Math.max(0, 1 - allocatedPct);
  const allocationWarning = allocatedPct > 1.0;

  // Derive initialReserveUSDC from market cap: FDV = reserveUSDC / lpPct
  const targetMarketCap = Math.max(0.01, parseFloat(marketCapInput) || 1);
  const initialReserveUSDC = targetMarketCap * lpPct;

  // Derived config
  const config: Partial<EmitterConfig> = useMemo(() => ({
    decayK,
    creatorPct,
    protocolPct,
    reservePct,
    projectPct,
    bountyPct,
    tradeFeeRate,
    lpFeeRate,
    initialReserveUSDC,
  }), [decayK, creatorPct, protocolPct, reservePct, projectPct, bountyPct, tradeFeeRate, lpFeeRate, initialReserveUSDC]);

  // Fee split warning
  const feeTotal = creatorPct + protocolPct;
  const feeWarning = feeTotal > 1.0;

  // Compute data
  const data = useMemo(() => {
    const fullConfig = { ...DEFAULT_EMITTER_CONFIG, ...config };
    const state = createEmitter(config);

    // Decay curve data (first 500 emissions)
    const decayCurve: number[] = [];
    for (let n = 0; n < 500; n++) {
      decayCurve.push(decayCurveTokens(fullConfig, n));
    }

    // Reserve depletion curve (cap at 500 points for performance)
    const reserveDepletion: number[] = [];
    let remaining = state.reserveTotal;
    const depletionStep = Math.max(1, Math.ceil(2000 / 500));
    for (let n = 0; n < 2000 && remaining > 0; n++) {
      const tokens = decayCurveTokens(fullConfig, n);
      remaining = Math.max(0, remaining - tokens);
      if (n % depletionStep === 0) {
        reserveDepletion.push((remaining / state.reserveTotal) * 100);
      }
    }

    // Compounding projection: simulate 100 rounds with fixed volume
    const assumedVolumePerRound = 0.5; // USDC
    const projLinear: number[] = [];
    const projCompound: number[] = [];
    let linearAccum = 0;
    const poolPctDerived = poolFeePct(fullConfig);
    let simState = state;
    for (let r = 0; r < 100; r++) {
      // Linear: approximate pool fee value (TOKEN portion converted at spot price)
      const fee = assumedVolumePerRound * fullConfig.tradeFeeRate;
      linearAccum += fee * poolPctDerived;
      projLinear.push(linearAccum);

      // Actual compounding simulation
      const buyResult = buyToken(simState, assumedVolumePerRound);
      simState = buyResult.newState;
      const compResult = compound(simState);
      if (compResult.lpTokensMinted > 0) {
        simState = compResult.newState;
      }
      projCompound.push(poolTotalValueUSDC(simState));
    }

    // Key metrics — per work unit
    const emission1 = decayCurveTokens(fullConfig, 0);
    const emission100 = decayCurveTokens(fullConfig, 99);
    const emission1000 = decayCurveTokens(fullConfig, 999);
    // Assume mix: 3 Action A (3 units) + 2 Action B (10 units) = 5 events, 13 units/round
    const avgWorkUnitsPerEvent = 13 / 5;
    const depletionRound = estimateReserveDepletionRound(fullConfig, 5, avgWorkUnitsPerEvent);

    return {
      decayCurve,
      reserveDepletion,
      projLinear,
      projCompound,
      emission1,
      emission100,
      emission1000,
      depletionRound,
      tokenPrice: tokenSpotPrice(state),
      totalReserve: state.reserveTotal,
      projectAllocation: state.projectAllocation,
      bountyAllocation: state.bountyAllocation,
      curveTokens: state.bondingCurve.reserveToken,
      totalSupply: fullConfig.totalSupply,
    };
  }, [config]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Launchpad Setup</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure how decay curves, fee splits, and compounding will run in simulations.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* ── Left: Controls ────────────────────────────── */}
          <div className="col-span-3 space-y-3">
            {/* Decay Curve */}
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="text-xs font-semibold text-gray-700 mb-2">Decay Curve</div>
              <label className="text-[10px] text-gray-400 block">
                K = {decayK.toFixed(4)}
              </label>
              <input
                type="range" min={0.0001} max={0.05} step={0.0001}
                value={decayK}
                onChange={(e) => setDecayK(parseFloat(e.target.value))}
                className="w-full h-1.5 accent-indigo-500"
              />
              <div className="flex justify-between text-[9px] text-gray-300">
                <span>Gentle</span><span>Aggressive</span>
              </div>
            </div>

            {/* Fee Split — 60:40 USDC:TOKEN */}
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Fee Split
                {feeWarning && (
                  <span className="text-red-500 ml-1">(USDC &gt; 100%)</span>
                )}
              </div>
              <div className="text-[9px] text-gray-400 mb-2">
                {pct(usdcPct)} USDC → Creator + Protocol &middot; {pct(emissionPoolPct)} TOKEN → Pool
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-amber-600">Creator (USDC): {pct(creatorPct)}</label>
                  <input
                    type="range" min={0} max={0.90} step={0.001}
                    value={creatorPct}
                    onChange={(e) => setCreatorPct(parseFloat(e.target.value))}
                    className="w-full h-1.5 accent-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-violet-600">Protocol (USDC): {pct(protocolPct)}</label>
                  <input
                    type="range" min={0} max={0.30} step={0.001}
                    value={protocolPct}
                    onChange={(e) => setProtocolPct(parseFloat(e.target.value))}
                    className="w-full h-1.5 accent-violet-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-emerald-600">Pool (TOKEN): {pct(emissionPoolPct)}</label>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${emissionPoolPct * 100}%` }} />
                  </div>
                  <div className="text-[9px] text-gray-300 mt-0.5">Auto: 1 − Creator − Protocol</div>
                </div>
              </div>
              {/* Fee bar visual */}
              <div className="flex h-4 rounded-full overflow-hidden mt-2">
                <div className="bg-amber-400" style={{ width: `${creatorPct * 100}%` }} />
                <div className="bg-violet-400" style={{ width: `${protocolPct * 100}%` }} />
                <div className="bg-emerald-400" style={{ width: `${emissionPoolPct * 100}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                <span>USDC side</span><span>TOKEN side</span>
              </div>
            </div>

            {/* Token Allocation */}
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Token Allocation
                {allocationWarning && (
                  <span className="text-red-500 ml-1">(&gt; 100%)</span>
                )}
              </div>
              <div className="text-[9px] text-gray-400 mb-2">
                {pct(lpPct)} LP &middot; {pct(reservePct)} Reserve &middot; {pct(projectPct)} Project &middot; {pct(bountyPct)} Bounty
              </div>
              {/* Starting Market Cap */}
              <div className="mb-3">
                <label className="text-[10px] text-gray-500 block mb-1">Starting Market Cap (FDV)</label>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-gray-400">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={marketCapInput}
                    onChange={(e) => setMarketCapInput(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm font-mono text-gray-800 focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="text-[9px] text-gray-300 mt-0.5">Initial USDC in curve: {fmtUsd(initialReserveUSDC)}</div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-indigo-600">Emission Reserve: {pct(reservePct)}</label>
                  <input
                    type="range" min={0.01} max={0.20} step={0.001}
                    value={reservePct}
                    onChange={(e) => setReservePct(parseFloat(e.target.value))}
                    className="w-full h-1.5 accent-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-teal-600">Project: {pct(projectPct)}</label>
                  <input
                    type="range" min={0} max={0.30} step={0.001}
                    value={projectPct}
                    onChange={(e) => setProjectPct(parseFloat(e.target.value))}
                    className="w-full h-1.5 accent-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-cyan-600">Bounty: {pct(bountyPct)}</label>
                  <input
                    type="range" min={0} max={0.20} step={0.001}
                    value={bountyPct}
                    onChange={(e) => setBountyPct(parseFloat(e.target.value))}
                    className="w-full h-1.5 accent-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-blue-600">LP (Bonding Curve): {pct(lpPct)}</label>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${lpPct * 100}%` }} />
                  </div>
                  <div className="text-[9px] text-gray-300 mt-0.5">Auto: 1 − Reserve − Project − Bounty</div>
                </div>
              </div>
              {/* Allocation bar visual */}
              <div className="flex h-4 rounded-full overflow-hidden mt-2">
                <div className="bg-blue-400" style={{ width: `${lpPct * 100}%` }} />
                <div className="bg-indigo-400" style={{ width: `${reservePct * 100}%` }} />
                <div className="bg-teal-400" style={{ width: `${projectPct * 100}%` }} />
                <div className="bg-cyan-400" style={{ width: `${bountyPct * 100}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                <span>LP</span><span>Reserve</span><span>Project</span><span>Bounty</span>
              </div>
            </div>

            {/* Fees */}
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="text-xs font-semibold text-gray-700 mb-2">Economics</div>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-gray-400">Trade Fee: {pct(tradeFeeRate)}</label>
                  <input
                    type="range" min={0.005} max={0.05} step={0.001}
                    value={tradeFeeRate}
                    onChange={(e) => setTradeFeeRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 accent-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">LP Fee: {pct(lpFeeRate)}</label>
                  <input
                    type="range" min={0.001} max={0.01} step={0.001}
                    value={lpFeeRate}
                    onChange={(e) => setLpFeeRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 accent-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Center: Charts ────────────────────────────── */}
          <div className="col-span-6 space-y-4">
            {/* Decay Curve Chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <Sparkline
                data={data.decayCurve}
                color="bg-indigo-400"
                height="h-28"
                label="Decay Curve — Tokens per Work Unit"
                formatValue={(v) => `${fmtTokens(v)} tokens`}
              />
            </div>

            {/* Reserve Depletion */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <Sparkline
                data={data.reserveDepletion}
                color="bg-amber-400"
                height="h-28"
                label="Reserve Remaining (%)"
                formatValue={(v) => `${fmt(v, 1)}%`}
              />
              <div className="text-[10px] text-gray-400 mt-1">
                X-axis: cumulative work units (n)
              </div>
            </div>

            {/* Fee Split Visual — Dual denomination */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                Fee Flow — Per $1 Trade ({pct(tradeFeeRate)} = {fmtUsd(tradeFeeRate)})
              </div>
              <div className="space-y-2">
                {(() => {
                  const fee = tradeFeeRate;
                  const usdcSide = fee * usdcPct;
                  const tokenSide = fee * emissionPoolPct;
                  const creatorAmt = fee * creatorPct;
                  const protocolAmt = fee * protocolPct;
                  return (
                    <>
                      {/* Total fee bar */}
                      <div className="flex items-center gap-2">
                        <div className="w-28 text-[11px] text-gray-500">Total fee</div>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                          <div className="absolute inset-y-0 left-0 bg-blue-200" style={{ width: `${usdcPct * 100}%` }} />
                          <div className="absolute inset-y-0 bg-emerald-200" style={{ left: `${usdcPct * 100}%`, width: `${emissionPoolPct * 100}%` }} />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-medium">
                            {fmtUsd(fee)} ({pct(usdcPct)} USDC · {pct(emissionPoolPct)} TOKEN)
                          </span>
                        </div>
                      </div>
                      {/* USDC side label */}
                      <div className="text-[9px] text-blue-500 font-medium uppercase tracking-wider ml-28 pl-2">
                        USDC Side ({fmtUsd(usdcSide)})
                      </div>
                      {/* Creator */}
                      <div className="flex items-center gap-2">
                        <div className="w-28 text-[11px] text-amber-600">Creator ({pct(creatorPct)})</div>
                        <div className="flex-1 bg-amber-50 rounded-full h-5 relative">
                          <div className="absolute inset-y-0 left-0 bg-amber-300 rounded-full" style={{ width: `${fee > 0 ? (creatorAmt / fee) * 100 : 0}%` }} />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono">
                            {fmtUsd(creatorAmt)} USDC
                          </span>
                        </div>
                      </div>
                      {/* Protocol */}
                      <div className="flex items-center gap-2">
                        <div className="w-28 text-[11px] text-violet-600">Protocol ({pct(protocolPct)})</div>
                        <div className="flex-1 bg-violet-50 rounded-full h-5 relative">
                          <div className="absolute inset-y-0 left-0 bg-violet-300 rounded-full" style={{ width: `${fee > 0 ? (protocolAmt / fee) * 100 : 0}%` }} />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono">
                            {fmtUsd(protocolAmt)} USDC
                          </span>
                        </div>
                      </div>
                      {/* TOKEN side label */}
                      <div className="text-[9px] text-emerald-500 font-medium uppercase tracking-wider ml-28 pl-2 mt-1">
                        TOKEN Side (~{fmtUsd(tokenSide)} equiv)
                      </div>
                      {/* Pool */}
                      <div className="flex items-center gap-2">
                        <div className="w-28 text-[11px] text-emerald-600">Pool ({pct(emissionPoolPct)})</div>
                        <div className="flex-1 bg-emerald-50 rounded-full h-5 relative">
                          <div className="absolute inset-y-0 left-0 bg-emerald-300 rounded-full" style={{ width: `${fee > 0 ? (tokenSide / fee) * 100 : 0}%` }} />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono">
                            ~{fmtUsd(tokenSide)} in TOKEN
                          </span>
                        </div>
                      </div>
                      <div className="text-[9px] text-gray-400 mt-1">
                        Pool receives TOKEN directly — compounds into LP position
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* ── Right: Metrics ────────────────────────────── */}
          <div className="col-span-3 space-y-3">
            <Stat label="Market Cap (FDV)" value={fmtUsd(data.tokenPrice * data.totalSupply)} sub={`${fmtUsd(data.tokenPrice)}/token`} />
            <Stat label={`Tweet (Action A)`} value={`${fmtTokens(data.emission1 * WORK_ACTIONS.A.workUnits)} emTokens`}
              sub={`Free · ${fmt((data.emission1 * WORK_ACTIONS.A.workUnits / data.totalReserve) * 100, 2)}% of reserve`} />
            <Stat label={`Purchase (Action B)`} value={`${fmtTokens(data.emission1 * WORK_ACTIONS.B.workUnits)} emTokens`}
              sub={`$${WORK_ACTIONS.B.costUSDC} · ${fmt((data.emission1 * WORK_ACTIONS.B.workUnits / data.totalReserve) * 100, 2)}% of reserve`} />
            <Stat label="Decay at #100" value={fmtTokens(data.emission100)}
              sub={`${fmt((data.emission100 / data.emission1) * 100, 1)}% of initial per unit`} />
            <Stat label="Decay at #1000" value={fmtTokens(data.emission1000)}
              sub={`${fmt((data.emission1000 / data.emission1) * 100, 1)}% of initial per unit`} />
            <Stat label="LP (Curve)" value={fmtTokens(data.curveTokens)}
              sub={`${pct(lpPct)} of ${fmtTokens(data.totalSupply)}`} />
            <Stat label="Emission Reserve" value={fmtTokens(data.totalReserve)}
              sub={`${pct(reservePct)} of ${fmtTokens(data.totalSupply)}`} />
            {data.projectAllocation > 0 && (
              <Stat label="Project" value={fmtTokens(data.projectAllocation)}
                sub={`${pct(projectPct)} of ${fmtTokens(data.totalSupply)}`} />
            )}
            {data.bountyAllocation > 0 && (
              <Stat label="Bounty" value={fmtTokens(data.bountyAllocation)}
                sub={`${pct(bountyPct)} of ${fmtTokens(data.totalSupply)}`} />
            )}
            <Stat label="Reserve Depletes" value={data.depletionRound === Infinity ? "Never" : `~Round ${data.depletionRound}`}
              sub="at 5 events/round (mix A+B)" />

            {/* Formula */}
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Formula</div>
              <div className="font-mono text-[11px] text-gray-700 bg-gray-50 rounded p-2">
                Tokens(n) = {fmtTokens(DEFAULT_EMITTER_CONFIG.emissionBase)} / (1 + {decayK} &times; n)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
