import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Encode the whole next URL so the inner ?token= doesn't get parsed as a
    // top-level query param by the signup page (which was silently dropping it,
    // leaving the invite stuck at status=pending after the user finished auth).
    const next = encodeURIComponent(`/api/invite/accept?token=${token}`);
    return NextResponse.redirect(new URL(`/signup?next=${next}`, request.url));
  }

  // Find the invite
  const { data: invite } = await supabase
    .from("invites")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (!invite) {
    return NextResponse.redirect(
      new URL("/dashboard?error=invalid_invite", request.url)
    );
  }

  // Check not expired
  if (new Date(invite.expires_at) < new Date()) {
    await supabase
      .from("invites")
      .update({ status: "expired" })
      .eq("id", invite.id);

    return NextResponse.redirect(
      new URL("/dashboard?error=invite_expired", request.url)
    );
  }

  // Require that the signed-in user's email matches the invite recipient.
  // Otherwise the inviter — or anyone holding the token — could accept their
  // own invite onto the wrong account, which corrupted the /compare join list.
  if (
    !user.email ||
    user.email.toLowerCase() !== invite.to_email.toLowerCase()
  ) {
    return NextResponse.redirect(
      new URL("/dashboard?error=invite_wrong_account", request.url)
    );
  }

  // Don't let a user accept their own invite. /api/invite/send already blocks
  // self-invites, but this is belt-and-braces against bad historical rows.
  if (invite.from_user_id === user.id) {
    return NextResponse.redirect(
      new URL("/dashboard?error=invite_self", request.url)
    );
  }

  // Accept the invite
  await supabase
    .from("invites")
    .update({
      to_user_id: user.id,
      status: "accepted",
    })
    .eq("id", invite.id);

  // Auto-fold the reciprocal: if this user had also sent a pending invite
  // back to the inviter, accept it too. Sending an invite already counts
  // as that side's opt-in. Mirrors /api/invite/claim — keeps both accept
  // paths in sync. Uses admin because the user-scoped RLS update policy
  // only covers invites where they are to_user_id, not from_user_id.
  if (invite.from_user_id) {
    const admin = createAdminClient();
    const { data: inviterAuth } = await admin.auth.admin.getUserById(
      invite.from_user_id,
    );
    const inviterEmail = inviterAuth.user?.email ?? null;

    await admin
      .from("invites")
      .update({ to_user_id: invite.from_user_id, status: "accepted" })
      .eq("from_user_id", user.id)
      .eq("to_user_id", invite.from_user_id)
      .eq("status", "pending");

    if (inviterEmail) {
      // Catch the unlinked case (reciprocal still has to_user_id null —
      // happens when the inviter also signed up without clicking a link).
      await admin
        .from("invites")
        .update({ to_user_id: invite.from_user_id, status: "accepted" })
        .eq("from_user_id", user.id)
        .is("to_user_id", null)
        .ilike("to_email", inviterEmail)
        .eq("status", "pending");
    }
  }

  return NextResponse.redirect(
    new URL("/dashboard?invite=accepted", request.url)
  );
}
