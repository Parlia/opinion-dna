import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "jpaul@neeleyworldwide.com";

interface UserStats {
  userId: string;
  email: string;
  fullName: string | null;
  invitesSent: number;
  invitesAccepted: number;
  invitesPending: number;
  comparisonsCompleted: number;
  createdAt: string;
}

async function fetchStats(): Promise<UserStats[]> {
  const admin = createAdminClient();

  // Fetch all invites
  const { data: invites } = await admin
    .from("invites")
    .select("id, from_user_id, status");

  // Fetch all completed comparisons
  const { data: selections } = await admin
    .from("comparison_selections")
    .select("id, selected_by, confirmed_by, report_id");

  // Fetch all users with their profiles
  const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const authUsers = usersData?.users ?? [];
  const userIds = authUsers.map((u) => u.id);

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);
  const profileByIdMap = new Map<string, string | null>();
  for (const p of profiles ?? []) {
    profileByIdMap.set((p as { id: string; full_name: string | null }).id, (p as { id: string; full_name: string | null }).full_name);
  }

  // Aggregate per user
  const stats: UserStats[] = authUsers.map((u) => {
    const myInvites = (invites ?? []).filter((i) => i.from_user_id === u.id);
    const mySelections = (selections ?? []).filter(
      (s) => s.selected_by === u.id || s.confirmed_by === u.id
    );
    return {
      userId: u.id,
      email: u.email ?? "(no email)",
      fullName: profileByIdMap.get(u.id) ?? null,
      invitesSent: myInvites.length,
      invitesAccepted: myInvites.filter((i) => i.status === "accepted").length,
      invitesPending: myInvites.filter((i) => i.status === "pending").length,
      comparisonsCompleted: mySelections.filter((s) => !!s.report_id).length,
      createdAt: u.created_at,
    };
  });

  // Sort by most active first
  stats.sort(
    (a, b) =>
      b.invitesSent + b.comparisonsCompleted - (a.invitesSent + a.comparisonsCompleted)
  );

  return stats;
}

export default async function AdminInvitesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    notFound();
  }

  const stats = await fetchStats();

  // Totals
  const totalUsers = stats.length;
  const totalInvitesSent = stats.reduce((s, u) => s + u.invitesSent, 0);
  const totalInvitesAccepted = stats.reduce((s, u) => s + u.invitesAccepted, 0);
  const totalComparisons = stats.reduce((s, u) => s + u.comparisonsCompleted, 0);

  // Users who have actually done anything
  const activeStats = stats.filter(
    (u) => u.invitesSent > 0 || u.comparisonsCompleted > 0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Admin · Invites</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Per-user invite and comparison activity.</p>
        </div>
        <Link href="/dashboard" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <SummaryCard label="Users" value={totalUsers} />
        <SummaryCard label="Invites Sent" value={totalInvitesSent} />
        <SummaryCard label="Invites Accepted" value={totalInvitesAccepted} />
        <SummaryCard label="Comparisons" value={totalComparisons} />
      </div>

      {/* Active users table */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <p className="text-sm font-medium text-[var(--foreground)]">
            Active users ({activeStats.length})
          </p>
          <p className="text-xs text-[var(--muted)]">Sorted by activity</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--beige-light)]">
              <tr className="text-xs uppercase tracking-wide text-[var(--muted)]">
                <th className="px-4 py-2 text-left font-medium">User</th>
                <th className="px-4 py-2 text-right font-medium">Sent</th>
                <th className="px-4 py-2 text-right font-medium">Accepted</th>
                <th className="px-4 py-2 text-right font-medium">Pending</th>
                <th className="px-4 py-2 text-right font-medium">Comparisons</th>
                <th className="px-4 py-2 text-left font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {activeStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">
                    No activity yet
                  </td>
                </tr>
              ) : (
                activeStats.map((u) => (
                  <tr key={u.userId} className="hover:bg-[#FAFAF8]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--foreground)]">
                        {u.fullName || "(no name)"}
                      </div>
                      <div className="text-xs text-[var(--muted)]">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{u.invitesSent}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {u.invitesAccepted}
                      {u.invitesSent > 0 && (
                        <span className="ml-1 text-xs text-[var(--muted)]">
                          ({Math.round((u.invitesAccepted / u.invitesSent) * 100)}%)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--muted)]">
                      {u.invitesPending}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {u.comparisonsCompleted}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-6 text-xs text-[var(--muted)]">
        Total registered users: {totalUsers}. This list shows only users with at least one invite sent
        or one comparison.
      </p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] px-4 py-3">
      <p className="text-xs text-[var(--muted)] uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--foreground)] tabular-nums">{value}</p>
    </div>
  );
}
