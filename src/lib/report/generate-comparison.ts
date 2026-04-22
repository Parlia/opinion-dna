import type { SupabaseClient } from "@supabase/supabase-js";
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
import { sendScorecardEmail, type ReportRelationshipType } from "@/lib/email/scorecard";

type Admin = SupabaseClient;

/**
 * Comparison reports use Opus 4.7 — the richness/nuance of a cofounder or
 * couples read lands differently with Opus than with Sonnet, and the output
 * length fits within the streaming window.
 */
const LLM_OPTIONS = { model: "claude-opus-4-7", maxTokens: 16000 } as const;

/**
 * Pick the name Claude should use when addressing the user. Prefers the
 * user-supplied preferred_name; otherwise passes full_name through. We
 * intentionally don't auto-shorten full_name here — doing so produces
 * worse output for names whose first token is an initial ("J. Paul
 * Neeley" → "J."). Users who want a specific short form set preferred_name
 * at signup or in Settings.
 */
function resolveDisplayName(
  profile: { full_name?: string | null; preferred_name?: string | null } | null,
  fallback: string,
): string {
  return (
    profile?.preferred_name?.trim() ||
    profile?.full_name?.trim() ||
    fallback
  );
}

/**
 * Anything older than this in `status: "generating"` is assumed to be a dead
 * lambda (Vercel kills us at maxDuration = 800s on Fluid Compute). 14 min
 * leaves a small buffer past the timeout so in-flight runs aren't reaped.
 * The generation pipeline rewrites stale rows to `failed` before starting a
 * new attempt, so the UI stops claiming "still generating" for runs that
 * will never complete.
 */
export const STALE_GENERATING_MS = 14 * 60 * 1000;

export interface GenerateComparisonParams {
  inviteId: string;
  relationshipType: ReportRelationshipType;
  /** Optional — looked up by (invite, type) if not provided. */
  selectionId?: string;
}

export interface GenerateComparisonResult {
  reportId: string;
  status: "completed" | "failed";
  score: number;
}

/**
 * Generate a comparison report end-to-end: fetch scores, compute compatibility,
 * make Claude calls, assemble markdown, persist, send scorecard emails.
 *
 * Called from both the HTTP route (user-triggered) and the rescue script
 * (operator recovery when the lambda timed out). The HTTP route is bounded
 * by `maxDuration`; the script is not, which is why we extracted this.
 *
 * Pre-conditions the caller must verify:
 *  - invite exists, status=accepted, both participants present
 *  - both users have a user_scores row
 *  - for paid types: a completed purchase exists on the selection
 *
 * The lib sweeps its own stale "generating" reports so a second attempt after
 * a timeout doesn't leave orphans.
 */
export async function generateComparisonReport(
  admin: Admin,
  params: GenerateComparisonParams,
): Promise<GenerateComparisonResult> {
  const { inviteId, relationshipType } = params;

  const { data: invite } = await admin
    .from("invites")
    .select("*")
    .eq("id", inviteId)
    .eq("status", "accepted")
    .single();
  if (!invite) throw new Error(`Invite not found or not accepted: ${inviteId}`);

  // Resolve selection if caller didn't hand us the id
  let selectionId = params.selectionId;
  if (!selectionId) {
    const { data: sel } = await admin
      .from("comparison_selections")
      .select("id")
      .eq("invite_id", inviteId)
      .eq("relationship_type", relationshipType)
      .single();
    selectionId = sel?.id;
  }

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
    throw new Error("Both partners must complete the assessment");
  }

  const { data: profileFrom } = await admin
    .from("profiles")
    .select("full_name, preferred_name")
    .eq("id", invite.from_user_id)
    .single();
  const { data: profileTo } = await admin
    .from("profiles")
    .select("full_name, preferred_name")
    .eq("id", invite.to_user_id)
    .single();
  // Prefer preferred_name (how the user asked to be addressed) over full_name
  // for Claude's second-person briefs. Fall back to the first token of
  // full_name so long names aren't used as direct address ("J. Paul Neeley,
  // here's what to know..." reads formally and wrong).
  const nameA = resolveDisplayName(profileFrom, "Partner A");
  const nameB = resolveDisplayName(profileTo, "Partner B");

  const compatibility = computeCompatibility(scoresFrom.scores, scoresTo.scores);

  // Mark older stuck "generating" attempts for this pair + type as failed so
  // they stop blocking the UI. Only rows older than STALE_GENERATING_MS get
  // touched — we don't want to clobber a concurrent attempt.
  const staleThreshold = new Date(Date.now() - STALE_GENERATING_MS).toISOString();
  await admin
    .from("reports")
    .update({ status: "failed" })
    .eq("type", "comparison")
    .eq("relationship_type", relationshipType)
    .eq("user_id", invite.from_user_id)
    .eq("comparison_user_id", invite.to_user_id)
    .eq("status", "generating")
    .lt("updated_at", staleThreshold);

  const { data: report } = await admin
    .from("reports")
    .insert({
      user_id: invite.from_user_id,
      type: "comparison",
      relationship_type: relationshipType,
      status: "generating",
      scores_snapshot: scoresFrom.scores,
      comparison_user_id: invite.to_user_id,
      comparison_scores_snapshot: scoresTo.scores,
    })
    .select("id")
    .single();
  if (!report) throw new Error("Failed to create report row");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    await admin.from("reports").update({ status: "failed" }).eq("id", report.id);
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  try {
    let content: string;

    if (relationshipType === "friends") {
      content = await generateFriendsContent({
        apiKey,
        nameA,
        nameB,
        scoresA: scoresFrom.scores,
        scoresB: scoresTo.scores,
        compatibility,
      });
    } else if (relationshipType === "couples") {
      content = await generateCouplesContent({
        apiKey,
        nameA,
        nameB,
        scoresA: scoresFrom.scores,
        scoresB: scoresTo.scores,
        compatibility,
      });
    } else {
      content = await generateCofoundersContent({
        apiKey,
        nameA,
        nameB,
        scoresA: scoresFrom.scores,
        scoresB: scoresTo.scores,
        compatibility,
      });
    }

    await admin
      .from("reports")
      .update({ content, status: "completed" })
      .eq("id", report.id);

    if (selectionId) {
      await admin
        .from("comparison_selections")
        .update({ report_id: report.id, compatibility_score: compatibility.score })
        .eq("id", selectionId);
    }
    await admin
      .from("invites")
      .update({
        comparison_report_id: report.id,
        compatibility_score: compatibility.score,
      })
      .eq("id", inviteId);

    // Scorecard emails — failures are swallowed so an email outage never
    // breaks report delivery. Top strengths / friction only apply to the
    // cofounders flow; friends and couples pass empty values.
    const topStrengths =
      relationshipType === "cofounders"
        ? compatibility.factorScores
            .filter((f) => f.score >= 60)
            .slice(0, 3)
            .map((f) => f.name)
        : [];
    const topFriction =
      relationshipType === "cofounders"
        ? compatibility.factorScores.find((f) => f.score < 60)?.name ?? "No significant gaps"
        : "";

    await sendScorecardEmailsToBoth({
      admin,
      fromUserId: invite.from_user_id,
      toUserId: invite.to_user_id,
      nameA,
      nameB,
      reportId: report.id,
      compatibilityScore: compatibility.score,
      label: compatibility.label,
      topStrengths,
      topFriction,
      relationshipType,
    });

    return { reportId: report.id, status: "completed", score: compatibility.score };
  } catch (err) {
    await admin.from("reports").update({ status: "failed" }).eq("id", report.id);
    throw err;
  }
}

async function generateFriendsContent(params: {
  apiKey: string;
  nameA: string;
  nameB: string;
  scoresA: number[];
  scoresB: number[];
  compatibility: ReturnType<typeof computeCompatibility>;
}): Promise<string> {
  const { apiKey, nameA, nameB, scoresA, scoresB, compatibility } = params;

  let call1Json: Record<string, unknown> | null = null;
  let call1Analysis: string;
  try {
    const raw = await streamClaude(
      apiKey,
      buildFriendsCall1SystemPrompt(),
      buildFriendsCall1UserPrompt(nameA, nameB, scoresA, scoresB, compatibility),
      LLM_OPTIONS,
    );
    call1Json = extractJSON(raw);
    call1Analysis = JSON.stringify(call1Json, null, 2);
  } catch (err) {
    console.error("Friends Call 1 parse failed, retrying:", err);
    try {
      const retryRaw = await streamClaude(
        apiKey,
        buildFriendsCall1SystemPrompt(),
        buildFriendsCall1UserPrompt(nameA, nameB, scoresA, scoresB, compatibility),
        LLM_OPTIONS,
      );
      call1Json = extractJSON(retryRaw);
      call1Analysis = JSON.stringify(call1Json, null, 2);
    } catch (retryErr) {
      console.error("Friends Call 1 retry failed:", retryErr);
      call1Analysis =
        retryErr instanceof LLMParseError ? retryErr.rawResponse : "Analysis unavailable.";
    }
  }

  let call2Content = "";
  try {
    call2Content = await streamClaude(
      apiKey,
      buildFriendsCall2SystemPrompt(),
      buildFriendsCall2UserPrompt(nameA, nameB, scoresA, scoresB, call1Analysis),
      LLM_OPTIONS,
    );
  } catch (err) {
    console.error("Friends Call 2 failed:", err);
  }

  const scoreTable = buildComparisonScoreTable(scoresA, scoresB, nameA, nameB);
  return assembleFriendsReport({ nameA, nameB, call1Json, call2Content, scoreTable });
}

async function generateCouplesContent(params: {
  apiKey: string;
  nameA: string;
  nameB: string;
  scoresA: number[];
  scoresB: number[];
  compatibility: ReturnType<typeof computeCompatibility>;
}): Promise<string> {
  const { apiKey, nameA, nameB, scoresA, scoresB, compatibility } = params;

  let call1Json: Record<string, unknown> | null = null;
  let call1Analysis: string;
  try {
    const raw = await streamClaude(
      apiKey,
      buildCouplesCall1SystemPrompt(),
      buildCouplesCall1UserPrompt(nameA, nameB, scoresA, scoresB, PARLIA_AVERAGES, compatibility),
      LLM_OPTIONS,
    );
    call1Json = extractJSON(raw);
    call1Analysis = JSON.stringify(call1Json, null, 2);
  } catch (err) {
    console.error("Couples Call 1 parse failed, retrying:", err);
    try {
      const retryRaw = await streamClaude(
        apiKey,
        buildCouplesCall1SystemPrompt(),
        buildCouplesCall1UserPrompt(nameA, nameB, scoresA, scoresB, PARLIA_AVERAGES, compatibility),
        LLM_OPTIONS,
      );
      call1Json = extractJSON(retryRaw);
      call1Analysis = JSON.stringify(call1Json, null, 2);
    } catch (retryErr) {
      console.error("Couples Call 1 retry failed:", retryErr);
      call1Analysis =
        retryErr instanceof LLMParseError ? retryErr.rawResponse : "Analysis unavailable.";
    }
  }

  let call2Content = "";
  try {
    call2Content = await streamClaude(
      apiKey,
      buildCouplesCall2SystemPrompt(),
      buildCouplesCall2UserPrompt(nameA, nameB, scoresA, scoresB, call1Analysis),
      LLM_OPTIONS,
    );
  } catch (err) {
    console.error("Couples Call 2 failed:", err);
  }

  const scoreTable = buildComparisonScoreTable(scoresA, scoresB, nameA, nameB);
  return assembleCouplesReport({ nameA, nameB, call1Json, call2Content, scoreTable });
}

async function generateCofoundersContent(params: {
  apiKey: string;
  nameA: string;
  nameB: string;
  scoresA: number[];
  scoresB: number[];
  compatibility: ReturnType<typeof computeCompatibility>;
}): Promise<string> {
  const { apiKey, nameA, nameB, scoresA, scoresB, compatibility } = params;

  let call1Json: Record<string, unknown> | null = null;
  let call1Analysis: string;
  try {
    const raw = await streamClaude(
      apiKey,
      buildCall1SystemPrompt(),
      buildCall1UserPrompt(nameA, nameB, scoresA, scoresB, PARLIA_AVERAGES, compatibility),
      LLM_OPTIONS,
    );
    call1Json = extractJSON(raw);
    call1Analysis = JSON.stringify(call1Json, null, 2);
  } catch (err) {
    console.error("Cofounders Call 1 parse failed, retrying:", err);
    try {
      const retryRaw = await streamClaude(
        apiKey,
        buildCall1SystemPrompt(),
        buildCall1UserPrompt(nameA, nameB, scoresA, scoresB, PARLIA_AVERAGES, compatibility),
        LLM_OPTIONS,
      );
      call1Json = extractJSON(retryRaw);
      call1Analysis = JSON.stringify(call1Json, null, 2);
    } catch (retryErr) {
      console.error("Cofounders Call 1 retry failed:", retryErr);
      call1Analysis =
        retryErr instanceof LLMParseError ? retryErr.rawResponse : "Analysis unavailable.";
    }
  }

  let call2Content = "";
  try {
    call2Content = await streamClaude(
      apiKey,
      buildCall2SystemPrompt(),
      buildCall2UserPrompt(nameA, nameB, scoresA, scoresB, call1Analysis),
      LLM_OPTIONS,
    );
  } catch (err) {
    console.error("Cofounders Call 2 failed:", err);
  }

  const analysisData = call1Json as Record<string, unknown> | null;
  const successFactors = (analysisData?.successFactors || []) as Array<Record<string, unknown>>;
  const overallNarrative = (analysisData?.overallNarrative || "") as string;
  const scoreRationale = (analysisData?.scoreRationale || "") as string;
  const partnerBriefA = (analysisData?.partnerBriefA || "") as string;
  const partnerBriefB = (analysisData?.partnerBriefB || "") as string;
  const darkTriadInsights = (analysisData?.darkTriadInsights || []) as Array<Record<string, unknown>>;
  const aiBlindSpots = (analysisData?.blindSpots || []) as Array<Record<string, unknown>>;

  const sortedFactors = [...compatibility.factorScores].sort((a, b) => b.score - a.score);
  const alignedFactors = sortedFactors.filter((f) => f.score >= 60);
  const tensionFactors = sortedFactors.filter((f) => f.score < 60);

  // Per-factor renderer — this is the chunk that was missing from the old
  // assembly. The Call 1 JSON already contains superPower / watchOut / tip
  // per factor (see comparison-prompt.ts); the old lib was dropping all
  // three on the floor, leaving the rendered report looking thin.
  function renderFactor(factor: (typeof sortedFactors)[number]): string {
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
    if (strengths.length > 0) out += strengths.map((s) => `- ${s}`).join("\n") + "\n\n";
    if (risks.length > 0) out += risks.map((r) => `- ${r}`).join("\n") + "\n\n";
    if (superPower) out += `### Super Power\n\n${superPower}\n\n`;
    if (watchOut) out += `### Watch Out\n\n${watchOut}\n\n`;
    if (tip) out += `### Tip\n\n${tip}\n\n`;
    if (mitigation) out += `*${mitigation}*\n\n`;
    return out;
  }

  let content = `# Co-Founder Compatibility Report

**${nameA} & ${nameB}**

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

### ${nameA}, here's what to know about working with ${nameB}

${partnerBriefA}

### ${nameB}, here's what to know about working with ${nameA}

${partnerBriefB}

---

## Co-Founder Success Factors

`;

  if (alignedFactors.length > 0) {
    content += `### Where You Align\n\n`;
    for (const factor of alignedFactors) content += renderFactor(factor);
  }

  if (tensionFactors.length > 0) {
    content += `---\n\n### Where You'll Navigate Differences\n\n`;
    for (const factor of tensionFactors) content += renderFactor(factor);
  }

  if (compatibility.blindSpots.length > 0 || aiBlindSpots.length > 0) {
    content += `---\n\n## Your Blind Spots\n\nThese are patterns where both of you score similarly in extreme ranges. Neither partner naturally counterbalances the other.\n\n`;
    for (const bs of aiBlindSpots) {
      content += `**${bs.dimension}**\n\n${bs.pattern}\n\n*Implication:* ${bs.implication}\n\n*Protocol:* ${bs.protocol}\n\n`;
    }
    const aiDimensions = new Set(aiBlindSpots.map((b) => b.dimension));
    for (const bs of compatibility.blindSpots) {
      if (!aiDimensions.has(bs.dimensionName)) {
        content += `**${bs.dimensionName}**\n\n${bs.description}\n\n`;
      }
    }
  }

  // Under Pressure — combines the algorithm-derived stress tendencies with
  // the AI-derived dark triad insights (Strategic Instincts). The driving
  // scores tell the reader why the tendency was assigned to them, not just
  // what it is.
  content += `---\n\n## Under Pressure\n\nStartup stress reveals patterns that don't show up during the honeymoon phase. Based on your profiles, here's how each of you is likely to respond when things get hard, and what to do about it.\n\n`;

  function renderStressTendency(
    name: string,
    tendency: typeof compatibility.stressTendencyA,
  ): string {
    const driverList = tendency.drivingScores
      .map((d) => `${d.dimension}: ${d.score}`)
      .join(", ");
    let out = `### ${name}: ${tendency.name}\n\n`;
    out += `${tendency.description}\n\n`;
    out += `*Driven by: ${driverList}*\n\n`;
    out += `**Counter-strategy:** ${tendency.counterStrategy}\n\n`;
    return out;
  }

  content += renderStressTendency(nameA, compatibility.stressTendencyA);
  content += renderStressTendency(nameB, compatibility.stressTendencyB);

  if (darkTriadInsights.length > 0) {
    content += `### Strategic Instincts\n\nSome behavioral patterns carry both competitive advantages and partnership risks. These aren't weaknesses; they're sharp tools that need conscious management.\n\n`;
    for (const insight of darkTriadInsights) {
      const partnerLabel =
        insight.partner === "both"
          ? "Both partners"
          : insight.partner === "A"
            ? nameA
            : nameB;
      content += `**${insight.dimension}** (${partnerLabel})\n\n`;
      content += `**The edge:** ${insight.strength}\n\n`;
      content += `**The risk:** ${insight.risk}\n\n`;
      content += `**The protocol:** ${insight.mitigation}\n\n`;
    }
  }

  if (call2Content) {
    content += `---\n\n${call2Content}`;
  }

  // Heading only — the viewer renders a visual bar comparison from
  // scores_snapshot + comparison_scores_snapshot when it sees this section.
  content += `\n\n---\n\n## All 48 Dimensions Compared\n\n`;

  content += `\n\n---\n\n## What Now?\n\nThis report maps the terrain of your partnership. The score isn't a grade; it's a guide to where your natural alignment makes decisions easy and where intentional management will make the difference.\n\nThree things to do with this:\n\n**Have the conversations.** The conversation cards above are the most valuable part of this report. Sit down together and work through them. The ones that feel hardest are the ones that matter most.\n\n**Build the rituals.** The mitigation playbook gives you specific practices. Don't try to do all of them. Pick the one that addresses your biggest gap and commit to it for 30 days.\n\n**Come back to it.** Revisit this report after your first major disagreement. The patterns it describes will suddenly feel viscerally real, and the mitigations will make more sense in context.\n\n---\n\n*The Opinion DNA was designed in consultation with academic psychologists and behavioral scientists from the universities of Royal Holloway, Oxford, Cambridge, University of Pennsylvania, City University, and NYU.*\n\n*opiniondna.com*`;

  // Post-process: fix missing space after bold/italic labels when the LLM
  // emits them without a separating space. e.g. **The risk:**Text → **The risk:** Text
  content = content.replace(/\*\*([^*]+):\*\*([^\s\n])/g, "**$1:** $2");
  content = content.replace(/\*([^*]+):\*([^\s\n*])/g, "*$1:* $2");

  return content;
}

async function sendScorecardEmailsToBoth(params: {
  admin: Admin;
  fromUserId: string;
  toUserId: string;
  nameA: string;
  nameB: string;
  reportId: string;
  compatibilityScore: number;
  label: string;
  topStrengths: string[];
  topFriction: string;
  relationshipType: ReportRelationshipType;
}) {
  try {
    const { data: userFrom } = await params.admin.auth.admin.getUserById(params.fromUserId);
    const { data: userTo } = await params.admin.auth.admin.getUserById(params.toUserId);

    if (userFrom?.user?.email) {
      await sendScorecardEmail(
        userFrom.user.email,
        params.nameB,
        params.reportId,
        params.compatibilityScore,
        params.label,
        params.topStrengths,
        params.topFriction,
        params.relationshipType,
      ).catch((err) => console.error("Scorecard email to A failed:", err));
    }

    if (userTo?.user?.email) {
      await sendScorecardEmail(
        userTo.user.email,
        params.nameA,
        params.reportId,
        params.compatibilityScore,
        params.label,
        params.topStrengths,
        params.topFriction,
        params.relationshipType,
      ).catch((err) => console.error("Scorecard email to B failed:", err));
    }
  } catch (err) {
    console.error("Scorecard email dispatch failed:", err);
  }
}

function assembleFriendsReport(params: {
  nameA: string;
  nameB: string;
  call1Json: Record<string, unknown> | null;
  call2Content: string;
  scoreTable: string;
}): string {
  const { nameA, nameB, call1Json, call2Content, scoreTable } = params;

  type Item = {
    element?: string;
    dimension?: string;
    meaning?: string;
    framing?: string;
    fromBothSides?: string;
    showsUpAs?: string;
  };

  const signature = (call1Json?.friendshipSignature || {}) as {
    portrait?: string;
    headlineTraits?: string[];
  };
  const align = (call1Json?.align || {}) as { narrative?: string; items?: Item[] };
  const diverge = (call1Json?.diverge || {}) as { narrative?: string; items?: Item[] };
  const howYouThink = (call1Json?.howYouThink || {}) as {
    narrative?: string;
    keyComparisons?: Item[];
  };
  const whatYouValue = (call1Json?.whatYouValue || {}) as {
    narrative?: string;
    topAlignments?: string[];
    topDivergences?: string[];
  };
  const emotionalRhythm = (call1Json?.emotionalRhythm || {}) as {
    pattern?: string;
    narrative?: string;
  };

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
      const framingLabel =
        item.framing === "complementary"
          ? "Complementary"
          : item.framing === "friction"
            ? "Worth noticing"
            : item.framing === "both"
              ? "Complementary and worth noticing"
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

  content += `\n---\n\n## All 48 Dimensions Compared\n\n${scoreTable}\n\n`;

  content += `---\n\n## What Now?\n\nThis report is a mirror, not a verdict. It's most useful when you read it together and notice what rings true, what surprises you, and what you want to talk about.\n\nThree things to do with it:\n\n**Pick one conversation.** The prompts above are the most concrete thing here. Pick one from the Deeper or Hard tier and have it this week. The hardest ones are usually the ones that matter most.\n\n**Choose one stay-close ritual.** Don't try to adopt the whole playbook. Pick one practice from the Repair and Stay-Close section and commit to it for the next month. Jeffrey Hall's research is clear: passive friendship decays, active maintenance compounds.\n\n**Come back to it.** Revisit this report the next time one of you hits a life transition (a move, a new job, a demanding season). The patterns in the Drift and Transitions Compass will land differently when the situation is real.\n\n`;

  content += `---\n\n## Methodology and Sources\n\nThis report is grounded in seven bodies of research on friendship:\n\n- **Robin Dunbar** — the layered model of friendship (1.5 intimates, 5 close confidants, 15 good friends, 150 casual, 500 acquaintances). Friendships move inward by shared time and drift outward when that investment drops.\n- **Jeffrey Hall** — the hours of friendship. Roughly 50 hours to move from acquaintance to casual friend, 90 to real friend, 200 to close friend. Close friends decline by roughly half every seven adult years without active maintenance.\n- **Marisa Franco** — *Platonic*, friendship attachment, the power of active initiation as the cheapest friendship-lengthening behavior.\n- **William Rawlins** — the dialectical tensions of friendship: independence vs dependence, affection vs instrumentality, judgment vs acceptance. Lasting friendships keep renegotiating these.\n- **Shasta Nelson** — the three pillars of frientimacy: positivity, consistency, vulnerability.\n- **John Gottman** (adapted to friendship) — the Four Horsemen, the 5-to-1 positive-to-negative ratio, bids for connection, known-ness.\n- **Julianne Holt-Lunstad and John Cacioppo** — the health stakes of social connection. Social isolation is roughly as lethal as smoking. Quality matters more than quantity.\n\nThe Opinion DNA assessment itself was designed in consultation with academic psychologists and behavioral scientists from Royal Holloway, Oxford, Cambridge, University of Pennsylvania, City University, and NYU.\n\n**What this report does:** it names patterns suggested by two psychometric profiles and offers concrete practices to work with those patterns.\n\n**What this report does not do:** it does not diagnose, score the friendship, predict outcomes, or tell you whether to stay close. The reader always has agency over the interpretation.\n\n`;

  content += `---\n\n*opiniondna.com*`;

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

  type Item = {
    element?: string;
    dimension?: string;
    meaning?: string;
    framing?: string;
    dailyLife?: string;
    showsUpAs?: string;
  };

  const chemistry = (call1Json?.chemistrySignature || {}) as {
    portrait?: string;
    headlineTraits?: string[];
  };
  const overlap = (call1Json?.overlap || {}) as { narrative?: string; items?: Item[] };
  const divergence = (call1Json?.divergence || {}) as { narrative?: string; items?: Item[] };
  const metaThinking = (call1Json?.metaThinking || {}) as {
    narrative?: string;
    biggestGaps?: Item[];
  };
  const values = (call1Json?.values || {}) as { narrative?: string; specialFlags?: string[] };
  const emotion = (call1Json?.emotion || {}) as {
    pattern?: string;
    narrative?: string;
    flags?: string[];
  };
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
      const framingLabel =
        item.framing === "complementary"
          ? "Complementary"
          : item.framing === "friction"
            ? "Worth noticing"
            : item.framing === "both"
              ? "Complementary and worth noticing"
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
    if (partnerBriefs.A) content += `### ${nameA}\n\n${partnerBriefs.A}\n\n`;
    if (partnerBriefs.B) content += `### ${nameB}\n\n${partnerBriefs.B}\n\n`;
  }

  if (call2Content) {
    content += `---\n\n${call2Content}\n`;
  }

  content += `\n---\n\n## All 48 Dimensions Compared\n\n${scoreTable}\n\n`;

  content += `---\n\n## What Now?\n\nThis report maps the terrain of your relationship. It's a mirror, not a verdict, and it works best when you read it together and let it start conversations.\n\nThree things to do with it:\n\n**Have the conversations.** The Conversation Cards and Conversation Prompts above are the most valuable part of this report. Sit down together and work through the ones that feel most alive. The hardest are usually the ones that matter most.\n\n**Build one ritual.** The Relationship Playbook and the Conflict and Repair Guide give you specific practices. Don't try to adopt all of them. Pick the one that addresses your biggest pattern and commit to it for 30 days. Gottman's research is clear: consistency beats intensity.\n\n**Come back to it.** Revisit this report after your first real disagreement or your next big life transition. The patterns described here will suddenly feel viscerally true, and the practices will make more sense in context.\n\n`;

  content += `---\n\n## Methodology and Sources\n\nThis report is grounded in six bodies of research:\n\n- **Gottman Institute** — 40+ years of longitudinal couples research. The Four Horsemen (criticism, contempt, defensiveness, stonewalling), the 5-to-1 positive-to-negative ratio in conflict, bids for connection, the 20-minute physiological break.\n- **Sue Johnson, Emotionally Focused Therapy** — adult attachment bonds, demand-withdraw cycles, the A.R.E. framework (Accessible, Responsive, Engaged).\n- **Adult Attachment Theory** (Bowlby, Ainsworth, Hazan and Shaver, Levine and Heller) — secure, anxious, avoidant, and disorganized styles. Earned security.\n- **Self-Determination Theory** (Deci and Ryan) — autonomy, competence, and relatedness as the foundations of thriving.\n- **Terri Orbuch's 26-year Early Years of Marriage study** — affective affirmation as the strongest predictor of long-term satisfaction.\n- **Divorce longitudinal research** (Amato, Wilcox, Stanley and Rhoades, Hawkins) — the most-cited reasons relationships end, and the "sliding versus deciding" effect.\n- **Positive Psychology** (Seligman, Fredrickson, Gable) — capitalization (how partners respond to good news) and shared meaning as resilience factors.\n\nThe Opinion DNA assessment itself was designed in consultation with academic psychologists and behavioral scientists from Royal Holloway, Oxford, Cambridge, University of Pennsylvania, City University, and NYU.\n\n**What this report does:** it names patterns suggested by two psychometric profiles and offers concrete practices to work with those patterns. It's a structured mirror.\n\n**What this report does not do:** it does not diagnose, score the relationship, predict outcomes, or tell you whether you should stay together. The reader always has agency over the interpretation.\n\n`;

  content += `---\n\n*opiniondna.com*`;

  content = content.replace(/\*\*([^*]+):\*\*([^\s\n])/g, "**$1:** $2");
  content = content.replace(/\*([^*]+):\*([^\s\n*])/g, "*$1:* $2");

  return content;
}

function buildComparisonScoreTable(
  scoresA: number[],
  scoresB: number[],
  nameA: string,
  nameB: string,
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
