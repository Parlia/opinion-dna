/**
 * Shared shape for the 48 dimension SEO pages (/dimensions/[slug]).
 * Content lives in dimensions-personality.ts, dimensions-values-1.ts,
 * dimensions-values-2.ts, and dimensions-meta.ts; dimensions.ts aggregates.
 */
export interface DimensionPage {
  /** URL slug, e.g. "openness" → /dimensions/openness */
  slug: string;
  /** Joins to ELEMENTS in src/lib/scoring/elements.ts (0-47) for code/category/color. */
  elementIndex: number;
  /** Must match the ELEMENTS entry name exactly. */
  name: string;
  /** <60 chars. */
  metaTitle: string;
  /** Meta description, 150-160 chars. */
  description: string;
  headline: string;
  subheadline: string;
  /** ~150-250 words. */
  introduction: string;
  /** ~100-180 words. */
  whatItMeasures: string;
  /** What a high score looks like, ~80-140 words. */
  highScore: string;
  /** What a low score looks like, ~80-140 words. */
  lowScore: string;
  /** Exactly 3 entries — where this dimension shows up in real life. */
  inLife: { title: string; description: string }[];
  /** 3-4 slugs of related dimension pages. */
  related: string[];
  /** 4 entries. */
  faq: { question: string; answer: string }[];
}
