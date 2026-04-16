export type ProductType =
  | "personal"
  | "couples"
  | "cofounders"
  | "teams"
  | "coaching"
  | "couples_upgrade"
  | "cofounders_upgrade"
  | "couples_upgrade_single"
  | "cofounders_upgrade_single";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  type: ProductType;
  features: string[];
  /** If true, this is an upgrade product (not shown on landing pages) */
  isUpgrade?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "personal",
    name: "Personal",
    description: "Your complete psychographic profile",
    price: 47,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PERSONAL || "",
    type: "personal",
    features: [
      "179-question assessment",
      "48 element scores",
      "AI-generated personal report",
      "View on site",
    ],
  },
  {
    id: "couples",
    name: "Couples",
    description: "Understand your relationship dynamics",
    price: 149,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COUPLES || "",
    type: "couples",
    features: [
      "Two assessments included",
      "Individual reports for each person",
      "Comparison report",
      "Communication & conflict insights",
    ],
  },
  {
    id: "cofounders",
    name: "Co-Founders",
    description: "Build a stronger founding team",
    price: 499,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COFOUNDERS || "",
    type: "cofounders",
    features: [
      "Two assessments included",
      "Individual reports for each person",
      "Co-founder dynamics report",
      "Personal call with an expert",
    ],
  },
  {
    id: "teams",
    name: "Teams",
    description: "Unlock your team's potential",
    price: 499,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAMS || "",
    type: "teams",
    features: [
      "Up to 5 assessments",
      "Individual reports for each person",
      "Team dynamics report",
      "Group insights & recommendations",
    ],
  },
];

// ── Upgrade Products (not shown on landing pages) ────────────────────────────
// These are purchased from the /compare page when users already have assessments

export const UPGRADE_PRODUCTS: Product[] = [
  {
    id: "couples_upgrade",
    name: "Couples Comparison (both assessed)",
    description: "Comparison report when both partners have Personal assessments",
    price: 49,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COUPLES_UPGRADE || "",
    type: "couples_upgrade",
    features: ["Couples comparison report", "Communication & conflict insights"],
    isUpgrade: true,
  },
  {
    id: "cofounders_upgrade",
    name: "Co-Founders Comparison (both assessed)",
    description: "Co-founder dynamics report when both have Personal assessments",
    price: 399,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COFOUNDERS_UPGRADE || "",
    type: "cofounders_upgrade",
    features: ["Co-founder dynamics report", "Compatibility scoring"],
    isUpgrade: true,
  },
  {
    id: "couples_upgrade_single",
    name: "Couples Comparison (one assessed)",
    description: "Comparison report when one partner has a Personal assessment",
    price: 99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COUPLES_UPGRADE_SINGLE || "",
    type: "couples_upgrade_single",
    features: ["Partner's assessment included", "Couples comparison report"],
    isUpgrade: true,
  },
  {
    id: "cofounders_upgrade_single",
    name: "Co-Founders Comparison (one assessed)",
    description: "Co-founder dynamics report when one partner has a Personal assessment",
    price: 449,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COFOUNDERS_UPGRADE_SINGLE || "",
    type: "cofounders_upgrade_single",
    features: ["Partner's assessment included", "Co-founder dynamics report"],
    isUpgrade: true,
  },
];

export const ALL_PRODUCTS = [...PRODUCTS, ...UPGRADE_PRODUCTS];

export function findProduct(id: string): Product | undefined {
  return ALL_PRODUCTS.find(p => p.id === id);
}
