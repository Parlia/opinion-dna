import type { Metadata } from "next";
import { ROOT_OG_IMAGES, ROOT_TWITTER_IMAGES } from "@/lib/seo/share-images";
import Link from "next/link";
import SEOPageLayout, {
  Breadcrumbs,
  DimensionBadges,
  SEOFinalCTA,
  SEOPageFAQ,
  SEOPricingCard,
} from "@/components/seo/SEOPageLayout";

// Absolute title: the root template would otherwise append "| Opinion DNA®".
const TITLE = "Team DNA Assessment for Companies | Opinion DNA®";
const DESCRIPTION =
  "A team DNA assessment for companies: map every member across 48 dimensions of personality, values, and thinking style to see where the team aligns and clashes.";
export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "https://www.opiniondna.com/teams" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://www.opiniondna.com/teams",
    images: ROOT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ROOT_TWITTER_IMAGES,
  },
};

const faq = [
  {
    question: "What is a team DNA assessment?",
    answer:
      "A team DNA assessment maps the combined personality, values, and thinking styles of everyone on a team. The DNA is a metaphor for that psychological profile, and no genetic testing is involved. With Opinion DNA, each member takes the same 179-question assessment, and the Teams Report compares the group across all 48 dimensions.",
  },
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
        Team DNA: build a team that thinks better together
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        The Opinion DNA Teams Report is a team DNA assessment for companies. It
        maps every member across 48 dimensions of personality, values, and
        meta-thinking, then shows the dynamics underneath your team&apos;s
        collaboration, conflict, and decision-making.
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
        <h2 className="text-2xl md:text-3xl text-black mb-4">
          What is a team DNA assessment?
        </h2>
        <div className="space-y-4">
          <p className="text-foreground leading-relaxed">
            A team&apos;s DNA is the combined map of its members&apos;
            personalities, values, and thinking styles. The DNA is a metaphor
            for psychology: nothing genetic is tested, and no lab or saliva kit
            is involved. Each person answers the same 179 questions, and the
            Teams Report lays their 48 dimension scores side by side, so you can
            see the patterns the group shares and the places where it splits.
          </p>
          <p className="text-foreground leading-relaxed">
            For corporate teams, the value is in the values and meta-thinking
            layers, which most workplace assessments leave out. A team that
            scores high on{" "}
            <Link
              href="/dimensions/group"
              className="text-primary hover:underline"
            >
              Group
            </Link>{" "}
            puts real weight on shared identity and belonging. Wide gaps on{" "}
            <Link
              href="/dimensions/social-dominance"
              className="text-primary hover:underline"
            >
              Social Dominance
            </Link>{" "}
            can surface as arguments about hierarchy and who gets a say. If most
            of the room scores high on{" "}
            <Link
              href="/dimensions/deference"
              className="text-primary hover:underline"
            >
              Deference
            </Link>
            , meetings may run smoothly while disagreement goes unsaid. And{" "}
            <Link
              href="/dimensions/need-for-cognition"
              className="text-primary hover:underline"
            >
              Need for Cognition
            </Link>{" "}
            and{" "}
            <Link
              href="/dimensions/intellectual-humility"
              className="text-primary hover:underline"
            >
              Intellectual Humility
            </Link>{" "}
            shape how a team argues: how much it enjoys a hard problem, and how
            readily people change their minds when the evidence turns.
          </p>
          <p className="text-foreground leading-relaxed">
            Our guide to{" "}
            <Link
              href="/for/teams-and-leadership"
              className="text-primary hover:underline"
            >
              personality assessment for teams
            </Link>{" "}
            covers how companies put the results to work. If you are weighing
            professional instruments such as MBTI Step II, our{" "}
            <Link
              href="/alternatives/mbti-step-ii-alternatives"
              className="text-primary hover:underline"
            >
              MBTI Step II alternatives
            </Link>{" "}
            guide sets out what each one measures and who can administer it.
            For the partnership at the top of a company, the{" "}
            <Link href="/co-founders" className="text-primary hover:underline">
              Co-Founders Report
            </Link>{" "}
            applies the same 48 dimensions to two founders.
          </p>
        </div>
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
