#!/usr/bin/env node
/**
 * Writes src/data/seo/lastmod.json: route → ISO date of that page's last real
 * content change, read from git. src/app/sitemap.ts uses it for <lastmod>.
 *
 * Run before committing any change to page content or templates:
 *   npm run seo:lastmod
 *
 * How dates are derived:
 * - Data-driven pages (/tests, /alternatives, /vs, /for, /dimensions): the
 *   newest `git blame` committer time across the lines of that page's own
 *   entry in its data file, or its template (src/app/<section>/[slug]/page.tsx),
 *   whichever is newer. Editing one entry only moves that page's date.
 * - Pages in their own file (src/data/seo/pages/*.ts): the whole file.
 * - Static pages and hubs: newest commit touching the listed source paths.
 * Uncommitted or untracked changes count as "now", so run it right before
 * the commit that ships them.
 *
 * Runs locally only: Vercel builds from a shallow clone, where git history
 * (and so these dates) would be wrong. The committed JSON is the source.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "src/data/seo/lastmod.json");
const NOW = Math.floor(Date.now() / 1000);

const git = (...args) =>
  execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  });

function isTracked(rel) {
  try {
    git("ls-files", "--error-unmatch", "--", rel);
    return true;
  } catch {
    return false;
  }
}

/** Per-line committer times for a file (working tree; uncommitted = now). */
const blameCache = new Map();
function lineTimes(rel) {
  if (blameCache.has(rel)) return blameCache.get(rel);
  const lineCount = fs.readFileSync(path.join(ROOT, rel), "utf8").split("\n").length;
  let times;
  if (!isTracked(rel)) {
    times = new Array(lineCount).fill(NOW);
  } else {
    times = new Array(lineCount).fill(0);
    const out = git("blame", "--line-porcelain", "--", rel).split("\n");
    let cur = 0;
    let lineNo = 0;
    for (const l of out) {
      const header = l.match(/^[0-9a-f]{40} \d+ (\d+)/);
      if (header) lineNo = Number(header[1]);
      else if (l.startsWith("committer-time ")) cur = Number(l.slice(15));
      else if (l.startsWith("\t")) times[lineNo - 1] = cur;
    }
  }
  blameCache.set(rel, times);
  return times;
}

const maxTime = (rel, from = 0, to = Infinity) => {
  const t = lineTimes(rel);
  let m = 0;
  for (let i = from; i < Math.min(to, t.length); i++) if (t[i] > m) m = t[i];
  return m;
};

/** Newest commit (or now, if dirty/untracked) touching any of the paths. */
function pathsTime(rels) {
  const dirty = git("status", "--porcelain", "--", ...rels).trim();
  if (dirty) return NOW;
  const iso = git("log", "-1", "--format=%ct", "--", ...rels).trim();
  return iso ? Number(iso) : 0;
}

/**
 * Entries in a data file, located by their `slug: "..."` line. An entry spans
 * from the line before its slug (the opening brace) to the line before the
 * next entry's opening brace, or the end of its array.
 */
function entriesIn(rel) {
  const lines = fs.readFileSync(path.join(ROOT, rel), "utf8").split("\n");
  const slugLines = [];
  lines.forEach((l, i) => {
    const m = l.match(/^\s*slug: "([^"]+)"/);
    if (m) slugLines.push([m[1], i]);
  });
  return slugLines.map(([slug, i], k) => {
    const start = Math.max(0, i - 1);
    let end = k + 1 < slugLines.length ? slugLines[k + 1][1] - 1 : lines.length;
    for (let j = i; j < end; j++) {
      if (/^\];/.test(lines[j])) {
        end = j;
        break;
      }
    }
    return { slug, time: maxTime(rel, start, end) };
  });
}

const result = {};
const put = (route, t) => {
  result[route] = Math.max(result[route] ?? 0, t);
};

// Data-driven sections: [route prefix, template, data files]
const SECTIONS = [
  ["/tests", "src/app/tests/[slug]/page.tsx", ["src/data/seo/keywords.ts"]],
  ["/alternatives", "src/app/alternatives/[slug]/page.tsx", ["src/data/seo/competitors.ts"]],
  ["/vs", "src/app/vs/[slug]/page.tsx", ["src/data/seo/competitors.ts"]],
  ["/for", "src/app/for/[slug]/page.tsx", ["src/data/seo/use-cases.ts"]],
  [
    "/dimensions",
    "src/app/dimensions/[slug]/page.tsx",
    [
      "src/data/seo/dimensions-personality.ts",
      "src/data/seo/dimensions-values-1.ts",
      "src/data/seo/dimensions-values-2.ts",
      "src/data/seo/dimensions-meta.ts",
    ],
  ],
];

// competitors.ts holds both /vs and /alternatives entries; their slugs tell
// them apart (the seo-content test checks every sitemap URL has a date).
const ALT_SLUG = /-alternatives$/;
const VS_SLUG = /^opinion-dna-vs-/;

for (const [prefix, template, files] of SECTIONS) {
  const tplTime = pathsTime([template]);
  for (const f of files) {
    for (const { slug, time } of entriesIn(f)) {
      if (f.endsWith("competitors.ts")) {
        if (prefix === "/alternatives" && !ALT_SLUG.test(slug)) continue;
        if (prefix === "/vs" && !VS_SLUG.test(slug)) continue;
      }
      put(`${prefix}/${slug}`, Math.max(time, tplTime));
    }
  }
}

// One-page-per-file entries (src/data/seo/pages/<section>-<name>.ts).
const PAGES_DIR = "src/data/seo/pages";
const PAGE_PREFIX = { tests: "/tests", alternatives: "/alternatives", vs: "/vs", for: "/for" };
for (const file of fs.readdirSync(path.join(ROOT, PAGES_DIR))) {
  if (!file.endsWith(".ts")) continue;
  const rel = `${PAGES_DIR}/${file}`;
  const section = file.split("-")[0];
  const prefix = PAGE_PREFIX[section];
  if (!prefix) continue;
  const [{ slug }] = entriesIn(rel);
  const tpl = SECTIONS.find(([p]) => p === prefix)[1];
  put(`${prefix}/${slug}`, Math.max(maxTime(rel), pathsTime([tpl])));
}

// Static pages and hubs: route → source paths.
const STATIC = {
  "/": ["src/app/page.tsx", "src/components/landing"],
  "/personal-assessment": ["src/app/personal-assessment"],
  "/couples": ["src/app/couples"],
  "/co-founders": ["src/app/co-founders"],
  "/teams": ["src/app/teams"],
  "/friends": ["src/app/friends"],
  "/book": ["src/app/book"],
  "/referrals": ["src/app/referrals"],
  "/privacy": ["src/app/privacy"],
  "/terms": ["src/app/terms"],
  "/methodology": ["src/app/methodology"],
  "/tests": ["src/app/tests/page.tsx", "src/data/seo/keywords.ts", PAGES_DIR],
  "/alternatives": ["src/app/alternatives/page.tsx", "src/data/seo/competitors.ts", PAGES_DIR],
  "/vs": ["src/app/vs/page.tsx", "src/data/seo/competitors.ts", PAGES_DIR],
  "/for": ["src/app/for/page.tsx", "src/data/seo/use-cases.ts"],
  "/dimensions": [
    "src/app/dimensions/page.tsx",
    "src/data/seo/dimensions-personality.ts",
    "src/data/seo/dimensions-values-1.ts",
    "src/data/seo/dimensions-values-2.ts",
    "src/data/seo/dimensions-meta.ts",
  ],
};
for (const [route, rels] of Object.entries(STATIC)) put(route, pathsTime(rels));

const sorted = Object.fromEntries(
  Object.entries(result)
    .filter(([, t]) => t > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([route, t]) => [route, new Date(t * 1000).toISOString()])
);
fs.writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
console.log(`Wrote ${Object.keys(sorted).length} routes to ${path.relative(ROOT, OUT)}`);
