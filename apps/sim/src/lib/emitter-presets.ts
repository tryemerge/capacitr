import type { EmitterConfig } from "./emitter";
import type { MarketScenario, EmitterBotSpec } from "./emitter-simulation";
import { DEFAULT_MARKET_SCENARIOS, DEFAULT_BOT_DISTRIBUTION } from "./emitter-simulation";

export interface EmitterPreset {
  name: string;
  description: string;
  config: Partial<EmitterConfig>;
  marketScenarios: MarketScenario[];
  botDistribution: EmitterBotSpec[];
  targetRounds: number;
}

export const EMITTER_PRESETS: Record<string, EmitterPreset> = {
  standard: {
    name: "Standard Launch",
    description: "Default parameters. 50 agents. Bull → neutral → bear → recovery.",
    config: {},
    marketScenarios: DEFAULT_MARKET_SCENARIOS,
    botDistribution: DEFAULT_BOT_DISTRIBUTION,
    targetRounds: 100,
  },
  aggressiveDecay: {
    name: "Aggressive Decay (K=0.01)",
    description: "Early contributors earn ~10x late ones. Tests early-adopter dynamics.",
    config: { decayK: 0.01 },
    marketScenarios: DEFAULT_MARKET_SCENARIOS,
    botDistribution: DEFAULT_BOT_DISTRIBUTION,
    targetRounds: 100,
  },
  bearMarket: {
    name: "Bear Market Stress",
    description: "Volume drops 80% after round 10. Does the pool survive?",
    config: {},
    marketScenarios: [
      { condition: "bull", volumeMultiplier: 1.5, startRound: 0, endRound: 10 },
      { condition: "bear", volumeMultiplier: 0.2, startRound: 10, endRound: 100 },
    ],
    botDistribution: DEFAULT_BOT_DISTRIBUTION,
    targetRounds: 100,
  },
  creatorHeavy: {
    name: "Creator-Heavy (70/20/10)",
    description: "Creator takes 70% USDC, pool gets only 20% TOKEN. Does community still accumulate?",
    config: { creatorPct: 0.70, protocolPct: 0.10 },
    marketScenarios: DEFAULT_MARKET_SCENARIOS,
    botDistribution: DEFAULT_BOT_DISTRIBUTION,
    targetRounds: 100,
  },
  lowReserve: {
    name: "Low Reserve (2%)",
    description: "Only 2% of supply for emissions. When does it run out?",
    config: { reservePct: 0.02 },
    marketScenarios: DEFAULT_MARKET_SCENARIOS,
    botDistribution: DEFAULT_BOT_DISTRIBUTION,
    targetRounds: 150,
  },
};

export const PRESET_KEYS = Object.keys(EMITTER_PRESETS);
