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

  // Kick off any confirmed comparison_selections that were waiting on
  // this user's scores. Generation requires dual consent, so this is the
  // only trigger needed here — /api/invite/select-type covers the case
  // where confirmation lands after both users already have scores.
  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3001";
  const cookie = request.headers.get("cookie") || "";
  triggerPendingSelections(user.id, admin, origin, cookie).catch((err) =>
    console.error("Pending selection trigger error:", err)
  );

  return NextResponse.json({ scores });
}

/**
 * Find comparison_selections that are fully confirmed but haven't generated a
 * report yet, where the freshly-scored user is a participant and the other
 * party already has scores. Kick off report generation for each.
 */
async function triggerPendingSelections(
  userId: string,
  admin: ReturnType<typeof createAdminClient>,
  origin: string,
  cookie: string
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

    // Fire-and-forget — the compare route handles the actual generation.
    fetch(`${origin}/api/report/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        inviteId: selection.invite_id,
        relationshipType: selection.relationship_type,
        selectionId: selection.id,
      }),
    }).catch((err) => {
      console.error(
        `[submit] compare trigger failed for selection ${selection.id}`,
        err
      );
    });
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
