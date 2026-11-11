import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendQuizNudgeEmail, sendResultsReadyEmail } from "@/lib/email/resend";
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

// Supabase returns at most 1000 rows per request; page through recent answers.
const PAGE_SIZE = 1000;
const MAX_PAGES = 200;

/**
 * GET /api/cron/quiz-nudge — invoked daily by Vercel Cron (see vercel.json).
 *
 * The quiz is free, so this covers everyone with an account, paid or not.
 * Each user gets at most ONE of these, ever:
 *
 *   - started the quiz, stalled for 3+ days  -> "your progress is saved"
 *   - finished the quiz, hasn't paid, 3+ days -> "your results are waiting"
 *
 * profiles.quiz_nudge_sent_at is the idempotency claim (migration 022) for
 * both: it's set via conditional update BEFORE sending, so a crash mid-run
 * can skip an email but never double-send.
 */
export async function GET(request: Request) {
  // Vercel sends `Authorization: Bearer ${CRON_SECRET}` when the env var is
  // set on the project. Refuse to run without the secret configured.
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();

  // Most recent quiz activity per user, among answers touched inside the
  // 60-day window. Anyone with no activity in the window is too dormant.
  const windowStart = new Date(now - MAX_AGE_MS).toISOString();
  const lastActive = new Map<string, number>();
  for (let page = 0; page < MAX_PAGES; page++) {
    const { data, error } = await admin
      .from("quiz_responses")
      .select("user_id, updated_at")
      .gte("updated_at", windowStart)
      .order("updated_at", { ascending: true })
      .order("id", { ascending: true })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (error) {
      console.error("[cron:quiz-nudge] quiz_responses query failed:", error);
      return NextResponse.json({ error: "quiz_responses query failed" }, { status: 500 });
    }
    for (const r of data ?? []) {
      const t = new Date(r.updated_at).getTime();
      if (t > (lastActive.get(r.user_id) ?? 0)) lastActive.set(r.user_id, t);
    }
    if (!data || data.length < PAGE_SIZE) break;
  }

  const staleIds = [...lastActive]
    .filter(([, t]) => now - t >= STALE_AFTER_MS)
    .map(([id]) => id);
  if (staleIds.length === 0) return NextResponse.json({ sent: 0 });

  // Exclude users whose scores are unlocked (they have user_scores).
  const { data: scored } = await admin
    .from("user_scores")
    .select("user_id")
    .in("user_id", staleIds);
  const scoredIds = new Set((scored ?? []).map((s) => s.user_id));
  const candidateIds = staleIds.filter((id) => !scoredIds.has(id));
  if (candidateIds.length === 0) return NextResponse.json({ sent: 0 });

  // Exclude internal/test accounts and anyone already nudged. If migration
  // 022 isn't applied yet the select errors — bail rather than risk repeats.
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

  const { data: purchases, error: purchasesError } = await admin
    .from("purchases")
    .select("user_id")
    .eq("status", "completed")
    .in("user_id", eligible.map((p) => p.id));
  if (purchasesError) {
    console.error("[cron:quiz-nudge] purchases query failed:", purchasesError);
    return NextResponse.json({ error: "purchases query failed" }, { status: 500 });
  }
  const paidIds = new Set((purchases ?? []).map((p) => p.user_id));

  let sent = 0;
  let sentResultsReady = 0;

  for (const profile of eligible) {
    // Full answer count (the window above may not cover older answers).
    const { count } = await admin
      .from("quiz_responses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id);
    const answered = count ?? 0;
    if (answered < MIN_ANSWERS) continue;

    const finished = answered >= QUESTIONS.length;
    // Finished and paid: their scores unlock the next time they visit, and
    // they have nothing left to be nudged about.
    if (finished && paidIds.has(profile.id)) continue;

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

    const name = profile.preferred_name?.trim() || profile.full_name?.trim() || "";
    if (finished) {
      await sendResultsReadyEmail(email, name);
      sentResultsReady += 1;
    } else {
      await sendQuizNudgeEmail(email, name, answered, QUESTIONS.length);
    }
    sent += 1;
  }

  return NextResponse.json({ sent, sentResultsReady, considered: eligible.length });
}
