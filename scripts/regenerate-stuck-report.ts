/**
 * Recover a stuck comparison report by regenerating it from scratch outside
 * the Vercel lambda timeout.
 *
 * Two modes:
 *   npx tsx scripts/regenerate-stuck-report.ts --invite <id> --type <type>
 *   npx tsx scripts/regenerate-stuck-report.ts --all-stuck
 *
 * --all-stuck sweeps every selection that has confirmed_by but no report_id
 * and was confirmed more than 5 minutes ago (the stale window). Useful if
 * this isn't the only failed report.
 *
 * Works by importing the same generateComparisonReport() the HTTP route uses,
 * so logic stays in one place.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load env BEFORE importing the generation lib — scorecard.ts instantiates
// Resend at module-load time and throws if RESEND_API_KEY is missing.
const envPath = resolve(__dirname, "../.env.local");
const envFile = readFileSync(envPath, "utf-8");
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[key]) process.env[key] = value;
}

// Deferred imports keep the env-load above from being hoisted past them.
import { createClient } from "@supabase/supabase-js";
type ReportRelationshipType = "cofounders" | "couples" | "friends";
type GenerateFn = typeof import("../src/lib/report/generate-comparison").generateComparisonReport;
let generateComparisonReport!: GenerateFn;
let STALE_GENERATING_MS!: number;

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function parseArgs(): {
  inviteId?: string;
  type?: ReportRelationshipType;
  allStuck: boolean;
} {
  const args = process.argv.slice(2);
  let inviteId: string | undefined;
  let type: ReportRelationshipType | undefined;
  let allStuck = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--invite") inviteId = args[++i];
    else if (args[i] === "--type") type = args[++i] as ReportRelationshipType;
    else if (args[i] === "--all-stuck") allStuck = true;
  }
  return { inviteId, type, allStuck };
}

async function findStuck(): Promise<
  Array<{ inviteId: string; relationshipType: ReportRelationshipType; selectionId: string; confirmedAt: string }>
> {
  const cutoff = new Date(Date.now() - STALE_GENERATING_MS).toISOString();
  const { data } = await admin
    .from("comparison_selections")
    .select("id, invite_id, relationship_type, confirmed_at, confirmed_by, report_id")
    .not("confirmed_by", "is", null)
    .is("report_id", null)
    .lt("confirmed_at", cutoff);
  return (data ?? []).map((s) => ({
    inviteId: s.invite_id,
    relationshipType: s.relationship_type as ReportRelationshipType,
    selectionId: s.id,
    confirmedAt: s.confirmed_at,
  }));
}

async function regenerate(
  inviteId: string,
  relationshipType: ReportRelationshipType,
): Promise<void> {
  console.log(`\n→ Generating ${relationshipType} report for invite ${inviteId}...`);
  const started = Date.now();
  try {
    const result = await generateComparisonReport(admin, { inviteId, relationshipType });
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    console.log(
      `  ✓ ${result.status} in ${seconds}s — reportId=${result.reportId} score=${result.score}`,
    );
  } catch (err) {
    console.error(`  ✗ Failed:`, err);
    throw err;
  }
}

async function main() {
  const mod = await import("../src/lib/report/generate-comparison");
  generateComparisonReport = mod.generateComparisonReport;
  STALE_GENERATING_MS = mod.STALE_GENERATING_MS;

  const { inviteId, type, allStuck } = parseArgs();

  if (allStuck) {
    const stuck = await findStuck();
    console.log(`Found ${stuck.length} stuck selection(s).`);
    for (const s of stuck) {
      console.log(`  - invite=${s.inviteId} type=${s.relationshipType} confirmed=${s.confirmedAt}`);
    }
    for (const s of stuck) {
      await regenerate(s.inviteId, s.relationshipType);
    }
    return;
  }

  if (!inviteId || !type) {
    console.error("Usage: --invite <id> --type <couples|cofounders|friends>   OR   --all-stuck");
    process.exit(1);
  }

  await regenerate(inviteId, type);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
