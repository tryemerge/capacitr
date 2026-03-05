"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  tokenSpotPrice,
  emTokenValue,
  DEFAULT_EMITTER_CONFIG,
  type EmitterConfig,
} from "@/lib/emitter";
import {
  initEmitterSim,
  simulateEmitterRound,
  EMITTER_PROFILES,
  DEFAULT_MARKET_SCENARIOS,
  DEFAULT_BOT_DISTRIBUTION,
  type EmitterSimState,
  type EmitterAgentProfile,
  type MarketScenario,
  type EmitterBotSpec,
} from "@/lib/emitter-simulation";
import {
  captureEmitterSnapshot,
  computeEmitterSummary,
  type EmitterRoundSnapshot,
  type EmitterRunSummary,
  type SavedEmitterRun,
} from "@/lib/emitter-runs";
import { EMITTER_PRESETS, PRESET_KEYS } from "@/lib/emitter-presets";
import {
  loadLaunchpadSetupValues,
  launchpadSetupToEmitterConfig,
} from "@/lib/emitter-setup";

// ── Helpers ─────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2): string {
  return (n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtUSDC(n: number): string {
  if (n < 0.0001 && n > 0) return "<0.0001";
  return fmt(n, 4);
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

// ── Sparkline Chart ─────────────────────────────────────────────────

function Sparkline({
  data,
  color = "bg-indigo-400",
  height = "h-16",
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
    </div>
  );
}

// ── Market Condition Bar ────────────────────────────────────────────

function MarketBar({ snapshots }: { snapshots: EmitterRoundSnapshot[] }) {
  if (snapshots.length === 0) return null;
  const colors = { bull: "bg-emerald-400", neutral: "bg-gray-300", bear: "bg-red-400" };
  return (
    <div className="flex h-2 rounded-full overflow-hidden">
      {snapshots.map((s, i) => (
        <div key={i} className={`flex-1 ${colors[s.marketCondition]}`} />
      ))}
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2.5">
      <div className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-mono font-bold mt-0.5 ${accent || "text-gray-900"}`}>{value}</div>
      {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
    </div>
  );
}

// ── Dual Chart ──────────────────────────────────────────────────────

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
              title={`${labelA}: ${fmtUSDC(v)}`}
            />
          ))}
        </div>
        <div className="absolute inset-0 flex items-end gap-px">
          {sampledB.map((v, i) => (
            <div
              key={`b-${i}`}
              className={`flex-1 ${colorB} rounded-t-sm min-w-[1px] opacity-70`}
              style={{ height: `${Math.max(1, (v / allMax) * 100)}%` }}
              title={`${labelB}: ${fmtUSDC(v)}`}

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

// ── Main Component ──────────────────────────────────────────────────

type Phase = "configure" | "running" | "completed";

export default function EmitterRuns() {
  // Phase
  const [phase, setPhase] = useState<Phase>("configure");

  // Config
  const [selectedPreset, setSelectedPreset] = useState("standard");
  const [targetRounds, setTargetRounds] = useState(100);

  // Simulation state
  const simRef = useRef<EmitterSimState | null>(null);
  const profilesRef = useRef<Map<string, EmitterAgentProfile>>(new Map());
  const scenariosRef = useRef<MarketScenario[]>(DEFAULT_MARKET_SCENARIOS);
  const snapshotsRef = useRef<EmitterRoundSnapshot[]>([]);

  // Display state
  const [round, setRound] = useState(0);
  const [snapshots, setSnapshots] = useState<EmitterRoundSnapshot[]>([]);
  const [summary, setSummary] = useState<EmitterRunSummary | null>(null);
  const [eventLog, setEventLog] = useState<{ type: string; agentName: string; detail: string; round: number }[]>([]);

  // Saved runs
  const [savedRuns, setSavedRuns] = useState<SavedEmitterRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(true);

  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch("/api/runs");
      if (!res.ok) return;
      const rows = await res.json() as Array<{
        id: string; name: string; createdAt: string;
        summary: EmitterRunSummary; configUsed: Record<string, unknown> | null;
      }>;
      setSavedRuns(rows.map((r) => ({
        id: r.id,
        name: r.name,
        timestamp: new Date(r.createdAt).getTime(),
        snapshots: [],
        summary: r.summary,
        configUsed: r.configUsed ?? {},
      })));
    } finally {
      setRunsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  // Cross-run comparison
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());
  const [compareRuns, setCompareRuns] = useState<SavedEmitterRun[]>([]);
  const [compareLoading, setCompareLoading] = useState(false);

  const toggleCompareSelect = useCallback((id: string) => {
    setSelectedForCompare((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  }, []);

  const loadCompareRuns = useCallback(async () => {
    setCompareLoading(true);
    try {
      const results = await Promise.all(
        Array.from(selectedForCompare).map((id) =>
          fetch(`/api/runs/${id}`).then((r) => r.json()),
        ),
      );
      setCompareRuns(results.map((r) => ({
        id: r.id,
        name: r.name,
        timestamp: new Date(r.createdAt).getTime(),
        snapshots: r.snapshots as EmitterRoundSnapshot[],
        summary: r.summary as EmitterRunSummary,
        configUsed: r.configUsed ?? {},
      })));
    } finally {
      setCompareLoading(false);
    }
  }, [selectedForCompare]);

  // Running control
  const runningRef = useRef(false);
  const [isRunning, setIsRunning] = useState(false);

  // ── Start Simulation ──
  const startSim = useCallback(() => {
    const basePreset = EMITTER_PRESETS["standard"];
    const setupValues = selectedPreset === "from-setup" ? loadLaunchpadSetupValues() : null;
    let preset = setupValues
      ? { ...basePreset, config: launchpadSetupToEmitterConfig(setupValues) }
      : EMITTER_PRESETS[selectedPreset];
    const { state, profiles } = initEmitterSim(preset.config, preset.botDistribution);
    simRef.current = state;
    profilesRef.current = profiles;
    scenariosRef.current = preset.marketScenarios;
    snapshotsRef.current = [];
    setSnapshots([]);
    setRound(0);
    setEventLog([]);
    setSummary(null);
    setPhase("running");
    setTargetRounds(preset.targetRounds);

    // Run immediately
    runningRef.current = true;
    setIsRunning(true);
    requestAnimationFrame(() => runLoop(state, profiles, preset.marketScenarios, preset.targetRounds));
  }, [selectedPreset]);

  // ── Run Loop ──
  const runLoop = useCallback((
    initState: EmitterSimState,
    profiles: Map<string, EmitterAgentProfile>,
    scenarios: MarketScenario[],
    maxRounds: number,
  ) => {
    let state = initState;
    const allSnapshots: EmitterRoundSnapshot[] = [];

    const step = () => {
      if (!runningRef.current || state.round >= maxRounds) {
        // Done
        runningRef.current = false;
        setIsRunning(false);

        const finalSummary = computeEmitterSummary(state, allSnapshots);
        setSummary(finalSummary);
        setPhase("completed");

        // Auto-save to API
        const run = {
          id: `run-${Date.now()}`,
          name: `${selectedPreset === "from-setup" ? "From Setup" : EMITTER_PRESETS[selectedPreset]?.name || "Custom"} — ${maxRounds} rounds`,
          rounds: maxRounds,
          preset: selectedPreset,
          configUsed: { preset: selectedPreset },
          summary: finalSummary,
          snapshots: allSnapshots,
        };
        fetch("/api/runs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(run),
        }).then(() => fetchRuns());
        return;
      }

      // Run batch of rounds for performance
      const batchSize = Math.min(5, maxRounds - state.round);
      for (let b = 0; b < batchSize; b++) {
        state = simulateEmitterRound(state, profiles, scenarios);
        const snap = captureEmitterSnapshot(state, allSnapshots[allSnapshots.length - 1]);
        allSnapshots.push(snap);
      }

      simRef.current = state;
      snapshotsRef.current = allSnapshots;
      setRound(state.round);
      setSnapshots([...allSnapshots]);

      // Update event log (last 20 events)
      const recentEvents = state.eventLog.slice(-20).reverse().map((e) => ({
        type: e.type,
        agentName: e.agentName,
        detail: e.detail,
        round: e.round,
      }));
      setEventLog(recentEvents);

      requestAnimationFrame(step);
    };

    step();
  }, [selectedPreset]);

  // ── Stop ──
  const stopSim = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
  }, []);

  // ── Delete saved run ──
  const handleDeleteRun = useCallback(async (id: string) => {
    await fetch(`/api/runs/${id}`, { method: "DELETE" });
    fetchRuns();
  }, [fetchRuns]);

  // ── Load saved run ──
  const handleLoadRun = useCallback((run: SavedEmitterRun) => {
    setSnapshots(run.snapshots);
    setSummary(run.summary);
    setPhase("completed");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Emitter Simulation</h1>
            <p className="text-sm text-gray-500">
              Agent-based launchpad economics with market conditions.
            </p>
          </div>
          {phase !== "configure" && (
            <button
              onClick={() => { stopSim(); setPhase("configure"); }}
              className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
            >
              New Run
            </button>
          )}
        </div>

        {/* ── Configure ────────────────────────────── */}
        {phase === "configure" && (
          <div className="space-y-4">
            {/* Preset selector */}
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
                {PRESET_KEYS.map((key) => {
                  const preset = EMITTER_PRESETS[key];
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

            {/* Run controls */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 block">Rounds</label>
                  <input
                    type="number" min={10} max={500} step={10}
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

            {/* Saved runs */}
            {(runsLoading || savedRuns.length > 0) && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-gray-700">Saved Runs</div>
                  {selectedForCompare.size >= 2 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">{selectedForCompare.size} selected</span>
                      <button
                        onClick={loadCompareRuns}
                        className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >Compare</button>
                      <button
                        onClick={() => { setSelectedForCompare(new Set()); setCompareRuns([]); }}
                        className="text-[10px] text-gray-400 hover:text-gray-600"
                      >Clear</button>
                    </div>
                  )}
                </div>
                {runsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                <div className="space-y-2">
                  {savedRuns.map((run) => {
                    const checked = selectedForCompare.has(run.id);
                    return (
                      <div key={run.id} className={`flex items-center p-2 rounded-lg ${checked ? "bg-indigo-50 border border-indigo-100" : "bg-gray-50"}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCompareSelect(run.id)}
                          className="mr-2 accent-indigo-600"
                          title="Select for comparison"
                        />
                        <button onClick={() => handleLoadRun(run)} className="text-left flex-1">
                          <div className="text-xs font-medium text-gray-700">{run.name}</div>
                          <div className="text-[10px] text-gray-400">
                            {new Date(run.timestamp).toLocaleDateString()} — Creator: {fmtUsd(run.summary.creatorTotalUSDC)}, Pool: {fmtUsd(run.summary.poolTotalUSDC)}, 1 emToken: {fmtTokens(run.summary.finalEmTokenPriceInToken)} TKN
                          </div>
                        </button>
                        <button
                          onClick={() => handleDeleteRun(run.id)}
                          className="text-[10px] text-red-400 hover:text-red-600 px-2"
                        >delete</button>
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            )}

            {/* Cross-run comparison panel */}
            {compareRuns.length >= 2 && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-gray-700">Run Comparison</div>
                  <button
                    onClick={() => { setCompareRuns([]); setSelectedForCompare(new Set()); }}
                    className="text-[10px] text-gray-400 hover:text-gray-600"
                  >✕ Close</button>
                </div>
                {compareLoading ? (
                  <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                ) : (
                  <div>
                    {/* Stat comparison table */}
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            <th className="text-left text-gray-400 font-normal py-1 pr-4">Metric</th>
                            {compareRuns.map((r) => (
                              <th key={r.id} className="text-left text-gray-700 font-semibold py-1 pr-4">
                                {r.name}
                                <div className="text-[10px] text-gray-400 font-normal">{new Date(r.timestamp).toLocaleDateString()}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(
                            [
                              { label: "Token Price", vals: compareRuns.map((r) => r.summary.finalTokenPrice), fmt: fmtUsd, hi: "max" },
                              { label: "emToken Price", vals: compareRuns.map((r) => r.summary.finalEmTokenPrice), fmt: fmtUsd, hi: "max" },
                              { label: "1 emToken (TKN)", vals: compareRuns.map((r) => r.summary.finalEmTokenPriceInToken), fmt: (v: number) => `${fmtTokens(v)} TKN`, hi: "max" },
                              { label: "Total Volume", vals: compareRuns.map((r) => r.summary.totalVolumeUSDC), fmt: fmtUsd, hi: "max" },
                              { label: "Creator USDC", vals: compareRuns.map((r) => r.summary.creatorTotalUSDC), fmt: fmtUsd, hi: "max" },
                              { label: "Pool Value", vals: compareRuns.map((r) => r.summary.poolTotalUSDC), fmt: fmtUsd, hi: "max" },
                              { label: "Work Events", vals: compareRuns.map((r) => r.summary.totalEmissionEvents), fmt: (v: number) => String(Math.round(v)), hi: "max" },
                              { label: "Reserve Depleted", vals: compareRuns.map((r) => r.summary.reserveDepletedPct), fmt: (v: number) => `${fmt(v, 1)}%`, hi: "min" },
                            ] as { label: string; vals: number[]; fmt: (v: number) => string; hi: "max" | "min" }[]
                          ).map(({ label, vals, fmt: fmtFn, hi }) => {
                            const best = hi === "max" ? Math.max(...vals) : Math.min(...vals);
                            return (
                              <tr key={label} className="border-t border-gray-50">
                                <td className="text-gray-400 py-1.5 pr-4">{label}</td>
                                {vals.map((v, i) => (
                                  <td key={i} className={`py-1.5 pr-4 font-mono ${v === best ? "text-emerald-600 font-semibold" : "text-gray-700"}`}>
                                    {fmtFn(v)}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Token price overlay chart */}
                    {compareRuns.every((r) => r.snapshots.length > 0) && (
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Token Price Overlay</div>
                        <div className="relative h-24">
                          {compareRuns.map((run, ri) => {
                            const colors = ["bg-indigo-400", "bg-amber-400", "bg-emerald-400"];
                            const data = run.snapshots.map((s) => s.tokenPrice);
                            const max = Math.max(...compareRuns.flatMap((r) => r.snapshots.map((s) => s.tokenPrice)), 0.001);
                            const step = Math.max(1, Math.ceil(data.length / 80));
                            const sampled = data.filter((_, i) => i % step === 0);
                            return (
                              <div key={run.id} className="absolute inset-0 flex items-end gap-px">
                                {sampled.map((v, i) => (
                                  <div
                                    key={i}
                                    className={`flex-1 ${colors[ri]} rounded-t-sm min-w-[2px] opacity-60`}
                                    style={{ height: `${Math.max(1, (v / max) * 100)}%` }}
                                    title={`${run.name}: ${fmtUsd(v)}`}
                                  />
                                ))}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-3 text-[9px] mt-1">
                          {compareRuns.map((r, i) => {
                            const colors = ["bg-indigo-400", "bg-amber-400", "bg-emerald-400"];
                            return (
                              <span key={r.id} className="flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-sm ${colors[i]}`} /> {r.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Running ──────────────────────────────── */}
        {phase === "running" && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Round {round} / {targetRounds}
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
                  style={{ width: `${(round / targetRounds) * 100}%` }}
                />
              </div>
              {/* Market condition bar */}
              <div className="mt-2">
                <MarketBar snapshots={snapshots} />
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
                  data={snapshots.map((s) => s.tokenPrice)}
                  color="bg-indigo-400"
                  label="Token Price (USDC)"
                  formatValue={(v) => fmtUsd(v)}
                />
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-3">
                <Sparkline
                  data={snapshots.map((s) => s.emTokenPriceInToken)}
                  color="bg-teal-400"
                  label="1 emToken (in TKN)"
                  formatValue={(v) => `${fmtTokens(v)} TKN`}
                />
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-3">
                <Sparkline
                  data={snapshots.map((s) => s.poolTotalValueUSDC)}
                  color="bg-emerald-400"
                  label="Pool Value (USDC)"
                  formatValue={(v) => fmtUsd(v)}
                />
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-3">
                <DualSparkline
                  dataA={snapshots.map((s) => s.creatorCumulativeUSDC)}
                  dataB={snapshots.map((s) => s.poolCumulativeUSDC)}
                  labelA="Creator"
                  labelB="Pool"
                  title="Creator vs Pool (USDC)"
                />
              </div>
            </div>

            {/* Event log */}
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Recent Events</div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {eventLog.map((e, i) => {
                  const typeColors: Record<string, string> = {
                    buy: "bg-emerald-100 text-emerald-700",
                    sell: "bg-red-100 text-red-700",
                    work: "bg-indigo-100 text-indigo-700",
                    compound: "bg-amber-100 text-amber-700",
                    "lp-fees": "bg-violet-100 text-violet-700",
                  };
                  return (
                    <div key={i} className="flex items-start gap-2 py-1 border-b border-gray-50 last:border-0">
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

        {/* ── Completed ────────────────────────────── */}
        {phase === "completed" && summary && (
          <div className="space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-3">
              <Stat label="Rounds" value={String(summary.totalRounds)} />
              <Stat label="1 Token" value={fmtUsd(summary.finalTokenPrice)} />
              <Stat label="1 emToken" value={`${fmtTokens(summary.finalEmTokenPriceInToken)} TKN`} sub={fmtUsd(summary.finalEmTokenPrice)} />
              <Stat label="Volume" value={fmtUsd(summary.totalVolumeUSDC)} />
              <Stat label="Creator Revenue" value={fmtUsd(summary.creatorTotalUSDC)} accent="text-blue-600" />
              <Stat label="Pool Value" value={fmtUsd(summary.poolTotalUSDC)} accent="text-emerald-600" />
              <Stat label="Work" value={`${summary.totalEmissionEvents} events (${summary.totalWorkUnits} units)`} sub={`${fmtUsd(summary.totalEmissionValueUSDC)} · Revenue: ${fmtUsd(summary.totalWorkRevenue)}`} />
              <Stat label="Compounds" value={String(summary.totalCompounds)} />
            </div>

            {/* Key insight */}
            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
              <div className="text-sm font-semibold text-indigo-900 mb-1">The Compounding Thesis</div>
              <div className="text-xs text-indigo-700">
                Creator earned <span className="font-mono font-bold">{fmtUsd(summary.creatorTotalUSDC)}</span> in liquid fees.
                The emission pool grew to <span className="font-mono font-bold">{fmtUsd(summary.poolTotalUSDC)}</span> in value.
                {summary.poolTotalUSDC > summary.creatorTotalUSDC ? (
                  <span className="font-medium"> The community pool is worth more than the creator&apos;s total earnings.</span>
                ) : (
                  <span> The pool is still growing relative to the creator.</span>
                )}
                {summary.totalEmissionEvents > 0 && (
                  <span> {summary.totalEmissionEvents} work events ({summary.totalActionA} A + {summary.totalActionB} B) → 1 emToken = {fmtTokens(summary.finalEmTokenPriceInToken)} TKN ({fmtUsd(summary.finalEmTokenPrice)}).</span>
                )}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-4">
              {/* THE investor chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 col-span-2">
                <DualSparkline
                  dataA={snapshots.map((s) => s.creatorCumulativeUSDC)}
                  dataB={snapshots.map((s) => s.poolCumulativeUSDC)}
                  labelA="Creator Fees (linear)"
                  labelB="Pool Value (compounding)"
                  title="Creator Revenue vs Pool Value (USDC)"
                  height="h-32"
                />
                <MarketBar snapshots={snapshots} />
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <Sparkline
                  data={snapshots.map((s) => s.tokenPrice)}
                  color="bg-indigo-400"
                  height="h-24"
                  label="Token Price (USDC)"
                  formatValue={(v) => fmtUsd(v)}
                />
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <Sparkline
                  data={snapshots.map((s) => s.emTokenPriceInToken)}
                  color="bg-teal-400"
                  height="h-24"
                  label="1 emToken (in TKN)"
                  formatValue={(v) => `${fmtTokens(v)} TKN`}
                />
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <Sparkline
                  data={snapshots.map((s) => s.emTokenPrice)}
                  color="bg-emerald-400"
                  height="h-24"
                  label="1 emToken (USDC)"
                  formatValue={(v) => fmtUsd(v)}
                />
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <Sparkline
                  data={snapshots.map((s) => s.poolTotalValueUSDC)}
                  color="bg-emerald-500"
                  height="h-24"
                  label="Pool Value (USDC)"
                  formatValue={(v) => fmtUsd(v)}
                />
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <Sparkline
                  data={snapshots.map((s) => s.totalEmissionEvents)}
                  color="bg-indigo-300"
                  height="h-24"
                  label="Cumulative Work Events"
                  formatValue={(v) => String(Math.round(v))}
                />
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <Sparkline
                  data={snapshots.map((s) => s.roundVolumeUSDC)}
                  color="bg-gray-400"
                  height="h-24"
                  label="Volume per Round (USDC)"
                  formatValue={(v) => fmtUsd(v)}
                />
              </div>
            </div>

            {/* Leaderboards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-xs font-semibold text-gray-700 mb-2">Top Workers</div>
                <div className="space-y-1.5">
                  {summary.topWorkers.map((w, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-700 font-medium">
                        {w.name} <span className="text-gray-400">({w.profileType})</span>
                      </span>
                      <span className="font-mono text-gray-500">
                        {w.workDone} units ({w.actionA}A+{w.actionB}B) &middot; {fmtTokens(w.emTokens)} emTKN
                      </span>
                    </div>
                  ))}
                  {summary.topWorkers.length === 0 && (
                    <div className="text-[11px] text-gray-400">No workers in this run</div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-xs font-semibold text-gray-700 mb-2">Top Traders (PnL)</div>
                <div className="space-y-1.5">
                  {summary.topTraders.map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-700 font-medium">
                        {t.name} <span className="text-gray-400">({t.profileType})</span>
                      </span>
                      <span className={`font-mono ${t.usdcPnL >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {t.usdcPnL >= 0 ? "+" : ""}{fmtUsd(t.usdcPnL)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-semibold text-gray-700 mb-3">Revenue Breakdown</div>
              <div className="grid grid-cols-3 gap-4">
                <Stat label="Creator" value={fmtUsd(summary.creatorTotalUSDC)} accent="text-blue-600" />
                <Stat label="Pool" value={fmtUsd(summary.poolTotalUSDC)} accent="text-emerald-600" />
                <Stat label="Protocol" value={fmtUsd(summary.protocolTotalUSDC)} accent="text-violet-600" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
