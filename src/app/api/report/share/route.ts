import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Share Link Route — Dual Consent
 *
 * POST: Request to create a share link (initiator)
 * GET: View shared report (public)
 *
 * Both partners must approve before the share link goes live.
 * Either partner can revoke at any time.
 */

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reportId, action } = await request.json();

  if (!reportId) {
    return NextResponse.json({ error: "reportId required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch the report
  const { data: report } = await admin
    .from("reports")
    .select("id, user_id, comparison_user_id, share_token, share_approved_by")
    .eq("id", reportId)
    .eq("type", "comparison")
    .single();

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // Verify user is part of this report
  const isPartnerA = report.user_id === user.id;
  const isPartnerB = report.comparison_user_id === user.id;
  if (!isPartnerA && !isPartnerB) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Handle revocation
  if (action === "revoke") {
    await admin
      .from("reports")
      .update({
        share_token: null,
        share_approved_by: [],
      })
      .eq("id", reportId);

    return NextResponse.json({ status: "revoked" });
  }

  // Handle approval
  const currentApprovals: string[] = report.share_approved_by || [];
  if (!currentApprovals.includes(user.id)) {
    currentApprovals.push(user.id);
  }

  // Generate token if this is the first approval
  const shareToken = report.share_token || randomBytes(16).toString("hex");

  await admin
    .from("reports")
    .update({
      share_token: shareToken,
      share_approved_by: currentApprovals,
    })
    .eq("id", reportId);

  // Check if both have approved
  const bothApproved =
    currentApprovals.includes(report.user_id) &&
    currentApprovals.includes(report.comparison_user_id!);

  if (bothApproved) {
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}`;
    return NextResponse.json({ status: "active", shareUrl });
  }

  return NextResponse.json({
    status: "waiting_for_partner",
    message: "Your partner needs to approve sharing too.",
  });
}
