import type { Metadata } from "next";
import SEOPageLayout, {
  Breadcrumbs,
  SEOPageFAQ,
} from "@/components/seo/SEOPageLayout";

export const metadata: Metadata = {
  title: "Referral Program for Therapists, Coaches & Counsellors | Opinion DNA",
  description:
    "Partner with Opinion DNA to offer your clients a 48-dimension psychographic assessment. Commission-based referrals and bulk pricing for therapists, coaches, and counsellors.",
  alternates: { canonical: "https://opiniondna.com/referrals" },
  openGraph: {
    title: "Referral Program for Therapists, Coaches & Counsellors | Opinion DNA",
    description:
      "Partner with Opinion DNA. Commission-based referrals and bulk pricing for therapists, coaches, and counsellors.",
    url: "https://opiniondna.com/referrals",
  },
};

const faq = [
  {
    question: "Who is this program for?",
    answer:
      "Therapists, psychologists, counsellors, executive coaches, relationship coaches, career coaches, and other professionals who work with clients on self-understanding, communication, or personal development.",
  },
  {
    question: "How does the referral commission work?",
    answer:
      "We offer a competitive commission on every assessment purchased through your referral link. Full details are shared when you join the program — email us to get started.",
  },
  {
    question: "Is there bulk pricing for my practice?",
    answer:
      "Yes. We offer volume pricing for practitioners who want to integrate Opinion DNA into their practice as a standard tool. Contact us to discuss pricing based on your expected volume.",
  },
  {
    question: "Do I need any special training?",
    answer:
      "No formal certification is required. We provide partner resources including an overview of the 48 dimensions, interpretation guidance, and suggested discussion frameworks. You already have the expertise — we just give you the data.",
  },
  {
    question: "Can I see my clients' results?",
    answer:
      "Only if the client chooses to share them with you. Each user owns their own data. We can facilitate comparison reports between practitioner and client with mutual consent.",
  },
  {
    question: "What makes Opinion DNA useful in a clinical or coaching context?",
    answer:
      "Opinion DNA goes beyond personality to map values and meta-thinking — how people form beliefs, handle disagreement, and evaluate evidence. These dimensions often underlie the issues clients bring to therapy or coaching, making them a powerful starting point for deeper work.",
  },
];

export default function ReferralsPage() {
  return (
    <SEOPageLayout>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Referral Program" },
        ]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        Partner with Opinion DNA
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        A referral program for therapists, coaches, and counsellors who want to
        give their clients the most complete psychographic assessment available
        — and earn from every referral.
      </p>

      <section className="mt-12">
        <p className="text-foreground leading-relaxed text-lg">
          Opinion DNA maps personality, values, and meta-thinking across 48
          dimensions. For practitioners, it&apos;s a powerful intake tool — a
          way to see a client&apos;s cognitive and values landscape before the
          first session. For clients, it&apos;s a mirror: a structured,
          data-driven way to understand themselves and communicate what they
          find. As a referral partner, you earn commission on every assessment
          while giving your clients something genuinely useful.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl text-black mb-8">
          Why practitioners use Opinion DNA
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              title: "Accelerate client insight",
              description:
                "Skip weeks of surface-level discovery. The 48-dimension profile gives you a detailed map of your client's personality, values, and thinking patterns from session one.",
            },
            {
              title: "Couples & relationship work",
              description:
                "Compare two clients side by side to identify alignment and tension points across all 48 dimensions. A concrete foundation for couples therapy or mediation.",
            },
            {
              title: "Values-based coaching",
              description:
                "Go beyond personality typing. The 24 values dimensions reveal what your clients care about most deeply — the foundation for meaningful goal-setting and decision-making.",
            },
            {
              title: "Meta-thinking patterns",
              description:
                "Understand how your client processes disagreement, forms beliefs, and responds to new evidence. These 12 dimensions are uniquely powerful for cognitive-behavioural approaches.",
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
        <h2 className="text-2xl md:text-3xl text-black mb-8">
          How the program works
        </h2>
        <div className="bg-white rounded-xl border border-border p-8">
          <ol className="space-y-6">
            <li className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                1
              </span>
              <div>
                <p className="font-semibold text-black">Apply to join</p>
                <p className="text-sm text-muted">
                  Email us with a brief description of your practice. We&apos;ll
                  set you up with a referral link and partner resources.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                2
              </span>
              <div>
                <p className="font-semibold text-black">
                  Refer clients or buy in bulk
                </p>
                <p className="text-sm text-muted">
                  Share your referral link with clients, or purchase assessments
                  in bulk at a discounted rate to distribute directly.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                3
              </span>
              <div>
                <p className="font-semibold text-black">
                  Earn on every assessment
                </p>
                <p className="text-sm text-muted">
                  Receive commission on referral purchases, or benefit from
                  volume pricing on bulk orders. Full details shared on
                  approval.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="mt-16 bg-white rounded-2xl border border-border p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl text-black">
          Join the referral program
        </h2>
        <p className="mt-4 text-muted max-w-xl mx-auto">
          Email us to apply. Tell us about your practice and we&apos;ll get you
          set up with a referral link, bulk pricing options, and partner
          resources.
        </p>
        <a
          href="mailto:hello@opiniondna.com?subject=Referral%20Program%20Application"
          className="inline-flex items-center justify-center mt-8 px-10 py-4 bg-primary text-white font-bold rounded-lg text-lg hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          Email Us to Apply
        </a>
        <p className="mt-3 text-sm text-muted">
          hello@opiniondna.com
        </p>
      </section>

      <SEOPageFAQ items={faq} pageUrl="/referrals" />
    </SEOPageLayout>
  );
}
