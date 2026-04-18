/**
 * Seed an example Couples Comparison report for the test account.
 *
 * Usage: npx tsx scripts/seed-couples-example.ts
 *
 * Creates or updates a comparison report with type="comparison",
 * relationship_type="couples" for the jpaulneeley+test@gmail.com user,
 * using the same Alex Chen & Jordan Park fictional profiles as the
 * co-founders and friends examples.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { computeCompatibility } from "../src/lib/scoring/compatibility";
import { PARLIA_AVERAGES, ELEMENTS } from "../src/lib/scoring/elements";
import { getScoreLevel } from "../src/lib/scoring/engine";
import { streamClaude } from "../src/lib/report/claude-stream";
import { extractJSON, LLMParseError } from "../src/lib/report/parse-json";
import {
  buildCouplesCall1SystemPrompt,
  buildCouplesCall1UserPrompt,
  buildCouplesCall2SystemPrompt,
  buildCouplesCall2UserPrompt,
} from "../src/lib/report/comparison-prompt";

// Load env
const envPath = resolve(__dirname, "../.env.local");
const envFile = readFileSync(envPath, "utf-8");
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex).trim();
  const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[key]) process.env[key] = value;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const apiKey = process.env.ANTHROPIC_API_KEY!;

if (!supabaseUrl || !serviceKey || !apiKey) {
  console.error("Missing env vars in .env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey);

// Same fictional profiles as the co-founders and friends examples
const PARTNER_A_SCORES = [
  92, 55, 72, 38, 45,
  71, 48, 35,
  65, 25, 40, 70,
  45, 85, 55, 30, 25,
  60, 50, 65, 45, 35, 80, 40,
  70, 88, 75, 80, 90,
  60, 45, 20, 30, 25,
  40, 25,
  35, 82, 45, 75,
  55, 40, 70, 50,
  65, 80, 55, 60,
];

const PARTNER_B_SCORES = [
  55, 85, 60, 72, 50,
  30, 35, 25,
  50, 60, 55, 65,
  70, 40, 75, 60, 55,
  80, 70, 55, 30, 65, 45, 60,
  35, 70, 50, 40, 65,
  75, 70, 60, 55, 55,
  25, 45,
  72, 55, 65, 35,
  50, 60, 45, 55,
  70, 60, 50, 55,
];

const NAME_A = "Alex Chen";
const NAME_B = "Jordan Park";

function buildScoreTable(scoresA: number[], scoresB: number[]): string {
  function row(i: number) {
    const el = ELEMENTS[i];
    const a = scoresA[i];
    const b = scoresB[i];
    const gap = Math.abs(a - b);
    const levelA = getScoreLevel(a);
    const levelB = getScoreLevel(b);
    const gapIndicator = gap > 30 ? " ⚠" : gap > 15 ? " △" : "";
    return `| ${el.name} | ${a} (${levelA}) | ${b} (${levelB}) | ${gap}${gapIndicator} |`;
  }
  const header = `| Element | ${NAME_A} | ${NAME_B} | Gap |\n|---|---|---|---|`;
  const categories = [
    { title: "### Personality", subtitle: "The Big 5", indices: [0, 1, 2, 3, 4] },
    { title: "", subtitle: "The Dark Triad", indices: [5, 6, 7] },
    { title: "", subtitle: "Emotional Regulation", indices: [8, 9, 10, 11] },
    { title: "### Values", subtitle: "Moral Foundations", indices: [12, 13, 14, 15, 16] },
    { title: "", subtitle: "Cooperative Virtues", indices: [17, 18, 19, 20, 21, 22, 23] },
    { title: "", subtitle: "Personal Values", indices: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33] },
    { title: "", subtitle: "Social Orientation", indices: [34, 35] },
    { title: "### Meta-Thinking", subtitle: "Core", indices: [36, 37, 38, 39, 40, 41, 42, 43] },
    { title: "", subtitle: "Primal World Beliefs", indices: [44, 45, 46, 47] },
  ];
  let table = "";
  for (const cat of categories) {
    if (cat.title) table += `\n${cat.title}\n\n`;
    table += `**${cat.subtitle}**\n\n${header}\n${cat.indices.map(row).join("\n")}\n\n`;
  }
  table += `\n*⚠ = gap > 30 points (significant)  △ = gap 15-30 points (moderate)*`;
  return table;
}

async function main() {
  const { data: users } = await admin.auth.admin.listUsers({ perPage: 50 });
  const testUser = users?.users?.find((u) => u.email === "jpaulneeley+test@gmail.com");

  if (!testUser) {
    console.error("Test user jpaulneeley+test@gmail.com not found");
    process.exit(1);
  }

  console.log(`Seeding Couples report for: ${testUser.email} (${testUser.id})`);

  console.log("\nComputing compatibility signal...");
  const compatibility = computeCompatibility(PARTNER_A_SCORES, PARTNER_B_SCORES);
  console.log(`Pattern strength: ${compatibility.score} (${compatibility.label})`);

  // Call 1: JSON analytical sections (1-6)
  console.log("\n--- Call 1: Structured analysis (JSON) ---");
  const call1Start = Date.now();
  const call1Raw = await streamClaude(
    apiKey,
    buildCouplesCall1SystemPrompt(),
    buildCouplesCall1UserPrompt(NAME_A, NAME_B, PARTNER_A_SCORES, PARTNER_B_SCORES, PARLIA_AVERAGES, compatibility),
    { maxTokens: 16000, model: "claude-sonnet-4-20250514" }
  );
  const call1Duration = ((Date.now() - call1Start) / 1000).toFixed(1);
  console.log(`Call 1 done in ${call1Duration}s (${call1Raw.length} chars)`);

  let call1Json: Record<string, unknown>;
  try {
    call1Json = extractJSON(call1Raw);
    console.log("JSON parsed successfully");
  } catch (err) {
    console.error("JSON parse failed:", err instanceof LLMParseError ? err.message : err);
    console.log("Raw (first 500 chars):", call1Raw.substring(0, 500));
    process.exit(1);
  }

  // Call 2: Markdown prescriptive sections (7-11)
  console.log("\n--- Call 2: Prescriptive content (Markdown) ---");
  const call2Start = Date.now();
  const call2Content = await streamClaude(
    apiKey,
    buildCouplesCall2SystemPrompt(),
    buildCouplesCall2UserPrompt(NAME_A, NAME_B, PARTNER_A_SCORES, PARTNER_B_SCORES, JSON.stringify(call1Json, null, 2)),
    { maxTokens: 16000, model: "claude-sonnet-4-20250514" }
  );
  const call2Duration = ((Date.now() - call2Start) / 1000).toFixed(1);
  console.log(`Call 2 done in ${call2Duration}s (${call2Content.length} chars)`);

  // Assemble the couples report (same logic as route.ts assembleCouplesReport)
  console.log("\n--- Assembling report ---");

  type Item = { element?: string; dimension?: string; meaning?: string; framing?: string; dailyLife?: string; showsUpAs?: string };

  const chemistry = (call1Json.chemistrySignature || {}) as { portrait?: string; headlineTraits?: string[] };
  const overlap = (call1Json.overlap || {}) as { narrative?: string; items?: Item[] };
  const divergence = (call1Json.divergence || {}) as { narrative?: string; items?: Item[] };
  const metaThinking = (call1Json.metaThinking || {}) as { narrative?: string; biggestGaps?: Item[] };
  const values = (call1Json.values || {}) as { narrative?: string; specialFlags?: string[] };
  const emotion = (call1Json.emotion || {}) as { pattern?: string; narrative?: string; flags?: string[] };
  const partnerBriefs = (call1Json.partnerBriefs || {}) as { A?: string; B?: string };

  const scoreTable = buildScoreTable(PARTNER_A_SCORES, PARTNER_B_SCORES);

  let content = `# Couples Compatibility Report

**${NAME_A} & ${NAME_B}**

*A structured mirror for two minds. A comparative look across 48 dimensions of how you think, what you value, and how your minds work.*

*Prepared by Opinion DNA opiniondna.com*

---

## How to Read This Report

This report compares two Opinion DNA profiles across 48 dimensions grouped into three areas: Personality, Values, and Meta-Thinking.

The report names patterns suggested by your two profiles. It doesn't rank your relationship, score your compatibility, or tell you whether you should stay together. It's a structured mirror, not a verdict.

Throughout you'll find hedged language ("may", "suggests", "tends to"). That's deliberate. These are patterns, not facts about who either of you are. If something doesn't fit, trust your own read of yourself.

Research grounding: Gottman Institute's 40-year couples studies, Sue Johnson's Emotionally Focused Therapy, adult attachment theory, Deci and Ryan's Self-Determination Theory, Orbuch's 26-year longitudinal study, and related work.

---

## Your Chemistry Signature

${chemistry.portrait || ""}

`;

  if (Array.isArray(chemistry.headlineTraits) && chemistry.headlineTraits.length > 0) {
    content += `**Headline traits**\n\n`;
    for (const trait of chemistry.headlineTraits) {
      content += `- ${trait}\n`;
    }
    content += `\n`;
  }

  content += `---\n\n## Where You Overlap\n\n${overlap.narrative || ""}\n\n`;
  if (Array.isArray(overlap.items)) {
    for (const item of overlap.items) {
      if (item.element) content += `### ${item.element}\n\n${item.meaning || ""}\n\n`;
    }
  }

  content += `---\n\n## Where You Diverge\n\n${divergence.narrative || ""}\n\n`;
  if (Array.isArray(divergence.items)) {
    for (const item of divergence.items) {
      if (!item.element) continue;
      const framingLabel = item.framing === "complementary" ? "Complementary"
        : item.framing === "friction" ? "Worth noticing"
        : item.framing === "both" ? "Complementary and worth noticing"
        : "";
      content += `### ${item.element}\n\n`;
      if (framingLabel) content += `*${framingLabel}*\n\n`;
      if (item.dailyLife) content += `**In daily life:** ${item.dailyLife}\n\n`;
      if (item.meaning) content += `${item.meaning}\n\n`;
    }
  }

  content += `---\n\n## How You Process the World Together\n\n${metaThinking.narrative || ""}\n\n`;
  if (Array.isArray(metaThinking.biggestGaps) && metaThinking.biggestGaps.length > 0) {
    content += `**Biggest meta-thinking gaps**\n\n`;
    for (const gap of metaThinking.biggestGaps) {
      if (gap.element) content += `- **${gap.element}** — ${gap.showsUpAs || ""}\n`;
    }
    content += `\n`;
  }

  content += `---\n\n## How You Value Differently (and Alike)\n\n${values.narrative || ""}\n\n`;

  content += `---\n\n## How You Handle Emotion Together\n\n${emotion.narrative || ""}\n\n`;

  if (partnerBriefs.A || partnerBriefs.B) {
    content += `---\n\n## A Note to Each of You\n\n`;
    if (partnerBriefs.A) content += `### ${NAME_A}\n\n${partnerBriefs.A}\n\n`;
    if (partnerBriefs.B) content += `### ${NAME_B}\n\n${partnerBriefs.B}\n\n`;
  }

  if (call2Content) {
    content += `---\n\n${call2Content}\n`;
  }

  // 48 Dimensions comparison (placed before What Now? and Methodology per UX request)
  content += `\n---\n\n## All 48 Dimensions Compared\n\n${scoreTable}\n\n`;

  // What Now?
  content += `---\n\n## What Now?\n\nThis report maps the terrain of your relationship. It's a mirror, not a verdict, and it works best when you read it together and let it start conversations.\n\nThree things to do with it:\n\n**Have the conversations.** The Conversation Cards and Conversation Prompts above are the most valuable part of this report. Sit down together and work through the ones that feel most alive. The hardest are usually the ones that matter most.\n\n**Build one ritual.** The Relationship Playbook and the Conflict and Repair Guide give you specific practices. Don't try to adopt all of them. Pick the one that addresses your biggest pattern and commit to it for 30 days. Gottman's research is clear: consistency beats intensity.\n\n**Come back to it.** Revisit this report after your first real disagreement or your next big life transition. The patterns described here will suddenly feel viscerally true, and the practices will make more sense in context.\n\n`;

  content += `---\n\n## Methodology and Sources\n\nThis report is grounded in six bodies of research:\n\n- **Gottman Institute** — 40+ years of longitudinal couples research. The Four Horsemen (criticism, contempt, defensiveness, stonewalling), the 5-to-1 positive-to-negative ratio in conflict, bids for connection, the 20-minute physiological break.\n- **Sue Johnson, Emotionally Focused Therapy** — adult attachment bonds, demand-withdraw cycles, the A.R.E. framework (Accessible, Responsive, Engaged).\n- **Adult Attachment Theory** (Bowlby, Ainsworth, Hazan and Shaver, Levine and Heller) — secure, anxious, avoidant, and disorganized styles. Earned security.\n- **Self-Determination Theory** (Deci and Ryan) — autonomy, competence, and relatedness as the foundations of thriving.\n- **Terri Orbuch's 26-year Early Years of Marriage study** — affective affirmation as the strongest predictor of long-term satisfaction.\n- **Divorce longitudinal research** (Amato, Wilcox, Stanley and Rhoades, Hawkins) — the most-cited reasons relationships end, and the "sliding versus deciding" effect.\n- **Positive Psychology** (Seligman, Fredrickson, Gable) — capitalization (how partners respond to good news) and shared meaning as resilience factors.\n\nThe Opinion DNA assessment itself was designed in consultation with academic psychologists and behavioral scientists from Royal Holloway, Oxford, Cambridge, University of Pennsylvania, City University, and NYU.\n\n**What this report does:** it names patterns suggested by two psychometric profiles and offers concrete practices to work with those patterns. It's a structured mirror.\n\n**What this report does not do:** it does not diagnose, score the relationship, predict outcomes, or tell you whether you should stay together. The reader always has agency over the interpretation.\n\n`;

  content += `---\n\n*opiniondna.com*`;

  // Post-process
  content = content.replace(/\*\*([^*]+):\*\*([^\s\n])/g, "**$1:** $2");
  content = content.replace(/\*([^*]+):\*([^\s\n*])/g, "*$1:* $2");

  console.log(`\nReport assembled: ${content.length} chars`);

  // Upsert: update existing couples example if present, else insert
  const { data: existing } = await admin
    .from("reports")
    .select("id")
    .eq("user_id", testUser.id)
    .eq("type", "comparison")
    .eq("relationship_type", "couples")
    .limit(1)
    .single();

  if (existing?.id) {
    const { error } = await admin
      .from("reports")
      .update({
        content,
        status: "completed",
        scores_snapshot: PARTNER_A_SCORES,
        comparison_scores_snapshot: PARTNER_B_SCORES,
      })
      .eq("id", existing.id);
    if (error) {
      console.error("Update failed:", error.message);
      process.exit(1);
    }
    console.log(`\nUpdated existing Couples report.`);
    console.log(`Report ID: ${existing.id}`);
    console.log(`View at: http://localhost:3001/compare/${existing.id}`);
    console.log(`Production: https://www.opiniondna.com/compare/${existing.id}`);
    return;
  }

  const { data: report, error } = await admin
    .from("reports")
    .insert({
      user_id: testUser.id,
      type: "comparison",
      relationship_type: "couples",
      status: "completed",
      content,
      scores_snapshot: PARTNER_A_SCORES,
      comparison_user_id: testUser.id,
      comparison_scores_snapshot: PARTNER_B_SCORES,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Save failed:", error.message);
    process.exit(1);
  }

  console.log(`\nDone! Couples report created.`);
  console.log(`Report ID: ${report.id}`);
  console.log(`View at: http://localhost:3001/compare/${report.id}`);
  console.log(`Production: https://www.opiniondna.com/compare/${report.id}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
