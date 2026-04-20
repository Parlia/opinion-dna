import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

interface UserRow {
  userId: string;
  email: string;
  fullName: string | null;
  createdAt: string;
  quizCompleted: boolean;
  quizCompletedAt: string | null;
  personalPaid: boolean;
  personalPaidAmount: number;
  personalReportStatus: "none" | "generating" | "completed" | "failed";
  invitesSent: number;
  invitesAccepted: number;
  comparisonsCompleted: number;
  comparisonsPaid: number;
  lastActivityAt: string;
}

interface DashboardData {
  rows: UserRow[];
  totals: {
    users: number;
    quizCompleted: number;
    personalPaid: number;
    personalReportCompleted: number;
    invitesSent: number;
    invitesAccepted: number;
    comparisonsCompleted: number;
  };
  revenue: {
    totalCents: number;
    personalCents: number;
    comparisonCents: number;
    last7DaysCents: number;
  };
  recentPurchases: {
    createdAt: string;
    email: string;
    type: string;
    amountCents: number;
    status: string;
  }[];
}

async function fetchDashboard(): Promise<DashboardData> {
  const admin = createAdminClient();

  const [
    usersResult,
    profilesResult,
    scoresResult,
    purchasesResult,
    reportsResult,
    invitesResult,
    selectionsResult,
  ] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("profiles").select("id, full_name"),
    admin.from("user_scores").select("user_id, created_at"),
    admin
      .from("purchases")
      .select("id, user_id, type, status, amount_cents, created_at, stripe_session_id")
      .order("created_at", { ascending: false }),
    admin.from("reports").select("user_id, type, status, updated_at"),
    admin
      .from("invites")
      .select("id, from_user_id, to_user_id, status, updated_at"),
    admin
      .from("comparison_selections")
      .select("selected_by, confirmed_by, report_id, purchase_id, updated_at"),
  ]);

  const authUsers = usersResult.data?.users ?? [];
  const profiles = profilesResult.data ?? [];
  const scores = scoresResult.data ?? [];
  const purchases = purchasesResult.data ?? [];
  const reports = reportsResult.data ?? [];
  const invites = invitesResult.data ?? [];
  const selections = selectionsResult.data ?? [];

  const profileByUser = new Map(
    profiles.map((p) => [
      (p as { id: string; full_name: string | null }).id,
      (p as { id: string; full_name: string | null }).full_name,
    ])
  );

  const scoreByUser = new Map(
    scores.map((s) => [
      (s as { user_id: string; created_at: string }).user_id,
      (s as { user_id: string; created_at: string }).created_at,
    ])
  );

  const emailById = new Map<string, string>();
  for (const u of authUsers) emailById.set(u.id, u.email ?? "(no email)");

  const rows: UserRow[] = authUsers.map((u) => {
    const myPurchases = purchases.filter(
      (p) => (p as { user_id: string }).user_id === u.id
    );
    const personalCompleted = myPurchases.find(
      (p) =>
        (p as { type: string; status: string }).type === "personal" &&
        (p as { type: string; status: string }).status === "completed"
    );
    const myReports = reports.filter(
      (r) => (r as { user_id: string }).user_id === u.id
    );
    const personalReport = myReports.find(
      (r) => (r as { type: string }).type === "personal"
    );
    const myInvites = invites.filter(
      (i) => (i as { from_user_id: string }).from_user_id === u.id
    );
    const mySelections = selections.filter(
      (s) =>
        (s as { selected_by: string; confirmed_by: string | null })
          .selected_by === u.id ||
        (s as { selected_by: string; confirmed_by: string | null })
          .confirmed_by === u.id
    );

    const activityCandidates = [
      u.created_at,
      scoreByUser.get(u.id),
      ...myPurchases.map((p) => (p as { created_at: string }).created_at),
      ...myReports.map((r) => (r as { updated_at: string }).updated_at),
      ...myInvites.map((i) => (i as { updated_at: string }).updated_at),
      ...mySelections.map((s) => (s as { updated_at: string }).updated_at),
    ].filter(Boolean) as string[];

    const lastActivityAt =
      activityCandidates.sort((a, b) => (a > b ? -1 : 1))[0] ?? u.created_at;

    return {
      userId: u.id,
      email: u.email ?? "(no email)",
      fullName: profileByUser.get(u.id) ?? null,
      createdAt: u.created_at,
      quizCompleted: scoreByUser.has(u.id),
      quizCompletedAt: scoreByUser.get(u.id) ?? null,
      personalPaid: !!personalCompleted,
      personalPaidAmount: personalCompleted
        ? (personalCompleted as { amount_cents: number }).amount_cents
        : 0,
      personalReportStatus: (personalReport
        ? (personalReport as { status: string }).status
        : "none") as UserRow["personalReportStatus"],
      invitesSent: myInvites.length,
      invitesAccepted: myInvites.filter(
        (i) => (i as { status: string }).status === "accepted"
      ).length,
      comparisonsCompleted: mySelections.filter(
        (s) => !!(s as { report_id: string | null }).report_id
      ).length,
      comparisonsPaid: mySelections.filter(
        (s) => !!(s as { purchase_id: string | null }).purchase_id
      ).length,
      lastActivityAt,
    };
  });

  rows.sort((a, b) => (a.lastActivityAt > b.lastActivityAt ? -1 : 1));

  const totals = {
    users: rows.length,
    quizCompleted: rows.filter((r) => r.quizCompleted).length,
    personalPaid: rows.filter((r) => r.personalPaid).length,
    personalReportCompleted: rows.filter(
      (r) => r.personalReportStatus === "completed"
    ).length,
    invitesSent: rows.reduce((s, r) => s + r.invitesSent, 0),
    invitesAccepted: rows.reduce((s, r) => s + r.invitesAccepted, 0),
    comparisonsCompleted: rows.reduce((s, r) => s + r.comparisonsCompleted, 0),
  };

  const completedPurchases = purchases.filter(
    (p) => (p as { status: string }).status === "completed"
  );
  const personalCents = completedPurchases
    .filter((p) => (p as { type: string }).type === "personal")
    .reduce((s, p) => s + (p as { amount_cents: number }).amount_cents, 0);
  const comparisonCents = completedPurchases
    .filter((p) => (p as { type: string }).type !== "personal")
    .reduce((s, p) => s + (p as { amount_cents: number }).amount_cents, 0);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const last7DaysCents = completedPurchases
    .filter((p) => (p as { created_at: string }).created_at > sevenDaysAgo)
    .reduce((s, p) => s + (p as { amount_cents: number }).amount_cents, 0);

  const revenue = {
    totalCents: personalCents + comparisonCents,
    personalCents,
    comparisonCents,
    last7DaysCents,
  };

  const recentPurchases = completedPurchases.slice(0, 10).map((p) => {
    const row = p as {
      user_id: string;
      type: string;
      amount_cents: number;
      created_at: string;
      status: string;
    };
    return {
      createdAt: row.created_at,
      email: emailById.get(row.user_id) ?? "(unknown)",
      type: row.type,
      amountCents: row.amount_cents,
      status: row.status,
    };
  });

  return { rows, totals, revenue, recentPurchases };
}

function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function pct(num: number, denom: number): string {
  if (!denom) return "—";
  return `${Math.round((num / denom) * 100)}%`;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    notFound();
  }

  const data = await fetchDashboard();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Admin</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Funnel, revenue, and per-user activity.
          </p>
        </div>
        <Link
          href="/admin/invites"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Invites detail &rarr;
        </Link>
      </div>

      {/* Conversion funnel */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3">
          Funnel
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <FunnelCard label="Signups" value={data.totals.users} />
          <FunnelCard
            label="Completed quiz"
            value={data.totals.quizCompleted}
            sub={pct(data.totals.quizCompleted, data.totals.users)}
          />
          <FunnelCard
            label="Paid personal"
            value={data.totals.personalPaid}
            sub={pct(data.totals.personalPaid, data.totals.quizCompleted)}
          />
          <FunnelCard
            label="Report ready"
            value={data.totals.personalReportCompleted}
            sub={pct(
              data.totals.personalReportCompleted,
              data.totals.personalPaid
            )}
          />
          <FunnelCard label="Invites sent" value={data.totals.invitesSent} />
          <FunnelCard
            label="Invites accepted"
            value={data.totals.invitesAccepted}
            sub={pct(data.totals.invitesAccepted, data.totals.invitesSent)}
          />
          <FunnelCard
            label="Comparisons"
            value={data.totals.comparisonsCompleted}
          />
        </div>
      </section>

      {/* Revenue */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3">
          Revenue
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <RevenueCard label="Total" value={dollars(data.revenue.totalCents)} />
          <RevenueCard
            label="Personal"
            value={dollars(data.revenue.personalCents)}
          />
          <RevenueCard
            label="Comparison"
            value={dollars(data.revenue.comparisonCents)}
          />
          <RevenueCard
            label="Last 7 days"
            value={dollars(data.revenue.last7DaysCents)}
          />
        </div>
      </section>

      {/* Recent purchases */}
      {data.recentPurchases.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3">
            Recent purchases
          </h2>
          <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="relative">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="bg-[var(--beige-light)]">
                    <tr className="text-xs uppercase tracking-wide text-[var(--muted)]">
                      <th className="px-4 py-2 text-left font-medium">When</th>
                      <th className="px-4 py-2 text-left font-medium">User</th>
                      <th className="px-4 py-2 text-left font-medium">Product</th>
                      <th className="px-4 py-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {data.recentPurchases.map((p, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-xs text-[var(--muted)] whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">{p.email}</td>
                        <td className="px-4 py-2 text-xs text-[var(--muted)]">
                          {p.type}
                        </td>
                        <td className="px-4 py-2 text-right font-mono tabular-nums">
                          {dollars(p.amountCents)}
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

      {/* All users */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide">
            All users ({data.rows.length})
          </h2>
          <p className="text-xs text-[var(--muted)]">Sorted by last activity</p>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="relative">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-[var(--beige-light)]">
                  <tr className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    <th className="px-4 py-2 text-left font-medium">User</th>
                    <th className="px-4 py-2 text-left font-medium">Joined</th>
                    <th className="px-4 py-2 text-center font-medium">Quiz</th>
                    <th className="px-4 py-2 text-center font-medium">Paid</th>
                    <th className="px-4 py-2 text-center font-medium">Report</th>
                    <th className="px-4 py-2 text-right font-medium">Invites</th>
                    <th className="px-4 py-2 text-right font-medium">Compare</th>
                    <th className="px-4 py-2 text-left font-medium">Last active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {data.rows.map((u) => (
                    <tr key={u.userId} className="hover:bg-[#FAFAF8]">
                      <td className="px-4 py-3">
                        <div className="font-medium text-[var(--foreground)]">
                          {u.fullName || "(no name)"}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {u.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Dot on={u.quizCompleted} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {u.personalPaid ? (
                          <span className="text-xs font-medium text-emerald-700">
                            {dollars(u.personalPaidAmount)}
                          </span>
                        ) : (
                          <span className="text-xs text-[#ccc]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ReportPill status={u.personalReportStatus} />
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        {u.invitesSent === 0 ? (
                          <span className="text-[#ccc]">—</span>
                        ) : (
                          <>
                            {u.invitesAccepted}/{u.invitesSent}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        {u.comparisonsCompleted === 0 ? (
                          <span className="text-[#ccc]">—</span>
                        ) : (
                          u.comparisonsCompleted
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">
                        {new Date(u.lastActivityAt).toLocaleDateString()}
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
        <p className="mt-3 text-xs text-[var(--muted)]">
          Quiz = completed the 179-question assessment. Paid = Stripe purchase for the personal report. Report = personal report generation status.
        </p>
      </section>
    </div>
  );
}

function FunnelCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-3">
      <p className="text-xs text-[var(--muted)] uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-[var(--foreground)] tabular-nums">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-[var(--muted)] tabular-nums">{sub}</p>
      )}
    </div>
  );
}

function RevenueCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-3">
      <p className="text-xs text-[var(--muted)] uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-[var(--foreground)] tabular-nums">
        {value}
      </p>
    </div>
  );
}

function Dot({ on }: { on: boolean }) {
  return (
    <span
      aria-label={on ? "yes" : "no"}
      className={`inline-block w-2.5 h-2.5 rounded-full ${
        on ? "bg-emerald-500" : "bg-[#e5e5e5]"
      }`}
    />
  );
}

function ReportPill({ status }: { status: UserRow["personalReportStatus"] }) {
  if (status === "none") {
    return <span className="text-xs text-[#ccc]">—</span>;
  }
  const tone =
    status === "completed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "generating"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";
  return (
    <span
      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${tone} uppercase tracking-wide`}
    >
      {status}
    </span>
  );
}
