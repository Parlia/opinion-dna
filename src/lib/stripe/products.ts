export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  type: "personal" | "couples" | "cofounders" | "teams" | "coaching";
  features: string[];
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
