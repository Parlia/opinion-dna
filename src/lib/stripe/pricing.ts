/**
 * Comparison Report Pricing
 *
 * Simple model: both partners must have completed their own Personal
 * assessment ($47 each). Then either can purchase the comparison add-on.
 *
 * ┌──────────────┬─────────┐
 * │ Relation     │ Price   │
 * ├──────────────┼─────────┤
 * │ Couples      │ $49     │
 * │ Co-Founders  │ $399    │
 * └──────────────┴─────────┘
 */

import { PRODUCTS, type Product } from "./products";

export type RelationshipType = "couples" | "cofounders" | "friends";

export interface PricingResult {
  /** The product to purchase (null if already purchased) */
  product: Product | null;
  /** Display price in dollars */
  price: number;
  /** Whether this comparison is already paid for */
  isFree: boolean;
  /** Whether both partners have completed assessments */
  bothAssessed: boolean;
  /** Whether this comparison type is available */
  isAvailable: boolean;
}

interface Purchase {
  id: string;
  type: string;
  status: string;
}

function hasCompletedAssessment(purchases: Purchase[]): boolean {
  return purchases.some(
    (p) => p.status === "completed" && p.type === "personal"
  );
}

/**
 * Per-pair pricing: a comparison purchase only counts as "already paid for"
 * when it hasn't been consumed by a different selection. `consumedPurchaseIds`
 * is the set of purchase ids already attached to other comparison_selections
 * rows — the caller excludes the selection for the current (invite, type) so
 * the row's own purchase still counts as paid for itself.
 */
function hasUnconsumedComparisonPurchase(
  purchases: Purchase[],
  relationshipType: RelationshipType,
  consumedPurchaseIds: Set<string>
): boolean {
  const type =
    relationshipType === "couples"
      ? "couples_comparison"
      : "cofounders_comparison";
  return purchases.some(
    (p) =>
      p.status === "completed" &&
      p.type === type &&
      !consumedPurchaseIds.has(p.id)
  );
}

export function calculateComparisonPrice(
  inviterPurchases: Purchase[],
  inviteePurchases: Purchase[],
  relationshipType: RelationshipType,
  consumedPurchaseIds: Set<string> = new Set()
): PricingResult {
  const isAvailable = true;
  const bothAssessed =
    hasCompletedAssessment(inviterPurchases) &&
    hasCompletedAssessment(inviteePurchases);

  // Friends comparison is always free
  if (relationshipType === "friends") {
    return {
      product: null,
      price: 0,
      isFree: true,
      bothAssessed,
      isAvailable,
    };
  }

  // Already purchased this comparison (and the purchase isn't already
  // attached to another selection)
  if (
    hasUnconsumedComparisonPurchase(
      inviterPurchases,
      relationshipType,
      consumedPurchaseIds
    )
  ) {
    return {
      product: null,
      price: 0,
      isFree: true,
      bothAssessed,
      isAvailable,
    };
  }

  const productId =
    relationshipType === "couples"
      ? "couples_comparison"
      : "cofounders_comparison";
  const product = PRODUCTS.find((p) => p.id === productId)!;

  return {
    product,
    price: product.price,
    isFree: false,
    bothAssessed,
    isAvailable,
  };
}
