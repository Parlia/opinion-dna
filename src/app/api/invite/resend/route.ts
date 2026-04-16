import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendInviteEmail } from "@/lib/email/resend";
import { rateLimit } from "@/lib/auth/rate-limit";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(`resend:${user.id}`, { limit: 5, windowMs: 3600_000 });
  if (limited) return limited;

  const { inviteId } = await request.json();

  if (!inviteId) {
    return NextResponse.json({ error: "Invite ID required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify the invite belongs to this user and is still pending
  const { data: invite } = await admin
    .from("invites")
    .select("id, from_user_id, to_email, token, status")
    .eq("id", inviteId)
    .single();

  if (!invite || invite.from_user_id !== user.id) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.status !== "pending") {
    return NextResponse.json({ error: "Only pending invites can be resent" }, { status: 400 });
  }

  const rawName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Someone";
  const fromName = String(rawName).replace(/<[^>]*>/g, "").replace(/[\r\n]/g, "").slice(0, 100);

  try {
    await sendInviteEmail(invite.to_email, fromName, invite.token);
  } catch (emailError) {
    console.error("Resend email failed:", emailError);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  // Update the invite timestamp so the UI reflects the resend
  await admin
    .from("invites")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", inviteId);

  return NextResponse.json({ ok: true });
}
