import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inviteId } = await request.json();

  if (!inviteId) {
    return NextResponse.json({ error: "Invite ID required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify the invite belongs to this user and is still pending
  const { data: invite } = await admin
    .from("invites")
    .select("id, from_user_id, status")
    .eq("id", inviteId)
    .single();

  if (!invite || invite.from_user_id !== user.id) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.status !== "pending") {
    return NextResponse.json({ error: "Only pending invites can be cancelled" }, { status: 400 });
  }

  const { error } = await admin
    .from("invites")
    .delete()
    .eq("id", inviteId);

  if (error) {
    return NextResponse.json({ error: "Failed to cancel invite" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
