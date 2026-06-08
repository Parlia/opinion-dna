"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminEmail, isExampleReportsEmail } from "@/lib/auth/admin";
import { DeleteUserButton } from "./DeleteUserButton";
import type { AdminUserRow } from "@/lib/admin/metrics";

function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function Dot({ on }: { on: boolean }) {
  return (
    <span
      aria-label={on ? "yes" : "no"}
      className={`inline-block w-2.5 h-2.5 rounded-full ${on ? "bg-emerald-500" : "bg-[#e5e5e5]"}`}
    />
  );
}

function ReportPill({ status }: { status: AdminUserRow["personalReportStatus"] }) {
  if (status === "none") return <span className="text-xs text-[#ccc]">—</span>;
  const tone =
    status === "completed"
      ? "bg-emerald-50 text-emerald-700"
      : status === "generating"
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${tone} uppercase tracking-wide`}>
      {status}
    </span>
  );
}

function InternalToggle({ userId, isInternal }: { userId: string; isInternal: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/set-internal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isInternal: !isInternal }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={isInternal ? "Counts as internal/test — click to mark real" : "Counts as a real user — click to mark internal"}
      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors disabled:opacity-50 ${
        isInternal
          ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
          : "bg-white text-[var(--muted)] border-[var(--border)] hover:border-[var(--muted)]"
      }`}
    >
      {busy ? "…" : isInternal ? "Internal" : "Real"}
    </button>
  );
}

export function UsersTable({ rows, currentUserId }: { rows: AdminUserRow[]; currentUserId: string }) {
  const [showInternal, setShowInternal] = useState(false);

  const internalCount = rows.filter((r) => r.isInternal).length;
  const realCount = rows.length - internalCount;
  const visible = showInternal ? rows : rows.filter((r) => !r.isInternal);

  return (
    <section>
      <div className="flex items-end justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide">
          Users — {realCount} real{internalCount > 0 ? `, ${internalCount} internal` : ""}
        </h2>
        <div className="flex items-center gap-3">
          {internalCount > 0 && (
            <button
              type="button"
              onClick={() => setShowInternal((s) => !s)}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] underline underline-offset-2"
            >
              {showInternal ? "Hide internal/test" : `Show internal/test (${internalCount})`}
            </button>
          )}
          <p className="text-xs text-[var(--muted)]">Sorted by last activity</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="relative">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[980px]">
              <thead className="bg-[var(--beige-light)]">
                <tr className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  <th className="px-4 py-2 text-left font-medium">User</th>
                  <th className="px-4 py-2 text-left font-medium">Channel</th>
                  <th className="px-4 py-2 text-left font-medium">Joined</th>
                  <th className="px-4 py-2 text-center font-medium">Quiz</th>
                  <th className="px-4 py-2 text-center font-medium">Paid</th>
                  <th className="px-4 py-2 text-center font-medium">Report</th>
                  <th className="px-4 py-2 text-right font-medium">Invites</th>
                  <th className="px-4 py-2 text-right font-medium">Compare</th>
                  <th className="px-4 py-2 text-left font-medium">Last active</th>
                  <th className="px-4 py-2 text-center font-medium">Flag</th>
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {visible.map((u) => {
                  const protectedRow =
                    u.userId === currentUserId ||
                    isAdminEmail(u.email) ||
                    isExampleReportsEmail(u.email);
                  return (
                    <tr
                      key={u.userId}
                      className={`hover:bg-[#FAFAF8] ${u.isInternal ? "opacity-60" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-[var(--foreground)]">
                          {u.fullName || "(no name)"}
                        </div>
                        <div className="text-xs text-[var(--muted)]">{u.email}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--muted)]">{u.channel}</td>
                      <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Dot on={u.quizCompleted} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {u.personalPaid ? (
                          <span className="text-xs font-medium text-emerald-700">
                            {dollars(u.personalPaidAmountCents)}
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
                      <td className="px-4 py-3 text-center">
                        <InternalToggle userId={u.userId} isInternal={u.isInternal} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {protectedRow ? (
                          <span className="text-xs text-[#ccc]">—</span>
                        ) : (
                          <DeleteUserButton
                            userId={u.userId}
                            email={u.email}
                            paid={u.personalPaid}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
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
        Quiz = completed the assessment. Paid = real Stripe charge for the personal report. Report =
        personal report generation status. <strong>Flag</strong> marks internal/test/founder accounts,
        which are excluded from every headline number above. Channel is unknown until UTM capture is wired.
      </p>
    </section>
  );
}
