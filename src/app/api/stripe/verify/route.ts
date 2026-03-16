import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
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

  // Check if purchase already recorded (webhook may have fired first)
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("purchases")
    .select("id")
    .eq("stripe_session_id", session.id)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ verified: true });
  }

  // Record the purchase
  const productType = (session.metadata?.product_type || "personal") as PurchaseType;

  const { error } = await admin.from("purchases").insert({
    user_id: user.id,
    type: productType,
    status: "completed",
    stripe_session_id: session.id,
    stripe_payment_intent_id:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null),
    amount_cents: session.amount_total ?? 0,
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
