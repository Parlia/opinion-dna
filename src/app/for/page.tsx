import type { Metadata } from "next";
import Link from "next/link";
import { useCases } from "@/data/seo/use-cases";
import SEOPageLayout, {
  Breadcrumbs,
  SEOPageCTA,
} from "@/components/seo/SEOPageLayout";

export const metadata: Metadata = {
  title: "Opinion DNA Use Cases — Personal Growth, Coaching, Teams & More",
  description:
    "Discover how Opinion DNA's 48-dimension assessment is used for personal growth, life coaching, couples, career development, teams, and values alignment.",
  alternates: { canonical: "https://www.opiniondna.com/for" },
};

export default function UseCasesHubPage() {
  return (
    <SEOPageLayout>
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Use Cases" }]}
      />

      <h1 className="text-3xl md:text-4xl lg:text-5xl text-black leading-tight">
        48 dimensions, countless applications
      </h1>
      <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
        Opinion DNA maps personality, values, and meta-thinking — and those
        insights apply to every area of your life.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mt-12">
        {useCases.map((useCase) => (
          <Link
            key={useCase.slug}
            href={`/for/${useCase.slug}`}
            className="bg-white rounded-xl border border-border p-6 hover:border-primary hover:shadow-md transition-all group"
          >
            <h2 className="text-lg text-black group-hover:text-primary transition-colors">
              {useCase.title}
            </h2>
            <p className="mt-2 text-sm text-muted line-clamp-3">
              {useCase.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {useCase.dimensions.slice(0, 3).map((dim) => (
                <span key={dim} className="text-xs text-muted bg-beige-light px-2 py-0.5 rounded">
                  {dim}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <SEOPageCTA />
    </SEOPageLayout>
  );
}
