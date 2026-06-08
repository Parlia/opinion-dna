import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Admin scorecard metrics — the single source of truth for opiniondna.com/admin.
 *
 * Opinion DNA is a one-time purchase ($47 personal + paid comparison reports),
 * so there is no MRR. The scorecard is built around MONTHLY sales velocity:
 * month-to-date revenue and a daily run-rate against the £10K/month goal — not a
 * cumulative all-time total. All headline numbers are computed on REAL sales
 * (a completed Stripe charge with amount > 0 from a non-internal user). Comped
 * $0 rows and internal/test/founder accounts are excluded and reported
 * separately so the real number is never overstated.
 *
 * Both the embedded JSON blob on /admin and GET /api/admin/metrics serialize the
 * `AdminMetrics` object below, so a human and an automated agent read the exact
 * same snapshot. Numbers that can't be computed yet are `null` (the consumer
 * flags them "not yet tracked") rather than a wrong value.
 */

// ---------------------------------------------------------------------------
// Live product prices (source of truth: src/lib/stripe/products.ts).
// The upgrade brief used $67/$97 placeholders; the real prices are below.
// ---------------------------------------------------------------------------
const PRICE_PERSONAL_USD = 47;
const PRICE_COUPLES_USD = 49;
const PRICE_COFOUNDERS_USD = 399;

// £10,000/month goal. USD target uses ~1.26 USD/GBP (brief's figure); sales
// target derives from the $47 personal price.
const TARGET_GBP = 10000;
const TARGET_USD = 12600;
const MONTHLY_SALES_TARGET = Math.round(TARGET_USD / PRICE_PERSONAL_USD); // 268
const DAILY_SALES_TARGET = 9;

const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface FunnelWindow {
  quiz_starts: number | null; // not tracked in-app (lives in analytics)
  signups: number;
  quiz_completed: number;
  paid_personal: number;
  report_ready: number;
  signup_to_paid_rate: number | null;
  quiz_complete_rate: number | null;
  paid_to_report_rate: number | null;
}

interface ProductStat {
  price_usd: number;
  sales_mtd: number;
  revenue_mtd_usd: number;
  sales_all_time: number;
  revenue_all_time_usd: number;
}

export interface AdminMetrics {
  as_of: string;
  timezone: string;
  goal: {
    monthly_revenue_target_gbp: number;
    monthly_revenue_target_usd: number;
    monthly_sales_target: number;
    daily_sales_target: number;
  };
  sales: {
    today_count: number;
    today_revenue_usd: number;
    mtd_count: number;
    mtd_revenue_usd: number;
    mtd_net_revenue_usd: number;
    mtd_progress_pct: number;
    mtd_run_rate_per_day: number;
    projected_month_end_usd: number;
    last_7d_count: number;
    last_7d_revenue_usd: number;
    last_30d_count: number;
    last_30d_revenue_usd: number;
    all_time_count: number;
    all_time_revenue_usd: number;
    refunds_mtd_count: number;
    refunds_mtd_usd: number;
    days_since_last_real_sale: number | null;
  };
  products: {
    personal: ProductStat;
    couples: ProductStat;
    cofounders: ProductStat;
  };
  comparisons: {
    friends_mtd: number;
    couples_mtd: number;
    cofounders_mtd: number;
    total_mtd: number;
    friends_all_time: number;
    couples_all_time: number;
    cofounders_all_time: number;
    total_all_time: number;
  };
  attach: {
    personal_buyers_mtd: number;
    buyers_with_paid_comparison: number;
    attach_rate: number | null;
  };
  funnel_mtd: FunnelWindow;
  funnel: {
    mtd: FunnelWindow;
    last_7d: FunnelWindow;
    last_30d: FunnelWindow;
    all_time: FunnelWindow;
  };
  channels: {
    tracked: boolean;
    note: string;
    rows: {
      source: string;
      signups: number;
      sales: number;
      revenue_usd: number;
      signup_to_paid_rate: number | null;
    }[];
  };
  referral_loop: {
    invites_sent_mtd: number;
    invites_accepted_mtd: number;
    invites_sent_all_time: number;
    invites_accepted_all_time: number;
    invite_accept_rate: number | null;
    invited_signups: number;
    invited_paid: number;
  };
  data_quality: {
    real_users: number;
    internal_or_test_users: number;
    comped_purchases_excluded_mtd: number;
    internal_flag_source: "db" | "heuristic";
  };
  history: { date: string; sales: number; revenue_usd: number; signups: number }[];
}

export interface AdminUserRow {
  userId: string;
  email: string;
  fullName: string | null;
  isInternal: boolean;
  channel: string;
  createdAt: string;
  quizCompleted: boolean;
  personalPaid: boolean;
  personalPaidAmountCents: number;
  personalReportStatus: "none" | "generating" | "completed" | "failed";
  invitesSent: number;
  invitesAccepted: number;
  comparisonsCompleted: number;
  lastActivityAt: string;
}

// ---------------------------------------------------------------------------
// Raw, normalized data — fetched once, reused by buildMetrics + buildUserRows
// ---------------------------------------------------------------------------
interface RawUser {
  id: string;
  email: string;
  createdAt: string;
}
interface RawProfile {
  id: string;
  fullName: string | null;
  isInternal: boolean;
}
interface RawPurchase {
  id: string;
  userId: string;
  type: string;
  status: string;
  amountCents: number;
  createdAt: string;
  updatedAt: string;
}
interface RawScore {
  userId: string;
  createdAt: string;
}
interface RawReport {
  userId: string;
  type: string;
  status: string;
  updatedAt: string;
}
interface RawInvite {
  id: string;
  fromUserId: string;
  toUserId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}
interface RawSelection {
  selectedBy: string;
  confirmedBy: string | null;
  reportId: string | null;
  relationshipType: string;
  updatedAt: string;
}

export interface AdminRaw {
  users: RawUser[];
  profiles: RawProfile[];
  scores: RawScore[];
  purchases: RawPurchase[];
  reports: RawReport[];
  invites: RawInvite[];
  selections: RawSelection[];
  /** Whether profiles.is_internal exists (migration 020 applied). */
  hasInternalColumn: boolean;
}

/** Email-based fallback used only before migration 020 adds is_internal. */
export function isInternalByHeuristic(email: string | null | undefined): boolean {
  if (!email) return false;
  const e = email.toLowerCase();
  return (
    e.endsWith("@neeleyworldwide.com") ||
    e.includes("+test") ||
    e.startsWith("odna.testflow") ||
    [
      "jpaulneeley@gmail.com",
      "tmunthe@gmail.com",
      "ewortham6@gmail.com",
      "alessandramillar@gmail.com",
    ].includes(e)
  );
}

export async function fetchAdminRaw(admin: SupabaseClient): Promise<AdminRaw> {
  // Try to read the is_internal column; fall back gracefully if migration 020
  // hasn't been applied yet so the dashboard never 500s.
  let profilesRows: { id: string; full_name: string | null; is_internal?: boolean }[] = [];
  let hasInternalColumn = true;
  const withFlag = await admin.from("profiles").select("id, full_name, is_internal");
  if (withFlag.error) {
    hasInternalColumn = false;
    const noFlag = await admin.from("profiles").select("id, full_name");
    profilesRows = (noFlag.data ?? []) as typeof profilesRows;
  } else {
    profilesRows = (withFlag.data ?? []) as typeof profilesRows;
  }

  const [usersResult, scoresResult, purchasesResult, reportsResult, invitesResult, selectionsResult] =
    await Promise.all([
      admin.auth.admin.listUsers({ perPage: 1000 }),
      admin.from("user_scores").select("user_id, created_at"),
      admin
        .from("purchases")
        .select("id, user_id, type, status, amount_cents, created_at, updated_at")
        .order("created_at", { ascending: false }),
      admin.from("reports").select("user_id, type, status, updated_at"),
      admin.from("invites").select("id, from_user_id, to_user_id, status, created_at, updated_at"),
      admin
        .from("comparison_selections")
        .select("selected_by, confirmed_by, report_id, relationship_type, updated_at"),
    ]);

  const users: RawUser[] = (usersResult.data?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? "(no email)",
    createdAt: u.created_at,
  }));

  const emailById = new Map(users.map((u) => [u.id, u.email]));

  const profiles: RawProfile[] = profilesRows.map((p) => ({
    id: p.id,
    fullName: p.full_name,
    isInternal: hasInternalColumn
      ? !!p.is_internal
      : isInternalByHeuristic(emailById.get(p.id)),
  }));

  return {
    users,
    profiles,
    hasInternalColumn,
    scores: (scoresResult.data ?? []).map((s) => {
      const r = s as { user_id: string; created_at: string };
      return { userId: r.user_id, createdAt: r.created_at };
    }),
    purchases: (purchasesResult.data ?? []).map((p) => {
      const r = p as {
        id: string;
        user_id: string;
        type: string;
        status: string;
        amount_cents: number;
        created_at: string;
        updated_at: string;
      };
      return {
        id: r.id,
        userId: r.user_id,
        type: r.type,
        status: r.status,
        amountCents: r.amount_cents,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    }),
    reports: (reportsResult.data ?? []).map((r) => {
      const x = r as { user_id: string; type: string; status: string; updated_at: string };
      return { userId: x.user_id, type: x.type, status: x.status, updatedAt: x.updated_at };
    }),
    invites: (invitesResult.data ?? []).map((i) => {
      const x = i as {
        id: string;
        from_user_id: string;
        to_user_id: string | null;
        status: string;
        created_at: string;
        updated_at: string;
      };
      return {
        id: x.id,
        fromUserId: x.from_user_id,
        toUserId: x.to_user_id,
        status: x.status,
        createdAt: x.created_at,
        updatedAt: x.updated_at,
      };
    }),
    selections: (selectionsResult.data ?? []).map((s) => {
      const x = s as {
        selected_by: string;
        confirmed_by: string | null;
        report_id: string | null;
        relationship_type: string;
        updated_at: string;
      };
      return {
        selectedBy: x.selected_by,
        confirmedBy: x.confirmed_by,
        reportId: x.report_id,
        relationshipType: x.relationship_type,
        updatedAt: x.updated_at,
      };
    }),
  };
}

// ---------------------------------------------------------------------------
// Metric computation
// ---------------------------------------------------------------------------
const usd = (cents: number) => Math.round(cents) / 100;
const rate = (num: number, denom: number): number | null =>
  denom > 0 ? Math.round((num / denom) * 1000) / 1000 : null;

export function buildMetrics(raw: AdminRaw, now: Date): AdminMetrics {
  const internalIds = new Set(raw.profiles.filter((p) => p.isInternal).map((p) => p.id));
  const isInternal = (userId: string) => internalIds.has(userId);

  // UTC window boundaries (as_of is UTC; run-rate just needs consistent bounds).
  const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const todayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const nowMs = now.getTime();
  const sevenMs = nowMs - 7 * DAY_MS;
  const thirtyMs = nowMs - 30 * DAY_MS;
  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  const daysElapsed = now.getUTCDate(); // 1..daysInMonth, counts today as a (partial) day
  const ms = (iso: string) => new Date(iso).getTime();

  // Real sale = completed, amount > 0, non-internal user.
  const realSales = raw.purchases.filter(
    (p) => p.status === "completed" && p.amountCents > 0 && !isInternal(p.userId)
  );
  const sumUsd = (rows: RawPurchase[]) => usd(rows.reduce((s, p) => s + p.amountCents, 0));
  const inWin = (rows: RawPurchase[], startMs: number) => rows.filter((p) => ms(p.createdAt) >= startMs);

  const mtdSales = inWin(realSales, monthStart);
  const todaySales = inWin(realSales, todayStart);
  const last7Sales = inWin(realSales, sevenMs);
  const last30Sales = inWin(realSales, thirtyMs);

  // Refunds: refunded rows whose refund (updated_at) lands this month.
  const refundsMtd = raw.purchases.filter(
    (p) => p.status === "refunded" && !isInternal(p.userId) && ms(p.updatedAt) >= monthStart
  );

  const mtdRevenue = sumUsd(mtdSales);
  const refundsMtdUsd = sumUsd(refundsMtd);
  const mtdNet = mtdRevenue - refundsMtdUsd;

  const sortedRealByDate = [...realSales].sort((a, b) => ms(b.createdAt) - ms(a.createdAt));
  const lastSale = sortedRealByDate[0];
  const daysSinceLastSale = lastSale
    ? Math.floor((nowMs - ms(lastSale.createdAt)) / DAY_MS)
    : null;

  const sales: AdminMetrics["sales"] = {
    today_count: todaySales.length,
    today_revenue_usd: sumUsd(todaySales),
    mtd_count: mtdSales.length,
    mtd_revenue_usd: mtdRevenue,
    mtd_net_revenue_usd: mtdNet,
    mtd_progress_pct: Math.round((mtdNet / TARGET_USD) * 1000) / 10,
    mtd_run_rate_per_day: daysElapsed > 0 ? Math.round((mtdSales.length / daysElapsed) * 100) / 100 : 0,
    projected_month_end_usd:
      daysElapsed > 0 ? Math.round((mtdRevenue / daysElapsed) * daysInMonth) : 0,
    last_7d_count: last7Sales.length,
    last_7d_revenue_usd: sumUsd(last7Sales),
    last_30d_count: last30Sales.length,
    last_30d_revenue_usd: sumUsd(last30Sales),
    all_time_count: realSales.length,
    all_time_revenue_usd: sumUsd(realSales),
    refunds_mtd_count: refundsMtd.length,
    refunds_mtd_usd: refundsMtdUsd,
    days_since_last_real_sale: daysSinceLastSale,
  };

  // Per-product (real paid only).
  const productStat = (type: string, priceUsd: number): ProductStat => {
    const all = realSales.filter((p) => p.type === type);
    const mtd = inWin(all, monthStart);
    return {
      price_usd: priceUsd,
      sales_mtd: mtd.length,
      revenue_mtd_usd: sumUsd(mtd),
      sales_all_time: all.length,
      revenue_all_time_usd: sumUsd(all),
    };
  };
  const products = {
    personal: productStat("personal", PRICE_PERSONAL_USD),
    couples: productStat("couples_comparison", PRICE_COUPLES_USD),
    cofounders: productStat("cofounders_comparison", PRICE_COFOUNDERS_USD),
  };

  // Comparisons by type (completed selections = has a report). Not revenue —
  // friends are free — so this is a volume read, kept windowed.
  const completedSelections = raw.selections.filter((s) => !!s.reportId);
  const compCount = (type: string, startMs?: number) =>
    completedSelections.filter(
      (s) => s.relationshipType === type && (startMs === undefined || ms(s.updatedAt) >= startMs)
    ).length;
  const comparisons = {
    friends_mtd: compCount("friends", monthStart),
    couples_mtd: compCount("couples", monthStart),
    cofounders_mtd: compCount("cofounders", monthStart),
    total_mtd: completedSelections.filter((s) => ms(s.updatedAt) >= monthStart).length,
    friends_all_time: compCount("friends"),
    couples_all_time: compCount("couples"),
    cofounders_all_time: compCount("cofounders"),
    total_all_time: completedSelections.length,
  };

  // Attach rate: of distinct real personal buyers this month, how many also have
  // any real paid comparison purchase (couples/cofounders, ever).
  const personalBuyersMtd = new Set(
    mtdSales.filter((p) => p.type === "personal").map((p) => p.userId)
  );
  const paidComparisonBuyers = new Set(
    realSales
      .filter((p) => p.type === "couples_comparison" || p.type === "cofounders_comparison")
      .map((p) => p.userId)
  );
  let buyersWithComparison = 0;
  personalBuyersMtd.forEach((uid) => {
    if (paidComparisonBuyers.has(uid)) buyersWithComparison += 1;
  });
  const attach = {
    personal_buyers_mtd: personalBuyersMtd.size,
    buyers_with_paid_comparison: buyersWithComparison,
    attach_rate: rate(buyersWithComparison, personalBuyersMtd.size),
  };

  // Funnel — flow within a window, real signals only. quiz_starts is null (the
  // true top of funnel lives in Vercel Analytics, not the app DB).
  const realUsers = raw.users.filter((u) => !isInternal(u.id));
  const realScores = raw.scores.filter((s) => !isInternal(s.userId));
  const realPersonalSales = realSales.filter((p) => p.type === "personal");
  const reportReady = raw.reports.filter(
    (r) => r.type === "personal" && r.status === "completed" && !isInternal(r.userId)
  );
  const funnelWindow = (startMs: number | null): FunnelWindow => {
    const inW = (iso: string) => startMs === null || ms(iso) >= startMs;
    const signups = realUsers.filter((u) => inW(u.createdAt)).length;
    const quizCompleted = realScores.filter((s) => inW(s.createdAt)).length;
    const paid = realPersonalSales.filter((p) => inW(p.createdAt)).length;
    const reportReadyCount = reportReady.filter((r) => inW(r.updatedAt)).length;
    return {
      quiz_starts: null,
      signups,
      quiz_completed: quizCompleted,
      paid_personal: paid,
      report_ready: reportReadyCount,
      signup_to_paid_rate: rate(paid, signups),
      quiz_complete_rate: rate(quizCompleted, signups),
      paid_to_report_rate: rate(reportReadyCount, paid),
    };
  };
  const funnel = {
    mtd: funnelWindow(monthStart),
    last_7d: funnelWindow(sevenMs),
    last_30d: funnelWindow(thirtyMs),
    all_time: funnelWindow(null),
  };

  // Channels — UTM/source capture isn't wired yet, so everything is "unknown".
  // Honest scaffold: real MTD totals in one bucket, flagged untracked.
  const channels = {
    tracked: false,
    note: "UTM/source capture not yet wired — all signups bucketed as unknown. Add utm_* capture at signup to break this down.",
    rows: [
      {
        source: "unknown",
        signups: realUsers.filter((u) => ms(u.createdAt) >= monthStart).length,
        sales: mtdSales.length,
        revenue_usd: mtdRevenue,
        signup_to_paid_rate: null,
      },
    ],
  };

  // Referral / invite loop. Exclude internal senders (founder test invites).
  const realInvites = raw.invites.filter((i) => !isInternal(i.fromUserId));
  const acceptedInvites = realInvites.filter((i) => i.status === "accepted");
  const invitedUserIds = new Set(
    acceptedInvites.map((i) => i.toUserId).filter((id): id is string => !!id)
  );
  let invitedPaid = 0;
  invitedUserIds.forEach((uid) => {
    if (realPersonalSales.some((p) => p.userId === uid)) invitedPaid += 1;
  });
  const referral_loop = {
    invites_sent_mtd: realInvites.filter((i) => ms(i.createdAt) >= monthStart).length,
    invites_accepted_mtd: acceptedInvites.filter((i) => ms(i.updatedAt) >= monthStart).length,
    invites_sent_all_time: realInvites.length,
    invites_accepted_all_time: acceptedInvites.length,
    invite_accept_rate: rate(acceptedInvites.length, realInvites.length),
    invited_signups: invitedUserIds.size,
    invited_paid: invitedPaid,
  };

  // Data quality.
  const compedExcludedMtd = raw.purchases.filter(
    (p) =>
      p.status === "completed" &&
      ms(p.createdAt) >= monthStart &&
      (p.amountCents === 0 || isInternal(p.userId))
  ).length;
  const data_quality = {
    real_users: realUsers.length,
    internal_or_test_users: raw.users.length - realUsers.length,
    comped_purchases_excluded_mtd: compedExcludedMtd,
    internal_flag_source: raw.hasInternalColumn ? ("db" as const) : ("heuristic" as const),
  };

  // History — derived from real-sale + signup timestamps over the last 30 UTC
  // days (zero-filled). Real, retroactive, no snapshot table needed.
  const history: AdminMetrics["history"] = [];
  for (let i = 29; i >= 0; i--) {
    const dayStart = todayStart - i * DAY_MS;
    const dayEnd = dayStart + DAY_MS;
    const dayName = new Date(dayStart).toISOString().slice(0, 10);
    const daySales = realSales.filter((p) => ms(p.createdAt) >= dayStart && ms(p.createdAt) < dayEnd);
    history.push({
      date: dayName,
      sales: daySales.length,
      revenue_usd: sumUsd(daySales),
      signups: realUsers.filter((u) => ms(u.createdAt) >= dayStart && ms(u.createdAt) < dayEnd).length,
    });
  }

  return {
    as_of: now.toISOString(),
    timezone: "UTC",
    goal: {
      monthly_revenue_target_gbp: TARGET_GBP,
      monthly_revenue_target_usd: TARGET_USD,
      monthly_sales_target: MONTHLY_SALES_TARGET,
      daily_sales_target: DAILY_SALES_TARGET,
    },
    sales,
    products,
    comparisons,
    attach,
    funnel_mtd: funnel.mtd,
    funnel,
    channels,
    referral_loop,
    data_quality,
    history,
  };
}

export interface RecentSale {
  createdAt: string;
  email: string;
  type: string;
  amountCents: number;
  channel: string;
}

/** Recent REAL sales (completed, amount > 0, non-internal), newest first. */
export function buildRecentRealSales(raw: AdminRaw, limit = 12): RecentSale[] {
  const internalIds = new Set(raw.profiles.filter((p) => p.isInternal).map((p) => p.id));
  const emailById = new Map(raw.users.map((u) => [u.id, u.email]));
  return raw.purchases
    .filter((p) => p.status === "completed" && p.amountCents > 0 && !internalIds.has(p.userId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map((p) => ({
      createdAt: p.createdAt,
      email: emailById.get(p.userId) ?? "(unknown)",
      type: p.type,
      amountCents: p.amountCents,
      channel: "unknown",
    }));
}

export function buildUserRows(raw: AdminRaw): AdminUserRow[] {
  const internalIds = new Set(raw.profiles.filter((p) => p.isInternal).map((p) => p.id));
  const profileById = new Map(raw.profiles.map((p) => [p.id, p]));
  const scoreByUser = new Set(raw.scores.map((s) => s.userId));
  const ms = (iso: string) => new Date(iso).getTime();

  const rows = raw.users.map((u): AdminUserRow => {
    const myPurchases = raw.purchases.filter((p) => p.userId === u.id);
    const personalCompleted = myPurchases.find(
      (p) => p.type === "personal" && p.status === "completed"
    );
    const myReports = raw.reports.filter((r) => r.userId === u.id);
    const personalReport = myReports.find((r) => r.type === "personal");
    const myInvites = raw.invites.filter((i) => i.fromUserId === u.id);
    const mySelections = raw.selections.filter(
      (s) => s.selectedBy === u.id || s.confirmedBy === u.id
    );

    const activity = [
      u.createdAt,
      ...myPurchases.map((p) => p.createdAt),
      ...myReports.map((r) => r.updatedAt),
      ...myInvites.map((i) => i.updatedAt),
      ...mySelections.map((s) => s.updatedAt),
    ].filter(Boolean);
    const lastActivityAt = activity.sort((a, b) => ms(b) - ms(a))[0] ?? u.createdAt;

    return {
      userId: u.id,
      email: u.email,
      fullName: profileById.get(u.id)?.fullName ?? null,
      isInternal: internalIds.has(u.id),
      channel: "unknown",
      createdAt: u.createdAt,
      quizCompleted: scoreByUser.has(u.id),
      personalPaid: !!personalCompleted,
      personalPaidAmountCents: personalCompleted?.amountCents ?? 0,
      personalReportStatus: (personalReport?.status ?? "none") as AdminUserRow["personalReportStatus"],
      invitesSent: myInvites.length,
      invitesAccepted: myInvites.filter((i) => i.status === "accepted").length,
      comparisonsCompleted: mySelections.filter((s) => !!s.reportId).length,
      lastActivityAt,
    };
  });

  rows.sort((a, b) => ms(b.lastActivityAt) - ms(a.lastActivityAt));
  return rows;
}
