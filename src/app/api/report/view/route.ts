import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/report/view?id=<reportId>
 *
 * Fetches a comparison report using admin client (bypasses RLS),
 * but verifies the requesting user is part of the report.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const reportId = url.searchParams.get("id");

  if (!reportId) {
    return NextResponse.json({ error: "Report ID required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: report, error } = await admin
    .from("reports")
    .select("id, user_id, content, status, scores_snapshot, comparison_scores_snapshot, comparison_user_id")
    .eq("id", reportId)
    .single();

  if (error || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // Verify user is part of this report
  if (report.user_id !== user.id && report.comparison_user_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  return NextResponse.json(report);
}
