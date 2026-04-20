import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { alternativePages, competitors, OPINION_DNA } from "@/data/seo/competitors";
import SEOPageLayout, {
  Breadcrumbs,
  DimensionBadges,
  SEOPageCTA,
  SEOPageFAQ,
} from "@/components/seo/SEOPageLayout";

export function generateStaticParams() {
  return alternativePages.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = alternativePages.find((a) => a.slug === slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `https://www.opiniondna.com/alternatives/${slug}` },
    openGraph: { title: page.title, description: page.description, url: `https://www.opiniondna.com/alternatives/${slug}` },
  };
}

const alternativeDetails: Record<string, { name: string; description: string; dimensions: string; bestFor: string }> = {
  "opinion-dna": {
    name: "Opinion DNA",
    description: "The most comprehensive assessment available — 48 dimensions across personality, values, and meta-thinking with an AI-generated personal report.",
    dimensions: "48 continuous dimensions",
    bestFor: OPINION_DNA.bestFor,
  },
  truity: {
    name: "Truity",
    description: "Multiple separate personality tests (Big Five, Enneagram, DISC, TypeFinder) with optional premium reports.",
    dimensions: "Varies by test (5-16)",
    bestFor: "People who want to pick and choose between established personality frameworks.",
  },
  "big-five": {
    name: "Big Five (OCEAN)",
    description: "The most scientifically validated personality model, measuring 5 core traits on continuous scales.",
    dimensions: "5 personality traits",
    bestFor: "People who want a scientifically solid personality baseline at no cost.",
  },
  enneagram: {
    name: "Enneagram",
    description: "Nine personality types based on core motivations and fears, popular in personal growth communities.",
    dimensions: "9 types with wings",
    bestFor: "People drawn to spiritual growth and understanding core emotional motivations.",
  },
  "16personalities": {
    name: "16Personalities",
    description: "The world's most popular personality test, assigning one of 16 types based on four dichotomies.",
    dimensions: "4 dichotomies → 16 types",
    bestFor: "People who want a quick, fun personality label with massive community.",
  },
  disc: {
    name: "DISC",
    description: "Four behavioral styles focused on workplace communication and team dynamics.",
    dimensions: "4 behavioral styles",
    bestFor: "Corporate teams focused on improving workplace communication.",
  },
  gallup: {
    name: "CliftonStrengths",
    description: "34 talent themes ranked by strength, focused on positive capabilities for career development.",
    dimensions: "34 strength themes",
    bestFor: "Professionals focused on leveraging their natural talents at work.",
  },
  via: {
    name: "VIA Character Strengths",
    description: "24 character strengths under 6 virtues, grounded in positive psychology research.",
    dimensions: "24 character strengths",
    bestFor: "People interested in positive psychology and character development.",
  },
};

export default async function AlternativesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = alternativePages.find((a) => a.slug === slug);
  if (!page) notFound();

  const matchingCompetitor = competitors.find((c) =>
    c.name.toLowerCase().includes(page.competitorName.toLowerCase().split(" ")[0])
  );

  const faqItems = [
    {
      question: `What is the best alternative to ${page.competitorName}?`,
      answer: `The best alternative depends on what you're looking for. If you want the most comprehensive assessment with personality, values, and meta-thinking in one test, Opinion DNA is the strongest option with 48 dimensions. If you want a free personality baseline, the Big Five is scientifically solid. If you want multiple separate tests, Truity offers variety.`,
    },
    {
      question: `Why are people looking for ${page.competitorName} alternatives?`,
      answer: page.whySwitch.join(" "),
    },
    {
      question: "Which alternative has the most dimensions?",
      answer: "Opinion DNA measures 48 dimensions — more than any other consumer personality assessment. It covers personality (Big Five + Dark Triad), values (moral foundations + cooperative virtues), and meta-thinking (cognitive biases + primal world beliefs).",
    },
  ];

  return (
    <SEOPageLayout>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Alternatives", href: "/alternatives" },
          { label: page.title },
        ]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        {page.title}
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        {page.description}
      </p>

      <section className="mt-12">
        <h2 className="text-2xl md:text-3xl text-black mb-6">
          Why look for {page.competitorName} alternatives?
        </h2>
        <ul className="space-y-3">
          {page.whySwitch.map((reason, i) => (
            <li key={i} className="flex gap-3 text-foreground">
              <span className="text-[#CC3333] flex-shrink-0 mt-0.5">&minus;</span>
              {reason}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl md:text-3xl text-black mb-6">
          The best {page.competitorName} alternatives
        </h2>
        <div className="space-y-6">
          {page.alternatives.map((altKey, i) => {
            const alt = alternativeDetails[altKey];
            if (!alt) return null;
            const isOpinionDna = altKey === "opinion-dna";

            return (
              <div
                key={altKey}
                className={`rounded-xl border p-6 ${
                  isOpinionDna
                    ? "border-primary bg-primary/5"
                    : "border-border bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted">#{i + 1}</span>
                      <h3 className={`text-lg ${isOpinionDna ? "text-primary font-semibold" : "text-black"}`}>
                        {alt.name}
                      </h3>
                      {isOpinionDna && (
                        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                          Most comprehensive
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-foreground">{alt.description}</p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted">
                      <span>{alt.dimensions}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      <strong>Best for:</strong> {alt.bestFor}
                    </p>
                  </div>
                </div>
                {isOpinionDna && <DimensionBadges />}
              </div>
            );
          })}
        </div>
      </section>

      {matchingCompetitor && (
        <section className="mt-12">
          <Link
            href={`/vs/${matchingCompetitor.slug}`}
            className="text-primary hover:underline"
          >
            See detailed comparison: Opinion DNA vs {matchingCompetitor.shortName} &rarr;
          </Link>
        </section>
      )}

      <section className="mt-12">
        <h3 className="text-lg text-muted mb-3">More alternatives</h3>
        <div className="flex flex-wrap gap-2">
          {alternativePages
            .filter((a) => a.slug !== slug)
            .map((a) => (
              <Link
                key={a.slug}
                href={`/alternatives/${a.slug}`}
                className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
              >
                {a.competitorName} alternatives
              </Link>
            ))}
        </div>
      </section>

      <SEOPageFAQ items={faqItems} pageUrl={`/alternatives/${slug}`} />
      <SEOPageCTA />
    </SEOPageLayout>
  );
}
