import type { Metadata } from "next";
import SEOPageLayout, {
  Breadcrumbs,
  DimensionBadges,
  SEOFinalCTA,
  SEOPageFAQ,
  SEOPricingCard,
} from "@/components/seo/SEOPageLayout";

export const metadata: Metadata = {
  title: "Teams Report | Opinion DNA",
  description:
    "Map your team across 48 dimensions of personality, values, and meta-thinking. Identify blind spots, improve communication, and build a team that thinks better together.",
  alternates: { canonical: "https://www.opiniondna.com/teams" },
  openGraph: {
    title: "Teams Report | Opinion DNA",
    description:
      "Map your team across 48 dimensions. Identify blind spots, improve communication, and build a team that thinks better together.",
    url: "https://www.opiniondna.com/teams",
  },
};

const faq = [
  {
    question: "How many people can be on a team?",
    answer:
      "There is no upper limit. Teams of 3-20 people tend to get the most actionable results, but we have worked with larger groups. Contact us to discuss your needs.",
  },
  {
    question: "Does everyone take the same assessment?",
    answer:
      "Yes. Every team member takes the same 179-question Opinion DNA assessment individually. Their results are then compared as a group.",
  },
  {
    question: "Is there a team discount?",
    answer:
      "Yes. We offer volume pricing for teams of 5 or more. Contact us at hello@opiniondna.com for a custom quote.",
  },
  {
    question: "Can I add new team members later?",
    answer:
      "Absolutely. New members can take the assessment at any time and be added to the team comparison. The group report updates automatically.",
  },
  {
    question: "Is individual data kept private?",
    answer:
      "Each team member controls their own data. The team report shows aggregate patterns and pairwise comparisons, but individual reports remain private unless the person chooses to share.",
  },
  {
    question: "How is this different from DISC or Myers-Briggs for teams?",
    answer:
      "Most team assessments measure personality only. Opinion DNA also maps values and meta-thinking — the dimensions that drive how people make decisions, handle conflict, and evaluate ideas. That's where the real team dynamics live.",
  },
];

export default function TeamsPage() {
  return (
    <SEOPageLayout
      afterContent={
        <SEOFinalCTA
          heading="Build a team that thinks better together."
          subheading="Map your team across 48 dimensions of personality, values, and meta-thinking. Volume pricing for 5+."
          ctaLabel="Contact Us for Teams"
          ctaHref="mailto:hello@opiniondna.com?subject=Teams%20Report%20inquiry"
          trustLine="One-time purchase per person. Lifetime access."
        />
      }
    >
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Teams Report" },
        ]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        Build a team that thinks better together
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        The Opinion DNA Teams Report maps every member across 48 dimensions of
        personality, values, and meta-thinking — revealing the hidden dynamics
        that drive collaboration, conflict, and decision-making.
      </p>
      <DimensionBadges />

      <section className="mt-12">
        <p className="text-foreground leading-relaxed text-lg">
          Great teams aren&apos;t just skilled — they&apos;re cognitively
          diverse. But diversity without understanding creates friction. Opinion
          DNA gives your team a shared map of how each person thinks, what they
          value, and how they process disagreement. The result: less
          miscommunication, better decisions, and conflict that produces ideas
          instead of resentment.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl text-black mb-8">
          What the Teams Report reveals
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              title: "Cognitive diversity map",
              description:
                "See where your team clusters and where it has gaps. Identify blind spots in thinking style, values orientation, and meta-cognitive approach before they become problems.",
            },
            {
              title: "Communication patterns",
              description:
                "Understand why certain pairs collaborate effortlessly while others struggle. The report shows which dimensions create natural alignment and which create friction.",
            },
            {
              title: "Decision-making dynamics",
              description:
                "Map how your team weighs evidence, handles uncertainty, and resolves disagreement. Spot groupthink risks and under-represented perspectives.",
            },
            {
              title: "Hiring & growth insights",
              description:
                "See which cognitive profiles are missing from your team. Use the data to hire for complementary strengths rather than cultural clones.",
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
          Dimensions that matter most for teams
        </h2>
        <p className="text-muted mb-6">
          All 48 dimensions are compared. These tend to drive the biggest team
          dynamics:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Need for Cognition",
            "Actively Open-Minded Thinking",
            "Conscientiousness",
            "Agreeableness",
            "Authority",
            "Fairness",
            "Loyalty",
            "Openness",
            "Risk Tolerance",
            "Intellectual Humility",
            "Cognitive Reflection",
            "Dogmatism",
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
                Each team member takes the assessment
              </p>
              <p className="text-sm text-muted">
                179 questions, 10-15 minutes each. Everyone completes it
                independently at their own pace.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              2
            </span>
            <div>
              <p className="font-semibold text-black">
                Connect the team
              </p>
              <p className="text-sm text-muted">
                The team admin invites members from their dashboard. As each
                person completes their assessment, they appear in the team view.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              3
            </span>
            <div>
              <p className="font-semibold text-black">
                Explore the Teams Report
              </p>
              <p className="text-sm text-muted">
                Group-level patterns, pairwise comparisons, and a cognitive
                diversity overview — all in one place.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <SEOPricingCard
        heading="Map your team across 48 dimensions"
        subheading="Volume pricing for 5+. Get in touch for a custom quote."
        planName="Teams"
        price="$47"
        priceSuffix="per person"
        description="Volume discounts for teams of 5+. We'll put together a quote that fits your team size and rollout plan."
        features={[
          "Each member takes the 179-question assessment",
          "Group-level patterns & cognitive diversity",
          "Pairwise comparisons across the team",
          "Blind-spot & communication insights",
          "Rollout support for teams of 5+",
          "Viewable online, lifetime access",
        ]}
        ctaLabel="Contact Us for Teams"
        ctaHref="mailto:hello@opiniondna.com?subject=Teams%20Report%20inquiry"
        trustLines={[
          "Custom quotes for 5+ teammates",
          "One-time purchase per person · Lifetime access",
        ]}
      />

      <SEOPageFAQ items={faq} pageUrl="/teams" />
    </SEOPageLayout>
  );
}
