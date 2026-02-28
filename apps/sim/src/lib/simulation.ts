// ── Types ────────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  name: string;
  deposit: number;
  entryOrder: number;
}

export interface Action {
  type: "speak" | "vote";
  agentId: string;
  targetId?: string;
  content?: string;
}

export interface SimConfig {
  poolSize: number;
  projectSeed: number;
  agents: Agent[];
  actions: Action[];
  speakPct: number;
  votePct: number;
  curveK: number;
}

export interface EntryLogItem {
  agent: string;
  deposit: number;
  entryPrice: string;
  anodeReceived: string;
}

export interface ActionLogItem {
  type: "speak" | "vote";
  agent: string;
  target?: string;
  anodeSpent: string;
  cathodeToPool: string;
  anodeRemaining: string;
  content?: string;
}

export interface SettlementItem {
  name: string;
  deposit: number;
  entryPrice: number;
  anodeBought: number;
  anodeRemaining: number;
  messages: number;
  votesReceived: number;
  votesGiven: number;
  dischargeReturn: number;
  speakingReward: number;
  votingReward: number;
  totalReturn: number;
  pnl: number;
}

export interface SimResult {
  entryLog: EntryLogItem[];
  actionLog: ActionLogItem[];
  speakingPool: number;
  votingPool: number;
  dischargeRate: number;
  totalPool: number;
  totalDeposited: number;
  totalCathodeForDischarge: number;
  topContributor: string;
  accurateVoters: string[];
  settlement: SettlementItem[];
}

// ── Internal State ───────────────────────────────────────────────────

interface AgentState extends Agent {
  entryPrice: number;
  anodeBought: number;
  anodeRemaining: number;
  cathodeInSpeaking: number;
  cathodeInVoting: number;
  messages: number;
  votesGiven: string[];
  votesReceived: number;
}

// ── Simulation ───────────────────────────────────────────────────────

export function runSimulation(config: SimConfig): SimResult {
  const { poolSize, projectSeed, agents, actions, speakPct, votePct, curveK } = config;
  const totalPool = poolSize + projectSeed;
  const speakFrac = speakPct / 100;
  const voteFrac = votePct / 100;

  let totalDeposited = 0;
  const entryLog: EntryLogItem[] = [];
  const agentState: Record<string, AgentState> = {};

  // Entry phase
  const sortedAgents = [...agents].sort((a, b) => a.entryOrder - b.entryOrder);
  sortedAgents.forEach((agent) => {
    const entryPrice = 1 + curveK * (totalDeposited / Math.max(totalPool, 1));
    const anodeBought = agent.deposit / entryPrice;
    totalDeposited += agent.deposit;
    agentState[agent.id] = {
      ...agent,
      entryPrice,
      anodeBought,
      anodeRemaining: anodeBought,
      cathodeInSpeaking: 0,
      cathodeInVoting: 0,
      messages: 0,
      votesGiven: [],
      votesReceived: 0,
    };
    entryLog.push({
      agent: agent.name,
      deposit: agent.deposit,
      entryPrice: entryPrice.toFixed(3),
      anodeReceived: anodeBought.toFixed(2),
    });
  });

  // Action phase
  let speakingPoolTotal = 0;
  let votingPoolTotal = 0;
  const actionLog: ActionLogItem[] = [];

  actions.forEach((action) => {
    const actor = agentState[action.agentId];
    if (!actor) return;

    if (action.type === "speak") {
      const cost = actor.anodeRemaining * speakFrac;
      if (cost <= 0) return;
      const cathodeValue = cost * actor.entryPrice;
      actor.anodeRemaining -= cost;
      actor.cathodeInSpeaking += cathodeValue;
      actor.messages += 1;
      speakingPoolTotal += cathodeValue;
      actionLog.push({
        type: "speak",
        agent: actor.name,
        anodeSpent: cost.toFixed(2),
        cathodeToPool: cathodeValue.toFixed(2),
        anodeRemaining: actor.anodeRemaining.toFixed(2),
        content: action.content || "",
      });
    } else if (action.type === "vote") {
      const cost = actor.anodeRemaining * voteFrac;
      if (cost <= 0) return;
      const cathodeValue = cost * actor.entryPrice;
      actor.anodeRemaining -= cost;
      actor.cathodeInVoting += cathodeValue;
      actor.votesGiven.push(action.targetId!);
      votingPoolTotal += cathodeValue;
      const target = agentState[action.targetId!];
      if (target) target.votesReceived += 1;
      actionLog.push({
        type: "vote",
        agent: actor.name,
        target: target ? target.name : "?",
        anodeSpent: cost.toFixed(2),
        cathodeToPool: cathodeValue.toFixed(2),
        anodeRemaining: actor.anodeRemaining.toFixed(2),
      });
    }
  });

  // Settlement phase
  const speakers = Object.values(agentState).filter((a) => a.messages > 0);
  const topContributor = [...speakers].sort((a, b) => b.votesReceived - a.votesReceived)[0];
  const accurateVoters = Object.values(agentState).filter((a) =>
    a.votesGiven.includes(topContributor?.id)
  );

  const totalAnodeRemaining = Object.values(agentState).reduce(
    (s, a) => s + a.anodeRemaining,
    0
  );
  const totalCathodeForDischarge =
    totalPool + totalDeposited - speakingPoolTotal - votingPoolTotal;
  const dischargeRate =
    totalAnodeRemaining > 0 ? totalCathodeForDischarge / totalAnodeRemaining : 0;

  const settlement: SettlementItem[] = Object.values(agentState).map((agent) => {
    const dischargeReturn = agent.anodeRemaining * dischargeRate;
    let speakingReward = 0;
    let votingReward = 0;

    if (topContributor && agent.id === topContributor.id) {
      speakingReward = speakingPoolTotal;
    }
    if (accurateVoters.find((v) => v.id === agent.id)) {
      const totalAV = accurateVoters.reduce((s, v) => s + v.cathodeInVoting, 0);
      votingReward =
        totalAV > 0 ? votingPoolTotal * (agent.cathodeInVoting / totalAV) : 0;
    }

    const totalReturn = dischargeReturn + speakingReward + votingReward;
    return {
      name: agent.name,
      deposit: agent.deposit,
      entryPrice: agent.entryPrice,
      anodeBought: agent.anodeBought,
      anodeRemaining: agent.anodeRemaining,
      messages: agent.messages,
      votesReceived: agent.votesReceived,
      votesGiven: agent.votesGiven.length,
      dischargeReturn,
      speakingReward,
      votingReward,
      totalReturn,
      pnl: totalReturn - agent.deposit,
    };
  });

  return {
    entryLog,
    actionLog,
    speakingPool: speakingPoolTotal,
    votingPool: votingPoolTotal,
    dischargeRate,
    totalPool,
    totalDeposited,
    totalCathodeForDischarge,
    topContributor: topContributor?.name || "none",
    accurateVoters: accurateVoters.map((v) => v.name),
    settlement,
  };
}
