"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
} from "@/lib/graduation";
import {
  initGraduationSim,
  simulateGraduationRound,
  computeGraduationSummary,
  DEFAULT_MARKET_SCENARIOS,
  type GraduationSimState,
  type GraduationRunSummary,
  type EmitterAgentProfile,
  type MarketScenario,
} from "@/lib/graduation-simulation";
import {
  GRADUATION_PRESETS,
  GRADUATION_PRESET_KEYS,
} from "@/lib/graduation-presets";
import { loadLaunchpadSetupValues, launchpadSetupToEmitterConfig } from "@/lib/emitter-setup";

// ── Helpers ─────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2): string {
  return (n ?? 0).toLocaleString(undefined, {
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

// ── Sparkline ───────────────────────────────────────────────────────

function Sparkline({
  data,
  color = "bg-indigo-400",
  height = "h-16",
  label,
  formatValue,
  graduationIdx,
}: {
  data: number[];
  color?: string;
  height?: string;
  label?: string;
  formatValue?: (v: number) => string;
  graduationIdx?: number;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 0.001);
  const step = Math.max(1, Math.ceil(data.length / 120));
  const sampled = data.filter((_, i) => i % step === 0);
  const gradBar = graduationIdx !== undefined ? Math.floor(graduationIdx / step) : -1;

  return (
    <div>
      {label && (
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
          {label}
        </div>
      )}
      <div className={`relative flex items-end gap-px ${height}`}>
        {sampled.map((v, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-sm min-w-[2px] ${i === gradBar ? "bg-amber-400" : color}`}
            style={{ height: `${Math.max(1, (v / max) * 100)}%` }}
            title={formatValue ? formatValue(v) : fmt(v, 4)}
          />
        ))}
      </div>
    </div>
  );
}

function DualSparkline({
  dataA,
  dataB,
  colorA = "bg-amber-400",
  colorB = "bg-emerald-400",
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
              className={`flex-1 ${colorA} rounded-t-sm min-w-[2px] opacity-70`}
              style={{ height: `${Math.max(1, (v / allMax) * 100)}%` }}
              title={`${labelA}: ${fmtUsd(v)}`}
            />
          ))}
        </div>
        <div className="absolute inset-0 flex items-end gap-px">
          {sampledB.map((v, i) => (
            <div
              key={`b-${i}`}
              className={`flex-1 ${colorB} rounded-t-sm min-w-[1px] opacity-70`}
              style={{ height: `${Math.max(1, (v / allMax) * 100)}%` }}
              title={`${labelB}: ${fmtUsd(v)}`}
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

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2.5">
      <div className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-mono font-bold mt-0.5 ${accent || "text-gray-900"}`}>{value}</div>
      {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
    </div>
  );
}

function MarketBar({ snapshots }: { snapshots: GraduationRoundSnapshot[] }) {
  if (snapshots.length === 0) return null;
  const colors: Record<string, string> = { bull: "bg-emerald-400", neutral: "bg-gray-300", bear: "bg-red-400" };
  return (
    <div className="flex h-2 rounded-full overflow-hidden">
      {snapshots.map((s, i) => (
        <div key={i} className={`flex-1 ${colors[s.marketCondition] || "bg-gray-300"}`} />
      ))}
    </div>
  );
}

// ── Phase Badge ─────────────────────────────────────────────────────

function PhaseBadge({ phase }: { phase: string }) {
  const styles: Record<string, string> = {
    "bonding-curve": "bg-indigo-100 text-indigo-700",
    graduating: "bg-amber-100 text-amber-700",
    dex: "bg-emerald-100 text-emerald-700",
  };
  const labels: Record<string, string> = {
    "bonding-curve": "Bonding Curve",
    graduating: "Graduating...",
    dex: "DEX",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[phase] || "bg-gray-100 text-gray-600"}`}>
      {labels[phase] || phase}
    </span>
  );
}

// ── Graduation Progress Bar ─────────────────────────────────────────

function GradProgressBar({ progress, mcap, threshold }: { progress: number; mcap: number; threshold: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
        <span>Graduation</span>
        <span className="font-mono">{fmtUsd(mcap)} / {fmtUsd(threshold)}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all ${progress >= 1 ? "bg-emerald-500" : "bg-indigo-500"}`}
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

type Mode = "interactive" | "autorun";
type AutoRunPhase = "configure" | "running" | "completed";

const STORAGE_KEY = "capacitor-graduation-setup";

function loadConfig(): { threshold: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveConfig(config: { threshold: number }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export default function GraduationSandbox() {
  // ── Mode ──
  const [mode, setMode] = useState<Mode>("interactive");

  // ── Shared Config ──
  const hydratedRef = useRef(false);
  const [threshold, setThreshold] = useState(69_000);

  // Hydrate from localStorage
  useEffect(() => {
    const saved = loadConfig();
    if (saved) {
      setThreshold(saved.threshold);
    }
    hydratedRef.current = true;
  }, []);

  // Auto-save
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveConfig({ threshold });
  }, [threshold]);

  // ═══════════════════════════════════════════════════════════════════
  // INTERACTIVE MODE STATE
  // ═══════════════════════════════════════════════════════════════════

  const [interactiveState, setInteractiveState] = useState<GraduationState>(() =>
    createGraduationState(undefined, { graduationMarketCapUSDC: threshold }),
  );
  const [interactiveEvents, setInteractiveEvents] = useState<GraduationEventLog[]>([]);
  const [interactiveSnapshots, setInteractiveSnapshots] = useState<GraduationRoundSnapshot[]>([]);
  const interactiveEventId = useRef(0);
  const [buyInput, setBuyInput] = useState("1");
  const [sellInput, setSellInput] = useState("10000000");

  function addInteractiveEvent(type: GraduationEventLog["type"], detail: string) {
    const evt: GraduationEventLog = {
      id: ++interactiveEventId.current,
      round: interactiveState.round,
      type,
      agentName: "You",
      detail,
      tokenPrice: currentTokenPrice(interactiveState),
      wTokenPrice: currentWTokenPrice(interactiveState),
      marketCapUSDC: currentMarketCap(interactiveState),
      phase: interactiveState.phase,
    };
    setInteractiveEvents((prev) => [evt, ...prev].slice(0, 50));
  }

  function handleBuy() {
    const amount = parseFloat(buyInput);
    if (!amount || amount <= 0) return;
    const prevPhase = interactiveState.phase;
    const result = graduationBuy(interactiveState, amount);
    let newState = result.newState;
    setInteractiveState(newState);
    addInteractiveEvent("buy", `Bought ${fmtTokens(result.tokensTraded)} tokens for ${fmtUsd(amount)}`);
    if (prevPhase === "bonding-curve" && newState.phase === "dex") {
      const gradEvt: GraduationEventLog = {
        id: ++interactiveEventId.current,
        round: newState.round,
        type: "graduation",
        agentName: "System",
        detail: `Graduated at ${fmtUsd(newState.currentMarketCapUSDC)} market cap!`,
        tokenPrice: currentTokenPrice(newState),
        wTokenPrice: currentWTokenPrice(newState),
        marketCapUSDC: currentMarketCap(newState),
        phase: "dex",
      };
      setInteractiveEvents((prev) => [gradEvt, ...prev].slice(0, 50));
    }
    setInteractiveSnapshots((prev) => [...prev, captureGraduationSnapshot(newState)]);
  }

  function handleSell() {
    const amount = parseFloat(sellInput);
    if (!amount || amount <= 0) return;
    const result = graduationSell(interactiveState, amount);
    setInteractiveState(result.newState);
    addInteractiveEvent("sell", `Sold ${fmtTokens(amount)} tokens for ${fmtUsd(result.usdcTraded)}`);
    setInteractiveSnapshots((prev) => [...prev, captureGraduationSnapshot(result.newState)]);
  }

  function handleWork(action: "A" | "B") {
    const result = graduationWork(interactiveState, action);
    setInteractiveState(result.newState);
    addInteractiveEvent("work", `${action === "A" ? "Tweet" : "Purchase"} -> ${fmtTokens(result.emTokensMinted)} wTokens`);
    setInteractiveSnapshots((prev) => [...prev, captureGraduationSnapshot(result.newState)]);
  }

  function handleAdvanceRound() {
    const newState = graduationAdvanceRound(interactiveState);
    setInteractiveState(newState);
    setInteractiveSnapshots((prev) => [...prev, captureGraduationSnapshot(newState)]);
  }

  function handleReset() {
    const newState = createGraduationState(undefined, { graduationMarketCapUSDC: threshold });
    setInteractiveState(newState);
    setInteractiveEvents([]);
    setInteractiveSnapshots([]);
    interactiveEventId.current = 0;
  }

  // Reset interactive state when threshold changes
  useEffect(() => {
    if (!hydratedRef.current) return;
    handleReset();
  }, [threshold]);

  // ═══════════════════════════════════════════════════════════════════
  // AUTO-RUN MODE STATE
  // ═══════════════════════════════════════════════════════════════════

  const [autoPhase, setAutoPhase] = useState<AutoRunPhase>("configure");
  const [selectedPreset, setSelectedPreset] = useState("standard69k");
  const [targetRounds, setTargetRounds] = useState(100);
  const [autoRound, setAutoRound] = useState(0);
  const [autoSnapshots, setAutoSnapshots] = useState<GraduationRoundSnapshot[]>([]);
  const [autoSummary, setAutoSummary] = useState<GraduationRunSummary | null>(null);
  const [autoEventLog, setAutoEventLog] = useState<GraduationEventLog[]>([]);

  const simRef = useRef<GraduationSimState | null>(null);
  const profilesRef = useRef<Map<string, EmitterAgentProfile>>(new Map());
  const scenariosRef = useRef<MarketScenario[]>(DEFAULT_MARKET_SCENARIOS);
  const runningRef = useRef(false);
  const [isRunning, setIsRunning] = useState(false);

  const startSim = useCallback(() => {
    const basePreset = GRADUATION_PRESETS["standard69k"];
    const setupValues = selectedPreset === "from-setup" ? loadLaunchpadSetupValues() : null;

    let emitterConfig = setupValues
      ? launchpadSetupToEmitterConfig(setupValues)
      : (GRADUATION_PRESETS[selectedPreset]?.emitterConfig ?? {});
    let gradConfig = GRADUATION_PRESETS[selectedPreset]?.graduationConfig ?? { graduationMarketCapUSDC: threshold };
    let scenarios = GRADUATION_PRESETS[selectedPreset]?.marketScenarios ?? DEFAULT_MARKET_SCENARIOS;
    let bots = GRADUATION_PRESETS[selectedPreset]?.botDistribution ?? basePreset.botDistribution;
    let rounds = GRADUATION_PRESETS[selectedPreset]?.targetRounds ?? targetRounds;

    if (setupValues) {
      gradConfig = { graduationMarketCapUSDC: threshold };
      scenarios = DEFAULT_MARKET_SCENARIOS;
      bots = basePreset.botDistribution;
      rounds = targetRounds;
    }

    const { state, profiles } = initGraduationSim(emitterConfig, gradConfig, bots);
    simRef.current = state;
    profilesRef.current = profiles;
    scenariosRef.current = scenarios;
    setAutoSnapshots([]);
    setAutoRound(0);
    setAutoEventLog([]);
    setAutoSummary(null);
    setAutoPhase("running");
    setTargetRounds(rounds);

    runningRef.current = true;
    setIsRunning(true);
    requestAnimationFrame(() => runLoop(state, profiles, scenarios, rounds));
  }, [selectedPreset, threshold, targetRounds]);

  const runLoop = useCallback((
    initState: GraduationSimState,
    profiles: Map<string, EmitterAgentProfile>,
    scenarios: MarketScenario[],
    maxRounds: number,
  ) => {
    let state = initState;
    const allSnapshots: GraduationRoundSnapshot[] = [];

    const step = () => {
      if (!runningRef.current || state.round >= maxRounds) {
        runningRef.current = false;
        setIsRunning(false);
        const finalSummary = computeGraduationSummary(state, allSnapshots);
        setAutoSummary(finalSummary);
        setAutoPhase("completed");
        return;
      }

      const batchSize = Math.min(5, maxRounds - state.round);
      for (let b = 0; b < batchSize; b++) {
        state = simulateGraduationRound(state, profiles, scenarios);
        allSnapshots.push(captureGraduationSnapshot(
          state.graduationState,
          state.marketCondition,
        ));
      }

      simRef.current = state;
      setAutoRound(state.round);
      setAutoSnapshots([...allSnapshots]);

      const recentEvents = state.eventLog.slice(-20).reverse();
      setAutoEventLog(recentEvents);

      requestAnimationFrame(step);
    };

    step();
  }, []);

  const stopSim = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
  }, []);

  // Find graduation round index in snapshots
  const autoGradIdx = useMemo(() => {
    return autoSnapshots.findIndex((s) => s.phase === "dex");
  }, [autoSnapshots]);

  const interactiveGradIdx = useMemo(() => {
    return interactiveSnapshots.findIndex((s) => s.phase === "dex");
  }, [interactiveSnapshots]);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header + Mode Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Graduation Simulator</h1>
            <p className="text-sm text-gray-500">
              Bonding curve to DEX lifecycle
            </p>
          </div>
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setMode("interactive")}
              className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                mode === "interactive" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Interactive
            </button>
            <button
              onClick={() => setMode("autorun")}
              className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                mode === "autorun" ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Auto-Run
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* INTERACTIVE MODE                                           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {mode === "interactive" && (
          <div className="grid grid-cols-12 gap-4">
            {/* Left: Controls */}
            <div className="col-span-3 space-y-3">
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <PhaseBadge phase={interactiveState.phase} />
                  <span className="text-[10px] text-gray-400">Round {interactiveState.round}</span>
                </div>

                <GradProgressBar
                  progress={interactiveState.graduationProgress}
                  mcap={interactiveState.currentMarketCapUSDC}
                  threshold={threshold}
                />

                {/* Buy */}
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Buy (USDC)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={buyInput}
                      onChange={(e) => setBuyInput(e.target.value)}
                      className="flex-1 text-sm font-mono border rounded px-2 py-1.5"
                    />
                    <button
                      onClick={handleBuy}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
                    >
                      Buy
                    </button>
                  </div>
                </div>

                {/* Sell */}
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Sell (tokens)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={sellInput}
                      onChange={(e) => setSellInput(e.target.value)}
                      className="flex-1 text-sm font-mono border rounded px-2 py-1.5"
                    />
                    <button
                      onClick={handleSell}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      Sell
                    </button>
                  </div>
                </div>

                {/* Work */}
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Work</label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleWork("A")}
                      className="flex-1 px-2 py-1.5 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200"
                    >
                      Tweet (free)
                    </button>
                    <button
                      onClick={() => handleWork("B")}
                      className="flex-1 px-2 py-1.5 bg-indigo-100 text-indigo-700 text-xs rounded hover:bg-indigo-200"
                    >
                      Purchase ($1)
                    </button>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={handleAdvanceRound}
                    className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200"
                  >
                    Next Round
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-2 py-1.5 bg-gray-100 text-gray-400 text-xs rounded hover:bg-gray-200"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Config */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Config</div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">
                    Graduation Threshold (USDC)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={threshold}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v) && v > 0) setThreshold(v);
                    }}
                    className="w-full text-sm font-mono border rounded px-2 py-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Center: Charts */}
            <div className="col-span-6 space-y-3">
              {/* Market Cap */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  Market Cap vs Threshold
                </div>
                {interactiveSnapshots.length > 0 ? (
                  <div className="relative">
                    <Sparkline
                      data={interactiveSnapshots.map((s) => s.marketCapUSDC)}
                      color="bg-indigo-400"
                      height="h-24"
                      formatValue={(v) => fmtUsd(v)}
                      graduationIdx={interactiveGradIdx >= 0 ? interactiveGradIdx : undefined}
                    />
                    {/* Threshold line */}
                    <div
                      className="absolute left-0 right-0 border-t border-dashed border-amber-500/60"
                      style={{
                        bottom: `${Math.min(100, (threshold / Math.max(...interactiveSnapshots.map((s) => s.marketCapUSDC), threshold * 1.1)) * 100)}%`,
                      }}
                    >
                      <span className="absolute right-0 -top-3 text-[9px] text-amber-500 font-mono">
                        {fmtUsd(threshold)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 flex items-center justify-center text-[10px] text-gray-300">
                    Make a trade to see the chart
                  </div>
                )}
              </div>

              {/* Token Price + wToken */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-slate-200 p-3">
                  <Sparkline
                    data={interactiveSnapshots.map((s) => s.tokenPrice)}
                    color="bg-indigo-400"
                    height="h-16"
                    label="Token Price"
                    formatValue={(v) => fmtUsd(v)}
                    graduationIdx={interactiveGradIdx >= 0 ? interactiveGradIdx : undefined}
                  />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-3">
                  <Sparkline
                    data={interactiveSnapshots.map((s) => s.wTokenPrice)}
                    color="bg-teal-400"
                    height="h-16"
                    label="wToken Price"
                    formatValue={(v) => fmtUsd(v)}
                    graduationIdx={interactiveGradIdx >= 0 ? interactiveGradIdx : undefined}
                  />
                </div>
              </div>

              {/* Fee Accumulation */}
              <div className="bg-white rounded-xl border border-slate-200 p-3">
                <DualSparkline
                  dataA={interactiveSnapshots.map((s) => s.creatorFeesUSDC)}
                  dataB={interactiveSnapshots.map((s) => s.poolFeesUSDC)}
                  labelA="Creator"
                  labelB="Pool"
                  title="Fee Accumulation (USDC)"
                />
              </div>
            </div>

            {/* Right: Metrics + Event Log */}
            <div className="col-span-3 space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <Stat
                  label="Market Cap"
                  value={fmtUsd(interactiveState.currentMarketCapUSDC)}
                  sub={`${fmt(interactiveState.graduationProgress * 100, 1)}% to grad`}
                />
                <Stat label="Token Price" value={fmtUsd(currentTokenPrice(interactiveState))} />
                <Stat label="wToken Price" value={fmtUsd(currentWTokenPrice(interactiveState))} />
                <Stat label="Total Volume" value={fmtUsd(interactiveState.totalVolumeUSDC)} />
                <Stat
                  label="Creator Revenue"
                  value={fmtUsd(interactiveState.preGradFees.creator + interactiveState.postGradFees.creator)}
                  accent="text-blue-600"
                />
                <Stat
                  label="Work Events"
                  value={String(interactiveState.emitterState.totalEmissionEvents)}
                  sub={`Reserve: ${fmt((interactiveState.emitterState.reserveRemaining / interactiveState.emitterState.reserveTotal) * 100, 1)}%`}
                />
              </div>

              {interactiveState.graduationRound !== null && (
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3">
                  <div className="text-[10px] text-emerald-600 uppercase tracking-wider">Graduated!</div>
                  <div className="text-sm font-mono font-bold text-emerald-700">
                    Round {interactiveState.graduationRound}
                  </div>
                </div>
              )}

              {/* Event Log */}
              <div className="bg-white rounded-xl border border-slate-200 p-3">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Events</div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {interactiveEvents.length === 0 && (
                    <div className="text-[10px] text-gray-300">No events yet</div>
                  )}
                  {interactiveEvents.map((e) => {
                    const typeColors: Record<string, string> = {
                      buy: "bg-emerald-100 text-emerald-700",
                      sell: "bg-red-100 text-red-700",
                      work: "bg-indigo-100 text-indigo-700",
                      graduation: "bg-amber-100 text-amber-700",
                    };
                    return (
                      <div key={e.id} className="flex items-start gap-1.5 py-1 border-b border-gray-50 last:border-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeColors[e.type] || "bg-gray-100 text-gray-600"}`}>
                          {e.type}
                        </span>
                        <span className="text-[10px] text-gray-500 truncate">{e.detail}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* AUTO-RUN MODE                                              */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {mode === "autorun" && (
          <div>
            {/* Configure */}
            {autoPhase === "configure" && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-gray-700 mb-3">Presets</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedPreset("from-setup")}
                      className={`px-3 py-2 rounded-lg text-xs transition-colors ${
                        selectedPreset === "from-setup"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-medium">From Setup</div>
                      <div className="text-[10px] mt-0.5 opacity-70">Use your saved Launchpad Setup config</div>
                    </button>
                    {GRADUATION_PRESET_KEYS.map((key) => {
                      const preset = GRADUATION_PRESETS[key];
                      const active = key === selectedPreset;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedPreset(key);
                            setTargetRounds(preset.targetRounds);
                          }}
                          className={`px-3 py-2 rounded-lg text-xs transition-colors ${
                            active
                              ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                              : "bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100"
                          }`}
                        >
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-[10px] mt-0.5 opacity-70">{preset.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="text-[10px] text-gray-400 block">Rounds</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={targetRounds}
                        onChange={(e) => setTargetRounds(parseInt(e.target.value) || 100)}
                        className="w-20 text-sm font-mono border rounded px-2 py-1"
                      />
                    </div>
                    <button
                      onClick={startSim}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                    >
                      Run Simulation
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Running */}
            {autoPhase === "running" && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Round {autoRound} / {targetRounds}
                      {simRef.current?.graduated && (
                        <span className="ml-2 text-emerald-600 text-xs">
                          Graduated at round {simRef.current.graduationRound}!
                        </span>
                      )}
                    </span>
                    <button
                      onClick={stopSim}
                      className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                    >
                      Stop
                    </button>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${(autoRound / targetRounds) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2">
                    <MarketBar snapshots={autoSnapshots} />
                    <div className="flex gap-3 text-[9px] text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400" /> Bull</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-gray-300" /> Neutral</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-400" /> Bear</span>
                    </div>
                  </div>
                </div>

                {/* Live charts */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-3">
                    <Sparkline
                      data={autoSnapshots.map((s) => s.marketCapUSDC)}
                      color="bg-indigo-400"
                      label="Market Cap (USDC)"
                      formatValue={(v) => fmtUsd(v)}
                      graduationIdx={autoGradIdx >= 0 ? autoGradIdx : undefined}
                    />
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-3">
                    <Sparkline
                      data={autoSnapshots.map((s) => s.tokenPrice)}
                      color="bg-indigo-400"
                      label="Token Price"
                      formatValue={(v) => fmtUsd(v)}
                      graduationIdx={autoGradIdx >= 0 ? autoGradIdx : undefined}
                    />
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-3">
                    <Sparkline
                      data={autoSnapshots.map((s) => s.wTokenPrice)}
                      color="bg-teal-400"
                      label="wToken Price"
                      formatValue={(v) => fmtUsd(v)}
                      graduationIdx={autoGradIdx >= 0 ? autoGradIdx : undefined}
                    />
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-3">
                    <DualSparkline
                      dataA={autoSnapshots.map((s) => s.creatorFeesUSDC)}
                      dataB={autoSnapshots.map((s) => s.poolFeesUSDC)}
                      labelA="Creator"
                      labelB="Pool"
                      title="Fee Accumulation"
                    />
                  </div>
                </div>

                {/* Event Log */}
                <div className="bg-white rounded-xl border border-slate-200 p-3">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Recent Events</div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {autoEventLog.map((e) => {
                      const typeColors: Record<string, string> = {
                        buy: "bg-emerald-100 text-emerald-700",
                        sell: "bg-red-100 text-red-700",
                        work: "bg-indigo-100 text-indigo-700",
                        compound: "bg-amber-100 text-amber-700",
                        "lp-fees": "bg-violet-100 text-violet-700",
                        graduation: "bg-amber-100 text-amber-700",
                      };
                      return (
                        <div key={e.id} className="flex items-start gap-2 py-1 border-b border-gray-50 last:border-0">
                          <span className="text-[10px] font-mono text-gray-300 w-5">{e.round}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeColors[e.type] || "bg-gray-100 text-gray-600"}`}>
                            {e.type}
                          </span>
                          <span className="text-[11px] font-medium text-gray-700">{e.agentName}</span>
                          <span className="text-[11px] text-gray-500 truncate">{e.detail}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Completed */}
            {autoPhase === "completed" && autoSummary && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div />
                  <button
                    onClick={() => { stopSim(); setAutoPhase("configure"); }}
                    className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
                  >
                    New Run
                  </button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-3">
                  <Stat label="Rounds" value={String(autoSummary.totalRounds)} />
                  <Stat
                    label="Graduated"
                    value={autoSummary.graduated ? `Round ${autoSummary.graduationRound}` : "No"}
                    accent={autoSummary.graduated ? "text-emerald-600" : "text-gray-400"}
                  />
                  <Stat label="Token Price" value={fmtUsd(autoSummary.finalTokenPrice)} />
                  <Stat label="wToken Price" value={fmtUsd(autoSummary.finalWTokenPrice)} />
                  <Stat label="Market Cap" value={fmtUsd(autoSummary.finalMarketCapUSDC)} />
                  <Stat label="Volume" value={fmtUsd(autoSummary.totalVolumeUSDC)} />
                  <Stat label="Creator Revenue" value={fmtUsd(autoSummary.creatorTotalUSDC)} accent="text-blue-600" />
                  <Stat label="Pool Value" value={fmtUsd(autoSummary.poolTotalUSDC)} accent="text-emerald-600" />
                </div>

                {/* Insight */}
                <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
                  <div className="text-sm font-semibold text-indigo-900 mb-1">Graduation Insight</div>
                  <div className="text-xs text-indigo-700">
                    {autoSummary.graduated ? (
                      <>
                        Graduated at round <span className="font-mono font-bold">{autoSummary.graduationRound}</span>.
                        Pre-graduation volume: <span className="font-mono font-bold">{fmtUsd(autoSummary.preGradVolume)}</span>,
                        post-graduation: <span className="font-mono font-bold">{fmtUsd(autoSummary.postGradVolume)}</span>.
                        wToken price at end: <span className="font-mono font-bold">{fmtUsd(autoSummary.finalWTokenPrice)}</span>.
                      </>
                    ) : (
                      <>
                        Did not graduate in {autoSummary.totalRounds} rounds.
                        Final market cap: <span className="font-mono font-bold">{fmtUsd(autoSummary.finalMarketCapUSDC)}</span>.
                        Try lowering the graduation threshold or increasing agent capital.
                      </>
                    )}
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-4 col-span-2">
                    <Sparkline
                      data={autoSnapshots.map((s) => s.marketCapUSDC)}
                      color="bg-indigo-400"
                      height="h-32"
                      label="Market Cap (USDC)"
                      formatValue={(v) => fmtUsd(v)}
                      graduationIdx={autoGradIdx >= 0 ? autoGradIdx : undefined}
                    />
                    <MarketBar snapshots={autoSnapshots} />
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <Sparkline
                      data={autoSnapshots.map((s) => s.tokenPrice)}
                      color="bg-indigo-400"
                      height="h-24"
                      label="Token Price"
                      formatValue={(v) => fmtUsd(v)}
                      graduationIdx={autoGradIdx >= 0 ? autoGradIdx : undefined}
                    />
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <Sparkline
                      data={autoSnapshots.map((s) => s.wTokenPrice)}
                      color="bg-teal-400"
                      height="h-24"
                      label="wToken Price"
                      formatValue={(v) => fmtUsd(v)}
                      graduationIdx={autoGradIdx >= 0 ? autoGradIdx : undefined}
                    />
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <DualSparkline
                      dataA={autoSnapshots.map((s) => s.creatorFeesUSDC)}
                      dataB={autoSnapshots.map((s) => s.poolFeesUSDC)}
                      labelA="Creator Fees"
                      labelB="Pool Value"
                      title="Creator vs Pool (USDC)"
                      height="h-24"
                    />
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <Sparkline
                      data={autoSnapshots.map((s) => s.roundVolumeUSDC)}
                      color="bg-gray-400"
                      height="h-24"
                      label="Volume per Round"
                      formatValue={(v) => fmtUsd(v)}
                    />
                  </div>
                </div>

                {/* Revenue breakdown */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs font-semibold text-gray-700 mb-3">Revenue Breakdown</div>
                  <div className="grid grid-cols-3 gap-4">
                    <Stat label="Creator" value={fmtUsd(autoSummary.creatorTotalUSDC)} accent="text-blue-600" />
                    <Stat label="Pool" value={fmtUsd(autoSummary.poolTotalUSDC)} accent="text-emerald-600" />
                    <Stat label="Protocol" value={fmtUsd(autoSummary.protocolTotalUSDC)} accent="text-violet-600" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
