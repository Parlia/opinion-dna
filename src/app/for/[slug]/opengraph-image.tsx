import { useCases } from "@/data/seo/use-cases";
import { renderSeoOgImage, OG_SIZE } from "@/app/og-image-template";

export const runtime = "edge";
export const alt = "Opinion DNA — use case";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const useCase = useCases.find((u) => u.slug === slug);

  return renderSeoOgImage({
    kicker: "Opinion DNA For",
    title: useCase?.title ?? "Opinion DNA Use Cases",
  });
}
