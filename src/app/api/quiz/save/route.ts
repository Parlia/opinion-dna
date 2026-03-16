import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { questionIndex, answer } = await request.json();

  if (
    typeof questionIndex !== "number" ||
    questionIndex < 0 ||
    questionIndex > 178 ||
    typeof answer !== "number" ||
    answer < 1 ||
    answer > 5
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { error } = await supabase
    .from("quiz_responses")
    .upsert(
      { user_id: user.id, question_index: questionIndex, answer },
      { onConflict: "user_id,question_index" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
