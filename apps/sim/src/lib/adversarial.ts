import type { RoundSnapshot, RunSummary, DelibOutcome } from "./runs";

// ── Result Type ──────────────────────────────────────────────────────

export interface AdversarialResult {
  scenarioName: string;
  profitable: boolean;
  roi: number;        // ratio (1.0 = break-even, 2.0 = 2x return)
  riskLevel: "low" | "medium" | "high" | "critical";
  details: string;
}

// ── Helpers ──────────────────────────────────────────────────────────

function fmt(n: number, d = 2): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
}

function noDataResult(scenarioName: string): AdversarialResult {
  return {
    scenarioName,
    profitable: false,
    roi: 0,
    riskLevel: "low",
    details: "No settled deliberations — insufficient data to evaluate this scenario.",
  };
}

// ── Free Rider Analysis ──────────────────────────────────────────────
//
// Attack: enter a deliberation early (cheap anode), do nothing,
// collect flat even-split discharge at settlement.
//
// ROI model: spend exactly enough cathode to buy 1 anode at the
// cheapest opening price. Receive avgCashOutPerAgent cathode at settlement.
// ROI = avgCashOutPerAgent / entryPricePerAnode.

export function analyzeFreeRider(
  snapshots: RoundSnapshot[],
  summary: RunSummary,
): AdversarialResult {
  const scenarioName = "Free Rider";
  const outcomes = summary.deliberationOutcomes;
  if (outcomes.length === 0) return noDataResult(scenarioName);

  // Average flat discharge per cash-out agent across all settlements
  const avgCashOut = outcomes.reduce((sum, d) => sum + d.cashOutPerAgent, 0) / outcomes.length;

  // Cheapest entry point: anode price at the first round a deliberation was active
  const firstActiveSnap = snapshots.find((s) => s.deliberationActive && s.anodePrice > 0);
  const entryPrice = firstActiveSnap?.anodePrice ?? 1;

  // ROI: enter at entryPrice cathode per anode (buy 1 anode), receive avgCashOut cathode
  const roi = entryPrice > 0 ? avgCashOut / entryPrice : 0;
  const profitable = roi > 1.0;

  const riskLevel: AdversarialResult["riskLevel"] =
    roi > 2.0 ? "critical" :
    roi > 1.5 ? "high" :
    roi > 1.0 ? "medium" : "low";

  const details = profitable
    ? `Profitable at ${fmt(roi)}x ROI. Avg discharge: ${fmt(avgCashOut)} cathode per agent. ` +
      `Cheapest entry: ${fmt(entryPrice)} cathode/anode. ` +
      `Entering early and doing nothing returns more than the entry cost. ` +
      `The flat even-split discharge is the primary vulnerability.`
    : `Not profitable at ${fmt(roi)}x ROI. Avg discharge: ${fmt(avgCashOut)} cathode per agent. ` +
      `Entry cost (${fmt(entryPrice)} cathode/anode) exceeds expected flat discharge. ` +
      `Free riding is self-limiting under these parameters.`;

  return { scenarioName, profitable, roi, riskLevel, details };
}

// ── Sybil Analysis ───────────────────────────────────────────────────
//
// Attack: N coordinated personas, all controlled by one actor.
// One persona speaks (winning argument), N-1 vote for it.
// Actor captures speaking pool + a large share of voting pool.
//
// ROI model: N personas each buy 1 anode at opening price.
// Best-case reward = avg speakerReward + (N-1)/participantCount × avg voterReward.

export function analyzeSybil(
  snapshots: RoundSnapshot[],
  summary: RunSummary,
  numPersonas = 5,
): AdversarialResult {
  const scenarioName = "Sybil Attack";
  const outcomes = summary.deliberationOutcomes;
  if (outcomes.length === 0) return noDataResult(scenarioName);

  // Average deliberation rewards
  const avgSpeakerReward = outcomes.reduce((sum, d) => sum + d.speakerReward, 0) / outcomes.length;
  const avgVoterReward = outcomes.reduce((sum, d) => sum + d.totalVoterReward, 0) / outcomes.length;
  const avgParticipants = outcomes.reduce((sum, d) => sum + d.participantCount, 0) / outcomes.length;

  // Entry cost: each persona buys 1 anode at cheapest opening price
  const firstActiveSnap = snapshots.find((s) => s.deliberationActive && s.anodePrice > 0);
  const entryPrice = firstActiveSnap?.anodePrice ?? 1;
  const totalInvestment = numPersonas * entryPrice;

  // Best-case reward: sybil wins speaking pool + N-1 votes out of all voters
  const voterShare = avgParticipants > 0
    ? ((numPersonas - 1) / (avgParticipants + numPersonas - 1)) * avgVoterReward
    : 0;
  const totalReward = avgSpeakerReward + voterShare;

  const roi = totalInvestment > 0 ? totalReward / totalInvestment : 0;
  const profitable = roi > 1.0;

  const riskLevel: AdversarialResult["riskLevel"] =
    roi > 2.0 ? "critical" :
    roi > 1.5 ? "high" :
    roi > 1.0 ? "medium" : "low";

  const details = profitable
    ? `${numPersonas}-persona sybil is profitable at ${fmt(roi)}x ROI. ` +
      `Total investment: ${fmt(totalInvestment)} cathode. ` +
      `Expected capture: ${fmt(avgSpeakerReward)} (speaking) + ${fmt(voterShare)} (voting) = ${fmt(totalReward)} cathode. ` +
      `Coordination advantage: ${numPersonas - 1} guaranteed votes for the speaking persona skews pool capture.`
    : `${numPersonas}-persona sybil is not profitable at ${fmt(roi)}x ROI. ` +
      `Total investment: ${fmt(totalInvestment)} cathode vs expected reward: ${fmt(totalReward)} cathode. ` +
      `Speaking pool and voting pool are not large enough to justify coordinated entry costs.`;

  return { scenarioName, profitable, roi, riskLevel, details };
}

// ── Speaking Equilibrium Analysis ────────────────────────────────────
//
// Attack (degenerate equilibrium): rational agents avoid speaking
// because the winner-take-all pool makes speaking too risky relative
// to just voting. Over time, deliberations collapse to 1 speaker.
//
// Not an ROI metric — reports equilibrium health trend.

export function analyzeSpeakingEquilibrium(
  outcomes: DelibOutcome[],
): AdversarialResult {
  const scenarioName = "Speaking Equilibrium";
  if (outcomes.length === 0) return noDataResult(scenarioName);

  // Unique speakers per deliberation
  const speakerCounts = outcomes.map((o) => o.speakerCount);
  const avgSpeakers = speakerCounts.reduce((s, c) => s + c, 0) / speakerCounts.length;

  // Trend: is speaker count declining over successive deliberations?
  let trending = "stable";
  let riskLevel: AdversarialResult["riskLevel"] = "low";

  if (speakerCounts.length >= 3) {
    const firstHalf = speakerCounts.slice(0, Math.floor(speakerCounts.length / 2));
    const secondHalf = speakerCounts.slice(Math.floor(speakerCounts.length / 2));
    const avgFirst = firstHalf.reduce((s, c) => s + c, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, c) => s + c, 0) / secondHalf.length;

    if (avgSecond < avgFirst * 0.7) {
      trending = "declining";
    } else if (avgSecond > avgFirst * 1.2) {
      trending = "improving";
    }
  }

  const finalCount = speakerCounts[speakerCounts.length - 1] ?? avgSpeakers;
  if (finalCount <= 1) {
    riskLevel = "high";
  } else if (trending === "declining") {
    riskLevel = "medium";
  }

  // For consistency with other analyses, roi represents avg speakers (higher = healthier)
  const roi = avgSpeakers;
  const profitable = false; // Not applicable — this is a health metric not a profit metric

  const details =
    `Avg speakers per deliberation: ${fmt(avgSpeakers, 1)}. ` +
    `Trend: ${trending}. ` +
    (finalCount <= 1
      ? `⚠ Last deliberation had ≤1 speaker — approaching rubber-stamp equilibrium. `
      : `Speaker counts are ${trending === "stable" ? "holding steady" : trending}. `) +
    `${speakerCounts.map((c, i) => `D${i + 1}: ${c}`).join(", ")}.`;

  return { scenarioName, profitable, roi, riskLevel, details };
}

// ── Death Spiral Analysis ────────────────────────────────────────────
//
// Attack (reflexive decline): a low-quality deliberation outcome
// (winner had few votes) signals poor governance, traders sell,
// cathode price drops, pools shrink, future deliberations are worse.
//
// Detection: find deliberations where winner vote count ≤ median,
// then check whether cathode price dropped > 20% in the 5 rounds
// after and didn't recover within 10 rounds.

export function analyzeDeathSpiral(
  snapshots: RoundSnapshot[],
  outcomes: DelibOutcome[],
): AdversarialResult {
  const scenarioName = "Death Spiral";
  if (outcomes.length === 0 || snapshots.length === 0) return noDataResult(scenarioName);

  // Find "bad" deliberations: winner had fewest or below-median votes
  const badDelibRounds: number[] = [];

  for (const o of outcomes) {
    const allVoteCounts = o.speakerVoteCounts;
    if (allVoteCounts.length === 0) continue;

    const winnerVotes = o.winnerVoteCount;
    const sortedCounts = [...allVoteCounts].sort((a, b) => a - b);
    const median = sortedCounts[Math.floor(sortedCounts.length / 2)] ?? 0;

    // "Low quality" = winner had fewer or equal votes to median (not a clear winner)
    if (winnerVotes <= median && allVoteCounts.length > 1) {
      badDelibRounds.push(o.settledAtRound);
    }
  }

  if (badDelibRounds.length === 0) {
    return {
      scenarioName,
      profitable: false,
      roi: 0,
      riskLevel: "low",
      details: "No low-quality deliberation outcomes detected. All winners had above-median vote counts.",
    };
  }

  // For each bad deliberation, check cathode price 5-10 rounds after
  let spiralCount = 0;
  const spiralDetails: string[] = [];

  for (const settledRound of badDelibRounds) {
    const baseSnap = snapshots.find((s) => s.round === settledRound);
    if (!baseSnap || baseSnap.cathodePrice === 0) continue;

    const basePrice = baseSnap.cathodePrice;
    const nearSnaps = snapshots.filter(
      (s) => s.round > settledRound && s.round <= settledRound + 5,
    );
    const farSnaps = snapshots.filter(
      (s) => s.round > settledRound && s.round <= settledRound + 10,
    );

    const minNearPrice = nearSnaps.length > 0
      ? Math.min(...nearSnaps.map((s) => s.cathodePrice))
      : basePrice;
    const maxFarPrice = farSnaps.length > 0
      ? Math.max(...farSnaps.map((s) => s.cathodePrice))
      : basePrice;

    const priceDrop = (basePrice - minNearPrice) / basePrice;
    const recovered = maxFarPrice >= basePrice * 0.8;

    if (priceDrop > 0.2 && !recovered) {
      spiralCount++;
      spiralDetails.push(`Round ${settledRound}: −${(priceDrop * 100).toFixed(0)}% drop, no recovery`);
    }
  }

  const roi = badDelibRounds.length > 0 ? spiralCount / badDelibRounds.length : 0;
  const riskLevel: AdversarialResult["riskLevel"] =
    roi > 0.5 ? "critical" :
    roi > 0.25 ? "high" :
    roi > 0 ? "medium" : "low";
  const profitable = false; // Health metric

  const details =
    `${badDelibRounds.length} low-quality deliberation(s) detected. ` +
    `${spiralCount} triggered a death spiral (price drop >20% without recovery). ` +
    (spiralDetails.length > 0
      ? spiralDetails.join("; ") + ". "
      : "No actual spirals observed — system showed resilience. ") +
    `Death spiral risk rate: ${(roi * 100).toFixed(0)}%.`;

  return { scenarioName, profitable, roi, riskLevel, details };
}
