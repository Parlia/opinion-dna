import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildCoverSection,
  buildPart1Tables,
  buildPartialSystemPrompt,
  buildPartialUserPrompt,
  type ReportSection,
} from "@/lib/report/prompt";
import { PARLIA_AVERAGES } from "@/lib/scoring/elements";
import { hasPurchase } from "@/lib/auth/require-purchase";
import { rateLimit } from "@/lib/auth/rate-limit";
import { streamClaude } from "@/lib/report/claude-stream";

// 800s ceiling requires Fluid Compute to be enabled in the Vercel project
// settings. Personal-report generation runs multiple Claude calls back-to-back;
// under load the tail can brush past 300s, so this prevents truncation.
export const maxDuration = 800;
export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(`report:${user.id}`, { limit: 3, windowMs: 3600_000 });
  if (limited) return limited;

  if (!(await hasPurchase(user.id))) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  const { data: userScores } = await supabase
    .from("user_scores")
    .select("scores")
    .eq("user_id", user.id)
    .single();

  if (!userScores) {
    return NextResponse.json({ error: "No scores found" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: report } = await admin
    .from("reports")
    .insert({
      user_id: user.id,
      type: "personal",
      status: "generating",
      scores_snapshot: userScores.scores,
    })
    .select("id")
    .single();

  if (!report) {
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }

  try {
    const userName = user.user_metadata?.full_name || "the individual";
    const apiKey = process.env.ANTHROPIC_API_KEY!;

    // Split the ~7,000-10,000 word report across 3 parallel Opus calls along
    // natural section boundaries. This keeps Opus quality while fitting in
    // the 300s Vercel function timeout — each call is ~2,000-3,500 words and
    // they run concurrently, so total wall time is max(call_durations).
    const groups: ReportSection[][] = [
      ["P2", "P3"], // Life & Happiness + Relationships
      ["P4", "P5"], // Career + Cognitive Signature
      ["P6"],       // 48 Elements Explained (the longest single section)
    ];

    const pieces = await Promise.all(
      groups.map((parts) =>
        streamClaude(
          apiKey,
          buildPartialSystemPrompt(parts),
          buildPartialUserPrompt(userName, userScores.scores, PARLIA_AVERAGES, 1500, parts),
        ),
      ),
    );

    // Concatenate with "---" dividers between groups (divider between parts
    // within a group is already in Claude's output per the prompt).
    const aiContent = pieces.map((p) => p.trim()).join("\n\n---\n\n");

    // Prepend static cover page + Part 1 (code-generated, not AI-generated)
    const coverSection = buildCoverSection(userName);
    const part1Section = buildPart1Tables(userScores.scores, PARLIA_AVERAGES);

    // Append static closing section
    const whatNow = `

---

## What Now?

This report is a snapshot. The elements it describes are stable, but how you respond to them can change.

Three things worth doing with this information:

**Sit with what surprised you.** The elements that feel wrong or uncomfortable are often the most revealing. Resistance to a score is itself data about how your mind works.

**Share it with someone who knows you well.** A partner, a close friend, a colleague. Their reaction to your profile will tell you something the numbers can't: how the person you think you are compares to the person others experience.

**Come back to it.** Not to retake the assessment (your scores won't change much), but to reread the insights after a few weeks. The things that seemed obvious now may land differently when you're in the middle of a difficult conversation, a career decision, or a moment of friction with someone you love.

Your Opinion DNA is yours. It's the map to your mental territory. The more fluently you can read it, the better you'll navigate everything that matters.

---

*The Opinion DNA was designed in consultation with academic psychologists and behavioral scientists from the universities of Royal Holloway, Oxford, Cambridge, University of Pennsylvania, City University, and NYU.*

*opiniondna.com*`;

    const content = coverSection + "\n\n---\n\n" + part1Section + "\n\n---\n\n" + aiContent + whatNow;

    await admin
      .from("reports")
      .update({
        content,
        status: "completed",
      })
      .eq("id", report.id);

    return NextResponse.json({ reportId: report.id, status: "completed" });
  } catch (error) {
    console.error("Report generation failed:", error);
    await admin
      .from("reports")
      .update({ status: "failed" })
      .eq("id", report.id);

    return NextResponse.json({ reportId: report.id, status: "failed" }, { status: 500 });
  }
}
