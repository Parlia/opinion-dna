import { describe, it, expect } from "vitest";
import { buildMetrics, buildUserRows, buildRecentRealSales, type AdminRaw } from "./metrics";

// Fixed "now": 2026-06-08T12:00:00Z → June has 30 days, 8 days elapsed.
const NOW = new Date("2026-06-08T12:00:00Z");

function makeRaw(): AdminRaw {
  return {
    hasInternalColumn: true,
    users: [
      { id: "real1", email: "chad@parry.org", createdAt: "2026-06-07T10:00:00Z" },
      { id: "real2", email: "alex@example.com", createdAt: "2026-06-02T10:00:00Z" },
      { id: "internal1", email: "tmunthe@gmail.com", createdAt: "2026-05-01T10:00:00Z" },
      { id: "comp1", email: "comped@example.com", createdAt: "2026-06-04T10:00:00Z" },
      { id: "refund1", email: "refunded@example.com", createdAt: "2026-04-01T10:00:00Z" },
    ],
    profiles: [
      { id: "real1", fullName: "Chad", isInternal: false },
      { id: "real2", fullName: "Alex", isInternal: false },
      { id: "internal1", fullName: "Turi", isInternal: true },
      { id: "comp1", fullName: "Comp", isInternal: false },
      { id: "refund1", fullName: "Refund", isInternal: false },
    ],
    scores: [
      { userId: "real1", createdAt: "2026-06-07T10:30:00Z" },
      { userId: "real2", createdAt: "2026-06-02T10:30:00Z" },
    ],
    purchases: [
      // real sale
      { id: "p1", userId: "real1", type: "personal", status: "completed", amountCents: 4700, createdAt: "2026-06-07T10:20:00Z", updatedAt: "2026-06-07T10:20:00Z" },
      // internal — excluded
      { id: "p2", userId: "internal1", type: "personal", status: "completed", amountCents: 4700, createdAt: "2026-06-03T10:00:00Z", updatedAt: "2026-06-03T10:00:00Z" },
      // comped $0 — excluded from revenue/real sale
      { id: "p3", userId: "comp1", type: "personal", status: "completed", amountCents: 0, createdAt: "2026-06-04T10:00:00Z", updatedAt: "2026-06-04T10:00:00Z" },
      // refunded this month
      { id: "p4", userId: "refund1", type: "personal", status: "refunded", amountCents: 4700, createdAt: "2026-04-02T10:00:00Z", updatedAt: "2026-06-05T10:00:00Z" },
    ],
    reports: [
      { userId: "real1", type: "personal", status: "completed", updatedAt: "2026-06-07T11:00:00Z" },
    ],
    invites: [
      { id: "i1", fromUserId: "real1", toUserId: "real2", status: "accepted", createdAt: "2026-06-02T09:00:00Z", updatedAt: "2026-06-03T09:00:00Z" },
      // internal sender — excluded from the loop
      { id: "i2", fromUserId: "internal1", toUserId: null, status: "pending", createdAt: "2026-06-02T09:00:00Z", updatedAt: "2026-06-02T09:00:00Z" },
    ],
    selections: [],
  };
}

describe("buildMetrics", () => {
  const m = buildMetrics(makeRaw(), NOW);

  it("counts only real sales (excludes internal + $0 comped + refunded)", () => {
    expect(m.sales.all_time_count).toBe(1);
    expect(m.sales.mtd_count).toBe(1);
    expect(m.sales.mtd_revenue_usd).toBe(47);
  });

  it("subtracts refunds for net revenue and reports refunds MTD", () => {
    expect(m.sales.refunds_mtd_count).toBe(1);
    expect(m.sales.refunds_mtd_usd).toBe(47);
    expect(m.sales.mtd_net_revenue_usd).toBe(0);
    expect(m.sales.mtd_progress_pct).toBe(0);
  });

  it("computes run-rate and month-end projection", () => {
    // 1 sale / 8 days elapsed ≈ 0.13/day
    expect(m.sales.mtd_run_rate_per_day).toBeCloseTo(0.13, 2);
    // $47 / 8 days * 30 days ≈ 176
    expect(m.sales.projected_month_end_usd).toBe(176);
  });

  it("tracks today's sales and freshness", () => {
    expect(m.sales.today_count).toBe(0); // last sale was 06-07, before 06-08
    expect(m.sales.days_since_last_real_sale).toBe(1);
  });

  it("builds an honest MTD funnel on real signals", () => {
    expect(m.funnel_mtd.signups).toBe(3); // real1, real2, comp1 (refund1 from April)
    expect(m.funnel_mtd.quiz_completed).toBe(2);
    expect(m.funnel_mtd.paid_personal).toBe(1); // comped $0 is NOT counted
    expect(m.funnel_mtd.report_ready).toBe(1);
    expect(m.funnel_mtd.quiz_starts).toBeNull();
    expect(m.funnel_mtd.signup_to_paid_rate).toBeCloseTo(0.333, 2);
    expect(m.funnel_mtd.paid_to_report_rate).toBe(1);
  });

  it("computes attach rate over MTD personal buyers", () => {
    expect(m.attach.personal_buyers_mtd).toBe(1);
    expect(m.attach.buyers_with_paid_comparison).toBe(0);
    expect(m.attach.attach_rate).toBe(0);
  });

  it("tracks the referral loop excluding internal senders", () => {
    expect(m.referral_loop.invites_sent_all_time).toBe(1); // i2 (internal sender) excluded
    expect(m.referral_loop.invites_accepted_all_time).toBe(1);
    expect(m.referral_loop.invite_accept_rate).toBe(1);
    expect(m.referral_loop.invited_signups).toBe(1);
    expect(m.referral_loop.invited_paid).toBe(0); // real2 never bought
  });

  it("reports data quality and flag source", () => {
    expect(m.data_quality.real_users).toBe(4);
    expect(m.data_quality.internal_or_test_users).toBe(1);
    expect(m.data_quality.comped_purchases_excluded_mtd).toBe(2); // internal + $0
    expect(m.data_quality.internal_flag_source).toBe("db");
  });

  it("derives 30-day history with the real sale on 06-07", () => {
    expect(m.history).toHaveLength(30);
    const jun7 = m.history.find((h) => h.date === "2026-06-07");
    expect(jun7).toEqual({ date: "2026-06-07", sales: 1, revenue_usd: 47, signups: 1 });
    const jun8 = m.history.find((h) => h.date === "2026-06-08");
    expect(jun8).toEqual({ date: "2026-06-08", sales: 0, revenue_usd: 0, signups: 0 });
  });

  it("uses the real product prices", () => {
    expect(m.products.personal.price_usd).toBe(47);
    expect(m.products.couples.price_usd).toBe(49);
    expect(m.products.cofounders.price_usd).toBe(399);
    expect(m.goal.monthly_revenue_target_gbp).toBe(10000);
  });

  it("scaffolds channels as untracked", () => {
    expect(m.channels.tracked).toBe(false);
    expect(m.channels.rows[0].source).toBe("unknown");
    expect(m.channels.rows[0].sales).toBe(1);
  });
});

describe("buildMetrics heuristic fallback", () => {
  it("flags internal accounts by email when the DB column is absent", () => {
    const raw = makeRaw();
    raw.hasInternalColumn = false;
    // simulate fetchAdminRaw's heuristic classification
    raw.profiles = raw.profiles.map((p) => ({
      ...p,
      isInternal: p.id === "internal1", // tmunthe@gmail.com matches the allowlist
    }));
    const m = buildMetrics(raw, NOW);
    expect(m.data_quality.internal_flag_source).toBe("heuristic");
    expect(m.data_quality.internal_or_test_users).toBe(1);
  });
});

describe("buildUserRows + buildRecentRealSales", () => {
  const raw = makeRaw();
  it("marks internal rows and sorts by last activity", () => {
    const rows = buildUserRows(raw);
    expect(rows).toHaveLength(5);
    expect(rows.find((r) => r.userId === "internal1")?.isInternal).toBe(true);
    expect(rows.find((r) => r.userId === "real1")?.personalPaid).toBe(true);
    expect(rows.every((r) => r.channel === "unknown")).toBe(true);
  });

  it("lists only real sales, newest first", () => {
    const recent = buildRecentRealSales(raw);
    expect(recent).toHaveLength(1);
    expect(recent[0].email).toBe("chad@parry.org");
    expect(recent[0].amountCents).toBe(4700);
  });
});
