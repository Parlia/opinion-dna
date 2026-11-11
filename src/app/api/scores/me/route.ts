import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateScores } from "@/lib/scoring/engine";
import { QUESTIONS } from "@/lib/scoring/questions";
import { hasPurchase } from "@/lib/auth/require-purchase";
import {
  buildTeaser,
  finalizeScores,
  isQuizComplete,
  loadSavedAnswers,
  requestContext,
} from "@/lib/scoring/finalize";

export const dynamic = "force-dynamic";

/**
 * GET /api/scores/me: what the signed-in user is allowed to see of their scores.
 *
 *   { status: "none", answered }      quiz not finished
 *   { status: "teaser", teaser }      quiz finished, not paid: a few scores only
 *   { status: "full", scores }        paid: all 48
 *
 * A paid user whose quiz is complete but whose scores were never written
 * (they finished the free quiz, then paid) gets them written here.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("user_scores")
    .select("scores")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing?.scores) {
    return NextResponse.json({ status: "full", scores: existing.scores });
  }

  const answers = await loadSavedAnswers(supabase, user.id);
  if (!isQuizComplete(answers)) {
    return NextResponse.json({ status: "none", answered: answers.size });
  }

  const scores = calculateScores(answers, QUESTIONS);

  if (await hasPurchase(user.id)) {
    const { ok } = await finalizeScores(
      createAdminClient(),
      user.id,
      scores,
      requestContext(request),
      { overwrite: false }
    );
    if (!ok) {
      return NextResponse.json({ error: "Failed to save scores" }, { status: 500 });
    }
    return NextResponse.json({ status: "full", scores });
  }

  return NextResponse.json({ status: "teaser", teaser: buildTeaser(scores) });
}
