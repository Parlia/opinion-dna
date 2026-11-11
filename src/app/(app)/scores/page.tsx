"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ELEMENTS,
  PARLIA_AVERAGES,
  type Dimension,
  type ElementDefinition,
} from "@/lib/scoring/elements";
import { getScoreLevel } from "@/lib/scoring/engine";

interface Teaser {
  unlocked: Record<number, number>;
  distinctive: number[];
  lockedCount: number;
}

type ScoresState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "none" }
  | { status: "teaser"; teaser: Teaser }
  | { status: "full"; scores: number[] };

const CHECKOUT_HREF = "/api/stripe/checkout?product=personal";

const DIMENSION_LABELS: Record<Dimension, { label: string; description: string }> = {
  personality: {
    label: "Personality",
    description: "12 elements measuring your core psychological traits",
  },
  values: {
    label: "Values",
    description: "24 elements mapping your moral foundations and personal values",
  },
  "meta-thinking": {
    label: "Meta-Thinking",
    description: "12 elements revealing how you think about thinking",
  },
};

const DIMENSIONS: Dimension[] = ["personality", "values", "meta-thinking"];

// Score level colour mapping (matches report style)
const LEVEL_COLORS: Record<string, string> = {
  "VERY HIGH": "#6F00FF",
  HIGH: "#9B4DFF",
  MEDIUM: "#B8860B",
  LOW: "#D2691E",
  "VERY LOW": "#CC3333",
};

// Score-based color: high scores → darker/deeper, low scores → brighter/vivid
const DIMENSION_COLOR_RANGES: Record<Dimension, { low: [number, number, number]; high: [number, number, number] }> = {
  personality: {
    low:  [0, 239, 148],   // #00ef94
    high: [0, 120, 30],    // dark forest green
  },
  values: {
    low:  [0, 206, 255],   // #00ceff
    high: [0, 64, 204],    // deep blue
  },
  "meta-thinking": {
    low:  [255, 0, 247],   // #ff00f7
    high: [107, 0, 204],   // deep purple
  },
};

function scoreColor(dimension: Dimension, score: number): string {
  const range = DIMENSION_COLOR_RANGES[dimension];
  const t = score / 100; // 0 = low score (bright), 1 = high score (dark)
  const r = Math.round(range.low[0] + (range.high[0] - range.low[0]) * t);
  const g = Math.round(range.low[1] + (range.high[1] - range.low[1]) * t);
  const b = Math.round(range.low[2] + (range.high[2] - range.low[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function ScoresPage() {
  const [state, setState] = useState<ScoresState>({ status: "loading" });

  useEffect(() => {
    // The server decides what this user may see: all 48 scores once paid, a
    // short preview before that. Locked scores are never sent to the browser.
    async function loadScores() {
      try {
        const res = await fetch("/api/scores/me");
        if (!res.ok) {
          setState({ status: "error" });
          return;
        }
        const data = await res.json();
        if (data.status === "full" && Array.isArray(data.scores)) {
          setState({ status: "full", scores: data.scores });
        } else if (data.status === "teaser" && data.teaser) {
          setState({ status: "teaser", teaser: data.teaser });
        } else {
          setState({ status: "none" });
        }
      } catch {
        setState({ status: "error" });
      }
    }
    loadScores();
  }, []);

  if (state.status === "loading") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--beige-dark)] rounded w-48" />
          <div className="h-64 bg-[var(--beige-dark)] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">We couldn&apos;t load your scores</h1>
        <p className="mt-2 text-[var(--muted)]">Your answers are saved. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-block mt-6 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  if (state.status === "none") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">No scores yet</h1>
        <p className="mt-2 text-[var(--muted)]">Complete the quiz to see your scores.</p>
        <Link
          href="/quiz"
          className="inline-block mt-6 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium"
        >
          Take the Quiz
        </Link>
      </div>
    );
  }

  const teaser = state.status === "teaser" ? state.teaser : null;
  const scoreFor = (index: number): number | null =>
    state.status === "full" ? state.scores[index] : teaser!.unlocked[index] ?? null;

  return (
    <div className={`max-w-5xl mx-auto px-4 py-12 ${teaser ? "pb-28 sm:pb-12" : ""}`}>
      {teaser ? (
        <TeaserHeader teaser={teaser} />
      ) : (
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              Your Opinion DNA
            </h1>
            <p className="mt-1 text-[var(--muted)]">
              48 elements across three dimensions
            </p>
          </div>
          <Link
            href="/report"
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            View Report
          </Link>
        </div>
      )}

      <div className="space-y-10">
        {DIMENSIONS.map((dimension) => {
          const dimElements = ELEMENTS.filter((e) => e.dimension === dimension);
          const meta = DIMENSION_LABELS[dimension];

          // Group by category
          const categories = new Map<string, typeof dimElements>();
          for (const el of dimElements) {
            const cat = categories.get(el.category) || [];
            cat.push(el);
            categories.set(el.category, cat);
          }

          return (
            <div key={dimension}>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  {meta.label}
                </h2>
                <p className="text-sm text-[var(--muted)]">{meta.description}</p>
              </div>

              <div className="space-y-6">
                {Array.from(categories.entries()).map(([category, elements]) => (
                  <div key={category} className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
                    <div className="px-6 py-3 bg-[var(--beige-light)] border-b border-[var(--border)]">
                      <h3 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wide">
                        {category}
                      </h3>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                      {elements.map((element) => (
                        <ElementRow
                          key={element.index}
                          element={element}
                          score={scoreFor(element.index)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {teaser && (
        <>
          <div className="mt-10">
            <UnlockCard lockedCount={teaser.lockedCount} />
          </div>
          {/* Phone: keep the unlock button in reach while scrolling 48 rows. */}
          <div className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-[var(--border)] px-4 py-3">
            <a
              href={CHECKOUT_HREF}
              className="block w-full text-center px-4 py-3 bg-[var(--primary)] text-white rounded-xl font-medium"
            >
              Unlock all 48 scores and my report: $47
            </a>
          </div>
        </>
      )}
    </div>
  );
}

function ElementRow({ element, score }: { element: ElementDefinition; score: number | null }) {
  const avg = PARLIA_AVERAGES[element.index];

  if (score === null) {
    return (
      <div className="px-4 sm:px-6 py-3" data-locked="true">
        <div className="flex items-center justify-between gap-2 sm:gap-3 mb-1.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="min-w-7 w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0 bg-[#c9c5bd]">
              {element.code}
            </span>
            <div className="min-w-0">
              <span className="text-sm font-medium text-[var(--foreground)]">
                {element.name}
              </span>
              <p className="text-xs text-[var(--muted)] max-w-full sm:max-w-md">
                {element.tooltip}
              </p>
            </div>
          </div>
          <a
            href={CHECKOUT_HREF}
            className="flex items-center gap-1.5 shrink-0 text-xs font-medium text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
            aria-label={`Unlock your ${element.name} score`}
          >
            <LockIcon />
            Locked
          </a>
        </div>
        <div
          className="h-2 rounded-full"
          style={{
            background:
              "repeating-linear-gradient(135deg, var(--beige-dark) 0 6px, transparent 6px 12px)",
          }}
        />
      </div>
    );
  }

  const level = getScoreLevel(score);
  const adjustedColor = scoreColor(element.dimension, score);
  const levelColor = LEVEL_COLORS[level] || "#888";
  return (
    <div className="px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-1.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span
            className="min-w-7 w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ backgroundColor: adjustedColor }}
          >
            {element.code}
          </span>
          <div className="min-w-0">
            <span className="text-sm font-medium text-[var(--foreground)]">
              {element.name}
            </span>
            <p className="text-xs text-[var(--muted)] max-w-full sm:max-w-md">
              {element.tooltip}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {avg !== null && (
            <span className="hidden sm:inline text-xs text-[#aaa]">
              avg {avg}
            </span>
          )}
          <span className="text-base font-bold text-[var(--foreground)] w-7 sm:w-8 text-right">
            {score}
          </span>
          <span
            className="text-[10px] font-bold w-14 sm:w-16 text-right"
            style={{ color: levelColor }}
          >
            {level}
          </span>
        </div>
      </div>
      <div className="relative h-2 bg-[var(--beige-dark)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${score}%`,
            backgroundColor: adjustedColor,
          }}
        />
        {avg !== null && (
          <div
            className="absolute top-0 h-full w-0.5 bg-[var(--foreground)] opacity-20"
            style={{ left: `${avg}%` }}
            title={`Average: ${avg}`}
          />
        )}
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function TeaserHeader({ teaser }: { teaser: Teaser }) {
  return (
    <div className="mb-10">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Your results are in
      </h1>
      <p className="mt-1 text-[var(--muted)]">
        Here is a free preview of your Opinion DNA: your Big 5 and the three
        places you differ most from other people.
      </p>

      <h2 className="mt-8 text-sm font-medium text-[var(--muted)] uppercase tracking-wide">
        What stands out most about you
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        {teaser.distinctive.map((index) => {
          const element = ELEMENTS[index];
          const score = teaser.unlocked[index];
          const avg = PARLIA_AVERAGES[index];
          if (!element || score === undefined) return null;
          const gap = avg === null ? 0 : score - avg;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-[var(--border)] p-5"
              data-distinctive={element.name}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {element.name}
                </span>
                <span
                  className="text-2xl font-bold"
                  style={{ color: scoreColor(element.dimension, score) }}
                >
                  {score}
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-[var(--foreground)]">
                {Math.abs(gap)} points {gap >= 0 ? "above" : "below"} average
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">{element.tooltip}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <UnlockCard lockedCount={teaser.lockedCount} />
      </div>
    </div>
  );
}

function UnlockCard({ lockedCount }: { lockedCount: number }) {
  return (
    <div className="rounded-2xl border border-[var(--primary)] bg-white shadow-sm p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Unlock your full Opinion DNA
        </h2>
        <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
          <li>All 48 scores ({lockedCount} are still locked)</li>
          <li>Your personal report: life, relationships, career, and your Cognitive Signature</li>
          <li>Compare your results with a partner, friend, or co-founder</li>
        </ul>
      </div>
      <div className="mt-5 sm:mt-0 shrink-0 sm:text-center">
        <a
          href={CHECKOUT_HREF}
          className="inline-block px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Unlock everything: $47
        </a>
        <p className="mt-2 text-xs text-[var(--muted)]">
          One-time payment. 30-day money-back guarantee.
        </p>
      </div>
    </div>
  );
}
