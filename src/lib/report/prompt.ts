import { ELEMENTS } from "@/lib/scoring/elements";
import { getScoreLevel } from "@/lib/scoring/engine";

/**
 * Build the Part 1 score tables in markdown (code-generated, not AI-generated)
 */
export function buildPart1Tables(scores: number[], averages: (number | null)[] | null): string {
  function row(i: number) {
    const el = ELEMENTS[i];
    const score = scores[i];
    const avg = averages && averages[i] != null ? averages[i] : "—";
    const level = getScoreLevel(score);
    return `| ${el.name} (${el.code}) | ${score} | ${avg} | ${level} |`;
  }

  const header = "| Element | Your Score | Average | Level |\n|---|---|---|---|";

  return `## Part 1: Your Opinion DNA at a Glance

### Personality

Your personality is the biological bedrock. These traits are deeply embedded, remarkably stable over a lifetime, and form the foundation of everything else.

**The Big 5**

${header}
${[0, 1, 2, 3, 4].map(row).join("\n")}

**The Dark Triad**

${header}
${[5, 6, 7].map(row).join("\n")}

**Emotional Regulation, Mortality & Life Satisfaction**

${header}
${[8, 9, 10, 11].map(row).join("\n")}

### Values

Your values are your motivational forces: beliefs animated by emotion, ideas you care passionately about. They're stable over your lifetime but more culturally shaped than personality.

**Moral Foundations**

${header}
${[12, 13, 14, 15, 16].map(row).join("\n")}

**Cooperative Virtues**

${header}
${[17, 18, 19, 20, 21, 22, 23].map(row).join("\n")}

**Personal Values**

${header}
${[24, 25, 26, 27, 28, 29, 30, 31, 32, 33].map(row).join("\n")}

**Social Orientation**

${header}
${[34, 35].map(row).join("\n")}

### Meta-Thinking

How your mind naturally works: where it rests, what it tends toward, the distinctive features of your mental processing.

${header}
${[36, 37, 38, 39, 40, 41, 42, 43].map(row).join("\n")}

**Primal World Beliefs**

${header}
${[44, 45, 46, 47].map(row).join("\n")}`;
}

/**
 * Build the score summary for AI context (compact format for the system prompt)
 */
function buildScoreSummary(scores: number[], averages: (number | null)[] | null): string {
  return ELEMENTS.map((el, i) => {
    const score = scores[i];
    const avg = averages && averages[i] != null ? averages[i] : "—";
    const level = getScoreLevel(score);
    return `${el.name} (${el.code}): ${score} (avg: ${avg}) [${level}] — ${el.dimension}/${el.category}`;
  }).join("\n");
}

/**
 * Build the full system prompt with the report generation guide
 */
export function buildSystemPrompt(): string {
  return `You are generating a personalised Opinion DNA report. This is a premium product worth $47. The report must make the reader feel genuinely seen.

## What This Report Is

A personalised psychographic profile across 48 elements in three dimensions: Personality, Values, and Meta-Thinking. The report's job is to show what the person's specific *combination* of scores reveals. The value is in the cross-referencing.

## Before You Write

1. Read all 48 scores. Don't start until you see the whole picture.
2. Find the signature: 4-6 scores that define the profile (extreme scores, divergence from average, unusual combinations).
3. Map the tensions: places where scores pull in different directions.
4. Note what's average: medium scores reveal flexibility, not boringness.

## Voice

Warm, intelligent, direct. Second person ("you"). Like a very smart friend who has read your entire psychological profile.

Rules:
- Contractions always (don't, can't, won't, you're)
- No em dashes — use commas, colons, semicolons, parentheses
- British spelling (organisation, behaviour, recognise, colour)
- No emojis
- Bold sparingly (Super Powers titles, Watch Outs titles, Tips titles, occasional key phrases)
- Parenthetical score references woven into prose: "Your Openness (90, well above the average of 78) means..."
- Humor through specificity, not jokes

## Banned Patterns (fatal errors)

NEVER use "Not X. It's Y." or any variation ("This isn't X. This is Y.", "Forget X. This is Y.", "Less X, more Y.")

Dead AI language (never use): "In today's...", "It's important to note...", "Delve", "Dive into", "Unpack", "Harness", "Leverage", "Utilize", "Landscape", "Realm", "Robust", "Game-changer", "Cutting-edge", "Straightforward", "Furthermore", "Additionally", "Moreover", "Moving forward", "At the end of the day", "Supercharge", "Unlock", "Future-proof"

Engagement bait (never use): "Let that sink in", "Read that again", "Here's the part nobody's talking about"

## Report Structure

You will receive the pre-built Part 1 (score tables). You must generate:

### Part 2: Life & Happiness Insight
Structure: Your Emotional Baseline (2-3 paras + "For example"), What Drives You (2-3 paras + "For example"), How You See the World (2-3 paras + "For example"), Your Blindspots (1-2 paras), One Key Insight (2-3 sentences), Super Powers (3 named, bold title + explanation), Watch Outs (2-3 named), Tips (2-3 practical).

### Part 3: Relationships Insight
Structure: How You Connect (2-3 paras + "For example"), How You Handle Conflict (2 paras + "For example"), What You Expect from Others (2 paras + "For example"), One Key Insight, Super Powers (3), Watch Outs (2-3), Tips (2-3).

### Part 4: Career Insight
Structure: Your Work Style (2-3 paras + "For example"), Where You Thrive (2 paras + "For example"), Careers & Fields That Fit Your Profile (4-6 areas with score-based reasoning + "What probably won't work"), Leadership & Team Dynamics (2 paras + "For example"), One Key Insight, Super Powers (3), Watch Outs (2-3), Tips (3-4).

### Part 5: Your Cognitive Signature
Structure: How Your Mind Works (2-3 paras + "For example"), Your Biases & Tendencies (2 paras + "For example"), How You Process Disagreement (1-2 paras), One Key Insight, Super Powers (3), Watch Outs (2-3), Tips (2-3).

### Part 6: Your 48 Elements Explained
For each element: **Element Name (Code) — Your score: XX (Average: XX) — LEVEL**
1-2 sentences on what it measures (original language). 1-3 sentences interpreting this person's score with cross-references. 3-5 sentences max per element. Group under Personality, Values, Meta-Thinking.

## Quality Rules

- Minimum 5 specific score references per insight section, woven into prose
- Every paragraph must contain at least one concrete observation tied to actual scores
- "For example" hypotheticals must only work for someone with THIS combination of scores
- Super Powers come from score *combinations*, not single scores
- Watch Outs must name real tensions directly. "This might sometimes cause minor friction" is too soft
- Tips must be actionable and specific, not generic self-help
- Career recommendations must explain WHY based on specific scores
- Each insight section: 800-1200 words. Part 6: 3000-4000 words. Total: 7000-10000 words

## Score Interpretation

| Range | Level |
|-------|-------|
| 0-20 | VERY LOW |
| 21-40 | LOW |
| 41-60 | MEDIUM |
| 61-80 | HIGH |
| 81-100 | VERY HIGH |

Compared to average: 10+ above = notably higher. 20+ above = defining trait. Within 5 = roughly average.`;
}

/**
 * Build the static cover page and "How to Read" section (prepended in code, not AI-generated)
 */
export function buildCoverSection(userName: string): string {
  return `# Your Opinion DNA Report

**${userName}**

*A personal report across 48 dimensions of how you think, what you value, and how your mind works.*

Prepared by Opinion DNA
opiniondna.com

---

## How to Read This Report

This report is built from your responses across 48 elements of the Opinion DNA assessment, grouped into three dimensions: Personality, Values, and Meta-Thinking.

Your scores are compared against the Parlia population average (shown in parentheses after your score). A score of 50 is the midpoint of the scale, and the average reflects the mean across all Opinion DNA respondents. Where you fall relative to both tells you something meaningful about how your mind operates compared to others.

The report is organised into six parts. First, a snapshot of your full profile. Then three deep sections that synthesise your scores into actionable insight: Life & Happiness, Relationships, and Career. A fifth section covers your Cognitive Signature. The final section is a reference guide to all 48 elements, explaining what each one measures and what your specific score means.

Throughout each section, you'll find **Super Powers** (where your profile gives you a genuine edge), **Watch Outs** (where tensions in your profile might create friction), and **Tips** (practical suggestions based on your specific combination of scores).

There are no good or bad scores. Every position on every scale evolved for a reason, and every combination has its strengths and its blindspots. The point is awareness, not judgment.`;
}

/**
 * Build the user prompt — AI only generates Parts 2-6 (cover, Part 1, What Now are prepended/appended in code)
 */
export function buildUserPrompt(
  userName: string,
  scores: number[],
  averages: (number | null)[] | null,
  sampleSize: number
): string {
  const scoreSummary = buildScoreSummary(scores, averages);

  return `Generate Parts 2 through 6 of the Opinion DNA report for ${userName}.

Population sample size: ${sampleSize}

## All 48 Scores (for your reference):

${scoreSummary}

---

Generate Parts 2 through 6 only. Start directly with "## Part 2: Life & Happiness Insight". Follow the template structure exactly. Include "---" dividers between parts. Do NOT include Part 1, a cover page, "How to Read", or a "What Now?" section; those are handled separately.`;
}
