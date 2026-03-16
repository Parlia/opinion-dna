/**
 * Scoring engine tests — ported from Go: parlia/go/assessment/opinion_dna_test.go
 *
 * The primary test validates that the TypeScript scoring engine produces
 * identical output to the Go implementation.
 */

import { describe, it, expect } from "vitest";
import { calculateScores, getScoreLevel } from "./engine";
import { QUESTIONS } from "./questions";

describe("calculateScores", () => {
  it("should have exactly 179 questions", () => {
    expect(QUESTIONS.length).toBe(179);
  });

  it("should produce correct scores when all answers are 1 (Go test parity)", () => {
    // This is the exact test case from opinion_dna_test.go
    // All 179 questions answered with rating = 1
    const answers = new Map<number, number>();
    for (let i = 0; i < 179; i++) {
      answers.set(i, 1);
    }

    const scores = calculateScores(answers, QUESTIONS);

    // Expected output from Go test (line 197 of opinion_dna_test.go)
    const expected = [
      60, 80, 60, 60, 60, 100, 60, 80, 100, 100, 100, 100, 100, 100, 100,
      100, 100, 100, 100, 100, 100, 100, 100, 0, 100, 100, 100, 100, 100, 100,
      100, 100, 100, 100, 50, 50, 50, 50, 100, 45, 100, 100, 75, 71, 100, 100,
      100, 100,
    ];

    expect(scores).toEqual(expected);
    expect(scores.length).toBe(48);
  });

  it("should produce correct scores when all answers are 5", () => {
    const answers = new Map<number, number>();
    for (let i = 0; i < 179; i++) {
      answers.set(i, 5);
    }

    const scores = calculateScores(answers, QUESTIONS);

    // All direction=1 questions with rating 5 → scale 0 → score 0
    // All direction=-1 questions with rating 5 → inverted to 1 → scale 4 → contributes max
    // Exact values depend on mix of directions per result group
    expect(scores.length).toBe(48);
    // Verify all scores are in valid range
    for (const score of scores) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it("should produce correct scores when all answers are 3 (midpoint)", () => {
    const answers = new Map<number, number>();
    for (let i = 0; i < 179; i++) {
      answers.set(i, 3);
    }

    const scores = calculateScores(answers, QUESTIONS);

    expect(scores.length).toBe(48);
    // Rating 3 → scale[2] = 2, inverted rating 3 → 3 → scale[2] = 2
    // So all questions contribute 2, regardless of direction
    // Score = sum * 100 / (4 * count) = (2*count) * 100 / (4*count) = 50
    for (const score of scores) {
      expect(score).toBe(50);
    }
  });

  it("should throw when answer count doesn't match question count", () => {
    const answers = new Map<number, number>();
    answers.set(0, 3);

    expect(() => calculateScores(answers, QUESTIONS)).toThrow(
      "Expected 179 answers, got 1"
    );
  });

  it("should throw when an answer is missing (0)", () => {
    const answers = new Map<number, number>();
    for (let i = 0; i < 179; i++) {
      answers.set(i, i === 50 ? 0 : 3);
    }

    expect(() => calculateScores(answers, QUESTIONS)).toThrow(
      "Missing answer for question 50"
    );
  });

  it("should cover all 48 result groups", () => {
    const groups = new Set(QUESTIONS.map((q) => q.resultGroup));
    expect(groups.size).toBe(48);
    for (let i = 1; i <= 48; i++) {
      expect(groups.has(i)).toBe(true);
    }
  });
});

describe("getScoreLevel", () => {
  it("should classify scores correctly", () => {
    expect(getScoreLevel(0)).toBe("VERY LOW");
    expect(getScoreLevel(10)).toBe("VERY LOW");
    expect(getScoreLevel(20)).toBe("VERY LOW");
    expect(getScoreLevel(21)).toBe("LOW");
    expect(getScoreLevel(40)).toBe("LOW");
    expect(getScoreLevel(41)).toBe("MEDIUM");
    expect(getScoreLevel(50)).toBe("MEDIUM");
    expect(getScoreLevel(60)).toBe("MEDIUM");
    expect(getScoreLevel(61)).toBe("HIGH");
    expect(getScoreLevel(80)).toBe("HIGH");
    expect(getScoreLevel(81)).toBe("VERY HIGH");
    expect(getScoreLevel(100)).toBe("VERY HIGH");
  });
});
