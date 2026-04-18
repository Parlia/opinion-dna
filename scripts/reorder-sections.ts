/**
 * One-off: reorder sections in seeded example reports so that
 * "All 48 Dimensions Compared" appears BEFORE "What Now?" and
 * "Methodology and Sources" (was previously after).
 *
 * Works by text manipulation on the existing markdown content — no Claude calls.
 *
 * Usage: npx tsx scripts/reorder-sections.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const envPath = resolve(__dirname, "../.env.local");
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

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function reorderContent(content: string): string {
  const regex = /---\n\n## (What Now\?|Methodology and Sources|All 48 Dimensions Compared)\n[\s\S]*?(?=---\n\n## |---\n\n\*opiniondna\.com\*|$)/g;
  const found: Record<string, string> = {};
  let m;
  while ((m = regex.exec(content)) !== null) { found[m[1]] = m[0]; }
  if (!found["What Now?"] || !found["Methodology and Sources"] || !found["All 48 Dimensions Compared"]) {
    console.log("  Missing sections — have:", Object.keys(found).join(", "));
    return content;
  }
  let cleaned = content;
  for (const name of ["What Now?", "Methodology and Sources", "All 48 Dimensions Compared"]) {
    cleaned = cleaned.replace(found[name], "");
  }
  const newBlock = found["All 48 Dimensions Compared"] + found["What Now?"] + found["Methodology and Sources"];
  const footerMarker = "---\n\n*opiniondna.com*";
  const footerIdx = cleaned.indexOf(footerMarker);
  if (footerIdx >= 0) return cleaned.slice(0, footerIdx) + newBlock + cleaned.slice(footerIdx);
  return cleaned.trimEnd() + "\n\n" + newBlock;
}

async function main() {
  for (const id of ["763673f5-6d6b-47d1-aeff-92c8d87758d6", "324db937-e23e-4a45-a892-ff580d6b1bc6"]) {
    const { data } = await admin.from("reports").select("id, relationship_type, content").eq("id", id).single();
    if (!data) continue;
    const newContent = reorderContent(data.content);
    if (newContent === data.content) {
      console.log(`${data.relationship_type} ${id}: no change`);
      continue;
    }
    await admin.from("reports").update({ content: newContent }).eq("id", id);
    const h2s = newContent.match(/^##\s.+$/gm) || [];
    console.log(`${data.relationship_type} ${id}: REORDERED`);
    console.log(`  last 3: ${h2s.slice(-3).join(" | ")}`);
  }
}

main();
