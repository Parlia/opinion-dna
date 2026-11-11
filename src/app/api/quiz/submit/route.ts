import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateScores } from "@/lib/scoring/engine";
import { QUESTIONS } from "@/lib/scoring/questions";
import { hasPurchase } from "@/lib/auth/require-purchase";
import { finalizeScores, requestContext } from "@/lib/scoring/finalize";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { answers: answersObj } = await request.json();

  // Convert object to Map with validation
  const answers = new Map<number, number>();
  for (const [key, value] of Object.entries(answersObj ?? {})) {
    const index = Number(key);
    const num = Number(value);
    if (!Number.isInteger(index) || index < 0 || index >= QUESTIONS.length) {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 });
    }
    if (!Number.isInteger(num) || num < 1 || num > 5) {
      return NextResponse.json({ error: "Invalid answer value" }, { status: 400 });
    }
    answers.set(index, num);
  }

  // Validate all answers present
  if (answers.size !== QUESTIONS.length) {
    return NextResponse.json(
      { error: "Incomplete answers" },
      { status: 400 }
    );
  }

  // The quiz is free; the full scores are not. An unpaid user's scores are
  // never written to user_scores (which they could read from the browser).
  // Instead make sure the answers they just submitted are what is on file, so
  // the preview at /api/scores/me and the later unlock both use them.
  if (!(await hasPurchase(user.id))) {
    const { error: saveError } = await supabase.from("quiz_responses").upsert(
      Array.from(answers, ([question_index, answer]) => ({
        user_id: user.id,
        question_index,
        answer,
      })),
      { onConflict: "user_id,question_index" }
    );
    if (saveError) {
      console.error("Quiz answers save error:", saveError.message);
      return NextResponse.json({ error: "Failed to save answers" }, { status: 500 });
    }
    return NextResponse.json({ locked: true });
  }

  const scores = calculateScores(answers, QUESTIONS);

  // Use admin client for writing scores (RLS requires service_role)
  const { ok } = await finalizeScores(
    createAdminClient(),
    user.id,
    scores,
    requestContext(request),
    { overwrite: true }
  );
  if (!ok) {
    return NextResponse.json({ error: "Failed to save scores" }, { status: 500 });
  }

  return NextResponse.json({ scores });
}
