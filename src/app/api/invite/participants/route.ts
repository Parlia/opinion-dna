import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/invite/participants
 *
 * Returns display info (full_name + email) for every OTHER user the current
 * user shares an invite with — sender or recipient. The /compare page can't
 * read other users' profiles directly because of RLS, so this endpoint uses
 * the admin client and scopes the lookup to the user's actual relationships.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: invites } = await admin
    .from("invites")
    .select("from_user_id, to_user_id")
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);

  const partnerIds = new Set<string>();
  for (const row of (invites ?? []) as { from_user_id: string | null; to_user_id: string | null }[]) {
    if (row.from_user_id && row.from_user_id !== user.id) partnerIds.add(row.from_user_id);
    if (row.to_user_id && row.to_user_id !== user.id) partnerIds.add(row.to_user_id);
  }

  if (partnerIds.size === 0) {
    return NextResponse.json({ participants: {} });
  }

  const ids = Array.from(partnerIds);

  const [profilesResult, usersResult] = await Promise.all([
    admin.from("profiles").select("id, full_name").in("id", ids),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const nameById = new Map<string, string | null>();
  for (const p of (profilesResult.data ?? []) as { id: string; full_name: string | null }[]) {
    nameById.set(p.id, p.full_name);
  }
  const emailById = new Map<string, string | null>();
  for (const u of usersResult.data?.users ?? []) {
    if (partnerIds.has(u.id)) emailById.set(u.id, u.email ?? null);
  }

  const participants: Record<string, { full_name: string | null; email: string | null }> = {};
  for (const id of ids) {
    participants[id] = {
      full_name: nameById.get(id) ?? null,
      email: emailById.get(id) ?? null,
    };
  }

  return NextResponse.json({ participants });
}
