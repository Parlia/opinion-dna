import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/invite/info?token=...
 *
 * Returns public invite metadata keyed by the invite token. Used by the
 * signup page to render context for invitees ("[Name] invited you to
 * compare Opinion DNA results") before they create an account.
 *
 * No auth required — the token itself is the credential. We return only
 * non-sensitive info: the inviter's display name and whether the invite
 * is still valid. We never return email addresses or user IDs.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("invites")
    .select("id, from_user_id, status, expires_at")
    .eq("token", token)
    .single();

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.status === "expired" || new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  // Fetch the inviter's display name
  let fromName = "Someone";
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", invite.from_user_id)
    .single();

  if (profile?.full_name) {
    // Strip anything that looks like HTML/control chars just in case
    fromName = String(profile.full_name)
      .replace(/<[^>]*>/g, "")
      .replace(/[\r\n]/g, "")
      .slice(0, 100);
  }

  return NextResponse.json({
    fromName,
    status: invite.status, // "pending" or "accepted"
  });
}
