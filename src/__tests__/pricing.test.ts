import { describe, it, expect } from "vitest";
import { calculateComparisonPrice } from "@/lib/stripe/pricing";

const assessed = { id: "p-assessed", type: "personal", status: "completed" };
const refunded = { id: "p-refunded", type: "personal", status: "refunded" };
const hasCofounders = { id: "p-cofounders", type: "cofounders_comparison", status: "completed" };

describe("calculateComparisonPrice", () => {
  it("both assessed + cofounders = $399", () => {
    const result = calculateComparisonPrice([assessed], [assessed], "cofounders");
    expect(result.price).toBe(399);
    expect(result.isFree).toBe(false);
    expect(result.bothAssessed).toBe(true);
    expect(result.product?.id).toBe("cofounders_comparison");
  });

  it("both assessed + couples = $49", () => {
    const result = calculateComparisonPrice([assessed], [assessed], "couples");
    expect(result.price).toBe(49);
    expect(result.isFree).toBe(false);
    expect(result.bothAssessed).toBe(true);
    expect(result.product?.id).toBe("couples_comparison");
  });

  it("only inviter assessed = not ready", () => {
    const result = calculateComparisonPrice([assessed], [], "cofounders");
    expect(result.bothAssessed).toBe(false);
    expect(result.price).toBe(399);
  });

  it("only invitee assessed = not ready", () => {
    const result = calculateComparisonPrice([], [assessed], "couples");
    expect(result.bothAssessed).toBe(false);
  });

  it("neither assessed = not ready", () => {
    const result = calculateComparisonPrice([], [], "cofounders");
    expect(result.bothAssessed).toBe(false);
  });

  it("already purchased cofounders comparison = free", () => {
    const result = calculateComparisonPrice([assessed, hasCofounders], [assessed], "cofounders");
    expect(result.isFree).toBe(true);
    expect(result.price).toBe(0);
    expect(result.product).toBeNull();
  });

  it("refunded assessment is not counted", () => {
    const result = calculateComparisonPrice([refunded], [assessed], "cofounders");
    expect(result.bothAssessed).toBe(false);
  });

  it("consumed comparison purchase no longer counts as free", () => {
    // The cofounders purchase is already attached to a different selection,
    // so this comparison must require a fresh payment.
    const consumed = new Set<string>(["p-cofounders"]);
    const result = calculateComparisonPrice(
      [assessed, hasCofounders],
      [assessed],
      "cofounders",
      consumed,
    );
    expect(result.isFree).toBe(false);
    expect(result.price).toBe(399);
    expect(result.product?.id).toBe("cofounders_comparison");
  });
});
