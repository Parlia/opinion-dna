import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/auth/admin";

/**
 * Toggle a profile's is_internal flag (admin only). Internal/test/founder
 * accounts are excluded from real-sale and funnel totals on the scorecard.
 *
 * Writes via the service-role admin client: migration 019 revoked table-wide
 * UPDATE on profiles from `authenticated` (only full_name/preferred_name are
 * user-writable), so is_internal can only be set by trusted server code.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let userId: unknown;
  let isInternal: unknown;
  try {
    ({ userId, isInternal } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  if (typeof isInternal !== "boolean") {
    return NextResponse.json({ error: "isInternal (boolean) required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ is_internal: isInternal })
    .eq("id", userId);

  if (error) {
    // Most likely cause: migration 020 (is_internal column) not yet applied.
    return NextResponse.json(
      {
        error:
          "Couldn't update the internal flag. If this persists, apply migration 020_admin_internal_flag.sql to Supabase.",
        detail: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, userId, isInternal });
}
