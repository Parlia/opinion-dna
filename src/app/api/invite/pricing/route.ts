import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateComparisonPrice, type RelationshipType } from "@/lib/stripe/pricing";
import { STALE_GENERATING_MS } from "@/lib/report/generate-comparison";

export const dynamic = "force-dynamic";

/**
 * GET /api/invite/pricing?inviteId=X&type=cofounders|couples|friends
 *
 * Returns pricing AND selection state for a specific comparison type.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const inviteId = url.searchParams.get("inviteId");
  const relationshipType = url.searchParams.get("type") as RelationshipType;

  if (!inviteId || !relationshipType || !["couples", "cofounders", "friends"].includes(relationshipType)) {
    return NextResponse.json({ error: "inviteId and type required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Get the invite
  const { data: invite } = await admin
    .from("invites")
    .select("id, from_user_id, to_user_id, status")
    .eq("id", inviteId)
    .single();

  if (!invite || invite.status !== "accepted") {
    return NextResponse.json({ error: "Invite not found or not accepted" }, { status: 404 });
  }

  if (invite.from_user_id !== user.id && invite.to_user_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Get purchases for both users. invite_id + relationship_type are pulled
  // through so the per-pair "partner paid for THIS pair" check below can
  // distinguish a Stripe checkout for this comparison from a stray purchase
  // that hasn't been bound to a selection yet.
  const { data: inviterPurchases } = await admin
    .from("purchases")
    .select("id, type, status, invite_id, relationship_type")
    .eq("user_id", invite.from_user_id);

  const { data: inviteePurchases } = await admin
    .from("purchases")
    .select("id, type, status, invite_id, relationship_type")
    .eq("user_id", invite.to_user_id);

  // Build the set of purchase ids already attached to OTHER comparison
  // selections — those are "consumed" and don't count as paid-for-this-pair.
  // Excluding the selection for the current (invite, type) lets a purchase
  // already attached to this exact row still register as paid for itself.
  //
  // Filter by purchase_id ∈ (this pair's purchases), NOT by selected_by:
  // a selection's selected_by can be either participant of the OTHER pair
  // the purchase is bound to (e.g. Sammy initiated Sammy↔Elliott Couples
  // backed by Elliott's purchase). Filtering by selected_by would miss
  // those rows and double-count the purchase as "available" for this pair.
  const candidatePurchaseIds = [
    ...((inviterPurchases ?? []).map((p) => p.id)),
    ...((inviteePurchases ?? []).map((p) => p.id)),
  ];
  const { data: consumedRows } = candidatePurchaseIds.length
    ? await admin
        .from("comparison_selections")
        .select("invite_id, relationship_type, purchase_id")
        .in("purchase_id", candidatePurchaseIds)
    : { data: [] };
  const consumedPurchaseIds = new Set<string>(
    (consumedRows ?? [])
      .filter(
        (r) =>
          !(r.invite_id === inviteId && r.relationship_type === relationshipType)
      )
      .map((r) => r.purchase_id as string)
  );

  const result = calculateComparisonPrice(
    inviterPurchases || [],
    inviteePurchases || [],
    relationshipType,
    consumedPurchaseIds,
  );

  // Whether the partner has an UNCONSUMED purchase TAGGED for THIS pair
  // (invite + relationship_type). Lets /compare render "partner has paid"
  // in the narrow window between Stripe returning success and the selection
  // row landing — without false-positives from purchases bound to a
  // DIFFERENT pair (the previous bug surfaced as "Elliott has paid" on
  // J. Paul's Couples row when Elliott had only paid for Sammy↔Elliott).
  const purchaseType =
    relationshipType === "couples"
      ? "couples_comparison"
      : relationshipType === "cofounders"
        ? "cofounders_comparison"
        : null;
  const hasUnconsumedPurchaseForThisPair = (
    rows:
      | {
          id: string;
          type: string;
          status: string;
          invite_id: string | null;
          relationship_type: string | null;
        }[]
      | null
      | undefined,
    t: string,
  ) =>
    (rows ?? []).some(
      (p) =>
        p.type === t &&
        p.status === "completed" &&
        !consumedPurchaseIds.has(p.id) &&
        // Only count purchases tagged for this exact pair. Legacy purchases
        // with invite_id null don't satisfy this — we don't want them to
        // imply a partner paid for THIS pair when their tag is missing.
        p.invite_id === inviteId &&
        p.relationship_type === relationshipType,
    );
  const partnerPurchases =
    user.id === invite.from_user_id ? inviteePurchases : inviterPurchases;
  const selfPurchases =
    user.id === invite.from_user_id ? inviterPurchases : inviteePurchases;
  const partnerHasPurchase =
    !!purchaseType &&
    hasUnconsumedPurchaseForThisPair(partnerPurchases, purchaseType);
  const selfHasPurchase =
    !!purchaseType &&
    hasUnconsumedPurchaseForThisPair(selfPurchases, purchaseType);

  // Whether each side has a completed personal assessment purchase.
  // Friends + paid comparisons all require this — without a personal report
  // there are no scores to compare. Surfaced separately from selfHasScores
  // so the UI can distinguish "hasn't paid yet" from "paid but quiz unfinished".
  const hasCompletedPersonal = (
    rows:
      | { type: string; status: string }[]
      | null
      | undefined,
  ) =>
    (rows ?? []).some(
      (p) => p.type === "personal" && p.status === "completed",
    );
  const selfPaidPersonal = hasCompletedPersonal(selfPurchases);
  const partnerPaidPersonal = hasCompletedPersonal(partnerPurchases);

  // Get selection state for this (invite, type) pair
  const { data: selection } = await admin
    .from("comparison_selections")
    .select("id, selected_by, confirmed_by, confirmed_at, report_id, compatibility_score, dismissed_at")
    .eq("invite_id", inviteId)
    .eq("relationship_type", relationshipType)
    .single();

  // Check who has actually completed the quiz (has a user_scores row).
  // bothAssessed in pricing.ts only reflects whether they PAID for the
  // personal assessment — it's possible to pay but never finish the quiz.
  // Without scores we can't generate a comparison report, so the UI needs
  // to surface the missing party.
  const { data: scoreRows } = await admin
    .from("user_scores")
    .select("user_id")
    .in("user_id", [invite.from_user_id, invite.to_user_id]);
  const scoredIds = new Set((scoreRows ?? []).map((r) => (r as { user_id: string }).user_id));
  const inviterHasScores = scoredIds.has(invite.from_user_id);
  const inviteeHasScores = !!invite.to_user_id && scoredIds.has(invite.to_user_id);
  const selfHasScores = user.id === invite.from_user_id ? inviterHasScores : inviteeHasScores;
  const partnerHasScores = user.id === invite.from_user_id ? inviteeHasScores : inviterHasScores;

  // Determine selection state relative to current user
  let selectionState: "none" | "i_selected" | "partner_selected" | "both_selected" | "complete" = "none";
  if (selection?.report_id) {
    selectionState = "complete";
  } else if (selection?.confirmed_by) {
    selectionState = "both_selected";
  } else if (selection?.selected_by === user.id) {
    selectionState = "i_selected";
  } else if (selection?.selected_by) {
    selectionState = "partner_selected";
  }

  // A confirmed selection with no report_id is actively being generated —
  // unless confirmed_at is older than the Vercel lambda timeout window, in
  // which case the lambda died and the report will never land on its own.
  // Flag that state so the UI can offer a retry instead of claiming
  // "Generating (2-4 min)..." indefinitely.
  const reportGenerationStale =
    selectionState === "both_selected" &&
    !!selection?.confirmed_at &&
    Date.now() - new Date(selection.confirmed_at).getTime() > STALE_GENERATING_MS;

  return NextResponse.json({
    price: result.price,
    isFree: result.isFree,
    bothAssessed: result.bothAssessed,
    isAvailable: result.isAvailable,
    productId: result.product?.id || null,
    selectionState,
    reportId: selection?.report_id || null,
    compatibilityScore: selection?.compatibility_score || null,
    selfHasScores,
    partnerHasScores,
    selfHasPurchase,
    partnerHasPurchase,
    selfPaidPersonal,
    partnerPaidPersonal,
    reportGenerationStale,
    dismissed: !!selection?.dismissed_at,
  });
}
