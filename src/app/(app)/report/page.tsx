"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { createClient } from "@/lib/supabase/client";
import { ELEMENTS, PARLIA_AVERAGES } from "@/lib/scoring/elements";
import { getScoreLevel } from "@/lib/scoring/engine";

interface ReportState {
  loading: boolean;
  report: {
    id: string;
    content: string | null;
    pdf_url: string | null;
    status: string;
    scores_snapshot: number[] | null;
  } | null;
  generating: boolean;
  hasScores: boolean;
}

// Section metadata for visual treatment
const SECTION_STYLES: Record<
  string,
  { accent: string; bg: string; icon: string }
> = {
  "How to Read": {
    accent: "#888",
    bg: "#F9F8F6",
    icon: "📖",
  },
  "Part 1": {
    accent: "#6F00FF",
    bg: "#FAF8FF",
    icon: "🧬",
  },
  "Part 2": {
    accent: "#00A86B",
    bg: "#F4FBF7",
    icon: "🌿",
  },
  "Part 3": {
    accent: "#9B4DFF",
    bg: "#FAF5FF",
    icon: "💬",
  },
  "Part 4": {
    accent: "#0066CC",
    bg: "#F0F7FF",
    icon: "🚀",
  },
  "Part 5": {
    accent: "#E67E22",
    bg: "#FFF8F0",
    icon: "🧠",
  },
  "Part 6": {
    accent: "#555",
    bg: "#F9F8F6",
    icon: "📋",
  },
  "What Now": {
    accent: "#6F00FF",
    bg: "#FAF8FF",
    icon: "🎯",
  },
};

function getSectionStyle(title: string) {
  for (const [key, style] of Object.entries(SECTION_STYLES)) {
    if (title.includes(key)) return style;
  }
  return { accent: "#6F00FF", bg: "#FFFFFF", icon: "📄" };
}

// Score level colour mapping
const LEVEL_COLORS: Record<string, string> = {
  "VERY HIGH": "#6F00FF",
  HIGH: "#9B4DFF",
  MEDIUM: "#B8860B",
  LOW: "#D2691E",
  "VERY LOW": "#CC3333",
};

// Dimension colours for score bars
const DIM_COLORS: Record<string, { low: number[]; high: number[] }> = {
  personality: {
    low: [0, 239, 148],
    high: [0, 120, 30],
  },
  values: {
    low: [0, 206, 255],
    high: [0, 64, 204],
  },
  "meta-thinking": {
    low: [255, 0, 247],
    high: [107, 0, 204],
  },
};

function scoreColor(dimension: string, score: number): string {
  const range = DIM_COLORS[dimension] || DIM_COLORS.personality;
  const t = score / 100;
  const r = Math.round(range.low[0] + (range.high[0] - range.low[0]) * t);
  const g = Math.round(range.low[1] + (range.high[1] - range.low[1]) * t);
  const b = Math.round(range.low[2] + (range.high[2] - range.low[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

// Parse markdown content into sections
function parseSections(content: string) {
  const sections: { title: string; body: string; id: string }[] = [];
  const lines = content.split("\n");
  let currentTitle = "";
  let currentBody: string[] = [];
  let sectionIndex = 0;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      // Save previous section
      if (currentTitle || currentBody.length > 0) {
        sections.push({
          title: currentTitle,
          body: currentBody.join("\n").trim(),
          id: `section-${sectionIndex++}`,
        });
      }
      currentTitle = line.replace("## ", "").trim();
      currentBody = [];
    } else if (line === "---") {
      // Skip dividers
      continue;
    } else {
      currentBody.push(line);
    }
  }

  // Push last section
  if (currentTitle || currentBody.length > 0) {
    sections.push({
      title: currentTitle,
      body: currentBody.join("\n").trim(),
      id: `section-${sectionIndex}`,
    });
  }

  return sections;
}

// Parse Part 6 element explanations into a map keyed by element code
function parseElementExplanations(body: string): Record<string, string> {
  const map: Record<string, string> = {};
  // Split on bold headings like **Openness (O) — Your score: 85 (Average: 78) — VERY HIGH**
  const parts = body.split(/\*\*[^*]+\(([A-Za-z]{1,3})\)\s*[—–-]\s*Your score[^*]*\*\*/);
  // parts alternates: [text-before, code1, text-after-1, code2, text-after-2, ...]
  for (let i = 1; i < parts.length; i += 2) {
    const code = parts[i].trim();
    const explanation = (parts[i + 1] || "").trim();
    if (code && explanation) {
      // Clean up: remove leading/trailing blank lines and ### sub-headings
      const cleaned = explanation
        .replace(/^###\s+.+\n?/gm, "")
        .trim()
        .split(/\n{3,}/).join("\n\n"); // collapse excessive newlines
      // Only take up to the next dimension heading or end
      const firstChunk = cleaned.split(/\n(?=###\s)/)[0].trim();
      if (firstChunk) map[code] = firstChunk;
    }
  }
  return map;
}

// Detect and style callout blocks (Super Powers, Watch Outs, Tips)
function CalloutAwareMarkdown({
  content,
  sectionAccent,
}: {
  content: string;
  sectionAccent: string;
}) {
  // Split content into blocks: regular markdown and callout sections
  const blocks: { type: "markdown" | "superpower" | "watchout" | "tip"; content: string }[] = [];
  const lines = content.split("\n");
  let currentBlock: string[] = [];
  let currentType: "markdown" | "superpower" | "watchout" | "tip" = "markdown";

  function flush() {
    if (currentBlock.length > 0) {
      blocks.push({ type: currentType, content: currentBlock.join("\n").trim() });
      currentBlock = [];
    }
  }

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (
      lower.includes("### super power") ||
      lower.includes("**super power") ||
      (lower.startsWith("### ") && lower.includes("super"))
    ) {
      flush();
      currentType = "superpower";
      currentBlock.push(line);
    } else if (
      lower.includes("### watch out") ||
      lower.includes("**watch out") ||
      (lower.startsWith("### ") && lower.includes("watch"))
    ) {
      flush();
      currentType = "watchout";
      currentBlock.push(line);
    } else if (
      lower.includes("### tip") ||
      lower.includes("**tip") ||
      (lower.startsWith("### ") && lower.includes("tip"))
    ) {
      flush();
      currentType = "tip";
      currentBlock.push(line);
    } else if (
      line.startsWith("### ") &&
      currentType !== "markdown"
    ) {
      // New h3 that isn't a callout — back to regular
      flush();
      currentType = "markdown";
      currentBlock.push(line);
    } else {
      currentBlock.push(line);
    }
  }
  flush();

  const calloutStyles = {
    superpower: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: "⚡",
      label: "Super Powers",
      labelColor: "text-emerald-700",
    },
    watchout: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: "⚠️",
      label: "Watch Outs",
      labelColor: "text-amber-700",
    },
    tip: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "💡",
      label: "Tips",
      labelColor: "text-blue-700",
    },
  };

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "markdown") {
          return (
            <MarkdownBlock key={i} content={block.content} accent={sectionAccent} />
          );
        }

        const style = calloutStyles[block.type];
        return (
          <div
            key={i}
            className={`${style.bg} ${style.border} border rounded-xl p-5 my-6`}
          >
            <div className={`flex items-center gap-2 mb-3 ${style.labelColor} text-sm font-bold uppercase tracking-wide`}>
              <span>{style.icon}</span>
              {style.label}
            </div>
            <MarkdownBlock content={block.content} accent={sectionAccent} />
          </div>
        );
      })}
    </>
  );
}

// Reusable markdown renderer.
// Memoized: Reports can be 30-50K chars; react-markdown has to re-parse the
// whole string on every render. Wrapping in React.memo + useMemo on the
// components object avoids cascading re-parses when the parent re-renders.
const REMARK_PLUGINS = [remarkGfm];
// Defence-in-depth: report markdown is AI-generated today, but we plan to add
// public sharing. rehype-sanitize strips any smuggled <script>/<iframe>/etc.
const REHYPE_PLUGINS = [rehypeSanitize];
const MarkdownBlock = React.memo(function MarkdownBlock({ content, accent }: { content: string; accent: string }) {
  const components = useMemo<React.ComponentProps<typeof ReactMarkdown>["components"]>(() => ({
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold text-black mt-0 mb-2">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2
            className="text-xl font-bold text-black mt-8 mb-4 pb-2 border-b-2"
            style={{ borderColor: accent }}
          >
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-bold text-[#222] mt-5 mb-2">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-[#333] leading-relaxed mb-4 text-[15px]">{children}</p>
        ),
        strong: ({ children }) => {
          const text = String(children);
          // Check if it's a score-level keyword
          const levelColor = LEVEL_COLORS[text];
          if (levelColor) {
            return (
              <strong style={{ color: levelColor, fontWeight: 700 }}>
                {children}
              </strong>
            );
          }
          return <strong className="font-bold text-[#111]">{children}</strong>;
        },
        em: ({ children }) => <em className="text-[#666] not-italic">{children}</em>,
        hr: () => <hr className="my-6 border-[var(--beige-dark)]" />,
        ul: ({ children }) => (
          <ul className="list-disc list-outside ml-5 mb-4 space-y-1 text-[#333] text-[15px]">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-outside ml-5 mb-4 space-y-1 text-[#333] text-[15px]">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse border border-[#D5D0C6] rounded-lg overflow-hidden">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-[#222] text-white">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left text-xs font-bold uppercase">
            {children}
          </th>
        ),
        td: ({ children }) => {
          const text = String(children);
          const levelColor = LEVEL_COLORS[text];
          return (
            <td
              className="px-3 py-2 border-b border-[#D5D0C6]"
              style={
                levelColor
                  ? { color: levelColor, fontWeight: 700 }
                  : undefined
              }
            >
              {children}
            </td>
          );
        },
        tr: ({ children, ...props }) => {
          const isBody =
            !props.node?.position || props.node.position.start.line > 3;
          return (
            <tr className={isBody ? "even:bg-[#F7F4EE]" : ""}>{children}</tr>
          );
        },
  }), [accent]);

  return (
    <ReactMarkdown
      remarkPlugins={REMARK_PLUGINS}
      rehypePlugins={REHYPE_PLUGINS}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
});
MarkdownBlock.displayName = "MarkdownBlock";

// Visual score bars for Part 1
function ElementRow({ idx, dimKey, scores, explanations }: {
  idx: number;
  dimKey: "personality" | "values" | "meta-thinking";
  scores: number[];
  explanations: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const el = ELEMENTS[idx];
  const score = scores[idx];
  const avg = PARLIA_AVERAGES[idx];
  const level = getScoreLevel(score);
  const color = scoreColor(dimKey, score);
  const levelColor = LEVEL_COLORS[level] || "#888";
  const explanation = explanations[el.code];

  return (
    <div
      className={`px-4 py-3 ${explanation ? "cursor-pointer hover:bg-[#FAFAF8] transition-colors" : ""}`}
      onClick={() => explanation && setOpen(!open)}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-1.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span
            className="min-w-7 w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ backgroundColor: color }}
          >
            {el.code}
          </span>
          <span className="text-sm font-medium text-[#222] min-w-0 truncate">
            {el.name}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-right shrink-0">
          {avg !== null && (
            <span className="hidden sm:inline text-xs text-[#aaa]">avg {avg}</span>
          )}
          <span className="text-base font-bold text-[#222] w-7 sm:w-8 text-right">
            {score}
          </span>
          <span
            className="text-[10px] font-bold w-14 sm:w-16 text-right"
            style={{ color: levelColor }}
          >
            {level}
          </span>
          {explanation && (
            <svg
              className={`w-3.5 h-3.5 text-[#bbb] transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
      <div className="relative h-2 bg-[#F0ECE4] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
        {avg !== null && (
          <div
            className="absolute top-0 h-full w-0.5 bg-[#222] opacity-20"
            style={{ left: `${avg}%` }}
          />
        )}
      </div>
      {/* Smooth expand/collapse via grid-template-rows trick */}
      {explanation && (
        <div
          className={`grid transition-[grid-template-rows,margin-top] duration-300 ease-out ${
            open ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr] mt-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="bg-[#F9F8F6] border border-[#E8E4DC] rounded-lg px-4 py-3">
              <p className="text-[13px] text-[#444] leading-relaxed">{explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBarsSection({ scores, explanations }: { scores: number[]; explanations: Record<string, string> }) {
  const dimensions = [
    {
      label: "Personality",
      description:
        "Your biological bedrock — deeply embedded, remarkably stable over a lifetime",
      categories: [
        { label: "The Big 5", indices: [0, 1, 2, 3, 4] },
        { label: "The Dark Triad", indices: [5, 6, 7] },
        { label: "Emotional Regulation, Mortality & Life Satisfaction", indices: [8, 9, 10, 11] },
      ],
    },
    {
      label: "Values",
      description:
        "Beliefs animated by emotion — stable but shaped by culture and experience",
      categories: [
        { label: "Moral Foundations", indices: [12, 13, 14, 15, 16] },
        { label: "Cooperative Virtues", indices: [17, 18, 19, 20, 21, 22, 23] },
        { label: "Personal Values", indices: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33] },
        { label: "Social Orientation", indices: [34, 35] },
      ],
    },
    {
      label: "Meta-Thinking",
      description:
        "How your mind works — where it rests, what it tends toward",
      categories: [
        { label: "Meta-Thinking", indices: [36, 37, 38, 39, 40, 41, 42, 43] },
        { label: "Primal World Beliefs", indices: [44, 45, 46, 47] },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {dimensions.map((dim) => {
        const dimKey = dim.label.toLowerCase().replace(" ", "-") as
          | "personality"
          | "values"
          | "meta-thinking";
        return (
          <div key={dim.label}>
            <h3 className="text-lg font-bold text-[#222] mb-1">{dim.label}</h3>
            <p className="text-sm text-[#888] mb-4">{dim.description}</p>
            <div className="space-y-4">
              {dim.categories.map((cat) => (
                <div
                  key={cat.label}
                  className="bg-white rounded-xl border border-[#E8E4DC] overflow-hidden"
                >
                  <div className="px-4 py-2 bg-[#F7F4EE] border-b border-[#E8E4DC]">
                    <span className="text-xs font-medium text-[#888] uppercase tracking-wide">
                      {cat.label}
                    </span>
                  </div>
                  <div className="divide-y divide-[#F0ECE4]">
                    {cat.indices.map((idx) => (
                      <ElementRow key={idx} idx={idx} dimKey={dimKey} scores={scores} explanations={explanations} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Report Generation Loading Experience ───

const GENERATION_PHASES = [
  { label: "Reading your scores", duration: 4, icon: "📊" },
  { label: "Mapping your profile", duration: 8, icon: "🧬" },
  { label: "Writing Life & Happiness Insight", duration: 35, icon: "🌿" },
  { label: "Writing Relationships Insight", duration: 30, icon: "💬" },
  { label: "Writing Career Insight", duration: 30, icon: "🚀" },
  { label: "Writing your Cognitive Signature", duration: 25, icon: "🧠" },
  { label: "Detailing your 48 elements", duration: 40, icon: "📋" },
  { label: "Finalising your report", duration: 12, icon: "✨" },
];

const ELEMENT_VERBS = [
  "Analysing", "Considering", "Examining", "Weighing",
  "Interpreting", "Evaluating", "Mapping", "Reading",
];

function GeneratingView() {
  const [progress, setProgress] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [elementIdx, setElementIdx] = useState(0);
  const [verbIdx, setVerbIdx] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);
  const [visibleElements, setVisibleElements] = useState<number[]>([]);
  const startTime = useRef(Date.now());

  // Simulate progress through phases
  useEffect(() => {
    const totalDuration = GENERATION_PHASES.reduce((s, p) => s + p.duration, 0);

    const tick = setInterval(() => {
      const now = Date.now();
      const realElapsed = (now - startTime.current) / 1000;

      // Non-linear progress: sine-wave wobble makes bar surge and slow rhythmically
      // wobble(t, range) adds a ±range oscillation over ~15-second cycles
      const wobble = (t: number, range: number) =>
        Math.sin(t * 0.42) * range + Math.sin(t * 0.17) * range * 0.5;

      let simProgress: number;
      if (realElapsed < 120) {
        // 0-2 min: base linear 0→80%, wobble ±3% so it surges and pauses
        const base = (realElapsed / 120) * 80;
        simProgress = Math.max(0, Math.min(80, base + wobble(realElapsed, 3)));
      } else if (realElapsed < 240) {
        // 2-4 min: base linear 80→97%, wobble ±2% (slower feel)
        const t2 = realElapsed - 120;
        const base = 80 + (t2 / 120) * 17;
        simProgress = Math.max(80, Math.min(97, base + wobble(realElapsed, 2)));
      } else {
        // Cap at 97% — actual completion comes from poll
        simProgress = Math.min(97, 97 + (realElapsed - 240) * 0.01);
      }

      setProgress(simProgress);

      // Determine which phase we're in based on progress
      let cumulative = 0;
      for (let i = 0; i < GENERATION_PHASES.length; i++) {
        const phasePercent = (GENERATION_PHASES[i].duration / totalDuration) * 97;
        cumulative += phasePercent;
        if (simProgress < cumulative) {
          setPhaseIdx(i);
          break;
        }
      }
    }, 200);

    return () => clearInterval(tick);
  }, []);

  // Cycle through element names
  useEffect(() => {
    const interval = setInterval(() => {
      setFadingOut(true);
      setTimeout(() => {
        setElementIdx((prev) => (prev + 1) % ELEMENTS.length);
        setVerbIdx((prev) => (prev + 1) % ELEMENT_VERBS.length);
        setFadingOut(false);
      }, 300);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  // Gradually reveal element badges
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleElements((prev) => {
        if (prev.length >= 48) return prev;
        // Add next element not yet visible
        const next = prev.length;
        return [...prev, next];
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const currentElement = ELEMENTS[elementIdx];
  const currentVerb = ELEMENT_VERBS[verbIdx];
  const currentPhase = GENERATION_PHASES[phaseIdx];

  // Dimension colour for current element
  const dimColors: Record<string, string> = {
    personality: "#00C839",
    values: "#0082FF",
    "meta-thinking": "#A000FF",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Hero animation area */}
      <div className="text-center mb-10">
        {/* Animated DNA helix icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full opacity-20 animate-ping"
            style={{
              backgroundColor: dimColors[currentElement.dimension],
              animationDuration: "2s",
            }}
          />
          <div
            className="absolute inset-2 rounded-full opacity-30"
            style={{
              backgroundColor: dimColors[currentElement.dimension],
              transition: "background-color 0.6s ease",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-3xl">
            {currentPhase.icon}
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-2">
          Crafting your report
        </h1>

        {/* Current phase label */}
        <p className="text-[var(--muted)] text-sm mb-6">
          {currentPhase.label}...
        </p>

        {/* Cycling element text */}
        <div className="h-8 flex items-center justify-center">
          <div
            className="transition-all duration-300 ease-in-out"
            style={{
              opacity: fadingOut ? 0 : 1,
              transform: fadingOut ? "translateY(8px)" : "translateY(0)",
            }}
          >
            <span className="text-[15px] text-[#555]">
              {currentVerb}{" "}
              <span
                className="font-semibold"
                style={{
                  color: dimColors[currentElement.dimension],
                  transition: "color 0.3s ease",
                }}
              >
                {currentElement.name}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Multi-segment progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2.5 bg-[var(--beige-dark)] rounded-full overflow-hidden relative">
          {/* Animated gradient fill */}
          <div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              width: `${progress}%`,
              transition: "width 0.4s ease-out",
              background: `linear-gradient(90deg, #00C839 0%, #0082FF 50%, #A000FF 100%)`,
            }}
          >
            {/* Shimmer effect */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                animation: "shimmer 1.5s infinite",
              }}
            />
          </div>
        </div>

        {/* Phase markers */}
        <div className="flex mt-3 gap-1">
          {GENERATION_PHASES.map((phase, i) => {
            const totalDuration = GENERATION_PHASES.reduce((s, p) => s + p.duration, 0);
            const width = (phase.duration / totalDuration) * 100;
            const isActive = i === phaseIdx;
            const isDone = i < phaseIdx;

            return (
              <div
                key={i}
                className="relative"
                style={{ width: `${width}%` }}
              >
                <div
                  className="h-1 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: isDone
                      ? "#6F00FF"
                      : isActive
                        ? "rgba(111, 0, 255, 0.4)"
                        : "rgba(111, 0, 255, 0.1)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Element badges grid — gradually appearing */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-5 mb-6">
        <div className="text-xs text-[var(--muted)] uppercase tracking-wide font-medium mb-3">
          Analysing 48 elements
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ELEMENTS.map((el, i) => {
            const isVisible = visibleElements.includes(i);
            const isCurrentlyAnalysing = i === elementIdx;

            return (
              <div
                key={i}
                className="transition-all duration-500"
                style={{
                  opacity: isVisible ? 1 : 0.08,
                  transform: isVisible ? "scale(1)" : "scale(0.8)",
                }}
              >
                <div
                  className="px-2 py-1 rounded-md text-[10px] font-bold text-white relative overflow-hidden"
                  style={{
                    backgroundColor: isVisible
                      ? el.color
                      : "rgba(0,0,0,0.1)",
                  }}
                >
                  {isCurrentlyAnalysing && isVisible && (
                    <div
                      className="absolute inset-0 rounded-md"
                      style={{
                        boxShadow: `0 0 8px ${el.color}`,
                        animation: "pulse-glow 1s infinite",
                      }}
                    />
                  )}
                  <span className="relative z-10">{el.code}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section cards showing progress */}
      <div className="space-y-2">
        {[
          { label: "Part 2: Life & Happiness", icon: "🌿", phaseRange: [2, 2] },
          { label: "Part 3: Relationships", icon: "💬", phaseRange: [3, 3] },
          { label: "Part 4: Career", icon: "🚀", phaseRange: [4, 4] },
          { label: "Part 5: Cognitive Signature", icon: "🧠", phaseRange: [5, 5] },
          { label: "Part 6: 48 Elements Explained", icon: "📋", phaseRange: [6, 6] },
        ].map((section, i) => {
          const isDone = phaseIdx > section.phaseRange[1];
          const isActive =
            phaseIdx >= section.phaseRange[0] &&
            phaseIdx <= section.phaseRange[1];

          return (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500"
              style={{
                backgroundColor: isDone
                  ? "rgba(111, 0, 255, 0.06)"
                  : isActive
                    ? "rgba(111, 0, 255, 0.03)"
                    : "transparent",
                borderLeft: isDone
                  ? "3px solid #6F00FF"
                  : isActive
                    ? "3px solid rgba(111, 0, 255, 0.3)"
                    : "3px solid transparent",
              }}
            >
              <span className="text-base">{section.icon}</span>
              <span
                className="text-sm transition-colors duration-300"
                style={{
                  color: isDone ? "#222" : isActive ? "#555" : "#bbb",
                  fontWeight: isDone || isActive ? 500 : 400,
                }}
              >
                {section.label}
              </span>
              <div className="ml-auto">
                {isDone ? (
                  <svg className="w-4 h-4 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : isActive ? (
                  <div
                    className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-[var(--beige-dark)]" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reassurance text */}
      <p className="text-center text-xs text-[var(--muted)] mt-8 mb-10">
        This usually takes 2-4 minutes. Your report will appear automatically when ready.
      </p>

      {/* Share while you wait */}
      <ShareWhileYouWait />
    </div>
  );
}

const SHARE_URL = "https://www.opiniondna.com";
const SHARE_TEXT = "I just took the Opinion DNA assessment — 48 dimensions of how I think, what I value, and how my mind works. Fascinating.";

function ShareWhileYouWait({ title, subtitle }: { title?: string; subtitle?: string } = {}) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(SHARE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const socials = [
    {
      name: "X",
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      bg: "#000000",
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      bg: "#0A66C2",
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      bg: "#1877F2",
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + " " + SHARE_URL)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      bg: "#25D366",
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@opiniondna",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
      bg: "#000000",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/opiniondna",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z" />
        </svg>
      ),
      bg: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
    },
    {
      name: "Email",
      href: `mailto:?subject=${encodeURIComponent("Check out Opinion DNA")}&body=${encodeURIComponent(SHARE_TEXT + "\n\n" + SHARE_URL)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
          <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
        </svg>
      ),
      bg: "#888888",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-6 text-center">
      <p className="text-sm font-semibold text-[#222] mb-1">
        {title || "While you wait..."}
      </p>
      <p className="text-xs text-[var(--muted)] mb-5">
        {subtitle || "Tell a friend about Opinion DNA"}
      </p>

      <div className="flex items-center justify-center gap-2.5 mb-5">
        {socials.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Share on ${s.name}`}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
            style={{
              background: s.bg,
            }}
          >
            {s.icon}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-[var(--beige-light)] rounded-xl px-4 py-2.5 max-w-sm mx-auto">
        <span className="text-sm text-[#555] truncate flex-1 text-left">
          opiniondna.com
        </span>
        <button
          onClick={copyLink}
          className="text-xs font-semibold text-[var(--primary)] hover:underline whitespace-nowrap"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const [state, setState] = useState<ReportState>({
    loading: true,
    report: null,
    generating: false,
    hasScores: false,
  });
  const [activeSection, setActiveSection] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [navScroll, setNavScroll] = useState({ left: false, right: true });

  useEffect(() => {
    loadReport();
  }, []);

  // Auto-scroll nav so active button is visible
  useEffect(() => {
    if (!navRef.current) return;
    const activeBtn = navRef.current.querySelector("[data-active-nav]") as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeSection]);

  // Track nav scroll position for arrow indicators
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setNavScroll({
        left: scrollLeft > 5,
        right: scrollLeft + clientWidth < scrollWidth - 5,
      });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [state.report]);

  // Scroll spy for section navigation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = parseInt(
              entry.target.getAttribute("data-section-idx") || "0"
            );
            setActiveSection(idx);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    const elements = document.querySelectorAll("[data-section-idx]");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [state.report]);

  async function loadReport() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: scores } = await supabase
      .from("user_scores")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    const hasScores = (scores?.length ?? 0) > 0;

    const { data: reports } = await supabase
      .from("reports")
      .select("id, content, pdf_url, status, scores_snapshot")
      .eq("user_id", user.id)
      .eq("type", "personal")
      .order("created_at", { ascending: false })
      .limit(1);

    setState({
      loading: false,
      report: reports?.[0] ?? null,
      generating: reports?.[0]?.status === "generating",
      hasScores,
    });

    if (reports?.[0]?.status === "generating") {
      pollReport();
    }
  }

  async function pollReport() {
    const interval = setInterval(async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: reports } = await supabase
        .from("reports")
        .select("id, content, pdf_url, status, scores_snapshot")
        .eq("user_id", user.id)
        .eq("type", "personal")
        .order("created_at", { ascending: false })
        .limit(1);

      if (reports?.[0]?.status === "completed") {
        clearInterval(interval);
        setState((prev) => ({
          ...prev,
          report: reports[0],
          generating: false,
        }));
      } else if (reports?.[0]?.status === "failed") {
        clearInterval(interval);
        setState((prev) => ({
          ...prev,
          report: reports[0],
          generating: false,
        }));
      }
    }, 5000);
  }

  async function handleGenerate() {
    setState((prev) => ({ ...prev, generating: true }));

    try {
      const response = await fetch("/api/report/generate", {
        method: "POST",
      });

      if (response.ok) {
        loadReport();
      } else {
        setState((prev) => ({ ...prev, generating: false }));
        loadReport();
      }
    } catch {
      setState((prev) => ({ ...prev, generating: false }));
    }
  }

  async function handleDownloadPdf() {
    if (state.report?.pdf_url) {
      window.open(state.report.pdf_url, "_blank");
      return;
    }

    setPdfLoading(true);
    try {
      const response = await fetch("/api/report/pdf");
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "opinion-dna-report.pdf";
        a.click();
        URL.revokeObjectURL(url);
        loadReport(); // Reload to pick up cached pdf_url
      }
    } finally {
      setPdfLoading(false);
    }
  }

  const allSections = useMemo(() => {
    if (!state.report?.content) return [];
    return parseSections(state.report.content);
  }, [state.report?.content]);

  // Extract Part 6 explanations and remove it from rendered sections
  const elementExplanations = useMemo(() => {
    const part6 = allSections.find(s => s.title.includes("Part 6") || s.title.includes("48 Elements"));
    return part6 ? parseElementExplanations(part6.body) : {};
  }, [allSections]);

  const sections = useMemo(() => {
    return allSections.filter(s => !s.title.includes("Part 6") && !s.title.includes("48 Elements"));
  }, [allSections]);

  // Navigation labels
  const navItems = useMemo(() => {
    return sections
      .filter((s) => s.title)
      .map((s, i) => {
        let short = s.title;
        if (short.includes(":")) short = short.split(":")[0].trim();
        if (short.length > 20) short = short.substring(0, 20) + "…";
        return { label: short, idx: i, id: s.id };
      });
  }, [sections]);

  if (state.loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--beige-dark)] rounded w-48" />
          <div className="h-96 bg-[var(--beige-dark)] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!state.hasScores) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">No report available</h1>
        <p className="mt-2 text-[var(--muted)]">
          Complete the quiz first to generate your report.
        </p>
        <Link
          href="/quiz"
          className="inline-block mt-6 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium"
        >
          Take the Quiz
        </Link>
      </div>
    );
  }

  if (state.generating) {
    return <GeneratingView />;
  }

  if (state.report?.status === "failed") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">Report generation failed</h1>
        <p className="mt-2 text-[var(--muted)]">
          Something went wrong. Please try again.
        </p>
        <button
          onClick={handleGenerate}
          className="mt-6 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!state.report || !state.report.content) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">Your Report</h1>
        <p className="mt-2 text-[var(--muted)]">
          Your scores are ready. Generate your AI-powered personal report.
        </p>
        <button
          onClick={handleGenerate}
          className="mt-6 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Generate Report
        </button>
      </div>
    );
  }

  const reportScores = state.report.scores_snapshot;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Your Opinion DNA Report
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            48 dimensions across Personality, Values, and Meta-Thinking
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/scores"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            View Scores
          </Link>
          <Link
            href="/compare"
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Compare Scores
          </Link>
        </div>
      </div>

      {/* Section navigation */}
      {navItems.length > 0 && (
        <div className="sticky top-0 z-30 bg-[var(--background)]/95 backdrop-blur-sm py-3 mb-6 -mx-4 px-4 border-b border-[var(--border)]">
          <div className="relative">
            {/* Left arrow */}
            {navScroll.left && (
              <button
                onClick={() => navRef.current?.scrollBy({ left: -120, behavior: "smooth" })}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center text-gray-400 active:text-gray-600"
                style={{ background: "linear-gradient(to right, var(--background) 60%, transparent)" }}
                aria-label="Scroll nav left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            {/* Right arrow */}
            {navScroll.right && (
              <button
                onClick={() => navRef.current?.scrollBy({ left: 120, behavior: "smooth" })}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center text-gray-400 active:text-gray-600"
                style={{ background: "linear-gradient(to left, var(--background) 60%, transparent)" }}
                aria-label="Scroll nav right"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
            <div ref={navRef} className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {navItems.map((item) => (
                <button
                  key={item.idx}
                  {...(activeSection === item.idx ? { "data-active-nav": true } : {})}
                  onClick={() => {
                    document
                      .getElementById(item.id)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeSection === item.idx
                      ? "bg-[var(--primary)] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, idx) => {
          const style = getSectionStyle(section.title);
          const isPart1 = section.title.includes("Part 1");

          // Skip the intro/cover section before any ## heading
          if (!section.title && idx === 0) {
            return (
              <div
                key={idx}
                data-section-idx={idx}
                id={section.id}
                className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center"
              >
                <MarkdownBlock content={section.body} accent="#6F00FF" />
              </div>
            );
          }

          return (
            <div
              key={idx}
              data-section-idx={idx}
              id={section.id}
              className="rounded-2xl border border-[var(--border)] overflow-hidden"
              style={{ backgroundColor: style.bg }}
            >
              {/* Section header */}
              <div
                className="px-6 sm:px-8 py-4 flex items-center gap-3"
                style={{ borderBottom: `3px solid ${style.accent}` }}
              >
                <span className="text-xl">{style.icon}</span>
                <h2 className="text-lg font-bold text-[#222]">
                  {section.title}
                </h2>
              </div>

              {/* Section body */}
              <div className="px-6 sm:px-8 py-6">
                {isPart1 && reportScores ? (
                  <ScoreBarsSection scores={reportScores} explanations={elementExplanations} />
                ) : (
                  <CalloutAwareMarkdown
                    content={section.body}
                    sectionAccent={style.accent}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Steps */}
      <div className="mt-12 space-y-6">
        <div className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            Compare your results
          </h2>
          <p className="text-sm text-[var(--muted)] mb-6 max-w-md mx-auto">
            Invite a friend, partner, or colleague to take their own assessment and see how your minds compare.
          </p>
          <Link
            href="/compare"
            className="inline-block px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Compare Scores
          </Link>
        </div>

        <ShareWhileYouWait
          title="Share Opinion DNA"
          subtitle="Know someone who&rsquo;d find this interesting?"
        />
      </div>
    </div>
  );
}
