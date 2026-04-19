"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface DashboardState {
  loading: boolean;
  hasPurchase: boolean;
  quizProgress: number; // 0-179
  hasScores: boolean;
  hasReport: boolean;
  hasComparison: boolean;
  userName: string;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--beige-dark)] rounded w-48" />
          <div className="h-4 bg-[var(--beige-dark)] rounded w-64" />
          <div className="h-40 bg-[var(--beige-dark)] rounded-2xl mt-8" />
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<DashboardState>({
    loading: true,
    hasPurchase: false,
    quizProgress: 0,
    hasScores: false,
    hasReport: false,
    hasComparison: false,
    userName: "",
  });

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";

      // If returning from Stripe checkout, verify the purchase
      const sessionId = searchParams.get("session_id");
      if (searchParams.get("purchase") === "success" && sessionId) {
        try {
          await fetch("/api/stripe/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId }),
          });
          // Clean up URL params
          window.history.replaceState({}, "", "/dashboard");
        } catch (err) {
          console.error("Purchase verification failed:", err);
        }
      }

      // Check for completed purchase
      const { data: purchases } = await supabase
        .from("purchases")
        .select("id, type, status")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .limit(1);

      const hasPurchase = (purchases?.length ?? 0) > 0;

      // Count quiz responses
      const { count: quizProgress } = await supabase
        .from("quiz_responses")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Check for scores
      const { data: scores } = await supabase
        .from("user_scores")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      const hasScores = (scores?.length ?? 0) > 0;

      // Check for personal report (not comparison reports)
      const { data: reports } = await supabase
        .from("reports")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("type", "personal")
        .eq("status", "completed")
        .limit(1);

      const hasReport = (reports?.length ?? 0) > 0;

      // Check for at least one completed comparison report (any relationship type)
      const { data: comparisonReports } = await supabase
        .from("reports")
        .select("id")
        .eq("user_id", user.id)
        .eq("type", "comparison")
        .eq("status", "completed")
        .limit(1);

      const hasComparison = (comparisonReports?.length ?? 0) > 0;

      setState({
        loading: false,
        hasPurchase,
        quizProgress: quizProgress ?? 0,
        hasScores,
        hasReport,
        hasComparison,
        userName,
      });
    }

    loadDashboard();
  }, []);

  if (state.loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--beige-dark)] rounded w-48" />
          <div className="h-4 bg-[var(--beige-dark)] rounded w-64" />
          <div className="h-40 bg-[var(--beige-dark)] rounded-2xl mt-8" />
        </div>
      </div>
    );
  }

  const quizComplete = state.quizProgress >= 179;
  const totalQuestions = 179;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Hello, {state.userName}
      </h1>
      <p className="mt-1 text-[var(--muted)]">
        Here&apos;s your Opinion DNA journey
      </p>

      <div className="mt-8 space-y-4">
        {/* Step 1: Purchase */}
        <StepCard
          step={1}
          title="Get your assessment"
          description={state.hasPurchase ? "Purchase complete" : "Purchase your Opinion DNA assessment to unlock the full quiz."}
          completed={state.hasPurchase}
          active={!state.hasPurchase}
          actionLabel="Purchase Assessment"
          actionHref="/api/stripe/checkout?product=personal"
          hideCompletedAction
        />

        {/* Step 2: Take Quiz */}
        <StepCard
          step={2}
          title="Take the quiz"
          description={
            state.hasScores
              ? "Quiz complete"
              : state.quizProgress > 0 && !quizComplete
              ? `${state.quizProgress} of ${totalQuestions} questions answered`
              : "Answer 179 carefully designed questions (takes 10-15 minutes)."
          }
          completed={quizComplete}
          active={state.hasPurchase && !quizComplete}
          actionLabel={state.quizProgress > 0 ? "Continue Quiz" : "Start Quiz"}
          actionHref="/quiz"
          progress={state.quizProgress > 0 && !quizComplete ? state.quizProgress / totalQuestions : undefined}
          hideCompletedAction={state.hasScores}
        />

        {/* Step 3: View Scores */}
        <StepCard
          step={3}
          title="View your scores"
          description="See your 48 element scores across Personality, Values, and Meta-Thinking."
          completed={state.hasScores}
          active={quizComplete && !state.hasScores}
          actionLabel="View Scores"
          actionHref="/scores"
        />

        {/* Step 4: Read Report */}
        <StepCard
          step={4}
          title="Read your report"
          description="Get your AI-generated personal report with detailed insights."
          completed={state.hasReport}
          active={state.hasScores && !state.hasReport}
          actionLabel={state.hasReport ? "View Report" : "Generate Report"}
          actionHref="/report"
        />

        {/* Step 5: Compare with others */}
        <StepCard
          step={5}
          title="Compare with others"
          description={
            state.hasComparison
              ? "Invite another friend, partner, or co-founder to compare — or view the reports you already have."
              : state.hasReport
              ? "Invite a friend, partner, or co-founder. When they complete their own assessment, you unlock a comparison report together."
              : "Finish your own report first, then invite others to compare."
          }
          completed={state.hasComparison}
          active={state.hasReport && !state.hasComparison}
          actionLabel={state.hasComparison ? "Invite Someone Else" : "Invite Someone"}
          actionHref="/compare"
        />
      </div>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
  completed,
  active,
  actionLabel,
  actionHref,
  progress,
  hideCompletedAction,
}: {
  step: number;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
  actionLabel: string;
  actionHref: string;
  progress?: number;
  hideCompletedAction?: boolean;
}) {
  return (
    <div
      className={`p-6 rounded-2xl border transition-all ${
        completed
          ? "bg-green-50 border-green-200"
          : active
          ? "bg-white border-[var(--primary)] shadow-sm"
          : "bg-[var(--beige-light)] border-[var(--border)] opacity-60"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
              completed
                ? "bg-green-600 text-white"
                : active
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--beige-dark)] text-[var(--muted)]"
            }`}
          >
            {completed ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              step
            )}
          </div>
          <div>
            <h3 className="font-medium text-[var(--foreground)]">{title}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
            {progress !== undefined && (
              <div className="mt-3 w-48">
                <div className="h-2 bg-[var(--beige-dark)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary)] rounded-full transition-all"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {Math.round(progress * 100)}% complete
                </p>
              </div>
            )}
          </div>
        </div>
        {active && (
          <Link
            href={actionHref}
            className="shrink-0 px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {actionLabel}
          </Link>
        )}
        {completed && !active && !hideCompletedAction && (
          <Link
            href={actionHref}
            className="shrink-0 px-4 py-2 border border-[var(--border)] rounded-xl text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
