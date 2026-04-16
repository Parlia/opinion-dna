/**
 * Comparison Report Pricing Calculator
 *
 * Determines the correct price for a comparison report based on
 * what each partner has already purchased.
 *
 * Core principle: you always pay the bundle price minus what's
 * already been paid for assessments.
 *
 * ┌──────────────────────┬──────────┬────────────┬─────────┐
 * │ Assessments paid     │ Relation │ They pay   │ Product │
 * ├──────────────────────┼──────────┼────────────┼─────────┤
 * │ Both ($94)           │ Couples  │ $49        │ upgrade │
 * │ Both ($94)           │ Cofndrs  │ $399       │ upgrade │
 * │ One ($47)            │ Couples  │ $99        │ single  │
 * │ One ($47)            │ Cofndrs  │ $449       │ single  │
 * │ Neither              │ Couples  │ $149       │ bundle  │
 * │ Neither              │ Cofndrs  │ $499       │ bundle  │
 * │ Inviter has bundle   │ Either   │ Free       │ —       │
 * └──────────────────────┴──────────┴────────────┴─────────┘
 */

import { PRODUCTS, UPGRADE_PRODUCTS, type Product } from "./products";

export type RelationshipType = "couples" | "cofounders";

export interface PricingResult {
  /** The product to purchase (null if free) */
  product: Product | null;
  /** Display price in dollars */
  price: number;
  /** Whether this comparison is already paid for */
  isFree: boolean;
  /** Human-readable breakdown for the UI */
  breakdown: string;
  /** How many assessments are already covered */
  assessmentsCovered: number;
  /** Whether Couples report is available yet */
  isAvailable: boolean;
}

interface Purchase {
  type: string;
  status: string;
  amount_cents: number | null;
}

/** Bundle types that cover both assessments + comparison */
const BUNDLE_TYPES = new Set(["couples", "cofounders", "teams"]);

/** Types that include a Personal assessment */
const ASSESSMENT_TYPES = new Set(["personal", "couples", "cofounders", "teams", "couples_upgrade_single", "cofounders_upgrade_single"]);

/** Types that cover a comparison report */
const COMPARISON_TYPES: Record<string, Set<string>> = {
  couples: new Set(["couples", "couples_upgrade", "couples_upgrade_single"]),
  cofounders: new Set(["cofounders", "cofounders_upgrade", "cofounders_upgrade_single", "teams"]),
};

function hasCompletedPurchaseOfType(purchases: Purchase[], types: Set<string>): boolean {
  return purchases.some(p => p.status === "completed" && types.has(p.type));
}

function hasAssessment(purchases: Purchase[]): boolean {
  return purchases.some(p => p.status === "completed" && ASSESSMENT_TYPES.has(p.type));
}

export function calculateComparisonPrice(
  inviterPurchases: Purchase[],
  inviteePurchases: Purchase[],
  relationshipType: RelationshipType,
): PricingResult {
  const couplesAvailable = false; // Couples report not yet built — gate behind feature flag
  const isAvailable = relationshipType === "cofounders" || couplesAvailable;

  // 1. Check if inviter already has a covering bundle
  //    Co-Founders bundle covers both types; Couples only covers Couples
  const inviterHasBundle = hasCompletedPurchaseOfType(inviterPurchases, BUNDLE_TYPES);
  const inviterAlreadyHasComparison = hasCompletedPurchaseOfType(
    inviterPurchases,
    COMPARISON_TYPES[relationshipType] || new Set(),
  );

  // Co-Founders purchase subsumes Couples
  const inviterHasCofounders = hasCompletedPurchaseOfType(inviterPurchases, new Set(["cofounders"]));

  if (inviterAlreadyHasComparison || (relationshipType === "couples" && inviterHasCofounders)) {
    return {
      product: null,
      price: 0,
      isFree: true,
      breakdown: "Included with your purchase",
      assessmentsCovered: 2,
      isAvailable,
    };
  }

  if (inviterHasBundle) {
    return {
      product: null,
      price: 0,
      isFree: true,
      breakdown: "Included with your purchase",
      assessmentsCovered: 2,
      isAvailable,
    };
  }

  // 2. Count how many Personal assessments are covered
  const inviterHasAssessment = hasAssessment(inviterPurchases);
  const inviteeHasAssessment = hasAssessment(inviteePurchases);
  const assessmentsCovered = (inviterHasAssessment ? 1 : 0) + (inviteeHasAssessment ? 1 : 0);

  // 3. Select the right upgrade product
  const bundleProduct = PRODUCTS.find(p => p.type === relationshipType);

  if (assessmentsCovered === 2) {
    // Both have assessments — cheapest upgrade
    const upgradeType = `${relationshipType}_upgrade`;
    const product = UPGRADE_PRODUCTS.find(p => p.type === upgradeType)!;
    return {
      product,
      price: product.price,
      isFree: false,
      breakdown: `Both assessments completed ($94 covered). ${relationshipType === "cofounders" ? "Co-Founder" : "Couples"} comparison report.`,
      assessmentsCovered: 2,
      isAvailable,
    };
  }

  if (assessmentsCovered === 1) {
    // One has assessment — mid-tier upgrade (includes partner's assessment)
    const upgradeType = `${relationshipType}_upgrade_single`;
    const product = UPGRADE_PRODUCTS.find(p => p.type === upgradeType)!;
    const who = inviterHasAssessment ? "Your" : "Their";
    return {
      product,
      price: product.price,
      isFree: false,
      breakdown: `${who} assessment completed ($47 covered). Includes partner's assessment + comparison report.`,
      assessmentsCovered: 1,
      isAvailable,
    };
  }

  // Neither has paid — full bundle price
  return {
    product: bundleProduct || null,
    price: bundleProduct?.price || 0,
    isFree: false,
    breakdown: `Includes both assessments + comparison report.`,
    assessmentsCovered: 0,
    isAvailable,
  };
}
