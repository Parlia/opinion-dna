import { createClient } from "@/lib/supabase/server";

/**
 * Whether the given user has any completed purchase.
 *
 * Uses the caller's session-scoped client — every caller checks the
 * *authenticated user's own* purchases, which the purchases RLS SELECT
 * policy (auth.uid() = user_id) covers. No service role needed; fails
 * closed on query errors.
 */
export async function hasPurchase(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .limit(1);

  if (error) {
    console.error("hasPurchase query failed:", error.message);
    return false;
  }
  return !!data && data.length > 0;
}
