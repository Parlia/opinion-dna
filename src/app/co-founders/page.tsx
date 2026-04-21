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
  alternates: { canonical: "https://www.opiniondna.com/co-founders" },
  openGraph: {
    title: "Co-Founders Report | Opinion DNA",
    description:
      "Compare co-founder compatibility across 48 dimensions. Understand alignment before it becomes a problem.",
    url: "https://www.opiniondna.com/co-founders",
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

      {/* ── Scroll-stopping: the #1 cause of startup failure ───────────────── */}
      <section className="mt-20 -mx-6 md:-mx-12">
        {/* Hero stat panel: dark, inverted, dominates the viewport */}
        <div className="relative rounded-2xl bg-[#0A0A0A] text-white overflow-hidden px-8 py-16 md:px-16 md:py-20">
          {/* Subtle red-amber backglow so it reads as "warning" without shouting */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, #CC3333 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] text-[#FFB3B3] mb-6">
              The #1 reason startups fail
            </p>
            <div className="flex flex-col md:flex-row md:items-baseline md:gap-6">
              <span
                className="text-[104px] sm:text-[140px] md:text-[180px] leading-[0.85] font-bold tabular-nums text-white"
                style={{ letterSpacing: "-0.04em" }}
              >
                65%
              </span>
              <span className="mt-4 md:mt-0 text-base md:text-xl text-white/70 font-light leading-tight">
                of high-potential
                <br className="hidden md:block" />
                {" "}startups
              </span>
            </div>
            <p className="mt-8 text-2xl md:text-3xl text-white font-light leading-snug max-w-2xl">
              fail because of problems{" "}
              <span className="font-semibold text-white">
                between co-founders
              </span>
              {" "}— not the market, not the product, not the tech.
            </p>
            <p className="mt-8 text-sm text-white/50 italic">
              Noam Wasserman, <span className="not-italic">The Founder&apos;s Dilemmas</span> (Harvard Business School)
            </p>
          </div>
        </div>

        {/* Core hook */}
        <div className="mt-16 text-center max-w-3xl mx-auto px-6">
          <p className="text-3xl md:text-4xl text-black leading-tight">
            Most startups don&apos;t fail because of the idea.
          </p>
          <p className="mt-3 text-3xl md:text-4xl leading-tight font-semibold text-[#CC3333]">
            They fail because of the relationship.
          </p>
        </div>

        {/* Body */}
        <div className="mt-16 max-w-2xl mx-auto px-6 space-y-3 text-lg text-foreground leading-relaxed">
          <p>You think your biggest risk is product-market fit.</p>
          <p>Or funding.</p>
          <p>Or timing.</p>
          <p className="pt-2 text-xl font-semibold text-black">It&apos;s not.</p>
          <p className="pt-4">
            Two-thirds of the time, the biggest risk in your startup is the
            person sitting next to you.
          </p>
        </div>

        {/* Y Combinator pull-quote — verified from PG's "18 Mistakes That Kill Startups" */}
        <div className="mt-14 max-w-3xl mx-auto px-6">
          <blockquote className="relative border-l-4 border-primary pl-6 md:pl-8 py-2">
            <p className="text-xl md:text-2xl text-black font-light italic leading-snug">
              &ldquo;Most of the disputes I&apos;ve seen between founders could
              have been avoided if they&apos;d been more careful about who they
              started a company with.&rdquo;
            </p>
            <footer className="mt-4 text-sm text-muted not-italic">
              — Paul Graham, Y Combinator
            </footer>
          </blockquote>
        </div>

        {/* The uncomfortable truth */}
        <div className="mt-20 max-w-3xl mx-auto px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#CC3333] mb-3">
            The uncomfortable truth
          </p>
          <h3 className="text-2xl md:text-3xl text-black mb-6 leading-tight">
            Co-founder breakdowns rarely look dramatic at first.
          </h3>
          <p className="text-foreground leading-relaxed mb-8">
            They start small:
          </p>
          <ul className="space-y-4">
            {[
              "Slight differences in ambition",
              "Unspoken expectations about roles",
              "Quiet resentment about effort or equity",
              "Avoided conversations",
            ].map((item) => (
              <li key={item} className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="mt-[0.6em] w-6 h-px bg-[#CC3333] flex-shrink-0"
                />
                <span className="text-lg text-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-foreground leading-relaxed">
            Then one day decisions slow down, trust erodes, alignment disappears.
          </p>
          <p className="mt-3 text-xl md:text-2xl text-black font-semibold leading-snug">
            And the company quietly dies — even if the idea was strong.
          </p>
        </div>

        {/* Why this happens — the questions */}
        <div className="mt-20 max-w-3xl mx-auto px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
            Why this happens
          </p>
          <h3 className="text-2xl md:text-3xl text-black mb-8 leading-tight">
            Because most co-founders never answer the hard questions.
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "What do we actually want from this company?",
              "Who has the final say when we disagree?",
              "What happens if one of us wants out?",
              "How do we handle money, power, and pressure?",
            ].map((question) => (
              <div
                key={question}
                className="bg-white border border-border rounded-xl p-6"
              >
                <p className="text-black italic text-lg leading-snug">
                  &ldquo;{question}&rdquo;
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-[#0A0A0A] text-white rounded-xl p-6 md:p-8">
            <p className="text-white/70 text-sm uppercase tracking-widest font-semibold mb-3">
              Instead, they rely on:
            </p>
            <p className="text-2xl md:text-3xl font-light italic text-white leading-snug">
              &ldquo;We&apos;ll figure it out.&rdquo;
            </p>
            <p className="mt-4 text-lg text-white/70">
              That works — until it doesn&apos;t.
            </p>
          </div>
        </div>

        {/* Bridge into the existing "what the report reveals" */}
        <div className="mt-20 max-w-3xl mx-auto px-6 text-center">
          <p className="text-xl md:text-2xl text-black font-light leading-snug">
            That&apos;s exactly what the Co-Founders Report is built to surface —
            <span className="font-semibold"> before it costs you the company</span>.
          </p>
        </div>
      </section>

      <section className="mt-20">
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
