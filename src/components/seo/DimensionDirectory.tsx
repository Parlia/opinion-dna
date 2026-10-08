import Link from "next/link";
import { dimensionPages, DIMENSION_LAYERS } from "@/data/seo/dimensions";
import { ELEMENTS } from "@/lib/scoring/elements";

/**
 * Compact, grouped list of all 48 dimensions (layer → category → dimension),
 * each linking to its /dimensions/* page. Built from the same data as the
 * /dimensions hub so names, counts, and URLs can't drift.
 */
export default function DimensionDirectory() {
  return (
    <>
      {DIMENSION_LAYERS.map((layer) => {
        const layerElements = ELEMENTS.filter((e) => e.dimension === layer.key);
        const categories = [...new Set(layerElements.map((e) => e.category))];

        return (
          <section key={layer.key} id={`list-${layer.key}`} className="mt-12">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: layer.color }}
              />
              <h2 className="text-2xl md:text-3xl text-black">
                {layer.label} ({layerElements.length})
              </h2>
            </div>
            <p className="text-muted mb-6 max-w-2xl">{layer.blurb}</p>

            {categories.map((category) => {
              const pages = layerElements
                .filter((e) => e.category === category)
                .map((e) => dimensionPages.find((d) => d.elementIndex === e.index))
                .filter((d): d is NonNullable<typeof d> => Boolean(d));
              if (pages.length === 0) return null;

              return (
                <div key={category} className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-3">
                    {category}
                  </h3>
                  <ul className="space-y-2">
                    {pages.map((page) => (
                      <li key={page.slug} className="text-foreground leading-relaxed">
                        <Link
                          href={`/dimensions/${page.slug}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {page.name}
                        </Link>
                        <span className="text-muted">
                          {": "}
                          {ELEMENTS[page.elementIndex].tooltip}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        );
      })}
    </>
  );
}
