import type { Metadata } from "next";
import Link from "next/link";
import { dimensionPages, DIMENSION_LAYERS } from "@/data/seo/dimensions";
import { ELEMENTS } from "@/lib/scoring/elements";
import SEOPageLayout, {
  Breadcrumbs,
  SEOPageCTA,
} from "@/components/seo/SEOPageLayout";

export const metadata: Metadata = {
  title: "The 48 Dimensions of Opinion DNA — Full Glossary",
  description:
    "Every dimension Opinion DNA measures, explained: the Big Five, the Dark Triad, moral foundations, personal values, meta-thinking, and primal world beliefs.",
  alternates: { canonical: "https://www.opiniondna.com/dimensions" },
};

export default function DimensionsHubPage() {
  return (
    <SEOPageLayout>
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Dimensions" }]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        The 48 dimensions of Opinion DNA
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        Your Opinion DNA profile maps 48 dimensions in three layers &mdash;
        personality, values, and meta-thinking. Each one is a continuous
        0&ndash;100 score benchmarked against the population, drawn from
        peer-reviewed research. Explore what every dimension means.
      </p>

      {DIMENSION_LAYERS.map((layer) => {
        const layerElements = ELEMENTS.filter((e) => e.dimension === layer.key);
        const categories = [...new Set(layerElements.map((e) => e.category))];

        return (
          <section key={layer.key} className="mt-14">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: layer.color }}
              />
              <h2 className="text-2xl md:text-3xl text-black">
                {layer.label}{" "}
                <span className="text-muted text-lg">
                  &middot; {layerElements.length} dimensions
                </span>
              </h2>
            </div>
            <p className="text-muted mb-6 max-w-2xl">{layer.blurb}</p>

            {categories.map((category) => {
              const pages = layerElements
                .map((e) => dimensionPages.find((d) => d.elementIndex === e.index))
                .filter((d): d is NonNullable<typeof d> => Boolean(d))
                .filter(
                  (d) => ELEMENTS[d.elementIndex].category === category,
                );
              if (pages.length === 0) return null;

              return (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold text-black mb-4">
                    {category}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {pages.map((page) => (
                      <Link
                        key={page.slug}
                        href={`/dimensions/${page.slug}`}
                        className="bg-white rounded-xl border border-border p-5 hover:border-primary hover:shadow-md transition-all group"
                      >
                        <h4 className="text-base font-semibold text-black group-hover:text-primary transition-colors">
                          {page.name}
                        </h4>
                        <p className="mt-1.5 text-sm text-muted line-clamp-2">
                          {ELEMENTS[page.elementIndex].tooltip}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}

      <section className="mt-12">
        <h3 className="text-lg text-muted mb-3">More ways to explore</h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/methodology"
            className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
          >
            How Opinion DNA was built
          </Link>
          <Link
            href="/tests"
            className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
          >
            Personality tests
          </Link>
          <Link
            href="/vs"
            className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
          >
            Compare with other tests
          </Link>
          <Link
            href="/for"
            className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
          >
            Use cases
          </Link>
        </div>
      </section>

      <SEOPageCTA />
    </SEOPageLayout>
  );
}
