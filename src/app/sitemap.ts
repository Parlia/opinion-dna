import type { MetadataRoute } from "next";
import { competitors, alternativePages } from "@/data/seo/competitors";
import { useCases } from "@/data/seo/use-cases";
import { keywordPages } from "@/data/seo/keywords";
import { dimensionPages } from "@/data/seo/dimensions";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.opiniondna.com";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Product & marketing landing pages
  const productPages: MetadataRoute.Sitemap = [
    "/personal-assessment",
    "/couples",
    "/co-founders",
    "/teams",
    "/friends",
    "/book",
    "/referrals",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Hub pages
  const hubPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/vs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/alternatives`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/for`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tests`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/dimensions`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/methodology`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  // Dimension glossary pages
  const dimPages: MetadataRoute.Sitemap = dimensionPages.map((d) => ({
    url: `${baseUrl}/dimensions/${d.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Comparison pages
  const comparePages: MetadataRoute.Sitemap = competitors.map((c) => ({
    url: `${baseUrl}/vs/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Alternative pages
  const altPages: MetadataRoute.Sitemap = alternativePages.map((a) => ({
    url: `${baseUrl}/alternatives/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Use case pages
  const useCasePages: MetadataRoute.Sitemap = useCases.map((u) => ({
    url: `${baseUrl}/for/${u.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Keyword landing pages
  const kwPages: MetadataRoute.Sitemap = keywordPages.map((p) => ({
    url: `${baseUrl}/tests/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...hubPages, ...dimPages, ...comparePages, ...altPages, ...useCasePages, ...kwPages];
}
