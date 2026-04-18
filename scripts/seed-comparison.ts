/**
 * Seed a demo comparison report with realistic synthetic scores.
 *
 * Usage:
 *   npx tsx scripts/seed-comparison.ts
 *
 * Creates a comparison report record directly in Supabase with
 * pre-generated markdown content so you can preview the UI at
 * /compare/[reportId] without needing two real users or Claude API calls.
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { computeCompatibility } from "../src/lib/scoring/compatibility";
import { ELEMENTS, PARLIA_AVERAGES } from "../src/lib/scoring/elements";
import { getScoreLevel } from "../src/lib/scoring/engine";
import { readFileSync } from "fs";
import { resolve } from "path";

// Manual .env.local parsing (no dotenv dependency)
const envPath = resolve(__dirname, "../.env.local");
try {
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
} catch { /* .env.local not found */ }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey);

// ── Realistic Synthetic Scores ──────────────────────────────────────────────

// Partner A: "The Visionary Strategist"
// High Openness, Achievement, Self-Direction, Machiavellianism
// Low Agreeableness, Conformity, Suppression
const PARTNER_A_SCORES = [
  92, 55, 72, 38, 45,   // Big 5: O high, C mid, E high, A low, N mid
  71, 48, 35,            // Dark Triad: Mach high, Narc mid, Psych low
  65, 25, 40, 70,        // Emotional: Reappraisal high, Suppression low, Mortality mid, LifeSat high
  45, 85, 55, 30, 25,    // Moral: Care mid, Fairness HIGH, Loyalty mid, Authority low, Purity low
  60, 50, 65, 45, 35, 80, 40,  // Cooperative: Family mid, Group mid, Reciprocity high, Heroism mid, Deference low, Equity high, Property mid
  70, 88, 75, 80, 90,    // Personal: Power high, Achievement HIGH, Hedonism high, Stimulation high, Self-Direction VERY HIGH
  60, 45, 20, 30, 25,    // Personal cont: Universalism mid, Benevolence mid, Conformity LOW, Tradition low, Security low
  40, 25,                // Social: SDO mid, Auth low
  35, 82, 45, 75,        // Meta: Dogmatism low, NfC HIGH, IntolUncert mid, IntHumility high
  55, 40, 70, 50,        // Meta cont: Anthropomorphism mid, Teleology mid, SubjNumeracy high, JustWorld mid
  65, 80, 55, 60,        // Primal: Alive mid, Enticing high, Safe mid, Good mid
];

// Partner B: "The Principled Builder"
// High Conscientiousness, Loyalty, Tradition, Dogmatism
// Low Openness, Machiavellianism, Stimulation
const PARTNER_B_SCORES = [
  55, 85, 60, 72, 50,   // Big 5: O mid, C HIGH, E mid, A high, N mid
  30, 35, 25,            // Dark Triad: all low-mid
  50, 60, 55, 65,        // Emotional: Reappraisal mid, Suppression HIGH, Mortality mid, LifeSat mid
  70, 40, 75, 60, 55,    // Moral: Care high, Fairness LOW (vs A's 85!), Loyalty HIGH, Authority mid, Purity mid
  80, 70, 55, 30, 65, 45, 60,  // Cooperative: Family HIGH, Group high, Reciprocity mid, Heroism low, Deference high, Equity mid, Property mid
  35, 70, 50, 40, 65,    // Personal: Power low, Achievement high, Hedonism mid, Stimulation low, Self-Direction mid
  75, 70, 60, 55, 55,    // Personal cont: Universalism high, Benevolence high, Conformity mid, Tradition mid, Security mid
  25, 45,                // Social: SDO low, Auth mid
  72, 55, 65, 35,        // Meta: Dogmatism HIGH (vs A's 35!), NfC mid, IntolUncert high, IntHumility LOW
  50, 60, 45, 55,        // Meta cont: Anthropomorphism mid, Teleology mid, SubjNumeracy mid, JustWorld mid
  70, 60, 50, 55,        // Primal: Alive high, Enticing mid, Safe mid, Good mid
];

const NAME_A = "Alex Chen";
const NAME_B = "Jordan Park";

// ── Build Demo Report Content ───────────────────────────────────────────────

function buildDemoReport(): { content: string; compatibility: ReturnType<typeof computeCompatibility> } {
  const compatibility = computeCompatibility(PARTNER_A_SCORES, PARTNER_B_SCORES);

  const sortedFactors = [...compatibility.factorScores].sort((a, b) => b.score - a.score);
  const alignedFactors = sortedFactors.filter(f => f.score >= 60);
  const tensionFactors = sortedFactors.filter(f => f.score < 60);

  let content = `# Co-Founder Compatibility Report

**${NAME_A} & ${NAME_B}**

*Prepared by Opinion DNA*

---

## Your Compatibility Score: ${compatibility.score}

**${compatibility.label}**

${NAME_A} and ${NAME_B} bring genuinely complementary strengths to this partnership. ${NAME_A}'s high Openness (92) and relentless Self-Direction (90) mean you'll never run out of ideas or ambition. ${NAME_B}'s Conscientiousness (85) and Loyalty (75) mean those ideas will actually get built, and the team will stay together while you do it.

The compatibility score reflects strong motivation alignment and complementary decision-making styles, balanced against a significant Fairness gap (45 points) and a Dogmatism asymmetry that will determine how your disagreements resolve.

---

### Where You Align

`;

  for (const factor of alignedFactors) {
    content += `**${factor.name}** (${factor.score}/100)\n\n`;
    if (factor.name === "Motivation Alignment") {
      content += `You're both driven by Achievement (${NAME_A}: 88, ${NAME_B}: 70) and share a bias toward action over deliberation. ${NAME_A} pushes harder on Power (70 vs 35) and Stimulation (80 vs 40), which means ${NAME_A} will want to chase bigger, riskier bets. ${NAME_B} will want to make sure you can actually deliver on them. This tension is productive if you let it be.\n\n`;
    } else if (factor.name === "Values Alignment") {
      content += `Your core values overlap more than they diverge. You both care about doing good work and treating people well. The differences that exist (${NAME_A}'s low Conformity vs ${NAME_B}'s higher Tradition) will show up in company culture decisions: how formal vs. informal, how much process vs. autonomy.\n\n`;
    } else if (factor.name === "Decision-Making") {
      content += `This is where your partnership has a genuine edge. ${NAME_A}'s high Need for Cognition (82) means you'll think deeply about strategy. ${NAME_B}'s higher Subjective Numeracy (45 vs 70) means you'll ground those thoughts in data. Different cognitive styles, same commitment to getting it right.\n\n`;
    } else {
      content += `Your profiles show natural alignment in this area. Minor differences exist but they're complementary rather than conflicting.\n\n`;
    }
  }

  if (tensionFactors.length > 0) {
    content += `---\n\n### Where You'll Navigate Differences\n\n`;
    for (const factor of tensionFactors) {
      content += `**${factor.name}** (${factor.score}/100)\n\n`;
      if (factor.name === "Equity & Fairness") {
        content += `This is your biggest gap and the one most likely to cause real friction. ${NAME_A} scores 85 on Fairness; ${NAME_B} scores 40. When equity conversations come up, and they will, ${NAME_A} will want mathematical precision: "We each own exactly what we've contributed." ${NAME_B} will lean toward loyalty-based reasoning: "We've been in this together from day one, the split should reflect that commitment."\n\nNeither is wrong. But if you don't surface this difference NOW, it will explode during your first fundraise or your first hire negotiation.\n\n`;
        content += `**What to do:** Before any compensation or equity discussion, ${NAME_A} prepares a spreadsheet model and ${NAME_B} writes a narrative rationale. Compare both frameworks before deciding. Neither approach is complete without the other.\n\n`;
      } else if (factor.name === "Conflict Resolution") {
        content += `${NAME_A}'s Dogmatism is low (35) and Intellectual Humility is high (75), which means ${NAME_A} naturally seeks common ground and changes position when presented with evidence. ${NAME_B}'s Dogmatism is high (72) and Intellectual Humility is low (35), which means ${NAME_B} holds convictions strongly and resists changing course.\n\nThis asymmetry means ${NAME_A} will often defer to ${NAME_B}'s conviction, even when ${NAME_A}'s position is stronger. Over time, ${NAME_A} may feel steamrolled; ${NAME_B} may not even notice it's happening.\n\n`;
        content += `**What to do:** Establish a "devil's advocate" protocol. Before any major decision, the person who feels LESS strongly must argue FOR the opposing view for 5 minutes. This forces ${NAME_B} to genuinely engage with alternatives and gives ${NAME_A} permission to push back.\n\n`;
      } else if (factor.name === "Stress Response") {
        content += `Under pressure, ${NAME_A} will externalize stress (low Suppression: 25) while ${NAME_B} will internalize it (high Suppression: 60). ${NAME_A} will talk about what's wrong; ${NAME_B} will go quiet. ${NAME_A} may interpret ${NAME_B}'s silence as disengagement; ${NAME_B} may interpret ${NAME_A}'s venting as panic.\n\n`;
        content += `**What to do:** Agree on a weekly "state of the union" that's about the partnership, not the business. Use this template: "What's one thing that's working? What's one thing that's not? What do you need from me this week?"\n\n`;
      } else {
        content += `There's a meaningful gap here that will surface under stress. The key is naming it now so you can manage it intentionally rather than reactively.\n\n`;
        content += `**What to do:** Discuss this dimension explicitly. Understanding the gap is half the battle.\n\n`;
      }
    }
  }

  // Blind spots
  if (compatibility.blindSpots.length > 0) {
    content += `---\n\n### Your Blind Spots\n\nThese are patterns where both of you score similarly in extreme ranges. Neither partner naturally counterbalances the other.\n\n`;
    for (const bs of compatibility.blindSpots) {
      content += `**${bs.dimensionName}**\n\n${bs.description}\n\n`;
    }
  }

  // Stress tendencies
  content += `---\n\n### Stress Tendencies\n\n*Based on your profiles, you may be more prone to these patterns under startup stress. These are tendencies, not predictions.*\n\n`;
  content += `**${NAME_A}: ${compatibility.stressTendencyA.name}**\n\n${compatibility.stressTendencyA.description}\n\n*Counter-strategy:* ${compatibility.stressTendencyA.counterStrategy}\n\n`;
  content += `**${NAME_B}: ${compatibility.stressTendencyB.name}**\n\n${compatibility.stressTendencyB.description}\n\n*Counter-strategy:* ${compatibility.stressTendencyB.counterStrategy}\n\n`;

  // Behavioral patterns (Dark Triad — A's Machiavellianism is >65)
  content += `---\n\n### Behavioral Patterns\n\n`;
  content += `**Machiavellianism** (${NAME_A})\n\n*Strength:* ${NAME_A}'s high strategic thinking (71) means you read social dynamics intuitively, negotiate effectively, and see the chess board three moves ahead. In fundraising and partnership deals, this is a genuine superpower.\n\n*Under stress:* You may default to strategic maneuvering when direct communication would be faster and build more trust. Your partner's lower Machiavellianism (30) means they may not pick up on indirect signals and could feel blindsided by moves they didn't see coming.\n\n*Protocol:* Before any external negotiation or strategic decision, brief ${NAME_B} on your full thinking, including the parts you'd normally keep private. Transparency with your co-founder is not a weakness; it's what makes the strategic thinking effective instead of corrosive.\n\n`;

  // Conversation cards
  content += `---\n\n### Conversation Cards\n\n`;
  content += `---\n\n**CARD 1: The Equity Conversation**\n*Based on your Fairness gap of 45 points*\n\n**The scenario:** You've just closed your seed round. An early employee who joined before the round wants to renegotiate their equity. ${NAME_A}, your instinct is to look at a contribution spreadsheet. ${NAME_B}, your instinct is to honor the loyalty of someone who joined when there was nothing.\n\n**Discuss together:**\n- How do you each define "fair" compensation? Is it market rate, contribution-based, or loyalty-based?\n- If you disagree on an equity decision, what's the tiebreaker process?\n- Are there decisions where one of you should have final say?\n\n`;
  content += `---\n\n**CARD 2: The Disagreement Protocol**\n*Based on your Dogmatism gap of 37 points*\n\n**The scenario:** You're deciding whether to pivot the product. ${NAME_A} has data suggesting the current direction isn't working. ${NAME_B} believes strongly in the original vision and thinks the data is incomplete. You've been going back and forth for a week.\n\n**Discuss together:**\n- When we disagree, how long should we debate before forcing a decision?\n- Is there a person or advisor whose opinion could break a deadlock?\n- Can you think of a time when you changed your mind about something important? What did it take?\n\n`;
  content += `---\n\n**CARD 3: The Stress Signal**\n*Based on your Suppression gap of 35 points*\n\n**The scenario:** It's 2am, two days before a major launch. Something breaks. ${NAME_A} starts talking through the problem out loud, getting visibly frustrated. ${NAME_B} goes quiet and opens a laptop.\n\n**Discuss together:**\n- When you're stressed, what does your partner need to know about how you show it?\n- What's the signal that means "I need help" vs "I need space"?\n- What does recovery look like for each of you after an intense week?\n\n`;
  content += `---\n\n**CARD 4: The Culture Question**\n*Based on your Conformity-Tradition gap*\n\n**The scenario:** You're hiring your fifth employee. ${NAME_A} wants to keep things loose: no titles, no formal reviews, ship fast. ${NAME_B} wants some structure: clear roles, weekly check-ins, documentation.\n\n**Discuss together:**\n- What does the ideal company culture look like at 10 people? At 50?\n- Which of you is responsible for "people" decisions?\n- What's one non-negotiable cultural value for each of you?\n\n`;
  content += `---\n\n**CARD 5: The Risk Appetite**\n*Based on your Power and Stimulation gap*\n\n**The scenario:** A big tech company wants to acquire you for a life-changing amount. ${NAME_A}'s high Power (70) and Stimulation (80) scores suggest the drive to keep building and pursue something bigger. ${NAME_B}'s lower scores suggest this might be the right exit.\n\n**Discuss together:**\n- What would make each of you say "we should sell"?\n- What would make each of you say "we should keep going"?\n- Have you talked about your personal financial goals and timelines?\n\n`;

  // Mitigation playbook
  content += `---\n\n### Mitigation Playbook\n\n`;
  content += `**The Spreadsheet vs. Narrative Protocol**\n*Addresses: Equity & Fairness*\n\n**The risk:** A 45-point Fairness gap means you process compensation and equity decisions through fundamentally different lenses.\n\n**The ritual:** Before any compensation, equity, or resource allocation discussion, ${NAME_A} prepares a quantitative model (spreadsheet, formula, market data). ${NAME_B} writes a narrative rationale (loyalty context, relationship history, qualitative factors). You compare both frameworks before deciding. Neither is complete without the other.\n\n**Frequency:** Per-decision (any compensation or equity change)\n\n`;
  content += `**The Devil's Advocate Rule**\n*Addresses: Conflict Resolution*\n\n**The risk:** ${NAME_A}'s natural flexibility (low Dogmatism: 35) combined with ${NAME_B}'s strong convictions (high Dogmatism: 72) means ${NAME_A} will defer too often, building resentment over time.\n\n**The ritual:** Before any major strategic decision, the person who feels LESS strongly must argue FOR the opposing position for 5 minutes. Set a timer. The goal isn't to "win"; it's to ensure both perspectives are genuinely heard before committing.\n\n**Frequency:** Per major decision (product direction, hiring, fundraising strategy)\n\n`;
  content += `**The Weekly State of the Union**\n*Addresses: Stress Response*\n\n**The risk:** ${NAME_A} externalizes stress (talks about it), ${NAME_B} internalizes (goes quiet). Without a ritual, problems fester.\n\n**The ritual:** Every Friday at 4pm, 30 minutes, no screens. Three questions: (1) What's one thing that's working in our partnership this week? (2) What's one thing that's not? (3) What do you need from me next week? No problem-solving during the ritual; just listening.\n\n**Frequency:** Weekly\n\n`;

  // Raw dimension comparison
  content += `---\n\n## All 48 Dimensions Compared\n\n`;

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

  for (const cat of categories) {
    if (cat.title) content += `\n${cat.title}\n\n`;
    content += `**${cat.subtitle}**\n\n${header}\n${cat.indices.map(row).join("\n")}\n\n`;
  }

  content += `\n*⚠ = gap > 30 points (significant)  △ = gap 15-30 points (moderate)*`;

  // Closing
  content += `\n\n---\n\n## What Now?\n\nThis report maps the terrain of your partnership. The score isn't a grade; it's a guide to where your natural alignment makes decisions easy and where intentional management will make the difference.\n\nThree things to do with this:\n\n**Have the conversations.** The conversation cards above are the most valuable part of this report. Sit down together and work through them. The ones that feel hardest are the ones that matter most.\n\n**Build the rituals.** The mitigation playbook gives you specific practices. Don't try to do all of them. Pick the one that addresses your biggest gap and commit to it for 30 days.\n\n**Come back to it.** Revisit this report after your first major disagreement. The patterns it describes will suddenly feel viscerally real, and the mitigations will make more sense in context.\n\n---\n\n*The Opinion DNA was designed in consultation with academic psychologists and behavioral scientists from the universities of Royal Holloway, Oxford, Cambridge, University of Pennsylvania, City University, and NYU.*\n\n*opiniondna.com*`;

  return { content, compatibility };
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Building demo comparison report...");

  const { content, compatibility } = buildDemoReport();
  console.log(`Compatibility score: ${compatibility.score} — ${compatibility.label}`);
  console.log(`Blind spots: ${compatibility.blindSpots.length}`);
  console.log(`Stress tendencies: ${compatibility.stressTendencyA.name} / ${compatibility.stressTendencyB.name}`);

  // Get the first user in the system to attach the report to
  const { data: users } = await admin.auth.admin.listUsers({ perPage: 1 });
  if (!users?.users?.length) {
    console.error("No users found in the database. Sign up first, then run this script.");
    process.exit(1);
  }

  const userId = users.users[0].id;
  console.log(`Attaching to user: ${userId}`);

  // Create the report
  const { data: report, error } = await admin
    .from("reports")
    .insert({
      user_id: userId,
      type: "comparison",
      status: "completed",
      content,
      scores_snapshot: PARTNER_A_SCORES,
      comparison_user_id: userId, // Self-comparison for demo purposes
      comparison_scores_snapshot: PARTNER_B_SCORES,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create report:", error.message);
    process.exit(1);
  }

  console.log(`\nDemo report created!`);
  console.log(`View at: http://localhost:3001/compare/${report.id}`);
  console.log(`\nReport ID: ${report.id}`);
}

main().catch(console.error);
