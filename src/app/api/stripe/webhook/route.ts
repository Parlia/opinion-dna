import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PurchaseType } from "@/types/database";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const productType = session.metadata?.product_type as PurchaseType;

    if (userId && productType) {
      const supabase = createAdminClient();
      const inviteId = session.metadata?.invite_id;
      const relationshipType = session.metadata?.relationship_type;

      // Insert the purchase record
      const { data: purchase } = await supabase.from("purchases").insert({
        user_id: userId,
        type: productType,
        status: "completed",
        stripe_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
        amount_cents: session.amount_total ?? 0,
      }).select("id").single();

      // If this purchase is linked to an invite, update the invite
      if (inviteId && purchase) {
        await supabase.from("invites").update({
          comparison_purchase_id: purchase.id,
          ...(relationshipType && { relationship_type: relationshipType }),
        }).eq("id", inviteId);

        // If this is a bundle or single-upgrade that includes the partner's assessment,
        // create a zero-dollar Personal purchase for the invitee so hasPurchase() works
        const includesPartner = ["couples", "cofounders", "teams", "couples_upgrade_single", "cofounders_upgrade_single"].includes(productType);
        if (includesPartner) {
          const { data: invite } = await supabase
            .from("invites")
            .select("to_user_id")
            .eq("id", inviteId)
            .single();

          if (invite?.to_user_id) {
            // Check if invitee already has a purchase
            const { data: existing } = await supabase
              .from("purchases")
              .select("id")
              .eq("user_id", invite.to_user_id)
              .eq("status", "completed")
              .limit(1);

            if (!existing || existing.length === 0) {
              await supabase.from("purchases").insert({
                user_id: invite.to_user_id,
                type: "personal" as PurchaseType,
                status: "completed",
                stripe_session_id: session.id,
                amount_cents: 0, // Covered by partner's bundle
              });
            }
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
