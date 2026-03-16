import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateScores } from "@/lib/scoring/engine";
import { QUESTIONS } from "@/lib/scoring/questions";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { answers: answersObj } = await request.json();

  // Convert object to Map
  const answers = new Map<number, number>();
  for (const [key, value] of Object.entries(answersObj)) {
    answers.set(Number(key), value as number);
  }

  // Validate all answers present
  if (answers.size !== QUESTIONS.length) {
    return NextResponse.json(
      { error: `Expected ${QUESTIONS.length} answers, got ${answers.size}` },
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
    return NextResponse.json({ error: scoreError.message }, { status: 500 });
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
