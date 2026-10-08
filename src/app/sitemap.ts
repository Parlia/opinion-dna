import type { MetadataRoute } from "next";
import { competitors, alternativePages, headToHeadPages } from "@/data/seo/competitors";
import { useCases } from "@/data/seo/use-cases";
import { keywordPages } from "@/data/seo/keywords";
import { dimensionPages } from "@/data/seo/dimensions";
import lastmod from "@/data/seo/lastmod.json";

const BASE_URL = "https://www.opiniondna.com";
const LASTMOD = lastmod as Record<string, string>;

/**
 * <lastmod> is each page's real last content change, from the git-derived
 * manifest (scripts/gen-sitemap-lastmod.mjs, `npm run seo:lastmod`). A route
 * missing from the manifest gets no lastmod rather than a made-up one: a
 * build-time `new Date()` on every URL tells Google nothing.
 *
 * Auth pages (/login, /signup) are deliberately absent: they're noindex.
 */
function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number
): MetadataRoute.Sitemap[number] {
  const date = LASTMOD[path === "" ? "/" : path];
  return {
    url: `${BASE_URL}${path}`,
    ...(date ? { lastModified: date } : {}),
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    entry("", "weekly", 1),
    entry("/privacy", "yearly", 0.3),
    entry("/terms", "yearly", 0.3),

    // Product & marketing landing pages
    ...[
      "/personal-assessment",
      "/couples",
      "/co-founders",
      "/teams",
      "/friends",
      "/book",
      "/referrals",
    ].map((p) => entry(p, "monthly", 0.8)),

    // Hub pages
    entry("/vs", "weekly", 0.8),
    entry("/alternatives", "weekly", 0.8),
    entry("/for", "weekly", 0.8),
    entry("/tests", "weekly", 0.8),
    entry("/dimensions", "weekly", 0.8),
    entry("/methodology", "monthly", 0.7),

    ...dimensionPages.map((d) => entry(`/dimensions/${d.slug}`, "monthly", 0.7)),
    ...competitors.map((c) => entry(`/vs/${c.slug}`, "monthly", 0.7)),
    ...headToHeadPages.map((h) => entry(`/vs/${h.slug}`, "monthly", 0.7)),
    ...alternativePages.map((a) => entry(`/alternatives/${a.slug}`, "monthly", 0.7)),
    ...useCases.map((u) => entry(`/for/${u.slug}`, "monthly", 0.7)),
    ...keywordPages.map((p) => entry(`/tests/${p.slug}`, "monthly", 0.7)),
  ];
}
