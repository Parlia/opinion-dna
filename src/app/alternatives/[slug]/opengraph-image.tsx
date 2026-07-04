import { alternativePages } from "@/data/seo/competitors";
import { renderSeoOgImage, OG_SIZE } from "@/app/og-image-template";

export const runtime = "edge";
export const alt = "Opinion DNA — alternatives guide";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = alternativePages.find((a) => a.slug === slug);

  return renderSeoOgImage({
    kicker: "Alternatives Guide",
    title: page?.title ?? "Personality Test Alternatives",
  });
}
