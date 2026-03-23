/**
 * Co-Founder Compatibility Score Algorithm
 *
 * Deterministic, pure function. The AI interprets the score narratively
 * but never computes it — prevents variance between generations.
 *
 * Scoring model:
 *   For each success factor group, compute a penalty from dimension-pair deltas.
 *   Weight penalties by group importance (research-informed).
 *   Score = 100 - (weighted_penalty_sum * 100), clamped to [0, 100].
 *
 *   Special modifiers:
 *     - Complementary patterns reduce group penalty by 50%
 *     - Shared extreme patterns (blind spots) add 0.15 bonus penalty
 *
 *   ┌─────────────────────────┐
 *   │ 96 scores (48 per partner) │
 *   │         │                    │
 *   │         ▼                    │
 *   │  Group by success factor     │
 *   │         │                    │
 *   │         ▼                    │
 *   │  Compute deltas per dim      │
 *   │         │                    │
 *   │         ▼                    │
 *   │  Apply modifiers             │
 *   │         │                    │
 *   │         ▼                    │
 *   │  Weighted sum → score        │
 *   └─────────────────────────┘
 */

import { ELEMENTS } from "./elements";

// ── Success Factor Definitions ──────────────────────────────────────────────

export interface SuccessFactor {
  name: string;
  weight: number;
  /** Element indices (0-based) */
  dimensions: number[];
}

export const SUCCESS_FACTORS: SuccessFactor[] = [
  { name: "Conflict Resolution", weight: 0.20, dimensions: [36, 39, 3, 8, 9] },       // Do, Ih, A, Er, St
  { name: "Equity & Fairness", weight: 0.20, dimensions: [13, 22, 19, 23] },           // F, Eq, Re, Pr
  { name: "Stress Response", weight: 0.15, dimensions: [4, 8, 9, 46] },                // N, Er, St, PWs
  { name: "Motivation Alignment", weight: 0.15, dimensions: [25, 24, 28, 26, 27] },    // Ac, Po, Sd, He, Stim
  { name: "Values Alignment", weight: 0.10, dimensions: [12, 14, 15, 16, 30, 31, 32, 33] }, // Ca, L, Au, P, B, Co, T, S
  { name: "Decision-Making", weight: 0.10, dimensions: [36, 39, 42, 37] },             // Do, Ih, Sn, Nfc
  { name: "Worldview", weight: 0.05, dimensions: [44, 45, 46, 47, 43] },               // PWa, PWe, PWs, PWg, Jw
  { name: "Dark Triad Risk", weight: 0.05, dimensions: [5, 6, 7] },                    // Ma, Na, Ps
];

// ── Complementary Pattern Definitions ───────────────────────────────────────

/**
 * Complementary patterns: dimension pairs where DIFFERENCE is a strength, not a weakness.
 * When one partner is high and the other low on these pairs, reduce the penalty.
 */
const COMPLEMENTARY_PAIRS: Array<{ dimA: number; dimB: number; factor: string }> = [
  { dimA: 37, dimB: 42, factor: "Decision-Making" },  // NfC + Sn: one thinks deeply, one quantifies
  { dimA: 0, dimB: 1, factor: "Motivation Alignment" }, // Openness + Conscientiousness: creative + disciplined
];

// ── Blind Spot Detection ────────────────────────────────────────────────────

export interface BlindSpot {
  dimensionIndex: number;
  dimensionName: string;
  scoreA: number;
  scoreB: number;
  direction: "high" | "low";
  successFactor: string;
  description: string;
}

const HIGH_WEIGHT_FACTORS = ["Conflict Resolution", "Equity & Fairness", "Stress Response"];

export function identifyBlindSpots(scoresA: number[], scoresB: number[]): BlindSpot[] {
  const blindSpots: BlindSpot[] = [];
  const highWeightDimensions = new Set<number>();

  for (const factor of SUCCESS_FACTORS) {
    if (HIGH_WEIGHT_FACTORS.includes(factor.name)) {
      for (const dim of factor.dimensions) {
        highWeightDimensions.add(dim);
      }
    }
  }

  for (const dimIndex of highWeightDimensions) {
    const a = scoresA[dimIndex];
    const b = scoresB[dimIndex];
    const el = ELEMENTS[dimIndex];

    // Both high (>75)
    if (a > 75 && b > 75) {
      const factorName = SUCCESS_FACTORS.find(f => f.dimensions.includes(dimIndex))?.name || "Unknown";
      blindSpots.push({
        dimensionIndex: dimIndex,
        dimensionName: el.name,
        scoreA: a,
        scoreB: b,
        direction: "high",
        successFactor: factorName,
        description: `Both partners score high on ${el.name} (${a} and ${b}). This shared extreme can amplify the trait's downsides with no natural counterbalance.`,
      });
    }

    // Both low (<25)
    if (a < 25 && b < 25) {
      const factorName = SUCCESS_FACTORS.find(f => f.dimensions.includes(dimIndex))?.name || "Unknown";
      blindSpots.push({
        dimensionIndex: dimIndex,
        dimensionName: el.name,
        scoreA: a,
        scoreB: b,
        direction: "low",
        successFactor: factorName,
        description: `Both partners score low on ${el.name} (${a} and ${b}). Neither of you naturally brings this quality to the partnership.`,
      });
    }
  }

  return blindSpots;
}

// ── Stress Tendencies (Gottman-inspired) ────────────────────────────────────

export interface StressTendency {
  name: string;
  description: string;
  score: number; // How strongly this tendency matches (0-100)
  counterStrategy: string;
}

/**
 * Gottman's Four Horsemen mapped to Opinion DNA dimensions.
 * Framed as tendencies (hypothesis), not predictions.
 */
export function identifyStressTendency(scores: number[]): StressTendency {
  // Criticism: High N + low A + low Ca
  const criticismScore = (scores[4] + (100 - scores[3]) + (100 - scores[12])) / 3;

  // Contempt: High Na + high Sdo + low B
  const contemptScore = (scores[6] + scores[34] + (100 - scores[30])) / 3;

  // Defensiveness: High Do + low Ih + high Er
  const defensivenessScore = (scores[36] + (100 - scores[39]) + scores[8]) / 3;

  // Stonewalling: High St + low E + high Ic
  const stonewallingScore = (scores[9] + (100 - scores[2]) + scores[38]) / 3;

  const tendencies: StressTendency[] = [
    {
      name: "Criticism",
      description: "Under stress, you may focus on what your partner did wrong rather than the specific situation. This comes from high emotional reactivity combined with lower natural warmth.",
      score: Math.round(criticismScore),
      counterStrategy: "When frustrated, write down the specific behavior that bothered you (not a character judgment) before starting a conversation. 'You missed the deadline' instead of 'You're unreliable.'",
    },
    {
      name: "Contempt",
      description: "Under stress, you may feel your perspective is obviously right, which can come across as dismissive. This comes from a strong drive for recognition and status.",
      score: Math.round(contemptScore),
      counterStrategy: "Before any disagreement, state one thing your partner is right about. Build a culture of expressed appreciation; contempt can't survive genuine, regular gratitude.",
    },
    {
      name: "Defensiveness",
      description: "Under stress, you may deflect responsibility or counter-attack rather than listening. This comes from strong convictions combined with difficulty changing your mind.",
      score: Math.round(defensivenessScore),
      counterStrategy: "Practice the 'yes, and' response: acknowledge what's true in your partner's complaint before explaining your perspective. Even partial ownership defuses the pattern.",
    },
    {
      name: "Stonewalling",
      description: "Under stress, you may withdraw and go quiet rather than engaging. This comes from a tendency to suppress emotions combined with discomfort in conflict situations.",
      score: Math.round(stonewallingScore),
      counterStrategy: "Agree on a 'pause protocol': either partner can call a 20-minute break during heated discussions. The catch: you must come back and re-engage. Walking away is OK; staying away is not.",
    },
  ];

  // Return the strongest tendency
  tendencies.sort((a, b) => b.score - a.score);
  return tendencies[0];
}

// ── Compatibility Score ─────────────────────────────────────────────────────

export interface CompatibilityResult {
  score: number;
  label: string;
  factorScores: Array<{ name: string; score: number; penalty: number }>;
  blindSpots: BlindSpot[];
  stressTendencyA: StressTendency;
  stressTendencyB: StressTendency;
}

function getLabel(score: number): string {
  if (score >= 80) return "Natural Alignment \u2014 strong shared foundation";
  if (score >= 60) return "Solid Ground \u2014 clear strengths with growth areas";
  if (score >= 40) return "Active Partnership \u2014 requires intentional management";
  if (score >= 20) return "Significant Work \u2014 deep differences that need structured attention";
  return "Challenging Terrain \u2014 success requires extraordinary commitment";
}

export function computeCompatibility(scoresA: number[], scoresB: number[]): CompatibilityResult {
  const factorScores: Array<{ name: string; score: number; penalty: number }> = [];
  let weightedPenaltySum = 0;

  for (const factor of SUCCESS_FACTORS) {
    let groupPenalty = 0;
    let dimCount = 0;

    for (const dimIndex of factor.dimensions) {
      const a = scoresA[dimIndex];
      const b = scoresB[dimIndex];
      // Skip if scores are undefined (shouldn't happen with valid data)
      if (a === undefined || b === undefined) continue;
      groupPenalty += Math.abs(a - b) / 100;
      dimCount++;
    }

    if (dimCount > 0) {
      groupPenalty /= dimCount; // Normalize by number of dimensions
    }

    // Check for complementary patterns that reduce penalty
    for (const pair of COMPLEMENTARY_PAIRS) {
      if (pair.factor === factor.name) {
        const aHigh = scoresA[pair.dimA] > 70 && scoresB[pair.dimA] < 40;
        const bHigh = scoresB[pair.dimA] > 70 && scoresA[pair.dimA] < 40;
        if (aHigh || bHigh) {
          groupPenalty *= 0.5; // 50% reduction for complementary patterns
        }
      }
    }

    // Check for shared extreme patterns (blind spot bonus penalty)
    for (const dimIndex of factor.dimensions) {
      const a = scoresA[dimIndex];
      const b = scoresB[dimIndex];
      if ((a > 75 && b > 75) || (a < 25 && b < 25)) {
        groupPenalty += 0.15;
        break; // Only one bonus per factor
      }
    }

    const factorScore = Math.max(0, Math.min(100, Math.round((1 - groupPenalty) * 100)));
    factorScores.push({ name: factor.name, score: factorScore, penalty: groupPenalty });
    weightedPenaltySum += groupPenalty * factor.weight;
  }

  const score = Math.max(0, Math.min(100, Math.round(100 - weightedPenaltySum * 100)));
  const blindSpots = identifyBlindSpots(scoresA, scoresB);
  const stressTendencyA = identifyStressTendency(scoresA);
  const stressTendencyB = identifyStressTendency(scoresB);

  return {
    score,
    label: getLabel(score),
    factorScores,
    blindSpots,
    stressTendencyA,
    stressTendencyB,
  };
}
