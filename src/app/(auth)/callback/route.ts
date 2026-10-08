import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { deriveFirstName } from "@/lib/auth/display-name";
import { ATTR_COOKIE, isFreshAccount, parseAttributionCookie } from "@/lib/attribution";
import {
  sendInviteAcceptedEmail,
  sendWelcomeEmail,
} from "@/lib/email/resend";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      let attrHandled = false;

      if (user) {
        const admin = createAdminClient();

        if (user.email) {
          // Safety net: auto-accept any pending invites addressed to this user's
          // email. Covers the case where the /api/invite/accept redirect round-trip
          // lost the ?token (e.g. the user took a detour through Google OAuth).
          const { data: autoAccepted } = await admin
            .from("invites")
            .update({ to_user_id: user.id, status: "accepted" })
            .ilike("to_email", user.email)
            .eq("status", "pending")
            .neq("from_user_id", user.id) // never auto-accept self-invites
            .select("from_user_id");

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

          // Notify inviters whose invite was just auto-accepted above.
          // Best-effort: a failure here must never block the auth redirect.
          try {
            const inviterIds = [
              ...new Set(
                (autoAccepted ?? [])
                  .map((row) => row.from_user_id)
                  .filter((id): id is string => Boolean(id)),
              ),
            ];
            if (inviterIds.length > 0) {
              const accepterName =
                profile?.preferred_name?.trim() ||
                profile?.full_name?.trim() ||
                user.email;
              for (const inviterId of inviterIds) {
                const { data: inviterAuth } =
                  await admin.auth.admin.getUserById(inviterId);
                if (inviterAuth.user?.email) {
                  await sendInviteAcceptedEmail(
                    inviterAuth.user.email,
                    accepterName,
                  );
                }
              }
            }
          } catch {
            /* notification is best-effort */
          }

          // Welcome email: once per account, only for accounts created in the
          // last 24h (so existing users never get one on a later login). The
          // conditional update is the atomic claim — concurrent callbacks
          // can't double-send. Tolerates migration 022 not being applied
          // (update errors → claimedWelcome null → skip).
          try {
            const dayAgo = new Date(Date.now() - 24 * 3600_000).toISOString();
            const { data: claimedWelcome } = await admin
              .from("profiles")
              .update({ welcome_email_sent_at: new Date().toISOString() })
              .eq("id", user.id)
              .is("welcome_email_sent_at", null)
              .gt("created_at", dayAgo)
              .select("full_name, preferred_name");
            if (claimedWelcome && claimedWelcome.length > 0) {
              const w = claimedWelcome[0];
              await sendWelcomeEmail(
                user.email,
                w.preferred_name?.trim() || deriveFirstName(w.full_name) || "",
              );
            }
          } catch {
            /* welcome email is best-effort */
          }
        }

        // Persist first-touch channel attribution captured client-side (cookie)
        // onto the profile, exactly once (landing_path acts as the written-once
        // sentinel), and only for an account created in the last 24h: a later
        // login's cookie on an older account is not that account's first touch.
        // The cookie is cleared either way once the column exists. Best-effort:
        // it must never block the auth redirect, and it tolerates migration 021
        // not being applied yet (the select errors → we skip and keep the cookie
        // for a later attempt).
        try {
          const cookieHeader = request.headers.get("cookie") || "";
          const match = cookieHeader
            .split(/;\s*/)
            .find((c) => c.startsWith(`${ATTR_COOKIE}=`));
          const attr = parseAttributionCookie(
            match ? match.slice(ATTR_COOKIE.length + 1) : null
          );
          if (attr) {
            const sel = await admin
              .from("profiles")
              .select("landing_path, created_at")
              .eq("id", user.id)
              .single();
            if (!sel.error) {
              attrHandled = true; // column exists — clear the cookie below
              if (
                sel.data &&
                sel.data.landing_path == null &&
                isFreshAccount(sel.data.created_at)
              ) {
                const update: Record<string, string> = {};
                const put = (k: string, v?: string) => {
                  if (v && typeof v === "string") update[k] = v.slice(0, 200);
                };
                put("utm_source", attr.s);
                put("utm_medium", attr.m);
                put("utm_campaign", attr.c);
                put("referrer", attr.r);
                put("landing_path", attr.lp);
                if (Object.keys(update).length) {
                  await admin.from("profiles").update(update).eq("id", user.id);
                }
              }
            }
          }
        } catch {
          /* attribution is best-effort — never block auth */
        }
      }

      const res = NextResponse.redirect(`${origin}${next}`);
      if (attrHandled) res.cookies.set(ATTR_COOKIE, "", { maxAge: 0, path: "/" });
      return res;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
