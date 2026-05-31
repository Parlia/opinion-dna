import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail, isExampleReportsEmail } from "@/lib/auth/admin";

/**
 * Hard-delete a user (admin only). Used to clear out spam signups.
 *
 * auth.admin.deleteUser cascades to every table whose user FK has
 * ON DELETE CASCADE: profiles, purchases, quiz_responses, user_scores,
 * reports.user_id, invites.from_user_id. The non-cascade refs a user can own
 * themselves (comparison_selections.selected_by, NOT NULL) are cleared first.
 * If the user is still referenced by SOMEONE ELSE's data (confirmed_by,
 * to_user_id, comparison_user_id, dismissed_by — all no-cascade), the auth
 * delete fails and we surface that instead of nulling another user's report.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The admin gate IS the security boundary here (the page only hides the UI).
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let userId: unknown;
  try {
    ({ userId } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  if (userId === user!.id) {
    return NextResponse.json(
      { error: "You can't delete your own account." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Resolve the target to enforce protections and report a clear label.
  const { data: target, error: lookupError } =
    await admin.auth.admin.getUserById(userId);
  if (lookupError || !target?.user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const targetEmail = target.user.email ?? "";

  if (isAdminEmail(targetEmail) || isExampleReportsEmail(targetEmail)) {
    return NextResponse.json(
      { error: "This account is protected and can't be deleted." },
      { status: 400 }
    );
  }

  // Clear the user's own comparison selections (selected_by is NOT NULL with no
  // ON DELETE CASCADE, so it would otherwise block the auth delete).
  const { error: selErr } = await admin
    .from("comparison_selections")
    .delete()
    .eq("selected_by", userId);
  if (selErr) {
    return NextResponse.json(
      { error: "Failed to clear user's comparison selections.", detail: selErr.message },
      { status: 500 }
    );
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return NextResponse.json(
      {
        error:
          "Couldn't delete — this user is linked to another user's comparison or invite data, so they're likely a real participant rather than spam.",
        detail: deleteError.message,
      },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, email: targetEmail });
}
