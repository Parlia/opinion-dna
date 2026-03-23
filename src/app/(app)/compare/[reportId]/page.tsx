"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/client";

/**
 * Co-Founder Comparison Report Page
 *
 * Emotional arc through tinted sections:
 *   Green (alignment) -> Amber (friction) -> Purple (blind spots) -> Warm (empowerment)
 *
 * Score display: large number (72px Fraunces) + contextual label
 * Score bars: overlapping with gap highlighted in green->amber->red gradient
 */

interface ComparisonReport {
  id: string;
  content: string | null;
  status: string;
  scores_snapshot: number[] | null;
  comparison_scores_snapshot: number[] | null;
  comparison_user_id: string | null;
}

// Section styles for emotional arc
const SECTION_STYLES: Record<string, { accent: string; bg: string }> = {
  "Compatibility Score": { accent: "#6F00FF", bg: "#FAF8FF" },
  "Where You Align": { accent: "#1a7a3a", bg: "#F0FAF3" },
  "Where You'll Navigate": { accent: "#B8860B", bg: "#FFF9EE" },
  "Blind Spots": { accent: "#6F00FF", bg: "#FAF5FF" },
  "Stress Tendencies": { accent: "#555", bg: "#F9F8F6" },
  "Behavioral Patterns": { accent: "#555", bg: "#F9F8F6" },
  "Conversation Cards": { accent: "#00A86B", bg: "#F4FBF7" },
  "Mitigation Playbook": { accent: "#0066CC", bg: "#F0F7FF" },
  "All 48 Dimensions": { accent: "#555", bg: "#F9F8F6" },
  "What Now": { accent: "#6F00FF", bg: "#FAF8FF" },
};

function getSectionStyle(title: string) {
  for (const [key, style] of Object.entries(SECTION_STYLES)) {
    if (title.includes(key)) return style;
  }
  return { accent: "#6F00FF", bg: "#FFFFFF" };
}

export default function ComparisonReportPage() {
  const params = useParams();
  const reportId = params.reportId as string;
  const [report, setReport] = useState<ComparisonReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("Please sign in to view this report.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("reports")
        .select("id, user_id, content, status, scores_snapshot, comparison_scores_snapshot, comparison_user_id")
        .eq("id", reportId)
        .eq("type", "comparison")
        .single();

      if (fetchError || !data) {
        setError("Report not found.");
        setLoading(false);
        return;
      }

      // Verify user is part of this report
      if (data.user_id !== user.id && data.comparison_user_id !== user.id) {
        setError("You don't have access to this report.");
        setLoading(false);
        return;
      }

      setReport(data as ComparisonReport);
      setLoading(false);
    }

    fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <div className="w-24 h-24 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin mx-auto mb-6" />
          <p className="text-lg" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            Loading your comparison report...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center max-w-md">
          <p className="text-lg text-[var(--muted)] mb-6">{error}</p>
          <Link href="/dashboard" className="text-[var(--primary)] hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!report) return null;

  if (report.status === "generating") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Generating your comparison report
          </h2>
          <p className="text-[var(--muted)]">
            We're analyzing 96 data points across 48 dimensions for both partners. This takes about a minute.
          </p>
        </div>
      </div>
    );
  }

  if (report.status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center max-w-md">
          <p className="text-lg text-[var(--muted)] mb-4">
            Something went wrong generating your report. We're looking into it.
          </p>
          <Link href="/dashboard" className="text-[var(--primary)] hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!report.content) return null;

  // Split content into sections by "---" dividers and ## headings
  const sections = report.content.split(/^---$/m).map(s => s.trim()).filter(Boolean);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {sections.map((section, i) => {
        // Detect section heading for styling
        const headingMatch = section.match(/^#{1,3}\s+(.+)$/m);
        const heading = headingMatch ? headingMatch[1] : "";
        const style = getSectionStyle(heading);

        return (
          <div
            key={i}
            className="animate-in"
            style={{ backgroundColor: style.bg }}
          >
            <div className="max-w-4xl mx-auto px-6 py-16">
              <div className="prose prose-lg max-w-none" style={{ "--tw-prose-headings": style.accent } as React.CSSProperties}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: style.accent }}>
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-3xl md:text-4xl font-bold mt-0 mb-4" style={{ fontFamily: "var(--font-display)", color: style.accent }}>
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl md:text-2xl font-semibold mt-8 mb-3" style={{ fontFamily: "var(--font-display)", color: style.accent }}>
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-base leading-relaxed mb-4" style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold" style={{ color: "var(--foreground)" }}>
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em style={{ color: "var(--muted)" }}>{children}</em>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-6">
                        <table className="w-full text-sm border-collapse">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead style={{ backgroundColor: "var(--beige-light)" }}>
                        {children}
                      </thead>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-2 text-left font-semibold border-b" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2 border-b" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                        {children}
                      </td>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: "var(--foreground)" }}>
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="text-base leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                        {children}
                      </li>
                    ),
                  }}
                >
                  {section}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        );
      })}

      {/* Back to dashboard */}
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <Link
          href="/dashboard"
          className="text-[var(--primary)] hover:underline text-sm"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
