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

  // Check if user has a purchase (optional — invites are free, comparison is paid)
  const admin = createAdminClient();
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
