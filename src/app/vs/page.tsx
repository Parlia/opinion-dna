import type { Metadata } from "next";
import Link from "next/link";
import { competitors } from "@/data/seo/competitors";
import SEOPageLayout, {
  Breadcrumbs,
  DimensionBadges,
  SEOPageCTA,
} from "@/components/seo/SEOPageLayout";

export const metadata: Metadata = {
  title: "Compare Opinion DNA to Other Personality Tests",
  description:
    "See how Opinion DNA's 48-dimension assessment compares to 16Personalities, Myers-Briggs, Enneagram, Big Five, Truity, DISC, CliftonStrengths, and VIA Character Strengths.",
  alternates: { canonical: "https://www.opiniondna.com/vs" },
};

export default function CompareHubPage() {
  return (
    <SEOPageLayout>
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Compare" }]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        Compare Opinion DNA to other personality tests
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        See how 48 dimensions across personality, values, and meta-thinking
        compares to the most popular personality assessments.
      </p>
      <DimensionBadges />

      <div className="grid sm:grid-cols-2 gap-4 mt-12">
        {competitors.map((c) => (
          <Link
            key={c.slug}
            href={`/vs/${c.slug}`}
            className="bg-white rounded-xl border border-border p-6 hover:border-primary hover:shadow-md transition-all group"
          >
            <h2 className="text-lg text-black group-hover:text-primary transition-colors">
              Opinion DNA vs {c.shortName}
            </h2>
            <p className="mt-2 text-sm text-muted">
              48 dimensions vs. {c.dimensions}
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted">
              <span>Opinion DNA: $47</span>
              <span>{c.shortName}: {c.price}</span>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl text-black mb-6">
          Why Opinion DNA is different
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-3 px-3 font-semibold text-muted">Test</th>
                <th className="text-left py-3 px-3 font-semibold text-muted">Dimensions</th>
                <th className="text-left py-3 px-3 font-semibold text-muted">Values</th>
                <th className="text-left py-3 px-3 font-semibold text-muted">Meta-Thinking</th>
                <th className="text-left py-3 px-3 font-semibold text-muted">AI Report</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border bg-primary/5">
                <td className="py-3 px-3 font-semibold text-primary">Opinion DNA</td>
                <td className="py-3 px-3">48</td>
                <td className="py-3 px-3 text-[#00B922]">&#10003;</td>
                <td className="py-3 px-3 text-[#00B922]">&#10003;</td>
                <td className="py-3 px-3 text-[#00B922]">&#10003;</td>
              </tr>
              {competitors.map((c) => (
                <tr key={c.slug} className="border-b border-border">
                  <td className="py-3 px-3">{c.shortName}</td>
                  <td className="py-3 px-3 text-muted">{c.dimensions}</td>
                  <td className="py-3 px-3 text-[#CC3333]">&times;</td>
                  <td className="py-3 px-3 text-[#CC3333]">&times;</td>
                  <td className="py-3 px-3 text-[#CC3333]">&times;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h3 className="text-lg text-muted mb-3">Looking for alternatives?</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/alternatives/16personalities-alternatives" className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors">
            16Personalities alternatives
          </Link>
          <Link href="/alternatives/myers-briggs-alternatives" className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors">
            MBTI alternatives
          </Link>
          <Link href="/alternatives/enneagram-alternatives" className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors">
            Enneagram alternatives
          </Link>
        </div>
      </section>

      <SEOPageCTA />
    </SEOPageLayout>
  );
}
