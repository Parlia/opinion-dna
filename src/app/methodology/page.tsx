import type { Metadata } from "next";
import Link from "next/link";
import Prose from "@/components/seo/Prose";
import SEOPageLayout, {
  articleJsonLd,
  Breadcrumbs,
  DimensionBadges,
  SEOPageCTA,
  SEOPageFAQ,
} from "@/components/seo/SEOPageLayout";

const TITLE = "How Opinion DNA Was Built — Methodology & Science";
const DESCRIPTION =
  "How Opinion DNA was developed: 60+ expert interviews, three years with academic psychologists from Oxford, Cambridge, NYU, and UPenn, and peer-reviewed scales behind all 48 dimensions.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://www.opiniondna.com/methodology" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://www.opiniondna.com/methodology",
  },
};

const faqItems = [
  {
    question: "Is Opinion DNA scientifically valid?",
    answer:
      "Opinion DNA was developed over three years in consultation with academic psychologists and behavioral scientists from Royal Holloway, Oxford, Cambridge, the University of Pennsylvania, City University, and NYU. Each of the 48 dimensions is grounded in peer-reviewed psychometric research — established constructs like the Big Five, moral foundations, basic human values, and primal world beliefs — rather than invented categories.",
  },
  {
    question: "How is this different from MBTI or other type-based tests?",
    answer:
      "Opinion DNA doesn't sort you into a type. Every dimension is a continuous 0-100 score, which preserves the information type systems throw away — the difference between scoring 52 and 95 on the same trait. It also measures three layers (personality, values, and meta-thinking) where most tests measure only one.",
  },
  {
    question: "Is Opinion DNA a clinical or diagnostic tool?",
    answer:
      "No. Opinion DNA measures trait continua in the general population. A score on any dimension — including Neuroticism or the Dark Triad traits — describes where you sit relative to other people, not a diagnosis. If you have concerns about your mental health, speak to a qualified professional.",
  },
  {
    question: "Where do the population averages come from?",
    answer:
      "Every score in your profile is shown next to a population average for that dimension, so you can see where you sit relative to others who have taken the assessment. The averages update as more people complete Opinion DNA.",
  },
  {
    question: "How does the AI report work?",
    answer:
      "Once your 48 scores are calculated, AI analyzes your specific combination — not each score in isolation — and writes a personal report covering your life and happiness, relationships, career, and Cognitive Signature. The scores themselves come from your answers, not from AI; the AI's job is interpretation and synthesis.",
  },
];

export default function MethodologyPage() {
  return (
    <SEOPageLayout
      jsonLd={[
        articleJsonLd({
          headline: TITLE,
          description: DESCRIPTION,
          path: "/methodology",
        }),
      ]}
    >
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Methodology" }]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        How Opinion DNA was built
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        Opinion DNA is the product of three years of development with academic
        psychologists and behavioral scientists. Here is where it came from,
        what it measures, and how your answers become your profile.
      </p>
      <DimensionBadges />

      <section className="mt-12">
        <h2 className="text-2xl md:text-3xl text-black mb-4">
          Where it came from
        </h2>
        <p className="text-foreground leading-relaxed">
          During 2020, our team interviewed more than sixty experts in
          personality psychology, behavioral economics, evolutionary
          psychology, and cognition with one question in mind: what actually
          drives the way people see the world? The answer kept coming back in
          three parts. Stable personality traits matter, but they are only one
          layer. Values — what people hold to be important and sacred — do
          much of the work traits get credit for. And underneath both sits a
          third layer almost no assessment measures: how people form and hold
          beliefs in the first place.
        </p>
        <p className="mt-4 text-foreground leading-relaxed">
          Over the following three years, working in consultation with
          academic psychologists and behavioral scientists from Royal
          Holloway, Oxford, Cambridge, the University of Pennsylvania, City
          University, and NYU, that research program became Opinion DNA: a
          single assessment that maps all three layers. The thinking behind it
          is told in full in{" "}
          <Link href="/book" className="text-primary hover:underline">
            Why We Think What We Think
          </Link>{" "}
          by Opinion DNA co-founder Turi Munthe, published by Penguin.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl md:text-3xl text-black mb-4">
          The three layers
        </h2>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
            <h3 className="text-xl text-black mb-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#00B922] mr-2" />
              Personality — 12 dimensions
            </h3>
            <Prose
              text={
                "The traits psychology measures best: the Big Five ([openness](/dimensions/openness), [conscientiousness](/dimensions/conscientiousness), [extraversion](/dimensions/extraversion), [agreeableness](/dimensions/agreeableness), [neuroticism](/dimensions/neuroticism)), the Dark Triad ([Machiavellianism](/dimensions/machiavellianism), [narcissism](/dimensions/narcissism), [psychopathy](/dimensions/psychopathy)) measured as subclinical trait continua, plus emotional regulation styles ([reappraisal](/dimensions/emotional-reappraisal) and [suppression](/dimensions/suppression-tendency)), [mortality concern](/dimensions/mortality-concern), and [life satisfaction](/dimensions/life-satisfaction). These draw on the most replicated findings in trait psychology."
              }
            />
          </div>
          <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
            <h3 className="text-xl text-black mb-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#0054FF] mr-2" />
              Values — 24 dimensions
            </h3>
            <Prose
              text={
                "What you hold to matter, drawn from four research traditions: moral foundations, the intuitions behind moral judgment ([care](/dimensions/care), [fairness](/dimensions/fairness), [loyalty](/dimensions/loyalty), [authority](/dimensions/authority), [purity](/dimensions/purity)); cooperative virtues from the morality-as-cooperation research program ([family](/dimensions/family), [group](/dimensions/group), [reciprocity](/dimensions/reciprocity), [heroism](/dimensions/heroism), [deference](/dimensions/deference), [equity](/dimensions/equity), [property](/dimensions/property)); basic personal values in the tradition founded by Shalom Schwartz ([power](/dimensions/power), [achievement](/dimensions/achievement), [hedonism](/dimensions/hedonism), [stimulation](/dimensions/stimulation), [self-direction](/dimensions/self-direction), [universalism](/dimensions/universalism), [benevolence](/dimensions/benevolence), [conformity](/dimensions/conformity), [tradition](/dimensions/tradition), [security](/dimensions/security)); and social orientation ([social dominance](/dimensions/social-dominance), [authoritarianism](/dimensions/authoritarianism)). Values predict decisions, politics, and conflict better than personality traits alone."
              }
            />
          </div>
          <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
            <h3 className="text-xl text-black mb-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#8A00FF] mr-2" />
              Meta-Thinking — 12 dimensions
            </h3>
            <Prose
              text={
                "Opinion DNA\u2019s differentiator: how you believe, as distinct from what you believe. [Dogmatism](/dimensions/dogmatism), [need for cognition](/dimensions/need-for-cognition), [intolerance for uncertainty](/dimensions/intolerance-for-uncertainty), [intellectual humility](/dimensions/intellectual-humility), [teleology](/dimensions/teleology), [just-world belief](/dimensions/just-world-belief), [subjective numeracy](/dimensions/subjective-numeracy), and [anthropomorphism](/dimensions/anthropomorphism), plus your four primal world beliefs: whether the world feels [alive](/dimensions/alive-world-belief), [enticing](/dimensions/enticing-world-belief), [safe](/dimensions/safe-world-belief), and [good](/dimensions/good-world-belief), a research program from the University of Pennsylvania."
              }
            />
          </div>
        </div>
        <p className="mt-6 text-foreground leading-relaxed">
          Every dimension is grounded in peer-reviewed psychometric research —
          established constructs with decades of literature behind them, not
          categories we invented.{" "}
          <Link href="/dimensions" className="text-primary hover:underline">
            Explore all 48 dimensions &rarr;
          </Link>
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl md:text-3xl text-black mb-4">
          From questions to scores
        </h2>
        <p className="text-foreground leading-relaxed">
          The assessment is 179 statements answered on an agree&ndash;disagree
          scale, taking 10&ndash;15 minutes. Your answers are scored into 48
          continuous dimensions, each on a 0&ndash;100 scale. We deliberately
          avoid types and labels: a type system has to throw away the
          difference between a 52 and a 95 on the same trait, which is often
          exactly the information that matters. Each score is shown alongside
          the population average, so you always see where you sit relative to
          other people — not against an arbitrary midpoint.
        </p>
        <p className="mt-4 text-foreground leading-relaxed">
          Your progress saves automatically after every answer, and your
          scores are yours to revisit for life.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl md:text-3xl text-black mb-4">
          The AI-written report
        </h2>
        <p className="text-foreground leading-relaxed">
          Scores tell you where you stand; the report tells you what it means.
          AI analyzes your specific combination of 48 scores — the
          interactions, not each number in isolation — and writes a personal
          report covering your life and happiness, your relationships, your
          career, and your Cognitive Signature: how you form opinions, where
          your thinking has blind spots, and how you handle disagreement. Two
          people with the same Openness score get different reports, because
          the rest of their profiles differ.
        </p>
      </section>

      <section className="mt-14 bg-white rounded-2xl border border-border p-6 md:p-8">
        <h2 className="text-xl text-black mb-3">What Opinion DNA is — and isn&rsquo;t</h2>
        <p className="text-foreground leading-relaxed">
          Opinion DNA is a map of how your mind works: your traits, your
          values, and your thinking patterns, measured against the population.
          It is not a clinical instrument, and no score on any dimension is a
          diagnosis. It is a snapshot built from your honest answers — the
          better the input, the better the map.
        </p>
      </section>

      <SEOPageFAQ items={faqItems} pageUrl="/methodology" />
      <SEOPageCTA />
    </SEOPageLayout>
  );
}
