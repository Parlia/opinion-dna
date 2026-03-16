import { createAdminClient } from "@/lib/supabase/admin";

export async function hasPurchase(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .limit(1);

  return !!data && data.length > 0;
}
