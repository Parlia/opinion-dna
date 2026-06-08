import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/auth/admin";
import { fetchAdminRaw, buildMetrics } from "@/lib/admin/metrics";

export const dynamic = "force-dynamic";

/**
 * Machine-readable admin scorecard. Same auth as /admin (admin email only).
 * Returns the exact `AdminMetrics` snapshot the page embeds, so an automated
 * agent can read the business scorecard without scraping rendered HTML.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The admin gate IS the security boundary (not just a hidden UI).
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = createAdminClient();
  const raw = await fetchAdminRaw(admin);
  const metrics = buildMetrics(raw, new Date());

  return NextResponse.json(metrics, {
    headers: { "Cache-Control": "no-store" },
  });
}
