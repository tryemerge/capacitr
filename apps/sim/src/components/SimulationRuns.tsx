"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  type RunConfig,
  type RoundSnapshot,
  type SavedRun,
  type RunSummary,
  type BotSpec,
  type AgentProfile,
  type SimulationState,
  type DualAMMState,
  type Deliberation,
  DEFAULT_RUN_CONFIG,
  DEFAULT_CONFIG,
  BOT_DISTRIBUTION,
  PROFILES,
  createDualAMM,
  cathodePrice,
  anodePrice,
  generateBots,
  simulateRound,
  captureSnapshot,
  computeSummary,
  loadRuns,
  saveRun,
  deleteRun,
} from "@/lib/runs";

// ── Helpers ─────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function usd(n: number): string {
  return `$${fmt(n)}`;
}

// ── Sparkline Chart ─────────────────────────────────────────────────

function Sparkline({
  data,
  color = "bg-indigo-400",
  height = "h-16",
  label,
}: {
  data: number[];
  color?: string;
  height?: string;
  label?: string;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 0.001);
  // Sample to max 120 bars
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
            className={`flex-1 ${color} rounded-t-sm min-w-[2px] transition-all duration-100`}
            style={{ height: `${Math.max(1, (v / max) * 100)}%` }}
            title={fmt(v, 4)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Stacked Fee Bar ─────────────────────────────────────────────────

function FeeBar({
  speaking,
  voting,
  fee,
}: {
  speaking: number;
  voting: number;
  fee: number;
}) {
  const total = speaking + voting + fee;
  if (total === 0) return <div className="h-3 bg-gray-100 rounded-full" />;
  const sp = (speaking / total) * 100;
  const vp = (voting / total) * 100;
  const fp = (fee / total) * 100;
  return (
    <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
      <div
        className="bg-amber-400 transition-all duration-300"
        style={{ width: `${sp}%` }}
        title={`Speaking: ${fmt(speaking, 1)}c`}
      />
      <div
        className="bg-emerald-400 transition-all duration-300"
        style={{ width: `${vp}%` }}
        title={`Voting: ${fmt(voting, 1)}c`}
      />
      <div
        className="bg-rose-400 transition-all duration-300"
        style={{ width: `${fp}%` }}
        title={`Fee: ${fmt(fee, 1)}c`}
      />
    </div>
  );
}

// ── Config Panel ────────────────────────────────────────────────────

function ConfigPanel({
  config,
  onChange,
  onStart,
}: {
  config: RunConfig;
  onChange: (config: RunConfig) => void;
  onStart: () => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const totalAgents = config.botDistribution.reduce(
    (sum, b) => sum + b.count,
    0,
  );

  const updateDist = (idx: number, field: "count" | "usdc", value: string) => {
    const dist = config.botDistribution.map((b, i) =>
      i === idx ? { ...b, [field]: parseInt(value) || 0 } : b,
    );
    onChange({ ...config, botDistribution: dist });
  };

  const updateAmm = (
    field: keyof typeof DEFAULT_CONFIG,
    value: string,
  ) => {
    onChange({
      ...config,
      ammConfig: { ...config.ammConfig, [field]: parseFloat(value) || 0 },
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <h2 className="text-sm font-bold text-gray-800">New Simulation Run</h2>

      {/* Name + Rounds */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
            Run Name
          </label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => onChange({ ...config, name: e.target.value })}
            placeholder="e.g. Baseline 200r"
            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
            Target Rounds
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={config.targetRounds}
            onChange={(e) =>
              onChange({
                ...config,
                targetRounds: parseInt(e.target.value) || 0,
              })
            }
            className="w-full px-2 py-1.5 text-xs font-mono border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      {/* Agent Distribution */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] text-gray-400 uppercase tracking-wider">
            Agent Distribution ({totalAgents} total)
          </label>
        </div>
        <div className="grid grid-cols-4 gap-x-3 gap-y-1.5">
          {config.botDistribution.map((spec, i) => (
            <div
              key={spec.profileType}
              className="flex items-center gap-1.5 text-[10px]"
            >
              <span className="text-gray-600 w-16 truncate font-medium">
                {spec.profileType}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={spec.count}
                onChange={(e) => updateDist(i, "count", e.target.value)}
                className="w-10 px-1 py-0.5 font-mono text-center border border-gray-200 rounded text-[10px]"
                title="Count"
              />
              <span className="text-gray-300">@</span>
              <input
                type="text"
                inputMode="decimal"
                value={spec.usdc}
                onChange={(e) => updateDist(i, "usdc", e.target.value)}
                className="w-14 px-1 py-0.5 font-mono text-center border border-gray-200 rounded text-[10px]"
                title="Starting USDC"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Deliberation Config */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
            Bounty (cathode)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={config.ammConfig.bountyAmount}
            onChange={(e) => updateAmm("bountyAmount", e.target.value)}
            className="w-full px-2 py-1.5 text-xs font-mono border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
            Idle Rounds
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={config.ammConfig.idleRoundsToSettle}
            onChange={(e) => updateAmm("idleRoundsToSettle", e.target.value)}
            className="w-full px-2 py-1.5 text-xs font-mono border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
            Max Duration
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={config.ammConfig.delibMaxDuration}
            onChange={(e) => updateAmm("delibMaxDuration", e.target.value)}
            className="w-full px-2 py-1.5 text-xs font-mono border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      {/* Advanced AMM Config (collapsible) */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {showAdvanced ? "Hide" : "Show"} AMM Parameters
        </button>
        {showAdvanced && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              ["marketReserveUSDC", "Mkt USDC"],
              ["marketReserveCathode", "Mkt Cathode"],
              ["marketExternalFeeRate", "Mkt Fee %"],
              ["delibReserveCathode", "Delib Cathode"],
              ["delibReserveAnode", "Delib Anode"],
              ["delibCathodeFeeRate", "Delib Fee %"],
              ["cathodePerSpeak", "c/Speak"],
              ["anodePerVote", "a/Vote"],
              ["discussionMinCathode", "Discuss Min c"],
              ["discussionCostPerWord", "c/Word"],
              ["proposalCost", "Proposal c"],
              ["proposalThreshold", "Proposal Thresh"],
              ["bountyWinnerPct", "Bounty Winner %"],
              ["bountyVoterPct", "Bounty Voter %"],
              ["proposerRewardPct", "Proposer Reward %"],
              ["cashOutProb", "Cash Out Prob"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-[9px] text-gray-400 block">{label}</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={
                    config.ammConfig[key as keyof typeof DEFAULT_CONFIG]
                  }
                  onChange={(e) =>
                    updateAmm(key as keyof typeof DEFAULT_CONFIG, e.target.value)
                  }
                  className="w-full px-1.5 py-0.5 text-[10px] font-mono border border-gray-200 rounded"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        disabled={config.targetRounds <= 0 || totalAgents === 0}
        className="w-full px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Start Simulation ({totalAgents} agents, {config.targetRounds} rounds)
      </button>
    </div>
  );
}

// ── Live Dashboard ──────────────────────────────────────────────────

function LiveDashboard({
  state,
  snapshots,
  config,
  profiles,
}: {
  state: SimulationState;
  snapshots: RoundSnapshot[];
  config: RunConfig;
  profiles: Map<string, AgentProfile>;
}) {
  const amm = state.ammState;
  const cp = cathodePrice(amm);
  const ap = amm.deliberationActive ? anodePrice(amm) : 0;
  const progress = Math.min(
    100,
    (state.round / config.targetRounds) * 100,
  );
  const ad = state.activeDeliberation;

  // Aggregate by profile
  const profileStats: Record<
    string,
    { count: number; cathode: number; anode: number }
  > = {};
  for (const agent of state.agents) {
    const p = profiles.get(agent.id);
    const type = p?.type ?? "?";
    if (!profileStats[type]) {
      profileStats[type] = { count: 0, cathode: 0, anode: 0 };
    }
    profileStats[type].count++;
    profileStats[type].cathode += agent.cathodeBalance;
    profileStats[type].anode += agent.anodeBalance;
  }

  return (
    <div className="space-y-3">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-gray-700">
            Round {state.round} / {config.targetRounds}
          </span>
          <span className="text-[10px] text-gray-400">{fmt(progress, 0)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-100 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-[9px] text-gray-400 uppercase">Cathode</div>
          <div className="font-mono text-sm font-bold text-gray-800">
            {usd(cp)}
          </div>
          <Sparkline
            data={snapshots.map((s) => s.cathodePrice)}
            color="bg-purple-400"
            height="h-10"
          />
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-[9px] text-gray-400 uppercase">Anode</div>
          <div className="font-mono text-sm font-bold text-indigo-700">
            {usd(ap)}
          </div>
          <Sparkline
            data={snapshots.map((s) => s.anodePrice)}
            color="bg-indigo-400"
            height="h-10"
          />
        </div>
      </div>

      {/* Fee Pools */}
      <div className="bg-gray-50 rounded-lg p-2">
        <div className="text-[9px] text-gray-400 uppercase mb-1">
          Deliberation Pools
        </div>
        <FeeBar
          speaking={amm.speakingPool}
          voting={amm.votingPool}
          fee={amm.feePool}
        />
        <div className="flex gap-3 mt-1 text-[9px]">
          <span className="text-amber-600">
            Spk {fmt(amm.speakingPool, 0)}c
          </span>
          <span className="text-emerald-600">
            Vote {fmt(amm.votingPool, 0)}c
          </span>
          <span className="text-rose-600">Fee {fmt(amm.feePool, 0)}c</span>
        </div>
      </div>

      {/* Deliberation Status */}
      <div className={`rounded-lg p-2.5 border ${ad ? "bg-indigo-50 border-indigo-200" : "bg-gray-50 border-gray-200"}`}>
        <div className="text-[9px] text-gray-400 uppercase mb-1">Deliberation</div>
        {ad ? (
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-indigo-800 truncate">
              &ldquo;{ad.title}&rdquo;
            </div>
            <div className="flex gap-3 text-[9px] flex-wrap">
              <span className="text-indigo-600">Bounty: {fmt(ad.bounty, 0)}c</span>
              <span className="text-gray-500">Round {state.round - ad.openedAtRound}/{config.ammConfig.delibMaxDuration}</span>
              <span className="text-gray-500">Idle: {ad.idleRounds}/{config.ammConfig.idleRoundsToSettle}</span>
              <span className="text-gray-500">
                Speakers: {Object.keys(ad.speakerActivity).length}
              </span>
            </div>
            {Object.keys(ad.speakerActivity).length > 0 && (
              <div className="space-y-0.5">
                {Object.entries(ad.speakerVotes)
                  .sort(([, a], [, b]) => b.length - a.length)
                  .slice(0, 3)
                  .map(([speakerId, voters]) => {
                    const speaker = state.agents.find((a) => a.id === speakerId);
                    return (
                      <div key={speakerId} className="flex items-center justify-between text-[9px]">
                        <span className="text-gray-600 truncate">
                          {speaker?.name ?? "?"}
                          <span className="text-gray-300 ml-1">
                            ({ad.speakerActivity[speakerId] || 0} speeches)
                          </span>
                        </span>
                        <span className="font-mono text-indigo-600 shrink-0">{voters.length} votes</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-[10px] text-gray-400">
            {state.deliberations.length > 0
              ? `${state.deliberations.length} settled — waiting for next proposal`
              : "Waiting for proposal to reach threshold"}
          </div>
        )}
      </div>

      {/* Key Counts */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-gray-50 rounded p-1.5">
          <div className="text-[9px] text-gray-400">Events</div>
          <div className="font-mono text-xs font-bold">{state.eventLog.length}</div>
        </div>
        <div className="bg-gray-50 rounded p-1.5">
          <div className="text-[9px] text-gray-400">Discuss</div>
          <div className="font-mono text-xs font-bold">{state.discussions.length}</div>
        </div>
        <div className="bg-gray-50 rounded p-1.5">
          <div className="text-[9px] text-gray-400">Proposals</div>
          <div className="font-mono text-xs font-bold">{state.proposals.length}</div>
        </div>
        <div className="bg-gray-50 rounded p-1.5">
          <div className="text-[9px] text-gray-400">Settled</div>
          <div className="font-mono text-xs font-bold">{state.deliberations.length}</div>
        </div>
      </div>

      {/* Profile Breakdown */}
      <div>
        <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">
          By Profile
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {Object.entries(profileStats).map(([type, stats]) => (
            <div key={type} className="bg-gray-50 rounded p-1.5 text-[9px]">
              <div className="font-medium text-gray-700 truncate">{type}</div>
              <div className="font-mono text-gray-400">
                {stats.count} · {fmt(stats.cathode / stats.count, 0)}c ·{" "}
                {fmt(stats.anode / stats.count, 0)}a
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Activity Feed ───────────────────────────────────────────────────

function ActivityFeed({ state }: { state: SimulationState }) {
  const typeColors: Record<string, string> = {
    "buy-cathode": "bg-purple-100 text-purple-700",
    "buy-anode": "bg-indigo-100 text-indigo-700",
    speak: "bg-amber-100 text-amber-700",
    vote: "bg-emerald-100 text-emerald-700",
    exit: "bg-red-100 text-red-700",
    "delib-open": "bg-blue-100 text-blue-700",
    "delib-settle": "bg-teal-100 text-teal-700",
    discharge: "bg-orange-100 text-orange-700",
  };

  // Show last 50 events (newest first)
  const recent = state.eventLog.slice(-50).reverse();

  return (
    <div className="max-h-[500px] overflow-y-auto">
      {recent.length > 0 ? (
        <div className="space-y-0">
          {recent.map((entry) => (
            <div
              key={entry.id}
              className="py-1 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-start gap-1.5">
                <span
                  className={`text-[9px] px-1 py-0.5 rounded font-medium shrink-0 ${typeColors[entry.type] || "bg-gray-100 text-gray-600"}`}
                >
                  {entry.type}
                </span>
                <span className="text-[10px] font-medium text-gray-700 shrink-0">
                  {entry.agentName}
                </span>
              </div>
              <div className="text-[9px] text-gray-400 mt-0.5 truncate">
                {entry.detail}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 text-xs">
          Waiting for events...
        </div>
      )}
    </div>
  );
}

// ── Analysis Dashboard ──────────────────────────────────────────────

function AnalysisDashboard({
  summary,
  snapshots,
  config,
}: {
  summary: RunSummary;
  snapshots: RoundSnapshot[];
  config: RunConfig;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-gray-800">Run Analysis</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          ["Cathode Price", usd(summary.finalCathodePrice)],
          ["Anode Price", usd(summary.finalAnodePrice)],
          ["USDC Deployed", usd(summary.totalUsdcDeployed)],
          ["Speak Events", fmt(summary.totalSpeakEvents, 0)],
          ["Vote Events", fmt(summary.totalVoteEvents, 0)],
          ["Discussion Posts", fmt(summary.totalDiscussionPosts, 0)],
          ["Proposals Posted", fmt(summary.proposalsPosted, 0)],
          ["Settled", fmt(summary.proposalsSettled, 0)],
          ["Speaking Pool", `${fmt(summary.speakingPoolFinal, 0)}c`],
          ["Voting Pool", `${fmt(summary.votingPoolFinal, 0)}c`],
          ["Fee Pool", `${fmt(summary.feePoolFinal, 0)}c`],
          [
            "Total Fee Pools",
            `${fmt(summary.speakingPoolFinal + summary.votingPoolFinal + summary.feePoolFinal, 0)}c`,
          ],
        ].map(([label, value]) => (
          <div key={label} className="bg-gray-50 rounded-lg p-2.5">
            <div className="text-[9px] text-gray-400 uppercase">{label}</div>
            <div className="font-mono text-xs font-bold text-gray-800">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Price Over Time */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-4">
          <Sparkline
            data={snapshots.map((s) => s.cathodePrice)}
            color="bg-purple-400"
            height="h-20"
            label={`Cathode Price (${fmt(snapshots[0]?.cathodePrice ?? 0, 4)} → ${fmt(snapshots[snapshots.length - 1]?.cathodePrice ?? 0, 4)})`}
          />
          <Sparkline
            data={snapshots.map((s) => s.anodePrice)}
            color="bg-indigo-400"
            height="h-20"
            label={`Anode Price (${fmt(snapshots[0]?.anodePrice ?? 0, 4)} → ${fmt(snapshots[snapshots.length - 1]?.anodePrice ?? 0, 4)})`}
          />
        </div>
      </div>

      {/* Fee Accumulation */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">
          Fee Pool Growth
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Sparkline
            data={snapshots.map((s) => s.speakingPool)}
            color="bg-amber-400"
            height="h-14"
            label="Speaking"
          />
          <Sparkline
            data={snapshots.map((s) => s.votingPool)}
            color="bg-emerald-400"
            height="h-14"
            label="Voting"
          />
          <Sparkline
            data={snapshots.map((s) => s.feePool)}
            color="bg-rose-400"
            height="h-14"
            label="Delib Fee"
          />
        </div>
      </div>

      {/* Participation */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">
          Participation by Profile
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-gray-400 text-left">
                <th className="py-1 pr-3 font-medium">Profile</th>
                <th className="py-1 pr-3 font-medium text-right">Count</th>
                <th className="py-1 pr-3 font-medium text-right">
                  Avg Cathode
                </th>
                <th className="py-1 pr-3 font-medium text-right">Avg Anode</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary.participationByProfile).map(
                ([type, stats]) => (
                  <tr key={type} className="border-t border-gray-50">
                    <td className="py-1 pr-3 font-medium text-gray-700">
                      {type}
                    </td>
                    <td className="py-1 pr-3 text-right font-mono">
                      {stats.count}
                    </td>
                    <td className="py-1 pr-3 text-right font-mono text-purple-600">
                      {fmt(stats.avgCathode, 1)}
                    </td>
                    <td className="py-1 pr-3 text-right font-mono text-indigo-600">
                      {fmt(stats.avgAnode, 1)}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Top Anode Holders</div>
          <div className="space-y-0.5">
            {summary.topAgentsByAnode.slice(0, 5).map((e, i) => (
              <div key={e.name} className="flex items-center justify-between text-[10px]">
                <span className="text-gray-600">{i + 1}. {e.name}</span>
                <span className="font-mono text-indigo-600">{fmt(e.anode, 0)}a</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Top Cathode Holders</div>
          <div className="space-y-0.5">
            {summary.topAgentsByCathode.slice(0, 5).map((e, i) => (
              <div key={e.name} className="flex items-center justify-between text-[10px]">
                <span className="text-gray-600">{i + 1}. {e.name}</span>
                <span className="font-mono text-purple-600">{fmt(e.cathode, 0)}c</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Top Spenders</div>
          <div className="space-y-0.5">
            {summary.topAgentsBySpend.slice(0, 5).map((e, i) => (
              <div key={e.name} className="flex items-center justify-between text-[10px]">
                <span className="text-gray-600">{i + 1}. {e.name}</span>
                <span className="font-mono text-gray-700">{usd(e.spent)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deliberation Outcomes */}
      {summary.deliberationOutcomes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">
            Deliberation Outcomes ({summary.deliberationsCompleted} settled, {fmt(summary.totalBountyDistributed, 0)}c total bounty)
          </div>
          <div className="space-y-2">
            {summary.deliberationOutcomes.map((d) => (
              <div key={d.id} className="bg-gray-50 rounded-lg p-3 text-[10px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800 text-xs truncate">&ldquo;{d.title}&rdquo;</span>
                  <span className="text-gray-400 shrink-0 ml-2">
                    R{d.openedAtRound}→R{d.settledAtRound} ({d.duration} rounds)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-1.5">
                  <div>
                    <span className="text-gray-400">Winner:</span>{" "}
                    <span className="font-medium text-indigo-700">{d.winnerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Speaker Reward:</span>{" "}
                    <span className="font-mono text-amber-600">{fmt(d.speakerReward, 0)}c</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Voter Rewards:</span>{" "}
                    <span className="font-mono text-emerald-600">{fmt(d.totalVoterReward, 0)}c</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Discharged:</span>{" "}
                    <span className="font-mono text-gray-600">{fmt(d.totalDischarged, 0)}c</span>
                    <span className="text-gray-300 ml-1">(fee: {fmt(d.totalDischargeFees, 0)}c)</span>
                  </div>
                </div>
                <div className="text-gray-400 mt-1">
                  {d.participantCount} participants · Proposer: {fmt(d.proposerReward, 0)}c · Cash-out: {d.cashOutCount} ({fmt(d.cashOutPerAgent, 0)}c each) · Hold: {d.holdCount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats — Deliberation */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="text-[9px] text-gray-400 uppercase">Deliberations</div>
          <div className="font-mono text-xs font-bold text-gray-800">
            {summary.deliberationsCompleted}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="text-[9px] text-gray-400 uppercase">Total Bounty</div>
          <div className="font-mono text-xs font-bold text-gray-800">
            {fmt(summary.totalBountyDistributed, 0)}c
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="text-[9px] text-gray-400 uppercase">Proposals Settled</div>
          <div className="font-mono text-xs font-bold text-gray-800">
            {fmt(summary.proposalsSettled, 0)}
          </div>
        </div>
      </div>

      {/* Participation Growth */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-4">
          <Sparkline
            data={snapshots.map((s) => s.agentsWithCathode)}
            color="bg-purple-300"
            height="h-12"
            label="Agents with Cathode"
          />
          <Sparkline
            data={snapshots.map((s) => s.agentsWithAnode)}
            color="bg-indigo-300"
            height="h-12"
            label="Agents with Anode"
          />
        </div>
      </div>
    </div>
  );
}

// ── Saved Runs List ─────────────────────────────────────────────────

function SavedRunsList({
  runs,
  onSelect,
  onDelete,
}: {
  runs: SavedRun[];
  onSelect: (run: SavedRun) => void;
  onDelete: (id: string) => void;
}) {
  if (runs.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h2 className="text-sm font-bold text-gray-800 mb-3">Saved Runs</h2>
      <div className="space-y-2">
        {runs.map((run) => {
          const agents = run.config.botDistribution.reduce(
            (sum, b) => sum + b.count,
            0,
          );
          return (
            <div
              key={run.id}
              className="flex items-center justify-between border border-gray-100 rounded-lg p-2.5 hover:bg-gray-50 transition-colors"
            >
              <button
                onClick={() => onSelect(run)}
                className="text-left flex-1 min-w-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-800">
                    {run.config.name || "Unnamed Run"}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                      run.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {run.status}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {agents} agents · {run.config.targetRounds} rounds ·{" "}
                  {run.snapshots.length} snapshots ·{" "}
                  {new Date(run.createdAt).toLocaleDateString()}
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(run.id);
                }}
                className="text-[10px] text-gray-400 hover:text-red-500 px-2"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

type Phase = "config" | "running" | "completed" | "viewing";

export default function SimulationRuns() {
  // Phase management
  const [phase, setPhase] = useState<Phase>("config");
  const [runConfig, setRunConfig] = useState<RunConfig>(() => {
    const existing = loadRuns();
    return {
      ...DEFAULT_RUN_CONFIG,
      name: `Run #${existing.length + 1}`,
    };
  });

  // Simulation state
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [snapshots, setSnapshots] = useState<RoundSnapshot[]>([]);
  const [profiles, setProfiles] = useState<Map<string, AgentProfile> | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [simSpeed, setSimSpeed] = useState(200);

  // Refs for interval
  const simStateRef = useRef<SimulationState | null>(null);
  const snapshotsRef = useRef<RoundSnapshot[]>([]);
  const profilesRef = useRef<Map<string, AgentProfile> | null>(null);

  // Keep refs in sync
  if (simState) simStateRef.current = simState;
  snapshotsRef.current = snapshots;
  profilesRef.current = profiles;

  // Analysis state
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);

  // Saved runs
  const [savedRuns, setSavedRuns] = useState<SavedRun[]>(() => loadRuns());

  // ── Start a new run ───────────────────────────────────────────────

  const handleStart = useCallback(() => {
    const { agents, profiles: profs } = generateBots(
      runConfig.botDistribution,
    );
    const ammState = createDualAMM({
      marketReserveUSDC: runConfig.ammConfig.marketReserveUSDC,
      marketReserveCathode: runConfig.ammConfig.marketReserveCathode,
      marketFeeRate: runConfig.ammConfig.marketFeeRate,
      delibReserveCathode: runConfig.ammConfig.delibReserveCathode,
      delibReserveAnode: runConfig.ammConfig.delibReserveAnode,
      delibFeeRate: runConfig.ammConfig.delibFeeRate,
    });

    // Start with deliberation AMM closed — it opens when a proposal triggers deliberation
    ammState.deliberationActive = false;

    const initialState: SimulationState = {
      ammState,
      agents,
      discussions: [],
      proposals: [],
      eventLog: [],
      round: 0,
      deliberations: [],
      activeDeliberation: null,
    };

    const id = `run-${Date.now()}`;
    setCurrentRunId(id);
    setSimState(initialState);
    simStateRef.current = initialState;
    setSnapshots([captureSnapshot(initialState)]);
    snapshotsRef.current = [captureSnapshot(initialState)];
    setProfiles(profs);
    profilesRef.current = profs;
    setSummary(null);
    setPhase("running");
    setIsPlaying(true);
  }, [runConfig]);

  // ── Auto-play loop ────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== "running" || !isPlaying) return;

    const timer = setInterval(() => {
      const current = simStateRef.current;
      const profs = profilesRef.current;
      if (!current || !profs) return;

      const next = simulateRound(current, runConfig.ammConfig, profs);
      const snap = captureSnapshot(next);

      simStateRef.current = next;
      snapshotsRef.current = [...snapshotsRef.current, snap];

      setSimState(next);
      setSnapshots(snapshotsRef.current);

      if (next.round >= runConfig.targetRounds) {
        setIsPlaying(false);
        // Auto-complete
        const sum = computeSummary(next, snapshotsRef.current, profs);
        setSummary(sum);
        setPhase("completed");
      }
    }, simSpeed);

    return () => clearInterval(timer);
  }, [phase, isPlaying, simSpeed, runConfig]);

  // ── Fast-forward ──────────────────────────────────────────────────

  const handleFastForward = useCallback(
    (rounds: number) => {
      const current = simStateRef.current;
      const profs = profilesRef.current;
      if (!current || !profs) return;

      let state = current;
      const newSnaps = [...snapshotsRef.current];
      const target = Math.min(
        state.round + rounds,
        runConfig.targetRounds,
      );

      for (let i = state.round; i < target; i++) {
        state = simulateRound(state, runConfig.ammConfig, profs);
        newSnaps.push(captureSnapshot(state));
      }

      simStateRef.current = state;
      snapshotsRef.current = newSnaps;
      setSimState(state);
      setSnapshots(newSnaps);

      if (state.round >= runConfig.targetRounds) {
        setIsPlaying(false);
        const sum = computeSummary(state, newSnaps, profs);
        setSummary(sum);
        setPhase("completed");
      }
    },
    [runConfig],
  );

  const handleFastForwardToEnd = useCallback(() => {
    const current = simStateRef.current;
    if (!current) return;
    handleFastForward(runConfig.targetRounds - current.round);
  }, [runConfig, handleFastForward]);

  // ── Save run ──────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    if (!currentRunId || !summary) return;

    const run: SavedRun = {
      id: currentRunId,
      config: runConfig,
      status: "completed",
      createdAt: Date.now(),
      completedAt: Date.now(),
      snapshots,
      summary,
    };
    saveRun(run);
    setSavedRuns(loadRuns());
  }, [currentRunId, runConfig, snapshots, summary]);

  // ── View saved run ────────────────────────────────────────────────

  const handleSelectSavedRun = useCallback((run: SavedRun) => {
    if (run.status === "completed" && run.summary) {
      setSummary(run.summary);
      setSnapshots(run.snapshots);
      setRunConfig(run.config);
      setPhase("viewing");
    }
  }, []);

  const handleDeleteRun = useCallback((id: string) => {
    deleteRun(id);
    setSavedRuns(loadRuns());
  }, []);

  // ── Reset ─────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setPhase("config");
    setSimState(null);
    setSnapshots([]);
    setProfiles(null);
    setSummary(null);
    setCurrentRunId(null);
    const existing = loadRuns();
    setRunConfig({
      ...DEFAULT_RUN_CONFIG,
      name: `Run #${existing.length + 1}`,
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-gray-900">
              Simulation Runs
              {phase === "running" && simState && (
                <span className="ml-2 font-normal text-indigo-500">
                  R{simState.round}/{runConfig.targetRounds} —{" "}
                  {runConfig.name}
                </span>
              )}
              {phase === "completed" && (
                <span className="ml-2 font-normal text-emerald-600">
                  Completed — {runConfig.name}
                </span>
              )}
              {phase === "viewing" && (
                <span className="ml-2 font-normal text-gray-500">
                  Viewing — {runConfig.name}
                </span>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {phase === "running" && (
              <>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    isPlaying
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  }`}
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  onClick={() => handleFastForward(50)}
                  className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  FF 50
                </button>
                <button
                  onClick={handleFastForwardToEnd}
                  className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  FF End
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-gray-400">Spd</span>
                  <input
                    type="range"
                    min={20}
                    max={1000}
                    step={20}
                    value={1020 - simSpeed}
                    onChange={(e) =>
                      setSimSpeed(1020 - Number(e.target.value))
                    }
                    className="w-16 h-1 accent-indigo-500"
                  />
                </div>
              </>
            )}
            {phase === "completed" && (
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Save Run
              </button>
            )}
            {(phase === "running" ||
              phase === "completed" ||
              phase === "viewing") && (
              <button
                onClick={handleReset}
                className="px-2.5 py-1 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                New Run
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Config Phase */}
          {phase === "config" && (
            <>
              <ConfigPanel
                config={runConfig}
                onChange={setRunConfig}
                onStart={handleStart}
              />
              <SavedRunsList
                runs={savedRuns}
                onSelect={handleSelectSavedRun}
                onDelete={handleDeleteRun}
              />
            </>
          )}

          {/* Running Phase */}
          {phase === "running" && simState && profiles && (
            <div className="grid lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <LiveDashboard
                    state={simState}
                    snapshots={snapshots}
                    config={runConfig}
                    profiles={profiles}
                  />
                </div>
              </div>
              <div className="lg:col-span-7">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h2 className="text-xs font-bold text-gray-800 mb-2">
                    Activity Feed
                  </h2>
                  <ActivityFeed state={simState} />
                </div>
              </div>
            </div>
          )}

          {/* Completed / Viewing Phase — Analysis */}
          {(phase === "completed" || phase === "viewing") && summary && (
            <>
              <AnalysisDashboard
                summary={summary}
                snapshots={snapshots}
                config={runConfig}
              />
              {phase === "completed" && (
                <SavedRunsList
                  runs={savedRuns}
                  onSelect={handleSelectSavedRun}
                  onDelete={handleDeleteRun}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
