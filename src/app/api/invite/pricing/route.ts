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

  // Get purchases for both users
  const { data: inviterPurchases } = await admin
    .from("purchases")
    .select("id, type, status")
    .eq("user_id", invite.from_user_id);

  const { data: inviteePurchases } = await admin
    .from("purchases")
    .select("id, type, status")
    .eq("user_id", invite.to_user_id);

  // Build the set of purchase ids already attached to OTHER comparison
  // selections — those are "consumed" and don't count as paid-for-this-pair.
  // Excluding the selection for the current (invite, type) lets a purchase
  // already attached to this exact row still register as paid for itself.
  const userIds = [invite.from_user_id, invite.to_user_id].filter(Boolean) as string[];
  const { data: consumedRows } = await admin
    .from("comparison_selections")
    .select("invite_id, relationship_type, purchase_id")
    .in("selected_by", userIds)
    .not("purchase_id", "is", null);
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

  // Whether the partner (not the current user) has an UNCONSUMED purchase
  // for this comparison. Lets /compare render "partner has paid" instead of
  // a second Stripe redirect if both users click Select in the narrow window
  // between A returning from Stripe and A's selection row getting inserted.
  // We must check unconsumed (not just any completed) — otherwise a partner
  // with a stale purchase already attached to a different comparison would
  // wrongly block this user from paying.
  const purchaseType =
    relationshipType === "couples"
      ? "couples_comparison"
      : relationshipType === "cofounders"
        ? "cofounders_comparison"
        : null;
  const hasUnconsumedPurchase = (
    rows: { id: string; type: string; status: string }[] | null | undefined,
    t: string
  ) =>
    (rows ?? []).some(
      (p) =>
        p.type === t &&
        p.status === "completed" &&
        !consumedPurchaseIds.has(p.id)
    );
  const partnerPurchases =
    user.id === invite.from_user_id ? inviteePurchases : inviterPurchases;
  const selfPurchases =
    user.id === invite.from_user_id ? inviterPurchases : inviteePurchases;
  const partnerHasPurchase =
    !!purchaseType && hasUnconsumedPurchase(partnerPurchases, purchaseType);
  const selfHasPurchase =
    !!purchaseType && hasUnconsumedPurchase(selfPurchases, purchaseType);

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
    reportGenerationStale,
    dismissed: !!selection?.dismissed_at,
  });
}
