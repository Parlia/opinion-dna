import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { competitors, OPINION_DNA } from "@/data/seo/competitors";
import SEOPageLayout, {
  Breadcrumbs,
  ComparisonTable,
  DimensionBadges,
  SEOPageCTA,
  SEOPageFAQ,
} from "@/components/seo/SEOPageLayout";

export function generateStaticParams() {
  return competitors.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const competitor = competitors.find((c) => c.slug === slug);
  if (!competitor) return {};

  const title = `Opinion DNA vs ${competitor.shortName} — Which Is Right For You?`;
  const description = `Compare Opinion DNA and ${competitor.shortName} side by side. See how 48 dimensions across personality, values, and meta-thinking compares to ${competitor.dimensions}.`;

  return {
    title,
    description,
    alternates: { canonical: `https://www.opiniondna.com/vs/${slug}` },
    openGraph: { title, description, url: `https://www.opiniondna.com/vs/${slug}` },
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const competitor = competitors.find((c) => c.slug === slug);
  if (!competitor) notFound();

  const comparisonRows = [
    { label: "Dimensions", yours: "48 continuous dimensions", theirs: competitor.dimensions },
    { label: "Price", yours: "$47 one-time", theirs: competitor.price },
    { label: "Time", yours: "10-15 minutes", theirs: competitor.timeToComplete },
    { label: "Results", yours: OPINION_DNA.resultType, theirs: competitor.resultType },
    { label: "Values measured", yours: "24 value dimensions", theirs: "No" },
    { label: "Meta-thinking measured", yours: "12 cognitive dimensions", theirs: "No" },
    { label: "AI-generated report", yours: "Yes — personalized narrative", theirs: "No" },
    { label: "Population comparison", yours: "Yes — all 48 dimensions", theirs: "Limited or none" },
    { label: "Scientific basis", yours: "Peer-reviewed scales (Oxford, NYU, UPenn)", theirs: competitor.shortName === "Big Five" ? "Strong (Big Five model)" : "Varies" },
  ];

  const faqItems = [
    {
      question: `What's the main difference between Opinion DNA and ${competitor.shortName}?`,
      answer: competitor.keyDifference,
    },
    {
      question: `Who is ${competitor.shortName} better for?`,
      answer: competitor.bestFor,
    },
    {
      question: `Who is Opinion DNA better for?`,
      answer: OPINION_DNA.bestFor,
    },
    {
      question: "Can I take both?",
      answer: `Yes. Many people take ${competitor.shortName} first and then use Opinion DNA for a deeper, more comprehensive profile. The two assessments measure different things, so the results complement each other.`,
    },
  ];

  return (
    <SEOPageLayout>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Compare", href: "/vs" },
          { label: `vs ${competitor.shortName}` },
        ]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        Opinion DNA vs {competitor.shortName}
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        {competitor.keyDifference}
      </p>
      <DimensionBadges />

      <ComparisonTable rows={comparisonRows} competitorName={competitor.shortName} />

      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl text-black mb-4">
          What is {competitor.shortName}?
        </h2>
        <p className="text-foreground leading-relaxed">{competitor.description}</p>
        <p className="mt-2 text-foreground leading-relaxed">{competitor.howItWorks}</p>
      </section>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div>
          <h3 className="text-xl text-black mb-4">
            {competitor.shortName} strengths
          </h3>
          <ul className="space-y-2">
            {competitor.strengths.map((s, i) => (
              <li key={i} className="flex gap-3 text-foreground">
                <span className="text-[#00B922] flex-shrink-0 mt-0.5">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl text-black mb-4">
            {competitor.shortName} limitations
          </h3>
          <ul className="space-y-2">
            {competitor.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-3 text-foreground">
                <span className="text-[#CC3333] flex-shrink-0 mt-0.5">&minus;</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl text-black mb-4">
          What Opinion DNA adds
        </h2>
        <ul className="space-y-3">
          {OPINION_DNA.strengths.map((s, i) => (
            <li key={i} className="flex gap-3 text-foreground">
              <span className="text-primary flex-shrink-0 mt-0.5">&#10003;</span>
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl md:text-3xl text-black mb-4">
          Who should choose {competitor.shortName}?
        </h2>
        <p className="text-foreground leading-relaxed">{competitor.bestFor}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl md:text-3xl text-black mb-4">
          Who should choose Opinion DNA?
        </h2>
        <p className="text-foreground leading-relaxed">{OPINION_DNA.bestFor}</p>
      </section>

      <section className="mt-12">
        <h3 className="text-lg text-muted mb-3">Compare with other tests</h3>
        <div className="flex flex-wrap gap-2">
          {competitors
            .filter((c) => c.slug !== slug)
            .map((c) => (
              <Link
                key={c.slug}
                href={`/vs/${c.slug}`}
                className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
              >
                vs {c.shortName}
              </Link>
            ))}
        </div>
      </section>

      <SEOPageFAQ items={faqItems} pageUrl={`/vs/${slug}`} />
      <SEOPageCTA />
    </SEOPageLayout>
  );
}
