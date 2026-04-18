/**
 * Seed an example Friends Comparison report for the test account.
 *
 * Usage: npx tsx scripts/seed-friends-example.ts
 *
 * Creates or updates a two-call 12-section Friends report for the
 * jpaulneeley+test@gmail.com user, using the same Alex Chen & Jordan Park
 * fictional profiles as the co-founders and couples examples.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { computeCompatibility } from "../src/lib/scoring/compatibility";
import { ELEMENTS } from "../src/lib/scoring/elements";
import { getScoreLevel } from "../src/lib/scoring/engine";
import { streamClaude } from "../src/lib/report/claude-stream";
import { extractJSON, LLMParseError } from "../src/lib/report/parse-json";
import {
  buildFriendsCall1SystemPrompt,
  buildFriendsCall1UserPrompt,
  buildFriendsCall2SystemPrompt,
  buildFriendsCall2UserPrompt,
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

// Same fictional profiles as the co-founders and couples examples
const PARTNER_A_SCORES = [
  92, 55, 72, 38, 45,
  71, 48, 35,
  65, 25, 40, 70,
  45, 85, 55, 30, 25,
  60, 50, 65, 45, 35, 80, 40,
  70, 88, 75, 80, 90,
  60, 45, 20, 30,
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
  75, 70, 60, 55,
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

  console.log(`Seeding Friends report for: ${testUser.email} (${testUser.id})`);

  console.log("\nComputing alignment signal...");
  const compatibility = computeCompatibility(PARTNER_A_SCORES, PARTNER_B_SCORES);
  console.log(`Pattern strength: ${compatibility.score} (${compatibility.label})`);

  // Call 1: JSON analytical sections (1-6)
  console.log("\n--- Call 1: Structured analysis (JSON) ---");
  const call1Start = Date.now();
  const call1Raw = await streamClaude(
    apiKey,
    buildFriendsCall1SystemPrompt(),
    buildFriendsCall1UserPrompt(NAME_A, NAME_B, PARTNER_A_SCORES, PARTNER_B_SCORES, compatibility),
    { maxTokens: 12000, model: "claude-sonnet-4-20250514" }
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
    buildFriendsCall2SystemPrompt(),
    buildFriendsCall2UserPrompt(NAME_A, NAME_B, PARTNER_A_SCORES, PARTNER_B_SCORES, JSON.stringify(call1Json, null, 2)),
    { maxTokens: 12000, model: "claude-sonnet-4-20250514" }
  );
  const call2Duration = ((Date.now() - call2Start) / 1000).toFixed(1);
  console.log(`Call 2 done in ${call2Duration}s (${call2Content.length} chars)`);

  // Assemble the friends report
  console.log("\n--- Assembling report ---");

  type Item = { element?: string; dimension?: string; meaning?: string; framing?: string; fromBothSides?: string; showsUpAs?: string };

  const signature = (call1Json.friendshipSignature || {}) as { portrait?: string; headlineTraits?: string[] };
  const align = (call1Json.align || {}) as { narrative?: string; items?: Item[] };
  const diverge = (call1Json.diverge || {}) as { narrative?: string; items?: Item[] };
  const howYouThink = (call1Json.howYouThink || {}) as { narrative?: string; keyComparisons?: Item[] };
  const whatYouValue = (call1Json.whatYouValue || {}) as { narrative?: string; topAlignments?: string[]; topDivergences?: string[] };
  const emotionalRhythm = (call1Json.emotionalRhythm || {}) as { pattern?: string; narrative?: string };

  const scoreTable = buildScoreTable(PARTNER_A_SCORES, PARTNER_B_SCORES);

  let content = `# Friendship Comparison Report

**${NAME_A} & ${NAME_B}**

*A mirror for two minds that have chosen each other. A comparative look across 48 dimensions of how you think, what you value, and how your minds work.*

*Prepared by Opinion DNA opiniondna.com*

---

## How to Read This Report

This report compares two Opinion DNA profiles across 48 dimensions grouped into three areas: Personality, Values, and Meta-Thinking.

The report names patterns suggested by your two profiles. It doesn't rank your friendship, score compatibility, or tell you whether to stay close. It's a mirror, not a verdict.

Throughout you'll find hedged language ("may", "suggests", "might"). That's deliberate. These are patterns, not facts about who either of you are. If something doesn't fit, trust your own read.

Research grounding: Dunbar's layered model of friendship, Hall's hours-of-friendship research, Franco's friendship attachment work, Rawlins' dialectical tensions, Nelson's three pillars of frientimacy, Gottman adapted to friendship, and Holt-Lunstad/Cacioppo on the health stakes of connection.

---

## Your Friendship Signature

${signature.portrait || ""}

`;

  if (Array.isArray(signature.headlineTraits) && signature.headlineTraits.length > 0) {
    content += `**Headline traits**\n\n`;
    for (const trait of signature.headlineTraits) {
      content += `- ${trait}\n`;
    }
    content += `\n`;
  }

  content += `---\n\n## Where You Align\n\n${align.narrative || ""}\n\n`;
  if (Array.isArray(align.items)) {
    for (const item of align.items) {
      if (item.element) content += `### ${item.element}\n\n${item.meaning || ""}\n\n`;
    }
  }

  content += `---\n\n## Where You Diverge\n\n${diverge.narrative || ""}\n\n`;
  if (Array.isArray(diverge.items)) {
    for (const item of diverge.items) {
      if (!item.element) continue;
      const framingLabel = item.framing === "complementary" ? "Complementary"
        : item.framing === "friction" ? "Worth noticing"
        : item.framing === "both" ? "Complementary and worth noticing"
        : "";
      content += `### ${item.element}\n\n`;
      if (framingLabel) content += `*${framingLabel}*\n\n`;
      if (item.fromBothSides) content += `${item.fromBothSides}\n\n`;
    }
  }

  content += `---\n\n## How You Both Think\n\n${howYouThink.narrative || ""}\n\n`;
  if (Array.isArray(howYouThink.keyComparisons) && howYouThink.keyComparisons.length > 0) {
    content += `**Key meta-thinking comparisons**\n\n`;
    for (const cmp of howYouThink.keyComparisons) {
      if (cmp.element) content += `- **${cmp.element}** — ${cmp.showsUpAs || ""}\n`;
    }
    content += `\n`;
  }

  content += `---\n\n## What You Both Value\n\n${whatYouValue.narrative || ""}\n\n`;
  if (Array.isArray(whatYouValue.topAlignments) && whatYouValue.topAlignments.length > 0) {
    content += `**Top alignments**\n\n`;
    for (const a of whatYouValue.topAlignments) {
      content += `- ${a}\n`;
    }
    content += `\n`;
  }
  if (Array.isArray(whatYouValue.topDivergences) && whatYouValue.topDivergences.length > 0) {
    content += `**Top divergences**\n\n`;
    for (const d of whatYouValue.topDivergences) {
      content += `- ${d}\n`;
    }
    content += `\n`;
  }

  content += `---\n\n## Emotional Rhythm\n\n${emotionalRhythm.narrative || ""}\n\n`;

  if (call2Content) {
    content += `---\n\n${call2Content}\n`;
  }

  content += `\n---\n\n## Methodology and Sources\n\nThis report is grounded in seven bodies of research on friendship:\n\n- **Robin Dunbar** — the layered model of friendship (1.5 intimates, 5 close confidants, 15 good friends, 150 casual, 500 acquaintances). Friendships move inward by shared time and drift outward when that investment drops.\n- **Jeffrey Hall** — the hours of friendship. Roughly 50 hours to move from acquaintance to casual friend, 90 to real friend, 200 to close friend. Close friends decline by roughly half every seven adult years without active maintenance.\n- **Marisa Franco** — *Platonic*, friendship attachment, the power of active initiation as the cheapest friendship-lengthening behavior.\n- **William Rawlins** — the dialectical tensions of friendship: independence vs dependence, affection vs instrumentality, judgment vs acceptance. Lasting friendships keep renegotiating these.\n- **Shasta Nelson** — the three pillars of frientimacy: positivity, consistency, vulnerability.\n- **John Gottman** (adapted to friendship) — the Four Horsemen, the 5-to-1 positive-to-negative ratio, bids for connection, known-ness.\n- **Julianne Holt-Lunstad and John Cacioppo** — the health stakes of social connection. Social isolation is roughly as lethal as smoking. Quality matters more than quantity.\n\nThe Opinion DNA assessment itself was designed in consultation with academic psychologists and behavioral scientists from Royal Holloway, Oxford, Cambridge, University of Pennsylvania, City University, and NYU.\n\n**What this report does:** it names patterns suggested by two psychometric profiles and offers concrete practices to work with those patterns.\n\n**What this report does not do:** it does not diagnose, score the friendship, predict outcomes, or tell you whether to stay close. The reader always has agency over the interpretation.\n\n`;

  content += `---\n\n## All 48 Dimensions Compared\n\n${scoreTable}\n\n`;

  content += `---\n\n*opiniondna.com*`;

  // Post-process
  content = content.replace(/\*\*([^*]+):\*\*([^\s\n])/g, "**$1:** $2");
  content = content.replace(/\*([^*]+):\*([^\s\n*])/g, "*$1:* $2");

  console.log(`\nReport assembled: ${content.length} chars`);

  // Upsert
  const { data: existing } = await admin
    .from("reports")
    .select("id")
    .eq("user_id", testUser.id)
    .eq("type", "comparison")
    .eq("relationship_type", "friends")
    .limit(1)
    .single();

  if (existing?.id) {
    const { error } = await admin
      .from("reports")
      .update({ content, status: "completed" })
      .eq("id", existing.id);
    if (error) {
      console.error("Update failed:", error.message);
      process.exit(1);
    }
    console.log(`\nUpdated existing Friends report.`);
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
      relationship_type: "friends",
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

  console.log(`\nDone! Friends report created.`);
  console.log(`Report ID: ${report.id}`);
  console.log(`View at: http://localhost:3001/compare/${report.id}`);
  console.log(`Production: https://www.opiniondna.com/compare/${report.id}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
