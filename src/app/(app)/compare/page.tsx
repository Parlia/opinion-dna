"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Invite {
  id: string;
  to_email: string;
  to_user_id: string | null;
  status: string;
  comparison_report_id: string | null;
  compatibility_score: number | null;
  created_at: string;
  updated_at: string;
}

interface Profile {
  id: string;
  full_name: string | null;
}

export default function ComparePageWrapper() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--beige-dark)] rounded w-48" />
          <div className="h-40 bg-[var(--beige-dark)] rounded-2xl" />
        </div>
      </div>
    }>
      <ComparePage />
    </Suspense>
  );
}

function ComparePage() {
  const searchParams = useSearchParams();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  // Auto-trigger comparison after successful Stripe checkout redirect
  useEffect(() => {
    const purchaseStatus = searchParams.get("purchase");
    const inviteId = searchParams.get("inviteId");
    if (purchaseStatus === "success" && inviteId && !generating) {
      // Clean URL
      window.history.replaceState({}, "", "/compare");
      // Trigger comparison generation
      handleCompare(inviteId, "cofounders");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sentInvites } = await supabase
        .from("invites")
        .select("id, to_email, to_user_id, status, comparison_report_id, compatibility_score, created_at, updated_at")
        .eq("from_user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: receivedInvites } = await supabase
        .from("invites")
        .select("id, to_email, to_user_id, status, comparison_report_id, compatibility_score, created_at, updated_at")
        .eq("to_user_id", user.id)
        .eq("status", "accepted")
        .order("created_at", { ascending: false });

      const allInvites = [...(sentInvites ?? []), ...(receivedInvites ?? [])];
      setInvites(allInvites);

      const userIds = allInvites
        .filter(i => i.to_user_id)
        .map(i => i.to_user_id!);

      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        const profileMap: Record<string, string> = {};
        for (const p of (profileData ?? []) as Profile[]) {
          if (p.full_name) profileMap[p.id] = p.full_name;
        }
        setProfiles(profileMap);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<Record<string, "cofounders" | "couples" | "friends">>({});
  const [pricing, setPricing] = useState<Record<string, { price: number; isFree: boolean; bothAssessed: boolean; isAvailable: boolean; productId: string | null }>>({});
  const [pricingLoading, setPricingLoading] = useState<Set<string>>(new Set());

  async function fetchPricing(inviteId: string, type: "cofounders" | "couples" | "friends") {
    setPricingLoading(prev => new Set(prev).add(inviteId));
    try {
      const res = await fetch(`/api/invite/pricing?inviteId=${inviteId}&type=${type}`);
      const data = await res.json();
      if (!data.error) {
        setPricing(prev => ({ ...prev, [inviteId]: data }));
      }
    } catch { /* ignore */ }
    setPricingLoading(prev => { const s = new Set(prev); s.delete(inviteId); return s; });
  }

  function handleTypeChange(inviteId: string, type: "cofounders" | "couples" | "friends") {
    setSelectedTypes(prev => ({ ...prev, [inviteId]: type }));
    fetchPricing(inviteId, type);
  }

  // Fetch default pricing for joined invites on mount
  useEffect(() => {
    for (const invite of joined) {
      if (!pricing[invite.id]) {
        fetchPricing(invite.id, "cofounders");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invites]);

  async function handlePurchaseAndCompare(inviteId: string) {
    const type = selectedTypes[inviteId] || "cofounders";
    const invitePricing = pricing[inviteId];

    if (invitePricing?.isFree) {
      // Free — generate directly
      handleCompare(inviteId, type);
      return;
    }

    if (invitePricing?.productId) {
      // Redirect to Stripe checkout
      window.location.href = `/api/stripe/checkout?product=${invitePricing.productId}&inviteId=${inviteId}&relationshipType=${type}`;
    }
  }

  async function handleResend(inviteId: string) {
    setActionLoading(`resend-${inviteId}`);
    try {
      const res = await fetch("/api/invite/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      });
      const result = await res.json();
      if (result.ok) {
        alert("Invite resent!");
      } else {
        alert(result.error || "Failed to resend");
      }
    } catch {
      alert("Something went wrong.");
    }
    setActionLoading(null);
  }

  async function handleCancel(inviteId: string) {
    if (!confirm("Cancel this invite? They won't be able to use the link anymore.")) return;
    setActionLoading(`cancel-${inviteId}`);
    try {
      const res = await fetch("/api/invite/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      });
      const result = await res.json();
      if (result.ok) {
        setInvites(prev => prev.filter(i => i.id !== inviteId));
      } else {
        alert(result.error || "Failed to cancel");
      }
    } catch {
      alert("Something went wrong.");
    }
    setActionLoading(null);
  }

  const [generateError, setGenerateError] = useState<string | null>(null);

  async function handleCompare(inviteId: string, relationshipType?: string) {
    setGenerating(inviteId);
    setGenerateError(null);
    try {
      const res = await fetch("/api/report/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, relationshipType: relationshipType || "cofounders" }),
      });
      const result = await res.json();
      if (result.status === "completed" || result.status === "already_exists") {
        window.location.reload();
      } else if (result.status === "failed") {
        setGenerateError("Report generation failed. This can happen if the AI service is temporarily unavailable. Please try again in a few minutes.");
        setGenerating(null);
      } else {
        setGenerateError(result.error || "Something unexpected happened. Please try again.");
        setGenerating(null);
      }
    } catch {
      setGenerateError("Network error. Check your connection and try again.");
      setGenerating(null);
    }
  }

  const pending = invites.filter(i => i.status === "pending");
  const joined = invites.filter(i => i.status === "accepted" && !i.comparison_report_id);
  const completed = invites.filter(i => i.comparison_report_id);

  function getDisplayName(invite: Invite): string {
    if (invite.to_user_id && profiles[invite.to_user_id]) {
      return profiles[invite.to_user_id];
    }
    return invite.to_email;
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--beige-dark)] rounded w-48" />
          <div className="h-40 bg-[var(--beige-dark)] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            Compare
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Invite someone to take their own assessment and compare results
          </p>
        </div>
        <Link
          href="/compare/invite"
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Invite Someone
        </Link>
      </div>

      <div className="space-y-10">
        {/* Pending */}
        <section>
          <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3">Pending</h2>
          {pending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[var(--border)] px-6 py-8 text-center">
              <p className="text-sm text-[var(--muted)]">No pending invites. Use the button above to invite someone.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
              {pending.map((invite) => (
                <div key={invite.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: "var(--beige-light)", color: "var(--muted)" }}>
                      {invite.to_email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{invite.to_email}</p>
                      <p className="text-sm text-[var(--muted)]">Invited {new Date(invite.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResend(invite.id)}
                      disabled={actionLoading === `resend-${invite.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-50"
                      style={{ borderColor: "var(--border)", color: "var(--primary)" }}
                    >
                      {actionLoading === `resend-${invite.id}` ? "Sending..." : "Resend"}
                    </button>
                    <button
                      onClick={() => handleCancel(invite.id)}
                      disabled={actionLoading === `cancel-${invite.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-50 text-red-500 border-red-200 hover:bg-red-50"
                    >
                      {actionLoading === `cancel-${invite.id}` ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Joined */}
        <section>
          <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3">Joined</h2>
          {joined.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[var(--border)] px-6 py-8 text-center">
              <p className="text-sm text-[var(--muted)]">No one has joined yet. When someone accepts your invite and takes the assessment, they will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
              {joined.map((invite) => {
                const type = selectedTypes[invite.id] || "cofounders";
                const invitePricing = pricing[invite.id];
                const isLoadingPrice = pricingLoading.has(invite.id);

                return (
                  <div key={invite.id} className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm" style={{ backgroundColor: "var(--beige-dark)", color: "var(--foreground)" }}>
                        {getDisplayName(invite).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{getDisplayName(invite)}</p>
                        <p className="text-sm text-[var(--muted)]">Joined {new Date(invite.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Relationship type selector */}
                    <div className="mt-4 pl-14">
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => handleTypeChange(invite.id, "cofounders")}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          style={{
                            backgroundColor: type === "cofounders" ? "var(--primary)" : "transparent",
                            color: type === "cofounders" ? "white" : "var(--muted)",
                            border: type === "cofounders" ? "none" : "1px solid var(--border)",
                          }}
                        >
                          Co-Founders
                        </button>
                        <button
                          onClick={() => handleTypeChange(invite.id, "couples")}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          style={{
                            backgroundColor: type === "couples" ? "var(--primary)" : "transparent",
                            color: type === "couples" ? "white" : "var(--muted)",
                            border: type === "couples" ? "none" : "1px solid var(--border)",
                          }}
                        >
                          Couple
                        </button>
                        <button
                          onClick={() => handleTypeChange(invite.id, "friends")}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          style={{
                            backgroundColor: type === "friends" ? "var(--primary)" : "transparent",
                            color: type === "friends" ? "white" : "var(--muted)",
                            border: type === "friends" ? "none" : "1px solid var(--border)",
                          }}
                        >
                          Friends <span className="text-[10px] opacity-70">Free</span>
                        </button>
                      </div>

                      {/* Status and action */}
                      {isLoadingPrice ? (
                        <p className="text-sm text-[var(--muted)] mb-3">Checking status...</p>
                      ) : invitePricing && !invitePricing.bothAssessed ? (
                        <p className="text-sm text-amber-600 mb-3">
                          Waiting for {getDisplayName(invite)} to complete their assessment
                        </p>
                      ) : invitePricing?.isFree ? (
                        <p className="text-sm text-green-600 font-medium mb-3">Ready to generate</p>
                      ) : null}

                      {/* Action button */}
                      <button
                        onClick={() => handlePurchaseAndCompare(invite.id)}
                        disabled={generating === invite.id || isLoadingPrice || !invitePricing?.bothAssessed}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: generating === invite.id ? "var(--beige-dark)" : "var(--primary)",
                          color: generating === invite.id ? "var(--muted)" : "white",
                        }}
                      >
                        {generating === invite.id
                          ? "Generating report..."
                          : !invitePricing?.bothAssessed
                            ? "Waiting for assessment..."
                            : invitePricing?.isFree
                              ? "Generate Report"
                              : `Generate Report — $${invitePricing?.price}`
                        }
                      </button>

                      {generateError && generating === null && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">{generateError}</p>
                          <button
                            onClick={() => { setGenerateError(null); handlePurchaseAndCompare(invite.id); }}
                            className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
                          >
                            Try again
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Comparison Results */}
        <section>
          <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3">Comparison Results</h2>
          {completed.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[var(--border)] px-6 py-8 text-center">
              <p className="text-sm text-[var(--muted)]">No comparisons yet. Once someone joins, select a comparison type to generate your report.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
              {completed.map((invite) => (
                <div key={invite.id} className="px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: "var(--primary)" }}>
                      {getDisplayName(invite).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{getDisplayName(invite)}</p>
                      {invite.compatibility_score != null && (
                        <p className="text-sm text-[var(--muted)]">
                          Compatibility Score: <span className="font-semibold" style={{ color: "var(--primary)" }}>{invite.compatibility_score}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/compare/${invite.comparison_report_id}`}
                    className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    View Report
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
