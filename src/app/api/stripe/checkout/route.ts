import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { findProduct } from "@/lib/stripe/products";

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("product") || "personal";
  const inviteId = request.nextUrl.searchParams.get("inviteId") || "";
  const relationshipType = request.nextUrl.searchParams.get("relationshipType") || "";
  const product = findProduct(productId);

  if (!product || !product.priceId) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL(`/login?next=/api/stripe/checkout?product=${productId}`, request.url)
    );
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: product.priceId, quantity: 1 }],
    mode: "payment",
    success_url: inviteId
      ? `${request.nextUrl.origin}/compare?purchase=success&session_id={CHECKOUT_SESSION_ID}&inviteId=${inviteId}`
      : `${request.nextUrl.origin}/dashboard?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: inviteId
      ? `${request.nextUrl.origin}/compare?purchase=cancelled`
      : `${request.nextUrl.origin}/dashboard?purchase=cancelled`,
    metadata: {
      user_id: user.id,
      product_type: product.type,
      ...(inviteId && { invite_id: inviteId }),
      ...(relationshipType && { relationship_type: relationshipType }),
    },
  });

  return NextResponse.redirect(session.url!);
}
