import { DEFAULT_EMITTER_CONFIG, type EmitterConfig } from "./emitter";

export interface LaunchpadSetupValues {
  decayK: number;
  creatorPct: number;
  protocolPct: number;
  reservePct: number;
  projectPct: number;
  bountyPct: number;
  tradeFeeRate: number;
  lpFeeRate: number;
  marketCapInput: string;
}

export const DEFAULT_LAUNCHPAD_SETUP_VALUES: LaunchpadSetupValues = {
  decayK: DEFAULT_EMITTER_CONFIG.decayK,
  creatorPct: DEFAULT_EMITTER_CONFIG.creatorPct,
  protocolPct: DEFAULT_EMITTER_CONFIG.protocolPct,
  reservePct: DEFAULT_EMITTER_CONFIG.reservePct,
  projectPct: DEFAULT_EMITTER_CONFIG.projectPct,
  bountyPct: DEFAULT_EMITTER_CONFIG.bountyPct,
  tradeFeeRate: DEFAULT_EMITTER_CONFIG.tradeFeeRate,
  lpFeeRate: DEFAULT_EMITTER_CONFIG.lpFeeRate,
  marketCapInput: "3000",
};

const STORAGE_KEY = "capacitor-launchpad-setup";

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function txt(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim().length > 0 ? v : fallback;
}

function sanitize(raw: unknown): LaunchpadSetupValues | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  return {
    decayK: num(obj.decayK, DEFAULT_LAUNCHPAD_SETUP_VALUES.decayK),
    creatorPct: num(obj.creatorPct, DEFAULT_LAUNCHPAD_SETUP_VALUES.creatorPct),
    protocolPct: num(obj.protocolPct, DEFAULT_LAUNCHPAD_SETUP_VALUES.protocolPct),
    reservePct: num(obj.reservePct, DEFAULT_LAUNCHPAD_SETUP_VALUES.reservePct),
    projectPct: num(obj.projectPct, DEFAULT_LAUNCHPAD_SETUP_VALUES.projectPct),
    bountyPct: num(obj.bountyPct, DEFAULT_LAUNCHPAD_SETUP_VALUES.bountyPct),
    tradeFeeRate: num(obj.tradeFeeRate, DEFAULT_LAUNCHPAD_SETUP_VALUES.tradeFeeRate),
    lpFeeRate: num(obj.lpFeeRate, DEFAULT_LAUNCHPAD_SETUP_VALUES.lpFeeRate),
    marketCapInput: txt(obj.marketCapInput, DEFAULT_LAUNCHPAD_SETUP_VALUES.marketCapInput),
  };
}

export function loadLaunchpadSetupValues(): LaunchpadSetupValues | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitize(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveLaunchpadSetupValues(values: LaunchpadSetupValues): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
}

export function launchpadSetupToEmitterConfig(values: LaunchpadSetupValues): Partial<EmitterConfig> {
  const allocatedPct = values.reservePct + values.projectPct + values.bountyPct;
  const lpPct = Math.max(0, 1 - allocatedPct);
  const targetMarketCap = Math.max(0.01, parseFloat(values.marketCapInput) || 1);
  const initialReserveUSDC = targetMarketCap * lpPct;

  return {
    decayK: values.decayK,
    creatorPct: values.creatorPct,
    protocolPct: values.protocolPct,
    reservePct: values.reservePct,
    projectPct: values.projectPct,
    bountyPct: values.bountyPct,
    tradeFeeRate: values.tradeFeeRate,
    lpFeeRate: values.lpFeeRate,
    initialReserveUSDC,
  };
}
