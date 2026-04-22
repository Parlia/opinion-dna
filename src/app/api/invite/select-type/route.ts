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

  // Both parties must have scores before a selection can move forward.
  // Previously we'd happily create selections / confirmations as long as the
  // personal PURCHASE was in place, then the report-gen would 400 and the UI
  // would get stuck on "Generating your report (2-4 min)" forever.
  const { data: scoreRows } = await admin
    .from("user_scores")
    .select("user_id")
    .in(
      "user_id",
      [invite.from_user_id, invite.to_user_id].filter(Boolean) as string[]
    );
  const scoredIds = new Set(
    (scoreRows ?? []).map((r) => (r as { user_id: string }).user_id)
  );
  const selfHasScores = scoredIds.has(user.id);
  const partnerId =
    user.id === invite.from_user_id ? invite.to_user_id : invite.from_user_id;
  const partnerHasScores = !!partnerId && scoredIds.has(partnerId);

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
    if (!selfHasScores) {
      return NextResponse.json({
        status: "needs_assessment",
        who: "self",
      });
    }
    if (!partnerHasScores) {
      // The partner picked the type but hasn't taken their quiz yet. Don't
      // flip to confirmed — the report would fail to generate and leave the
      // UI stuck on "Generating".
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
    if (!selfHasScores || !partnerHasScores) {
      return NextResponse.json({
        status: "awaiting_partner_assessment",
      });
    }
    return NextResponse.json({ status: "generating" });
  }

  // ── No selection exists — this is a new selection ───────────────────────

  // Don't let the user create a selection until they've finished their own
  // quiz — the report can't be generated from a non-existent score set.
  if (!selfHasScores) {
    return NextResponse.json({ status: "needs_assessment", who: "self" });
  }

  // For paid types, verify a purchase exists
  if (PAID_TYPES.has(relationshipType)) {
    const purchaseType = relationshipType === "couples" ? "couples_comparison" : "cofounders_comparison";

    let validPurchaseId = purchaseId;

    if (!validPurchaseId) {
      // Check if user has any completed purchase of this type
      const { data: existingPurchase } = await admin
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("type", purchaseType)
        .eq("status", "completed")
        .limit(1)
        .single();

      if (existingPurchase) {
        validPurchaseId = existingPurchase.id;
      }
    }

    if (!validPurchaseId) {
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
