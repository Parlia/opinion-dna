import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateComparisonPrice, type RelationshipType } from "@/lib/stripe/pricing";

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
    .select("type, status")
    .eq("user_id", invite.from_user_id);

  const { data: inviteePurchases } = await admin
    .from("purchases")
    .select("type, status")
    .eq("user_id", invite.to_user_id);

  const result = calculateComparisonPrice(
    inviterPurchases || [],
    inviteePurchases || [],
    relationshipType,
  );

  // Get selection state for this (invite, type) pair
  const { data: selection } = await admin
    .from("comparison_selections")
    .select("id, selected_by, confirmed_by, report_id, compatibility_score")
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
  });
}
