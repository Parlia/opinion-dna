/**
 * Shared shapes for long-form SEO content (tests, alternatives, vs, for pages).
 *
 * Any string typed as "prose" supports a deliberately tiny markup, rendered by
 * src/components/seo/Prose.tsx:
 *   - Blank line ("\n\n")      → new paragraph
 *   - Lines starting "- "      → bullet list (the whole block must be bullets)
 *   - Block starting "### "    → h3 subheading
 *   - [anchor text](/path)     → internal link (next/link)
 *   - [anchor text](https://…) → external link (new tab, rel=noopener)
 * Nothing else is interpreted. No HTML, no bold, no em dashes in new copy.
 * JSON-LD and meta tags always use the plain-text version (stripProse).
 */

export interface SimpleTable {
  /** Header row. First column is the row label. */
  columns: string[];
  /** Each row has columns.length cells. Cells are plain text. */
  rows: string[][];
  /** Index of the column to highlight as Opinion DNA's (optional). */
  highlightColumn?: number;
  /** Small print under the table (sources, "as of" dates). Prose. */
  note?: string;
}

export interface ContentSection {
  /** Rendered as an h2. Plain text. */
  heading: string;
  /** Prose (see markup above). */
  content: string;
  /** Optional table rendered after the prose. */
  table?: SimpleTable;
}

export interface FAQItem {
  question: string;
  /** Prose. Links render on the page; JSON-LD gets the stripped text. */
  answer: string;
}

/** A card in an alternatives list, for tests not in the shared lookup. */
export interface AlternativeDetail {
  name: string;
  description: string;
  dimensions: string;
  bestFor: string;
  /** Bare domain, shown as text (we don't link out from cards). */
  website?: string;
  price?: string;
}

/** Three-or-more-way comparison page under /vs (no Opinion DNA head-to-head). */
export interface HeadToHeadPage {
  slug: string;
  /** Short label for hub cards and breadcrumbs. */
  shortTitle: string;
  /** H1. */
  title: string;
  /** <title>, absolute (no brand suffix added), under 60 chars. */
  seoTitle: string;
  /** Meta description, 140-160 chars, plain text. */
  description: string;
  /** Prose under the H1. */
  intro: string;
  table: SimpleTable;
  sections: ContentSection[];
  faq: FAQItem[];
  /** Dimension slugs for the "Dimensions mentioned" block. */
  relatedDimensions?: string[];
}
