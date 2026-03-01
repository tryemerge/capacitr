import {
  createDualAMM,
  cathodePrice,
  anodePrice,
  DEFAULT_CONFIG,
  type DualAMMState,
  type AgentState,
} from "./amm";
import {
  simulateRound,
  generateBots,
  BOT_DISTRIBUTION,
  PROFILES,
  type BotSpec,
  type AgentProfile,
  type SimulationState,
  type Deliberation,
  type DelibSettlement,
} from "./simulation";

// ── Data Model ──────────────────────────────────────────────────────

export interface RunConfig {
  name: string;
  targetRounds: number;
  ammConfig: typeof DEFAULT_CONFIG;
  botDistribution: BotSpec[];
}

export interface RoundSnapshot {
  round: number;
  cathodePrice: number;
  anodePrice: number;
  speakingPool: number;
  votingPool: number;
  feePool: number;
  derivativePool: number;
  projectPool: number;
  capacitrPool: number;
  totalEvents: number;
  totalDiscussions: number;
  totalProposals: number;
  proposalsInDelib: number;
  agentsWithCathode: number;
  agentsWithAnode: number;
  // Deliberation lifecycle
  deliberationActive: boolean;
  activeDelibId: number | null;
  activeDelibBounty: number;
  activeDelibIdleRounds: number;
  deliberationsSettled: number;
}

export interface DelibOutcome {
  id: number;
  title: string;
  winnerName: string;
  speakerReward: number;
  totalVoterReward: number;
  proposerReward: number;
  totalDischarged: number;
  totalDischargeFees: number;
  cashOutCount: number;
  holdCount: number;
  cashOutPerAgent: number;
  participantCount: number;
  openedAtRound: number;
  settledAtRound: number;
  duration: number;
}

export interface RunSummary {
  finalCathodePrice: number;
  finalAnodePrice: number;
  totalUsdcDeployed: number;
  totalSpeakEvents: number;
  totalVoteEvents: number;
  totalDiscussionPosts: number;
  proposalsPosted: number;
  proposalsInDelib: number;
  proposalsSettled: number;
  feePoolFinal: number;
  speakingPoolFinal: number;
  votingPoolFinal: number;
  participationByProfile: Record<
    string,
    { count: number; avgCathode: number; avgAnode: number }
  >;
  topAgentsByAnode: { name: string; anode: number }[];
  topAgentsByCathode: { name: string; cathode: number }[];
  topAgentsBySpend: { name: string; spent: number }[];
  // Deliberation outcomes
  deliberationsCompleted: number;
  totalBountyDistributed: number;
  deliberationOutcomes: DelibOutcome[];
}

export interface SavedRun {
  id: string;
  config: RunConfig;
  status: "configured" | "running" | "completed";
  createdAt: number;
  completedAt?: number;
  snapshots: RoundSnapshot[];
  summary?: RunSummary;
}

// ── Defaults ────────────────────────────────────────────────────────

export const DEFAULT_RUN_CONFIG: RunConfig = {
  name: "",
  targetRounds: 200,
  ammConfig: { ...DEFAULT_CONFIG },
  botDistribution: BOT_DISTRIBUTION.map((b) => ({ ...b })),
};

// ── Snapshot Capture ────────────────────────────────────────────────

export function captureSnapshot(state: SimulationState): RoundSnapshot {
  const amm = state.ammState;
  const ad = state.activeDeliberation;
  return {
    round: state.round,
    cathodePrice: cathodePrice(amm),
    anodePrice: amm.deliberationActive ? anodePrice(amm) : 0,
    speakingPool: amm.speakingPool,
    votingPool: amm.votingPool,
    feePool: amm.feePool,
    derivativePool: amm.derivativePool,
    projectPool: amm.projectPool,
    capacitrPool: amm.capacitrPool,
    totalEvents: state.eventLog.length,
    totalDiscussions: state.discussions.length,
    totalProposals: state.proposals.length,
    proposalsInDelib: state.proposals.filter((p) => p.status === "deliberation")
      .length,
    agentsWithCathode: state.agents.filter((a) => a.cathodeBalance > 0).length,
    agentsWithAnode: state.agents.filter((a) => a.anodeBalance > 0).length,
    deliberationActive: amm.deliberationActive && ad !== null,
    activeDelibId: ad?.id ?? null,
    activeDelibBounty: ad?.bounty ?? 0,
    activeDelibIdleRounds: ad?.idleRounds ?? 0,
    deliberationsSettled: state.deliberations.length,
  };
}

// ── Summary Computation ─────────────────────────────────────────────

export function computeSummary(
  state: SimulationState,
  snapshots: RoundSnapshot[],
  profiles: Map<string, AgentProfile>,
): RunSummary {
  const amm = state.ammState;
  const cp = cathodePrice(amm);
  const ap = anodePrice(amm);

  // Participation by profile
  const profileBuckets: Record<
    string,
    { count: number; totalCathode: number; totalAnode: number }
  > = {};
  for (const agent of state.agents) {
    const profile = profiles.get(agent.id);
    const type = profile?.type ?? "Unknown";
    if (!profileBuckets[type]) {
      profileBuckets[type] = { count: 0, totalCathode: 0, totalAnode: 0 };
    }
    profileBuckets[type].count++;
    profileBuckets[type].totalCathode += agent.cathodeBalance;
    profileBuckets[type].totalAnode += agent.anodeBalance;
  }

  const participationByProfile: RunSummary["participationByProfile"] = {};
  for (const [type, bucket] of Object.entries(profileBuckets)) {
    participationByProfile[type] = {
      count: bucket.count,
      avgCathode: bucket.count > 0 ? bucket.totalCathode / bucket.count : 0,
      avgAnode: bucket.count > 0 ? bucket.totalAnode / bucket.count : 0,
    };
  }

  // Leaderboards
  const sortedByAnode = [...state.agents]
    .sort((a, b) => b.anodeBalance - a.anodeBalance)
    .slice(0, 10);
  const sortedByCathode = [...state.agents]
    .sort((a, b) => b.cathodeBalance - a.cathodeBalance)
    .slice(0, 10);
  const sortedBySpend = [...state.agents]
    .sort((a, b) => b.totalUsdcSpent - a.totalUsdcSpent)
    .slice(0, 10);

  // Deliberation outcomes
  const deliberationOutcomes: DelibOutcome[] = state.deliberations
    .filter((d) => d.settlement)
    .map((d) => {
      const s = d.settlement!;
      const voterTotal = Object.values(s.voterRewards).reduce((sum, v) => sum + v, 0);
      const participantCount = new Set([
        ...Object.keys(d.speakerActivity),
        ...Object.values(d.speakerVotes).flat(),
      ]).size;
      return {
        id: d.id,
        title: d.title,
        winnerName: s.winnerName,
        speakerReward: s.speakerReward,
        totalVoterReward: voterTotal,
        proposerReward: s.proposerReward,
        totalDischarged: s.totalDischarged,
        totalDischargeFees: s.totalDischargeFees,
        cashOutCount: s.cashOutAgentIds.length,
        holdCount: s.holdAgentIds.length,
        cashOutPerAgent: s.cashOutPerAgent,
        participantCount,
        openedAtRound: d.openedAtRound,
        settledAtRound: d.settledAtRound ?? 0,
        duration: (d.settledAtRound ?? 0) - d.openedAtRound,
      };
    });

  return {
    finalCathodePrice: cp,
    finalAnodePrice: ap,
    totalUsdcDeployed: state.agents.reduce(
      (sum, a) => sum + a.totalUsdcSpent,
      0,
    ),
    totalSpeakEvents: state.eventLog.filter((e) => e.type === "speak").length,
    totalVoteEvents: state.eventLog.filter((e) => e.type === "vote").length,
    totalDiscussionPosts: state.discussions.length,
    proposalsPosted: state.proposals.length,
    proposalsInDelib: state.proposals.filter(
      (p) => p.status === "deliberation",
    ).length,
    proposalsSettled: state.proposals.filter(
      (p) => p.status === "settled",
    ).length,
    feePoolFinal: amm.feePool,
    speakingPoolFinal: amm.speakingPool,
    votingPoolFinal: amm.votingPool,
    participationByProfile,
    topAgentsByAnode: sortedByAnode.map((a) => ({
      name: a.name,
      anode: a.anodeBalance,
    })),
    topAgentsByCathode: sortedByCathode.map((a) => ({
      name: a.name,
      cathode: a.cathodeBalance,
    })),
    topAgentsBySpend: sortedBySpend.map((a) => ({
      name: a.name,
      spent: a.totalUsdcSpent,
    })),
    deliberationsCompleted: state.deliberations.length,
    totalBountyDistributed: state.deliberations.reduce((sum, d) => sum + d.bounty, 0),
    deliberationOutcomes,
  };
}

// ── localStorage CRUD ───────────────────────────────────────────────

const STORAGE_KEY = "capacitr-runs";

export function loadRuns(): SavedRun[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRun(run: SavedRun): void {
  const runs = loadRuns();
  const idx = runs.findIndex((r) => r.id === run.id);
  if (idx >= 0) {
    runs[idx] = run;
  } else {
    runs.unshift(run);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

export function deleteRun(id: string): void {
  const runs = loadRuns().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

export function getRun(id: string): SavedRun | undefined {
  return loadRuns().find((r) => r.id === id);
}

// ── Re-exports for convenience ──────────────────────────────────────

export {
  createDualAMM,
  cathodePrice,
  anodePrice,
  DEFAULT_CONFIG,
  simulateRound,
  generateBots,
  BOT_DISTRIBUTION,
  PROFILES,
};
export type { BotSpec, AgentProfile, SimulationState, DualAMMState, AgentState, Deliberation, DelibSettlement };
