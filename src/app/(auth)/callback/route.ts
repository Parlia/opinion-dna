import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { deriveFirstName } from "@/lib/auth/display-name";

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
          .ilike("to_email", user.email)
          .eq("status", "pending")
          .neq("from_user_id", user.id); // never auto-accept self-invites

        // Backfill preferred_name for Google OAuth signups — they never see
        // the signup form, so profiles.preferred_name would otherwise stay
        // null and Claude would truncate full names unpredictably in briefs.
        // Only set it if still blank so we don't clobber a user edit.
        const { data: profile } = await admin
          .from("profiles")
          .select("full_name, preferred_name")
          .eq("id", user.id)
          .single();
        if (profile && !profile.preferred_name?.trim()) {
          const derived = deriveFirstName(profile.full_name);
          if (derived) {
            await admin
              .from("profiles")
              .update({ preferred_name: derived })
              .eq("id", user.id);
          }
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
