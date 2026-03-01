"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  buildWalkthroughSteps,
  WALKTHROUGH_CONFIG,
  type WalkthroughStep,
  type WalkthroughSnapshot,
  type WalkthroughAgentState,
} from "@/lib/walkthrough";

// ── Small Components ─────────────────────────────────────────────────

function PnL({ value }: { value: number }) {
  const c = value > 0 ? "text-emerald-600" : value < 0 ? "text-red-500" : "text-gray-400";
  return (
    <span className={`font-mono text-xs font-semibold ${c}`}>
      {value > 0 ? "+" : ""}
      {value.toFixed(1)}
    </span>
  );
}

function Pill({ children, color }: { children: React.ReactNode; color: "amber" | "green" | "gray" | "indigo" | "red" }) {
  const m: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    gray: "bg-gray-50 text-gray-500 border-gray-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };
  return <span className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${m[color]}`}>{children}</span>;
}

// ── Phase Colors ─────────────────────────────────────────────────────

const PHASE_COLORS: Record<string, string> = {
  intro: "bg-slate-400",
  entry: "bg-indigo-500",
  deliberation: "bg-amber-500",
  settlement: "bg-emerald-500",
};

const PHASE_LABELS: Record<string, string> = {
  intro: "Introduction",
  entry: "Entry",
  deliberation: "Deliberation",
  settlement: "Settlement",
};

// ── Flow Diagram Node ────────────────────────────────────────────────

function FlowNode({
  label,
  value,
  color,
  active,
  size = "normal",
}: {
  label: string;
  value: string;
  color: string;
  active?: boolean;
  size?: "normal" | "large";
}) {
  const sizeClass = size === "large" ? "min-w-[120px] py-3" : "min-w-[100px] py-2";
  return (
    <div
      className={`${sizeClass} px-3 rounded-lg border-2 text-center transition-all duration-300 ${
        active
          ? `border-${color}-500 bg-${color}-50 shadow-md shadow-${color}-100`
          : "border-gray-200 bg-white"
      }`}
      style={active ? { borderColor: `var(--node-${color})`, backgroundColor: `var(--node-${color}-bg)` } : {}}
    >
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`font-mono text-sm font-bold ${active ? "text-gray-900" : "text-gray-600"}`}>{value}</div>
    </div>
  );
}

function FlowArrow({ active, direction = "right", label }: { active?: boolean; direction?: "right" | "down" | "up"; label?: string }) {
  const color = active ? "text-indigo-500" : "text-gray-300";
  if (direction === "down") {
    return (
      <div className={`flex flex-col items-center ${color} transition-colors duration-300`}>
        {label && <span className="text-[9px] font-mono mb-0.5">{label}</span>}
        <span className="text-lg leading-none">↓</span>
      </div>
    );
  }
  if (direction === "up") {
    return (
      <div className={`flex flex-col items-center ${color} transition-colors duration-300`}>
        <span className="text-lg leading-none">↑</span>
        {label && <span className="text-[9px] font-mono mt-0.5">{label}</span>}
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-0.5 ${color} transition-colors duration-300`}>
      <span className="text-lg leading-none">→</span>
      {label && <span className="text-[9px] font-mono">{label}</span>}
    </div>
  );
}

// ── Agent Card ───────────────────────────────────────────────────────

function AgentCard({
  agent,
  isActive,
  isWinner,
  isAccurateVoter,
  phase,
}: {
  agent: WalkthroughAgentState;
  isActive: boolean;
  isWinner: boolean;
  isAccurateVoter: boolean;
  phase: string;
}) {
  if (!agent.hasEntered) {
    return (
      <div className="px-2 py-1.5 rounded border border-dashed border-gray-200 bg-gray-50 text-center opacity-50">
        <div className="text-[10px] text-gray-400 font-medium">{agent.name}</div>
        <div className="text-[9px] text-gray-300">{agent.deposit}</div>
      </div>
    );
  }

  const anodePct = agent.anodeBought > 0 ? (agent.anodeRemaining / agent.anodeBought) * 100 : 0;
  const borderColor = isActive
    ? "border-indigo-400 bg-indigo-50 shadow-sm"
    : isWinner
    ? "border-amber-400 bg-amber-50"
    : isAccurateVoter
    ? "border-emerald-400 bg-emerald-50"
    : "border-gray-200 bg-white";

  return (
    <div className={`px-2 py-1.5 rounded border-2 ${borderColor} transition-all duration-300`}>
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] font-semibold text-gray-800 truncate">{agent.name}</span>
        {isWinner && <Pill color="amber">★</Pill>}
        {isAccurateVoter && !isWinner && <Pill color="green">✓</Pill>}
      </div>
      <div className="text-[9px] text-gray-400">{agent.role}</div>
      <div className="mt-1 flex items-center gap-1">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-400 rounded-full transition-all duration-500"
            style={{ width: `${anodePct}%` }}
          />
        </div>
        <span className="text-[9px] font-mono text-gray-500">{anodePct.toFixed(0)}%</span>
      </div>
      <div className="mt-0.5 flex gap-1.5 text-[9px] text-gray-400">
        {agent.messages > 0 && <span>💬{agent.messages}</span>}
        {agent.votesGiven.length > 0 && <span>🗳{agent.votesGiven.length}</span>}
        {agent.votesReceived > 0 && <span>⭐{agent.votesReceived}</span>}
        <span className="font-mono">{agent.deposit}→</span>
      </div>
    </div>
  );
}

// ── Flow Diagram ─────────────────────────────────────────────────────

function FlowDiagram({ snapshot, phase }: { snapshot: WalkthroughSnapshot; phase: string }) {
  const af = snapshot.activeFlow;
  const isEntry = af?.type === "entry";
  const isSpeak = af?.type === "speak";
  const isVote = af?.type === "vote";
  const isRewardSpeaking = af?.type === "reward-speaking";
  const isRewardVoting = af?.type === "reward-voting";
  const isDischarge = af?.type === "discharge";

  const depositsValue = snapshot.totalDeposited > 0 ? snapshot.totalDeposited.toFixed(0) : "0";
  const enteredAgents = snapshot.agents.filter((a) => a.hasEntered);

  return (
    <div className="space-y-4">
      {/* Top Row: Source Pools → AMM → Reward Pools */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Source pools */}
        <div className="flex flex-col gap-1">
          <FlowNode
            label="Fee Pool"
            value={WALKTHROUGH_CONFIG.poolSize.toLocaleString()}
            color="blue"
            active={phase === "intro"}
          />
          <FlowNode
            label="Project Seed"
            value={WALKTHROUGH_CONFIG.projectSeed.toLocaleString()}
            color="blue"
            active={phase === "intro"}
          />
        </div>

        <FlowArrow active={phase === "intro" || isEntry} />

        {/* AMM (center) */}
        <div className="flex flex-col items-center gap-1">
          <FlowNode
            label="AMM"
            value={depositsValue}
            color="indigo"
            active={isEntry || isSpeak || isVote}
            size="large"
          />
          <div className="text-[9px] text-gray-400 italic">dielectric</div>
        </div>

        <FlowArrow active={isSpeak || isVote || isRewardSpeaking || isRewardVoting} />

        {/* Reward pools */}
        <div className="flex flex-col gap-1">
          <FlowNode
            label="Speaking Pool"
            value={snapshot.speakingPool > 0 ? snapshot.speakingPool.toFixed(0) : "—"}
            color="amber"
            active={isSpeak || isRewardSpeaking}
          />
          <FlowNode
            label="Voting Pool"
            value={snapshot.votingPool > 0 ? snapshot.votingPool.toFixed(0) : "—"}
            color="green"
            active={isVote || isRewardVoting}
          />
        </div>
      </div>

      {/* Settlement reverse arrows */}
      {(isRewardSpeaking || isRewardVoting || isDischarge) && (
        <div className="flex justify-center gap-4 text-xs">
          {isRewardSpeaking && (
            <span className="text-amber-600 animate-pulse font-medium">
              ← Speaking Prize → Winner
            </span>
          )}
          {isRewardVoting && (
            <span className="text-emerald-600 animate-pulse font-medium">
              ← Voting Prize → Accurate Voters
            </span>
          )}
          {isDischarge && (
            <span className="text-blue-600 animate-pulse font-medium">
              ← Flat Discharge → All Agents
            </span>
          )}
        </div>
      )}

      {/* Agent Flow Arrow */}
      {enteredAgents.length > 0 && (
        <div className="flex justify-center">
          <FlowArrow active={isEntry} direction="up" label="cathode → anode" />
        </div>
      )}

      {/* Agent Grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {snapshot.agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isActive={
              (af?.type === "entry" && af.agentId === agent.id) ||
              (af?.type === "speak" && af.agentId === agent.id) ||
              (af?.type === "vote" && af.agentId === agent.id) ||
              (af?.type === "reward-speaking" && af.agentId === agent.id) ||
              false
            }
            isWinner={snapshot.topContributor === agent.name}
            isAccurateVoter={snapshot.accurateVoters.includes(agent.name)}
            phase={phase}
          />
        ))}
      </div>
    </div>
  );
}

// ── Settlement Table ─────────────────────────────────────────────────

function SettlementTable({ snapshot }: { snapshot: WalkthroughSnapshot }) {
  if (!snapshot.settlement) return null;
  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-1.5 px-2 text-gray-500 font-medium">Agent</th>
            <th className="text-right py-1.5 px-2 text-gray-500 font-medium">In</th>
            <th className="text-right py-1.5 px-2 text-gray-500 font-medium">Discharge</th>
            <th className="text-right py-1.5 px-2 text-gray-500 font-medium">Speak</th>
            <th className="text-right py-1.5 px-2 text-gray-500 font-medium">Vote</th>
            <th className="text-right py-1.5 px-2 text-gray-500 font-medium">Out</th>
            <th className="text-right py-1.5 px-2 text-gray-500 font-medium">P&L</th>
          </tr>
        </thead>
        <tbody>
          {snapshot.settlement.map((row) => (
            <tr
              key={row.name}
              className={`border-b border-gray-50 ${
                row.pnl > 0 ? "bg-emerald-50/30" : row.pnl < 0 ? "bg-red-50/30" : ""
              }`}
            >
              <td className="py-1.5 px-2 font-medium text-gray-800">{row.name}</td>
              <td className="py-1.5 px-2 text-right font-mono text-gray-600">{row.deposit.toFixed(0)}</td>
              <td className="py-1.5 px-2 text-right font-mono text-gray-600">{row.dischargeReturn.toFixed(1)}</td>
              <td className="py-1.5 px-2 text-right font-mono">
                {row.speakingReward > 0 ? (
                  <span className="text-amber-600">{row.speakingReward.toFixed(1)}</span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="py-1.5 px-2 text-right font-mono">
                {row.votingReward > 0 ? (
                  <span className="text-emerald-600">{row.votingReward.toFixed(1)}</span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="py-1.5 px-2 text-right font-mono text-gray-800 font-semibold">
                {row.totalReturn.toFixed(1)}
              </td>
              <td className="py-1.5 px-2 text-right">
                <PnL value={row.pnl} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Entry Curve ──────────────────────────────────────────────────────

function EntryCurve({ agents }: { agents: WalkthroughAgentState[] }) {
  const entered = agents.filter((a) => a.hasEntered);
  if (entered.length === 0) return null;
  const maxPrice = Math.max(...entered.map((a) => a.entryPrice));

  return (
    <div className="mt-4">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Entry Curve</div>
      <div className="flex items-end gap-1 h-20">
        {entered.map((agent) => {
          const pct = (agent.entryPrice / maxPrice) * 100;
          return (
            <div key={agent.id} className="flex-1 flex flex-col items-center">
              <span className="text-[8px] font-mono text-gray-500 mb-0.5">
                {agent.entryPrice.toFixed(2)}
              </span>
              <div
                className="w-full bg-indigo-400 rounded-t transition-all duration-500"
                style={{ height: `${Math.max(pct, 10)}%` }}
              />
              <span className="text-[8px] text-gray-400 mt-0.5 truncate w-full text-center">
                {agent.name.slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export default function Walkthrough() {
  const steps = useMemo(() => buildWalkthroughSteps(), []);
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

  const phaseIndex = ["intro", "entry", "deliberation", "settlement"].indexOf(step.phase) + 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Capacitor Walkthrough</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${PHASE_COLORS[step.phase]}`} />
              <span className="text-xs text-gray-500">
                Phase {phaseIndex} of 4: {PHASE_LABELS[step.phase]}
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-400">Step-by-step deliberation</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-5 pb-28">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-6">
          {/* Visual Panel */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <FlowDiagram snapshot={step.snapshot} phase={step.phase} />
              {step.phase === "entry" && <EntryCurve agents={step.snapshot.agents} />}
              {step.snapshot.settlement && step.phase === "settlement" && step.title === "Final P&L" && (
                <SettlementTable snapshot={step.snapshot} />
              )}
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

              {/* Settlement details for non-P&L settlement steps */}
              {step.snapshot.settlement && step.phase === "settlement" && step.title !== "Final P&L" && step.title !== "Key Takeaways" && (
                <SettlementTable snapshot={step.snapshot} />
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
