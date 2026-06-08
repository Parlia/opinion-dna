"use client";

import { useState } from "react";
import type { AdminMetrics, FunnelWindow } from "@/lib/admin/metrics";

type WindowKey = keyof AdminMetrics["funnel"];

const WINDOWS: { key: WindowKey; label: string }[] = [
  { key: "mtd", label: "MTD" },
  { key: "last_7d", label: "7d" },
  { key: "last_30d", label: "30d" },
  { key: "all_time", label: "All" },
];

function pctLabel(r: number | null): string {
  return r === null ? "—" : `${Math.round(r * 100)}%`;
}

const STEPS: { key: keyof FunnelWindow; label: string }[] = [
  { key: "quiz_starts", label: "Quiz starts" },
  { key: "signups", label: "Signups" },
  { key: "quiz_completed", label: "Quiz done" },
  { key: "paid_personal", label: "Paid (real)" },
  { key: "report_ready", label: "Report ready" },
];

// Conversion rate displayed under the step it leads INTO.
const RATE_INTO: Partial<Record<keyof FunnelWindow, keyof FunnelWindow>> = {
  paid_personal: "signup_to_paid_rate",
  quiz_completed: "quiz_complete_rate",
  report_ready: "paid_to_report_rate",
};

export function FunnelStrip({ funnel }: { funnel: AdminMetrics["funnel"] }) {
  const [win, setWin] = useState<WindowKey>("mtd");
  const f = funnel[win];

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide">Funnel</h2>
        <div className="flex items-center gap-1 bg-white rounded-lg border border-[var(--border)] p-0.5">
          {WINDOWS.map((w) => (
            <button
              key={w.key}
              type="button"
              onClick={() => setWin(w.key)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                win === w.key
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STEPS.map((step) => {
          const value = f[step.key] as number | null;
          const rateKey = RATE_INTO[step.key];
          const conv = rateKey ? (f[rateKey] as number | null) : undefined;
          return (
            <div
              key={String(step.key)}
              className="bg-white rounded-xl border border-[var(--border)] px-4 py-3"
            >
              <p className="text-xs text-[var(--muted)] uppercase tracking-wide">{step.label}</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--foreground)] tabular-nums">
                {value === null ? (
                  <span className="text-base text-[#ccc]" title="Not tracked in-app — lives in analytics">
                    not tracked
                  </span>
                ) : (
                  value
                )}
              </p>
              {conv !== undefined && (
                <p className="text-xs text-[var(--muted)] tabular-nums">{pctLabel(conv)} from prev</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
