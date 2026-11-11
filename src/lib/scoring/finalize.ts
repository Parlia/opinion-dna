import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateScores } from "./engine";
import { QUESTIONS } from "./questions";
import { PARLIA_AVERAGES } from "./elements";

/**
 * Free-quiz flow.
 *
 * Anyone with an account can answer the quiz. Their answers live in
 * quiz_responses, but the 48 scores are only written to user_scores once they
 * have paid. Until then the server computes scores on demand and hands the
 * client a small teaser, so the locked scores never reach the browser.
 *
 * Keeping user_scores "paid only" also means everything that treats a
 * user_scores row as "assessment complete" (reports, invites, comparisons)
 * keeps working unchanged.
 */

/** Request context needed to kick off comparison reports as the user. */
export interface RequestContext {
  origin: string;
  cookie: string;
}

export function requestContext(request: Request): RequestContext {
  return {
    origin:
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(request.url).origin,
    cookie: request.headers.get("cookie") || "",
  };
}

/** The user's saved answers, ignoring anything out of range. */
export async function loadSavedAnswers(
  client: SupabaseClient,
  userId: string,
): Promise<Map<number, number>> {
  const { data } = await client
    .from("quiz_responses")
    .select("question_index, answer")
    .eq("user_id", userId);

  const answers = new Map<number, number>();
  for (const row of (data ?? []) as { question_index: number; answer: number }[]) {
    const { question_index: index, answer } = row;
    if (!Number.isInteger(index) || index < 0 || index >= QUESTIONS.length) continue;
    if (!Number.isInteger(answer) || answer < 1 || answer > 5) continue;
    answers.set(index, answer);
  }
  return answers;
}

export function isQuizComplete(answers: Map<number, number>): boolean {
  return answers.size >= QUESTIONS.length;
}

// The Big 5 are shown free: they are the part of the profile people can get
// elsewhere, so giving them away costs little and shows the result is real.
const FREE_INDICES = [0, 1, 2, 3, 4];
const DISTINCTIVE_COUNT = 3;

export interface ScoreTeaser {
  /** element index -> score, for the handful of elements shown free */
  unlocked: Record<number, number>;
  /** element indices furthest from the population average, most extreme first */
  distinctive: number[];
  lockedCount: number;
}

export function buildTeaser(scores: number[]): ScoreTeaser {
  const distinctive = scores
    .map((score, index) => {
      const avg = PARLIA_AVERAGES[index];
      return { index, gap: avg === null || avg === undefined ? -1 : Math.abs(score - avg) };
    })
    .filter((s) => s.gap >= 0)
    .sort((a, b) => b.gap - a.gap || a.index - b.index)
    .slice(0, DISTINCTIVE_COUNT)
    .map((s) => s.index);

  const unlocked: Record<number, number> = {};
  for (const index of [...FREE_INDICES, ...distinctive]) {
    unlocked[index] = scores[index];
  }
  return {
    unlocked,
    distinctive,
    lockedCount: scores.length - Object.keys(unlocked).length,
  };
}

/**
 * Write scores to user_scores and run the follow-on work (population averages,
 * waiting comparison reports).
 *
 * overwrite: true  -> the paid submit path; a retake replaces the old scores.
 * overwrite: false -> the unlock path; only the first caller writes, so the
 *                     verify endpoint and the scores page can both call this
 *                     without counting the user twice in the averages.
 */
export async function finalizeScores(
  admin: SupabaseClient,
  userId: string,
  scores: number[],
  ctx: RequestContext,
  opts: { overwrite: boolean },
): Promise<{ ok: boolean }> {
  if (opts.overwrite) {
    const { error } = await admin
      .from("user_scores")
      .upsert({ user_id: userId, scores }, { onConflict: "user_id" });
    if (error) {
      console.error("Score save error:", error.message);
      return { ok: false };
    }
  } else {
    const { data, error } = await admin
      .from("user_scores")
      .upsert(
        { user_id: userId, scores },
        { onConflict: "user_id", ignoreDuplicates: true },
      )
      .select("user_id");
    if (error) {
      console.error("Score save error:", error.message);
      return { ok: false };
    }
    // Someone else already wrote the row: nothing more to do.
    if (!data || data.length === 0) return { ok: true };
  }

  await updatePopulationAverages(admin, scores);

  // Kick off any confirmed comparison_selections that were waiting on this
  // user's scores. Generation requires dual consent, so this is the only
  // trigger needed here; /api/invite/select-type covers the case where
  // confirmation lands after both users already have scores.
  triggerPendingSelections(userId, admin, ctx).catch((err) =>
    console.error("Pending selection trigger error:", err),
  );

  return { ok: true };
}

/**
 * For a user who has just paid: if their quiz is already complete, write
 * their scores now. Safe to call repeatedly.
 */
export async function unlockScoresIfReady(
  admin: SupabaseClient,
  userId: string,
  ctx: RequestContext,
): Promise<number[] | null> {
  const answers = await loadSavedAnswers(admin, userId);
  if (!isQuizComplete(answers)) return null;
  const scores = calculateScores(answers, QUESTIONS);
  const { ok } = await finalizeScores(admin, userId, scores, ctx, { overwrite: false });
  return ok ? scores : null;
}

/**
 * Find comparison_selections that are fully confirmed but haven't generated a
 * report yet, where the freshly-scored user is a participant and the other
 * party already has scores. Kick off report generation for each.
 */
async function triggerPendingSelections(
  userId: string,
  admin: SupabaseClient,
  ctx: RequestContext,
) {
  // Invites this user participates in (as sender or recipient).
  const { data: myInvites } = await admin
    .from("invites")
    .select("id, from_user_id, to_user_id, status")
    .eq("status", "accepted")
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);

  if (!myInvites || myInvites.length === 0) return;

  const inviteById = new Map<
    string,
    { id: string; from_user_id: string; to_user_id: string | null }
  >();
  for (const inv of myInvites as {
    id: string;
    from_user_id: string;
    to_user_id: string | null;
  }[]) {
    inviteById.set(inv.id, inv);
  }

  const { data: selections } = await admin
    .from("comparison_selections")
    .select("id, invite_id, relationship_type, confirmed_by, report_id")
    .in("invite_id", Array.from(inviteById.keys()))
    .not("confirmed_by", "is", null)
    .is("report_id", null);

  for (const selection of (selections ?? []) as {
    id: string;
    invite_id: string;
    relationship_type: string;
  }[]) {
    const invite = inviteById.get(selection.invite_id);
    if (!invite || !invite.to_user_id) continue;
    const partnerId =
      invite.from_user_id === userId ? invite.to_user_id : invite.from_user_id;

    const { data: partnerScores } = await admin
      .from("user_scores")
      .select("user_id")
      .eq("user_id", partnerId)
      .maybeSingle();
    if (!partnerScores) continue;

    // Fire-and-forget: the compare route handles the actual generation.
    fetch(`${ctx.origin}/api/report/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: ctx.cookie },
      body: JSON.stringify({
        inviteId: selection.invite_id,
        relationshipType: selection.relationship_type,
        selectionId: selection.id,
      }),
    }).catch((err) => {
      console.error(
        `[scores] compare trigger failed for selection ${selection.id}`,
        err,
      );
    });
  }
}

async function updatePopulationAverages(admin: SupabaseClient, newScores: number[]) {
  const { data: existing } = await admin
    .from("population_averages")
    .select("*")
    .limit(1)
    .single();

  if (existing) {
    const n = existing.sample_size;
    const newAverages = existing.averages.map((avg: number, i: number) =>
      Math.round((avg * n + newScores[i]) / (n + 1)),
    );

    await admin
      .from("population_averages")
      .update({ averages: newAverages, sample_size: n + 1 })
      .eq("id", existing.id);
  } else {
    await admin.from("population_averages").insert({ averages: newScores, sample_size: 1 });
  }
}
