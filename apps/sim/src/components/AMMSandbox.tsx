"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  createDualAMM,
  buyCathode,
  buyAnode,
  speak,
  speakAnodeCost,
  vote,
  exit,
  discussionPost,
  postProposal,
  voteOnProposal,
  cathodePrice,
  anodePriceInCathode,
  anodePrice,
  DEFAULT_CONFIG,
  DEFAULT_AGENTS,
  type DualAMMState,
  type AgentState,
  type EventLogEntry,
  type DiscussionEntry,
  type Proposal,
} from "@/lib/amm";
import {
  generateBots,
  simulateRound,
  type AgentProfile,
  type SimulationState,
} from "@/lib/simulation";

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

// ── Token Event Entry ───────────────────────────────────────────────

function TokenEvent({ entry }: { entry: EventLogEntry }) {
  const typeColors: Record<string, string> = {
    "buy-cathode": "bg-purple-100 text-purple-700",
    "buy-anode": "bg-indigo-100 text-indigo-700",
    exit: "bg-red-100 text-red-700",
  };

  return (
    <div className="py-1.5 border-b border-gray-50 last:border-0">
      <div className="flex items-start gap-2">
        <span className="text-[10px] font-mono text-gray-300 mt-0.5 w-4">
          {entry.id}
        </span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeColors[entry.type] || "bg-gray-100 text-gray-600"}`}
        >
          {entry.type}
        </span>
        <span className="text-xs font-medium text-gray-700">
          {entry.agentName}
        </span>
      </div>
      <div className="ml-6 text-[11px] text-gray-500 mt-0.5">
        {entry.detail}
      </div>
    </div>
  );
}

// ── Agent Card (ultra-compact) ──────────────────────────────────────

function AgentCard({
  agent,
  selected,
  onSelect,
}: {
  agent: AgentState;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`text-left w-full px-1.5 py-0.5 rounded border transition-all text-[9px] leading-tight ${
        selected
          ? "border-indigo-400 bg-indigo-50"
          : "border-gray-150 bg-white hover:border-gray-300"
      }`}
    >
      <div className="font-medium text-gray-700 truncate text-[10px]">
        {agent.name}
      </div>
      <div className="font-mono text-gray-400 flex gap-1.5">
        <span>${fmt(agent.usdcBalance, 0)}</span>
        <span className="text-purple-500">{fmt(agent.cathodeBalance, 0)}c</span>
        <span className="text-indigo-500">{fmt(agent.anodeBalance, 0)}a</span>
      </div>
    </button>
  );
}

// ── Selected Agent Action Panel (token ops) ─────────────────────────

function AgentActionPanel({
  agent,
  ammState,
  buyCathodeAmount,
  setBuyCathodeAmount,
  buyAnodeAmount,
  setBuyAnodeAmount,
  onBuyCathode,
  onBuyAnode,
  onSellAnode,
  onDeselect,
}: {
  agent: AgentState;
  ammState: DualAMMState;
  buyCathodeAmount: string;
  setBuyCathodeAmount: (v: string) => void;
  buyAnodeAmount: string;
  setBuyAnodeAmount: (v: string) => void;
  onBuyCathode: () => void;
  onBuyAnode: () => void;
  onSellAnode: () => void;
  onDeselect: () => void;
}) {
  const cp = cathodePrice(ammState);
  const ap = anodePrice(ammState);
  const canBuyCathode = agent.usdcBalance > 0;
  const canBuyAnode = agent.cathodeBalance > 0;
  const canExit = agent.anodeBalance > 0;

  return (
    <div className="bg-white rounded-xl border-2 border-indigo-200 p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-gray-800">{agent.name}</div>
        <button
          onClick={onDeselect}
          className="text-gray-400 hover:text-gray-600 text-xs"
        >
          close
        </button>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 rounded-lg py-2 px-1">
        <div>
          <div className="text-[9px] text-gray-400 uppercase">USDC</div>
          <div className="font-mono text-xs font-bold text-gray-800">
            {usd(agent.usdcBalance)}
          </div>
        </div>
        <div>
          <div className="text-[9px] text-purple-400 uppercase">Cathode</div>
          <div className="font-mono text-xs font-bold text-purple-700">
            {fmt(agent.cathodeBalance, 1)}
          </div>
          <div className="text-[9px] text-gray-400">
            {usd(agent.cathodeBalance * cp)}
          </div>
        </div>
        <div>
          <div className="text-[9px] text-indigo-400 uppercase">Anode</div>
          <div className="font-mono text-xs font-bold text-indigo-700">
            {fmt(agent.anodeBalance, 1)}
          </div>
          <div className="text-[9px] text-gray-400">
            {usd(agent.anodeBalance * ap)}
          </div>
        </div>
      </div>

      {/* Buy Cathode */}
      <div className="flex gap-1.5 items-center">
        <input
          type="text"
          inputMode="decimal"
          placeholder={`USDC (max ${fmt(agent.usdcBalance, 0)})`}
          value={buyCathodeAmount}
          onChange={(e) => setBuyCathodeAmount(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onBuyCathode();
          }}
          disabled={!canBuyCathode}
          className="flex-1 px-2 py-1 text-xs font-mono border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-30"
        />
        <button
          onClick={onBuyCathode}
          disabled={!canBuyCathode}
          className="px-2.5 py-1 text-[10px] font-medium rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          Buy Cath
        </button>
      </div>

      {/* Buy Anode */}
      <div className="flex gap-1.5 items-center">
        <input
          type="text"
          inputMode="decimal"
          placeholder={`Cathode (max ${fmt(agent.cathodeBalance, 0)})`}
          value={buyAnodeAmount}
          onChange={(e) => setBuyAnodeAmount(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onBuyAnode();
          }}
          disabled={!canBuyAnode}
          className="flex-1 px-2 py-1 text-xs font-mono border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-30"
        />
        <button
          onClick={onBuyAnode}
          disabled={!canBuyAnode}
          className="px-2.5 py-1 text-[10px] font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          Buy Anode
        </button>
      </div>

      {/* Sell */}
      {canExit && (
        <button
          onClick={onSellAnode}
          className="w-full px-2 py-1 text-[10px] font-medium rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        >
          {"Sell All Anode -> Cathode"}
        </button>
      )}
    </div>
  );
}

// ── Add Agent Form ──────────────────────────────────────────────────

function AddAgentForm({
  onAdd,
  onCancel,
}: {
  onAdd: (name: string, usdc: number) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [usdc, setUsdc] = useState("500");

  return (
    <div className="bg-white border-2 border-indigo-200 rounded-lg p-3 space-y-2">
      <input
        type="text"
        placeholder="Agent name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <input
        type="text"
        inputMode="decimal"
        placeholder="USDC balance"
        value={usdc}
        onChange={(e) => setUsdc(e.target.value)}
        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (name.trim() && Number(usdc) > 0) {
              onAdd(name.trim(), Number(usdc));
            }
          }}
          className="flex-1 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Add
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Deliberation Agent Card ─────────────────────────────────────────

function DelibAgentCard({
  agent,
  config,
  ammState,
  onSpeak,
  onVote,
}: {
  agent: AgentState;
  config: typeof DEFAULT_CONFIG;
  ammState: DualAMMState;
  onSpeak: (agentId: string) => void;
  onVote: (agentId: string) => void;
}) {
  const anodeCostToSpeak = speakAnodeCost(ammState, config.cathodePerSpeak);
  const canSpeak = agent.anodeBalance >= anodeCostToSpeak && isFinite(anodeCostToSpeak);
  const canVote = agent.anodeBalance >= config.anodePerVote;

  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-gray-150 text-[9px] leading-tight">
      <div className="font-medium text-gray-700 truncate min-w-0 flex-1 text-[10px]">{agent.name}</div>
      <span className="font-mono text-indigo-500 shrink-0">{fmt(agent.anodeBalance, 0)}a</span>
      <button onClick={() => onSpeak(agent.id)} disabled={!canSpeak}
        className="shrink-0 px-1 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 disabled:opacity-25 disabled:cursor-not-allowed font-medium"
        title={`Speak: ${config.cathodePerSpeak}c / ${fmt(anodeCostToSpeak, 1)}a`}
      >Spk</button>
      <button onClick={() => onVote(agent.id)} disabled={!canVote}
        className="shrink-0 px-1 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 disabled:opacity-25 disabled:cursor-not-allowed font-medium"
        title={`Vote: ${config.anodePerVote}a`}
      >Vote</button>
    </div>
  );
}

// ── Deliberation Event Entry ────────────────────────────────────────

function DelibEvent({ entry }: { entry: EventLogEntry }) {
  const typeColors: Record<string, string> = {
    speak: "bg-amber-100 text-amber-700",
    vote: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="py-1.5 border-b border-gray-50 last:border-0">
      <div className="flex items-start gap-2">
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeColors[entry.type] || "bg-gray-100 text-gray-600"}`}
        >
          {entry.type}
        </span>
        <span className="text-xs font-medium text-gray-700">
          {entry.agentName}
        </span>
      </div>
      <div className="ml-0 text-[11px] text-gray-500 mt-0.5">
        {entry.detail}
      </div>
    </div>
  );
}

// ── Discussion Section ──────────────────────────────────────────────

function DiscussAgentCard({
  agent,
  config,
  ammState,
  onPost,
}: {
  agent: AgentState;
  config: typeof DEFAULT_CONFIG;
  ammState: DualAMMState;
  onPost: (agentId: string, wordCount: number) => void;
}) {
  const wordCount = 20; // default post size
  const cost = wordCount * config.discussionCostPerWord;
  const canPost = agent.cathodeBalance >= cost;

  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-gray-150 text-[9px] leading-tight">
      <div className="font-medium text-gray-700 truncate min-w-0 flex-1 text-[10px]">{agent.name}</div>
      <span className="font-mono text-purple-500 shrink-0">{fmt(agent.cathodeBalance, 0)}c</span>
      <button onClick={() => onPost(agent.id, wordCount)} disabled={!canPost}
        className="shrink-0 px-1 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 disabled:opacity-25 disabled:cursor-not-allowed font-medium"
        title={`Post ${wordCount} words (${fmt(cost, 2)}c)`}
      >Post</button>
    </div>
  );
}

function DiscussionSection({
  agents,
  discussions,
  config,
  ammState,
  onPost,
}: {
  agents: AgentState[];
  discussions: DiscussionEntry[];
  config: typeof DEFAULT_CONFIG;
  ammState: DualAMMState;
  onPost: (agentId: string, wordCount: number) => void;
}) {
  const cp = cathodePrice(ammState);
  const wordUsd = config.discussionCostPerWord * cp;
  const eligible = agents.filter(
    (a) => a.cathodeBalance >= config.discussionMinCathode,
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-bold text-gray-800">Discussion</h2>
        <span className="text-[10px] text-gray-400">
          {config.discussionCostPerWord}c/word ({usd(wordUsd)}) · {config.discussionMinCathode}c min
        </span>
      </div>

      <div className="flex gap-3">
        {/* Discussion text feed */}
        <div className="flex-1 min-w-0">
          {discussions.length > 0 ? (
            <div className="max-h-[200px] overflow-y-auto space-y-0">
              {discussions.map((d) => (
                <div key={d.id} className="py-1 border-b border-gray-50 last:border-0">
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-sky-100 text-sky-700">post</span>
                    <span className="text-xs font-medium text-gray-700">{d.agentName}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{d.wordCount}w · {fmt(d.cathodeCost, 2)}c</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-xs">
              No discussion posts yet. Agents need {config.discussionMinCathode}+ cathode.
            </div>
          )}
        </div>

        {/* Discussers sidebar */}
        <div className="w-40 shrink-0">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">
            Discussers ({eligible.length})
          </div>
          {eligible.length > 0 ? (
            <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
              {eligible.map((agent) => (
                <DiscussAgentCard
                  key={agent.id}
                  agent={agent}
                  config={config}
                  ammState={ammState}
                  onPost={onPost}
                />
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-gray-400 py-4 text-center">
              No eligible agents yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Proposal Section ────────────────────────────────────────────────

function ProposalSection({
  agents,
  proposals,
  config,
  ammState,
  onPostProposal,
  onVote,
}: {
  agents: AgentState[];
  proposals: Proposal[];
  config: typeof DEFAULT_CONFIG;
  ammState: DualAMMState;
  onPostProposal: (agentId: string, title: string) => void;
  onVote: (agentId: string, proposalId: number, direction: "up" | "down") => void;
}) {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [voteAgent, setVoteAgent] = useState("");

  const cp = cathodePrice(ammState);
  const postUsd = config.proposalCost * cp;
  const voteUsd = config.proposalVoteCost * cp;
  const eligible = agents.filter((a) => a.cathodeBalance >= config.proposalCost);
  const voters = agents.filter((a) => a.cathodeBalance > 0);
  const agent = agents.find((a) => a.id === selectedAgent);
  const canPost = agent && titleInput.trim().length > 0 && agent.cathodeBalance >= config.proposalCost;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-bold text-gray-800">Proposals</h2>
        <span className="text-[10px] text-gray-400">{config.proposalCost}c <span className="text-gray-300">({usd(postUsd)})</span> to post</span>
      </div>
      <div className="text-[10px] text-gray-400 mb-3">
        {config.proposalVoteCost}c <span className="text-gray-300">({usd(voteUsd)})</span> to vote — net {config.proposalThreshold} upvotes → deliberation
      </div>

      {/* Post form */}
      {eligible.length > 0 && (
        <div className="space-y-2 mb-3">
          <div className="flex gap-2">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white flex-1"
            >
              <option value="">Proposer...</option>
              {eligible.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({fmt(a.cathodeBalance, 0)}c)
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Proposal title..."
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1 flex-1"
            />
            <button
              disabled={!canPost}
              onClick={() => {
                if (canPost) {
                  onPostProposal(selectedAgent, titleInput.trim());
                  setTitleInput("");
                }
              }}
              className="text-xs px-3 py-1 rounded font-medium bg-violet-100 text-violet-700 hover:bg-violet-200 disabled:opacity-25 disabled:cursor-not-allowed"
            >
              Post ({config.proposalCost}c / {usd(postUsd)})
            </button>
          </div>
        </div>
      )}

      {/* Voter selector */}
      {proposals.length > 0 && voters.length > 0 && (
        <div className="mb-3">
          <select
            value={voteAgent}
            onChange={(e) => setVoteAgent(e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white w-full"
          >
            <option value="">Select voter...</option>
            {voters.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({fmt(a.cathodeBalance, 0)}c)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Proposal list */}
      {proposals.length > 0 ? (
        <div className="space-y-2">
          {proposals.map((p) => {
            const net = p.upvotes.length - p.downvotes.length;
            const pct = Math.min(100, Math.max(0, (net / config.proposalThreshold) * 100));
            const hasVoted = voteAgent
              ? p.upvotes.includes(voteAgent) || p.downvotes.includes(voteAgent)
              : true;
            const voterHasFunds = voteAgent
              ? (agents.find((a) => a.id === voteAgent)?.cathodeBalance ?? 0) >= config.proposalVoteCost
              : false;

            return (
              <div
                key={p.id}
                className="border border-gray-100 rounded-lg p-2.5"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <div className="text-xs font-medium text-gray-800">
                      {p.title}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      by {p.agentName}
                    </div>
                  </div>
                  {p.status === "deliberation" ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">
                      In Deliberation
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                      Active
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100 mb-1.5">
                  <div
                    className={`transition-all duration-300 ${
                      p.status === "deliberation" ? "bg-emerald-400" : "bg-violet-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-emerald-600 font-mono">
                      +{p.upvotes.length}
                    </span>
                    <span className="text-rose-500 font-mono">
                      -{p.downvotes.length}
                    </span>
                    <span className="text-gray-500 font-mono">
                      net {net}/{config.proposalThreshold}
                    </span>
                  </div>

                  {p.status === "active" && voteAgent && !hasVoted && voterHasFunds && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => onVote(voteAgent, p.id, "up")}
                        className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium"
                      >
                        Upvote ({usd(voteUsd)})
                      </button>
                      <button
                        onClick={() => onVote(voteAgent, p.id, "down")}
                        className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium"
                      >
                        Downvote ({usd(voteUsd)})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-3 text-gray-400 text-xs">
          No proposals yet.
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export default function AMMSandbox() {
  const [config] = useState(DEFAULT_CONFIG);

  const [ammState, setAmmState] = useState<DualAMMState>(() =>
    createDualAMM({
      marketReserveUSDC: config.marketReserveUSDC,
      marketReserveCathode: config.marketReserveCathode,
      marketFeeRate: config.marketFeeRate,
      delibReserveCathode: config.delibReserveCathode,
      delibReserveAnode: config.delibReserveAnode,
      delibFeeRate: config.delibFeeRate,
    }),
  );

  const [agents, setAgents] = useState<AgentState[]>(() =>
    DEFAULT_AGENTS.map((a, i) => ({ ...a, id: `agent-${i}` })),
  );

  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [buyCathodeAmount, setBuyCathodeAmount] = useState("");
  const [buyAnodeAmount, setBuyAnodeAmount] = useState("");

  // Discussion & Proposals
  const [discussions, setDiscussions] = useState<DiscussionEntry[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  // Simulation auto-play
  const [isPlaying, setIsPlaying] = useState(false);
  const [simSpeed, setSimSpeed] = useState(500);
  const [roundCount, setRoundCount] = useState(0);
  const [agentProfiles, setAgentProfiles] = useState<Map<string, AgentProfile> | null>(null);

  // Ref to always have fresh state for the interval callback
  const simStateRef = useRef<SimulationState | null>(null);
  simStateRef.current = {
    ammState,
    agents,
    discussions,
    proposals,
    eventLog,
    round: roundCount,
    deliberations: [],
    activeDeliberation: null,
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  // Agents with anode (can participate in deliberation)
  const delibAgents = agents.filter((a) => a.anodeBalance > 0);


  const addLogEntry = useCallback(
    (
      type: EventLogEntry["type"],
      agentName: string,
      detail: string,
      state: DualAMMState,
    ) => {
      setEventLog((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          type,
          agentName,
          detail,
          anodePrice: anodePrice(state),
          cathodePrice: cathodePrice(state),
        },
      ]);
    },
    [],
  );

  // ── Actions ─────────────────────────────────────────────────────

  const handleBuyCathode = useCallback(() => {
    if (!selectedAgent || selectedAgent.usdcBalance <= 0) return;
    const amount =
      buyCathodeAmount === ""
        ? selectedAgent.usdcBalance
        : Number(buyCathodeAmount);
    if (isNaN(amount) || amount <= 0) return;
    const spendAmount = Math.min(amount, selectedAgent.usdcBalance);


    const result = buyCathode(ammState, spendAmount);
    setAmmState(result.newState);
    setAgents((prev) =>
      prev.map((a) =>
        a.id === selectedAgent.id
          ? {
              ...a,
              usdcBalance: a.usdcBalance - spendAmount,
              cathodeBalance: a.cathodeBalance + result.cathodeReceived,
              totalUsdcSpent: a.totalUsdcSpent + spendAmount,
            }
          : a,
      ),
    );
    setBuyCathodeAmount("");
    addLogEntry(
      "buy-cathode",
      selectedAgent.name,
      `${usd(spendAmount)} -> ${fmt(result.cathodeReceived)} cathode @ ${usd(cathodePrice(result.newState))}/cath`,
      result.newState,
    );
  }, [selectedAgent, ammState, buyCathodeAmount, addLogEntry]);

  const handleBuyAnode = useCallback(() => {
    if (!selectedAgent || selectedAgent.cathodeBalance <= 0) return;
    const amount =
      buyAnodeAmount === ""
        ? selectedAgent.cathodeBalance
        : Number(buyAnodeAmount);
    if (isNaN(amount) || amount <= 0) return;
    const spendAmount = Math.min(amount, selectedAgent.cathodeBalance);


    const result = buyAnode(ammState, spendAmount);
    setAmmState(result.newState);
    setAgents((prev) =>
      prev.map((a) =>
        a.id === selectedAgent.id
          ? {
              ...a,
              cathodeBalance: a.cathodeBalance - spendAmount,
              anodeBalance: a.anodeBalance + result.anodeReceived,
            }
          : a,
      ),
    );
    setBuyAnodeAmount("");
    addLogEntry(
      "buy-anode",
      selectedAgent.name,
      `${fmt(spendAmount)} cath (fee: ${fmt(result.fee, 1)}) -> ${fmt(result.anodeReceived)} anode`,
      result.newState,
    );
  }, [selectedAgent, ammState, buyAnodeAmount, addLogEntry]);

  const handleSpeak = useCallback(
    (agentId: string) => {
      const agent = agents.find((a) => a.id === agentId);
      if (!agent) return;
      const anodeCost = speakAnodeCost(ammState, config.cathodePerSpeak);
      if (!isFinite(anodeCost) || agent.anodeBalance < anodeCost) return;
  
      const result = speak(ammState, config.cathodePerSpeak);
      setAmmState(result.newState);
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId
            ? { ...a, anodeBalance: a.anodeBalance - result.anodeSpent }
            : a,
        ),
      );
      addLogEntry(
        "speak",
        agent.name,
        `${fmt(result.anodeSpent, 1)} anode -> ${fmt(result.cathodeToPool, 1)} cath to speaking pool (${config.cathodePerSpeak} cath word)`,
        result.newState,
      );
    },
    [agents, ammState, config, addLogEntry],
  );

  const handleVote = useCallback(
    (agentId: string) => {
      const agent = agents.find((a) => a.id === agentId);
      if (!agent || agent.anodeBalance < config.anodePerVote) return;
  
      const result = vote(ammState, config.anodePerVote);
      setAmmState(result.newState);
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId
            ? { ...a, anodeBalance: a.anodeBalance - config.anodePerVote }
            : a,
        ),
      );
      addLogEntry(
        "vote",
        agent.name,
        `${config.anodePerVote} anode -> ${fmt(result.cathodeToPool, 1)} cath to voting pool`,
        result.newState,
      );
    },
    [agents, ammState, config, addLogEntry],
  );

  const handleExit = useCallback(() => {
    if (!selectedAgent || selectedAgent.anodeBalance <= 0) return;

    const result = exit(ammState, selectedAgent.anodeBalance);
    setAmmState(result.newState);
    setAgents((prev) =>
      prev.map((a) =>
        a.id === selectedAgent.id
          ? {
              ...a,
              anodeBalance: 0,
              cathodeBalance: a.cathodeBalance + result.cathodeBack,
            }
          : a,
      ),
    );
    addLogEntry(
      "exit",
      selectedAgent.name,
      `${fmt(selectedAgent.anodeBalance)} anode -> ${fmt(result.cathodeBack)} cathode (fee: ${fmt(result.deliberationFee, 1)} cath)`,
      result.newState,
    );
  }, [selectedAgent, ammState, addLogEntry]);

  const handleAddAgent = useCallback((name: string, usdc: number) => {
    setAgents((prev) => [
      ...prev,
      {
        id: `agent-${Date.now()}`,
        name,
        usdcBalance: usdc,
        cathodeBalance: 0,
        anodeBalance: 0,
        totalUsdcSpent: 0,
      },
    ]);
    setShowAddForm(false);
  }, []);

  // ── Discussion & Proposal Handlers ───────────────────────────────

  const handleDiscussionPost = useCallback(
    (agentId: string, wordCount: number) => {
      const agent = agents.find((a) => a.id === agentId);
      if (!agent) return;
      const cost = wordCount * config.discussionCostPerWord;
      if (agent.cathodeBalance < cost || agent.cathodeBalance < config.discussionMinCathode) return;

      const result = discussionPost(ammState, cost);
      setAmmState(result.newState);
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId ? { ...a, cathodeBalance: a.cathodeBalance - cost } : a,
        ),
      );
      setDiscussions((prev) => [
        {
          id: prev.length + 1,
          agentId,
          agentName: agent.name,
          wordCount,
          cathodeCost: cost,
        },
        ...prev,
      ]);
    },
    [agents, ammState, config],
  );

  const handlePostProposal = useCallback(
    (agentId: string, title: string) => {
      const agent = agents.find((a) => a.id === agentId);
      if (!agent || agent.cathodeBalance < config.proposalCost) return;

      const result = postProposal(ammState, config.proposalCost);
      setAmmState(result.newState);
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId
            ? { ...a, cathodeBalance: a.cathodeBalance - config.proposalCost }
            : a,
        ),
      );
      setProposals((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          agentId,
          agentName: agent.name,
          title,
          cathodeCost: config.proposalCost,
          upvotes: [],
          downvotes: [],
          status: "active",
        },
      ]);
    },
    [agents, ammState, config],
  );

  const handleVoteProposal = useCallback(
    (agentId: string, proposalId: number, direction: "up" | "down") => {
      const agent = agents.find((a) => a.id === agentId);
      if (!agent || agent.cathodeBalance < config.proposalVoteCost) return;

      const proposal = proposals.find((p) => p.id === proposalId);
      if (!proposal || proposal.status !== "active") return;
      if (proposal.upvotes.includes(agentId) || proposal.downvotes.includes(agentId)) return;

      const result = voteOnProposal(ammState, config.proposalVoteCost);
      setAmmState(result.newState);
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId
            ? { ...a, cathodeBalance: a.cathodeBalance - config.proposalVoteCost }
            : a,
        ),
      );
      setProposals((prev) =>
        prev.map((p) => {
          if (p.id !== proposalId) return p;
          const updated = { ...p };
          if (direction === "up") {
            updated.upvotes = [...p.upvotes, agentId];
          } else {
            updated.downvotes = [...p.downvotes, agentId];
          }
          const net = updated.upvotes.length - updated.downvotes.length;
          if (net >= config.proposalThreshold) {
            updated.status = "deliberation";
          }
          return updated;
        }),
      );
    },
    [agents, ammState, config, proposals],
  );

  // ── Simulation Controls ──────────────────────────────────────────

  const handleLoadBots = useCallback(() => {
    setIsPlaying(false);
    const { agents: bots, profiles } = generateBots();
    setAgents(bots);
    setAgentProfiles(profiles);
    setRoundCount(0);
    setEventLog([]);
    setDiscussions([]);
    setProposals([]);
    setSelectedAgentId(null);
    setAmmState(
      createDualAMM({
        marketReserveUSDC: config.marketReserveUSDC,
        marketReserveCathode: config.marketReserveCathode,
        marketFeeRate: config.marketFeeRate,
        delibReserveCathode: config.delibReserveCathode,
        delibReserveAnode: config.delibReserveAnode,
        delibFeeRate: config.delibFeeRate,
      }),
    );
  }, [config]);

  const applySimState = useCallback((next: SimulationState) => {
    setAmmState(next.ammState);
    setAgents(next.agents);
    setDiscussions(next.discussions);
    setProposals(next.proposals);
    setEventLog(next.eventLog);
    setRoundCount(next.round);
  }, []);

  const handleFastForward = useCallback(
    (rounds: number) => {
      if (!agentProfiles || !simStateRef.current) return;
      let state = simStateRef.current;
      for (let i = 0; i < rounds; i++) {
        state = simulateRound(state, config, agentProfiles);
      }
      applySimState(state);
    },
    [agentProfiles, config, applySimState],
  );

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying || !agentProfiles) return;
    const timer = setInterval(() => {
      if (!simStateRef.current) return;
      const next = simulateRound(simStateRef.current, config, agentProfiles);
      applySimState(next);
    }, simSpeed);
    return () => clearInterval(timer);
  }, [isPlaying, simSpeed, agentProfiles, config, applySimState]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setAmmState(
      createDualAMM({
        marketReserveUSDC: config.marketReserveUSDC,
        marketReserveCathode: config.marketReserveCathode,
        marketFeeRate: config.marketFeeRate,
        delibReserveCathode: config.delibReserveCathode,
        delibReserveAnode: config.delibReserveAnode,
        delibFeeRate: config.delibFeeRate,
      }),
    );
    setAgents(DEFAULT_AGENTS.map((a, i) => ({ ...a, id: `agent-${i}` })));
    setEventLog([]);
    setSelectedAgentId(null);
    setBuyCathodeAmount("");
    setBuyAnodeAmount("");
    setDiscussions([]);
    setProposals([]);
    setAgentProfiles(null);
    setRoundCount(0);
  }, [config]);

  const tokenEvents = eventLog.filter(
    (e) =>
      e.type === "buy-cathode" || e.type === "buy-anode" || e.type === "exit",
  );
  const delibEvents = eventLog.filter(
    (e) => e.type === "speak" || e.type === "vote",
  );

  const cp = cathodePrice(ammState);
  const ap = anodePrice(ammState);
  const currentSpeakAnode = speakAnodeCost(ammState, config.cathodePerSpeak);

  // Supply computations for compact display
  const locked = ammState.market.reserveB + ammState.deliberation.reserveA;
  const circulating = ammState.totalCathodeSupply - locked - ammState.projectTreasury;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── HEADER BAR ─────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-gray-900">
              Capacitor AMM Sandbox
              {agentProfiles && (
                <span className="ml-2 font-normal text-indigo-500">
                  R{roundCount} — {agents.length} agents
                </span>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!agentProfiles ? (
              <button
                onClick={handleLoadBots}
                className="px-3 py-1 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Load 70 Bots
              </button>
            ) : (
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
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-gray-400">Spd</span>
                  <input
                    type="range"
                    min={50}
                    max={2000}
                    step={50}
                    value={2050 - simSpeed}
                    onChange={(e) => setSimSpeed(2050 - Number(e.target.value))}
                    className="w-16 h-1 accent-indigo-500"
                  />
                </div>
              </>
            )}
            <button
              onClick={handleReset}
              className="px-2.5 py-1 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* ── TOP: Prices bar + Agent grid (3-row horiz scroll) ── */}
          <section>
            {/* Prices bar */}
            <div className="grid grid-cols-4 gap-3 bg-white rounded-xl border border-gray-200 px-4 py-2.5 mb-3">
              <div>
                <div className="text-[9px] text-gray-400 uppercase">Cathode</div>
                <div className="font-mono text-base font-bold text-gray-800">{usd(cp)}</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-400 uppercase">Anode</div>
                <div className="font-mono text-base font-bold text-indigo-700">{usd(ap)}</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-400 uppercase">Word ({config.cathodePerSpeak}c)</div>
                <div className="font-mono text-base font-bold text-amber-700">{fmt(currentSpeakAnode, 1)}a</div>
              </div>
              <div>
                <div className="text-[9px] text-gray-400 uppercase">Vote (fixed)</div>
                <div className="font-mono text-base font-bold text-emerald-700">{config.anodePerVote}a</div>
              </div>
            </div>

            {/* Agent grid — 3 rows, horizontal scroll */}
            <div className="bg-white rounded-xl border border-gray-200 p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-xs font-bold text-gray-800">Agents ({agents.length})</h2>
                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="text-[9px] text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    + Add
                  </button>
                )}
              </div>

              {showAddForm && (
                <div className="mb-2">
                  <AddAgentForm
                    onAdd={handleAddAgent}
                    onCancel={() => setShowAddForm(false)}
                  />
                </div>
              )}

              <div className="overflow-x-auto pb-1">
                <div className="grid grid-rows-3 grid-flow-col gap-1 auto-cols-[120px]">
                  {agents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      selected={selectedAgentId === agent.id}
                      onSelect={() =>
                        setSelectedAgentId(
                          selectedAgentId === agent.id ? null : agent.id,
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              {selectedAgent && (
                <div className="mt-2 max-w-md">
                  <AgentActionPanel
                    agent={selectedAgent}
                    ammState={ammState}
                    buyCathodeAmount={buyCathodeAmount}
                    setBuyCathodeAmount={setBuyCathodeAmount}
                    buyAnodeAmount={buyAnodeAmount}
                    setBuyAnodeAmount={setBuyAnodeAmount}
                    onBuyCathode={handleBuyCathode}
                    onBuyAnode={handleBuyAnode}
                    onSellAnode={handleExit}
                    onDeselect={() => setSelectedAgentId(null)}
                  />
                </div>
              )}
            </div>
          </section>

          {/* ── BOTTOM: Supply/Pools | AMMs | Deliberation+Chat ──── */}
          <div className="grid lg:grid-cols-12 gap-4">
            {/* LEFT: Supply + Fee Pools */}
            <div className="lg:col-span-3 space-y-4">
              {/* Supply Card */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">
                  Cathode Supply
                </div>
                <div className="mb-3">
                  <div className="font-mono text-lg font-bold text-gray-900">{fmt(ammState.totalCathodeSupply, 0)}c</div>
                  <div className="font-mono text-[10px] text-gray-400">{usd(ammState.totalCathodeSupply * cp)}</div>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 mb-3">
                  <div className="bg-indigo-400 transition-all duration-500" style={{ width: `${(locked / ammState.totalCathodeSupply) * 100}%` }} />
                  <div className="bg-teal-400 transition-all duration-500" style={{ width: `${(ammState.projectTreasury / ammState.totalCathodeSupply) * 100}%` }} />
                  {circulating > 0.5 && (
                    <div className="bg-amber-400 transition-all duration-500" style={{ width: `${(circulating / ammState.totalCathodeSupply) * 100}%` }} />
                  )}
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="text-gray-500">Locked (70%)</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">{fmt(locked, 0)}c</div>
                      <div className="font-mono text-[10px] text-gray-400">{usd(locked * cp)}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-teal-400" />
                      <span className="text-gray-500">Treasury (30%)</span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">{fmt(ammState.projectTreasury, 0)}c</div>
                      <div className="font-mono text-[10px] text-gray-400">{usd(ammState.projectTreasury * cp)}</div>
                    </div>
                  </div>
                  {circulating > 0.5 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-gray-500">Circulating</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">{fmt(circulating, 0)}c</div>
                        <div className="font-mono text-[10px] text-gray-400">{usd(circulating * cp)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fee Pools Card */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Fee Pools</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Deliberation (20% cathode)</div>
                <div className="space-y-1 text-xs mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Speaking</span>
                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-700">{fmt(ammState.speakingPool, 1)}c</span>
                      <div className="font-mono text-[10px] text-gray-400">{usd(ammState.speakingPool * cp)}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Voting</span>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-700">{fmt(ammState.votingPool, 1)}c</span>
                      <div className="font-mono text-[10px] text-gray-400">{usd(ammState.votingPool * cp)}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Fee Pool</span>
                    <div className="text-right">
                      <span className="font-mono font-bold text-rose-600">{fmt(ammState.feePool, 1)}c</span>
                      <div className="font-mono text-[10px] text-gray-400">{usd(ammState.feePool * cp)}</div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Market (1% USDC)</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Incentive (50%)</span>
                      <div className="text-right">
                        <span className="font-mono font-bold text-orange-600">{fmt(ammState.derivativePool, 1)}c</span>
                        <div className="font-mono text-[10px] text-gray-400">{usd(ammState.derivativePool * cp)}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Project (45%)</span>
                      <span className="font-mono font-bold text-violet-600">{usd(ammState.projectPool)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Capacitr (5%)</span>
                      <span className="font-mono font-bold text-blue-600">{usd(ammState.capacitrPool)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE: AMMs + Token Events */}
            <div className="lg:col-span-4 space-y-4">
              {/* AMM1 */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">
                  AMM 1 — Market (USDC / Cathode)
                </div>
                <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 mb-3">
                  <div className="bg-blue-400 transition-all duration-500" style={{ width: `${(ammState.market.reserveA / (ammState.market.reserveA + ammState.market.reserveB)) * 100}%` }} />
                  <div className="bg-purple-400 transition-all duration-500" style={{ width: `${(ammState.market.reserveB / (ammState.market.reserveA + ammState.market.reserveB)) * 100}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <div className="text-[10px] text-blue-500 uppercase">USDC</div>
                    <div className="font-mono text-sm font-bold text-gray-800">{fmt(ammState.market.reserveA, 0)}</div>
                    <div className="font-mono text-[10px] text-gray-400">{usd(ammState.market.reserveA)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-purple-500 uppercase">Cathode</div>
                    <div className="font-mono text-sm font-bold text-gray-800">{fmt(ammState.market.reserveB, 0)}</div>
                    <div className="font-mono text-[10px] text-gray-400">{usd(ammState.market.reserveB * cp)}</div>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-2">
                  <div className="text-[10px] text-gray-400">$ per Cathode</div>
                  <span className="font-mono text-lg font-bold text-gray-900">{fmt(cp, 4)}</span>
                </div>
              </div>

              {/* AMM2 */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">
                  AMM 2 — Deliberation (Cathode / Anode)
                </div>
                <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 mb-3">
                  <div className="bg-purple-400 transition-all duration-500" style={{ width: `${(ammState.deliberation.reserveA / (ammState.deliberation.reserveA + ammState.deliberation.reserveB)) * 100}%` }} />
                  <div className="bg-indigo-400 transition-all duration-500" style={{ width: `${(ammState.deliberation.reserveB / (ammState.deliberation.reserveA + ammState.deliberation.reserveB)) * 100}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <div className="text-[10px] text-purple-500 uppercase">Cathode</div>
                    <div className="font-mono text-sm font-bold text-gray-800">{fmt(ammState.deliberation.reserveA, 0)}</div>
                    <div className="font-mono text-[10px] text-gray-400">{usd(ammState.deliberation.reserveA * cp)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-indigo-500 uppercase">Anode</div>
                    <div className="font-mono text-sm font-bold text-gray-800">{fmt(ammState.deliberation.reserveB, 0)}</div>
                    <div className="font-mono text-[10px] text-gray-400">{usd(ammState.deliberation.reserveB * ap)}</div>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-2">
                  <div className="text-[10px] text-gray-400">Cathode per Anode</div>
                  <span className="font-mono text-lg font-bold text-gray-900">{fmt(anodePriceInCathode(ammState), 4)}</span>
                </div>
              </div>

              {tokenEvents.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h2 className="text-sm font-bold text-gray-800 mb-2">Token Events</h2>
                  <div className="max-h-[250px] overflow-y-auto">
                    {tokenEvents.map((entry) => (
                      <TokenEvent key={entry.id} entry={entry} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Deliberation feed + Delib agents sidebar | Discussion | Proposals */}
            <div className="lg:col-span-5 space-y-4">
              {/* Deliberation: text feed (left) + agent cards (right) */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-sm font-bold text-gray-800 mb-3">Deliberation</h2>

                <div className="flex gap-3">
                  {/* Deliberation text feed */}
                  <div className="flex-1 min-w-0">
                    {delibEvents.length > 0 ? (
                      <div className="max-h-[350px] overflow-y-auto space-y-0">
                        {delibEvents.map((entry) => (
                          <DelibEvent key={entry.id} entry={entry} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-xs">
                        No deliberation activity yet. Agents need anode to speak and vote.
                      </div>
                    )}
                  </div>

                  {/* Delib agent cards sidebar */}
                  <div className="w-40 shrink-0">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">
                      Participants ({delibAgents.length})
                    </div>
                    {delibAgents.length > 0 ? (
                      <div className="space-y-0.5 max-h-[330px] overflow-y-auto">
                        {delibAgents.map((agent) => (
                          <DelibAgentCard
                            key={agent.id}
                            agent={agent}
                            config={config}
                            ammState={ammState}
                            onSpeak={handleSpeak}
                            onVote={handleVote}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400 py-4 text-center">
                        No anode holders yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Discussion */}
              <DiscussionSection
                agents={agents}
                discussions={discussions}
                config={config}
                ammState={ammState}
                onPost={handleDiscussionPost}
              />

              {/* Proposals */}
              <ProposalSection
                agents={agents}
                proposals={proposals}
                config={config}
                ammState={ammState}
                onPostProposal={handlePostProposal}
                onVote={handleVoteProposal}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
