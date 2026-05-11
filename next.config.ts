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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              // auth.opiniondna.com routes to Supabase via custom domain; *.supabase.co kept
              // during cutover as a safety net and can be removed once we're confident no
              // code paths still call the canonical URL (see opinion-dna.md memory: 2026-05-11
              // custom domain cutover). The wildcard does NOT match auth.opiniondna.com.
              "connect-src 'self' https://auth.opiniondna.com https://*.supabase.co https://api.stripe.com https://checkout.stripe.com https://va.vercel-scripts.com",
              "frame-src https://js.stripe.com",
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
