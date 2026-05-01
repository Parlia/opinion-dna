import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["couples", "cofounders", "friends"] as const;
const PAID_TYPES = new Set(["couples", "cofounders"]);

/**
 * POST /api/invite/select-type
 *
 * Dual-consent selection: handles both initial selection AND partner confirmation.
 *
 * Body: { inviteId: string, relationshipType: string, purchaseId?: string }
 *
 * Returns:
 *   { status: "waiting_for_partner" } — first selection, waiting for partner
 *   { status: "generating", reportId } — partner confirmed, report generating
 *   { status: "already_complete", reportId } — report already exists
 *   { status: "payment_required", productId, price } — paid type, no purchase yet
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inviteId, relationshipType, purchaseId } = await request.json();

  if (!inviteId || !relationshipType || !VALID_TYPES.includes(relationshipType)) {
    return NextResponse.json({ error: "inviteId and valid relationshipType required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify invite exists, is accepted, and user is a participant
  const { data: invite } = await admin
    .from("invites")
    .select("id, from_user_id, to_user_id, status")
    .eq("id", inviteId)
    .eq("status", "accepted")
    .single();

  if (!invite) {
    return NextResponse.json({ error: "Invite not found or not accepted" }, { status: 404 });
  }

  if (invite.from_user_id !== user.id && invite.to_user_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Both parties must have a completed personal purchase AND a user_scores
  // row before a selection can move forward. Even friends comparisons need
  // both — without scores the report can't generate, and without a personal
  // purchase the partner can't even take the assessment. Surface these
  // separately so the UI can route the user to the right action.
  const participantIds = [invite.from_user_id, invite.to_user_id].filter(Boolean) as string[];
  const [scoreRowsResult, personalPurchasesResult] = await Promise.all([
    admin
      .from("user_scores")
      .select("user_id")
      .in("user_id", participantIds),
    admin
      .from("purchases")
      .select("user_id")
      .in("user_id", participantIds)
      .eq("type", "personal")
      .eq("status", "completed"),
  ]);
  const scoredIds = new Set(
    (scoreRowsResult.data ?? []).map((r) => (r as { user_id: string }).user_id),
  );
  const personalPaidIds = new Set(
    (personalPurchasesResult.data ?? []).map(
      (r) => (r as { user_id: string }).user_id,
    ),
  );
  const selfHasScores = scoredIds.has(user.id);
  const selfPaidPersonal = personalPaidIds.has(user.id);
  const partnerId =
    user.id === invite.from_user_id ? invite.to_user_id : invite.from_user_id;
  const partnerHasScores = !!partnerId && scoredIds.has(partnerId);
  const partnerPaidPersonal = !!partnerId && personalPaidIds.has(partnerId);

  // Check for existing selection for this (invite, type)
  const { data: existing } = await admin
    .from("comparison_selections")
    .select("*")
    .eq("invite_id", inviteId)
    .eq("relationship_type", relationshipType)
    .single();

  // ── Already complete ────────────────────────────────────────────────────
  if (existing?.report_id) {
    return NextResponse.json({
      status: "already_complete",
      reportId: existing.report_id,
      compatibilityScore: existing.compatibility_score,
    });
  }

  // ── I already selected, waiting for partner ─────────────────────────────
  if (existing && existing.selected_by === user.id && !existing.confirmed_by) {
    return NextResponse.json({ status: "waiting_for_partner" });
  }

  // ── Partner selected, I'm confirming ────────────────────────────────────
  if (existing && existing.selected_by !== user.id && !existing.confirmed_by) {
    if (!selfPaidPersonal || !selfHasScores) {
      return NextResponse.json({
        status: "needs_assessment",
        who: "self",
      });
    }
    if (!partnerPaidPersonal || !partnerHasScores) {
      // The partner picked the type but hasn't taken (or paid for) their
      // personal assessment yet. Don't flip to confirmed — the report would
      // fail to generate and leave the UI stuck on "Generating".
      return NextResponse.json({
        status: "awaiting_partner_assessment",
      });
    }

    await admin
      .from("comparison_selections")
      .update({ confirmed_by: user.id, confirmed_at: new Date().toISOString() })
      .eq("id", existing.id);

    // Trigger report generation
    try {
      const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
      const res = await fetch(`${origin}/api/report/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: request.headers.get("cookie") || "",
        },
        body: JSON.stringify({ inviteId, relationshipType, selectionId: existing.id }),
      });
      const result = await res.json();

      return NextResponse.json({
        status: result.status === "completed" ? "completed" : "generating",
        reportId: result.reportId,
      });
    } catch (err) {
      console.error("Report generation trigger failed:", err);
      return NextResponse.json({ status: "generating" });
    }
  }

  // ── Both already confirmed but no report yet ────────────────────────────
  // If scores are present this means generation is actually in progress. If
  // scores are missing (the Alessandra case) surface that so the UI stops
  // claiming "Generating" and tells J. Paul the truth.
  if (existing && existing.confirmed_by) {
    if (
      !selfPaidPersonal ||
      !partnerPaidPersonal ||
      !selfHasScores ||
      !partnerHasScores
    ) {
      return NextResponse.json({
        status: "awaiting_partner_assessment",
      });
    }
    return NextResponse.json({ status: "generating" });
  }

  // ── No selection exists — this is a new selection ───────────────────────

  // Don't let the user create a selection until they've paid for AND
  // finished their own personal assessment — the report can't be generated
  // from a non-existent score set, and a partner who hasn't done theirs
  // can't fulfill it either. This applies to friends too: free comparison
  // still requires both sides to have a personal report.
  if (!selfPaidPersonal || !selfHasScores) {
    return NextResponse.json({ status: "needs_assessment", who: "self" });
  }
  if (!partnerPaidPersonal || !partnerHasScores) {
    return NextResponse.json({ status: "awaiting_partner_assessment" });
  }

  // For paid types, verify a purchase exists
  if (PAID_TYPES.has(relationshipType)) {
    const purchaseType = relationshipType === "couples" ? "couples_comparison" : "cofounders_comparison";

    // Per-pair pricing: a purchase only counts if it isn't already attached
    // to a different (invite, type) selection. Without this filter a single
    // $49 Couples purchase would silently back unlimited future Couples
    // comparisons.
    const { data: consumedRows } = await admin
      .from("comparison_selections")
      .select("purchase_id")
      .not("purchase_id", "is", null);
    const consumedPurchaseIds = new Set<string>(
      (consumedRows ?? []).map((r) => r.purchase_id as string)
    );

    let validPurchaseId = purchaseId;
    if (validPurchaseId && consumedPurchaseIds.has(validPurchaseId)) {
      // Caller passed a purchaseId that's already been used for another
      // selection — ignore it and look up an unconsumed one instead.
      validPurchaseId = undefined;
    }

    if (!validPurchaseId) {
      // Find the user's first completed purchase of this type that hasn't
      // already been attached to another selection.
      const { data: completedPurchases } = await admin
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("type", purchaseType)
        .eq("status", "completed");
      const unconsumed = (completedPurchases ?? []).find(
        (p) => !consumedPurchaseIds.has(p.id as string)
      );
      if (unconsumed) {
        validPurchaseId = unconsumed.id as string;
      }
    }

    if (!validPurchaseId) {
      // Before sending this user to Stripe, make sure the partner hasn't
      // already paid for THIS pair. One purchase is enough to unlock a
      // single report; a second would just be money left on the floor.
      // This catches the race where two users click Select before the
      // first one's selection row gets written. The unconsumed filter is
      // critical — without it, a partner's stale already-attached purchase
      // would block this user from ever paying.
      if (partnerId) {
        const { data: partnerPurchases } = await admin
          .from("purchases")
          .select("id")
          .eq("user_id", partnerId)
          .eq("type", purchaseType)
          .eq("status", "completed");
        const partnerUnconsumed = (partnerPurchases ?? []).find(
          (p) => !consumedPurchaseIds.has(p.id as string)
        );
        if (partnerUnconsumed) {
          return NextResponse.json({
            status: "partner_paid_waiting",
            message:
              "Your partner has already paid for this report. Give it a moment, then refresh — you'll see a Confirm button instead.",
          });
        }
      }

      const productId = relationshipType === "couples" ? "couples_comparison" : "cofounders_comparison";
      const price = relationshipType === "couples" ? 49 : 399;
      return NextResponse.json({
        status: "payment_required",
        productId,
        price,
      });
    }

    // Insert selection with purchase
    const { error } = await admin.from("comparison_selections").insert({
      invite_id: inviteId,
      relationship_type: relationshipType,
      selected_by: user.id,
      purchase_id: validPurchaseId,
    });

    if (error) {
      // Unique constraint violation — race condition, treat as already selected
      if (error.code === "23505") {
        return NextResponse.json({ status: "waiting_for_partner" });
      }
      console.error("Selection insert error:", error);
      return NextResponse.json({ error: "Failed to create selection" }, { status: 500 });
    }

    return NextResponse.json({ status: "waiting_for_partner" });
  }

  // Free type (friends) — insert immediately
  const { error } = await admin.from("comparison_selections").insert({
    invite_id: inviteId,
    relationship_type: relationshipType,
    selected_by: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ status: "waiting_for_partner" });
    }
    console.error("Selection insert error:", error);
    return NextResponse.json({ error: "Failed to create selection" }, { status: 500 });
  }

  return NextResponse.json({ status: "waiting_for_partner" });
}
