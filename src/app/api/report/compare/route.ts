import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PARLIA_AVERAGES, ELEMENTS } from "@/lib/scoring/elements";
import { getScoreLevel } from "@/lib/scoring/engine";
import { computeCompatibility } from "@/lib/scoring/compatibility";
import { streamClaude } from "@/lib/report/claude-stream";
import { extractJSON, LLMParseError } from "@/lib/report/parse-json";
import {
  buildCall1SystemPrompt,
  buildCall1UserPrompt,
  buildCall2SystemPrompt,
  buildCall2UserPrompt,
  buildFriendsSystemPrompt,
  buildFriendsUserPrompt,
} from "@/lib/report/comparison-prompt";
import { sendScorecardEmail } from "@/lib/email/scorecard";
import { rateLimit } from "@/lib/auth/rate-limit";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Comparison Report Generation
 *
 * Triggered by quiz submission hook when both partners have scores.
 * Can also be called directly with { inviteId }.
 *
 * Flow:
 *   1. Validate invite + fetch both score sets
 *   2. Compute compatibility score (deterministic)
 *   3. Call 1: Claude JSON (analysis)
 *   4. Parse JSON (with fallback)
 *   5. Call 2: Claude Markdown (prescriptive)
 *   6. Assemble report
 *   7. Save to reports table
 *   8. Send scorecard emails
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(`compare:${user.id}`, { limit: 3, windowMs: 3600_000 });
  if (limited) return limited;

  const { inviteId, relationshipType } = await request.json();
  if (!inviteId) {
    return NextResponse.json({ error: "inviteId required" }, { status: 400 });
  }
  const relType = relationshipType || "cofounders";

  const admin = createAdminClient();

  // Fetch the invite — user must be either the inviter or the invitee
  const { data: invite } = await admin
    .from("invites")
    .select("*")
    .eq("id", inviteId)
    .eq("status", "accepted")
    .single();

  if (!invite) {
    return NextResponse.json({ error: "Invite not found or not accepted" }, { status: 404 });
  }

  // Verify this user is part of the invite
  if (invite.from_user_id !== user.id && invite.to_user_id !== user.id) {
    return NextResponse.json({ error: "Not authorized for this invite" }, { status: 403 });
  }

  // Check purchase on the INVITER (friends comparison is free)
  if (relType !== "friends") {
    const { data: purchase } = await admin
      .from("purchases")
      .select("id")
      .eq("user_id", invite.from_user_id)
      .eq("status", "completed")
      .limit(1)
      .single();

    if (!purchase) {
      return NextResponse.json({ error: "Purchase required (inviter)" }, { status: 403 });
    }
  }

  // Check if comparison report already exists for this invite (idempotency)
  if (invite.comparison_report_id) {
    return NextResponse.json({
      reportId: invite.comparison_report_id,
      status: "already_exists",
    });
  }

  // Fetch both score sets
  const { data: scoresFrom } = await admin
    .from("user_scores")
    .select("scores")
    .eq("user_id", invite.from_user_id)
    .single();

  const { data: scoresTo } = await admin
    .from("user_scores")
    .select("scores")
    .eq("user_id", invite.to_user_id)
    .single();

  if (!scoresFrom || !scoresTo) {
    return NextResponse.json({ error: "Both partners must complete the assessment" }, { status: 400 });
  }

  // Get partner names
  const { data: profileFrom } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", invite.from_user_id)
    .single();

  const { data: profileTo } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", invite.to_user_id)
    .single();

  const nameA = profileFrom?.full_name || "Partner A";
  const nameB = profileTo?.full_name || "Partner B";

  // ── Step 2: Compute compatibility score (deterministic) ───────────────
  const compatibility = computeCompatibility(scoresFrom.scores, scoresTo.scores);

  // Create the report record
  const { data: report } = await admin
    .from("reports")
    .insert({
      user_id: invite.from_user_id,
      type: "comparison",
      relationship_type: relType,
      status: "generating",
      scores_snapshot: scoresFrom.scores,
      comparison_user_id: invite.to_user_id,
      comparison_scores_snapshot: scoresTo.scores,
    })
    .select("id")
    .single();

  if (!report) {
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY!;

    // ── Friends: single-call, lighter report ─────────────────────────
    if (relType === "friends") {
      const friendsContent = await streamClaude(
        apiKey,
        buildFriendsSystemPrompt(),
        buildFriendsUserPrompt(nameA, nameB, scoresFrom.scores, scoresTo.scores, compatibility)
      );

      const scoreTable = buildComparisonScoreTable(scoresFrom.scores, scoresTo.scores, nameA, nameB);

      const content = `# Friendship Comparison

**${nameA} & ${nameB}**

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

      await admin.from("reports").update({ content, status: "completed" }).eq("id", report.id);
      await admin.from("invites").update({
        comparison_report_id: report.id,
        compatibility_score: compatibility.score,
      }).eq("id", inviteId);

      return NextResponse.json({ reportId: report.id, status: "completed", score: compatibility.score });
    }

    // ── Co-Founders/Couples: two-call architecture ───────────────────

    // ── Step 3: Call 1 — Structured analysis (JSON) ───────────────────
    let call1Analysis: string;
    let call1Json: Record<string, unknown> | null = null;

    try {
      const call1Raw = await streamClaude(
        apiKey,
        buildCall1SystemPrompt(),
        buildCall1UserPrompt(nameA, nameB, scoresFrom.scores, scoresTo.scores, PARLIA_AVERAGES, compatibility)
      );

      call1Json = extractJSON(call1Raw);
      call1Analysis = JSON.stringify(call1Json, null, 2);
    } catch (err) {
      console.error("Call 1 JSON parse failed, retrying:", err);

      // Retry once
      try {
        const retryRaw = await streamClaude(
          apiKey,
          buildCall1SystemPrompt(),
          buildCall1UserPrompt(nameA, nameB, scoresFrom.scores, scoresTo.scores, PARLIA_AVERAGES, compatibility)
        );
        call1Json = extractJSON(retryRaw);
        call1Analysis = JSON.stringify(call1Json, null, 2);
      } catch (retryErr) {
        // Fall back to raw text
        console.error("Call 1 retry failed, using raw text:", retryErr);
        call1Analysis = retryErr instanceof LLMParseError ? retryErr.rawResponse : "Analysis unavailable.";
      }
    }

    // ── Step 4: Call 2 — Prescriptive content (Markdown) ──────────────
    let call2Content = "";

    try {
      call2Content = await streamClaude(
        apiKey,
        buildCall2SystemPrompt(),
        buildCall2UserPrompt(nameA, nameB, scoresFrom.scores, scoresTo.scores, call1Analysis)
      );
    } catch (err) {
      console.error("Call 2 failed:", err);
      // Report saves with Call 1 analysis only
    }

    // ── Step 5: Assemble report ───────────────────────────────────────
    const scoreTable = buildComparisonScoreTable(scoresFrom.scores, scoresTo.scores, nameA, nameB);

    // Extract structured data for rendering
    const analysisData = call1Json as Record<string, unknown> | null;
    const successFactors = (analysisData?.successFactors || []) as Array<Record<string, unknown>>;
    const overallNarrative = (analysisData?.overallNarrative || "") as string;
    const scoreRationale = (analysisData?.scoreRationale || "") as string;
    const darkTriadInsights = (analysisData?.darkTriadInsights || []) as Array<Record<string, unknown>>;
    const aiBlindSpots = (analysisData?.blindSpots || []) as Array<Record<string, unknown>>;

    // Build the full report content as Markdown
    let content = `# Co-Founder Compatibility Report

**${nameA} & ${nameB}**

*Prepared by Opinion DNA*

---

## Your Compatibility Score: ${compatibility.score}

**${compatibility.label}**

${overallNarrative}

${scoreRationale}

---

## Co-Founder Success Factors

`;

    // Success factors — sorted by score ascending (worst first... no, best first for emotional arc)
    const sortedFactors = [...compatibility.factorScores].sort((a, b) => b.score - a.score);

    // Alignment section (score >= 60)
    const alignedFactors = sortedFactors.filter(f => f.score >= 60);
    const tensionFactors = sortedFactors.filter(f => f.score < 60);

    if (alignedFactors.length > 0) {
      content += `### Where You Align\n\n`;
      for (const factor of alignedFactors) {
        const aiFactor = successFactors.find((sf: Record<string, unknown>) => sf.name === factor.name);
        const narrative = (aiFactor?.narrative as string) || "";
        const strengths = (aiFactor?.topStrengths as string[]) || [];
        content += `**${factor.name}** (${factor.score}/100)\n\n`;
        if (narrative) content += `${narrative}\n\n`;
        if (strengths.length > 0) {
          content += strengths.map(s => `- ${s}`).join("\n") + "\n\n";
        }
      }
    }

    if (tensionFactors.length > 0) {
      content += `---\n\n### Where You'll Navigate Differences\n\n`;
      for (const factor of tensionFactors) {
        const aiFactor = successFactors.find((sf: Record<string, unknown>) => sf.name === factor.name);
        const narrative = (aiFactor?.narrative as string) || "";
        const risks = (aiFactor?.topRisks as string[]) || [];
        const mitigation = (aiFactor?.inlineMitigation as string) || "";
        content += `**${factor.name}** (${factor.score}/100)\n\n`;
        if (narrative) content += `${narrative}\n\n`;
        if (risks.length > 0) {
          content += risks.map(r => `- ${r}`).join("\n") + "\n\n";
        }
        if (mitigation) {
          content += `**What to do:** ${mitigation}\n\n`;
        }
      }
    }

    // Blind spots
    if (compatibility.blindSpots.length > 0 || aiBlindSpots.length > 0) {
      content += `---\n\n### Your Blind Spots\n\nThese are patterns where both of you score similarly in extreme ranges. Neither partner naturally counterbalances the other.\n\n`;
      for (const bs of aiBlindSpots) {
        content += `**${bs.dimension}**\n\n${bs.pattern}\n\n*Implication:* ${bs.implication}\n\n*Protocol:* ${bs.protocol}\n\n`;
      }
      // Add any blind spots the AI missed but the algorithm detected
      const aiDimensions = new Set(aiBlindSpots.map(b => b.dimension));
      for (const bs of compatibility.blindSpots) {
        if (!aiDimensions.has(bs.dimensionName)) {
          content += `**${bs.dimensionName}**\n\n${bs.description}\n\n`;
        }
      }
    }

    // Stress tendencies
    content += `---\n\n### Stress Tendencies\n\n*Based on your profiles, you may be more prone to these patterns under startup stress. These are tendencies, not predictions.*\n\n`;
    content += `**${nameA}: ${compatibility.stressTendencyA.name}**\n\n${compatibility.stressTendencyA.description}\n\n*Counter-strategy:* ${compatibility.stressTendencyA.counterStrategy}\n\n`;
    content += `**${nameB}: ${compatibility.stressTendencyB.name}**\n\n${compatibility.stressTendencyB.description}\n\n*Counter-strategy:* ${compatibility.stressTendencyB.counterStrategy}\n\n`;

    if (compatibility.stressTendencyA.name === compatibility.stressTendencyB.name) {
      content += `*Shared risk:* You both tend toward ${compatibility.stressTendencyA.name}. This means conflict may escalate in a predictable pattern with no natural circuit breaker. The counter-strategy above is especially important for you.\n\n`;
    }

    // Dark Triad behavioral patterns
    if (darkTriadInsights.length > 0) {
      content += `---\n\n### Behavioral Patterns\n\n`;
      for (const insight of darkTriadInsights) {
        content += `**${insight.dimension}** (${insight.partner === "both" ? "Both partners" : insight.partner === "A" ? nameA : nameB})\n\n`;
        content += `*Strength:* ${insight.strength}\n\n*Under stress:* ${insight.risk}\n\n*Protocol:* ${insight.mitigation}\n\n`;
      }
    }

    // Call 2 content (conversation cards + mitigation playbook)
    if (call2Content) {
      content += `---\n\n${call2Content}`;
    }

    // Raw dimension comparison
    content += `\n\n---\n\n## All 48 Dimensions Compared\n\n${scoreTable}`;

    // Closing
    content += `\n\n---\n\n## What Now?\n\nThis report maps the terrain of your partnership. The score isn't a grade; it's a guide to where your natural alignment makes decisions easy and where intentional management will make the difference.\n\nThree things to do with this:\n\n**Have the conversations.** The conversation cards above are the most valuable part of this report. Sit down together and work through them. The ones that feel hardest are the ones that matter most.\n\n**Build the rituals.** The mitigation playbook gives you specific practices. Don't try to do all of them. Pick the one that addresses your biggest gap and commit to it for 30 days.\n\n**Come back to it.** Revisit this report after your first major disagreement. The patterns it describes will suddenly feel viscerally real, and the mitigations will make more sense in context.\n\n---\n\n*The Opinion DNA was designed in consultation with academic psychologists and behavioral scientists from the universities of Royal Holloway, Oxford, Cambridge, University of Pennsylvania, City University, and NYU.*\n\n*opiniondna.com*`;

    // ── Step 6: Save to reports table ─────────────────────────────────
    await admin
      .from("reports")
      .update({ content, status: "completed" })
      .eq("id", report.id);

    // Update invite with comparison report reference and score
    await admin
      .from("invites")
      .update({
        comparison_report_id: report.id,
        compatibility_score: compatibility.score,
      })
      .eq("id", inviteId);

    // ── Step 7: Send scorecard emails to both partners ────────────────
    const topStrengths = alignedFactors.slice(0, 3).map(f => f.name);
    const topFriction = tensionFactors.length > 0 ? tensionFactors[0].name : "No significant gaps";

    // Get both users' emails
    const { data: userFrom } = await admin.auth.admin.getUserById(invite.from_user_id);
    const { data: userTo } = await admin.auth.admin.getUserById(invite.to_user_id);

    if (userFrom?.user?.email) {
      await sendScorecardEmail(
        userFrom.user.email,
        nameB,
        report.id,
        compatibility.score,
        compatibility.label,
        topStrengths,
        topFriction
      ).catch(err => console.error("Scorecard email to A failed:", err));
    }

    if (userTo?.user?.email) {
      await sendScorecardEmail(
        userTo.user.email,
        nameA,
        report.id,
        compatibility.score,
        compatibility.label,
        topStrengths,
        topFriction
      ).catch(err => console.error("Scorecard email to B failed:", err));
    }

    return NextResponse.json({ reportId: report.id, status: "completed", score: compatibility.score });
  } catch (error) {
    console.error("Comparison report generation failed:", error);
    await admin
      .from("reports")
      .update({ status: "failed" })
      .eq("id", report.id);

    return NextResponse.json({ reportId: report.id, status: "failed" }, { status: 500 });
  }
}

/**
 * Build markdown table comparing all 48 dimensions side-by-side.
 */
function buildComparisonScoreTable(
  scoresA: number[],
  scoresB: number[],
  nameA: string,
  nameB: string
): string {
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

  const header = `| Element | ${nameA} | ${nameB} | Gap |\n|---|---|---|---|`;

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
