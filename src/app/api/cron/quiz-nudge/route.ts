import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendQuizNudgeEmail } from "@/lib/email/resend";
import { QUESTIONS } from "@/lib/scoring/questions";

export const dynamic = "force-dynamic";

// Users must have answered at least this many questions to get a nudge —
// below that they barely started and "you're 2% there" isn't motivating.
const MIN_ANSWERS = 5;
// Quiet window: only nudge after this much inactivity...
const STALE_AFTER_MS = 3 * 24 * 3600_000;
// ...but not if the account has been dormant longer than this. A one-time
// email to someone who stalled months ago reads as spam, not help.
const MAX_AGE_MS = 60 * 24 * 3600_000;

/**
 * GET /api/cron/quiz-nudge — invoked daily by Vercel Cron (see vercel.json).
 *
 * Finds paid users who started the quiz, stalled for 3+ days, and never
 * submitted, then sends each a one-time "your progress is saved" email.
 * profiles.quiz_nudge_sent_at is the idempotency claim (migration 022):
 * it's set via conditional update BEFORE sending, so a crash mid-run can
 * skip an email but never double-send.
 */
export async function GET(request: Request) {
  // Vercel sends `Authorization: Bearer ${CRON_SECRET}` when the env var is
  // set on the project. Refuse to run without the secret configured.
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Paid users (any completed purchase — same gate the quiz itself uses).
  const { data: purchases, error: purchasesError } = await admin
    .from("purchases")
    .select("user_id")
    .eq("status", "completed");
  if (purchasesError) {
    console.error("[cron:quiz-nudge] purchases query failed:", purchasesError);
    return NextResponse.json({ error: "purchases query failed" }, { status: 500 });
  }
  const paidUserIds = [...new Set((purchases ?? []).map((p) => p.user_id))];
  if (paidUserIds.length === 0) return NextResponse.json({ sent: 0 });

  // Exclude users who already submitted (they have user_scores).
  const { data: scored } = await admin
    .from("user_scores")
    .select("user_id")
    .in("user_id", paidUserIds);
  const scoredIds = new Set((scored ?? []).map((s) => s.user_id));

  // Exclude internal/test accounts and anyone already nudged. If migration
  // 022 isn't applied yet the select errors — bail rather than risk repeats.
  const candidateIds = paidUserIds.filter((id) => !scoredIds.has(id));
  if (candidateIds.length === 0) return NextResponse.json({ sent: 0 });

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, full_name, preferred_name, is_internal, quiz_nudge_sent_at")
    .in("id", candidateIds);
  if (profilesError) {
    console.error("[cron:quiz-nudge] profiles query failed (is migration 022 applied?):", profilesError);
    return NextResponse.json({ error: "profiles query failed" }, { status: 500 });
  }

  const eligible = (profiles ?? []).filter(
    (p) => !p.is_internal && !p.quiz_nudge_sent_at,
  );
  if (eligible.length === 0) return NextResponse.json({ sent: 0 });

  // Per-user progress: answer count + most recent activity.
  const { data: responses } = await admin
    .from("quiz_responses")
    .select("user_id, updated_at")
    .in("user_id", eligible.map((p) => p.id));

  const progress = new Map<string, { count: number; lastActive: number }>();
  for (const r of responses ?? []) {
    const entry = progress.get(r.user_id) ?? { count: 0, lastActive: 0 };
    entry.count += 1;
    entry.lastActive = Math.max(entry.lastActive, new Date(r.updated_at).getTime());
    progress.set(r.user_id, entry);
  }

  const now = Date.now();
  let sent = 0;

  for (const profile of eligible) {
    const p = progress.get(profile.id);
    if (!p || p.count < MIN_ANSWERS || p.count >= QUESTIONS.length) continue;
    const idle = now - p.lastActive;
    if (idle < STALE_AFTER_MS || idle > MAX_AGE_MS) continue;

    // Atomic claim before sending — never double-send.
    const { data: claimed } = await admin
      .from("profiles")
      .update({ quiz_nudge_sent_at: new Date().toISOString() })
      .eq("id", profile.id)
      .is("quiz_nudge_sent_at", null)
      .select("id");
    if (!claimed || claimed.length === 0) continue;

    const { data: authUser } = await admin.auth.admin.getUserById(profile.id);
    const email = authUser.user?.email;
    if (!email) continue;

    await sendQuizNudgeEmail(
      email,
      profile.preferred_name?.trim() || profile.full_name?.trim() || "",
      p.count,
      QUESTIONS.length,
    );
    sent += 1;
  }

  return NextResponse.json({ sent, considered: eligible.length });
}
