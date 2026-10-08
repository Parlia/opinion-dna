import type { NextConfig } from "next";

// Old URLs Googlebot still requests. The retired Webflow site on opinion-dna.com
// had /diagnostic and /complete-diagnostic (archived Feb 2026); middleware
// 308s that host to www.opiniondna.com with the path intact, which then 404'd.
// The root-level *-alternatives paths cover links and guesses that drop the
// /alternatives/ segment.
const ALTERNATIVE_SLUGS = [
  "16personalities-alternatives",
  "myers-briggs-alternatives",
  "enneagram-alternatives",
  "big-five-alternatives",
  "truity-alternatives",
  "disc-alternatives",
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium"],
  async redirects() {
    return [
      { source: "/diagnostic", destination: "/personal-assessment", statusCode: 301 },
      { source: "/complete-diagnostic", destination: "/personal-assessment", statusCode: 301 },
      ...ALTERNATIVE_SLUGS.map((slug) => ({
        source: `/${slug}`,
        destination: `/alternatives/${slug}`,
        statusCode: 301 as const,
      })),
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://va.vercel-scripts.com https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              // Supabase is reached exclusively via the auth.opiniondna.com custom domain.
              // The legacy https://*.supabase.co wildcard was removed after the 2026-05-11
              // cutover proved stable (no code paths call the canonical *.supabase.co URL).
              // challenges.cloudflare.com — Cloudflare Turnstile (Supabase Auth bot protection).
              "connect-src 'self' https://auth.opiniondna.com https://api.stripe.com https://checkout.stripe.com https://va.vercel-scripts.com https://challenges.cloudflare.com",
              "frame-src https://js.stripe.com https://challenges.cloudflare.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
