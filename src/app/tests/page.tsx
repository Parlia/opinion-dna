import type { Metadata } from "next";
import Link from "next/link";
import { keywordPages } from "@/data/seo/keywords";
import SEOPageLayout, {
  Breadcrumbs,
  SEOPageCTA,
} from "@/components/seo/SEOPageLayout";

export const metadata: Metadata = {
  title: "Personality Tests and Assessments — Opinion DNA",
  description:
    "Explore the most comprehensive personality, values, and thinking style assessments. 48 dimensions, AI-generated reports, and peer-reviewed science from Oxford, Cambridge, and NYU.",
  alternates: { canonical: "https://www.opiniondna.com/tests" },
};

const tierLabels: Record<number, string> = {
  1: "Comprehensive Assessments",
  2: "Unique to Opinion DNA",
  4: "Beyond Traditional Tests",
};

export default function TestsHubPage() {
  const tiers = [1, 2, 4] as const;

  return (
    <SEOPageLayout>
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Tests" }]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        Personality tests and assessments
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        Opinion DNA offers the most comprehensive personality assessment available
        — 48 dimensions across personality, values, and meta-thinking with an
        AI-generated personal report.
      </p>

      {tiers.map((tier) => {
        const pages = keywordPages.filter((p) => p.tier === tier);
        if (pages.length === 0) return null;

        return (
          <section key={tier} className="mt-12">
            <h2 className="text-2xl text-black mb-6">{tierLabels[tier]}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {pages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/tests/${page.slug}`}
                  className="bg-white rounded-xl border border-border p-6 hover:border-primary hover:shadow-md transition-all group"
                >
                  <h3 className="text-lg text-black group-hover:text-primary transition-colors">
                    {page.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted line-clamp-2">
                    {page.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-12">
        <h3 className="text-lg text-muted mb-3">More ways to explore</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/vs" className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors">
            Compare to other tests
          </Link>
          <Link href="/alternatives" className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors">
            Test alternatives
          </Link>
          <Link href="/for" className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors">
            Use cases
          </Link>
        </div>
      </section>

      <SEOPageCTA />
    </SEOPageLayout>
  );
}
