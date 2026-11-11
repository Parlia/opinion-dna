import { describe, expect, it } from "vitest";
import { buildTeaser, isQuizComplete } from "./finalize";
import { PARLIA_AVERAGES } from "./elements";
import { QUESTIONS } from "./questions";

// Everyone exactly average, except where a test says otherwise.
function averageScores(): number[] {
  return PARLIA_AVERAGES.map((avg) => avg ?? 50);
}

describe("buildTeaser", () => {
  it("always unlocks the Big 5", () => {
    const teaser = buildTeaser(averageScores());
    for (const index of [0, 1, 2, 3, 4]) {
      expect(teaser.unlocked[index]).toBeDefined();
    }
  });

  it("picks the three scores furthest from average, most extreme first", () => {
    const scores = averageScores();
    const pick = PARLIA_AVERAGES.map((avg, i) => (avg === null ? -1 : i)).filter(
      (i) => i >= 10,
    );
    const [a, b, c] = pick;
    scores[a] = Math.min(100, (PARLIA_AVERAGES[a] as number) + 20);
    scores[b] = Math.max(0, (PARLIA_AVERAGES[b] as number) - 30);
    scores[c] = Math.min(100, (PARLIA_AVERAGES[c] as number) + 10);

    const teaser = buildTeaser(scores);
    expect(teaser.distinctive).toEqual([b, a, c]);
    expect(teaser.unlocked[b]).toBe(scores[b]);
  });

  it("never reveals more than 8 of the 48 scores", () => {
    const scores = averageScores().map((s, i) => (i % 2 ? Math.min(100, s + i) : s));
    const teaser = buildTeaser(scores);
    const shown = Object.keys(teaser.unlocked).length;
    expect(shown).toBeLessThanOrEqual(8);
    expect(teaser.lockedCount).toBe(48 - shown);
  });
});

describe("isQuizComplete", () => {
  it("needs every question answered", () => {
    const answers = new Map<number, number>();
    for (let i = 0; i < QUESTIONS.length - 1; i++) answers.set(i, 3);
    expect(isQuizComplete(answers)).toBe(false);
    answers.set(QUESTIONS.length - 1, 3);
    expect(isQuizComplete(answers)).toBe(true);
  });
});
