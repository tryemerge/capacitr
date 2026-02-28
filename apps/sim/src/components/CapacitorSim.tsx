"use client";

import { useState, useMemo, useCallback } from "react";
import { runSimulation, type Agent } from "@/lib/simulation";
import { PRESETS } from "@/lib/presets";

// ── Small Components ─────────────────────────────────────────────────

function PoolBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-gray-500 mb-0.5">
        <span>{label}</span>
        <span className="font-mono">{value.toFixed(0)}</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function PnL({ value }: { value: number }) {
  const c = value > 0 ? "text-emerald-600" : value < 0 ? "text-red-500" : "text-gray-400";
  return <span className={`font-mono text-xs font-semibold ${c}`}>{value > 0 ? "+" : ""}{value.toFixed(1)}</span>;
}

function Pill({ children, color }: { children: React.ReactNode; color: "amber" | "green" | "gray" }) {
  const m = { amber: "bg-amber-50 text-amber-700", green: "bg-emerald-50 text-emerald-700", gray: "bg-gray-100 text-gray-500" };
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${m[color]}`}>{children}</span>;
}

// ── Main Component ───────────────────────────────────────────────────

export default function CapacitorSim() {
  const [preset, setPreset] = useState("simple");
  const [poolSize, setPoolSize] = useState(PRESETS.simple.config.poolSize);
  const [projectSeed, setProjectSeed] = useState(PRESETS.simple.config.projectSeed);
  const [speakPct, setSpeakPct] = useState(PRESETS.simple.config.speakPct);
  const [votePct, setVotePct] = useState(PRESETS.simple.config.votePct);
  const [curveK, setCurveK] = useState(PRESETS.simple.config.curveK);
  const [agents, setAgents] = useState<Agent[]>(PRESETS.simple.config.agents);
  const [actions, setActions] = useState(PRESETS.simple.config.actions);
  const [showLog, setShowLog] = useState(false);
  const [tab, setTab] = useState<"pnl" | "detail" | "curve">("pnl");

  const load = useCallback((key: string) => {
    const c = PRESETS[key].config;
    setPreset(key);
    setPoolSize(c.poolSize);
    setProjectSeed(c.projectSeed);
    setSpeakPct(c.speakPct);
    setVotePct(c.votePct);
    setCurveK(c.curveK);
    setAgents(c.agents);
    setActions(c.actions);
  }, []);

  const result = useMemo(
    () => runSimulation({ poolSize, projectSeed, agents, actions, speakPct, votePct, curveK }),
    [poolSize, projectSeed, agents, actions, speakPct, votePct, curveK]
  );

  const maxPool = result.totalPool + result.totalDeposited;

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">⚡ Capacitor Deliberation Simulator</h1>
          <p className="text-xs text-slate-400 mt-0.5">All values in project tokens. Adjust parameters, pick a scenario, see who profits.</p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {Object.entries(PRESETS).map(([k, p]) => (
            <button
              key={k}
              onClick={() => load(k)}
              className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                preset === k ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* ── Left: Controls ── */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Capacitor</h2>
              {([["Fee Pool", poolSize, setPoolSize], ["Project Seed", projectSeed, setProjectSeed]] as const).map(([l, v, fn]) => (
                <div key={l} className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500">{l}</span>
                  <input type="number" value={v} onChange={(e) => fn(Number(e.target.value))} step={1000} min={0} className="w-24 px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white text-right font-mono" />
                </div>
              ))}
              <div className="flex justify-between pt-1.5 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Total Charge</span>
                <span className="text-xs font-bold font-mono">{(poolSize + projectSeed).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Economics</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Speak cost</span>
                  <div className="flex items-center gap-1">
                    <input type="range" min={1} max={50} value={speakPct} onChange={(e) => setSpeakPct(Number(e.target.value))} className="w-14 h-1" />
                    <span className="text-xs font-mono w-8 text-right text-slate-600">{speakPct}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Vote cost</span>
                  <div className="flex items-center gap-1">
                    <input type="range" min={1} max={25} value={votePct} onChange={(e) => setVotePct(Number(e.target.value))} className="w-14 h-1" />
                    <span className="text-xs font-mono w-8 text-right text-slate-600">{votePct}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Curve k</span>
                  <div className="flex items-center gap-1">
                    <input type="range" min={0.5} max={5} step={0.5} value={curveK} onChange={(e) => setCurveK(Number(e.target.value))} className="w-14 h-1" />
                    <span className="text-xs font-mono w-8 text-right text-slate-600">{curveK}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Agents ({agents.length})</h2>
              {agents.map((agent, i) => (
                <div key={agent.id} className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs text-slate-600 w-16 truncate">{agent.name}</span>
                  <input
                    type="number"
                    value={agent.deposit}
                    min={0}
                    step={100}
                    onChange={(e) => {
                      const u = [...agents];
                      u[i] = { ...agent, deposit: Number(e.target.value) };
                      setAgents(u);
                    }}
                    className="w-20 px-1.5 py-0.5 text-xs border border-slate-200 rounded bg-white font-mono text-right"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Center: Flow + Log ── */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Charge</div>
              <PoolBar label="Fee Pool" value={poolSize} max={maxPool} color="#6366f1" />
              <PoolBar label="Project Seed" value={projectSeed} max={maxPool} color="#8b5cf6" />
              <PoolBar label="Agent Deposits" value={result.totalDeposited} max={maxPool} color="#06b6d4" />
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-3 mb-1">Discharge</div>
              <PoolBar label="→ Speaking Pool (winner)" value={result.speakingPool} max={maxPool} color="#f59e0b" />
              <PoolBar label="→ Voting Pool (accurate voters)" value={result.votingPool} max={maxPool} color="#10b981" />
              <PoolBar label="→ Flat Discharge (everyone)" value={result.totalCathodeForDischarge} max={maxPool} color="#64748b" />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Settlement</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {([
                  ["Winner", result.topContributor, "font-semibold text-slate-900"],
                  ["Speaking Prize", result.speakingPool.toFixed(1), "font-semibold text-amber-600"],
                  ["Accurate Voters", result.accurateVoters.join(", ") || "—", "text-slate-700"],
                  ["Voting Prize", result.votingPool.toFixed(1), "font-semibold text-emerald-600"],
                  ["Discharge Rate", result.dischargeRate.toFixed(4), "font-mono text-slate-700"],
                  ["Actions", String(result.actionLog.length), "text-slate-700"],
                ] as const).map(([l, v, c]) => (
                  <div key={l}>
                    <div className="text-[10px] text-slate-400">{l}</div>
                    <div className={`text-xs ${c}`}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <button onClick={() => setShowLog(!showLog)} className="w-full flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Deliberation Log ({result.actionLog.length})</span>
                <span>{showLog ? "▲" : "▼"}</span>
              </button>
              {showLog && (
                <div className="mt-2 space-y-0.5 max-h-72 overflow-y-auto">
                  {result.actionLog.map((a, i) => (
                    <div key={i} className="flex items-start gap-1.5 py-1 border-b border-slate-50 text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold text-white shrink-0 ${a.type === "speak" ? "bg-amber-500" : "bg-emerald-500"}`}>
                        {a.type === "speak" ? "SAY" : "VOTE"}
                      </span>
                      <span className="font-medium text-slate-700 w-14 shrink-0 truncate">{a.agent}</span>
                      {a.type === "vote" && <span className="text-slate-400">→ {a.target}</span>}
                      {a.type === "speak" && a.content && <span className="text-slate-400 truncate flex-1">&ldquo;{a.content}&rdquo;</span>}
                      <span className="ml-auto text-slate-300 font-mono shrink-0">-{a.anodeSpent}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Results ── */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex gap-1">
              {([["pnl", "P&L"], ["detail", "Detail"], ["curve", "Entry Curve"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} className={`px-3 py-1 text-xs rounded-lg border transition-all ${tab === k ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200"}`}>
                  {l}
                </button>
              ))}
            </div>

            {tab === "pnl" && (
              <div className="bg-white rounded-xl border border-slate-200 p-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100">
                      <th className="text-left py-1 font-medium">Agent</th>
                      <th className="text-right py-1 font-medium">In</th>
                      <th className="text-right py-1 font-medium">Out</th>
                      <th className="text-right py-1 font-medium">P&L</th>
                      <th className="text-right py-1 font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.settlement.map((s) => (
                      <tr key={s.name} className="border-b border-slate-50">
                        <td className="py-1.5 font-medium text-slate-700">{s.name}</td>
                        <td className="text-right font-mono text-slate-400">{s.deposit.toFixed(0)}</td>
                        <td className="text-right font-mono text-slate-700">{s.totalReturn.toFixed(1)}</td>
                        <td className="text-right"><PnL value={s.pnl} /></td>
                        <td className="text-right"><PnL value={s.deposit > 0 ? (s.pnl / s.deposit) * 100 : 0} /></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200">
                      <td className="py-1.5 font-bold text-slate-700">Total</td>
                      <td className="text-right font-mono font-bold text-slate-500">{result.settlement.reduce((s, a) => s + a.deposit, 0).toFixed(0)}</td>
                      <td className="text-right font-mono font-bold text-slate-700">{result.settlement.reduce((s, a) => s + a.totalReturn, 0).toFixed(1)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {tab === "detail" && (
              <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-3 max-h-[520px] overflow-y-auto">
                {result.settlement.map((s) => (
                  <div key={s.name} className="pb-2 border-b border-slate-50 last:border-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-700">{s.name}</span>
                      <PnL value={s.pnl} />
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-400 mb-1.5">
                      <div><div>Entry</div><div className="font-mono text-slate-600">{s.entryPrice.toFixed(3)}</div></div>
                      <div><div>Anode left</div><div className="font-mono text-slate-600">{s.anodeBought > 0 ? ((s.anodeRemaining / s.anodeBought) * 100).toFixed(0) : 0}%</div></div>
                      <div><div>Msgs</div><div className="font-mono text-slate-600">{s.messages}</div></div>
                      <div><div>Votes ↑↓</div><div className="font-mono text-slate-600">{s.votesReceived}/{s.votesGiven}</div></div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {s.dischargeReturn > 0.1 && <Pill color="gray">discharge: {s.dischargeReturn.toFixed(1)}</Pill>}
                      {s.speakingReward > 0 && <Pill color="amber">speaking: {s.speakingReward.toFixed(1)}</Pill>}
                      {s.votingReward > 0 && <Pill color="green">voting: {s.votingReward.toFixed(1)}</Pill>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "curve" && (
              <div className="bg-white rounded-xl border border-slate-200 p-3">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Entry Curve (k={curveK})</h2>
                {result.entryLog.map((e, i) => {
                  const mx = Math.max(...result.entryLog.map((x) => parseFloat(x.entryPrice)));
                  return (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-600 font-medium">{e.agent}</span>
                        <span className="text-slate-400 font-mono">{e.deposit} → {e.anodeReceived} anode</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${(parseFloat(e.entryPrice) / mx) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-indigo-600 w-10 text-right">{e.entryPrice}</span>
                      </div>
                    </div>
                  );
                })}
                <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  Early entrants get more anode per token. Late entrants pay a premium. Curve k controls how fast entry price rises.
                </div>
              </div>
            )}

            {/* Insight */}
            <div className="bg-slate-800 rounded-xl p-3 text-xs text-slate-300">
              <div className="font-bold text-white mb-1">💡 What to notice</div>
              <p>{PRESETS[preset]?.insight}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-[10px] text-slate-300">
          Capacitr Deliberation Simulator v0.1
        </div>
      </div>
    </div>
  );
}
