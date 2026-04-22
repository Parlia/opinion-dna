import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Safe: JSON-LD data is from hardcoded constants in our data files, not user input
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `https://www.opiniondna.com${item.href}` } : {}),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted mb-8">
        {items.map((item, i) => (
          <span key={i}>
            {i > 0 && <span className="mx-2">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}

export function SEOPageCTA() {
  return (
    <section className="mt-16 bg-white rounded-2xl border border-border p-8 md:p-12 text-center">
      <h2 className="text-2xl md:text-3xl text-black">
        Ready to discover your 48-dimension profile?
      </h2>
      <p className="mt-4 text-muted max-w-xl mx-auto">
        Personality, values, and meta-thinking — mapped across 48 dimensions with
        an AI-generated personal report. Built with 60+ experts from Oxford,
        Cambridge, NYU, and UPenn.
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
  );
}

export function SEOPageFAQ({ items, pageUrl }: { items: { question: string; answer: string }[]; pageUrl?: string }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(pageUrl ? { url: `https://www.opiniondna.com${pageUrl}` } : {}),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="mt-16">
      <JsonLd data={faqJsonLd} />
      <h2 className="text-2xl md:text-3xl text-black mb-8">
        Frequently asked questions
      </h2>
      <div className="space-y-4">
        {items.map((item, i) => (
          <details
            key={i}
            className="bg-white rounded-lg border border-border overflow-hidden group"
          >
            <summary className="px-6 py-4 cursor-pointer font-semibold text-black hover:bg-beige-light/50 transition-colors list-none flex items-center justify-between gap-4">
              {item.question}
              <svg
                className="w-5 h-5 text-muted flex-shrink-0 transition-transform duration-300 group-open:rotate-45"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </summary>
            <div className="px-6 pb-4">
              <p className="text-foreground leading-relaxed">{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

export function DimensionBadges() {
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      <span className="inline-flex items-center gap-2 text-sm text-muted bg-white px-3 py-1.5 rounded-full border border-border">
        <span className="w-2 h-2 rounded-full bg-[#00B922]" />
        12 Personality elements
      </span>
      <span className="inline-flex items-center gap-2 text-sm text-muted bg-white px-3 py-1.5 rounded-full border border-border">
        <span className="w-2 h-2 rounded-full bg-[#0054FF]" />
        24 Values elements
      </span>
      <span className="inline-flex items-center gap-2 text-sm text-muted bg-white px-3 py-1.5 rounded-full border border-border">
        <span className="w-2 h-2 rounded-full bg-[#8A00FF]" />
        12 Meta-Thinking elements
      </span>
    </div>
  );
}

export function ComparisonTable({
  rows,
  yourName = "Opinion DNA",
  competitorName,
}: {
  rows: { label: string; yours: string; theirs: string }[];
  yourName?: string;
  competitorName: string;
}) {
  return (
    <div className="overflow-x-auto mt-8">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-border">
            <th className="text-left py-3 px-4 text-sm font-semibold text-muted" />
            <th className="text-left py-3 px-4 text-sm font-semibold text-primary">{yourName}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">{competitorName}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border">
              <td className="py-3 px-4 text-sm font-medium text-foreground">{row.label}</td>
              <td className="py-3 px-4 text-sm text-foreground">{row.yours}</td>
              <td className="py-3 px-4 text-sm text-muted">{row.theirs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Brand-gradient pricing card, echoing the home page's Pricing section. Drop
 * into `children` of SEOPageLayout near the end of the article.
 */
export function SEOPricingCard({
  heading,
  subheading,
  planName,
  price,
  priceSuffix,
  description,
  features,
  ctaLabel = "Start My Assessment",
  ctaHref = "/signup",
  trustLines = ["30-day money-back guarantee", "Secure payment via Stripe"],
}: {
  heading: string;
  subheading?: string;
  planName: string;
  price: string;
  priceSuffix?: string;
  description?: string;
  features: string[];
  ctaLabel?: string;
  ctaHref?: string;
  trustLines?: string[];
}) {
  return (
    <section className="mt-20 relative py-16 overflow-hidden rounded-2xl">
      <div className="absolute inset-0 -z-10 opacity-30">
        <div
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background:
              "linear-gradient(115deg, #ec4899, #a855f7, #6366f1, #22d3ee, #84cc16, #f97316, #ec4899, #a855f7, #6366f1)",
            backgroundSize: "300% 100%",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 20%, var(--background) 70%)",
          }}
        />
      </div>

      <div className="text-center mb-12 px-6">
        <h2 className="text-2xl md:text-3xl text-black">{heading}</h2>
        {subheading && (
          <p className="mt-4 text-muted max-w-xl mx-auto">{subheading}</p>
        )}
      </div>

      <div className="max-w-sm mx-auto px-6">
        <div className="rounded-xl p-8 bg-primary text-white ring-2 ring-primary shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow">
          <h3 className="text-lg font-bold text-white">{planName}</h3>
          <div className="mt-3">
            <span className="text-4xl font-bold text-white">{price}</span>
            {priceSuffix && (
              <span className="text-sm ml-2 text-white/70">{priceSuffix}</span>
            )}
          </div>
          {description && (
            <p className="mt-2 text-sm text-white/80">{description}</p>
          )}

          <ul className="mt-6 space-y-2.5">
            {features.map((feature) => (
              <li
                key={feature}
                className="text-sm flex items-start gap-2.5 text-white/90"
              >
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          {ctaHref.startsWith("mailto:") || ctaHref.startsWith("http") ? (
            <a
              href={ctaHref}
              className="mt-8 block text-center py-3.5 px-4 rounded-lg font-semibold text-sm transition-colors bg-white text-primary hover:bg-white/90"
            >
              {ctaLabel}
            </a>
          ) : (
            <Link
              href={ctaHref}
              className="mt-8 block text-center py-3.5 px-4 rounded-lg font-semibold text-sm transition-colors bg-white text-primary hover:bg-white/90"
            >
              {ctaLabel}
            </Link>
          )}
        </div>

        {trustLines.length > 0 && (
          <div className="mt-6 text-center space-y-2">
            {trustLines.map((line, i) => (
              <p
                key={i}
                className={`flex items-center justify-center gap-2 ${
                  i === 0 ? "text-sm text-muted" : "text-xs text-muted/60"
                }`}
              >
                {i === 0 && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                )}
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Full-bleed closing CTA mirroring the home page CTA.tsx. Pass this into the
 * SEOPageLayout `afterContent` prop so the gradient actually spans the whole
 * viewport (rather than being capped by the article column).
 */
export function SEOFinalCTA({
  heading,
  subheading,
  ctaLabel = "Start My Assessment — $47",
  ctaHref = "/signup",
  trustLine = "One-time purchase. Lifetime access.",
}: {
  heading: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  trustLine?: string;
}) {
  return (
    <section className="relative mt-20 px-6 py-24 overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "linear-gradient(115deg, #ec4899, #a855f7, #6366f1, #22d3ee, #84cc16, #f97316, #ec4899, #a855f7, #6366f1)",
          backgroundSize: "300% 100%",
          animation: "gradient-shift 25s ease infinite",
          willChange: "background-position",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, var(--background) 0%, transparent 100%)",
        }}
      />
      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl text-black">{heading}</h2>
        {subheading && (
          <p className="mt-4 text-lg text-muted max-w-xl mx-auto">{subheading}</p>
        )}
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center mt-8 px-10 py-4 bg-primary text-white font-bold rounded-lg text-lg hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          {ctaLabel}
        </Link>
        {trustLine && (
          <p className="mt-4 text-sm text-muted">{trustLine}</p>
        )}
      </div>
    </section>
  );
}

export default function SEOPageLayout({
  children,
  afterContent,
  jsonLd,
}: {
  children: React.ReactNode;
  /**
   * Rendered inside <main> but OUTSIDE the max-w-4xl wrapper, so full-bleed
   * sections (like the closing CTA) can span the whole viewport. Anything that
   * fits the article column should stay in `children`.
   */
  afterContent?: React.ReactNode;
  jsonLd?: Record<string, unknown>[];
}) {
  return (
    <>
      {jsonLd?.map((data, i) => <JsonLd key={i} data={data} />)}
      <Header />
      <main className="relative pt-24 pb-16">
        {/* Animated gradient strip — matches Hero */}
        <div className="absolute top-0 left-0 right-0 h-[300px] -z-10 opacity-30 overflow-hidden">
          <div
            className="absolute inset-0 animate-gradient-shift"
            style={{
              background:
                "linear-gradient(115deg, #ec4899, #a855f7, #6366f1, #22d3ee, #84cc16, #f97316, #ec4899, #a855f7, #6366f1)",
              backgroundSize: "300% 100%",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, var(--background) 100%)",
            }}
          />
        </div>
        <div className="max-w-4xl mx-auto px-6">{children}</div>
        {afterContent}
      </main>
      <Footer />
    </>
  );
}
