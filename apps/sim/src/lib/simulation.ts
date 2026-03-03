import {
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
  anodePrice,
  resetDeliberationAMM,
  type DualAMMState,
  type AgentState,
  type EventLogEntry,
  type DiscussionEntry,
  type Proposal,
  DEFAULT_CONFIG,
} from "./amm";

// ── Agent Profiles ──────────────────────────────────────────────────

export interface AgentProfile {
  type: string;
  buyProb: number;
  buyAnodeProb: number;
  discussProb: number;
  proposeProb: number;
  voteProposalProb: number;
  speakProb: number;
  voteDelibProb: number;
  exitProb: number;
  minRound: number;
  buySizePct: [number, number]; // [min%, max%] of USDC to spend
}

export const PROFILES: Record<string, Omit<AgentProfile, "type">> = {
  Whale: {
    buyProb: 0.6,
    buyAnodeProb: 0.5,
    discussProb: 0.1,
    proposeProb: 0.02,
    voteProposalProb: 0.4,
    speakProb: 0.4,
    voteDelibProb: 0.3,
    exitProb: 0.0,
    minRound: 0,
    buySizePct: [0.1, 0.3],
  },
  Builder: {
    buyProb: 0.4,
    buyAnodeProb: 0.35,
    discussProb: 0.25,
    proposeProb: 0.08,
    voteProposalProb: 0.5,
    speakProb: 0.2,
    voteDelibProb: 0.15,
    exitProb: 0.0,
    minRound: 0,
    buySizePct: [0.05, 0.2],
  },
  Activist: {
    buyProb: 0.3,
    buyAnodeProb: 0.2,
    discussProb: 0.35,
    proposeProb: 0.1,
    voteProposalProb: 0.6,
    speakProb: 0.15,
    voteDelibProb: 0.1,
    exitProb: 0.0,
    minRound: 0,
    buySizePct: [0.05, 0.15],
  },
  Voter: {
    buyProb: 0.3,
    buyAnodeProb: 0.15,
    discussProb: 0.1,
    proposeProb: 0.01,
    voteProposalProb: 0.7,
    speakProb: 0.05,
    voteDelibProb: 0.2,
    exitProb: 0.0,
    minRound: 0,
    buySizePct: [0.05, 0.15],
  },
  Lurker: {
    buyProb: 0.15,
    buyAnodeProb: 0.05,
    discussProb: 0.03,
    proposeProb: 0.0,
    voteProposalProb: 0.15,
    speakProb: 0.02,
    voteDelibProb: 0.05,
    exitProb: 0.0,
    minRound: 0,
    buySizePct: [0.03, 0.1],
  },
  Speculator: {
    buyProb: 0.5,
    buyAnodeProb: 0.4,
    discussProb: 0.05,
    proposeProb: 0.01,
    voteProposalProb: 0.2,
    speakProb: 0.1,
    voteDelibProb: 0.05,
    exitProb: 0.08,
    minRound: 0,
    buySizePct: [0.1, 0.4],
  },
  Debater: {
    buyProb: 0.35,
    buyAnodeProb: 0.4,
    discussProb: 0.3,
    proposeProb: 0.05,
    voteProposalProb: 0.3,
    speakProb: 0.45,
    voteDelibProb: 0.2,
    exitProb: 0.0,
    minRound: 0,
    buySizePct: [0.05, 0.2],
  },
  "Late Entrant": {
    buyProb: 0.7,
    buyAnodeProb: 0.5,
    discussProb: 0.15,
    proposeProb: 0.03,
    voteProposalProb: 0.4,
    speakProb: 0.2,
    voteDelibProb: 0.15,
    exitProb: 0.0,
    minRound: 10,
    buySizePct: [0.1, 0.35],
  },
  // ── Adversarial profiles (not in default BOT_DISTRIBUTION) ──────────
  FreeRider: {
    buyProb: 0.3,
    buyAnodeProb: 0.2,
    discussProb: 0.0,
    proposeProb: 0.0,
    voteProposalProb: 0.0,
    speakProb: 0.0,
    voteDelibProb: 0.0,
    exitProb: 0.0,
    minRound: 0,
    buySizePct: [0.1, 0.25],
  },
  SybilOperator: {
    buyProb: 0.4,
    buyAnodeProb: 0.35,
    discussProb: 0.05,
    proposeProb: 0.0,
    voteProposalProb: 0.1,
    speakProb: 0.5,
    voteDelibProb: 0.8,
    exitProb: 0.0,
    minRound: 0,
    buySizePct: [0.1, 0.3],
  },
};

// ── Canned Data ─────────────────────────────────────────────────────

const PROPOSAL_TITLES = [
  "Increase validator rewards by 20%",
  "Fund community education program",
  "Reduce deliberation fee to 15%",
  "Create ambassador incentive program",
  "Allocate treasury for developer grants",
  "Launch cross-chain bridge initiative",
  "Implement quadratic voting for proposals",
  "Create content creator bounty program",
  "Establish governance council rotation",
  "Build analytics dashboard for token flows",
  "Propose emergency response fund",
  "Add tiered voting power by stake age",
  "Fund open-source tooling grants",
  "Create mentorship matching program",
  "Implement proposal deposit refund mechanism",
  "Launch community call series",
  "Establish working group for fee structure",
  "Create retroactive public goods funding",
  "Build mobile-friendly governance portal",
  "Propose seasonal bounty themes",
];

const FIRST_NAMES = [
  "Alex", "Jordan", "Sam", "Morgan", "Casey", "Riley", "Quinn", "Avery",
  "Harper", "Sage", "Rowan", "Finley", "Emery", "Blair", "Hayden", "Drew",
  "Sky", "Reese", "Tatum", "Arden", "Lane", "Kai", "Nova", "Wren",
  "Ellis", "Remy", "Phoenix", "Shea", "Briar", "Lennox", "River", "Dakota",
  "Marlowe", "Oakley", "Jules", "Indigo", "Sterling", "Ashton", "Blake", "Cameron",
  "Devon", "Eden", "Frankie", "Gray", "Haven", "Ira", "Jesse", "Kit",
  "Lark", "Milan", "Nico", "Onyx", "Pax", "Raven", "Scout", "Teal",
  "Uma", "Vale", "Winter", "Xen", "Yael", "Zephyr", "Cleo", "Dune",
  "Echo", "Fern", "Geo", "Haze", "Ivy", "Jade",
];

// ── Bot Generation ──────────────────────────────────────────────────

export interface BotSpec {
  profileType: string;
  count: number;
  usdc: number;
}

export const BOT_DISTRIBUTION: BotSpec[] = [
  { profileType: "Whale", count: 3, usdc: 2000 },
  { profileType: "Builder", count: 8, usdc: 800 },
  { profileType: "Activist", count: 10, usdc: 500 },
  { profileType: "Voter", count: 15, usdc: 400 },
  { profileType: "Lurker", count: 15, usdc: 250 },
  { profileType: "Speculator", count: 5, usdc: 1000 },
  { profileType: "Debater", count: 8, usdc: 600 },
  { profileType: "Late Entrant", count: 6, usdc: 1500 },
];

export function generateBots(customDistribution?: BotSpec[]): {
  agents: AgentState[];
  profiles: Map<string, AgentProfile>;
} {
  const distribution = customDistribution ?? BOT_DISTRIBUTION;
  const agents: AgentState[] = [];
  const profiles = new Map<string, AgentProfile>();
  const shuffledNames = [...FIRST_NAMES].sort(() => Math.random() - 0.5);
  let nameIdx = 0;

  for (const spec of distribution) {
    const profileDef = PROFILES[spec.profileType];
    for (let i = 0; i < spec.count; i++) {
      const name = shuffledNames[nameIdx++] || `Bot-${nameIdx}`;
      const id = `bot-${nameIdx}`;
      // Add some variance to USDC (±30%)
      const variance = 0.7 + Math.random() * 0.6;
      agents.push({
        id,
        name,
        usdcBalance: Math.round(spec.usdc * variance),
        cathodeBalance: 0,
        anodeBalance: 0,
        totalUsdcSpent: 0,
      });
      profiles.set(id, { type: spec.profileType, ...profileDef });
    }
  }

  return { agents, profiles };
}

// ── Deliberation Lifecycle ──────────────────────────────────────────

export interface DelibSettlement {
  winnerId: string;
  winnerName: string;
  speakerReward: number;
  voterRewards: Record<string, number>;
  proposerReward: number;
  dischargeRate: number;
  totalDischarged: number;
  totalDischargeFees: number;
  // Even-split discharge
  cashOutAgentIds: string[];
  holdAgentIds: string[];
  cashOutPerAgent: number;
  decision: string;
}

export interface Deliberation {
  id: number;
  proposalId: number;
  title: string;
  bounty: number;
  status: "open" | "settled";
  openedAtRound: number;
  settledAtRound?: number;
  idleRounds: number;
  speakerActivity: Record<string, number>;
  speakerVotes: Record<string, string[]>;
  settlement?: DelibSettlement;
}

// ── Simulation State ────────────────────────────────────────────────

export interface SimulationState {
  ammState: DualAMMState;
  agents: AgentState[];
  discussions: DiscussionEntry[];
  proposals: Proposal[];
  eventLog: EventLogEntry[];
  round: number;
  deliberations: Deliberation[];
  activeDeliberation: Deliberation | null;
}

// ── Helpers ─────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function roll(prob: number): boolean {
  return Math.random() < prob;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fmt(n: number, d = 2): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
}

// ── Core Simulation Round ───────────────────────────────────────────

export function simulateRound(
  state: SimulationState,
  config: typeof DEFAULT_CONFIG,
  profiles: Map<string, AgentProfile>,
): SimulationState {
  // Work with mutable copies
  let ammState = state.ammState;
  const agents = state.agents.map((a) => ({ ...a }));
  const discussions = [...state.discussions];
  const proposals = state.proposals.map((p) => ({
    ...p,
    upvotes: [...p.upvotes],
    downvotes: [...p.downvotes],
  }));
  const eventLog = [...state.eventLog];
  const round = state.round + 1;
  const deliberations = [...state.deliberations];
  let activeDelib = state.activeDeliberation
    ? {
        ...state.activeDeliberation,
        speakerActivity: { ...state.activeDeliberation.speakerActivity },
        speakerVotes: Object.fromEntries(
          Object.entries(state.activeDeliberation.speakerVotes).map(([k, v]) => [k, [...v]]),
        ),
      }
    : null;

  let nextEventId = eventLog.length + 1;
  let nextDiscId = discussions.length + 1;
  let nextPropId = proposals.length > 0 ? Math.max(...proposals.map((p) => p.id)) + 1 : 1;
  let nextDelibId = deliberations.length + state.deliberations.length + 1;
  let delibActionCount = 0;

  function addEvent(
    type: EventLogEntry["type"],
    agentName: string,
    detail: string,
  ) {
    eventLog.push({
      id: nextEventId++,
      type,
      agentName,
      detail,
      anodePrice: ammState.deliberationActive ? anodePrice(ammState) : 0,
      cathodePrice: cathodePrice(ammState),
    });
  }

  // ── Check if a proposal should open deliberation ──────────────────
  if (!activeDelib) {
    const readyProp = proposals.find(
      (p) => p.status === "deliberation",
    );
    if (readyProp && ammState.projectTreasury >= config.bountyAmount) {
      // Open deliberation: deduct bounty from treasury, reset anode AMM
      ammState = {
        ...resetDeliberationAMM(
          ammState,
          config.delibReserveCathode,
          config.delibReserveAnode,
          config.delibFeeRate,
        ),
        projectTreasury: ammState.projectTreasury - config.bountyAmount,
      };
      activeDelib = {
        id: nextDelibId++,
        proposalId: readyProp.id,
        title: readyProp.title,
        bounty: config.bountyAmount,
        status: "open",
        openedAtRound: round,
        idleRounds: 0,
        speakerActivity: {},
        speakerVotes: {},
      };
      addEvent(
        "delib-open",
        "System",
        `Deliberation opened: "${readyProp.title}" — ${fmt(config.bountyAmount)} cathode bounty`,
      );
    }
  }

  const delibIsActive = activeDelib !== null && ammState.deliberationActive;

  // Shuffle agent order each round for fairness
  const order = agents.map((_, i) => i).sort(() => Math.random() - 0.5);

  for (const idx of order) {
    const agent = agents[idx];
    const profile = profiles.get(agent.id);
    if (!profile || round < profile.minRound) continue;

    // Each agent takes at most ONE action per round

    // 1. Buy cathode (if has USDC and wants cathode)
    if (agent.usdcBalance > 1 && roll(profile.buyProb)) {
      const pct = rand(profile.buySizePct[0], profile.buySizePct[1]);
      const amount = Math.min(agent.usdcBalance, agent.usdcBalance * pct);
      if (amount > 0.5) {
        const result = buyCathode(ammState, amount);
        ammState = result.newState;
        agent.usdcBalance -= amount;
        agent.cathodeBalance += result.cathodeReceived;
        agent.totalUsdcSpent += amount;
        addEvent(
          "buy-cathode",
          agent.name,
          `${fmt(amount)} USDC -> ${fmt(result.cathodeReceived)} cathode`,
        );
        continue;
      }
    }

    // 2. Buy anode — ONLY when deliberation is active (agents see earning potential)
    if (delibIsActive && agent.cathodeBalance > 1 && roll(profile.buyAnodeProb)) {
      const pct = rand(0.1, 0.4);
      const amount = Math.min(agent.cathodeBalance, agent.cathodeBalance * pct);
      if (amount > 0.5) {
        const result = buyAnode(ammState, amount);
        ammState = result.newState;
        agent.cathodeBalance -= amount;
        agent.anodeBalance += result.anodeReceived;
        addEvent(
          "buy-anode",
          agent.name,
          `${fmt(amount)} cathode -> ${fmt(result.anodeReceived)} anode`,
        );
        continue;
      }
    }

    // 3. Discussion post — only between deliberations (no point spending during one)
    if (
      !delibIsActive &&
      agent.cathodeBalance >= config.discussionMinCathode &&
      roll(profile.discussProb)
    ) {
      const wordCount = Math.floor(rand(5, 50));
      const cost = wordCount * config.discussionCostPerWord;
      if (agent.cathodeBalance >= cost) {
        const result = discussionPost(ammState, cost);
        ammState = result.newState;
        agent.cathodeBalance -= cost;
        discussions.unshift({
          id: nextDiscId++,
          agentId: agent.id,
          agentName: agent.name,
          wordCount,
          cathodeCost: cost,
        });
        continue;
      }
    }

    // 4. Post proposal — only between deliberations
    if (
      !delibIsActive &&
      agent.cathodeBalance >= config.proposalCost &&
      roll(profile.proposeProb)
    ) {
      const result = postProposal(ammState, config.proposalCost);
      ammState = result.newState;
      agent.cathodeBalance -= config.proposalCost;
      proposals.push({
        id: nextPropId++,
        agentId: agent.id,
        agentName: agent.name,
        title: pick(PROPOSAL_TITLES),
        cathodeCost: config.proposalCost,
        upvotes: [],
        downvotes: [],
        status: "active",
      });
      continue;
    }

    // 5. Vote on a proposal — only between deliberations
    const activeProposals = proposals.filter(
      (p) =>
        p.status === "active" &&
        !p.upvotes.includes(agent.id) &&
        !p.downvotes.includes(agent.id),
    );
    if (
      !delibIsActive &&
      activeProposals.length > 0 &&
      agent.cathodeBalance >= config.proposalVoteCost &&
      roll(profile.voteProposalProb)
    ) {
      const prop = pick(activeProposals);
      const result = voteOnProposal(ammState, config.proposalVoteCost);
      ammState = result.newState;
      agent.cathodeBalance -= config.proposalVoteCost;
      if (Math.random() < 0.8) {
        prop.upvotes.push(agent.id);
      } else {
        prop.downvotes.push(agent.id);
      }
      const net = prop.upvotes.length - prop.downvotes.length;
      if (net >= config.proposalThreshold) {
        prop.status = "deliberation";
      }
      continue;
    }

    // 6. Speak in deliberation — diminishing returns: already-spoken agents are less likely to repeat
    if (delibIsActive && activeDelib && agent.anodeBalance > 0) {
      const priorSpeaks = activeDelib.speakerActivity[agent.id] || 0;
      const speakDiminish = 1 / (1 + priorSpeaks * 2); // halves effective prob each speak
      if (roll(profile.speakProb * speakDiminish)) {
        const anodeCost = speakAnodeCost(ammState, config.cathodePerSpeak);
        if (isFinite(anodeCost) && agent.anodeBalance >= anodeCost) {
          const result = speak(ammState, config.cathodePerSpeak);
          ammState = result.newState;
          agent.anodeBalance -= result.anodeSpent;
          activeDelib.speakerActivity[agent.id] = priorSpeaks + 1;
          delibActionCount++;
          addEvent(
            "speak",
            agent.name,
            `${fmt(result.anodeSpent)} anode -> ${fmt(result.cathodeToPool)} cath to speaking pool`,
          );
          continue;
        }
      }
    }

    // 7. Vote in deliberation — diminishing returns: agents who already voted are less likely to vote again
    if (delibIsActive && activeDelib && agent.anodeBalance >= config.anodePerVote) {
      const priorVotes = Object.values(activeDelib.speakerVotes)
        .flat().filter((v) => v === agent.id).length;
      const voteDiminish = 1 / (1 + priorVotes); // diminishes each vote cast
      if (roll(profile.voteDelibProb * voteDiminish)) {
        const speakerIds = Object.keys(activeDelib.speakerActivity);
        if (speakerIds.length > 0) {
          const target = pickWeightedSpeaker(speakerIds, activeDelib.speakerVotes, agent.id);
          if (target) {
            const result = vote(ammState, config.anodePerVote);
            ammState = result.newState;
            agent.anodeBalance -= config.anodePerVote;
            if (!activeDelib.speakerVotes[target]) {
              activeDelib.speakerVotes[target] = [];
            }
            activeDelib.speakerVotes[target].push(agent.id);
            delibActionCount++;
            const targetAgent = agents.find((a) => a.id === target);
            addEvent(
              "vote",
              agent.name,
              `Voted for ${targetAgent?.name ?? "?"} — ${config.anodePerVote} anode -> ${fmt(result.cathodeToPool)} cath`,
            );
            continue;
          }
        }
      }
    }

    // 8. Exit (speculators only, low probability) — only when deliberation active
    if (delibIsActive && agent.anodeBalance > 0 && roll(profile.exitProb)) {
      const result = exit(ammState, agent.anodeBalance);
      ammState = result.newState;
      const anodeSold = agent.anodeBalance;
      agent.anodeBalance = 0;
      agent.cathodeBalance += result.cathodeBack;
      addEvent(
        "exit",
        agent.name,
        `${fmt(anodeSold)} anode -> ${fmt(result.cathodeBack)} cathode`,
      );
      continue;
    }
  }

  // ── Track idle rounds and auto-settle ─────────────────────────────
  if (activeDelib) {
    // Activity-rate idle detection: fewer than ~3% of agents acting = "idle"
    const minActions = Math.max(2, Math.floor(agents.length * 0.03));
    if (delibActionCount < minActions) {
      activeDelib.idleRounds++;
    } else {
      activeDelib.idleRounds = 0;
    }

    const delibDuration = round - activeDelib.openedAtRound;
    const hasSpeakers = Object.keys(activeDelib.speakerActivity).length > 0;

    // Settle if: idle too long OR max duration reached (safety cap)
    if (hasSpeakers && (activeDelib.idleRounds >= config.idleRoundsToSettle || delibDuration >= config.delibMaxDuration)) {
      // ── SETTLEMENT ──────────────────────────────────────────────
      const settlement = computeSettlement(activeDelib, agents, ammState, proposals, config);
      activeDelib.status = "settled";
      activeDelib.settledAtRound = round;
      activeDelib.settlement = settlement;

      // Apply rewards to agents
      for (const agent of agents) {
        // Speaker reward
        if (agent.id === settlement.winnerId) {
          agent.cathodeBalance += settlement.speakerReward;
        }
        // Voter reward
        if (settlement.voterRewards[agent.id]) {
          agent.cathodeBalance += settlement.voterRewards[agent.id];
        }
        // Proposer reward
        const prop = proposals.find((p) => p.id === activeDelib!.proposalId);
        if (prop && agent.id === prop.agentId) {
          agent.cathodeBalance += settlement.proposerReward;
        }
        // Even-split discharge: cash-out agents split total value equally
        if (settlement.cashOutAgentIds.includes(agent.id)) {
          agent.cathodeBalance += settlement.cashOutPerAgent;
        }
        // Everyone loses their anode (AMM resets)
        agent.anodeBalance = 0;
      }

      // Close the anode AMM, add discharge fees to fee pool
      ammState = {
        ...ammState,
        deliberationActive: false,
        speakingPool: 0,
        votingPool: 0,
        feePool: ammState.feePool + settlement.totalDischargeFees,
      };

      // Mark proposal settled
      const settledProp = proposals.find((p) => p.id === activeDelib!.proposalId);
      if (settledProp) settledProp.status = "settled";

      addEvent(
        "delib-settle",
        "System",
        `Settled: "${activeDelib.title}" — Winner: ${settlement.winnerName}, ${fmt(settlement.speakerReward)} cath reward`,
      );

      deliberations.push(activeDelib);
      activeDelib = null;
    }
  }

  return {
    ammState,
    agents,
    discussions,
    proposals,
    eventLog,
    round,
    deliberations,
    activeDeliberation: activeDelib,
  };
}

// ── Settlement Computation ──────────────────────────────────────────

function computeSettlement(
  delib: Deliberation,
  agents: { id: string; name: string; anodeBalance: number }[],
  ammState: DualAMMState,
  proposals: Proposal[],
  config: typeof DEFAULT_CONFIG,
): DelibSettlement {
  // 1. Find winning speaker (most votes)
  let winnerId = "";
  let winnerName = "";
  let maxVotes = 0;
  for (const [speakerId, voters] of Object.entries(delib.speakerVotes)) {
    if (voters.length > maxVotes) {
      maxVotes = voters.length;
      winnerId = speakerId;
    }
  }
  // Fallback: if no votes, pick the most active speaker
  if (!winnerId) {
    let maxSpeaks = 0;
    for (const [speakerId, count] of Object.entries(delib.speakerActivity)) {
      if (count > maxSpeaks) {
        maxSpeaks = count;
        winnerId = speakerId;
      }
    }
  }
  const winnerAgent = agents.find((a) => a.id === winnerId);
  winnerName = winnerAgent?.name ?? "Unknown";

  // 2. Calculate rewards
  const speakerReward = ammState.speakingPool + delib.bounty * config.bountyWinnerPct;
  const proposerReward = delib.bounty * config.proposerRewardPct;

  // Voting pool + bounty voter share → split among voters who voted for winner
  const winnerVoterIds = delib.speakerVotes[winnerId] ?? [];
  const totalVoterReward = ammState.votingPool + delib.bounty * config.bountyVoterPct;
  const voterRewards: Record<string, number> = {};
  if (winnerVoterIds.length > 0) {
    const perVoter = totalVoterReward / winnerVoterIds.length;
    for (const voterId of winnerVoterIds) {
      voterRewards[voterId] = (voterRewards[voterId] || 0) + perVoter;
    }
  }

  // 3. Calculate discharge: even split among agents who cash out
  const totalAnodeOutstanding = agents.reduce((sum, a) => sum + a.anodeBalance, 0);
  const remainingCathode = ammState.deliberation.reserveA;
  const dischargeRate = totalAnodeOutstanding > 0 ? remainingCathode / totalAnodeOutstanding : 0;

  const grossCathode = totalAnodeOutstanding > 0 ? remainingCathode : 0;
  const totalDischargeFees = grossCathode * config.delibCathodeFeeRate;
  const netCathode = grossCathode - totalDischargeFees;

  // Agents with anode decide: cash out (even split) or hold (forfeit anode)
  const cashOutAgentIds: string[] = [];
  const holdAgentIds: string[] = [];
  for (const agent of agents) {
    if (agent.anodeBalance <= 0) continue;
    if (Math.random() < config.cashOutProb) {
      cashOutAgentIds.push(agent.id);
    } else {
      holdAgentIds.push(agent.id);
    }
  }
  // Fallback: if nobody wants to cash out, everyone does
  if (cashOutAgentIds.length === 0 && holdAgentIds.length > 0) {
    cashOutAgentIds.push(...holdAgentIds.splice(0));
  }

  const cashOutPerAgent = cashOutAgentIds.length > 0 ? netCathode / cashOutAgentIds.length : 0;

  const prop = proposals.find((p) => p.id === delib.proposalId);

  return {
    winnerId,
    winnerName,
    speakerReward,
    voterRewards,
    proposerReward,
    dischargeRate,
    totalDischarged: netCathode,
    totalDischargeFees,
    cashOutAgentIds,
    holdAgentIds,
    cashOutPerAgent,
    decision: prop?.title ?? delib.title,
  };
}

// ── Weighted Speaker Pick ───────────────────────────────────────────

function pickWeightedSpeaker(
  speakerIds: string[],
  speakerVotes: Record<string, string[]>,
  voterId: string,
): string | null {
  // Filter out speakers the voter already voted for
  const eligible = speakerIds.filter((sid) => {
    const voters = speakerVotes[sid] ?? [];
    return !voters.includes(voterId);
  });
  if (eligible.length === 0) return null;

  // Weight by existing vote count + 1 (so even unvoted speakers get a chance)
  const weights = eligible.map((sid) => (speakerVotes[sid]?.length ?? 0) + 1);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < eligible.length; i++) {
    r -= weights[i];
    if (r <= 0) return eligible[i];
  }
  return eligible[eligible.length - 1];
}
