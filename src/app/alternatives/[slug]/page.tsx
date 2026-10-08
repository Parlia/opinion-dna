import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { alternativePages, competitors, OPINION_DNA } from "@/data/seo/competitors";
import type { AlternativeDetail } from "@/data/seo/content-types";
import Prose from "@/components/seo/Prose";
import SEOPageLayout, {
  articleJsonLd,
  Breadcrumbs,
  ContentSections,
  DimensionBadges,
  DimensionLinks,
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
    title: page.seoTitle ? { absolute: page.seoTitle } : page.title,
    description: page.description,
    alternates: { canonical: `https://www.opiniondna.com/alternatives/${slug}` },
    openGraph: {
      title: page.seoTitle ?? page.title,
      description: page.description,
      url: `https://www.opiniondna.com/alternatives/${slug}`,
    },
  };
}

// Card copy checked 2026-10-08 against each publisher's own site:
// truity: https://www.truity.com/ and https://www.truity.com/test/big-five-personality-test (free basic results, full report for "a small fee")
// enneagram: https://www.enneagraminstitute.com/how-the-enneagram-system-works and /type-1 (nine types, wings, Basic Fear and Basic Desire)
// 16personalities: https://www.16personalities.com/articles/our-theory (five scales incl. Identity; no Jungian concepts; reworks the Big Five)
// disc: https://www.everythingdisc.com/what-is-disc/, https://www.ttisi.com/disc/, https://www.truity.com/test/disc-personality-test (several publishers)
// gallup: https://www.gallup.com/cliftonstrengths/en/252137/home.aspx (34 themes, 30-minute paired-statement assessment)
// via: https://www.viacharacter.org/character-strengths (24 strengths under six virtues)
const alternativeDetails: Record<string, AlternativeDetail> = {
  "opinion-dna": {
    name: "Opinion DNA",
    description: "48 dimensions across personality, values, and meta-thinking in one assessment, scored 0 to 100 against population averages, with an AI-generated personal report.",
    dimensions: "48 continuous dimensions",
    bestFor: OPINION_DNA.bestFor,
  },
  truity: {
    name: "Truity",
    description: "Multiple separate personality tests (Big Five, Enneagram, DISC, TypeFinder), each with free basic results and a paid full report.",
    dimensions: "Varies by test",
    bestFor: "People who want to pick and choose between established personality frameworks.",
  },
  "big-five": {
    name: "Big Five (OCEAN)",
    description: "The five-trait model most academic personality research uses, measuring openness, conscientiousness, extraversion, agreeableness, and neuroticism on continuous scales.",
    dimensions: "5 personality traits",
    bestFor: "People who want a research-standard personality baseline, often from a free test.",
  },
  enneagram: {
    name: "Enneagram",
    description: "Nine personality types based on core motivations and fears, popular in personal growth communities.",
    dimensions: "9 types with wings",
    bestFor: "People drawn to spiritual growth and understanding core emotional motivations.",
  },
  "16personalities": {
    name: "16Personalities",
    description: "A free test that gives a five-letter code such as INTJ-A. It uses Myers-Briggs-style letters, but its own site says it reworks the Big Five and adds an Assertive or Turbulent scale.",
    dimensions: "5 scales, 16 types with -A or -T",
    bestFor: "People who want a quick, free type and the shared vocabulary that comes with it.",
  },
  disc: {
    name: "DISC",
    description: "Four behavioral styles focused on workplace communication and team dynamics, offered by several publishers, including Wiley (as Everything DiSC), TTI, and Truity.",
    dimensions: "4 behavioral styles",
    bestFor: "Corporate teams focused on improving workplace communication.",
  },
  gallup: {
    name: "CliftonStrengths",
    description: "Gallup's 30-minute assessment of paired statements, which ranks 34 talent themes for career and leadership development.",
    dimensions: "34 strength themes",
    bestFor: "Professionals who want to build on their natural talents at work.",
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

  const matchingCompetitor = page.vsSlug
    ? competitors.find((c) => c.slug === page.vsSlug)
    : competitors.find((c) =>
        c.name.toLowerCase().includes(page.competitorName.toLowerCase().split(" ")[0])
      );

  const faqItems = page.faq ?? [
    {
      question: `What is the best alternative to ${page.competitorName}?`,
      answer: `It depends on what you want to learn. If you want personality, values, and thinking style measured together in one test, Opinion DNA scores 48 dimensions across all three. If you want a free personality baseline, a Big Five test is a solid start. If you want to try several separate frameworks, Truity offers a range of individual tests.`,
    },
    {
      question: `Why are people looking for ${page.competitorName} alternatives?`,
      answer: page.whySwitch.join(" "),
    },
    {
      question: "What does Opinion DNA measure that most personality tests don't?",
      answer: "Values and thinking style. Opinion DNA scores 48 dimensions in three layers: personality (the Big Five, the Dark Triad, emotional regulation, and life satisfaction), values (moral foundations, cooperative virtues, personal values, and social orientation), and meta-thinking (dogmatism, intellectual humility, need for cognition, and primal world beliefs).",
    },
  ];

  return (
    <SEOPageLayout
      jsonLd={[
        articleJsonLd({
          headline: page.title,
          description: page.description,
          path: `/alternatives/${slug}`,
        }),
      ]}
    >
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
      {page.intro && <Prose text={page.intro} className="mt-8" />}

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
          {page.alternatives.map((entry, i) => {
            const alt = typeof entry === "string" ? alternativeDetails[entry] : entry;
            if (!alt) return null;
            const isOpinionDna = entry === "opinion-dna";

            return (
              <div
                key={alt.name}
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
                          Our assessment
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-foreground">{alt.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                      <span>{alt.dimensions}</span>
                      {alt.price && <span>{alt.price}</span>}
                      {alt.website && <span>{alt.website}</span>}
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

      {page.sections && <ContentSections sections={page.sections} />}

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

      {page.relatedDimensions && <DimensionLinks slugs={page.relatedDimensions} />}

      <SEOPageFAQ items={faqItems} pageUrl={`/alternatives/${slug}`} />
      {page.ctaHref ? (
        <SEOPageCTA href={page.ctaHref} label="Take the Full Assessment" />
      ) : (
        <SEOPageCTA />
      )}
    </SEOPageLayout>
  );
}
