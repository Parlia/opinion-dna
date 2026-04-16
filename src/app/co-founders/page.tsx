import type { Metadata } from "next";
import Link from "next/link";
import SEOPageLayout, {
  Breadcrumbs,
  DimensionBadges,
  SEOPageFAQ,
} from "@/components/seo/SEOPageLayout";

export const metadata: Metadata = {
  title: "Co-Founders Report | Opinion DNA",
  description:
    "Compare co-founder compatibility across 48 dimensions of personality, values, and meta-thinking. Understand alignment before it becomes a problem.",
  alternates: { canonical: "https://opiniondna.com/co-founders" },
  openGraph: {
    title: "Co-Founders Report | Opinion DNA",
    description:
      "Compare co-founder compatibility across 48 dimensions. Understand alignment before it becomes a problem.",
    url: "https://opiniondna.com/co-founders",
  },
};

const faq = [
  {
    question: "Why do co-founders need this?",
    answer:
      "Co-founder conflict is the #1 reason startups fail. Most of those conflicts aren't about strategy — they're about values, risk tolerance, and how each person handles disagreement. Opinion DNA maps these dimensions before they become existential problems.",
  },
  {
    question: "How is this different from the Couples Report?",
    answer:
      "The underlying assessment is the same 48 dimensions, but the co-founder context surfaces different insights. Business partnerships are shaped more by risk tolerance, need for cognition, conscientiousness, and authority orientation than by the dimensions that drive romantic relationships.",
  },
  {
    question: "Can we use this for potential co-founders we haven't committed to yet?",
    answer:
      "Absolutely — that's one of the best use cases. Each person takes their own assessment, then you generate a comparison. It's a low-cost way to pressure-test alignment before making a multi-year commitment.",
  },
  {
    question: "Does it work for more than two co-founders?",
    answer:
      "Yes. You can compare across any number of co-founders. The report shows pairwise comparisons and group-level patterns for teams of three or more.",
  },
  {
    question: "What does the comparison show?",
    answer:
      "A dimension-by-dimension comparison showing where you align and where you diverge, with context on what each difference means in a business partnership. It also highlights the meta-thinking dimensions that predict how you'll handle disagreement under pressure.",
  },
];

export default function CoFoundersPage() {
  return (
    <SEOPageLayout>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Co-Founders Report" },
        ]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        Know your co-founder before it matters
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        The Opinion DNA Co-Founders Report compares you and your co-founder
        across 48 dimensions — revealing alignment in values, risk tolerance,
        decision-making style, and how you each handle conflict under pressure.
      </p>
      <DimensionBadges />

      <section className="mt-12">
        <p className="text-foreground leading-relaxed text-lg">
          Co-founder relationships are the foundation startups are built on.
          When they work, everything else gets easier. When they don&apos;t,
          nothing else matters. The problem is that most co-founders discover
          their deepest misalignments too late — under stress, with money on the
          line, when the cost of a breakup is catastrophic. Opinion DNA makes
          those fault lines visible before they become fractures.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl text-black mb-8">
          What the Co-Founders Report reveals
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              title: "Values alignment",
              description:
                "See whether you share the same moral foundations — authority, fairness, loyalty, care. These shape every hiring decision, pricing call, and partnership you'll ever make.",
            },
            {
              title: "Risk & ambiguity tolerance",
              description:
                "One founder wants to move fast, the other wants more data. The report quantifies these differences so you can divide decisions by strength, not by volume.",
            },
            {
              title: "Conflict style",
              description:
                "How each of you handles disagreement, processes criticism, and updates beliefs. The meta-thinking dimensions predict whether your arguments will be productive or destructive.",
            },
            {
              title: "Cognitive complementarity",
              description:
                "The best co-founder pairs aren't identical — they're complementary. The report shows where your differences are assets and where they need guardrails.",
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
          Dimensions that matter most for co-founders
        </h2>
        <p className="text-muted mb-6">
          All 48 dimensions are compared. These tend to be most critical in
          business partnerships:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Risk Tolerance",
            "Need for Cognition",
            "Conscientiousness",
            "Openness",
            "Authority",
            "Fairness",
            "Cognitive Reflection",
            "Actively Open-Minded Thinking",
            "Intellectual Humility",
            "Dogmatism",
            "Extraversion",
            "Neuroticism",
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
                Both co-founders take the assessment
              </p>
              <p className="text-sm text-muted">
                179 questions each, 10-15 minutes. Do it independently — the
                value is in honest, uninfluenced answers.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              2
            </span>
            <div>
              <p className="font-semibold text-black">
                Connect your profiles
              </p>
              <p className="text-sm text-muted">
                Invite your co-founder from your dashboard. The comparison
                generates automatically once both assessments are complete.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              3
            </span>
            <div>
              <p className="font-semibold text-black">
                Explore your Co-Founders Report
              </p>
              <p className="text-sm text-muted">
                A dimension-by-dimension comparison with context on what each
                alignment or difference means for your working relationship.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className="mt-16 bg-white rounded-2xl border border-border p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl text-black">
          Pressure-test your partnership across 48 dimensions
        </h2>
        <p className="mt-4 text-muted max-w-xl mx-auto">
          Each co-founder takes the Personal Assessment ($47 each). Then
          unlock the Co-Founder Comparison Report ($399) from your dashboard.
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

      <SEOPageFAQ items={faq} pageUrl="/co-founders" />
    </SEOPageLayout>
  );
}
