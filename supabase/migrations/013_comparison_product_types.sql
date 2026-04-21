-- Align the purchase_type enum with the product IDs the app actually uses.
--
-- The app's PRODUCTS array and Stripe session metadata use "couples_comparison",
-- "cofounders_comparison", and "friends_comparison", but the enum only had
-- "couples" and "cofounders". Result: the Stripe webhook + /api/stripe/verify
-- couldn't insert a purchase row for any comparison checkout — Postgres rejected
-- the enum value and the user got stuck in a Stripe-redirect loop on /compare.
ALTER TYPE purchase_type ADD VALUE IF NOT EXISTS 'couples_comparison';
ALTER TYPE purchase_type ADD VALUE IF NOT EXISTS 'cofounders_comparison';
ALTER TYPE purchase_type ADD VALUE IF NOT EXISTS 'friends_comparison';
