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

  return NextResponse.json({ scores });
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
