import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium"],
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
