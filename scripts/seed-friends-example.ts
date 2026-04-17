/**
 * Seed an example Friends Comparison report for the test account.
 *
 * Usage: npx tsx scripts/seed-friends-example.ts
 *
 * Creates a new comparison report with type="comparison",
 * relationship_type="friends" for the jpaulneeley+test@gmail.com user,
 * using the same Alex Chen & Jordan Park fictional profiles as the
 * co-founders example.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { computeCompatibility } from "../src/lib/scoring/compatibility";
import { ELEMENTS } from "../src/lib/scoring/elements";
import { getScoreLevel } from "../src/lib/scoring/engine";
import { streamClaude } from "../src/lib/report/claude-stream";
import {
  buildFriendsSystemPrompt,
  buildFriendsUserPrompt,
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

// Same fictional profiles as the co-founders example
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

async function main() {
  // Find the test user
  const { data: users } = await admin.auth.admin.listUsers({ perPage: 50 });
  const testUser = users?.users?.find((u) => u.email === "jpaulneeley+test@gmail.com");

  if (!testUser) {
    console.error("Test user jpaulneeley+test@gmail.com not found");
    process.exit(1);
  }

  console.log(`Seeding Friends report for: ${testUser.email} (${testUser.id})`);

  // Step 1: Compute compatibility score
  console.log("\nComputing compatibility...");
  const compatibility = computeCompatibility(PARTNER_A_SCORES, PARTNER_B_SCORES);
  console.log(`Score: ${compatibility.score} — ${compatibility.label}`);

  // Step 2: Generate friends content via Claude
  console.log("\nGenerating Friends report via Claude...");
  const start = Date.now();
  const friendsContent = await streamClaude(
    apiKey,
    buildFriendsSystemPrompt(),
    buildFriendsUserPrompt(NAME_A, NAME_B, PARTNER_A_SCORES, PARTNER_B_SCORES, compatibility),
    { maxTokens: 8000, model: "claude-sonnet-4-20250514" }
  );
  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Generation complete in ${duration}s (${friendsContent.length} chars)`);

  // Step 3: Build the 48-dimensions table
  function buildTable() {
    function row(i: number) {
      const el = ELEMENTS[i];
      const a = PARTNER_A_SCORES[i];
      const b = PARTNER_B_SCORES[i];
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

  const scoreTable = buildTable();

  // Step 4: Assemble full report
  let content = `# Friendship Comparison

**${NAME_A} & ${NAME_B}**

*A comparative look across 48 dimensions of how you think, what you value, and how your minds work.*

*Prepared by Opinion DNA opiniondna.com*

---

${friendsContent}

---

## All 48 Dimensions Compared

${scoreTable}

---

*The Opinion DNA was designed in consultation with academic psychologists and behavioral scientists from the universities of Royal Holloway, Oxford, Cambridge, University of Pennsylvania, City University, and NYU.*

*opiniondna.com*`;

  // Post-process: fix missing space after bold/italic labels
  content = content.replace(/\*\*([^*]+):\*\*([^\s\n])/g, "**$1:** $2");
  content = content.replace(/\*([^*]+):\*([^\s\n*])/g, "*$1:* $2");

  // Step 5: Save to reports table — update existing friends example if present
  console.log("\nSaving to database...");
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
