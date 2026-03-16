import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useCases } from "@/data/seo/use-cases";
import SEOPageLayout, {
  Breadcrumbs,
  DimensionBadges,
  SEOPageCTA,
  SEOPageFAQ,
} from "@/components/seo/SEOPageLayout";

export function generateStaticParams() {
  return useCases.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const useCase = useCases.find((u) => u.slug === slug);
  if (!useCase) return {};

  return {
    title: useCase.metaTitle,
    description: useCase.description,
    alternates: { canonical: `https://opiniondna.com/for/${slug}` },
    openGraph: { title: useCase.metaTitle, description: useCase.description, url: `https://opiniondna.com/for/${slug}` },
  };
}

export default async function UseCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const useCase = useCases.find((u) => u.slug === slug);
  if (!useCase) notFound();

  return (
    <SEOPageLayout>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Use Cases", href: "/for" },
          { label: useCase.title },
        ]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        {useCase.headline}
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        {useCase.subheadline}
      </p>
      <DimensionBadges />

      <section className="mt-12">
        <p className="text-foreground leading-relaxed text-lg">
          {useCase.introduction}
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl text-black mb-8">
          Why Opinion DNA for {useCase.title.toLowerCase().replace("personality test for ", "").replace("personality assessment for ", "")}
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {useCase.benefits.map((benefit, i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-6">
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
          Key dimensions for this use case
        </h2>
        <p className="text-muted mb-6">
          Opinion DNA measures 48 dimensions. These are particularly relevant:
        </p>
        <div className="flex flex-wrap gap-2">
          {useCase.dimensions.map((dim) => (
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
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">1</span>
            <div>
              <p className="font-semibold text-black">Take the assessment</p>
              <p className="text-sm text-muted">179 questions, 10-15 minutes. Auto-saves your progress.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">2</span>
            <div>
              <p className="font-semibold text-black">Get your 48-dimension profile</p>
              <p className="text-sm text-muted">Scores across personality, values, and meta-thinking with population comparisons.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-sm">3</span>
            <div>
              <p className="font-semibold text-black">Read your AI-generated report</p>
              <p className="text-sm text-muted">Personalized insights covering life, career, and relationships — unique to your profile.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="mt-12">
        <h3 className="text-lg text-muted mb-3">Other use cases</h3>
        <div className="flex flex-wrap gap-2">
          {useCases
            .filter((u) => u.slug !== slug)
            .map((u) => (
              <Link
                key={u.slug}
                href={`/for/${u.slug}`}
                className="text-sm px-3 py-1.5 bg-white border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
              >
                {u.title.replace("Personality Test for ", "").replace("Personality Assessment for ", "").replace(" Test", "")}
              </Link>
            ))}
        </div>
      </section>

      <SEOPageFAQ items={useCase.faq} pageUrl={`/for/${slug}`} />
      <SEOPageCTA />
    </SEOPageLayout>
  );
}
