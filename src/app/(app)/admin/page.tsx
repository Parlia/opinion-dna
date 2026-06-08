import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/auth/admin";
import {
  fetchAdminRaw,
  buildMetrics,
  buildUserRows,
  buildRecentRealSales,
} from "@/lib/admin/metrics";
import { UsersTable } from "./UsersTable";
import { FunnelStrip } from "./FunnelStrip";

export const dynamic = "force-dynamic";

function usdFmt(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

const PRODUCT_LABEL: Record<string, string> = {
  personal: "Personal",
  couples_comparison: "Couples",
  cofounders_comparison: "Co-Founders",
  friends_comparison: "Friends",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    notFound();
  }

  const admin = createAdminClient();
  const raw = await fetchAdminRaw(admin);
  const now = new Date();
  const m = buildMetrics(raw, now);
  const rows = buildUserRows(raw);
  const recent = buildRecentRealSales(raw);

  const progress = Math.min(100, Math.max(0, m.sales.mtd_progress_pct));

  // Embedded machine-readable snapshot — same object as GET /api/admin/metrics.
  // Rendered as the text child of an inert <script type="application/json">.
  // We escape < > & to their \uXXXX JSON escapes (which JSON.parse decodes back)
  // so the payload cannot terminate the tag or be mangled by HTML entity rules.
  const metricsJson = JSON.stringify(m).replace(
    /[<>&]/g,
    (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <script id="odna-metrics" type="application/json">
        {metricsJson}
      </script>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Scorecard</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Month-to-date sales velocity toward £10,000/mo. Real sales only ·{" "}
            <span title="Source of internal/test exclusion flag">
              flag via {m.data_quality.internal_flag_source === "db" ? "DB" : "heuristic"}
            </span>{" "}
            · as of {new Date(m.as_of).toLocaleString()} UTC
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/api/admin/metrics"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            JSON &rarr;
          </a>
          <Link
            href="/admin/invites"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Invites detail &rarr;
          </Link>
        </div>
      </div>

      {m.data_quality.internal_flag_source === "heuristic" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Heuristic mode:</strong> the <code>profiles.is_internal</code> column isn&apos;t
          present yet. Apply migration <code>020_admin_internal_flag.sql</code> to make the
          internal/test flag editable and authoritative. Numbers below use an email-based fallback.
        </div>
      )}

      {/* Headline KPIs — month-to-date */}
      <section className="mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* MTD revenue with goal progress */}
          <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-3 md:col-span-2">
            <p className="text-xs text-[var(--muted)] uppercase tracking-wide">
              MTD revenue (real, net)
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--foreground)] tabular-nums">
              {usdFmt(m.sales.mtd_net_revenue_usd)}
              <span className="text-base font-normal text-[var(--muted)]">
                {" "}
                / {usdFmt(m.goal.monthly_revenue_target_usd)}
              </span>
            </p>
            <div className="mt-2 h-2 w-full rounded-full bg-[var(--beige-light)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--primary)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-[var(--muted)] tabular-nums">
              {m.sales.mtd_progress_pct}% to £{m.goal.monthly_revenue_target_gbp.toLocaleString()} goal
              {m.sales.refunds_mtd_count > 0 &&
                ` · ${usdFmt(m.sales.refunds_mtd_usd)} refunded (${m.sales.refunds_mtd_count})`}
            </p>
          </div>

          <KpiCard
            label="MTD sales"
            value={`${m.sales.mtd_count}`}
            sub={`/ ${m.goal.monthly_sales_target} · ${m.sales.mtd_run_rate_per_day}/day (target ${m.goal.daily_sales_target}/day)`}
          />
          <KpiCard
            label="Today"
            value={`${m.sales.today_count}`}
            sub={`${usdFmt(m.sales.today_revenue_usd)} today${
              m.sales.days_since_last_real_sale !== null
                ? ` · last sale ${m.sales.days_since_last_real_sale}d ago`
                : " · no sales yet"
            }`}
          />
        </div>
      </section>

      {/* Momentum + projection */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat label="Projected month-end" value={usdFmt(m.sales.projected_month_end_usd)} />
          <MiniStat
            label="Last 7 days"
            value={`${m.sales.last_7d_count} · ${usdFmt(m.sales.last_7d_revenue_usd)}`}
          />
          <MiniStat
            label="Last 30 days"
            value={`${m.sales.last_30d_count} · ${usdFmt(m.sales.last_30d_revenue_usd)}`}
          />
          <MiniStat
            label="All time"
            value={`${m.sales.all_time_count} · ${usdFmt(m.sales.all_time_revenue_usd)}`}
          />
        </div>
      </section>

      {/* Funnel (windowed) */}
      <FunnelStrip funnel={m.funnel} />

      {/* Channels */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3">
          Channels {m.channels.tracked ? "" : "· not tracked yet"}
        </h2>
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--beige-light)]">
              <tr className="text-xs uppercase tracking-wide text-[var(--muted)]">
                <th className="px-4 py-2 text-left font-medium">Source (MTD)</th>
                <th className="px-4 py-2 text-right font-medium">Signups</th>
                <th className="px-4 py-2 text-right font-medium">Sales</th>
                <th className="px-4 py-2 text-right font-medium">Revenue</th>
                <th className="px-4 py-2 text-right font-medium">Signup→Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {m.channels.rows.map((c) => (
                <tr key={c.source}>
                  <td className="px-4 py-2 text-[var(--foreground)]">{c.source}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{c.signups}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{c.sales}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{usdFmt(c.revenue_usd)}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-[var(--muted)]">
                    {c.signup_to_paid_rate === null
                      ? "—"
                      : `${Math.round(c.signup_to_paid_rate * 100)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!m.channels.tracked && (
          <p className="mt-2 text-xs text-[var(--muted)]">{m.channels.note}</p>
        )}
      </section>

      {/* Product mix & AOV */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3">
          Product mix &amp; AOV
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <ProductCard
            label="Personal"
            price={m.products.personal.price_usd}
            salesMtd={m.products.personal.sales_mtd}
            revenueMtd={m.products.personal.revenue_mtd_usd}
            allTime={m.products.personal.sales_all_time}
          />
          <ProductCard
            label="Couples"
            price={m.products.couples.price_usd}
            salesMtd={m.products.couples.sales_mtd}
            revenueMtd={m.products.couples.revenue_mtd_usd}
            allTime={m.products.couples.sales_all_time}
          />
          <ProductCard
            label="Co-Founders"
            price={m.products.cofounders.price_usd}
            salesMtd={m.products.cofounders.sales_mtd}
            revenueMtd={m.products.cofounders.revenue_mtd_usd}
            allTime={m.products.cofounders.sales_all_time}
          />
          <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-3">
            <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Attach rate</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)] tabular-nums">
              {m.attach.attach_rate === null
                ? "—"
                : `${Math.round(m.attach.attach_rate * 100)}%`}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {m.attach.buyers_with_paid_comparison}/{m.attach.personal_buyers_mtd} MTD buyers added a
              paid comparison
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-3">
            <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Refunds (MTD)</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)] tabular-nums">
              {m.sales.refunds_mtd_count}
            </p>
            <p className="text-xs text-[var(--muted)]">{usdFmt(m.sales.refunds_mtd_usd)} refunded</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Comparisons delivered (incl. free Friends) — MTD: {m.comparisons.total_mtd} (Friends{" "}
          {m.comparisons.friends_mtd} · Couples {m.comparisons.couples_mtd} · Co-Founders{" "}
          {m.comparisons.cofounders_mtd}) · all-time {m.comparisons.total_all_time}.
        </p>
      </section>

      {/* Referral loop */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3">
          Referral loop
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <LoopStep
            label="Invites sent"
            value={m.referral_loop.invites_sent_all_time}
            sub={`${m.referral_loop.invites_sent_mtd} MTD`}
          />
          <LoopStep
            label="Accepted"
            value={m.referral_loop.invites_accepted_all_time}
            sub={
              m.referral_loop.invite_accept_rate === null
                ? `${m.referral_loop.invites_accepted_mtd} MTD`
                : `${Math.round(m.referral_loop.invite_accept_rate * 100)}% accept · ${
                    m.referral_loop.invites_accepted_mtd
                  } MTD`
            }
          />
          <LoopStep label="Invited signups" value={m.referral_loop.invited_signups} />
          <LoopStep
            label="Invited paid"
            value={m.referral_loop.invited_paid}
            sub="became real buyers"
          />
        </div>
      </section>

      {/* Recent real purchases */}
      {recent.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3">
            Recent real purchases
          </h2>
          <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="relative">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="bg-[var(--beige-light)]">
                    <tr className="text-xs uppercase tracking-wide text-[var(--muted)]">
                      <th className="px-4 py-2 text-left font-medium">When</th>
                      <th className="px-4 py-2 text-left font-medium">User</th>
                      <th className="px-4 py-2 text-left font-medium">Product</th>
                      <th className="px-4 py-2 text-left font-medium">Channel</th>
                      <th className="px-4 py-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {recent.map((p, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-xs text-[var(--muted)] whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">{p.email}</td>
                        <td className="px-4 py-2 text-xs text-[var(--muted)]">
                          {PRODUCT_LABEL[p.type] ?? p.type}
                        </td>
                        <td className="px-4 py-2 text-xs text-[var(--muted)]">{p.channel}</td>
                        <td className="px-4 py-2 text-right font-mono tabular-nums">
                          {usdFmt(p.amountCents / 100)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent md:hidden"
              />
            </div>
          </div>
        </section>
      )}

      {/* All users (interactive: show/hide internal, per-row flag, delete) */}
      <UsersTable rows={rows} currentUserId={user!.id} />
    </div>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-3">
      <p className="text-xs text-[var(--muted)] uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-[var(--foreground)] tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-[var(--muted)] tabular-nums">{sub}</p>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-3">
      <p className="text-xs text-[var(--muted)] uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-lg font-medium text-[var(--foreground)] tabular-nums">{value}</p>
    </div>
  );
}

function ProductCard({
  label,
  price,
  salesMtd,
  revenueMtd,
  allTime,
}: {
  label: string;
  price: number;
  salesMtd: number;
  revenueMtd: number;
  allTime: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-3">
      <p className="text-xs text-[var(--muted)] uppercase tracking-wide">
        {label} <span className="normal-case">(${price})</span>
      </p>
      <p className="mt-1 text-2xl font-semibold text-[var(--foreground)] tabular-nums">
        {usdFmt(revenueMtd)}
      </p>
      <p className="text-xs text-[var(--muted)] tabular-nums">
        {salesMtd} MTD · {allTime} all-time
      </p>
    </div>
  );
}

function LoopStep({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-3">
      <p className="text-xs text-[var(--muted)] uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--foreground)] tabular-nums">{value}</p>
      {sub && <p className="text-xs text-[var(--muted)]">{sub}</p>}
    </div>
  );
}
