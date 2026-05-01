import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/invite/claimable
 *
 * Returns pending invites addressed to the current user's email but whose
 * to_user_id was never linked — typically because the user signed up
 * directly instead of clicking the magic link in the invite email. The UI
 * surfaces these as "Invites for you" so the user can accept them without
 * hunting for the original email.
 *
 * RLS lets users only see invites where they are from_user_id or to_user_id;
 * an unlinked invite has neither, so the lookup runs through the admin
 * client scoped to the current user's verified email.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: invites } = await admin
    .from("invites")
    .select("id, from_user_id, to_email, created_at, expires_at")
    .ilike("to_email", user.email)
    .is("to_user_id", null)
    .eq("status", "pending")
    .neq("from_user_id", user.id)
    .order("created_at", { ascending: false });

  const now = Date.now();
  const live = (invites ?? []).filter(
    (i) =>
      !i.expires_at || new Date(i.expires_at as string).getTime() > now,
  );

  if (live.length === 0) {
    return NextResponse.json({ invites: [], inviters: {} });
  }

  const inviterIds = Array.from(
    new Set(
      live
        .map((i) => i.from_user_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const [profilesResult, usersResult] = await Promise.all([
    admin.from("profiles").select("id, full_name").in("id", inviterIds),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const inviters: Record<
    string,
    { full_name: string | null; email: string | null }
  > = {};
  for (const id of inviterIds) {
    const profile = (profilesResult.data ?? []).find(
      (p) => (p as { id: string }).id === id,
    ) as { full_name: string | null } | undefined;
    const authUser = usersResult.data?.users.find((u) => u.id === id);
    inviters[id] = {
      full_name: profile?.full_name ?? null,
      email: authUser?.email ?? null,
    };
  }

  return NextResponse.json({ invites: live, inviters });
}
