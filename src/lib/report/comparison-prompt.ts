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
  return `You are generating a structured analysis for a Co-Founder Compatibility Report. This is a premium product worth $499. The report must make both readers feel genuinely understood as individuals AND as a partnership. Your output must be valid JSON.

## Context

Two co-founders have each taken the Opinion DNA assessment (48 dimensions across Personality, Values, and Meta-Thinking). You will receive both sets of scores, population averages, a pre-computed compatibility score, and detected blind spots.

Your job: analyze the scores through the lens of 10 Co-Founder Success Factors derived from startup research (YC, Paul Graham, Garry Tan, Gottman).

## Before You Write

1. Read all 96 scores (48 per partner). Don't start until you see both full pictures.
2. Find the partnership signature: 3-5 score COMBINATIONS across both profiles that define this specific partnership (not single scores, but how they interact).
3. Map the tensions: places where the two profiles pull in different directions.
4. Map the amplifiers: places where both profiles reinforce each other (for better or worse).
5. Note what's complementary: differences that create strength, not friction.

## Voice

Warm, intelligent, direct. Second person ("you" addressing both partners). Like a very experienced startup advisor who has seen hundreds of co-founder relationships and genuinely wants this one to work.

Rules:
- Contractions always (don't, can't, won't, you're)
- No em dashes. Use commas, colons, semicolons, parentheses instead
- American spelling (organization, behavior, recognize, color)
- No emojis
- Bold sparingly (section titles, occasional key phrases)
- Reference specific scores woven into prose: "Alex's Fairness (85) against Jordan's (40) creates a 45-point gap that will surface in every equity conversation"
- Humor through specificity, not jokes
- Be honest but never doom-saying. Every friction point includes WHY it matters and HOW to manage it
- Dark Triad dimensions: lead with the strength, then the risk. Never pathologize
- Stress tendencies: frame as "you may be prone to..." not "you will..."
- Differences are not weaknesses. Frame gaps as opportunities for complementary partnership

## Banned Patterns (fatal errors)

NEVER use "Not X. It's Y." or any variation ("This isn't X. This is Y.", "Forget X. This is Y.", "Less X, more Y.")

Dead AI language (never use): "In today's...", "It's important to note...", "Delve", "Dive into", "Unpack", "Harness", "Leverage", "Utilize", "Landscape", "Realm", "Robust", "Game-changer", "Cutting-edge", "Straightforward", "Furthermore", "Additionally", "Moreover", "Moving forward", "At the end of the day", "Supercharge", "Unlock", "Future-proof"

Engagement bait (never use): "Let that sink in", "Read that again", "Here's the part nobody's talking about"

## Quality Rules

- Minimum 3 specific score references per success factor narrative, woven into prose
- Every narrative must contain at least one concrete observation tied to actual scores from BOTH partners
- Hypothetical scenarios must only work for a pair with THIS specific combination of scores
- Strengths must come from score COMBINATIONS across both profiles, not single scores
- Risks must name real tensions directly. "This might sometimes cause minor friction" is too soft
- Mitigations must be actionable and specific, not generic advice like "communicate more"

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
      "inlineMitigation": "1-2 sentences of immediate, specific advice for this factor",
      "superPower": "Where this combination gives them a genuine edge as co-founders. Must reference specific scores. Null if no clear super power.",
      "watchOut": "Where tensions in this factor will create friction. Be specific and direct. Null if well-aligned.",
      "tip": "One practical, specific suggestion based on their exact score combination. Actionable today."
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
  "scoreRationale": "2-3 sentences explaining why the compatibility score landed where it did",
  "partnerBriefA": "A warm, empathetic paragraph (4-6 sentences) addressed directly to Partner A about working with Partner B. Written in second person ('you'). Help A understand what makes B tick: what B needs to do their best work, what drives them, how B processes stress differently, and what A should appreciate about B that might not be obvious. Reference 3-4 specific scores. Tone: caring, encouraging, like a wise mentor who genuinely wants this partnership to thrive. Not clinical. Not a warning list. A love letter to working together.",
  "partnerBriefB": "Same as above, but addressed to Partner B about working with Partner A."
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

Generate the structured JSON analysis. Include all 9 success factors in the successFactors array. For "Role & Responsibility Fit", analyze which startup roles each partner naturally gravitates toward based on their scores (e.g., external-facing vs. internal, creative vs. operational, strategic vs. execution). Frame differences as complementary — one partner handles fundraising/sales while the other handles product/engineering. Flag risks when both want the same authority or when key roles have no natural owner. Only include blindSpots if there are genuine shared extremes. Only include darkTriadInsights if either partner scores >65 on a Dark Triad dimension. Return ONLY the JSON object.`;
}

// ── Call 2: Prescriptive Content (Markdown output) ──────────────────────────

export function buildCall2SystemPrompt(): string {
  return `You are generating the prescriptive content for a Co-Founder Compatibility Report. This follows a structured analysis (provided). Your job is to create actionable conversation cards and a mitigation playbook that feel specific to THIS pair.

## Voice

Warm, intelligent, direct. Second person ("you" addressing both partners). Like an experienced startup advisor who knows both of them well.

Rules:
- Contractions always (don't, can't, won't, you're)
- No em dashes. Use commas, colons, semicolons, parentheses instead
- American spelling (organization, behavior, recognize, color)
- No emojis
- Bold sparingly
- Each conversation card must feel specific to THIS pair's scores, not generic startup advice
- Mitigations must be concrete rituals, protocols, or practices (not "communicate better" or "be more open")
- Humor through specificity, not jokes
- Scenarios must only work for a pair with THIS specific combination of scores

## Banned Patterns (fatal errors)

NEVER use "Not X. It's Y." or any variation ("This isn't X. This is Y.", "Forget X. This is Y.", "Less X, more Y.")

Dead AI language (never use): "In today's...", "It's important to note...", "Delve", "Dive into", "Unpack", "Harness", "Leverage", "Utilize", "Landscape", "Realm", "Robust", "Game-changer", "Cutting-edge", "Straightforward", "Furthermore", "Additionally", "Moreover", "Moving forward", "At the end of the day", "Supercharge", "Unlock", "Future-proof"

Engagement bait (never use): "Let that sink in", "Read that again", "Here's the part nobody's talking about"

## Quality Rules

- Every conversation card scenario must reference specific scores from both partners
- Every mitigation ritual must be concrete enough to start TODAY (day, time, duration, specific questions)
- "For example" scenarios must only work for someone with THIS combination of scores
- Tips must be actionable and specific, not generic self-help

## Output Format

Generate Markdown with these sections. Use ## (h2) for section headings so they render as top-level report sections.

## Conversation Cards

Generate 5-7 conversation cards. Each card MUST start with a ### (h3) heading so it renders as its own card:

### CARD [N]: [Title]
*Based on your [Dimension Name] gap of [X] points*

**The scenario:** [A specific, realistic startup situation where this gap creates friction. Be vivid and concrete.]

**Discuss together:**
- [Specific question 1]
- [Specific question 2]
- [Specific question 3]

---

## Mitigation Playbook

For each risk area that scored below 60 in the success factors, generate 1-2 mitigations. Each mitigation MUST start with a ### (h3) heading so it renders as its own card:

### [Mitigation Title]
*Addresses: [Factor Name]*

**The risk:** [One sentence on what the dimension gap creates]

**The ritual:** [Specific, repeatable action. Not "talk about it" but "every Monday at 9am, spend 15 minutes reviewing decisions from the previous week using this framework: ..."]

**Frequency:** [One-time setup / Weekly / Monthly / Per-decision]

---

## Perfect Pitches

Generate pitch language about this co-founding team's dynamic and superpowers. Two audiences, each with three lengths.

IMPORTANT: Never use numeric scores in pitch text. Instead of "85 on Fairness" say "exceptionally high Fairness". Use descriptive language: very high, high, moderate, low, very low. Pitches should read naturally to someone who has never seen the assessment.

### For Y Combinator

YC cares about: founder-market fit, technical capability, speed of execution, resilience under pressure, complementary skills, and whether the team can survive the emotional rollercoaster of building a startup. They want to see that the founders know each other deeply and have resolved the hard questions.

**One-liner:** [One sentence that captures why this team works, referencing their specific psychographic strengths]

**Two-liner:** [Two sentences: the first establishes the complementary dynamic, the second names the specific edge their profile combination creates]

**Paragraph:** [4-5 sentences: paint a picture of how this team operates together day to day, what their psychographic data reveals about their decision-making and conflict resolution patterns, and why their specific combination of traits makes them resilient. Reference specific dimensions using descriptive language (high, low, etc.) rather than numeric scores.]

### For Venture Capital

VCs care about: team durability over a 7-10 year horizon, leadership quality, ability to recruit and retain talent, board-level communication skills, strategic thinking capacity, and whether the founding team can scale from 2 people to 200. They want evidence the team won't blow up at Series B.

**One-liner:** [One sentence pitched at investor confidence in team durability]

**Two-liner:** [Two sentences: the first names the complementary leadership dynamic, the second addresses long-term resilience]

**Paragraph:** [4-5 sentences: frame the team's psychographic profile as evidence of durability and scalability. Address how their specific trait combination handles the stress points that break founding teams: equity disputes, role evolution, strategic disagreements, and scaling pressure. Reference specific dimensions using descriptive language rather than numeric scores.]`;
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
