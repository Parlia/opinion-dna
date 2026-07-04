import { keywordPages } from "@/data/seo/keywords";
import { renderSeoOgImage, OG_SIZE } from "@/app/og-image-template";

export const runtime = "edge";
export const alt = "Opinion DNA — personality test guide";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = keywordPages.find((p) => p.slug === slug);

  return renderSeoOgImage({
    kicker: "Personality Test Guide",
    title: page?.title ?? "Personality Tests",
  });
}
