import type { SimConfig } from "./simulation-legacy";

export interface Preset {
  name: string;
  config: SimConfig;
  insight: string;
}

export const PRESETS: Record<string, Preset> = {
  simple: {
    name: "4 Agents, Clear Winner",
    insight:
      "All agents deposited the same but Alpha entered first — cheaper entry = more anode = better discharge even doing nothing.",
    config: {
      poolSize: 10000,
      projectSeed: 5000,
      speakPct: 15,
      votePct: 5,
      curveK: 2,
      agents: [
        { id: "a1", name: "Alpha", deposit: 500, entryOrder: 1 },
        { id: "a2", name: "Beta", deposit: 500, entryOrder: 2 },
        { id: "a3", name: "Gamma", deposit: 500, entryOrder: 3 },
        { id: "a4", name: "Delta", deposit: 500, entryOrder: 4 },
      ],
      actions: [
        { type: "speak", agentId: "a1", content: "Expand to Arbitrum — gas is cheaper, DeFi is mature." },
        { type: "speak", agentId: "a2", content: "Base is better — Coinbase distribution." },
        { type: "speak", agentId: "a3", content: "Arbitrum TVL is 3x Base. Liquidity is there." },
        { type: "vote", agentId: "a4", targetId: "a1" },
        { type: "vote", agentId: "a3", targetId: "a1" },
        { type: "vote", agentId: "a2", targetId: "a2" },
        { type: "vote", agentId: "a1", targetId: "a1" },
      ],
    },
  },
  noisy: {
    name: "6 Agents, Noisy Room",
    insight:
      "Spammer burned 3 messages of anode for zero votes. Sage said one thing and won everything. Lurker said nothing, voted right, profited.",
    config: {
      poolSize: 10000,
      projectSeed: 5000,
      speakPct: 15,
      votePct: 5,
      curveK: 2,
      agents: [
        { id: "a1", name: "Sage", deposit: 800, entryOrder: 1 },
        { id: "a2", name: "Rambler", deposit: 400, entryOrder: 2 },
        { id: "a3", name: "Spammer", deposit: 200, entryOrder: 3 },
        { id: "a4", name: "Evaluator", deposit: 600, entryOrder: 4 },
        { id: "a5", name: "Lurker", deposit: 300, entryOrder: 5 },
        { id: "a6", name: "LateBull", deposit: 1000, entryOrder: 6 },
      ],
      actions: [
        { type: "speak", agentId: "a1", content: "Data shows Option A outperforms by 40%." },
        { type: "speak", agentId: "a2", content: "I think maybe we should consider..." },
        { type: "speak", agentId: "a3", content: "First!" },
        { type: "speak", agentId: "a3", content: "Also this is great" },
        { type: "speak", agentId: "a3", content: "Bullish" },
        { type: "speak", agentId: "a2", content: "As I was saying, multiple factors..." },
        { type: "speak", agentId: "a2", content: "And another thing..." },
        { type: "vote", agentId: "a4", targetId: "a1" },
        { type: "vote", agentId: "a5", targetId: "a1" },
        { type: "vote", agentId: "a6", targetId: "a1" },
        { type: "vote", agentId: "a1", targetId: "a1" },
        { type: "vote", agentId: "a2", targetId: "a2" },
        { type: "vote", agentId: "a3", targetId: "a3" },
      ],
    },
  },
  silent: {
    name: "8 Agents, Silent Majority",
    insight:
      "2 speakers, 5 voters, 1 observer. Observer profits purely from flat discharge — entered cheap, did nothing, lost nothing. Best conversations = few speakers, many evaluators.",
    config: {
      poolSize: 20000,
      projectSeed: 10000,
      speakPct: 15,
      votePct: 5,
      curveK: 2,
      agents: [
        { id: "a1", name: "Expert A", deposit: 1000, entryOrder: 1 },
        { id: "a2", name: "Expert B", deposit: 1000, entryOrder: 2 },
        { id: "a3", name: "Voter 1", deposit: 500, entryOrder: 3 },
        { id: "a4", name: "Voter 2", deposit: 500, entryOrder: 4 },
        { id: "a5", name: "Voter 3", deposit: 500, entryOrder: 5 },
        { id: "a6", name: "Voter 4", deposit: 500, entryOrder: 6 },
        { id: "a7", name: "Voter 5", deposit: 500, entryOrder: 7 },
        { id: "a8", name: "Observer", deposit: 300, entryOrder: 8 },
      ],
      actions: [
        { type: "speak", agentId: "a1", content: "Option A: merge with Protocol X. Full analysis..." },
        { type: "speak", agentId: "a2", content: "Option B: build in-house. Lower cost, more control." },
        { type: "speak", agentId: "a1", content: "Rebuttal: in-house takes 6 months. Market won't wait." },
        { type: "vote", agentId: "a3", targetId: "a1" },
        { type: "vote", agentId: "a4", targetId: "a1" },
        { type: "vote", agentId: "a5", targetId: "a2" },
        { type: "vote", agentId: "a6", targetId: "a1" },
        { type: "vote", agentId: "a7", targetId: "a1" },
      ],
    },
  },
  whale: {
    name: "Whale vs Field",
    insight:
      "Whale has 50x capital but only 1 vote. Minnows coordinated and won. Capital doesn't buy votes — arguments do.",
    config: {
      poolSize: 5000,
      projectSeed: 2000,
      speakPct: 15,
      votePct: 5,
      curveK: 3,
      agents: [
        { id: "a1", name: "Whale", deposit: 5000, entryOrder: 1 },
        { id: "a2", name: "Minnow 1", deposit: 100, entryOrder: 2 },
        { id: "a3", name: "Minnow 2", deposit: 100, entryOrder: 3 },
        { id: "a4", name: "Minnow 3", deposit: 100, entryOrder: 4 },
        { id: "a5", name: "Minnow 4", deposit: 100, entryOrder: 5 },
      ],
      actions: [
        { type: "speak", agentId: "a1", content: "We should do X. I have the most at stake." },
        { type: "speak", agentId: "a2", content: "Actually Y is better. Here's why..." },
        { type: "vote", agentId: "a3", targetId: "a2" },
        { type: "vote", agentId: "a4", targetId: "a2" },
        { type: "vote", agentId: "a5", targetId: "a2" },
        { type: "vote", agentId: "a2", targetId: "a2" },
        { type: "vote", agentId: "a1", targetId: "a1" },
      ],
    },
  },
};
