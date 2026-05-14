/**
 * One-off: diagnose why the J. Paul ↔ Turi Co-Founders comparison report
 * hasn't landed. Prints: users, invite, comparison_selection, report (if any),
 * and whether both parties have scores.
 *
 * Usage: npx tsx scripts/diagnose-turi-cofounders.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const envPath = resolve(__dirname, "../.env.local");
const envFile = readFileSync(envPath, "utf-8");
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const k = trimmed.slice(0, eq).trim();
  const v = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[k]) process.env[k] = v;
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  // Find J. Paul + Turi by email substring
  const { data: allProfiles } = await admin
    .from("profiles")
    .select("id, email, full_name");
  const jpaul = allProfiles?.find((p) =>
    (p.email ?? "").toLowerCase().includes("jpaul") ||
    (p.full_name ?? "").toLowerCase().includes("paul neeley"),
  );
  const turi = allProfiles?.find((p) =>
    (p.full_name ?? "").toLowerCase().includes("turi") ||
    (p.email ?? "").toLowerCase().includes("turi"),
  );

  console.log("J. Paul:", jpaul);
  console.log("Turi:   ", turi);
  if (!jpaul || !turi) return;

  // Invites in either direction
  const { data: invites } = await admin
    .from("invites")
    .select("*")
    .or(
      `and(from_user_id.eq.${jpaul.id},to_user_id.eq.${turi.id}),and(from_user_id.eq.${turi.id},to_user_id.eq.${jpaul.id})`,
    );
  console.log("\nInvites (", invites?.length, "):");
  for (const i of invites ?? []) {
    console.log(
      `  id=${i.id} from=${i.from_user_id === jpaul.id ? "JP" : "Turi"} status=${i.status} created=${i.created_at} comparison_report_id=${i.comparison_report_id}`,
    );
  }

  const inviteIds = (invites ?? []).map((i) => i.id);

  // Selections for those invites
  const { data: selections } = await admin
    .from("comparison_selections")
    .select("*")
    .in("invite_id", inviteIds);
  console.log("\nComparison selections (", selections?.length, "):");
  for (const s of selections ?? []) {
    console.log(
      `  id=${s.id} invite=${s.invite_id} type=${s.relationship_type} selected_by=${s.selected_by === jpaul.id ? "JP" : "Turi"} confirmed_by=${s.confirmed_by ? (s.confirmed_by === jpaul.id ? "JP" : "Turi") : "null"} report_id=${s.report_id} created=${s.created_at} confirmed_at=${s.confirmed_at}`,
    );
  }

  // Reports keyed off either of these selections
  const reportIds = (selections ?? [])
    .map((s) => s.report_id)
    .filter(Boolean) as string[];
  if (reportIds.length) {
    const { data: reports } = await admin
      .from("reports")
      .select("id, user_id, type, relationship_type, status, created_at, updated_at, error_message")
      .in("id", reportIds);
    console.log("\nReports (", reports?.length, "):");
    for (const r of reports ?? []) {
      console.log(
        `  id=${r.id} owner=${r.user_id === jpaul.id ? "JP" : "Turi"} type=${r.type} rel=${r.relationship_type} status=${r.status} created=${r.created_at} updated=${r.updated_at} error=${r.error_message}`,
      );
    }
  } else {
    console.log("\nNo report_id set on any selection.");
  }

  // Any comparison reports where both JP and Turi are participants
  const { data: compReports } = await admin
    .from("reports")
    .select("id, user_id, type, relationship_type, status, created_at, updated_at, error_message, partner_user_id")
    .eq("type", "comparison")
    .or(
      `and(user_id.eq.${jpaul.id},partner_user_id.eq.${turi.id}),and(user_id.eq.${turi.id},partner_user_id.eq.${jpaul.id})`,
    );
  console.log("\nAll comparison reports between JP+Turi (", compReports?.length, "):");
  for (const r of compReports ?? []) {
    console.log(
      `  id=${r.id} owner=${r.user_id === jpaul.id ? "JP" : "Turi"} partner=${r.partner_user_id === jpaul.id ? "JP" : "Turi"} rel=${r.relationship_type} status=${r.status} created=${r.created_at} updated=${r.updated_at} error=${r.error_message}`,
    );
  }

  // Scores
  const { data: scores } = await admin
    .from("user_scores")
    .select("user_id, updated_at")
    .in("user_id", [jpaul.id, turi.id]);
  console.log("\nUser scores:");
  for (const s of scores ?? []) {
    console.log(`  user=${s.user_id === jpaul.id ? "JP" : "Turi"} updated=${s.updated_at}`);
  }

  // Purchases
  const { data: purchases } = await admin
    .from("purchases")
    .select("user_id, type, status, created_at")
    .in("user_id", [jpaul.id, turi.id])
    .order("created_at", { ascending: false });
  console.log("\nPurchases:");
  for (const p of purchases ?? []) {
    console.log(`  user=${p.user_id === jpaul.id ? "JP" : "Turi"} type=${p.type} status=${p.status} created=${p.created_at}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
