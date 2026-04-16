export type ProductType = "personal" | "couples_comparison" | "cofounders_comparison" | "friends_comparison";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  type: ProductType;
  features: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: "personal",
    name: "Personal Assessment",
    description: "Your complete psychographic profile",
    price: 47,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PERSONAL || "",
    type: "personal",
    features: [
      "179-question assessment",
      "48 element scores",
      "AI-generated personal report",
    ],
  },
  {
    id: "couples_comparison",
    name: "Couples Comparison Report",
    description: "Understand your relationship dynamics",
    price: 49,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COUPLES_COMPARISON || "",
    type: "couples_comparison",
    features: [
      "Couples comparison report",
      "Communication & conflict insights",
    ],
  },
  {
    id: "cofounders_comparison",
    name: "Co-Founders Comparison Report",
    description: "Build a stronger founding team",
    price: 399,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COFOUNDERS_COMPARISON || "",
    type: "cofounders_comparison",
    features: [
      "Co-founder dynamics report",
      "Compatibility scoring",
      "Success factors & mitigation playbook",
    ],
  },
];

export function findProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
