import type { Metadata } from "next";
import Link from "next/link";
import SEOPageLayout, {
  Breadcrumbs,
  DimensionBadges,
  SEOPageCTA,
  SEOPageFAQ,
} from "@/components/seo/SEOPageLayout";

export const metadata: Metadata = {
  title: "Couples Report | Opinion DNA",
  description:
    "Compare your Opinion DNA with your partner across 48 dimensions of personality, values, and meta-thinking. Understand where you align, where you differ, and why it matters.",
  alternates: { canonical: "https://opiniondna.com/couples" },
  openGraph: {
    title: "Couples Report | Opinion DNA",
    description:
      "Compare your Opinion DNA with your partner across 48 dimensions. Understand alignment, differences, and how to grow together.",
    url: "https://opiniondna.com/couples",
  },
};

const faq = [
  {
    question: "How does the Couples Report work?",
    answer:
      "Both partners take the Opinion DNA assessment individually. Once both are complete, we generate a side-by-side comparison across all 48 dimensions — showing where you align, where you differ, and what those differences mean for your relationship.",
  },
  {
    question: "Do we both need to pay?",
    answer:
      "Yes — each partner purchases their own Personal Assessment ($47 each). Once both assessments are complete, unlock the Couples Comparison Report for $49 from your dashboard.",
  },
  {
    question: "What if my partner has already taken the assessment?",
    answer:
      "Even better. You can connect with any existing Opinion DNA user to generate a comparison report. Just take your own assessment and invite them from your dashboard.",
  },
  {
    question: "Is this a replacement for couples therapy?",
    answer:
      "No. Opinion DNA is a self-awareness and communication tool, not therapy. Many therapists recommend it as a conversation starter — a way to make the invisible visible before working through issues together.",
  },
  {
    question: "What dimensions are most relevant for couples?",
    answer:
      "All 48 dimensions matter, but couples tend to find the most value in values alignment (moral foundations, authority, fairness), personality traits (agreeableness, openness, neuroticism), and meta-thinking patterns (how you process disagreement and form beliefs).",
  },
];

export default function CouplesPage() {
  return (
    <SEOPageLayout>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Couples Report" },
        ]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        Understand each other at the deepest level
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        The Opinion DNA Couples Report maps you and your partner across 48
        dimensions of personality, values, and meta-thinking — revealing where
        you connect, where you clash, and why.
      </p>
      <DimensionBadges />

      <section className="mt-12">
        <p className="text-foreground leading-relaxed text-lg">
          Most couples know they disagree on things. Few understand{" "}
          <em>why</em>. Opinion DNA goes beyond surface-level compatibility
          quizzes to map the deep structures that shape how each of you sees the
          world — your moral foundations, cognitive style, openness to
          experience, and dozens more. The result is a shared language for the
          conversations that matter most.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl text-black mb-8">
          What the Couples Report reveals
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              title: "Alignment map",
              description:
                "See exactly which of the 48 dimensions you share — and which ones pull you in different directions. No guesswork, no vague compatibility scores.",
            },
            {
              title: "Conflict insights",
              description:
                "Most recurring arguments have a root in values or meta-thinking mismatches. The report identifies these patterns so you can address causes, not symptoms.",
            },
            {
              title: "Communication style",
              description:
                "Understand how each of you processes information, handles disagreement, and forms beliefs — so you can meet each other where you actually are.",
            },
            {
              title: "Growth areas",
              description:
                "Differences aren't weaknesses. The report highlights where your differences complement each other and where they need active navigation.",
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
          Dimensions that matter most for couples
        </h2>
        <p className="text-muted mb-6">
          All 48 dimensions are compared. These tend to be especially revealing
          in relationships:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Agreeableness",
            "Neuroticism",
            "Openness",
            "Moral Foundations",
            "Authority",
            "Fairness",
            "Loyalty",
            "Care",
            "Purity",
            "Need for Cognition",
            "Actively Open-Minded Thinking",
            "Intellectual Humility",
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
                Both partners take the assessment
              </p>
              <p className="text-sm text-muted">
                179 questions each, 10-15 minutes. You can do it at different
                times — no need to sit together.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              2
            </span>
            <div>
              <p className="font-semibold text-black">Connect your profiles</p>
              <p className="text-sm text-muted">
                Invite your partner from your dashboard. Once both profiles are
                complete, the comparison unlocks automatically.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              3
            </span>
            <div>
              <p className="font-semibold text-black">
                Explore your Couples Report
              </p>
              <p className="text-sm text-muted">
                A side-by-side breakdown of all 48 dimensions with
                interpretation and discussion prompts tailored to your unique
                combination.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className="mt-16 bg-white rounded-2xl border border-border p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl text-black">
          Map your relationship across 48 dimensions
        </h2>
        <p className="mt-4 text-muted max-w-xl mx-auto">
          Each partner takes the Personal Assessment ($47 each). Then
          unlock the Couples Comparison Report from your dashboard. Already
          assessed? The comparison upgrade is just $49.
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

      <SEOPageFAQ items={faq} pageUrl="/couples" />
    </SEOPageLayout>
  );
}
