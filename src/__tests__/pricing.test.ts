import { describe, it, expect } from "vitest";
import { calculateComparisonPrice } from "@/lib/stripe/pricing";

const personalPurchase = { type: "personal", status: "completed", amount_cents: 4700 };
const couplesPurchase = { type: "couples", status: "completed", amount_cents: 14900 };
const cofoundersPurchase = { type: "cofounders", status: "completed", amount_cents: 49900 };
const refundedPurchase = { type: "personal", status: "refunded", amount_cents: 4700 };

describe("calculateComparisonPrice", () => {
  // ── Both have Personal assessments ─────────────────────────────────────
  it("both assessed + cofounders = $399 upgrade", () => {
    const result = calculateComparisonPrice(
      [personalPurchase],
      [personalPurchase],
      "cofounders",
    );
    expect(result.price).toBe(399);
    expect(result.isFree).toBe(false);
    expect(result.assessmentsCovered).toBe(2);
    expect(result.product?.type).toBe("cofounders_upgrade");
  });

  it("both assessed + couples = $49 upgrade", () => {
    const result = calculateComparisonPrice(
      [personalPurchase],
      [personalPurchase],
      "couples",
    );
    expect(result.price).toBe(49);
    expect(result.isFree).toBe(false);
    expect(result.product?.type).toBe("couples_upgrade");
  });

  // ── One has Personal assessment ────────────────────────────────────────
  it("inviter assessed only + cofounders = $449 single upgrade", () => {
    const result = calculateComparisonPrice(
      [personalPurchase],
      [],
      "cofounders",
    );
    expect(result.price).toBe(449);
    expect(result.isFree).toBe(false);
    expect(result.assessmentsCovered).toBe(1);
    expect(result.product?.type).toBe("cofounders_upgrade_single");
  });

  it("invitee assessed only + couples = $99 single upgrade", () => {
    const result = calculateComparisonPrice(
      [],
      [personalPurchase],
      "couples",
    );
    expect(result.price).toBe(99);
    expect(result.isFree).toBe(false);
    expect(result.product?.type).toBe("couples_upgrade_single");
  });

  // ── Neither has paid ───────────────────────────────────────────────────
  it("neither assessed + cofounders = $499 full bundle", () => {
    const result = calculateComparisonPrice([], [], "cofounders");
    expect(result.price).toBe(499);
    expect(result.isFree).toBe(false);
    expect(result.assessmentsCovered).toBe(0);
  });

  it("neither assessed + couples = $149 full bundle", () => {
    const result = calculateComparisonPrice([], [], "couples");
    expect(result.price).toBe(149);
    expect(result.isFree).toBe(false);
  });

  // ── Bundle already covers comparison ───────────────────────────────────
  it("inviter has cofounders bundle = free for cofounders", () => {
    const result = calculateComparisonPrice(
      [cofoundersPurchase],
      [],
      "cofounders",
    );
    expect(result.isFree).toBe(true);
    expect(result.price).toBe(0);
  });

  it("inviter has cofounders bundle = free for couples too (subsumes)", () => {
    const result = calculateComparisonPrice(
      [cofoundersPurchase],
      [],
      "couples",
    );
    expect(result.isFree).toBe(true);
    expect(result.price).toBe(0);
  });

  it("inviter has couples bundle = free for couples", () => {
    const result = calculateComparisonPrice(
      [couplesPurchase],
      [],
      "couples",
    );
    expect(result.isFree).toBe(true);
    expect(result.price).toBe(0);
  });

  // ── Edge cases ─────────────────────────────────────────────────────────
  it("refunded purchase is not counted", () => {
    const result = calculateComparisonPrice(
      [refundedPurchase],
      [personalPurchase],
      "cofounders",
    );
    expect(result.assessmentsCovered).toBe(1);
    expect(result.price).toBe(449);
  });

  it("couples report is not available (feature gated)", () => {
    const result = calculateComparisonPrice([], [], "couples");
    expect(result.isAvailable).toBe(false);
  });

  it("cofounders report is available", () => {
    const result = calculateComparisonPrice([], [], "cofounders");
    expect(result.isAvailable).toBe(true);
  });
});
