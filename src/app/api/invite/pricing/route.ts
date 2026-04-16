import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateComparisonPrice, type RelationshipType } from "@/lib/stripe/pricing";

export const dynamic = "force-dynamic";

/**
 * GET /api/invite/pricing?inviteId=X&type=cofounders|couples
 *
 * Returns the price for generating a comparison report.
 * Both partners must have completed their own Personal assessment.
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
    return NextResponse.json({ error: "inviteId and type (couples|cofounders|friends) required" }, { status: 400 });
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

  // Verify user is part of this invite
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

  return NextResponse.json({
    price: result.price,
    isFree: result.isFree,
    bothAssessed: result.bothAssessed,
    isAvailable: result.isAvailable,
    productId: result.product?.id || null,
  });
}
