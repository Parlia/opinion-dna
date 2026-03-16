import type { Metadata } from "next";
import Link from "next/link";
import { alternativePages } from "@/data/seo/competitors";
import SEOPageLayout, {
  Breadcrumbs,
  SEOPageCTA,
} from "@/components/seo/SEOPageLayout";

export const metadata: Metadata = {
  title: "Personality Test Alternatives — Compare Your Options",
  description:
    "Find better alternatives to 16Personalities, Myers-Briggs, Enneagram, Big Five, Truity, and DISC. Compare features, pricing, and scientific validation.",
  alternates: { canonical: "https://opiniondna.com/alternatives" },
};

export default function AlternativesHubPage() {
  return (
    <SEOPageLayout>
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Alternatives" }]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        Personality test alternatives
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        Looking for something better? Compare alternatives to the most popular
        personality assessments and find the one that fits your needs.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mt-12">
        {alternativePages.map((page) => (
          <Link
            key={page.slug}
            href={`/alternatives/${page.slug}`}
            className="bg-white rounded-xl border border-border p-6 hover:border-primary hover:shadow-md transition-all group"
          >
            <h2 className="text-lg text-black group-hover:text-primary transition-colors">
              {page.competitorName} Alternatives
            </h2>
            <p className="mt-2 text-sm text-muted line-clamp-2">
              {page.description}
            </p>
            <p className="mt-3 text-xs text-muted">
              {page.whySwitch.length} reasons people switch
            </p>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <h3 className="text-lg text-muted mb-3">Or compare directly</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/vs" className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors">
            All comparisons
          </Link>
        </div>
      </section>

      <SEOPageCTA />
    </SEOPageLayout>
  );
}
