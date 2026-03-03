// ── Types ────────────────────────────────────────────────────────────

export interface WalkthroughAgentState {
  id: string;
  name: string;
  role: string;
  deposit: number;
  entryPrice: number;
  derivBought: number;
  derivRemaining: number;
  projInSpeaking: number;
  projInVoting: number;
  messages: number;
  votesGiven: string[];
  votesReceived: number;
  hasEntered: boolean;
}

export interface WalkthroughSnapshot {
  totalPool: number;
  totalDeposited: number;
  speakingPool: number;
  votingPool: number;
  reservePool: number;
  derivativeSupply: number;
  agents: WalkthroughAgentState[];
  // Settlement (only in settlement phase)
  topContributor: string | null;
  accurateVoters: string[];
  dischargeRate: number | null;
  settlement: SettlementRow[] | null;
  // Active flow for diagram highlighting
  activeFlow: ActiveFlow | null;
}

export interface SettlementRow {
  name: string;
  deposit: number;
  entryPrice: number;
  dischargeReturn: number;
  speakingReward: number;
  votingReward: number;
  totalReturn: number;
  pnl: number;
}

export type ActiveFlow =
  | { type: "entry"; agentId: string }
  | { type: "speak"; agentId: string }
  | { type: "vote"; agentId: string; targetId: string }
  | { type: "reward-speaking"; agentId: string }
  | { type: "reward-voting"; agentIds: string[] }
  | { type: "discharge" }
  | null;

export interface WalkthroughStep {
  id: number;
  phase: "intro" | "entry" | "deliberation" | "settlement";
  title: string;
  narrative: string;
  highlight?: { label: string; value: string };
  snapshot: WalkthroughSnapshot;
}

// ── Scenario ─────────────────────────────────────────────────────────

interface ScenarioAgent {
  id: string;
  name: string;
  role: string;
  deposit: number;
}

interface ScenarioAction {
  type: "speak" | "vote";
  agentId: string;
  targetId?: string;
  content?: string;
}

const AGENTS: ScenarioAgent[] = [
  { id: "a1", name: "Pioneer", role: "Early speaker", deposit: 500 },
  { id: "a2", name: "Builder", role: "Early speaker", deposit: 500 },
  { id: "a3", name: "Analyst", role: "Expert", deposit: 800 },
  { id: "a4", name: "Critic", role: "Contrarian", deposit: 400 },
  { id: "a5", name: "Evaluator", role: "Evaluator", deposit: 600 },
  { id: "a6", name: "Voter A", role: "Pure voter", deposit: 300 },
  { id: "a7", name: "Voter B", role: "Pure voter", deposit: 300 },
  { id: "a8", name: "Voter C", role: "Pure voter", deposit: 300 },
  { id: "a9", name: "Observer", role: "Silent", deposit: 200 },
  { id: "a10", name: "Latecomer", role: "Late entry", deposit: 1000 },
];

const ACTIONS: ScenarioAction[] = [
  { type: "speak", agentId: "a1", content: "We should expand to Arbitrum — the fees are lower and the ecosystem is growing." },
  { type: "speak", agentId: "a2", content: "Base is the better play. Coinbase distribution gives us more users." },
  { type: "speak", agentId: "a3", content: "Data shows Arbitrum TVL is 3x Base. Here's my analysis of the on-chain metrics." },
  { type: "speak", agentId: "a4", content: "Both are wrong. We should stay on mainnet where the liquidity is." },
  { type: "speak", agentId: "a3", content: "Rebuttal: mainnet fees are unsustainable at our transaction volume. Arbitrum is the move." },
  // Votes
  { type: "vote", agentId: "a5", targetId: "a3" },
  { type: "vote", agentId: "a1", targetId: "a3" },
  { type: "vote", agentId: "a6", targetId: "a3" },
  { type: "vote", agentId: "a7", targetId: "a3" },
  { type: "vote", agentId: "a8", targetId: "a1" },
  { type: "vote", agentId: "a2", targetId: "a2" },
  { type: "vote", agentId: "a4", targetId: "a4" },
  { type: "vote", agentId: "a10", targetId: "a3" },
];

const POOL_SIZE = 15000;
const PROJECT_SEED = 5000;
const TOTAL_POOL = POOL_SIZE + PROJECT_SEED;
const SPEAK_PCT = 15;
const VOTE_PCT = 5;
const CURVE_K = 2;

// ── Step Builder ─────────────────────────────────────────────────────

export function buildWalkthroughSteps(): WalkthroughStep[] {
  const steps: WalkthroughStep[] = [];
  const speakFrac = SPEAK_PCT / 100;
  const voteFrac = VOTE_PCT / 100;

  // Mutable state
  let totalDeposited = 0;
  let speakingPool = 0;
  let votingPool = 0;
  const agentStates: Map<string, WalkthroughAgentState> = new Map();

  // Initialize all agents as not-yet-entered
  for (const a of AGENTS) {
    agentStates.set(a.id, {
      ...a,
      entryPrice: 0,
      derivBought: 0,
      derivRemaining: 0,
      projInSpeaking: 0,
      projInVoting: 0,
      messages: 0,
      votesGiven: [],
      votesReceived: 0,
      hasEntered: false,
    });
  }

  function snap(activeFlow: ActiveFlow = null): WalkthroughSnapshot {
    const allAgents = AGENTS.map((a) => ({ ...agentStates.get(a.id)! }));
    const derivativeSupply = allAgents.reduce((s, a) => s + a.derivBought, 0);
    const reservePool = TOTAL_POOL + totalDeposited - speakingPool - votingPool;
    return {
      totalPool: TOTAL_POOL,
      totalDeposited,
      speakingPool,
      votingPool,
      reservePool,
      derivativeSupply,
      agents: allAgents,
      topContributor: null,
      accurateVoters: [],
      dischargeRate: null,
      settlement: null,
      activeFlow,
    };
  }

  // ── Phase 0: Intro ──────────────────────────────────────────────

  steps.push({
    id: 0,
    phase: "intro",
    title: "The Empty Capacitor",
    narrative:
      "A project has posted a governance question with a funded deliberation pool. " +
      "The Fee Pool (from trading activity) and a Project Seed sit ready. " +
      "The AMM sits between the Reserve Pool (Project Tokens backing) and Derivative Tokens (participation tokens). " +
      "No agents have entered yet. The capacitor is uncharged.",
    highlight: { label: "Total Pool", value: `${TOTAL_POOL.toLocaleString()} tokens` },
    snapshot: snap(),
  });

  steps.push({
    id: 1,
    phase: "intro",
    title: "The Question",
    narrative:
      `"Which L2 should we expand to?" — The project posts this question. ` +
      `10 agents evaluate the opportunity: pool size (${TOTAL_POOL.toLocaleString()} tokens), ` +
      `competition (how many others will enter?), and their own edge. ` +
      `Each decides whether the potential reward justifies the entry cost.`,
    snapshot: snap(),
  });

  // ── Phase 1: Entry (one step per agent) ─────────────────────────

  for (let i = 0; i < AGENTS.length; i++) {
    const agent = AGENTS[i];
    const entryPrice = 1 + CURVE_K * (totalDeposited / Math.max(TOTAL_POOL, 1));
    const derivBought = agent.deposit / entryPrice;
    totalDeposited += agent.deposit;

    const state = agentStates.get(agent.id)!;
    state.entryPrice = entryPrice;
    state.derivBought = derivBought;
    state.derivRemaining = derivBought;
    state.hasEntered = true;

    const firstPrice = i === 0 ? entryPrice : agentStates.get(AGENTS[0].id)!.entryPrice;
    const priceRatio = entryPrice / firstPrice;

    let narrative: string;
    if (i === 0) {
      narrative =
        `${agent.name} is first in. They deposit ${agent.deposit} Project Tokens and receive ` +
        `${derivBought.toFixed(1)} Derivative Tokens at a price of ${entryPrice.toFixed(3)} PT/DT. ` +
        `As the first entrant, they get the best deal — the bonding curve hasn't ramped yet.`;
    } else if (i === AGENTS.length - 1) {
      narrative =
        `${agent.name} enters last with the largest deposit (${agent.deposit} Project Tokens) ` +
        `but pays the highest price: ${entryPrice.toFixed(3)} PT per Derivative Token — ` +
        `${priceRatio.toFixed(1)}x what Pioneer paid. ` +
        `The bonding curve has done its job: late entry is expensive. ` +
        `Latecomer receives only ${derivBought.toFixed(1)} Derivative Tokens despite depositing the most.`;
    } else {
      narrative =
        `${agent.name} deposits ${agent.deposit} Project Tokens at price ${entryPrice.toFixed(3)} — ` +
        `${priceRatio.toFixed(2)}x Pioneer's entry price. ` +
        `They receive ${derivBought.toFixed(1)} Derivative Tokens. ` +
        `Total deposits are now ${totalDeposited.toLocaleString()} Project Tokens.`;
    }

    steps.push({
      id: steps.length,
      phase: "entry",
      title: `${agent.name} Enters`,
      narrative,
      highlight: { label: "Entry Price", value: entryPrice.toFixed(3) },
      snapshot: snap({ type: "entry", agentId: agent.id }),
    });
  }

  // ── Phase 2: Deliberation ───────────────────────────────────────

  // Speaks (one step each)
  const speaks = ACTIONS.filter((a) => a.type === "speak");
  for (let i = 0; i < speaks.length; i++) {
    const action = speaks[i];
    const actor = agentStates.get(action.agentId)!;
    const cost = actor.derivRemaining * speakFrac;
    const projValue = cost * actor.entryPrice;
    actor.derivRemaining -= cost;
    actor.projInSpeaking += projValue;
    actor.messages += 1;
    speakingPool += projValue;

    const pctLeft = ((actor.derivRemaining / actor.derivBought) * 100).toFixed(0);
    steps.push({
      id: steps.length,
      phase: "deliberation",
      title: `${actor.name} Speaks${actor.messages > 1 ? ` (#${actor.messages})` : ""}`,
      narrative:
        `"${action.content}" — This message costs ${cost.toFixed(1)} Derivative Tokens ` +
        `(15% of remaining). The Project Token value (${projValue.toFixed(1)} tokens) ` +
        `flows to the speaking pool. ${actor.name} has ${pctLeft}% of their Derivative Tokens left. ` +
        `Every word reduces their capacity to speak or vote further.`,
      highlight: { label: "Speaking Pool", value: `${speakingPool.toFixed(1)} tokens` },
      snapshot: snap({ type: "speak", agentId: action.agentId }),
    });
  }

  // Votes — first batch: Evaluator + Pioneer vote for Analyst
  const voteBatches: { label: string; actions: ScenarioAction[]; narrative: string }[] = [
    {
      label: "Early Votes",
      actions: ACTIONS.filter((a) => a.type === "vote").slice(0, 2),
      narrative: "Evaluator and Pioneer both vote for Analyst. " +
        "Voting costs 5% of remaining Derivative Tokens — much cheaper than speaking. " +
        "Pioneer spoke earlier but now recognizes Analyst's data-driven argument is stronger. " +
        "The rational move: vote for the best point rather than defend your own.",
    },
    {
      label: "Voter Wave",
      actions: ACTIONS.filter((a) => a.type === "vote").slice(2, 5),
      narrative: "Voter A and Voter B follow — voting for Analyst. Voter C backs Pioneer instead. " +
        "Each vote is cheap but draws from the same Derivative Token balance as speaking. " +
        "These agents decided their value is in evaluation, not contribution.",
    },
    {
      label: "Self-Votes & Latecomer",
      actions: ACTIONS.filter((a) => a.type === "vote").slice(5),
      narrative: "Builder and Critic self-vote — but it doesn't change the math. " +
        "Latecomer votes for Analyst, adding weight despite entering late. " +
        "Final tally: Analyst leads with 5 votes. The room has converged.",
    },
  ];

  for (const batch of voteBatches) {
    for (const action of batch.actions) {
      const actor = agentStates.get(action.agentId)!;
      const cost = actor.derivRemaining * voteFrac;
      const projValue = cost * actor.entryPrice;
      actor.derivRemaining -= cost;
      actor.projInVoting += projValue;
      actor.votesGiven.push(action.targetId!);
      votingPool += projValue;
      const target = agentStates.get(action.targetId!)!;
      target.votesReceived += 1;
    }

    steps.push({
      id: steps.length,
      phase: "deliberation",
      title: batch.label,
      narrative: batch.narrative,
      highlight: { label: "Voting Pool", value: `${votingPool.toFixed(1)} tokens` },
      snapshot: snap({ type: "vote", agentId: batch.actions[0].agentId, targetId: batch.actions[0].targetId! }),
    });
  }

  // Deliberation summary
  const analystVotes = agentStates.get("a3")!.votesReceived;
  steps.push({
    id: steps.length,
    phase: "deliberation",
    title: "Deliberation Complete",
    narrative:
      `The conversation is over. 5 messages were spoken, ${ACTIONS.filter((a) => a.type === "vote").length} votes were cast. ` +
      `Analyst leads with ${analystVotes} votes. ` +
      `The speaking pool holds ${speakingPool.toFixed(1)} tokens. ` +
      `The voting pool holds ${votingPool.toFixed(1)} tokens. ` +
      `Now the capacitor discharges — rewards flow back to participants.`,
    highlight: { label: "Total Reward Pools", value: `${(speakingPool + votingPool).toFixed(1)} tokens` },
    snapshot: snap(),
  });

  // ── Phase 3: Settlement ─────────────────────────────────────────

  // Compute settlement
  const allAgents = AGENTS.map((a) => agentStates.get(a.id)!);
  const speakers = allAgents.filter((a) => a.messages > 0);
  const topContributor = [...speakers].sort((a, b) => b.votesReceived - a.votesReceived)[0];
  const accurateVoters = allAgents.filter((a) => a.votesGiven.includes(topContributor?.id));

  const totalDerivRemaining = allAgents.reduce((s, a) => s + a.derivRemaining, 0);
  const totalProjForDischarge = TOTAL_POOL + totalDeposited - speakingPool - votingPool;
  const dischargeRate = totalDerivRemaining > 0 ? totalProjForDischarge / totalDerivRemaining : 0;

  const totalAccurateVoting = accurateVoters.reduce((s, v) => s + v.projInVoting, 0);
  const settlement: SettlementRow[] = allAgents.map((agent) => {
    const dischargeReturn = agent.derivRemaining * dischargeRate;
    let speakingReward = 0;
    let votingReward = 0;
    if (topContributor && agent.id === topContributor.id) {
      speakingReward = speakingPool;
    }
    if (accurateVoters.find((v) => v.id === agent.id)) {
      votingReward = totalAccurateVoting > 0 ? votingPool * (agent.projInVoting / totalAccurateVoting) : 0;
    }
    const totalReturn = dischargeReturn + speakingReward + votingReward;
    return {
      name: agent.name,
      deposit: agent.deposit,
      entryPrice: agent.entryPrice,
      dischargeReturn,
      speakingReward,
      votingReward,
      totalReturn,
      pnl: totalReturn - agent.deposit,
    };
  });

  function snapSettlement(activeFlow: ActiveFlow = null): WalkthroughSnapshot {
    const base = snap(activeFlow);
    return {
      ...base,
      topContributor: topContributor?.name || null,
      accurateVoters: accurateVoters.map((v) => v.name),
      dischargeRate,
      settlement,
    };
  }

  // Step: Winner
  const winnerRow = settlement.find((s) => s.name === topContributor?.name)!;
  steps.push({
    id: steps.length,
    phase: "settlement",
    title: "Winner: Speaking Pool",
    narrative:
      `${topContributor.name} received the most votes (${topContributor.votesReceived}). ` +
      `The entire speaking pool — ${speakingPool.toFixed(1)} tokens — goes to them. ` +
      `This is the proceeds of every message everyone sent. ` +
      `All the arguments funded the winner's payout.`,
    highlight: { label: "Speaking Prize", value: `${speakingPool.toFixed(1)} tokens` },
    snapshot: snapSettlement({ type: "reward-speaking", agentId: topContributor.id }),
  });

  // Step: Accurate voters
  const voterNames = accurateVoters.map((v) => v.name).join(", ");
  steps.push({
    id: steps.length,
    phase: "settlement",
    title: "Accurate Voters Rewarded",
    narrative:
      `${voterNames} — everyone who voted for ${topContributor.name} — split the voting pool ` +
      `(${votingPool.toFixed(1)} tokens) proportionally by how many Project Tokens they committed. ` +
      `Voters who identified value accurately earn from those who didn't.`,
    highlight: { label: "Voting Pool", value: `${votingPool.toFixed(1)} tokens` },
    snapshot: snapSettlement({ type: "reward-voting", agentIds: accurateVoters.map((v) => v.id) }),
  });

  // Step: Flat discharge
  const observerRow = settlement.find((s) => s.name === "Observer")!;
  steps.push({
    id: steps.length,
    phase: "settlement",
    title: "Flat Discharge",
    narrative:
      `All remaining Derivative Tokens discharge at a flat rate: ${dischargeRate.toFixed(3)} Project Tokens per Derivative Token. ` +
      `Everyone gets the same price regardless of when they entered. ` +
      `Observer — who never spoke or voted — keeps all their Derivative Tokens and receives ` +
      `${observerRow.dischargeReturn.toFixed(1)} Project Tokens back. ` +
      `Early entrants who bought cheap Derivative Tokens profit from discharge alone.`,
    highlight: { label: "Discharge Rate", value: `${dischargeRate.toFixed(3)} PT/DT` },
    snapshot: snapSettlement({ type: "discharge" }),
  });

  // Step: Final P&L
  const withRoi = settlement.map((s) => ({ ...s, roi: (s.pnl / s.deposit) * 100 }));
  const bestRoi = withRoi.reduce((a, b) => (a.roi > b.roi ? a : b));
  const worstRoi = withRoi.reduce((a, b) => (a.roi < b.roi ? a : b));
  const pioneerRoi = withRoi.find((s) => s.name === "Pioneer")!;
  const latecomerRoi = withRoi.find((s) => s.name === "Latecomer")!;
  steps.push({
    id: steps.length,
    phase: "settlement",
    title: "Final P&L",
    narrative:
      `The books are closed. Everyone profits — the pool subsidizes the deliberation. ` +
      `But ROI tells the real story: ${bestRoi.name} earned ${bestRoi.roi.toFixed(0)}% return, ` +
      `while ${worstRoi.name} earned ${worstRoi.roi.toFixed(0)}%. ` +
      `Pioneer (entered first, price ${pioneerRoi.entryPrice.toFixed(3)}) earned ${pioneerRoi.roi.toFixed(0)}% ROI. ` +
      `Latecomer (entered last, price ${latecomerRoi.entryPrice.toFixed(3)}) earned ${latecomerRoi.roi.toFixed(0)}% — ` +
      `early entry matters.`,
    highlight: { label: "Best ROI", value: `${bestRoi.roi.toFixed(0)}% (${bestRoi.name})` },
    snapshot: snapSettlement(),
  });

  // Step: Lessons
  steps.push({
    id: steps.length,
    phase: "settlement",
    title: "Key Takeaways",
    narrative:
      `1. Early entry is cheaper — the bonding curve prices Derivative Tokens lower for early entrants.\n` +
      `2. Speaking is expensive — every message costs 15% of remaining Derivative Tokens.\n` +
      `3. Voting is the safer play — cheaper than speaking, with consistent returns for accuracy.\n` +
      `4. The best strategy is being right — Analyst won by having the strongest argument, not the loudest voice.\n` +
      `5. Silence has a return — Observer profited from discharge alone, without saying a word.\n` +
      `6. Late money pays a premium — Latecomer deposited the most but the bonding curve took its cut.`,
    snapshot: snapSettlement(),
  });

  return steps;
}

// ── Config export (for reference) ────────────────────────────────────

export const WALKTHROUGH_CONFIG = {
  poolSize: POOL_SIZE,
  projectSeed: PROJECT_SEED,
  totalPool: TOTAL_POOL,
  speakPct: SPEAK_PCT,
  votePct: VOTE_PCT,
  curveK: CURVE_K,
  agentCount: AGENTS.length,
};
