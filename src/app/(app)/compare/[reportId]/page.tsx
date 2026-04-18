"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ELEMENTS, PARLIA_AVERAGES } from "@/lib/scoring/elements";
import { getScoreLevel } from "@/lib/scoring/engine";
import { getComparisonExplanation } from "@/lib/scoring/dimension-explanations";

// ── Types ───────────────────────────────────────────────────────────────────

interface ComparisonReport {
  id: string;
  content: string | null;
  status: string;
  scores_snapshot: number[] | null;
  comparison_scores_snapshot: number[] | null;
  relationship_type: string | null;
}

// ── Constants ───────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, string> = {
  "VERY HIGH": "#6F00FF",
  HIGH: "#9B4DFF",
  MEDIUM: "#B8860B",
  LOW: "#D2691E",
  "VERY LOW": "#CC3333",
};

const DIM_COLORS: Record<string, { low: number[]; high: number[] }> = {
  personality: { low: [0, 239, 148], high: [0, 120, 30] },
  values: { low: [0, 206, 255], high: [0, 64, 204] },
  "meta-thinking": { low: [255, 0, 247], high: [107, 0, 204] },
};

function scoreColor(dimension: string, score: number): string {
  const range = DIM_COLORS[dimension] || DIM_COLORS.personality;
  const t = score / 100;
  const r = Math.round(range.low[0] + (range.high[0] - range.low[0]) * t);
  const g = Math.round(range.low[1] + (range.high[1] - range.low[1]) * t);
  const b = Math.round(range.low[2] + (range.high[2] - range.low[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function gapColor(gap: number): string {
  if (gap < 15) return "#22c55e"; // green
  if (gap < 30) return "#B8860B"; // amber
  return "#DC2626"; // red
}

const SECTION_STYLES: Record<string, { accent: string; bg: string; icon: string }> = {
  "Co-Founder Compatibility": { accent: "#6F00FF", bg: "#FAF8FF", icon: "🤝" },
  "Compatibility Score": { accent: "#6F00FF", bg: "#FAF8FF", icon: "📊" },
  "Co-Founder Compatibility Score": { accent: "#6F00FF", bg: "#FAF8FF", icon: "📊" },
  "Where You Align": { accent: "#1a7a3a", bg: "#F4FBF7", icon: "✅" },
  "Navigate Differences": { accent: "#B8860B", bg: "#FFF9EE", icon: "⚠️" },
  "What to Know About Your Co-Founder": { accent: "#E91E63", bg: "#FFF0F5", icon: "💜" },
  "Success Factors": { accent: "#6F00FF", bg: "#FFFFFF", icon: "📋" },
  "Blind Spots": { accent: "#9B4DFF", bg: "#FAF5FF", icon: "👁️" },
  "Stress Tendencies": { accent: "#E67E22", bg: "#FFF8F0", icon: "🧠" },
  "Under Pressure": { accent: "#E67E22", bg: "#FFF8F0", icon: "🔥" },
  "Behavioral Patterns": { accent: "#555", bg: "#F9F8F6", icon: "🔍" },
  "Conversation Cards": { accent: "#00A86B", bg: "#F4FBF7", icon: "💬" },
  "Mitigation Playbook": { accent: "#0066CC", bg: "#F0F7FF", icon: "🛡️" },
  "Perfect Pitches": { accent: "#6F00FF", bg: "#FAF8FF", icon: "🎤" },
  "All 48 Dimensions": { accent: "#555", bg: "#F9F8F6", icon: "📋" },
  "What Now": { accent: "#6F00FF", bg: "#FAF8FF", icon: "🎯" },
  "What Comes Next": { accent: "#6F00FF", bg: "#FAF8FF", icon: "🎯" },
  // Couples report sections (v2 brief-based)
  "Chemistry Signature": { accent: "#E91E63", bg: "#FFF0F5", icon: "✨" },
  "Where You Overlap": { accent: "#1a7a3a", bg: "#F4FBF7", icon: "🤝" },
  "Where You Diverge": { accent: "#B8860B", bg: "#FFF9EE", icon: "🔀" },
  "Process the World": { accent: "#6F00FF", bg: "#FAF8FF", icon: "🧠" },
  "Value Differently": { accent: "#0066CC", bg: "#F0F7FF", icon: "💎" },
  "Handle Emotion": { accent: "#E91E63", bg: "#FFF0F5", icon: "💗" },
  "A Note to Each of You": { accent: "#9B4DFF", bg: "#FAF5FF", icon: "💌" },
  "Where the Friction Lives": { accent: "#E67E22", bg: "#FFF8F0", icon: "🔥" },
  "Conflict and Repair": { accent: "#0066CC", bg: "#F0F7FF", icon: "🛠️" },
  "Big Decisions Compass": { accent: "#6F00FF", bg: "#FAF8FF", icon: "🧭" },
  "Growth Edges": { accent: "#1a7a3a", bg: "#F4FBF7", icon: "🌱" },
  "Conversation Prompts": { accent: "#00A86B", bg: "#F4FBF7", icon: "💬" },
  "Methodology and Sources": { accent: "#555", bg: "#F9F8F6", icon: "📚" },
  // Couples report sections (legacy — kept for backward compat)
  "Relationship Success": { accent: "#E91E63", bg: "#FFF0F5", icon: "💕" },
  "Relationship Playbook": { accent: "#0066CC", bg: "#F0F7FF", icon: "📖" },
  "Couples Compatibility": { accent: "#E91E63", bg: "#FFF0F5", icon: "💕" },
  // Friends report sections (v2 brief-based)
  // ("Where You Align", "Where You Diverge", "Where the Friction Lives",
  //  "Growth Edges", "Conversation Prompts", "Methodology and Sources"
  //  are shared with co-founders/couples entries above)
  "Friendship Signature": { accent: "#E91E63", bg: "#FFF0F5", icon: "✨" },
  "How You Both Think": { accent: "#6F00FF", bg: "#FAF8FF", icon: "🧠" },
  "What You Both Value": { accent: "#0066CC", bg: "#F0F7FF", icon: "💎" },
  "Emotional Rhythm": { accent: "#E91E63", bg: "#FFF0F5", icon: "💗" },
  "Repair and Stay-Close": { accent: "#0066CC", bg: "#F0F7FF", icon: "🛠️" },
  "Drift and Transitions Compass": { accent: "#6F00FF", bg: "#FAF8FF", icon: "🧭" },
  // Friends report sections (legacy — kept for backward compat)
  "Friendship Profile": { accent: "#E91E63", bg: "#FFF0F5", icon: "💜" },
  "Where You Click": { accent: "#1a7a3a", bg: "#F4FBF7", icon: "✨" },
  "Butt Heads": { accent: "#E67E22", bg: "#FFF8F0", icon: "😄" },
  "Conversation Starters": { accent: "#00A86B", bg: "#F4FBF7", icon: "💬" },
  "Friend You Need": { accent: "#6F00FF", bg: "#FAF8FF", icon: "🤝" },
};

function getSectionStyle(title: string) {
  for (const [key, style] of Object.entries(SECTION_STYLES)) {
    if (title.includes(key)) return style;
  }
  return { accent: "#222", bg: "#FFFFFF", icon: "📄" };
}

// ── Section Parser ──────────────────────────────────────────────────────────

function parseSections(content: string) {
  const sections: { title: string; body: string; id: string }[] = [];
  const lines = content.split("\n");
  let currentTitle = "";
  let currentBody: string[] = [];
  let sectionIndex = 0;

  for (const line of lines) {
    if (line.startsWith("## ")) {
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
      continue;
    } else {
      currentBody.push(line);
    }
  }

  if (currentTitle || currentBody.length > 0) {
    sections.push({
      title: currentTitle,
      body: currentBody.join("\n").trim(),
      id: `section-${sectionIndex}`,
    });
  }

  return sections;
}

// ── Callout-Aware Markdown (reused from report page) ────────────────────────

function CalloutAwareMarkdown({ content, accent, sectionTitle }: { content: string; accent: string; sectionTitle?: string }) {
  type BlockType = "markdown" | "card" | "protocol" | "mitigation" | "superpower" | "watchout" | "tip";
  const blocks: { type: BlockType; content: string; spaceAbove?: boolean }[] = [];
  const lines = content.split("\n");
  let currentBlock: string[] = [];
  let currentType: BlockType = "markdown";
  let needsSpaceAbove = false;

  // Determine the parent section context to classify h3 entries
  const sectionLower = (sectionTitle || "").toLowerCase();
  const isMitigationSection = sectionLower.includes("mitigation") || sectionLower.includes("playbook");
  const isConversationSection = sectionLower.includes("conversation") || sectionLower.includes("card");
  const isBehavioralSection = sectionLower.includes("behavioral") || sectionLower.includes("pattern") || sectionLower.includes("under pressure") || sectionLower.includes("strategic instinct");
  const isSuccessSection = sectionLower.includes("success");

  function flush() {
    if (currentBlock.length > 0) {
      blocks.push({ type: currentType, content: currentBlock.join("\n").trim(), spaceAbove: needsSpaceAbove });
      currentBlock = [];
      needsSpaceAbove = false;
    }
  }

  function classifyH3(heading: string): BlockType {
    const lower = heading.toLowerCase();
    // Super Powers, Watch Outs, Tips — same as individual report
    if (lower.includes("super power")) return "superpower";
    if (lower.includes("watch out")) return "watchout";
    if (lower.includes("tip")) return "tip";
    // Context-aware classification based on parent section
    if (isMitigationSection) return "protocol";
    if (isConversationSection) return "card";
    if (isBehavioralSection) return "mitigation";
    // Fallback keyword matching
    if (lower.includes("card")) return "card";
    if (lower.includes("protocol") || lower.includes("rule")) return "protocol";
    return "markdown";
  }

  for (const line of lines) {
    if (line.startsWith("### ")) {
      flush();
      currentType = classifyH3(line);
      currentBlock.push(line);
    } else if (line.startsWith("**CARD ")) {
      flush();
      currentType = "card";
      currentBlock.push(line);
    } else if (line.match(/^\*\*[A-Z][\w\s&'-]+\*\*\s*\(\d+\/100\)/)) {
      // Success factor with score: **Factor Name** (XX/100)
      flush();
      currentType = "protocol";
      needsSpaceAbove = true;
      currentBlock.push(line);
    } else if (isSuccessSection && currentType !== "protocol" && line.match(/^\*\*[A-Z][\w\s&',-]+\*\*\s*$/)) {
      // Success factor heading without score — flush previous, start new block with spacing flag
      flush();
      currentType = "markdown";
      currentBlock.push(line);
      // We'll tag this block as needing space when it flushes — set a flag
      needsSpaceAbove = true;
    } else if (
      // Bold heading that starts a new factor/section — break out of callout blocks
      (currentType === "superpower" || currentType === "watchout" || currentType === "tip") &&
      line.match(/^\*\*[A-Z][\w\s&',-]+\*\*\s*$/)
    ) {
      flush();
      currentType = "markdown";
      currentBlock.push(line);
    } else if (line === "---") {
      flush();
      currentType = "markdown";
    } else {
      currentBlock.push(line);
    }
  }
  flush();

  const calloutStyles: Record<string, { bg: string; border: string; icon?: string; label?: string; labelColor?: string }> = {
    card: { bg: "bg-emerald-50", border: "border-emerald-200" },
    protocol: { bg: "bg-amber-50", border: "border-amber-200" },
    mitigation: { bg: "bg-blue-50", border: "border-blue-200" },
    superpower: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "⚡", label: "SUPER POWERS", labelColor: "text-emerald-700" },
    watchout: { bg: "bg-amber-50", border: "border-amber-200", icon: "⚠️", label: "WATCH OUTS", labelColor: "text-amber-700" },
    tip: { bg: "bg-blue-50", border: "border-blue-200", icon: "💡", label: "TIPS", labelColor: "text-blue-700" },
  };

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "markdown") {
          return (
            <div key={i} className={block.spaceAbove ? "mt-16" : ""}>
              <MarkdownBlock content={block.content} accent={accent} />
            </div>
          );
        }
        const style = calloutStyles[block.type];
        // Strip the ### heading from Super Power/Watch Out/Tip blocks (the label replaces it)
        const blockContent = style.label
          ? block.content.replace(/^###\s+.+\n?/, "").trim()
          : block.content;
        return (
          <div key={i} className={`${style.bg} ${style.border} border rounded-xl p-5 ${block.spaceAbove ? "mt-10 mb-4" : "my-4"}`}>
            {style.label && (
              <div className={`flex items-center gap-2 mb-3 ${style.labelColor} text-sm font-bold uppercase tracking-wide`}>
                <span>{style.icon}</span>
                {style.label}
              </div>
            )}
            <MarkdownBlock content={blockContent} accent={accent} />
          </div>
        );
      })}
    </>
  );
}

// ── Markdown Renderer ───────────────────────────────────────────────────────

function MarkdownBlock({ content, accent }: { content: string; accent: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold text-black mt-0 mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold text-black mt-8 mb-4 pb-2 border-b-2" style={{ borderColor: accent }}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-bold text-[#222] mt-5 mb-2">{children}</h3>
        ),
        p: ({ children }) => {
          // Strip orphan score patterns and fix missing space after colons
          const childArray = Array.isArray(children) ? children : [children];
          const cleaned = childArray.map(child => {
            if (typeof child === "string") {
              return child.replace(/\s*\(\d+\/100\)\s*/g, " ");
            }
            return child;
          });
          // Re-insert space between inline elements (e.g. after <strong>The risk:</strong>)
          const spaced = cleaned.flatMap((child, i) => {
            if (i > 0 && typeof child === "string" && !child.startsWith(" ") && typeof cleaned[i - 1] !== "string") {
              return [" ", child];
            }
            return [child];
          });
          return <p className="text-[#333] leading-relaxed mb-4 text-[15px]">{spaced}</p>;
        },
        strong: ({ children }) => {
          const text = String(children);
          const levelColor = LEVEL_COLORS[text];
          if (levelColor) {
            return <strong style={{ color: levelColor, fontWeight: 700 }}>{children}</strong>;
          }
          // Strip score patterns like "(91/100)" from bold text
          const cleaned = text.replace(/\s*\(\d+\/100\)\s*/g, "").trim();
          if (cleaned !== text) {
            return <strong className="font-bold text-[#111] block mt-8 text-lg">{cleaned}</strong>;
          }
          return <strong className="font-bold text-[#111]">{children}</strong>;
        },
        em: ({ children }) => <em className="text-[#666] not-italic">{children}</em>,
        hr: () => <hr className="my-6 border-[var(--beige-dark)]" />,
        ul: ({ children }) => (
          <ul className="list-disc list-outside ml-5 mb-4 space-y-1 text-[#333] text-[15px]">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-outside ml-5 mb-4 space-y-1 text-[#333] text-[15px]">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse border border-[#D5D0C6] rounded-lg overflow-hidden">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-[#222] text-white">{children}</thead>,
        th: ({ children }) => (
          <th className="px-3 py-2 text-left text-xs font-bold uppercase">{children}</th>
        ),
        td: ({ children }) => {
          const text = String(children);
          const levelColor = LEVEL_COLORS[text];
          return (
            <td className="px-3 py-2 border-b border-[#D5D0C6]" style={levelColor ? { color: levelColor, fontWeight: 700 } : undefined}>
              {children}
            </td>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ── Dimension Name Row + Expandable Explanation ─────────────────────────────

function DimensionRow({ element, gap, gapCol, open }: {
  element: typeof ELEMENTS[number];
  gap: number;
  gapCol: string;
  open: boolean;
}) {
  return (
    <div className="mt-1 flex items-center justify-center gap-2 w-full text-[11px]">
      <span className="text-[#999]">{element.name}</span>
      {gap > 15 && (
        <span className="font-bold" style={{ color: gapCol }}>differential: {gap}</span>
      )}
      <span className="flex items-center gap-1 text-[#bbb]">
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  );
}

// ── Clickable Dimension Element (bars + name + explainer) ───────────────────

function DimensionElement({ idx, dimKey, scoresA, scoresB, nameA, nameB }: {
  idx: number;
  dimKey: "personality" | "values" | "meta-thinking";
  scoresA: number[];
  scoresB: number[];
  nameA: string;
  nameB: string;
}) {
  const [open, setOpen] = useState(false);
  const el = ELEMENTS[idx];
  const a = scoresA[idx];
  const b = scoresB[idx];
  const gap = Math.abs(a - b);
  const color = scoreColor(dimKey, Math.max(a, b));
  const gapCol = gapColor(gap);
  const explanation = getComparisonExplanation(el, a, b, nameA, nameB);

  const toneStyles = {
    strength: { bg: "bg-emerald-50", border: "border-emerald-200", dot: "#22c55e" },
    complementary: { bg: "bg-blue-50", border: "border-blue-200", dot: "#3b82f6" },
    attention: { bg: "bg-amber-50", border: "border-amber-200", dot: "#f59e0b" },
    neutral: { bg: "bg-[#F9F8F6]", border: "border-[#E8E4DC]", dot: "#999" },
  };
  const style = toneStyles[explanation.tone];

  return (
    <div
      className="px-3 py-3 cursor-pointer hover:bg-[#FAFAF8] transition-colors"
      onClick={() => setOpen(!open)}
    >
      {/* Mirrored bar layout: A ← [icon] → B */}
      <div className="flex items-center gap-0">
        <span className="text-[11px] font-bold w-7 text-right shrink-0" style={{ color: scoreColor(dimKey, a) }}>{a}</span>
        <div className="flex-1 flex justify-end">
          <div className="w-full h-3 bg-[#F0ECE4] rounded-l-full overflow-hidden relative" style={{ direction: "rtl" }}>
            <div className="h-full rounded-l-full" style={{ width: `${a}%`, backgroundColor: scoreColor(dimKey, a) }} />
          </div>
        </div>
        <div className="shrink-0 mx-1.5">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: color }} title={el.name}>
            {el.code}
          </span>
        </div>
        <div className="flex-1">
          <div className="w-full h-3 bg-[#F0ECE4] rounded-r-full overflow-hidden relative">
            <div className="h-full rounded-r-full" style={{ width: `${b}%`, backgroundColor: scoreColor(dimKey, b) }} />
          </div>
        </div>
        <span className="text-[11px] font-bold w-7 text-left shrink-0" style={{ color: scoreColor(dimKey, b) }}>{b}</span>
      </div>

      <DimensionRow element={el} gap={gap} gapCol={gapCol} open={open} />

      {open && (
        <div className={`mt-2 ${style.bg} ${style.border} border rounded-lg px-4 py-3`}>
          <p className="text-[12px] font-semibold text-[#333] mb-1">{explanation.headline}</p>
          <p className="text-[13px] text-[#444] leading-relaxed">{explanation.body}</p>
        </div>
      )}
    </div>
  );
}

// ── Comparison Score Bars ────────────────────────────────────────────────────

function ComparisonScoreBars({ scoresA, scoresB, nameA, nameB }: {
  scoresA: number[];
  scoresB: number[];
  nameA: string;
  nameB: string;
}) {
  const dimensions = [
    {
      label: "Personality",
      description: "Biological bedrock — deeply embedded, remarkably stable",
      categories: [
        { label: "The Big 5", indices: [0, 1, 2, 3, 4] },
        { label: "The Dark Triad", indices: [5, 6, 7] },
        { label: "Emotional Regulation", indices: [8, 9, 10, 11] },
      ],
    },
    {
      label: "Values",
      description: "Beliefs animated by emotion — stable but culturally shaped",
      categories: [
        { label: "Moral Foundations", indices: [12, 13, 14, 15, 16] },
        { label: "Cooperative Virtues", indices: [17, 18, 19, 20, 21, 22, 23] },
        { label: "Personal Values", indices: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33] },
        { label: "Social Orientation", indices: [34, 35] },
      ],
    },
    {
      label: "Meta-Thinking",
      description: "How your mind works — where it rests, what it tends toward",
      categories: [
        { label: "Meta-Thinking", indices: [36, 37, 38, 39, 40, 41, 42, 43] },
        { label: "Primal World Beliefs", indices: [44, 45, 46, 47] },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Legend: names on left and right */}
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-[#888] px-2">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: "var(--primary)" }} />
          {nameA}
        </span>
        <span className="flex items-center gap-1.5">
          {nameB}
          <span className="w-3 h-3 rounded-full bg-[#888] inline-block" />
        </span>
      </div>

      {dimensions.map((dim) => {
        const dimKey = dim.label.toLowerCase().replace(" ", "-") as "personality" | "values" | "meta-thinking";
        return (
          <div key={dim.label}>
            <h3 className="text-lg font-bold text-[#222] mb-1">{dim.label}</h3>
            <p className="text-sm text-[#888] mb-4">{dim.description}</p>
            <div className="space-y-4">
              {dim.categories.map((cat) => (
                <div key={cat.label} className="bg-white rounded-xl border border-[#E8E4DC] overflow-hidden">
                  <div className="px-4 py-2 bg-[#F7F4EE] border-b border-[#E8E4DC]">
                    <span className="text-xs font-medium text-[#888] uppercase tracking-wide">{cat.label}</span>
                  </div>
                  <div className="divide-y divide-[#F0ECE4]">
                    {cat.indices.map((idx) => (
                      <DimensionElement key={idx} idx={idx} dimKey={dimKey} scoresA={scoresA} scoresB={scoresB} nameA={nameA} nameB={nameB} />
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

// ── Main Page Component ─────────────────────────────────────────────────────

export default function ComparisonReportPage() {
  const params = useParams();
  const reportId = params.reportId as string;
  const [report, setReport] = useState<ComparisonReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const [navScroll, setNavScroll] = useState({ left: false, right: true });

  // Auto-scroll nav so active button is visible
  useEffect(() => {
    if (!navRef.current) return;
    const activeBtn = navRef.current.querySelector("[data-active-nav]") as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeSection]);

  // Track nav scroll position for arrow indicators
  const updateNavScroll = () => {
    if (!navRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
    setNavScroll({
      left: scrollLeft > 5,
      right: scrollLeft + clientWidth < scrollWidth - 5,
    });
  };
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    updateNavScroll();
    el.addEventListener("scroll", updateNavScroll, { passive: true });
    window.addEventListener("resize", updateNavScroll);
    return () => {
      el.removeEventListener("scroll", updateNavScroll);
      window.removeEventListener("resize", updateNavScroll);
    };
  }, [report]);

  useEffect(() => {
    fetch(`/api/report/view?id=${reportId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setReport(data);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [reportId]);

  // Scroll spy for section navigation
  useEffect(() => {
    if (!report) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute("data-section-idx") || "0");
            setActiveSection(idx);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    const elements = document.querySelectorAll("[data-section-idx]");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [report]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>Loading your comparison report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center max-w-md">
          <p className="text-lg text-[var(--muted)] mb-4">{error}</p>
          <Link href="/compare" className="text-[var(--primary)] hover:underline">Back to Compare</Link>
        </div>
      </div>
    );
  }

  if (!report?.content) return null;

  const sections = parseSections(report.content);
  const hasScoreBars = report.scores_snapshot && report.comparison_scores_snapshot;

  // Extract partner names from the first section content
  const nameMatch = report.content.match(/\*\*(.+?) & (.+?)\*\*/);
  const nameA = nameMatch ? nameMatch[1] : "Partner A";
  const nameB = nameMatch ? nameMatch[2] : "Partner B";

  // Navigation items from sections with titles — substring match for AI-varied headings
  // Order matters: more specific matches should come first
  const sectionShortLabels: [string, string][] = [
    ["how to read", "How to Read"],
    // Couples and Friends report (v2 brief-based) — put before generic matches
    ["chemistry signature", "Chemistry"],
    ["friendship signature", "Signature"],
    ["where you overlap", "Overlap"],
    ["where you align", "Align"],
    ["where you diverge", "Diverge"],
    ["how you both think", "Thinking"],
    ["process the world", "Thinking"],
    ["what you both value", "Values"],
    ["value differently", "Values"],
    ["emotional rhythm", "Emotion"],
    ["handle emotion", "Emotion"],
    ["a note to each of you", "Notes"],
    ["where the friction lives", "Friction"],
    ["conflict and repair", "Repair"],
    ["repair and stay-close", "Repair"],
    ["big decisions compass", "Decisions"],
    ["drift and transitions", "Transitions"],
    ["growth edges", "Growth"],
    ["conversation prompts", "Prompts"],
    ["methodology and sources", "Sources"],
    // Co-founders
    ["compatibility score", "Compatibility"],
    ["know about", "Your Co-Founder"],
    ["success factor", "Success"],
    ["success", "Success"],
    ["co-founder", "Co-Founder"],
    ["under pressure", "Pressure"],
    ["mitigation", "Mitigations"],
    ["pitch", "Pitches"],
    ["48 dimension", "Comparison"],
    ["what now", "What Now?"],
    ["what comes next", "What Next?"],
    // Couples report (legacy)
    ["relationship success", "Relationship"],
    ["relationship playbook", "Playbook"],
    // Friends report
    ["friendship profile", "Profile"],
    ["where you click", "Click"],
    ["butt heads", "Friction"],
    ["conversation starter", "Starters"],
    ["conversation", "Conversations"],
    ["friend you need", "The Friend"],
  ];
  function getShortLabel(title: string): string {
    const lower = title.toLowerCase();
    for (const [substring, label] of sectionShortLabels) {
      if (lower.includes(substring)) return label;
    }
    return title;
  }
  const navItems = sections
    .map((s, i) => ({ ...s, idx: i }))
    .filter((s) => s.title)
    .map((s) => {
      return { label: getShortLabel(s.title), idx: s.idx, id: s.id };
    });

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              {report.relationship_type === "friends"
                ? "Friendship Comparison Report"
                : report.relationship_type === "couples"
                  ? "Couples Compatibility Report"
                  : "Co-Founder Compatibility Report"}
            </h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              {nameA} & {nameB} — 48 dimensions across Personality, Values, and Meta-Thinking
            </p>
          </div>
          <Link
            href="/compare"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Back to Compare
          </Link>
        </div>

        {/* Sticky section navigation */}
        {navItems.length > 0 && (
          <div className="sticky top-0 z-30 py-3 mb-6 -mx-4 px-4 border-b border-[var(--border)]" style={{ backgroundColor: "var(--background)" }}>
            <div className="relative">
              {/* Left arrow */}
              {navScroll.left && (
                <button
                  onClick={() => navRef.current?.scrollBy({ left: -120, behavior: "smooth" })}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center text-gray-400 active:text-gray-600"
                  style={{ background: "linear-gradient(to right, var(--background) 60%, transparent)" }}
                  aria-label="Scroll nav left"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
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
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              )}
              <div ref={navRef} className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {navItems.map((item) => (
                  <button
                    key={item.idx}
                    {...(activeSection === item.idx ? { "data-active-nav": true } : {})}
                    onClick={() => {
                      document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
            const isScoresSection = section.title.includes("All 48 Dimensions");

            // First section (title/intro) renders as centered card
            if (!section.title) {
              return (
                <div
                  key={section.id}
                  id={section.id}
                  data-section-idx={idx}
                  className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center"
                >
                  <MarkdownBlock content={section.body} accent="#6F00FF" />
                </div>
              );
            }

            // "How to Read" section
            if (section.title === "How to Read This Report") {
              return (
                <div
                  key={section.id}
                  id={section.id}
                  data-section-idx={idx}
                  className="rounded-2xl border border-[var(--border)] overflow-hidden"
                  style={{ backgroundColor: "#F9F8F6" }}
                >
                  <div className="px-6 sm:px-8 py-4 flex items-center gap-3" style={{ borderBottom: "3px solid #888" }}>
                    <span className="text-xl">📖</span>
                    <h2 className="text-lg font-bold text-[#222]" style={{ fontFamily: "var(--font-display)" }}>
                      {section.title}
                    </h2>
                  </div>
                  <div className="px-6 sm:px-8 py-6">
                    <CalloutAwareMarkdown content={section.body} accent="#888" sectionTitle={section.title} />
                  </div>
                </div>
              );
            }

            return (
              <div
                key={section.id}
                id={section.id}
                data-section-idx={idx}
                className="rounded-2xl border border-[var(--border)] overflow-hidden"
                style={{ backgroundColor: style.bg }}
              >
                {/* Card header with accent border */}
                <div
                  className="px-6 sm:px-8 py-4 flex items-center gap-3"
                  style={{ borderBottom: `3px solid ${style.accent}` }}
                >
                  <span className="text-xl">{style.icon}</span>
                  <h2 className="text-lg font-bold text-[#222]" style={{ fontFamily: "var(--font-display)" }}>
                    {section.title}
                  </h2>
                </div>

                {/* Card body */}
                <div className="px-6 sm:px-8 py-6">
                  {isScoresSection && hasScoreBars ? (
                    <ComparisonScoreBars
                      scoresA={report.scores_snapshot!}
                      scoresB={report.comparison_scores_snapshot!}
                      nameA={nameA}
                      nameB={nameB}
                    />
                  ) : (
                    <CalloutAwareMarkdown content={section.body} accent={style.accent} sectionTitle={section.title} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center pt-8 pb-8">
          <Link href="/compare" className="text-[var(--primary)] hover:underline text-sm">Back to Compare</Link>
        </div>
      </div>
    </div>
  );
}
