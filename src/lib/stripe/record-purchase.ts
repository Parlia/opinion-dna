import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Single insert path for a completed Stripe checkout. Both the webhook
 * (`/api/stripe/webhook`) and the client-driven verify endpoint
 * (`/api/stripe/verify`) need to record a purchase, and Stripe redelivery
 * means either can fire first (or both for the same session). Centralising
 * the insert here keeps the columns in sync between paths and contains the
 * unique-violation idempotency in one place.
 *
 * Returns the purchase id whether it was inserted now or already existed.
 */
export interface CompletedPurchaseInput {
  userId: string;
  productType: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  amountCents: number;
  inviteId?: string | null;
  relationshipType?: string | null;
}

export interface CompletedPurchaseResult {
  purchaseId: string | null;
  alreadyExisted: boolean;
  error: { code?: string; message?: string } | null;
}

export async function recordCompletedPurchase(
  admin: SupabaseClient,
  input: CompletedPurchaseInput,
): Promise<CompletedPurchaseResult> {
  const { data, error } = await admin
    .from("purchases")
    .insert({
      user_id: input.userId,
      type: input.productType,
      status: "completed",
      stripe_session_id: input.stripeSessionId,
      stripe_payment_intent_id: input.stripePaymentIntentId,
      amount_cents: input.amountCents,
      invite_id: input.inviteId ?? null,
      relationship_type: input.relationshipType ?? null,
    })
    .select("id")
    .single();

  if (!error) {
    return { purchaseId: data.id as string, alreadyExisted: false, error: null };
  }

  // Unique violation on stripe_session_id — Stripe redelivered the event,
  // or the webhook + verify both fired. Look up the existing row.
  if (error.code === "23505") {
    const { data: existing } = await admin
      .from("purchases")
      .select("id")
      .eq("stripe_session_id", input.stripeSessionId)
      .maybeSingle();
    return {
      purchaseId: (existing?.id as string) ?? null,
      alreadyExisted: true,
      error: null,
    };
  }

  return { purchaseId: null, alreadyExisted: false, error };
}
