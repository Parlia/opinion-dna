/**
 * Opinion DNA Scoring Engine
 * Ported from Go: parlia/go/assessment/assessment.go
 *
 * Calculates 48 element scores (0-100) from 179 question responses.
 */

export interface Question {
  index: number;
  uid: string;
  resultGroup: number; // 1-48 (1-indexed)
  direction: 1 | -1;
}

const SCALE = [0, 1, 2, 3, 4]; // Maps rating 1-5 to scale values (1=Strongly Disagree → 0, 5=Strongly Agree → 4)
const MAX_SCALE = 4;
export const NUM_RESULT_GROUPS = 48;

function scaleFromRating(rating: number): number {
  if (rating < 1 || rating > 5) {
    throw new Error(`rating ${rating} out of range`);
  }
  return SCALE[rating - 1];
}

function invertRating(rating: number): number {
  if (rating < 1 || rating > 5) {
    throw new Error(`invertRating: rating out of range: ${rating}`);
  }
  return 6 - rating;
}

/**
 * Calculate Opinion DNA scores from quiz responses.
 *
 * @param answers - Map of question index to answer (1-5 Likert scale)
 * @param questions - Array of 179 question definitions
 * @returns Array of 48 integers (0-100), one per element
 */
export function calculateScores(
  answers: Map<number, number>,
  questions: Question[]
): number[] {
  if (answers.size !== questions.length) {
    throw new Error(
      `Expected ${questions.length} answers, got ${answers.size}`
    );
  }

  const result = new Array(NUM_RESULT_GROUPS).fill(0);
  const qCount = new Array(NUM_RESULT_GROUPS).fill(0);

  for (const q of questions) {
    let rating = answers.get(q.index);
    if (rating === undefined || rating === 0) {
      throw new Error(`Missing answer for question ${q.index}`);
    }

    if (q.direction === -1) {
      rating = invertRating(rating);
    }

    const scale = scaleFromRating(rating);
    const resultIndex = q.resultGroup - 1;
    result[resultIndex] += scale;
    qCount[resultIndex]++;
  }

  for (let i = 0; i < result.length; i++) {
    if (qCount[i] === 0) {
      result[i] = 0;
    } else {
      result[i] = Math.floor((result[i] * 100) / MAX_SCALE / qCount[i]);
    }
  }

  return result;
}

/**
 * Get the classification level for a score.
 */
export type ScoreLevel =
  | "VERY LOW"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "VERY HIGH";

export function getScoreLevel(score: number): ScoreLevel {
  if (score <= 20) return "VERY LOW";
  if (score <= 40) return "LOW";
  if (score <= 60) return "MEDIUM";
  if (score <= 80) return "HIGH";
  return "VERY HIGH";
}
