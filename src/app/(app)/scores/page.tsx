"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ELEMENTS, PARLIA_AVERAGES, type Dimension } from "@/lib/scoring/elements";
import { getScoreLevel } from "@/lib/scoring/engine";

interface ScoresState {
  loading: boolean;
  scores: number[] | null;
}

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
  const [state, setState] = useState<ScoresState>({ loading: true, scores: null });

  useEffect(() => {
    async function loadScores() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_scores")
        .select("scores")
        .eq("user_id", user.id)
        .single();

      setState({ loading: false, scores: data?.scores ?? null });
    }
    loadScores();
  }, []);

  if (state.loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--beige-dark)] rounded w-48" />
          <div className="h-64 bg-[var(--beige-dark)] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!state.scores) {
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
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
                      {elements.map((element) => {
                        const score = state.scores![element.index];
                        const avg = PARLIA_AVERAGES[element.index];
                        const level = getScoreLevel(score);
                        const adjustedColor = scoreColor(dimension, score);
                        const levelColor = LEVEL_COLORS[level] || "#888";
                        return (
                          <div key={element.index} className="px-4 sm:px-6 py-3">
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
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
