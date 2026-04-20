import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProductType } from "@/lib/stripe/products";

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
    const productType = session.metadata?.product_type as ProductType;

    if (userId && productType) {
      const supabase = createAdminClient();
      const inviteId = session.metadata?.invite_id;
      const relationshipType = session.metadata?.relationship_type;

      // Idempotency: Stripe can redeliver checkout.session.completed for up to
      // 72h. Migration 012 enforces a unique index on purchases.stripe_session_id,
      // so a replay surfaces as Postgres error 23505 (unique violation) instead
      // of a duplicate row. Treat that as success and look up the existing row.
      const { data: purchase, error: insertError } = await supabase
        .from("purchases")
        .insert({
          user_id: userId,
          type: productType,
          status: "completed",
          stripe_session_id: session.id,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
          amount_cents: session.amount_total ?? 0,
        })
        .select("id")
        .single();

      if (insertError && insertError.code !== "23505") {
        console.error("[stripe.webhook] purchase insert failed", insertError);
        return NextResponse.json({ error: "purchase insert failed" }, { status: 500 });
      }

      let purchaseId = purchase?.id;
      if (!purchaseId) {
        const { data: existing } = await supabase
          .from("purchases")
          .select("id")
          .eq("stripe_session_id", session.id)
          .maybeSingle();
        purchaseId = existing?.id;
      }

      if (inviteId && purchaseId) {
        await supabase.from("invites").update({
          comparison_purchase_id: purchaseId,
          ...(relationshipType && { relationship_type: relationshipType }),
        }).eq("id", inviteId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
