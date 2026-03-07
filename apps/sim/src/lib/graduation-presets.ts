import type { EmitterConfig } from "./emitter";
import type { MarketScenario, EmitterBotSpec } from "./emitter-simulation";
import { DEFAULT_MARKET_SCENARIOS, DEFAULT_BOT_DISTRIBUTION } from "./emitter-simulation";
import type { GraduationConfig } from "./graduation";

export interface GraduationPreset {
  name: string;
  description: string;
  emitterConfig: Partial<EmitterConfig>;
  graduationConfig: Partial<GraduationConfig>;
  marketScenarios: MarketScenario[];
  botDistribution: EmitterBotSpec[];
  targetRounds: number;
}

export const GRADUATION_PRESETS: Record<string, GraduationPreset> = {
  standard69k: {
    name: "Standard ($69K)",
    description: "Default parameters, $69K graduation threshold. Bull → neutral → bear → recovery.",
    emitterConfig: {},
    graduationConfig: { graduationMarketCapUSDC: 69_000 },
    marketScenarios: DEFAULT_MARKET_SCENARIOS,
    botDistribution: DEFAULT_BOT_DISTRIBUTION,
    targetRounds: 100,
  },
  quickGrad: {
    name: "Quick Graduation ($10K)",
    description: "Low $10K threshold — see graduation happen fast with fewer agents.",
    emitterConfig: {},
    graduationConfig: { graduationMarketCapUSDC: 10_000 },
    marketScenarios: [
      { condition: "bull", volumeMultiplier: 2.0, startRound: 0, endRound: 50 },
      { condition: "neutral", volumeMultiplier: 1.0, startRound: 50, endRound: 100 },
    ],
    botDistribution: DEFAULT_BOT_DISTRIBUTION,
    targetRounds: 100,
  },
  marathon: {
    name: "Marathon ($500K)",
    description: "High threshold — may not graduate in 150 rounds. Tests sustained growth.",
    emitterConfig: {},
    graduationConfig: { graduationMarketCapUSDC: 500_000 },
    marketScenarios: [
      { condition: "bull", volumeMultiplier: 1.5, startRound: 0, endRound: 50 },
      { condition: "neutral", volumeMultiplier: 1.0, startRound: 50, endRound: 100 },
      { condition: "bull", volumeMultiplier: 1.3, startRound: 100, endRound: 150 },
    ],
    botDistribution: [
      ...DEFAULT_BOT_DISTRIBUTION,
      { profileType: "Degen", count: 5, usdcBalance: 10 },
      { profileType: "Speculator", count: 4, usdcBalance: 8 },
    ],
    targetRounds: 150,
  },
  bearAfterGrad: {
    name: "Bear After Grad",
    description: "Bull market drives to graduation, then bear. Tests post-grad resilience.",
    emitterConfig: {},
    graduationConfig: { graduationMarketCapUSDC: 30_000 },
    marketScenarios: [
      { condition: "bull", volumeMultiplier: 2.0, startRound: 0, endRound: 40 },
      { condition: "bear", volumeMultiplier: 0.3, startRound: 40, endRound: 80 },
      { condition: "neutral", volumeMultiplier: 0.6, startRound: 80, endRound: 100 },
    ],
    botDistribution: DEFAULT_BOT_DISTRIBUTION,
    targetRounds: 100,
  },
};

export const GRADUATION_PRESET_KEYS = Object.keys(GRADUATION_PRESETS);
