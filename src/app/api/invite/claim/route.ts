import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/invite/claim
 *
 * Manually accepts a pending invite addressed to the current user's email
 * but never linked via the magic-link flow. Same security guarantee as
 * /api/invite/accept: the signed-in user's verified email is the proof of
 * ownership the magic-link token was meant to provide.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inviteId } = await request.json();
  if (!inviteId) {
    return NextResponse.json(
      { error: "inviteId required" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("invites")
    .select("id, from_user_id, to_email, status, to_user_id, expires_at")
    .eq("id", inviteId)
    .single();

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.status !== "pending" || invite.to_user_id) {
    return NextResponse.json(
      { error: "Invite is not claimable" },
      { status: 400 },
    );
  }

  if (
    !invite.to_email ||
    invite.to_email.toLowerCase() !== user.email.toLowerCase()
  ) {
    return NextResponse.json(
      { error: "Invite is for a different email" },
      { status: 403 },
    );
  }

  if (invite.from_user_id === user.id) {
    return NextResponse.json(
      { error: "Cannot claim your own invite" },
      { status: 400 },
    );
  }

  if (
    invite.expires_at &&
    new Date(invite.expires_at).getTime() < Date.now()
  ) {
    await admin
      .from("invites")
      .update({ status: "expired" })
      .eq("id", invite.id);
    return NextResponse.json(
      { error: "Invite has expired" },
      { status: 400 },
    );
  }

  const { error } = await admin
    .from("invites")
    .update({ to_user_id: user.id, status: "accepted" })
    .eq("id", invite.id);

  if (error) {
    console.error("Invite claim update failed:", error);
    return NextResponse.json(
      { error: "Failed to accept invite" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
