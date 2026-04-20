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

export default function SEOPageLayout({
  children,
  jsonLd,
}: {
  children: React.ReactNode;
  jsonLd?: Record<string, unknown>[];
}) {
  return (
    <>
      {jsonLd?.map((data, i) => <JsonLd key={i} data={data} />)}
      <Header />
      <main className="relative pt-24 pb-16 px-6">
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
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
      <Footer />
    </>
  );
}
