import type { Metadata } from "next";
import SEOPageLayout, {
  Breadcrumbs,
  DimensionBadges,
  SEOFinalCTA,
  SEOPageFAQ,
  SEOPricingCard,
} from "@/components/seo/SEOPageLayout";

export const metadata: Metadata = {
  title: "Friends Report | Opinion DNA",
  description:
    "Discover what makes your friendship tick. Compare 48 dimensions of personality, values, and meta-thinking with a friend. Free and shareable.",
  alternates: { canonical: "https://www.opiniondna.com/friends" },
  openGraph: {
    title: "Friends Report | Opinion DNA",
    description:
      "Discover what makes your friendship tick. 48 dimensions compared. Free.",
    url: "https://www.opiniondna.com/friends",
  },
};

const faq = [
  {
    question: "Is the Friends Report really free?",
    answer:
      "Yes. Each person still takes their own Personal Assessment ($47), but the Friends Comparison Report itself is completely free. It's our way of making Opinion DNA something you want to share.",
  },
  {
    question: "How is this different from the Couples or Co-Founders Reports?",
    answer:
      "The 48-dimension assessment is the same, but the framing is different. The Friends Report is lighter, warmer, and more fun — focused on where you click, where you'll playfully butt heads, and conversation starters that only work for your specific pair of scores.",
  },
  {
    question: "Can I do this with multiple friends?",
    answer:
      "Yes. Once you've taken your assessment, you can generate a free Friends Report with any friend who also takes theirs. Each pairing gets its own unique report.",
  },
  {
    question: "Do both of us need to agree to generate the report?",
    answer:
      "Yes. Both people must select the Friends Report before it generates. This keeps your results private and ensures no one's personal data is used without their consent.",
  },
  {
    question: "What does the Friends Report reveal?",
    answer:
      "Your friendship profile, where your personalities naturally click, where you'll lovingly butt heads, conversation starters tied to your actual score gaps, and what each of you uniquely brings to the friendship.",
  },
];

export default function FriendsPage() {
  return (
    <SEOPageLayout
      afterContent={
        <SEOFinalCTA
          heading="See your friendship from a new angle."
          subheading="48 dimensions, side by side, with conversation starters made just for the two of you. Comparison report always free."
        />
      }
    >
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Friends Report" },
        ]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        Discover what makes your friendship tick
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        The Opinion DNA Friends Report compares you and a friend across 48
        dimensions — revealing where you click, where you&apos;ll playfully
        butt heads, and the quirks that make your friendship uniquely yours.
        Free and fun to share.
      </p>
      <DimensionBadges />

      <section className="mt-12">
        <p className="text-foreground leading-relaxed text-lg">
          The best friendships are the ones where you genuinely get each other,
          and the ones where your differences make things more interesting. The
          Friends Report puts both into sharp focus. It&apos;s a warm, honest
          look at the two minds in the room — what you share, where you diverge,
          and the conversations that only you two could have.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl text-black mb-8">
          What the Friends Report reveals
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              title: "Where you click",
              description:
                "The dimensions where your profiles naturally align — shared values, similar thinking styles, overlapping interests. The foundations of why the friendship works.",
            },
            {
              title: "Where you'll butt heads",
              description:
                "The genuine differences, framed lightheartedly. Not as problems, but as the texture that makes your friendship interesting over years instead of months.",
            },
            {
              title: "Conversation starters",
              description:
                "Thought-provoking questions tied to your actual score gaps. The kind of prompts that lead to the conversations you only have with the people who really know you.",
            },
            {
              title: "The friend you need",
              description:
                "What each of you uniquely brings to the friendship — the specific traits that make the other person a better version of themselves.",
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
          Dimensions that shape friendships
        </h2>
        <p className="text-muted mb-6">
          All 48 dimensions are compared. These tend to show up most in how
          friendships feel day-to-day:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Openness",
            "Extraversion",
            "Agreeableness",
            "Humor Style",
            "Benevolence",
            "Universalism",
            "Loyalty",
            "Care",
            "Stimulation",
            "Self-Direction",
            "Need for Cognition",
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
                Both friends take the assessment
              </p>
              <p className="text-sm text-muted">
                179 questions each, 10-15 minutes. Take it independently —
                honest, uninfluenced answers make the comparison meaningful.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              2
            </span>
            <div>
              <p className="font-semibold text-black">
                Invite your friend
              </p>
              <p className="text-sm text-muted">
                Send an invite from your dashboard. When both of you confirm
                the Friends Report, it generates instantly — no payment required.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              3
            </span>
            <div>
              <p className="font-semibold text-black">
                Read and share your Friends Report
              </p>
              <p className="text-sm text-muted">
                A warm, insightful look at your friendship dynamic across all
                48 dimensions, with conversation starters designed specifically
                for the two of you.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <SEOPricingCard
        heading="See what makes your friendship uniquely yours"
        subheading="Each friend takes the Personal Assessment. The Friends Comparison Report is always free."
        planName="Friends"
        price="$47"
        priceSuffix="per friend"
        description="Plus the Friends Comparison Report, free — unlocked automatically when both of you confirm."
        features={[
          "48-element Opinion DNA profile each",
          "Friends comparison report — always free",
          "Conversation starters for the two of you",
          "Where you align, where you diverge",
          "Viewable online, lifetime access",
        ]}
        trustLines={[
          "30-day money-back guarantee",
          "Friends Report always free · Secure payment via Stripe",
        ]}
      />

      <SEOPageFAQ items={faq} pageUrl="/friends" />
    </SEOPageLayout>
  );
}
