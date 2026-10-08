import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { keywordPages } from "./keywords";
import { alternativePages, competitors, headToHeadPages } from "./competitors";
import { useCases } from "./use-cases";
import { dimensionPages } from "./dimensions";
import sitemap from "@/app/sitemap";

// Guards for the data-driven SEO pages: every inline link resolves to a real
// route, every dimension slug exists, titles fit, and new copy follows the
// house rules. Run: npx vitest run src/data/seo

const STATIC_ROUTES = [
  "/",
  "/personal-assessment",
  "/couples",
  "/co-founders",
  "/teams",
  "/friends",
  "/book",
  "/referrals",
  "/methodology",
  "/dimensions",
  "/tests",
  "/vs",
  "/alternatives",
  "/for",
  "/privacy",
  "/terms",
  "/signup",
  "/login",
];

const ROUTES = new Set<string>([
  ...STATIC_ROUTES,
  ...keywordPages.map((p) => `/tests/${p.slug}`),
  ...alternativePages.map((p) => `/alternatives/${p.slug}`),
  ...competitors.map((c) => `/vs/${c.slug}`),
  ...headToHeadPages.map((h) => `/vs/${h.slug}`),
  ...useCases.map((u) => `/for/${u.slug}`),
  ...dimensionPages.map((d) => `/dimensions/${d.slug}`),
]);
const DIMENSION_SLUGS = new Set(dimensionPages.map((d) => d.slug));

const LINK_RE = /\[([^\]]+)\]\(([^)]*)\)/g;

/** Every string anywhere inside a value, with a path for error messages. */
function strings(value: unknown, at: string, out: [string, string][] = []) {
  if (typeof value === "string") out.push([at, value]);
  else if (Array.isArray(value)) value.forEach((v, i) => strings(v, `${at}[${i}]`, out));
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) strings(v, `${at}.${k}`, out);
  return out;
}

const ALL_PAGES: [string, unknown][] = [
  ...keywordPages.map((p): [string, unknown] => [`/tests/${p.slug}`, p]),
  ...alternativePages.map((p): [string, unknown] => [`/alternatives/${p.slug}`, p]),
  ...competitors.map((p): [string, unknown] => [`/vs/${p.slug}`, p]),
  ...headToHeadPages.map((p): [string, unknown] => [`/vs/${p.slug}`, p]),
  ...useCases.map((p): [string, unknown] => [`/for/${p.slug}`, p]),
];

describe("SEO content links", () => {
  it("every inline link points at a real route or an https URL", () => {
    const bad: string[] = [];
    for (const [route, page] of ALL_PAGES) {
      for (const [at, text] of strings(page, route)) {
        for (const m of text.matchAll(LINK_RE)) {
          const href = m[2];
          if (href.startsWith("https://")) continue;
          const pathOnly = href.split("#")[0];
          if (!ROUTES.has(pathOnly)) bad.push(`${at}: ${href}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it("relatedDimensions only uses real dimension slugs", () => {
    const bad: string[] = [];
    for (const [route, page] of ALL_PAGES) {
      const rel = (page as { relatedDimensions?: string[] }).relatedDimensions ?? [];
      for (const s of rel) if (!DIMENSION_SLUGS.has(s)) bad.push(`${route}: ${s}`);
    }
    for (const d of dimensionPages)
      for (const s of d.related) if (!DIMENSION_SLUGS.has(s)) bad.push(`/dimensions/${d.slug}: ${s}`);
    expect(bad).toEqual([]);
  });

  it("slugs are unique per section", () => {
    for (const list of [
      keywordPages.map((p) => p.slug),
      alternativePages.map((p) => p.slug),
      [...competitors.map((c) => c.slug), ...headToHeadPages.map((h) => h.slug)],
      useCases.map((u) => u.slug),
    ]) {
      expect(new Set(list).size).toBe(list.length);
    }
  });
});

describe("SEO titles and descriptions", () => {
  it("absolute titles fit in 60 characters", () => {
    const long: string[] = [];
    for (const [route, page] of ALL_PAGES) {
      const t = (page as { seoTitle?: string }).seoTitle;
      if (t && t.length > 60) long.push(`${route} (${t.length}): ${t}`);
    }
    expect(long).toEqual([]);
  });

  it("meta descriptions are plain text with no inline links", () => {
    const bad: string[] = [];
    for (const [route, page] of ALL_PAGES) {
      const d = (page as { description?: string }).description ?? "";
      if (LINK_RE.test(d)) bad.push(route);
      LINK_RE.lastIndex = 0;
    }
    expect(bad).toEqual([]);
  });
});

describe("house style in new page files", () => {
  const dir = path.join(__dirname, "pages");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".ts")) : [];

  it.each(files)("%s has no em dashes, en dashes, or emoji", (file) => {
    const src = fs.readFileSync(path.join(dir, file), "utf8");
    expect(src).not.toMatch(/[—–]/);
    expect(src).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it.each(files)("%s has no unfinished stub copy", (file) => {
    const src = fs.readFileSync(path.join(dir, file), "utf8");
    expect(src).not.toMatch(/"TODO"|STUB:/);
  });
});

describe("sitemap", () => {
  const urls = sitemap();

  it("lists only canonical www URLs for real routes, once each", () => {
    const paths = urls.map((u) => u.url.replace("https://www.opiniondna.com", "") || "/");
    expect(urls.every((u) => u.url.startsWith("https://www.opiniondna.com"))).toBe(true);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.filter((p) => !ROUTES.has(p))).toEqual([]);
    expect(paths).not.toContain("/login");
    expect(paths).not.toContain("/signup");
  });

  it("gives every URL a real per-page lastmod (run `npm run seo:lastmod` if this fails)", () => {
    const missing = urls.filter((u) => !u.lastModified).map((u) => u.url);
    expect(missing).toEqual([]);
    const distinct = new Set(urls.map((u) => String(u.lastModified)));
    expect(distinct.size).toBeGreaterThan(1);
  });
});
