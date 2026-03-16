import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { keywordPages } from "@/data/seo/keywords";
import SEOPageLayout, {
  Breadcrumbs,
  DimensionBadges,
  SEOPageCTA,
  SEOPageFAQ,
} from "@/components/seo/SEOPageLayout";

export function generateStaticParams() {
  return keywordPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = keywordPages.find((p) => p.slug === slug);
  if (!page) return {};

  return {
    title: page.metaTitle,
    description: page.description,
    alternates: { canonical: `https://opiniondna.com/tests/${slug}` },
    openGraph: { title: page.metaTitle, description: page.description, url: `https://opiniondna.com/tests/${slug}` },
  };
}

export default async function KeywordPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = keywordPages.find((p) => p.slug === slug);
  if (!page) notFound();

  const relatedPages = keywordPages
    .filter((p) => p.slug !== slug && p.tier === page.tier)
    .slice(0, 4);

  return (
    <SEOPageLayout>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Tests", href: "/tests" },
          { label: page.title },
        ]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        {page.headline}
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        {page.subheadline}
      </p>
      <DimensionBadges />

      {page.sections.map((section, i) => (
        <section key={i} className="mt-12">
          <h2 className="text-2xl md:text-3xl text-black mb-4">
            {section.heading}
          </h2>
          <p className="text-foreground leading-relaxed">{section.content}</p>
        </section>
      ))}

      {page.comparisonNote && (
        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-xl p-6">
          <p className="text-foreground font-medium">{page.comparisonNote}</p>
        </div>
      )}

      <section className="mt-12 bg-white rounded-xl border border-border p-8">
        <h3 className="text-xl text-black mb-4">How it works</h3>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">1</span>
            <div>
              <p className="font-semibold text-black">Take the assessment</p>
              <p className="text-sm text-muted">179 questions across personality, values, and meta-thinking. 10-15 minutes, auto-saves progress.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">2</span>
            <div>
              <p className="font-semibold text-black">Get your 48-dimension profile</p>
              <p className="text-sm text-muted">Continuous 0-100 scores with population averages across all 48 elements.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">3</span>
            <div>
              <p className="font-semibold text-black">Read your AI-generated report</p>
              <p className="text-sm text-muted">Personalized narrative covering personality, values, meta-thinking, career, and relationships.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="mt-12">
        <h3 className="text-lg text-muted mb-3">
          Related assessments
        </h3>
        <div className="flex flex-wrap gap-2">
          {relatedPages.map((p) => (
            <Link
              key={p.slug}
              href={`/tests/${p.slug}`}
              className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
            >
              {p.title}
            </Link>
          ))}
          <Link
            href="/vs"
            className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
          >
            Compare all tests
          </Link>
        </div>
      </section>

      <SEOPageFAQ items={page.faq} pageUrl={`/tests/${slug}`} />
      <SEOPageCTA />
    </SEOPageLayout>
  );
}
