/**
 * Regenerate the demo comparison report using the actual Claude API pipeline.
 * Uses the updated prompts with all style/quality rules from the individual report.
 *
 * Usage: npx tsx scripts/regenerate-comparison.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { computeCompatibility } from "../src/lib/scoring/compatibility";
import { PARLIA_AVERAGES } from "../src/lib/scoring/elements";
import { streamClaude } from "../src/lib/report/claude-stream";

import { extractJSON } from "../src/lib/report/parse-json";
import {
  buildCall1SystemPrompt,
  buildCall1UserPrompt,
  buildCall2SystemPrompt,
  buildCall2UserPrompt,
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

if (!apiKey) {
  console.error("Missing ANTHROPIC_API_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey);

const REPORT_ID = "b7893b71-e0d7-4a5a-a5c5-ab388705b081";
const NAME_A = "Alex Chen";
const NAME_B = "Jordan Park";

async function main() {
  console.log("Fetching scores from database...");

  const { data: report } = await admin
    .from("reports")
    .select("scores_snapshot, comparison_scores_snapshot")
    .eq("id", REPORT_ID)
    .single();

  if (!report) {
    console.error("Report not found");
    process.exit(1);
  }

  const scoresA = report.scores_snapshot;
  const scoresB = report.comparison_scores_snapshot;

  console.log(`Scores: A=${scoresA.length} elements, B=${scoresB.length} elements`);

  // Step 1: Compute compatibility score (deterministic)
  console.log("\nComputing compatibility score...");
  const compatibility = computeCompatibility(scoresA, scoresB);
  console.log(`Score: ${compatibility.score} — ${compatibility.label}`);
  console.log(`Blind spots: ${compatibility.blindSpots.length}`);
  console.log(`Stress: ${NAME_A}=${compatibility.stressTendencyA.name}, ${NAME_B}=${compatibility.stressTendencyB.name}`);

  // Step 2: Call 1 — Structured analysis (JSON)
  console.log("\n--- Call 1: Structured Analysis (JSON) ---");
  console.log("Sending to Claude...");

  const call1Start = Date.now();
  const call1Raw = await streamClaude(
    apiKey,
    buildCall1SystemPrompt(),
    buildCall1UserPrompt(NAME_A, NAME_B, scoresA, scoresB, PARLIA_AVERAGES, compatibility),
    { maxTokens: 16000, model: "claude-sonnet-4-20250514" }
  );
  const call1Duration = ((Date.now() - call1Start) / 1000).toFixed(1);
  console.log(`Call 1 complete in ${call1Duration}s (${call1Raw.length} chars)`);

  let call1Json: Record<string, unknown>;
  try {
    call1Json = extractJSON(call1Raw);
    console.log("JSON parsed successfully");
    const factors = (call1Json.successFactors as Array<Record<string, unknown>>) || [];
    console.log(`Success factors: ${factors.length}`);
    const blindSpots = (call1Json.blindSpots as Array<Record<string, unknown>>) || [];
    console.log(`AI blind spots: ${blindSpots.length}`);
    const darkTriad = (call1Json.darkTriadInsights as Array<Record<string, unknown>>) || [];
    console.log(`Dark triad insights: ${darkTriad.length}`);
  } catch (err) {
    console.error("JSON parse failed:", err);
    console.log("Raw output (first 500 chars):", call1Raw.substring(0, 500));
    process.exit(1);
  }

  // Step 3: Call 2 — Prescriptive content (Markdown)
  console.log("\n--- Call 2: Prescriptive Content (Markdown) ---");
  console.log("Sending to Claude...");

  const call2Start = Date.now();
  const call2Content = await streamClaude(
    apiKey,
    buildCall2SystemPrompt(),
    buildCall2UserPrompt(NAME_A, NAME_B, scoresA, scoresB, JSON.stringify(call1Json, null, 2)),
    { maxTokens: 16000, model: "claude-sonnet-4-20250514" }
  );
  const call2Duration = ((Date.now() - call2Start) / 1000).toFixed(1);
  console.log(`Call 2 complete in ${call2Duration}s (${call2Content.length} chars)`);

  // Step 4: Assemble the full report
  console.log("\n--- Assembling Report ---");

  const successFactors = (call1Json.successFactors || []) as Array<Record<string, unknown>>;
  const overallNarrative = (call1Json.overallNarrative || "") as string;
  const scoreRationale = (call1Json.scoreRationale || "") as string;
  const partnerBriefA = (call1Json.partnerBriefA || "") as string;
  const partnerBriefB = (call1Json.partnerBriefB || "") as string;
  const darkTriadInsights = (call1Json.darkTriadInsights || []) as Array<Record<string, unknown>>;
  const aiBlindSpots = (call1Json.blindSpots || []) as Array<Record<string, unknown>>;

  const sortedFactors = [...compatibility.factorScores].sort((a, b) => b.score - a.score);
  const alignedFactors = sortedFactors.filter(f => f.score >= 60);
  const tensionFactors = sortedFactors.filter(f => f.score < 60);

  let content = `# Co-Founder Compatibility Report

**${NAME_A} & ${NAME_B}**

*A comparative analysis across 48 dimensions of how you think, what you value, and how your minds work.*

Prepared by Opinion DNA
opiniondna.com

---

## How to Read This Report

This report compares two Opinion DNA profiles across 48 dimensions grouped into three areas: Personality, Values, and Meta-Thinking.

For each dimension, you'll see both partners' scores side by side. The report highlights where you align (shared strengths), where you differ (opportunities for complementary partnership), and where shared patterns create blind spots.

Throughout the report you'll find:

- **Co-Founder Success Factors**: 10 research-backed categories that predict co-founder relationship success, scored from your combined profiles
- **Conversation Cards**: specific scenarios and discussion prompts based on your biggest gaps
- **Mitigation Playbook**: concrete rituals and protocols to manage your differences intentionally

Differences are not weaknesses. The strongest co-founding teams have complementary profiles where each partner brings what the other lacks. The goal is awareness, not judgment.

---

## Your Co-Founder Compatibility Score: ${compatibility.score}

**${compatibility.label}**

${overallNarrative}

${scoreRationale}

---

## What to Know About Your Co-Founder

### ${NAME_A}, here's what to know about working with ${NAME_B}

${partnerBriefA}

### ${NAME_B}, here's what to know about working with ${NAME_A}

${partnerBriefB}

---

## Co-Founder Success Factors

`;

  function renderFactor(factor: typeof sortedFactors[0]) {
    const aiFactor = successFactors.find((sf) => sf.name === factor.name);
    const narrative = (aiFactor?.narrative as string) || "";
    const strengths = (aiFactor?.topStrengths as string[]) || [];
    const risks = (aiFactor?.topRisks as string[]) || [];
    const mitigation = (aiFactor?.inlineMitigation as string) || "";
    const superPower = (aiFactor?.superPower as string) || "";
    const watchOut = (aiFactor?.watchOut as string) || "";
    const tip = (aiFactor?.tip as string) || "";

    let out = `**${factor.name}**\n\n`;
    if (narrative) out += `${narrative}\n\n`;
    if (strengths.length > 0) {
      out += strengths.map(s => `- ${s}`).join("\n") + "\n\n";
    }
    if (risks.length > 0) {
      out += risks.map(r => `- ${r}`).join("\n") + "\n\n";
    }
    if (superPower) out += `### Super Power\n\n${superPower}\n\n`;
    if (watchOut) out += `### Watch Out\n\n${watchOut}\n\n`;
    if (tip) out += `### Tip\n\n${tip}\n\n`;
    if (mitigation) out += `*${mitigation}*\n\n`;
    return out;
  }

  if (alignedFactors.length > 0) {
    content += `### Where You Align\n\n`;
    for (const factor of alignedFactors) {
      content += renderFactor(factor);
    }
  }

  if (tensionFactors.length > 0) {
    content += `---\n\n### Where You'll Navigate Differences\n\n`;
    for (const factor of tensionFactors) {
      content += renderFactor(factor);
    }
  }

  // Blind spots
  if (compatibility.blindSpots.length > 0 || aiBlindSpots.length > 0) {
    content += `---\n\n## Your Blind Spots\n\nThese are patterns where both of you score similarly in extreme ranges. Neither partner naturally counterbalances the other.\n\n`;
    for (const bs of aiBlindSpots) {
      content += `**${bs.dimension}**\n\n${bs.pattern}\n\n*Implication:* ${bs.implication}\n\n*Protocol:* ${bs.protocol}\n\n`;
    }
    const aiDimensions = new Set(aiBlindSpots.map(b => b.dimension));
    for (const bs of compatibility.blindSpots) {
      if (!aiDimensions.has(bs.dimensionName)) {
        content += `**${bs.dimensionName}**\n\n${bs.description}\n\n`;
      }
    }
  }

  // Under Pressure — merged stress tendencies + behavioral patterns
  content += `---\n\n## Under Pressure\n\nStartup stress reveals patterns that don't show up during the honeymoon phase. Based on your profiles, here's how each of you is likely to respond when things get hard, and what to do about it.\n\n`;

  function renderStressTendency(name: string, tendency: typeof compatibility.stressTendencyA) {
    const driverList = tendency.drivingScores
      .map(d => `${d.dimension}: ${d.score}`)
      .join(", ");
    let out = `### ${name}: ${tendency.name}\n\n`;
    out += `${tendency.description}\n\n`;
    out += `*Driven by: ${driverList}*\n\n`;
    out += `**Counter-strategy:** ${tendency.counterStrategy}\n\n`;
    return out;
  }

  content += renderStressTendency(NAME_A, compatibility.stressTendencyA);
  content += renderStressTendency(NAME_B, compatibility.stressTendencyB);

  // Dark Triad insights as additional behavioral patterns within this section
  if (darkTriadInsights.length > 0) {
    content += `### Strategic Instincts\n\nSome behavioral patterns carry both competitive advantages and partnership risks. These aren't weaknesses; they're sharp tools that need conscious management.\n\n`;
    for (const insight of darkTriadInsights) {
      const partnerLabel = insight.partner === "both" ? "Both partners" : insight.partner === "A" ? NAME_A : NAME_B;
      content += `**${insight.dimension}** (${partnerLabel})\n\n`;
      content += `**The edge:** ${insight.strength}\n\n`;
      content += `**The risk:** ${insight.risk}\n\n`;
      content += `**The protocol:** ${insight.mitigation}\n\n`;
    }
  }

  // Call 2 content
  if (call2Content) {
    content += `---\n\n${call2Content}`;
  }

  // Raw dimension comparison heading (visual bars are rendered by the UI)
  content += `\n\n---\n\n## All 48 Dimensions Compared\n\n`;

  // Closing
  content += `\n\n---\n\n## What Now?\n\nThis report maps the terrain of your partnership. The score isn't a grade; it's a guide to where your natural alignment makes decisions easy and where intentional management will make the difference.\n\nThree things to do with this:\n\n**Have the conversations.** The conversation cards above are the most valuable part of this report. Sit down together and work through them. The ones that feel hardest are the ones that matter most.\n\n**Build the rituals.** The mitigation playbook gives you specific practices. Don't try to do all of them. Pick the one that addresses your biggest gap and commit to it for 30 days.\n\n**Come back to it.** Revisit this report after your first major disagreement. The patterns it describes will suddenly feel viscerally real, and the mitigations will make more sense in context.\n\n---\n\n*The Opinion DNA was designed in consultation with academic psychologists and behavioral scientists from the universities of Royal Holloway, Oxford, Cambridge, University of Pennsylvania, City University, and NYU.*\n\n*opiniondna.com*`;

  // Post-process: fix missing space after bold labels like **The risk:**Text → **The risk:** Text
  content = content.replace(/\*\*([^*]+):\*\*([^\s\n])/g, "**$1:** $2");
  // Also fix italic labels like *Counter-strategy:*Text → *Counter-strategy:* Text
  content = content.replace(/\*([^*]+):\*([^\s\n*])/g, "*$1:* $2");

  // Step 5: Save to database
  console.log(`\nReport assembled: ${content.length} chars`);

  const { error } = await admin
    .from("reports")
    .update({ content })
    .eq("id", REPORT_ID);

  if (error) {
    console.error("Save failed:", error.message);
    process.exit(1);
  }

  console.log("\nDone! Report regenerated with AI content.");
  console.log(`View at: http://localhost:3001/compare/${REPORT_ID}`);
  console.log(`\nTotal API time: ${(parseFloat(call1Duration) + parseFloat(call2Duration)).toFixed(1)}s`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
