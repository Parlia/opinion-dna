import { competitors } from "@/data/seo/competitors";
import { renderSeoOgImage, OG_SIZE } from "@/app/og-image-template";

export const runtime = "edge";
export const alt = "Opinion DNA — head-to-head test comparison";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const competitor = competitors.find((c) => c.slug === slug);

  return renderSeoOgImage({
    kicker: "Head-to-Head Comparison",
    title: competitor
      ? `Opinion DNA vs ${competitor.shortName}`
      : "Compare Personality Tests",
    subtitle: "Which assessment is right for you?",
  });
}
