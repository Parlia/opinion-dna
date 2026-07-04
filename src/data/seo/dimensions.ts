import type { DimensionPage } from "./dimension-types";
import { dimensionPagesPersonality } from "./dimensions-personality";
import { dimensionPagesValues1 } from "./dimensions-values-1";
import { dimensionPagesValues2 } from "./dimensions-values-2";
import { dimensionPagesMeta } from "./dimensions-meta";

export type { DimensionPage } from "./dimension-types";

/** All 48 dimension pages, in element-index order. */
export const dimensionPages: DimensionPage[] = [
  ...dimensionPagesPersonality,
  ...dimensionPagesValues1,
  ...dimensionPagesValues2,
  ...dimensionPagesMeta,
];

export function getDimensionPage(slug: string): DimensionPage | undefined {
  return dimensionPages.find((d) => d.slug === slug);
}

/** Layer display config for the hub page and badges. */
export const DIMENSION_LAYERS = [
  {
    key: "personality" as const,
    label: "Personality",
    color: "#00B922",
    blurb:
      "The stable traits psychology measures best — the Big Five, the Dark Triad, emotional regulation, and life satisfaction.",
  },
  {
    key: "values" as const,
    label: "Values",
    color: "#0054FF",
    blurb:
      "What you hold to matter — moral foundations, cooperative virtues, personal values, and social orientation.",
  },
  {
    key: "meta-thinking" as const,
    label: "Meta-Thinking",
    color: "#8A00FF",
    blurb:
      "How you form and hold beliefs — not what you think, but how: dogmatism, intellectual humility, uncertainty tolerance, and your primal world beliefs.",
  },
];
