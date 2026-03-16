import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL(`/signup?next=/api/invite/accept?token=${token}`, request.url)
    );
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

  // Accept the invite
  await supabase
    .from("invites")
    .update({
      to_user_id: user.id,
      status: "accepted",
    })
    .eq("id", invite.id);

  return NextResponse.redirect(
    new URL("/dashboard?invite=accepted", request.url)
  );
}
