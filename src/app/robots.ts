import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/quiz", "/scores", "/report", "/compare", "/settings"],
      },
    ],
    sitemap: "https://opiniondna.com/sitemap.xml",
  };
}
