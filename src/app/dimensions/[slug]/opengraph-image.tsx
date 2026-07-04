import { getDimensionPage, DIMENSION_LAYERS } from "@/data/seo/dimensions";
import { ELEMENTS } from "@/lib/scoring/elements";
import { renderSeoOgImage, OG_SIZE } from "@/app/og-image-template";

export const runtime = "edge";
export const alt = "Opinion DNA — dimension explained";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getDimensionPage(slug);
  const element = page ? ELEMENTS[page.elementIndex] : undefined;
  const layer = element
    ? DIMENSION_LAYERS.find((l) => l.key === element.dimension)
    : undefined;

  return renderSeoOgImage({
    kicker: layer ? `${layer.label} Dimension` : "Opinion DNA Dimension",
    title: page?.name ?? "The 48 Dimensions",
    subtitle: element?.tooltip,
  });
}
