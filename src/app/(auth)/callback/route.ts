import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Safety net: auto-accept any pending invites addressed to this user's
      // email. Covers the case where the /api/invite/accept redirect round-trip
      // lost the ?token (e.g. the user took a detour through Google OAuth).
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const admin = createAdminClient();
        await admin
          .from("invites")
          .update({ to_user_id: user.id, status: "accepted" })
          .eq("to_email", user.email)
          .eq("status", "pending");
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
