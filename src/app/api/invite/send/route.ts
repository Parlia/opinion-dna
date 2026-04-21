import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";
import { sendInviteEmail } from "@/lib/email/resend";
import { rateLimit } from "@/lib/auth/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(`invite:${user.id}`, { limit: 10, windowMs: 3600_000 });
  if (limited) return limited;

  const { email } = await request.json();

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  if (email.toLowerCase() === user.email?.toLowerCase()) {
    return NextResponse.json({ error: "Cannot invite yourself" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Prevent duplicate invites to the same email from the same user.
  // We only consider active statuses — if the previous invite was cancelled
  // or declined, allow re-sending.
  const { data: existing } = await admin
    .from("invites")
    .select("id, status")
    .eq("from_user_id", user.id)
    .ilike("to_email", email)
    .in("status", ["pending", "accepted"])
    .limit(1)
    .maybeSingle();

  if (existing) {
    const msg = existing.status === "accepted"
      ? "You've already connected with this person. Check the Joined section on Compare."
      : "You've already invited this email. Check the Pending section — you can resend the invitation there.";
    return NextResponse.json({ error: msg, code: "duplicate" }, { status: 409 });
  }

  // Reciprocal invite check: if the target (by email) already has an invite
  // open or accepted FROM them TO the current user, don't create a second one.
  // Surfaces as "they already invited you" so the sender doesn't end up with
  // two cards for the same relationship on /compare.
  const { data: usersPage } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const targetUser = (usersPage?.users ?? []).find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  if (targetUser) {
    const { data: reciprocal } = await admin
      .from("invites")
      .select("id, status")
      .eq("from_user_id", targetUser.id)
      .eq("to_user_id", user.id)
      .in("status", ["pending", "accepted"])
      .limit(1)
      .maybeSingle();
    if (reciprocal) {
      const msg = reciprocal.status === "accepted"
        ? "This person has already invited you and you've joined them. Check the Joined section on Compare."
        : "This person has already invited you. Check your email for their invite link, or look in your spam folder.";
      return NextResponse.json({ error: msg, code: "reciprocal" }, { status: 409 });
    }
  }

  // Check if user has a purchase (optional — invites are free, comparison is paid)
  const { data: purchase } = await admin
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .limit(1)
    .single();

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { error } = await admin
    .from("invites")
    .insert({
      from_user_id: user.id,
      to_email: email,
      token,
      type: "personal",
      purchase_id: purchase?.id || null,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    console.error("Invite insert error:", error.message);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }

  // Sanitize fromName — strip any HTML tags
  const rawName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Someone";
  const fromName = String(rawName).replace(/<[^>]*>/g, "").replace(/[\r\n]/g, "").slice(0, 100);

  try {
    await sendInviteEmail(email, fromName, token);
  } catch (emailError) {
    console.error("Email send failed but invite was created:", emailError);
  }

  return NextResponse.json({ ok: true });
}
