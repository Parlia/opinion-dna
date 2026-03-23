/**
 * Comparison Report Prompt Engineering
 *
 * Two-call architecture:
 *   Call 1 (JSON): Structured analysis — success factors, blind spots,
 *                  stress tendencies, dark triad patterns, score rationale
 *   Call 2 (Markdown): Prescriptive content — conversation cards,
 *                      mitigation playbook, informed by Call 1
 */

import { ELEMENTS } from "@/lib/scoring/elements";
import { getScoreLevel } from "@/lib/scoring/engine";
import type { CompatibilityResult } from "@/lib/scoring/compatibility";

function buildScorePair(scoresA: number[], scoresB: number[], nameA: string, nameB: string): string {
  return ELEMENTS.map((el, i) => {
    const a = scoresA[i];
    const b = scoresB[i];
    const delta = Math.abs(a - b);
    const levelA = getScoreLevel(a);
    const levelB = getScoreLevel(b);
    return `${el.name} (${el.code}): ${nameA}=${a} [${levelA}] / ${nameB}=${b} [${levelB}] / gap=${delta} — ${el.dimension}/${el.category}`;
  }).join("\n");
}

// ── Call 1: Structured Analysis (JSON output) ───────────────────────────────

export function buildCall1SystemPrompt(): string {
  return `You are generating a structured analysis for a Co-Founder Compatibility Report. This is a premium product worth $499. Your output must be valid JSON.

## Context

Two co-founders have each taken the Opinion DNA assessment (48 dimensions across Personality, Values, and Meta-Thinking). You will receive both sets of scores, population averages, a pre-computed compatibility score, and detected blind spots.

Your job: analyze the scores through the lens of 10 Co-Founder Success Factors derived from startup research (YC, Paul Graham, Garry Tan, Gottman).

## Voice

Warm, intelligent, direct. Like a very experienced startup advisor who has seen hundreds of co-founder relationships. No jargon. No hedging. Specific and actionable.

Rules:
- Contractions always (don't, can't, won't, you're)
- American spelling
- No emojis
- Reference specific scores inline: "Partner A's Fairness (85) vs Partner B's (40) creates a 45-point gap"
- Be honest but never doom-saying. Every friction point includes WHY it matters and HOW to manage it
- Dark Triad dimensions: lead with the strength, then the risk. Never pathologize.
- Stress tendencies: frame as "you may be prone to..." not "you will..."

## Banned Patterns

NEVER use: "It's important to note", "Delve", "Leverage", "Utilize", "Landscape", "Robust", "Game-changer", "Furthermore", "Moreover", "Not X. It's Y."

## Output Format

Return ONLY valid JSON matching this structure (no commentary, no code fences):

{
  "successFactors": [
    {
      "name": "Factor Name",
      "score": 75,
      "alignment": "strong" | "moderate" | "tension" | "significant_gap",
      "topStrengths": ["strength 1", "strength 2"],
      "topRisks": ["risk 1"],
      "narrative": "2-3 sentences explaining what this factor means for their partnership",
      "inlineMitigation": "1-2 sentences of immediate, specific advice for this factor"
    }
  ],
  "blindSpots": [
    {
      "dimension": "Dimension Name",
      "pattern": "What the shared extreme means in plain language",
      "implication": "What this means for their startup specifically",
      "protocol": "One specific thing they should do about it"
    }
  ],
  "darkTriadInsights": [
    {
      "dimension": "Machiavellianism" | "Narcissism" | "Psychopathy",
      "partner": "A" | "B" | "both",
      "strength": "The positive framing of this trait",
      "risk": "The risk under stress",
      "mitigation": "One specific protocol"
    }
  ],
  "overallNarrative": "3-4 sentences summarizing the partnership's signature pattern — what makes it unique, where it's strongest, what needs the most attention",
  "scoreRationale": "2-3 sentences explaining why the compatibility score landed where it did"
}

## Score Interpretation

| Range | Level |
|-------|-------|
| 0-20 | VERY LOW |
| 21-40 | LOW |
| 41-60 | MEDIUM |
| 61-80 | HIGH |
| 81-100 | VERY HIGH |

Gap interpretation: <15 = aligned, 15-30 = moderate difference, >30 = significant gap.`;
}

export function buildCall1UserPrompt(
  nameA: string,
  nameB: string,
  scoresA: number[],
  scoresB: number[],
  averages: (number | null)[],
  compatibility: CompatibilityResult
): string {
  const scorePairs = buildScorePair(scoresA, scoresB, nameA, nameB);

  const factorSummary = compatibility.factorScores
    .map(f => `${f.name}: ${f.score}/100 (penalty: ${f.penalty.toFixed(2)})`)
    .join("\n");

  const blindSpotSummary = compatibility.blindSpots.length > 0
    ? compatibility.blindSpots.map(b =>
        `${b.dimensionName}: both ${b.direction} (${b.scoreA}, ${b.scoreB}) — ${b.successFactor}`
      ).join("\n")
    : "No shared blind spots detected.";

  return `Analyze the co-founder compatibility between ${nameA} (Partner A) and ${nameB} (Partner B).

## Compatibility Score: ${compatibility.score}/100 — "${compatibility.label}"

## Success Factor Scores (pre-computed):
${factorSummary}

## Detected Blind Spots:
${blindSpotSummary}

## Stress Tendency — ${nameA}: ${compatibility.stressTendencyA.name} (score: ${compatibility.stressTendencyA.score})
## Stress Tendency — ${nameB}: ${compatibility.stressTendencyB.name} (score: ${compatibility.stressTendencyB.score})

## All 48 Scores:
${scorePairs}

## Population Sample Size: 1500

Generate the structured JSON analysis. Include all 8 success factors in the successFactors array. Only include blindSpots if there are genuine shared extremes. Only include darkTriadInsights if either partner scores >65 on a Dark Triad dimension. Return ONLY the JSON object.`;
}

// ── Call 2: Prescriptive Content (Markdown output) ──────────────────────────

export function buildCall2SystemPrompt(): string {
  return `You are generating the prescriptive content for a Co-Founder Compatibility Report. This follows a structured analysis (provided). Your job is to create actionable conversation cards and a mitigation playbook.

## Voice

Same as the analysis: warm, intelligent, direct. Like an experienced startup advisor.

Rules:
- Contractions always
- American spelling
- No emojis
- Each conversation card must feel specific to THIS pair's scores, not generic advice
- Mitigations must be concrete rituals, protocols, or practices (not "communicate better")

## Banned Patterns

NEVER use: "It's important to note", "Delve", "Leverage", "Utilize", "Landscape", "Robust", "Game-changer", "Furthermore", "Moreover", "Not X. It's Y."

## Output Format

Generate Markdown with these sections:

### Conversation Cards

Generate 5-7 conversation cards. Each card follows this format:

---

**CARD [N]: [Title]**
*Based on your [Dimension Name] gap of [X] points*

**The scenario:** [A specific, realistic startup situation where this gap creates friction. Be vivid and concrete.]

**Discuss together:**
- [Specific question 1]
- [Specific question 2]
- [Specific question 3]

---

### Mitigation Playbook

For each risk area that scored below 60 in the success factors, generate 1-2 mitigations:

**[Mitigation Title]**
*Addresses: [Factor Name]*

**The risk:** [One sentence on what the dimension gap creates]

**The ritual:** [Specific, repeatable action. Not "talk about it" but "every Monday at 9am, spend 15 minutes reviewing decisions from the previous week using this framework: ..."]

**Frequency:** [One-time setup / Weekly / Monthly / Per-decision]`;
}

export function buildCall2UserPrompt(
  nameA: string,
  nameB: string,
  scoresA: number[],
  scoresB: number[],
  call1Analysis: string
): string {
  const scorePairs = buildScorePair(scoresA, scoresB, nameA, nameB);

  return `Generate conversation cards and mitigation playbook for ${nameA} and ${nameB}.

## Analysis from Call 1:
${call1Analysis}

## All 48 Scores (for reference):
${scorePairs}

Generate the Markdown content. Start directly with "### Conversation Cards". Make every card specific to this pair's actual scores and gaps.`;
}
