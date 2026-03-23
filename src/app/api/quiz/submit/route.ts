import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateScores } from "@/lib/scoring/engine";
import { QUESTIONS } from "@/lib/scoring/questions";
import { hasPurchase } from "@/lib/auth/require-purchase";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasPurchase(user.id))) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  const { answers: answersObj } = await request.json();

  // Convert object to Map with validation
  const answers = new Map<number, number>();
  for (const [key, value] of Object.entries(answersObj)) {
    const num = Number(value);
    if (!Number.isInteger(num) || num < 1 || num > 5) {
      return NextResponse.json({ error: "Invalid answer value" }, { status: 400 });
    }
    answers.set(Number(key), num);
  }

  // Validate all answers present
  if (answers.size !== QUESTIONS.length) {
    return NextResponse.json(
      { error: "Incomplete answers" },
      { status: 400 }
    );
  }

  // Calculate scores
  const scores = calculateScores(answers, QUESTIONS);

  // Use admin client for writing scores (RLS requires service_role)
  const admin = createAdminClient();

  // Save scores
  const { error: scoreError } = await admin
    .from("user_scores")
    .upsert(
      { user_id: user.id, scores },
      { onConflict: "user_id" }
    );

  if (scoreError) {
    console.error("Score save error:", scoreError.message);
    return NextResponse.json({ error: "Failed to save scores" }, { status: 500 });
  }

  // Update population averages
  await updatePopulationAverages(admin, scores);

  // Check for accepted invites where both partners now have scores.
  // If found, trigger comparison report generation in the background.
  triggerComparisonIfReady(user.id, admin).catch(err =>
    console.error("Comparison trigger error:", err)
  );

  return NextResponse.json({ scores });
}

/**
 * After quiz submission, check if this user is part of an accepted invite
 * where both partners have completed scores. If so, fire off comparison
 * report generation asynchronously (non-blocking).
 */
async function triggerComparisonIfReady(
  userId: string,
  admin: ReturnType<typeof createAdminClient>
) {
  // Find accepted invites where this user is the invitee
  const { data: invites } = await admin
    .from("invites")
    .select("id, from_user_id, to_user_id, comparison_report_id")
    .eq("to_user_id", userId)
    .eq("status", "accepted")
    .is("comparison_report_id", null);

  if (!invites || invites.length === 0) return;

  // For each invite, check if the inviter has scores
  for (const invite of invites) {
    const { data: partnerScores } = await admin
      .from("user_scores")
      .select("id")
      .eq("user_id", invite.from_user_id)
      .single();

    if (partnerScores) {
      // Both have scores — trigger comparison report generation
      // Fire-and-forget POST to our own compare endpoint
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
      try {
        // Use internal fetch — the user's auth cookie won't work here,
        // so we call the compare route using a service-level mechanism.
        // For now, we directly generate using the admin client.
        const { computeCompatibility } = await import("@/lib/scoring/compatibility");
        const { streamClaude } = await import("@/lib/report/claude-stream");
        const { extractJSON } = await import("@/lib/report/parse-json");
        const {
          buildCall1SystemPrompt,
          buildCall1UserPrompt,
          buildCall2SystemPrompt,
          buildCall2UserPrompt,
        } = await import("@/lib/report/comparison-prompt");
        const { sendScorecardEmail } = await import("@/lib/email/scorecard");
        const { PARLIA_AVERAGES, ELEMENTS } = await import("@/lib/scoring/elements");
        const { getScoreLevel } = await import("@/lib/scoring/engine");

        // Fetch full scores
        const { data: fromScores } = await admin
          .from("user_scores")
          .select("scores")
          .eq("user_id", invite.from_user_id)
          .single();
        const { data: toScores } = await admin
          .from("user_scores")
          .select("scores")
          .eq("user_id", userId)
          .single();

        if (!fromScores || !toScores) return;

        // Get names
        const { data: profileFrom } = await admin
          .from("profiles")
          .select("full_name")
          .eq("id", invite.from_user_id)
          .single();
        const { data: profileTo } = await admin
          .from("profiles")
          .select("full_name")
          .eq("id", userId)
          .single();

        const nameA = profileFrom?.full_name || "Partner A";
        const nameB = profileTo?.full_name || "Partner B";

        const compatibility = computeCompatibility(fromScores.scores, toScores.scores);

        // Create report record
        const { data: report } = await admin
          .from("reports")
          .insert({
            user_id: invite.from_user_id,
            type: "comparison",
            status: "generating",
            scores_snapshot: fromScores.scores,
            comparison_user_id: userId,
            comparison_scores_snapshot: toScores.scores,
          })
          .select("id")
          .single();

        if (!report) return;

        console.log(`[compare] Generating comparison report ${report.id} for invite ${invite.id}`);

        // This runs in the background — don't await the full generation
        // The compare route handles the full flow; here we just mark it as started
        // and update the invite reference
        await admin
          .from("invites")
          .update({ comparison_report_id: report.id })
          .eq("id", invite.id);

        // The actual AI generation will happen when either partner visits the report page
        // and the report is in "generating" status. For now, mark as pending.
        // TODO: In production, this should be a background job (Vercel cron or similar)
        console.log(`[compare] Report ${report.id} created. Score: ${compatibility.score}`);

      } catch (err) {
        console.error(`[compare] Failed to trigger for invite ${invite.id}:`, err);
      }
    }
  }
}

async function updatePopulationAverages(
  admin: ReturnType<typeof createAdminClient>,
  newScores: number[]
) {
  const { data: existing } = await admin
    .from("population_averages")
    .select("*")
    .limit(1)
    .single();

  if (existing) {
    const n = existing.sample_size;
    const newAverages = existing.averages.map(
      (avg: number, i: number) => Math.round((avg * n + newScores[i]) / (n + 1))
    );

    await admin
      .from("population_averages")
      .update({
        averages: newAverages,
        sample_size: n + 1,
      })
      .eq("id", existing.id);
  } else {
    await admin
      .from("population_averages")
      .insert({
        averages: newScores,
        sample_size: 1,
      });
  }
}
