import type { Metadata } from "next";
import Link from "next/link";
import SEOPageLayout, {
  Breadcrumbs,
  DimensionBadges,
  SEOPageFAQ,
} from "@/components/seo/SEOPageLayout";

export const metadata: Metadata = {
  title: "Personal Assessment | Opinion DNA",
  description:
    "The most complete map of your mind. 48 dimensions across Personality, Values, and Meta-Thinking in a single assessment. 179 questions, 10-15 minutes, $47.",
  alternates: { canonical: "https://www.opiniondna.com/personal-assessment" },
  openGraph: {
    title: "Personal Assessment | Opinion DNA",
    description:
      "The most complete map of your mind. 48 dimensions in 10-15 minutes. $47.",
    url: "https://www.opiniondna.com/personal-assessment",
  },
};

const faq = [
  {
    question: "What do I get with the Personal Assessment?",
    answer:
      "Your full Opinion DNA profile — 48 scores across Personality (12), Values (24), and Meta-Thinking (12). You also get an AI-generated personal report that interprets your scores across Life & Happiness, Relationships, Career, Cognitive Signature, and an explanation of all 48 elements tailored to your profile.",
  },
  {
    question: "How long does it take?",
    answer:
      "The assessment is 179 questions and takes 10 to 15 minutes. Your report is generated within a few minutes of finishing. You can save progress and come back if needed.",
  },
  {
    question: "What makes this different from other personality tests?",
    answer:
      "Opinion DNA is the only assessment that combines personality, values, and meta-thinking into one profile. Myers-Briggs and the Big Five cover personality alone. Schwartz and Moral Foundations cover values alone. Opinion DNA draws from all of these and adds the cognitive dimensions that predict how you actually think and decide.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. Your scores are yours. We don't sell data. Comparison reports (with a partner, friend, or co-founder) require explicit consent from both people before anything is generated or shared.",
  },
  {
    question: "Can I compare with someone else afterward?",
    answer:
      "Yes. Once you've completed your Personal Assessment, you can invite a friend, partner, or co-founder. When they complete their own, you unlock a comparison report together — free for Friends, $49 for Couples, $399 for Co-Founders.",
  },
  {
    question: "Is there a money-back guarantee?",
    answer:
      "Yes. 30-day money-back guarantee. If the assessment isn't for you, email us and we'll refund you.",
  },
];

export default function PersonalAssessmentPage() {
  return (
    <SEOPageLayout>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Personal Assessment" },
        ]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        The most complete map of your mind
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        The Opinion DNA Personal Assessment maps you across 48 dimensions of
        personality, values, and meta-thinking. One profile, three layers of
        who you are, and an AI-generated report that reads them together.
      </p>
      <DimensionBadges />

      <section className="mt-12">
        <p className="text-foreground leading-relaxed text-lg">
          Most personality tests give you a piece of the picture. The Big Five
          covers traits. Schwartz covers values. Cognitive reflection covers
          thinking style. Opinion DNA pulls from all of these, plus the
          meta-thinking dimensions that predict how you actually approach the
          world. What you get is not a label or a type. It is a 48-dimension
          map that reveals patterns you recognize the moment you read them.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl text-black mb-8">
          What the Personal Assessment reveals
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              title: "Your personality profile",
              description:
                "Twelve dimensions covering the Big Five, the Dark Triad, emotional regulation, and how you relate to mortality and life satisfaction. The deepest, most stable layer of who you are.",
            },
            {
              title: "Your values map",
              description:
                "Twenty-four dimensions covering Moral Foundations, Cooperative Virtues, Schwartz's ten personal values, and your social orientation. What you care about, why you argue, and what you'll defend.",
            },
            {
              title: "Your meta-thinking signature",
              description:
                "Twelve dimensions covering dogmatism, intellectual humility, need for cognition, tolerance for ambiguity, and your primal world beliefs. How your mind actually works.",
            },
            {
              title: "Your AI-generated report",
              description:
                "A detailed interpretation across Life & Happiness, Relationships, Career, and your Cognitive Signature. Plus every one of the 48 elements explained in the context of your specific profile.",
            },
          ].map((benefit, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-border p-6"
            >
              <h3 className="text-lg text-black mb-2">{benefit.title}</h3>
              <p className="text-foreground text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl text-black mb-4">
          48 dimensions, three layers
        </h2>
        <p className="text-muted mb-6">
          The Personal Assessment covers every element used in Opinion DNA.
          Here's a sample of what's measured:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Openness",
            "Conscientiousness",
            "Extraversion",
            "Agreeableness",
            "Neuroticism",
            "Moral Foundations",
            "Loyalty",
            "Fairness",
            "Self-Direction",
            "Achievement",
            "Security",
            "Tradition",
            "Need for Cognition",
            "Intellectual Humility",
            "Dogmatism",
            "Primal World Beliefs",
          ].map((dim) => (
            <span
              key={dim}
              className="text-sm px-3 py-1.5 bg-white border border-border rounded-full"
            >
              {dim}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-12 bg-white rounded-xl border border-border p-8">
        <h3 className="text-xl text-black mb-4">How it works</h3>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              1
            </span>
            <div>
              <p className="font-semibold text-black">
                Take the assessment
              </p>
              <p className="text-sm text-muted">
                179 carefully designed questions. Takes 10 to 15 minutes.
                Answer honestly — the more truthful you are, the more useful
                the profile.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              2
            </span>
            <div>
              <p className="font-semibold text-black">
                See your 48 scores
              </p>
              <p className="text-sm text-muted">
                Your complete profile across Personality, Values, and
                Meta-Thinking, with population comparisons for every
                dimension.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              3
            </span>
            <div>
              <p className="font-semibold text-black">
                Read your AI-generated report
              </p>
              <p className="text-sm text-muted">
                A detailed interpretation of your profile across Life &
                Happiness, Relationships, Career, and how your mind works.
                Every element explained in the context of your scores.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              4
            </span>
            <div>
              <p className="font-semibold text-black">
                Optional: invite others to compare
              </p>
              <p className="text-sm text-muted">
                Once your profile is complete, you can invite a friend,
                partner, or co-founder. When they complete their own
                assessment, you unlock a comparison report together.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className="mt-16 bg-white rounded-2xl border border-border p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl text-black">
          Map your mind across 48 dimensions
        </h2>
        <p className="mt-4 text-muted max-w-xl mx-auto">
          One assessment, 10 to 15 minutes, the most complete psychographic
          profile available today.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center mt-8 px-10 py-4 bg-primary text-white font-bold rounded-lg text-lg hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          Start My Assessment &mdash; $47
        </Link>
        <p className="mt-3 text-sm text-muted">
          One-time purchase. Lifetime access. 30-day money-back guarantee.
        </p>
      </section>

      <SEOPageFAQ items={faq} pageUrl="/personal-assessment" />
    </SEOPageLayout>
  );
}
