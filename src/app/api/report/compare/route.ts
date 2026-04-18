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
  buildFriendsCall1SystemPrompt,
  buildFriendsCall1UserPrompt,
  buildFriendsCall2SystemPrompt,
  buildFriendsCall2UserPrompt,
  buildCouplesCall1SystemPrompt,
  buildCouplesCall1UserPrompt,
  buildCouplesCall2SystemPrompt,
  buildCouplesCall2UserPrompt,
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

  const { inviteId, relationshipType, selectionId } = await request.json();
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

  // Idempotency: check comparison_selections for existing report of this type
  const { data: selection } = await admin
    .from("comparison_selections")
    .select("id, report_id, confirmed_by")
    .eq("invite_id", inviteId)
    .eq("relationship_type", relType)
    .single();

  if (selection?.report_id) {
    return NextResponse.json({
      reportId: selection.report_id,
      status: "already_exists",
    });
  }

  // Consent check: both must have selected/confirmed (unless legacy flow)
  if (selection && !selection.confirmed_by) {
    return NextResponse.json({ error: "Both partners must confirm before report generation" }, { status: 400 });
  }

  // For paid types, check that a purchase exists on the selection
  if (relType !== "friends" && selection && !selection.id) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
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

    // ── Friends: two-call architecture, free, 12-section brief ────────
    if (relType === "friends") {
      // Call 1: JSON analysis for sections 1-6
      let friendsCall1Json: Record<string, unknown> | null = null;
      let friendsCall1Analysis: string;
      try {
        const call1Raw = await streamClaude(
          apiKey,
          buildFriendsCall1SystemPrompt(),
          buildFriendsCall1UserPrompt(nameA, nameB, scoresFrom.scores, scoresTo.scores, compatibility)
        );
        friendsCall1Json = extractJSON(call1Raw);
        friendsCall1Analysis = JSON.stringify(friendsCall1Json, null, 2);
      } catch (err) {
        console.error("Friends Call 1 JSON parse failed, retrying:", err);
        try {
          const retryRaw = await streamClaude(
            apiKey,
            buildFriendsCall1SystemPrompt(),
            buildFriendsCall1UserPrompt(nameA, nameB, scoresFrom.scores, scoresTo.scores, compatibility)
          );
          friendsCall1Json = extractJSON(retryRaw);
          friendsCall1Analysis = JSON.stringify(friendsCall1Json, null, 2);
        } catch (retryErr) {
          console.error("Friends Call 1 retry failed:", retryErr);
          friendsCall1Analysis = retryErr instanceof LLMParseError ? retryErr.rawResponse : "Analysis unavailable.";
        }
      }

      // Call 2: Markdown prescriptive content for sections 7-11
      let friendsCall2Content = "";
      try {
        friendsCall2Content = await streamClaude(
          apiKey,
          buildFriendsCall2SystemPrompt(),
          buildFriendsCall2UserPrompt(nameA, nameB, scoresFrom.scores, scoresTo.scores, friendsCall1Analysis)
        );
      } catch (err) {
        console.error("Friends Call 2 failed:", err);
      }

      const scoreTable = buildComparisonScoreTable(scoresFrom.scores, scoresTo.scores, nameA, nameB);
      const content = assembleFriendsReport({
        nameA,
        nameB,
        call1Json: friendsCall1Json,
        call2Content: friendsCall2Content,
        scoreTable,
      });

      await admin.from("reports").update({ content, status: "completed" }).eq("id", report.id);

      // Update comparison_selections with report reference
      if (selectionId || selection) {
        await admin.from("comparison_selections").update({
          report_id: report.id,
          compatibility_score: compatibility.score,
        }).eq("id", selectionId || selection?.id);
      }
      // Also update invite for backward compatibility
      await admin.from("invites").update({
        comparison_report_id: report.id,
        compatibility_score: compatibility.score,
      }).eq("id", inviteId);

      return NextResponse.json({ reportId: report.id, status: "completed", score: compatibility.score });
    }

    // ── Co-Founders/Couples: two-call architecture ───────────────────
    // Select prompts based on relationship type
    const isCouples = relType === "couples";
    const call1SysPrompt = isCouples ? buildCouplesCall1SystemPrompt() : buildCall1SystemPrompt();
    const call1UserPrompt = isCouples
      ? buildCouplesCall1UserPrompt(nameA, nameB, scoresFrom.scores, scoresTo.scores, PARLIA_AVERAGES, compatibility)
      : buildCall1UserPrompt(nameA, nameB, scoresFrom.scores, scoresTo.scores, PARLIA_AVERAGES, compatibility);
    const call2SysPrompt = isCouples ? buildCouplesCall2SystemPrompt() : buildCall2SystemPrompt();

    // ── Step 3: Call 1 — Structured analysis (JSON) ───────────────────
    let call1Analysis: string;
    let call1Json: Record<string, unknown> | null = null;

    try {
      const call1Raw = await streamClaude(apiKey, call1SysPrompt, call1UserPrompt);
      call1Json = extractJSON(call1Raw);
      call1Analysis = JSON.stringify(call1Json, null, 2);
    } catch (err) {
      console.error("Call 1 JSON parse failed, retrying:", err);

      // Retry once
      try {
        const retryRaw = await streamClaude(apiKey, call1SysPrompt, call1UserPrompt);
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
    const call2UserPrompt = isCouples
      ? buildCouplesCall2UserPrompt(nameA, nameB, scoresFrom.scores, scoresTo.scores, call1Analysis)
      : buildCall2UserPrompt(nameA, nameB, scoresFrom.scores, scoresTo.scores, call1Analysis);

    try {
      call2Content = await streamClaude(apiKey, call2SysPrompt, call2UserPrompt);
    } catch (err) {
      console.error("Call 2 failed:", err);
      // Report saves with Call 1 analysis only
    }

    // ── Step 5: Assemble report ───────────────────────────────────────
    const scoreTable = buildComparisonScoreTable(scoresFrom.scores, scoresTo.scores, nameA, nameB);

    // ── Couples assembly: brief-based 12-section structure ────────────
    if (isCouples) {
      const couplesContent = assembleCouplesReport({
        nameA,
        nameB,
        call1Json: call1Json as Record<string, unknown> | null,
        call2Content,
        scoreTable,
      });

      await admin
        .from("reports")
        .update({ content: couplesContent, status: "completed" })
        .eq("id", report.id);

      if (selectionId || selection) {
        await admin.from("comparison_selections").update({
          report_id: report.id,
          compatibility_score: compatibility.score,
        }).eq("id", selectionId || selection?.id);
      }
      await admin.from("invites").update({
        comparison_report_id: report.id,
        compatibility_score: compatibility.score,
      }).eq("id", inviteId);

      return NextResponse.json({ reportId: report.id, status: "completed", score: compatibility.score });
    }

    // ── Co-Founders assembly ──────────────────────────────────────────
    // Extract structured data for rendering
    const analysisData = call1Json as Record<string, unknown> | null;
    const successFactors = (analysisData?.successFactors || []) as Array<Record<string, unknown>>;
    const overallNarrative = (analysisData?.overallNarrative || "") as string;
    const scoreRationale = (analysisData?.scoreRationale || "") as string;
    const darkTriadInsights = (analysisData?.darkTriadInsights || []) as Array<Record<string, unknown>>;
    const aiBlindSpots = (analysisData?.blindSpots || []) as Array<Record<string, unknown>>;

    // Build the full report content as Markdown
    const reportTitle = "Co-Founder Compatibility Report";
    const sectionTitle = "Co-Founder Success Factors";
    let content = `# ${reportTitle}

**${nameA} & ${nameB}**

*A comparative analysis across 48 dimensions of how you think, what you value, and how your minds work.*

*Prepared by Opinion DNA opiniondna.com*

---

## Your Compatibility Score: ${compatibility.score}

**${compatibility.label}**

${overallNarrative}

${scoreRationale}

---

## ${sectionTitle}

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

    // Update comparison_selections with report reference
    if (selectionId || selection) {
      await admin.from("comparison_selections").update({
        report_id: report.id,
        compatibility_score: compatibility.score,
      }).eq("id", selectionId || selection?.id);
    }
    // Also update invite for backward compatibility
    await admin.from("invites").update({
      comparison_report_id: report.id,
      compatibility_score: compatibility.score,
    }).eq("id", inviteId);

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
 * Assemble the couples comparison report from Call 1 JSON + Call 2 markdown.
 * Follows the brief's 12-section structure. No compatibility score display.
 */
/**
 * Assemble the friends comparison report from Call 1 JSON + Call 2 markdown.
 * Follows the Friends brief's 12-section structure. No compatibility score display.
 */
function assembleFriendsReport(params: {
  nameA: string;
  nameB: string;
  call1Json: Record<string, unknown> | null;
  call2Content: string;
  scoreTable: string;
}): string {
  const { nameA, nameB, call1Json, call2Content, scoreTable } = params;

  type Item = { element?: string; dimension?: string; meaning?: string; framing?: string; fromBothSides?: string; showsUpAs?: string };

  const signature = (call1Json?.friendshipSignature || {}) as { portrait?: string; headlineTraits?: string[] };
  const align = (call1Json?.align || {}) as { narrative?: string; items?: Item[] };
  const diverge = (call1Json?.diverge || {}) as { narrative?: string; items?: Item[] };
  const howYouThink = (call1Json?.howYouThink || {}) as { narrative?: string; keyComparisons?: Item[] };
  const whatYouValue = (call1Json?.whatYouValue || {}) as { narrative?: string; topAlignments?: string[]; topDivergences?: string[] };
  const emotionalRhythm = (call1Json?.emotionalRhythm || {}) as { pattern?: string; narrative?: string };

  let content = `# Friendship Comparison Report

**${nameA} & ${nameB}**

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

  // Sections 7-11 from Call 2 markdown
  if (call2Content) {
    content += `---\n\n${call2Content}\n`;
  }

  // Section 12: Methodology and Sources
  content += `\n---\n\n## Methodology and Sources\n\nThis report is grounded in seven bodies of research on friendship:\n\n- **Robin Dunbar** — the layered model of friendship (1.5 intimates, 5 close confidants, 15 good friends, 150 casual, 500 acquaintances). Friendships move inward by shared time and drift outward when that investment drops.\n- **Jeffrey Hall** — the hours of friendship. Roughly 50 hours to move from acquaintance to casual friend, 90 to real friend, 200 to close friend. Close friends decline by roughly half every seven adult years without active maintenance.\n- **Marisa Franco** — *Platonic*, friendship attachment, the power of active initiation as the cheapest friendship-lengthening behavior.\n- **William Rawlins** — the dialectical tensions of friendship: independence vs dependence, affection vs instrumentality, judgment vs acceptance. Lasting friendships keep renegotiating these.\n- **Shasta Nelson** — the three pillars of frientimacy: positivity, consistency, vulnerability.\n- **John Gottman** (adapted to friendship) — the Four Horsemen, the 5-to-1 positive-to-negative ratio, bids for connection, known-ness.\n- **Julianne Holt-Lunstad and John Cacioppo** — the health stakes of social connection. Social isolation is roughly as lethal as smoking. Quality matters more than quantity.\n\nThe Opinion DNA assessment itself was designed in consultation with academic psychologists and behavioral scientists from Royal Holloway, Oxford, Cambridge, University of Pennsylvania, City University, and NYU.\n\n**What this report does:** it names patterns suggested by two psychometric profiles and offers concrete practices to work with those patterns.\n\n**What this report does not do:** it does not diagnose, score the friendship, predict outcomes, or tell you whether to stay close. The reader always has agency over the interpretation.\n\n`;

  // 48 Dimensions comparison
  content += `---\n\n## All 48 Dimensions Compared\n\n${scoreTable}\n\n`;

  content += `---\n\n*opiniondna.com*`;

  // Post-process: fix missing space after bold/italic labels
  content = content.replace(/\*\*([^*]+):\*\*([^\s\n])/g, "**$1:** $2");
  content = content.replace(/\*([^*]+):\*([^\s\n*])/g, "*$1:* $2");

  return content;
}

function assembleCouplesReport(params: {
  nameA: string;
  nameB: string;
  call1Json: Record<string, unknown> | null;
  call2Content: string;
  scoreTable: string;
}): string {
  const { nameA, nameB, call1Json, call2Content, scoreTable } = params;

  type Item = { element?: string; dimension?: string; meaning?: string; framing?: string; dailyLife?: string; showsUpAs?: string };

  const chemistry = (call1Json?.chemistrySignature || {}) as { portrait?: string; headlineTraits?: string[] };
  const overlap = (call1Json?.overlap || {}) as { narrative?: string; items?: Item[] };
  const divergence = (call1Json?.divergence || {}) as { narrative?: string; items?: Item[] };
  const metaThinking = (call1Json?.metaThinking || {}) as { narrative?: string; biggestGaps?: Item[] };
  const values = (call1Json?.values || {}) as { narrative?: string; specialFlags?: string[] };
  const emotion = (call1Json?.emotion || {}) as { pattern?: string; narrative?: string; flags?: string[] };
  const partnerBriefs = (call1Json?.partnerBriefs || {}) as { A?: string; B?: string };

  let content = `# Couples Compatibility Report

**${nameA} & ${nameB}**

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
  if (Array.isArray(overlap.items) && overlap.items.length > 0) {
    for (const item of overlap.items) {
      if (item.element) content += `### ${item.element}\n\n${item.meaning || ""}\n\n`;
    }
  }

  content += `---\n\n## Where You Diverge\n\n${divergence.narrative || ""}\n\n`;
  if (Array.isArray(divergence.items) && divergence.items.length > 0) {
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

  // Partner briefs (optional, from brief: "How each of you connects in a partnership")
  if (partnerBriefs.A || partnerBriefs.B) {
    content += `---\n\n## A Note to Each of You\n\n`;
    if (partnerBriefs.A) content += `### ${nameA}\n\n${partnerBriefs.A}\n\n`;
    if (partnerBriefs.B) content += `### ${nameB}\n\n${partnerBriefs.B}\n\n`;
  }

  // Call 2 content: sections 7-11 as markdown
  if (call2Content) {
    content += `---\n\n${call2Content}\n`;
  }

  // Section 12: Methodology and Sources
  content += `\n---\n\n## Methodology and Sources\n\nThis report is grounded in six bodies of research:\n\n- **Gottman Institute** — 40+ years of longitudinal couples research. The Four Horsemen (criticism, contempt, defensiveness, stonewalling), the 5-to-1 positive-to-negative ratio in conflict, bids for connection, the 20-minute physiological break.\n- **Sue Johnson, Emotionally Focused Therapy** — adult attachment bonds, demand-withdraw cycles, the A.R.E. framework (Accessible, Responsive, Engaged).\n- **Adult Attachment Theory** (Bowlby, Ainsworth, Hazan and Shaver, Levine and Heller) — secure, anxious, avoidant, and disorganized styles. Earned security.\n- **Self-Determination Theory** (Deci and Ryan) — autonomy, competence, and relatedness as the foundations of thriving.\n- **Terri Orbuch's 26-year Early Years of Marriage study** — affective affirmation as the strongest predictor of long-term satisfaction.\n- **Divorce longitudinal research** (Amato, Wilcox, Stanley and Rhoades, Hawkins) — the most-cited reasons relationships end, and the "sliding versus deciding" effect.\n- **Positive Psychology** (Seligman, Fredrickson, Gable) — capitalization (how partners respond to good news) and shared meaning as resilience factors.\n\nThe Opinion DNA assessment itself was designed in consultation with academic psychologists and behavioral scientists from Royal Holloway, Oxford, Cambridge, University of Pennsylvania, City University, and NYU.\n\n**What this report does:** it names patterns suggested by two psychometric profiles and offers concrete practices to work with those patterns. It's a structured mirror.\n\n**What this report does not do:** it does not diagnose, score the relationship, predict outcomes, or tell you whether you should stay together. The reader always has agency over the interpretation.\n\n`;

  // 48 Dimensions comparison
  content += `---\n\n## All 48 Dimensions Compared\n\n${scoreTable}\n\n`;

  content += `---\n\n*opiniondna.com*`;

  // Post-process: fix missing space after bold/italic labels
  content = content.replace(/\*\*([^*]+):\*\*([^\s\n])/g, "**$1:** $2");
  content = content.replace(/\*([^*]+):\*([^\s\n*])/g, "*$1:* $2");

  return content;
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
