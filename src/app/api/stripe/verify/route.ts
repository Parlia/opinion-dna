import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
import { recordCompletedPurchase } from "@/lib/stripe/record-purchase";
import type { PurchaseType } from "@/types/database";

export async function POST(request: NextRequest) {
  const { session_id } = await request.json();

  if (!session_id) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  // Verify the user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Retrieve the checkout session from Stripe
  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(session_id);
  } catch {
    return NextResponse.json(
      { error: "Invalid session" },
      { status: 400 }
    );
  }

  // Verify the session belongs to this user
  if (session.metadata?.user_id !== user.id) {
    return NextResponse.json({ error: "Session mismatch" }, { status: 403 });
  }

  // Check payment was successful
  if (session.payment_status !== "paid") {
    return NextResponse.json({ verified: false, status: session.payment_status });
  }

  // Insert via the shared helper so columns + idempotency stay in sync with
  // the webhook path. Either side can fire first depending on Stripe latency.
  const admin = createAdminClient();
  const productType = (session.metadata?.product_type || "personal") as PurchaseType;
  const inviteId = session.metadata?.invite_id ?? null;
  const relationshipType = session.metadata?.relationship_type ?? null;

  const { error } = await recordCompletedPurchase(admin, {
    userId: user.id,
    productType,
    stripeSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null),
    amountCents: session.amount_total ?? 0,
    inviteId,
    relationshipType,
  });

  if (error) {
    console.error("Failed to record purchase:", error);
    return NextResponse.json(
      { error: "Failed to record purchase" },
      { status: 500 }
    );
  }

  return NextResponse.json({ verified: true });
}
