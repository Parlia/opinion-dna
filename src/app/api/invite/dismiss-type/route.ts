import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["couples", "cofounders", "friends"] as const;

/**
 * POST /api/invite/dismiss-type
 *
 * Body: { inviteId, relationshipType, undo? }
 *
 * Marks a (invite, relationship_type) pair as "not applicable" so it stops
 * rendering in /compare's Joined section. Only permitted when nothing has
 * been selected yet — a confirmed selection or a completed report means
 * someone has already committed (and possibly paid), which is a support
 * issue rather than a dismiss.
 *
 * With { undo: true }, reverses a dismissal: a row that only existed to
 * record the dismissal is deleted outright (so pricing reads selectionState
 * "none" again); a pre-existing selection that was dismissed has its
 * dismissed_at/dismissed_by cleared, restoring the prior selection state.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inviteId, relationshipType, undo } = await request.json();
  if (!inviteId || !VALID_TYPES.includes(relationshipType)) {
    return NextResponse.json(
      { error: "inviteId and valid relationshipType required" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("invites")
    .select("id, from_user_id, to_user_id, status")
    .eq("id", inviteId)
    .single();
  if (!invite || invite.status !== "accepted") {
    return NextResponse.json({ error: "Invite not found or not accepted" }, { status: 404 });
  }
  if (invite.from_user_id !== user.id && invite.to_user_id !== user.id) {
    return NextResponse.json({ error: "Not authorized for this invite" }, { status: 403 });
  }

  const { data: existing } = await admin
    .from("comparison_selections")
    .select("id, report_id, selected_by, confirmed_by, dismissed_at, dismissed_by")
    .eq("invite_id", inviteId)
    .eq("relationship_type", relationshipType)
    .maybeSingle();

  if (undo === true) {
    // Nothing dismissed (or a report already exists) — noop success either
    // way; there's no dismissal left to reverse.
    if (!existing?.dismissed_at || existing.report_id) {
      return NextResponse.json({ ok: true, already: true });
    }
    // A row created purely to record the dismissal (dismisser is also the
    // "selector" and nothing was confirmed) should be deleted, not revived —
    // clearing dismissed_at alone would make it read as a live selection.
    const pureDismissRow =
      !existing.confirmed_by && existing.selected_by === existing.dismissed_by;
    const { error } = pureDismissRow
      ? await admin.from("comparison_selections").delete().eq("id", existing.id)
      : await admin
          .from("comparison_selections")
          .update({ dismissed_at: null, dismissed_by: null })
          .eq("id", existing.id);
    if (error) {
      console.error("dismiss-type: failed to undo dismissal", error);
      return NextResponse.json({ error: "Failed to undo" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // Already dismissed — noop success.
  if (existing?.dismissed_at) {
    return NextResponse.json({ ok: true, already: true });
  }
  // Report exists — can't dismiss, must support-refund.
  if (existing?.report_id) {
    return NextResponse.json(
      { error: "This comparison already has a report — can't dismiss." },
      { status: 400 },
    );
  }
  // Confirmed but no report yet means a generation is probably in flight.
  // Don't silently kill that — require the user to wait or explicitly cancel.
  if (existing?.confirmed_by) {
    return NextResponse.json(
      { error: "A report is already being generated for this type." },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();

  if (existing) {
    // A selection exists (someone picked the type) but it hasn't been
    // confirmed yet. Flip it to dismissed so the other side stops seeing it.
    const { error } = await admin
      .from("comparison_selections")
      .update({ dismissed_at: now, dismissed_by: user.id })
      .eq("id", existing.id);
    if (error) {
      console.error("dismiss-type: failed to update existing selection", error);
      return NextResponse.json({ error: "Failed to dismiss" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // No selection row yet — create one in the dismissed state. selected_by is
  // NOT NULL on the table, so we set it to the current user (same person who
  // dismissed).
  const { error } = await admin.from("comparison_selections").insert({
    invite_id: inviteId,
    relationship_type: relationshipType,
    selected_by: user.id,
    dismissed_at: now,
    dismissed_by: user.id,
  });

  if (error) {
    // Unique violation — race with another dismiss. Treat as success.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, raced: true });
    }
    console.error("dismiss-type: failed to insert dismissed selection", error);
    return NextResponse.json({ error: "Failed to dismiss" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
