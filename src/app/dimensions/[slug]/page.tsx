import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { dimensionPages, getDimensionPage, DIMENSION_LAYERS } from "@/data/seo/dimensions";
import { ELEMENTS } from "@/lib/scoring/elements";
import SEOPageLayout, {
  articleJsonLd,
  Breadcrumbs,
  SEOPageCTA,
  SEOPageFAQ,
} from "@/components/seo/SEOPageLayout";

export function generateStaticParams() {
  return dimensionPages.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getDimensionPage(slug);
  if (!page) return {};

  return {
    title: page.metaTitle,
    description: page.description,
    alternates: { canonical: `https://www.opiniondna.com/dimensions/${slug}` },
    openGraph: {
      title: page.metaTitle,
      description: page.description,
      url: `https://www.opiniondna.com/dimensions/${slug}`,
    },
  };
}

export default async function DimensionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getDimensionPage(slug);
  if (!page) notFound();

  const element = ELEMENTS[page.elementIndex];
  const layer = DIMENSION_LAYERS.find((l) => l.key === element.dimension)!;
  const relatedPages = page.related
    .map((s) => getDimensionPage(s))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  return (
    <SEOPageLayout
      jsonLd={[
        articleJsonLd({
          headline: page.metaTitle,
          description: page.description,
          path: `/dimensions/${slug}`,
        }),
      ]}
    >
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Dimensions", href: "/dimensions" },
          { label: page.name },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span
          className="inline-flex items-center gap-2 text-sm text-muted bg-white px-3 py-1.5 rounded-full border border-border"
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
          {layer.label} &middot; {element.category}
        </span>
      </div>

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        {page.headline}
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        {page.subheadline}
      </p>

      <section className="mt-10">
        <p className="text-foreground leading-relaxed">{page.introduction}</p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl md:text-3xl text-black mb-4">
          What {page.name} measures
        </h2>
        <p className="text-foreground leading-relaxed">{page.whatItMeasures}</p>
      </section>

      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
          <h3 className="text-xl text-black mb-3">
            <span className="text-[#00B922] mr-2">&#9650;</span>
            High {page.name}
          </h3>
          <p className="text-foreground leading-relaxed">{page.highScore}</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
          <h3 className="text-xl text-black mb-3">
            <span className="text-[#0054FF] mr-2">&#9660;</span>
            Low {page.name}
          </h3>
          <p className="text-foreground leading-relaxed">{page.lowScore}</p>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl text-black mb-6">
          Where {page.name} shows up in your life
        </h2>
        <div className="space-y-6">
          {page.inLife.map((item, i) => (
            <div key={i}>
              <h3 className="text-lg font-semibold text-black mb-1">{item.title}</h3>
              <p className="text-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 bg-white rounded-2xl border border-border p-6 md:p-8">
        <h2 className="text-xl text-black mb-3">How Opinion DNA measures it</h2>
        <p className="text-foreground leading-relaxed">
          {page.name} is one of the {layer.label === "Values" ? "24" : "12"}{" "}
          {layer.label} dimensions in your Opinion DNA profile. You receive a
          continuous 0&ndash;100 score &mdash; not a type or a label &mdash;
          benchmarked against the population average, and your AI-generated
          personal report explains what your specific combination of scores
          means for your life, relationships, and career.
        </p>
      </section>

      <section className="mt-12">
        <h3 className="text-lg text-muted mb-3">Related dimensions</h3>
        <div className="flex flex-wrap gap-2">
          {relatedPages.map((r) => (
            <Link
              key={r.slug}
              href={`/dimensions/${r.slug}`}
              className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
            >
              {r.name}
            </Link>
          ))}
          <Link
            href="/dimensions"
            className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
          >
            All 48 dimensions &rarr;
          </Link>
        </div>
      </section>

      <SEOPageFAQ items={page.faq} pageUrl={`/dimensions/${slug}`} />
      <SEOPageCTA />
    </SEOPageLayout>
  );
}
