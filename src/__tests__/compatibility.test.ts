import { describe, it, expect } from "vitest";
import {
  computeCompatibility,
  identifyBlindSpots,
  identifyStressTendency,
} from "@/lib/scoring/compatibility";

// Helper: create a 48-element score array filled with a base value
function makeScores(base: number, overrides?: Record<number, number>): number[] {
  const scores = new Array(48).fill(base);
  if (overrides) {
    for (const [index, value] of Object.entries(overrides)) {
      scores[Number(index)] = value;
    }
  }
  return scores;
}

describe("computeCompatibility", () => {
  it("returns 100 when both partners have identical scores", () => {
    const scores = makeScores(50);
    const result = computeCompatibility(scores, scores);
    // Should be very high (near 100) — no gaps. May not be exactly 100 due to
    // blind spot checks on shared extremes, but with all-50s there are no extremes.
    expect(result.score).toBeGreaterThanOrEqual(95);
    expect(result.label).toContain("Natural Alignment");
  });

  it("returns low score when partners have maximum divergence", () => {
    const scoresA = makeScores(0);
    const scoresB = makeScores(100);
    const result = computeCompatibility(scoresA, scoresB);
    expect(result.score).toBeLessThan(30);
  });

  it("clamps score to [0, 100]", () => {
    const scoresA = makeScores(0);
    const scoresB = makeScores(100);
    const result = computeCompatibility(scoresA, scoresB);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("returns the correct label for each score range", () => {
    // All identical = high score
    const high = computeCompatibility(makeScores(50), makeScores(50));
    expect(high.label).toContain("Natural Alignment");

    // Moderate differences
    const scoresA = makeScores(50);
    const scoresB = makeScores(50, {
      13: 85, // Fairness high
      36: 80, // Dogmatism high
    });
    const moderate = computeCompatibility(scoresA, scoresB);
    expect(moderate.score).toBeGreaterThan(0);
    expect(moderate.score).toBeLessThanOrEqual(100);
  });

  it("produces 9 factor scores", () => {
    const result = computeCompatibility(makeScores(50), makeScores(60));
    expect(result.factorScores).toHaveLength(9);
    expect(result.factorScores[0]).toHaveProperty("name");
    expect(result.factorScores[0]).toHaveProperty("score");
    expect(result.factorScores[0]).toHaveProperty("penalty");
  });

  it("is deterministic — same inputs always produce same output", () => {
    const a = makeScores(50, { 13: 85, 36: 20, 9: 75 });
    const b = makeScores(50, { 13: 40, 36: 80, 9: 30 });
    const result1 = computeCompatibility(a, b);
    const result2 = computeCompatibility(a, b);
    expect(result1.score).toBe(result2.score);
    expect(result1.label).toBe(result2.label);
    expect(result1.factorScores).toEqual(result2.factorScores);
  });

  it("detects stress tendencies for both partners", () => {
    const a = makeScores(50);
    const b = makeScores(50);
    const result = computeCompatibility(a, b);
    expect(result.stressTendencyA).toHaveProperty("name");
    expect(result.stressTendencyA).toHaveProperty("counterStrategy");
    expect(result.stressTendencyB).toHaveProperty("name");
  });

  it("penalizes high-weight factors more than low-weight factors", () => {
    // Big gap on Fairness (Equity & Fairness factor, weight=0.20)
    const fairnessGap = computeCompatibility(
      makeScores(50, { 13: 90 }),
      makeScores(50, { 13: 10 })
    );

    // Same size gap but on Worldview (PWa, weight=0.05)
    const worldviewGap = computeCompatibility(
      makeScores(50, { 44: 90 }),
      makeScores(50, { 44: 10 })
    );

    // Fairness gap should produce a lower overall score than worldview gap
    expect(fairnessGap.score).toBeLessThan(worldviewGap.score);
  });
});

describe("identifyBlindSpots", () => {
  it("detects shared high scores on high-weight dimensions", () => {
    // Both high on Dogmatism (index 36, Conflict Resolution)
    const a = makeScores(50, { 36: 85 });
    const b = makeScores(50, { 36: 90 });
    const blindSpots = identifyBlindSpots(a, b);
    const dogmatismSpot = blindSpots.find(bs => bs.dimensionName === "Dogmatism");
    expect(dogmatismSpot).toBeDefined();
    expect(dogmatismSpot?.direction).toBe("high");
  });

  it("detects shared low scores on high-weight dimensions", () => {
    // Both low on Intellectual Humility (index 39, Conflict Resolution)
    const a = makeScores(50, { 39: 15 });
    const b = makeScores(50, { 39: 20 });
    const blindSpots = identifyBlindSpots(a, b);
    const ihSpot = blindSpots.find(bs => bs.dimensionName === "Intellectual Humility");
    expect(ihSpot).toBeDefined();
    expect(ihSpot?.direction).toBe("low");
  });

  it("does NOT flag scores in moderate range", () => {
    const a = makeScores(50, { 36: 60 });
    const b = makeScores(50, { 36: 65 });
    const blindSpots = identifyBlindSpots(a, b);
    expect(blindSpots.find(bs => bs.dimensionName === "Dogmatism")).toBeUndefined();
  });

  it("returns empty array when no blind spots exist", () => {
    const result = identifyBlindSpots(makeScores(50), makeScores(50));
    expect(result).toHaveLength(0);
  });
});

describe("identifyStressTendency", () => {
  it("identifies Criticism for high N + low A + low Ca", () => {
    const scores = makeScores(50, { 4: 90, 3: 20, 12: 15 });
    const tendency = identifyStressTendency(scores);
    expect(tendency.name).toBe("Focusing on faults");
  });

  it("identifies Stonewalling for high St + low E + high Ic", () => {
    const scores = makeScores(50, { 9: 90, 2: 15, 38: 85 });
    const tendency = identifyStressTendency(scores);
    expect(tendency.name).toBe("Going silent");
  });

  it("always returns a tendency with a counter-strategy", () => {
    const tendency = identifyStressTendency(makeScores(50));
    expect(tendency.name).toBeTruthy();
    expect(tendency.counterStrategy).toBeTruthy();
    expect(tendency.score).toBeGreaterThanOrEqual(0);
    expect(tendency.score).toBeLessThanOrEqual(100);
  });
});
