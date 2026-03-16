import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";
import { sendInviteEmail } from "@/lib/email/resend";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Require the user to have completed their own assessment
  const { data: scores } = await supabase
    .from("user_scores")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (!scores || scores.length === 0) {
    return NextResponse.json(
      { error: "Please complete your own assessment first." },
      { status: 400 }
    );
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { error } = await supabase
    .from("invites")
    .insert({
      from_user_id: user.id,
      to_email: email,
      token,
      type: "personal",
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send invite email via Resend
  const fromName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Someone";
  try {
    await sendInviteEmail(email, fromName, token);
  } catch (emailError) {
    console.error("Email send failed but invite was created:", emailError);
    // Invite is saved — email failure shouldn't block the flow
  }

  return NextResponse.json({ ok: true });
}
