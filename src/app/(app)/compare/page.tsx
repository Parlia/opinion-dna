"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { isExampleReportsEmail } from "@/lib/auth/admin";

interface Invite {
  id: string;
  from_user_id: string;
  to_email: string;
  to_user_id: string | null;
  status: string;
  comparison_report_id: string | null;
  compatibility_score: number | null;
  created_at: string;
  updated_at: string;
}

interface Participant {
  full_name: string | null;
  email: string | null;
}

interface PricingData {
  price: number;
  isFree: boolean;
  bothAssessed: boolean;
  isAvailable: boolean;
  productId: string | null;
  selectionState: "none" | "i_selected" | "partner_selected" | "both_selected" | "complete";
  reportId: string | null;
  compatibilityScore: number | null;
  selfHasScores?: boolean;
  partnerHasScores?: boolean;
  selfHasPurchase?: boolean;
  partnerHasPurchase?: boolean;
  reportGenerationStale?: boolean;
  dismissed?: boolean;
}

const RELATIONSHIP_TYPES = ["friends", "couples", "cofounders"] as const;
type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

const TYPE_LABELS: Record<RelationshipType, string> = {
  friends: "Friends",
  couples: "Couples",
  cofounders: "Co-Founders",
};

// Icon + color styling per comparison type. Pulled from the brand palette
// (the homepage orbs + accent colors) so the pills feel native, not stock.
// bg/text hex pairs are tuned to land just above the AA contrast threshold
// on the beige app background while staying soft enough for dense use.
const TYPE_STYLE: Record<RelationshipType, { icon: string; bg: string; fg: string }> = {
  friends: { icon: "✨", bg: "#FFF2D9", fg: "#8A5A00" },
  couples: { icon: "💕", bg: "#FFE4EE", fg: "#B3185A" },
  cofounders: { icon: "🤝", bg: "#ECE4FF", fg: "#4F00D1" },
};

// Deterministic avatar background color per user. Two different partners
// in the Joined/Comparison-Results list should read as visually distinct
// even when both initials happen to collide (Turi, Toby, Tom...). Hash
// their user_id into a fixed palette so the mapping is stable across
// sessions — Turi is always violet, Alessandra is always rose, etc.
const AVATAR_PALETTE = [
  "#7C3AED", // violet
  "#EC4899", // rose
  "#F59E0B", // amber
  "#10B981", // emerald
  "#3B82F6", // sky
  "#EF4444", // coral
  "#14B8A6", // teal
  "#8B5CF6", // lilac
];

function avatarColor(userId: string | null | undefined): string {
  if (!userId) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function pricingKey(inviteId: string, type: RelationshipType): string {
  return `${inviteId}_${type}`;
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
  const toast = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [participants, setParticipants] = useState<Record<string, Participant>>({});
  const [directReports, setDirectReports] = useState<Array<{ id: string; relationship_type: RelationshipType | null; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pricing, setPricing] = useState<Record<string, PricingData>>({});
  const [pricingLoading, setPricingLoading] = useState<Set<string>>(new Set());
  const [selectingType, setSelectingType] = useState<string | null>(null);
  const [retryingType, setRetryingType] = useState<string | null>(null);
  const [dismissingType, setDismissingType] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Toast after an invite was just sent (from /compare/invite?invited=email@...)
  useEffect(() => {
    const invited = searchParams.get("invited");
    if (invited) {
      toast.success(
        `Invite sent to ${invited}`,
        "If they don't see the email within a few minutes, ask them to check their spam folder."
      );
      window.history.replaceState({}, "", "/compare");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPricing = useCallback(async (inviteId: string, type: RelationshipType) => {
    const key = pricingKey(inviteId, type);
    setPricingLoading(prev => new Set(prev).add(key));
    try {
      const res = await fetch(`/api/invite/pricing?inviteId=${inviteId}&type=${type}`);
      const data = await res.json();
      if (!data.error) {
        setPricing(prev => ({ ...prev, [key]: data }));
      }
    } catch { /* ignore */ }
    setPricingLoading(prev => { const s = new Set(prev); s.delete(key); return s; });
  }, []);

  const fetchAllPricing = useCallback(async (joinedInvites: Invite[]) => {
    // Fire all (invite, type) pricing fetches in parallel. With N joined
    // invites this was doing 3N sequential awaits (~4-5s block for 5 invites);
    // Promise.all cuts wall time to the slowest single call.
    await Promise.all(
      joinedInvites.flatMap((invite) =>
        RELATIONSHIP_TYPES.map((type) => fetchPricing(invite.id, type)),
      ),
    );
  }, [fetchPricing]);

  // Auto-trigger select-type after successful Stripe checkout redirect
  useEffect(() => {
    const purchaseStatus = searchParams.get("purchase");
    const inviteId = searchParams.get("inviteId");
    const type = searchParams.get("type") as RelationshipType | null;
    const sessionId = searchParams.get("session_id");
    if (purchaseStatus === "success" && inviteId) {
      window.history.replaceState({}, "", "/compare");
      const finalType = type || "cofounders";
      (async () => {
        // Verify the Stripe session synchronously so the purchase is recorded
        // before we call select-type. Otherwise we race the webhook: select-type
        // sees no purchase, returns payment_required, and the user gets bounced
        // back to Stripe instead of landing on "Waiting for partner to confirm".
        if (sessionId) {
          try {
            await fetch("/api/stripe/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ session_id: sessionId }),
            });
          } catch (err) {
            console.error("Purchase verification failed:", err);
          }
        }
        handleSelectType(inviteId, finalType);
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data: sentInvites } = await supabase
        .from("invites")
        .select("id, from_user_id, to_email, to_user_id, status, comparison_report_id, compatibility_score, created_at, updated_at")
        .eq("from_user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: receivedInvites } = await supabase
        .from("invites")
        .select("id, from_user_id, to_email, to_user_id, status, comparison_report_id, compatibility_score, created_at, updated_at")
        .eq("to_user_id", user.id)
        .eq("status", "accepted")
        .order("created_at", { ascending: false });

      // Exclude self-invites defensively — they shouldn't exist (send API
      // blocks them) but if a row slips through we don't want to show the
      // current user as their own partner.
      const rawInvites = [...(sentInvites ?? []), ...(receivedInvites ?? [])] as Invite[];
      const noSelfInvites = rawInvites.filter(
        (i) => i.from_user_id !== user.id || i.to_user_id !== user.id
      );

      // Collapse mutual-invite pairs. If two accepted invites exist between
      // the same pair of users (each invited the other) we keep only the
      // oldest — both users deterministically pick the same canonical row,
      // which keeps comparison_selections / pricing keyed off a stable id.
      const pending = noSelfInvites.filter((i) => i.status !== "accepted");
      const accepted = noSelfInvites
        .filter((i) => i.status === "accepted")
        .sort((a, b) => a.created_at.localeCompare(b.created_at));
      const seenPartner = new Set<string>();
      const dedupedAccepted: Invite[] = [];
      for (const invite of accepted) {
        const partnerId =
          invite.from_user_id === user.id ? invite.to_user_id : invite.from_user_id;
        if (!partnerId) {
          dedupedAccepted.push(invite);
          continue;
        }
        if (seenPartner.has(partnerId)) continue;
        seenPartner.add(partnerId);
        dedupedAccepted.push(invite);
      }
      dedupedAccepted.sort((a, b) => b.created_at.localeCompare(a.created_at));
      setInvites([...pending, ...dedupedAccepted]);

      // Fetch display info (name + email) for every partner. profiles RLS
      // only returns the current user's own row, so we use a dedicated admin
      // endpoint scoped to the current user's actual invite partners.
      fetch("/api/invite/participants")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.participants) setParticipants(data.participants);
        })
        .catch(() => {
          /* fall back to emails */
        });

      // "Example report" cards are only for the dedicated seed account. Other
      // users shouldn't ever see a detached comparison report labelled as an
      // example — if one exists on another account (historical seed bug), we
      // ignore it here and the cleanup SQL removes it from the DB.
      if (isExampleReportsEmail(user.email)) {
        const { data: ownedReports } = await supabase
          .from("reports")
          .select("id, relationship_type, created_at")
          .eq("user_id", user.id)
          .eq("type", "comparison")
          .eq("status", "completed")
          .order("created_at", { ascending: false });

        setDirectReports((ownedReports ?? []) as Array<{ id: string; relationship_type: RelationshipType | null; created_at: string }>);
      } else {
        setDirectReports([]);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  // Fetch all three types for joined invites on mount / when invites change
  useEffect(() => {
    const joinedInvites = invites.filter(i => i.status === "accepted");
    fetchAllPricing(joinedInvites);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invites]);

  // Re-fetch pricing when tab regains focus
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        const joinedInvites = invites.filter(i => i.status === "accepted");
        fetchAllPricing(joinedInvites);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [invites, fetchAllPricing]);

  async function handleSelectType(inviteId: string, type: RelationshipType) {
    const key = pricingKey(inviteId, type);
    // Always ask the backend first. It knows:
    //  - free type → creates the selection
    //  - paid type WITH purchase → creates the selection
    //  - paid type NO purchase → returns { status: "payment_required" }
    // Deciding Stripe-vs-select-type purely from client-side pricing state was
    // the old bug: after a Stripe redirect the pricing cache was stale, so the
    // client saw selectionState="none" + !isFree and redirected back to Stripe
    // in a loop instead of creating the selection row.
    setSelectingType(key);
    setGenerateError(null);
    try {
      const res = await fetch("/api/invite/select-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, relationshipType: type }),
      });
      const result = await res.json();

      if (result.status === "payment_required" && result.productId) {
        window.location.href = `/api/stripe/checkout?product=${result.productId}&inviteId=${inviteId}&relationshipType=${type}`;
        return;
      }

      if (result.status === "partner_paid_waiting") {
        // The partner got to Stripe first. Don't double-charge this user —
        // refresh pricing so the row shows the up-to-date state and the
        // Confirm button appears once the partner's selection lands.
        toast.info(
          "Partner has already paid",
          "Give it a few seconds and the Confirm button will appear."
        );
        for (const t of RELATIONSHIP_TYPES) fetchPricing(inviteId, t);
      } else if (result.error) {
        setGenerateError(result.error);
      } else {
        // Re-fetch all pricing for this invite to get updated states
        for (const t of RELATIONSHIP_TYPES) {
          fetchPricing(inviteId, t);
        }
      }
    } catch {
      setGenerateError("Network error. Check your connection and try again.");
    }
    setSelectingType(null);
  }

  // Retry path for a selection where both parties confirmed but the report
  // generation lambda died before finishing. Calls /api/report/compare
  // directly — the lib sweeps the prior stuck "generating" row and tries
  // again. Long-running (2-4 min) so we keep the loading state visible.
  async function handleRetryGeneration(inviteId: string, type: RelationshipType) {
    const key = pricingKey(inviteId, type);
    setRetryingType(key);
    setGenerateError(null);
    try {
      const res = await fetch("/api/report/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, relationshipType: type }),
      });
      const result = await res.json();
      if (result.status === "failed" || result.error) {
        setGenerateError(
          result.error || "Report generation failed again. Please try once more or contact support.",
        );
      } else {
        for (const t of RELATIONSHIP_TYPES) fetchPricing(inviteId, t);
      }
    } catch {
      setGenerateError("Network error. Check your connection and try again.");
    }
    setRetryingType(null);
  }

  // Hide a type from the Joined list. Persists to
  // comparison_selections.dismissed_at, so it stays gone on reload and for
  // the other participant too. Only reachable when selectionState === "none"
  // (the backend also enforces this).
  async function handleDismissType(inviteId: string, type: RelationshipType) {
    const typeLabel = TYPE_LABELS[type];
    const partnerName = (() => {
      const invite = invites.find((i) => i.id === inviteId);
      return invite ? getDisplayName(invite).split(" ")[0] : "them";
    })();
    if (!confirm(`Hide the ${typeLabel} comparison with ${partnerName}? You can't undo this from the UI yet.`)) {
      return;
    }
    const key = pricingKey(inviteId, type);
    setDismissingType(key);
    try {
      const res = await fetch("/api/invite/dismiss-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId, relationshipType: type }),
      });
      const result = await res.json();
      if (result.error) {
        toast.error(result.error);
      } else {
        // Optimistically mark dismissed so the row disappears immediately —
        // pricing re-fetch will reconcile if anything raced.
        setPricing((prev) => ({
          ...prev,
          [key]: { ...(prev[key] as PricingData), dismissed: true },
        }));
        fetchPricing(inviteId, type);
      }
    } catch {
      toast.error("Network error", "Check your connection and try again.");
    }
    setDismissingType(null);
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
        toast.success(
          "Invite resent",
          "If they don't see it within a few minutes, ask them to check their spam folder."
        );
      } else {
        toast.error(result.error || "Failed to resend");
      }
    } catch {
      toast.error("Network error", "Check your connection and try again.");
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
        toast.info("Invite cancelled");
      } else {
        toast.error(result.error || "Failed to cancel");
      }
    } catch {
      toast.error("Network error", "Check your connection and try again.");
    }
    setActionLoading(null);
  }

  const pending = invites.filter(i => i.status === "pending");
  const joined = invites.filter(i => i.status === "accepted");

  // Resolve the "other person" for an invite, regardless of whether the
  // current user is the sender or the recipient. Previously this always
  // returned profiles[to_user_id], which for received invites is the current
  // user themselves — so Turi saw "Turi Munthe" and J. Paul saw "J. Paul
  // Neeley" next to their own invites.
  function partnerUserId(invite: Invite): string | null {
    if (!currentUserId) return invite.to_user_id ?? invite.from_user_id ?? null;
    return invite.from_user_id === currentUserId
      ? invite.to_user_id
      : invite.from_user_id;
  }

  function getDisplayName(invite: Invite): string {
    const id = partnerUserId(invite);
    const partner = id ? participants[id] : null;
    if (partner?.full_name) return partner.full_name;
    if (partner?.email) return partner.email;
    // Fall back to the recipient email when we're the sender (partner profile
    // may not be loaded yet). For received invites we have no plain-text
    // fallback, so surface a neutral label rather than the current user's
    // own email.
    if (currentUserId && invite.from_user_id === currentUserId) return invite.to_email;
    return "Your invite partner";
  }

  // Build completed list from pricing data where selectionState === "complete"
  const completedEntries: { invite: Invite | null; type: RelationshipType; reportId: string; score: number | null; displayName: string; partnerId: string | null }[] = [];
  const seenReportIds = new Set<string>();
  for (const invite of joined) {
    for (const type of RELATIONSHIP_TYPES) {
      const key = pricingKey(invite.id, type);
      const p = pricing[key];
      if (p?.selectionState === "complete" && p.reportId) {
        completedEntries.push({
          invite,
          type,
          reportId: p.reportId,
          score: p.compatibilityScore,
          displayName: getDisplayName(invite),
          partnerId: partnerUserId(invite),
        });
        seenReportIds.add(p.reportId);
      }
    }
  }
  // Add directly-owned comparison reports (e.g. seeded examples) not already listed
  for (const report of directReports) {
    if (seenReportIds.has(report.id)) continue;
    const type: RelationshipType = (report.relationship_type as RelationshipType) || "cofounders";
    completedEntries.push({
      invite: null,
      type,
      reportId: report.id,
      score: null,
      displayName: "Example report",
      partnerId: null,
    });
  }

  // Filter joined to only show invites that have at least one non-complete type
  // Keep an invite in Joined if at least one type still needs attention —
  // i.e. not completed and not dismissed. Pricing may not have loaded yet
  // for a type, in which case treat it as needing attention (render the
  // skeleton/loading state rather than hiding the whole invite).
  const joinedWithPending = joined.filter(invite => {
    return RELATIONSHIP_TYPES.some(type => {
      const p = pricing[pricingKey(invite.id, type)];
      return !p || (p.selectionState !== "complete" && !p.dismissed);
    });
  });

  function renderTypeRow(invite: Invite, type: RelationshipType) {
    const key = pricingKey(invite.id, type);
    const typePricing = pricing[key];
    const isLoading = pricingLoading.has(key);
    const isSelecting = selectingType === key;
    const partnerName = getDisplayName(invite).split(" ")[0];

    // Don't render completed rows in the joined section.
    if (typePricing?.selectionState === "complete") return null;
    // Don't render types the pair has explicitly dismissed.
    if (typePricing?.dismissed) return null;

    const priceLabel = isLoading
      ? "..."
      : typePricing?.isFree
        ? "Free"
        : typePricing
          ? `$${typePricing.price}`
          : "...";

    let actionElement: React.ReactNode = null;

    if (isLoading) {
      actionElement = (
        <span className="text-xs text-[var(--muted)]">Loading...</span>
      );
    } else if (!typePricing) {
      actionElement = null;
    } else if (typePricing.selectionState === "both_selected") {
      // Both have clicked through, but we still need actual score sets on
      // both sides before the report can generate. If either is missing,
      // don't lie about "Generating (2-4 min)" — surface the real blocker.
      if (typePricing.selfHasScores === false) {
        actionElement = (
          <Link
            href="/quiz"
            className="text-xs text-amber-700 underline-offset-2 hover:underline"
          >
            Finish your own assessment to generate
          </Link>
        );
      } else if (typePricing.partnerHasScores === false) {
        actionElement = (
          <span className="text-xs text-amber-700" title={`${partnerName} hasn't finished their assessment yet. The report will generate automatically once they do.`}>
            Waiting for {partnerName} to finish their assessment
          </span>
        );
      } else if (typePricing.reportGenerationStale) {
        // The prior generation attempt didn't finish before the lambda
        // timed out. The spinner would lie forever — offer an explicit
        // retry instead.
        const isRetrying = retryingType === key;
        actionElement = (
          <button
            onClick={() => handleRetryGeneration(invite.id, type)}
            disabled={isRetrying}
            title="The previous generation attempt timed out. Retrying will try to generate the report again (2-4 min)."
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 min-h-[40px] flex items-center gap-2"
            style={{ backgroundColor: "var(--primary)", color: "white" }}
          >
            {isRetrying ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Retrying...
              </>
            ) : (
              "Retry generation"
            )}
          </button>
        );
      } else {
        actionElement = (
          <span className="flex items-center gap-2 text-xs text-[var(--muted)]" title="Reports typically take 2-4 minutes to generate.">
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating your report (2-4 min)...
          </span>
        );
      }
    } else if (typePricing.selectionState === "i_selected") {
      if (typePricing.partnerHasScores === false) {
        actionElement = (
          <span className="text-xs text-amber-700">
            Waiting for {partnerName} to finish their assessment
          </span>
        );
      } else {
        actionElement = (
          <span className="text-xs text-amber-700" title={`You selected ${TYPE_LABELS[type]}. Waiting for ${partnerName} to confirm before we generate the report.`}>
            Waiting for {partnerName} to confirm
          </span>
        );
      }
    } else if (typePricing.selectionState === "partner_selected") {
      if (typePricing.selfHasScores === false) {
        actionElement = (
          <Link
            href="/quiz"
            className="text-xs text-amber-700 underline-offset-2 hover:underline"
          >
            Finish your assessment to confirm
          </Link>
        );
      } else {
        actionElement = (
          <button
            onClick={() => handleSelectType(invite.id, type)}
            disabled={isSelecting}
            title={`${partnerName} wants to generate a ${TYPE_LABELS[type]} report. Confirm to continue.`}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 min-h-[40px]"
            style={{ backgroundColor: "var(--primary)", color: "white" }}
          >
            {isSelecting ? "Confirming..." : "Confirm comparison"}
          </button>
        );
      }
    } else if (typePricing.selectionState === "none") {
      // Use score presence (authoritative), falling back to bothAssessed for
      // any endpoint that hasn't been redeployed yet.
      const selfReady = typePricing.selfHasScores ?? typePricing.bothAssessed;
      if (!selfReady) {
        actionElement = (
          <Link
            href="/quiz"
            className="text-xs text-amber-700 underline-offset-2 hover:underline"
          >
            Finish your assessment to select
          </Link>
        );
      } else if (typePricing.partnerHasPurchase && !typePricing.selfHasPurchase) {
        // Partner already paid for this report but their selection row hasn't
        // landed yet (Stripe/verify round-trip). Don't let this user kick off
        // a second payment.
        actionElement = (
          <span className="text-xs text-amber-700" title={`${partnerName} has already paid. Refresh in a moment — you'll see a Confirm button.`}>
            {partnerName} has paid — waiting to confirm
          </span>
        );
      } else {
        // Carry the price on the button itself for paid types — feels less
        // bait-and-switch than "Select" then a Stripe redirect. For free
        // types (friends, or already-paid races) keep the bare "Select".
        const buttonLabel = typePricing.isFree
          ? "Select"
          : `Buy for $${typePricing.price}`;
        actionElement = (
          <button
            onClick={() => handleSelectType(invite.id, type)}
            disabled={isSelecting}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 min-h-[40px]"
            style={{ backgroundColor: "var(--primary)", color: "white" }}
          >
            {isSelecting ? "..." : buttonLabel}
          </button>
        );
      }
    }

    const typeStyle = TYPE_STYLE[type];
    // "Not applicable" escape hatch — only offered before anyone's committed
    // anything. Once selected or confirmed, dismissal becomes a refund issue
    // and the backend refuses it anyway.
    const canDismiss = typePricing?.selectionState === "none";
    const isDismissing = dismissingType === key;
    return (
      <div key={type} className="flex items-center justify-between gap-3 sm:gap-4 py-2">
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: typeStyle.bg, color: typeStyle.fg }}
          >
            <span aria-hidden="true">{typeStyle.icon}</span>
            {TYPE_LABELS[type]}
          </span>
          {priceLabel === "Free" && (
            type === "friends" ? (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-700">Free</span>
            ) : (
              <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Paid</span>
            )
          )}
        </div>
        <div className="min-w-0 text-right flex items-center gap-3 justify-end flex-wrap">
          {actionElement}
          {canDismiss && (
            <button
              onClick={() => handleDismissType(invite.id, type)}
              disabled={isDismissing}
              title={`Hide this ${TYPE_LABELS[type]} comparison — you won't see it in Joined anymore.`}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] underline-offset-2 hover:underline disabled:opacity-50"
            >
              {isDismissing ? "Hiding..." : "Not applicable"}
            </button>
          )}
        </div>
      </div>
    );
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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
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
          className="self-start sm:self-auto shrink-0 px-4 py-2.5 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
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
                <div key={invite.id} className="px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: "var(--beige-light)", color: "var(--muted)" }}>
                      {invite.to_email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--foreground)] truncate">{invite.to_email}</p>
                      <p className="text-sm text-[var(--muted)]">Invited {new Date(invite.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleResend(invite.id)}
                      disabled={actionLoading === `resend-${invite.id}`}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium border transition-all disabled:opacity-50"
                      style={{ borderColor: "var(--border)", color: "var(--primary)" }}
                    >
                      {actionLoading === `resend-${invite.id}` ? "Sending..." : "Resend"}
                    </button>
                    <button
                      onClick={() => handleCancel(invite.id)}
                      disabled={actionLoading === `cancel-${invite.id}`}
                      className="px-4 py-2.5 rounded-lg text-sm font-medium border transition-all disabled:opacity-50 text-red-500 border-red-200 hover:bg-red-50"
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
          {joinedWithPending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[var(--border)] px-6 py-8 text-center">
              <p className="text-sm text-[var(--muted)]">No one has joined yet. When someone accepts your invite and takes the assessment, they will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
              {joinedWithPending.map((invite) => (
                <div key={invite.id} className="px-4 py-5 sm:px-6">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: avatarColor(partnerUserId(invite)) }}
                    >
                      {getDisplayName(invite).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--foreground)] truncate">{getDisplayName(invite)}</p>
                      <p className="text-sm text-[var(--muted)]">Joined {new Date(invite.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Per-type rows. Indent matches avatar on wider screens,
                      but on mobile drop the indent so there's room for the action. */}
                  <div className="mt-3 sm:pl-14 space-y-0 divide-y divide-[var(--border)]">
                    {RELATIONSHIP_TYPES.map(type => renderTypeRow(invite, type))}
                  </div>

                  {generateError && (
                    <div className="mt-3 sm:ml-14 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{generateError}</p>
                      <button
                        onClick={() => setGenerateError(null)}
                        className="mt-1 text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Comparison Results */}
        <section>
          <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide mb-3">Comparison Results</h2>
          {completedEntries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[var(--border)] px-6 py-8 text-center">
              <p className="text-sm text-[var(--muted)]">No comparisons yet. Once someone joins, select a comparison type to generate your report.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[var(--border)] divide-y divide-[var(--border)]">
              {completedEntries.map(({ invite, type, reportId, score, displayName, partnerId }) => {
                const typeStyle = TYPE_STYLE[type];
                return (
                <div key={`${invite?.id ?? "direct"}_${reportId}_${type}`} className="px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: avatarColor(partnerId) }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium text-[var(--foreground)] truncate">
                        {displayName}
                      </p>
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: typeStyle.bg, color: typeStyle.fg }}
                      >
                        <span aria-hidden="true">{typeStyle.icon}</span>
                        {TYPE_LABELS[type]}
                      </span>
                      {score != null && (
                        <p className="text-sm text-[var(--muted)]">
                          Compatibility Score: <span className="font-semibold" style={{ color: "var(--primary)" }}>{score}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/compare/${reportId}`}
                    className="self-end sm:self-auto shrink-0 px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    View Report
                  </Link>
                </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
