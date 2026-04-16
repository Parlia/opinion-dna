/**
 * Seed a "joined" invite for testing the compare page flow.
 *
 * Usage:
 *   npx tsx scripts/seed-joined-invite.ts
 *
 * Creates an accepted invite from the test user (jpaulneeley+test@gmail.com)
 * to a fake partner, simulating someone who has joined but may not have
 * completed their assessment yet.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Manual .env.local parsing
const envPath = resolve(__dirname, "../.env.local");
try {
  const envFile = readFileSync(envPath, "utf-8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
} catch { /* .env.local not found */ }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey);

async function main() {
  // Find the test user
  const { data: users } = await admin.auth.admin.listUsers({ perPage: 50 });
  const testUser = users?.users?.find(u => u.email === "jpaulneeley+test@gmail.com");
  const partnerUser = users?.users?.find(u => u.email === "jpaulneeley+test3@gmail.com");

  if (!testUser) {
    console.error("Test user jpaulneeley+test@gmail.com not found");
    process.exit(1);
  }

  if (!partnerUser) {
    console.error("Partner user jpaulneeley+test3@gmail.com not found");
    console.log("Available users:", users?.users?.map(u => u.email).join(", "));
    process.exit(1);
  }

  console.log(`Inviter: ${testUser.email} (${testUser.id})`);
  console.log(`Invitee: ${partnerUser.email} (${partnerUser.id})`);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { data: invite, error } = await admin
    .from("invites")
    .insert({
      from_user_id: testUser.id,
      to_email: partnerUser.email,
      to_user_id: partnerUser.id,
      token: "test-joined-" + Date.now(),
      type: "personal",
      status: "accepted",
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create invite:", error.message);
    process.exit(1);
  }

  console.log(`\nJoined invite created! ID: ${invite.id}`);
  console.log("Refresh /compare to see it in the Joined section.");
}

main().catch(console.error);
