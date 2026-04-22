import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateComparisonReport } from "@/lib/report/generate-comparison";
import type { ReportRelationshipType } from "@/lib/email/scorecard";
import { rateLimit } from "@/lib/auth/rate-limit";

// 800s ceiling requires Fluid Compute to be enabled in the Vercel project
// settings. Opus 4.7 cofounders generation takes ~260-340s per run, so this
// gives us ~2x headroom before the lambda is killed.
export const maxDuration = 800;
export const dynamic = "force-dynamic";

const VALID_TYPES: ReportRelationshipType[] = ["cofounders", "couples", "friends"];

/**
 * Comparison Report Generation
 *
 * Thin HTTP wrapper around generateComparisonReport(). The actual work —
 * fetching scores, LLM calls, assembly, persistence, emails — lives in
 * src/lib/report/generate-comparison.ts so the rescue script can share it
 * when a lambda timeout leaves a report stuck.
 *
 * Responsibilities kept here:
 *   - auth + rate limit
 *   - validate inviteId/type
 *   - ownership + consent checks
 *   - idempotency short-circuit (if a report already exists on the selection)
 *   - surface the generation failure cleanly
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(`compare:${user.id}`, { limit: 3, windowMs: 3600_000 });
  if (limited) return limited;

  const { inviteId, relationshipType, selectionId } = await request.json();
  if (!inviteId) {
    return NextResponse.json({ error: "inviteId required" }, { status: 400 });
  }
  const relType: ReportRelationshipType = VALID_TYPES.includes(relationshipType)
    ? relationshipType
    : "cofounders";

  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("invites")
    .select("id, from_user_id, to_user_id, status")
    .eq("id", inviteId)
    .eq("status", "accepted")
    .single();

  if (!invite) {
    return NextResponse.json({ error: "Invite not found or not accepted" }, { status: 404 });
  }

  if (invite.from_user_id !== user.id && invite.to_user_id !== user.id) {
    return NextResponse.json({ error: "Not authorized for this invite" }, { status: 403 });
  }

  const { data: selection } = await admin
    .from("comparison_selections")
    .select("id, report_id, confirmed_by")
    .eq("invite_id", inviteId)
    .eq("relationship_type", relType)
    .single();

  if (selection?.report_id) {
    return NextResponse.json({
      reportId: selection.report_id,
      status: "already_exists",
    });
  }

  if (selection && !selection.confirmed_by) {
    return NextResponse.json(
      { error: "Both partners must confirm before report generation" },
      { status: 400 },
    );
  }

  try {
    const result = await generateComparisonReport(admin, {
      inviteId,
      relationshipType: relType,
      selectionId: selectionId ?? selection?.id,
    });
    return NextResponse.json({
      reportId: result.reportId,
      status: result.status,
      score: result.score,
    });
  } catch (error) {
    console.error("Comparison report generation failed:", error);
    return NextResponse.json(
      {
        status: "failed",
        error: error instanceof Error ? error.message : "Generation failed",
      },
      { status: 500 },
    );
  }
}
