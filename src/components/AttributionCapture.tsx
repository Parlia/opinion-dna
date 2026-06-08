"use client";

import { useEffect } from "react";
import { ATTR_COOKIE } from "@/lib/attribution";

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * First-touch channel attribution. On the first hard page load, record utm_*
 * params and the external referrer host into a first-party cookie. SameSite=Lax
 * so it survives the top-level redirect back from Google OAuth. The auth
 * callback reads this cookie and persists it onto the profile exactly once.
 *
 * Upgrade rule: keep the first ATTRIBUTED touch. If the stored cookie has no
 * source/referrer (a prior "direct" visit) and this load does carry a signal,
 * overwrite it; otherwise leave the existing value alone.
 *
 * Renders nothing and never throws — attribution must not affect the page.
 */
export function AttributionCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utmSource = (params.get("utm_source") || "").slice(0, 120);
      const utmMedium = (params.get("utm_medium") || "").slice(0, 120);
      const utmCampaign = (params.get("utm_campaign") || "").slice(0, 160);

      let refHost = "";
      if (document.referrer) {
        try {
          refHost = new URL(document.referrer).hostname.toLowerCase();
        } catch {
          /* malformed referrer — ignore */
        }
      }
      const internalRef = !refHost || refHost.endsWith("opiniondna.com");
      const candidateHasSignal = !!utmSource || (!!refHost && !internalRef);

      // Inspect any existing cookie to honor first-attributed-touch.
      const existing = document.cookie
        .split(/;\s*/)
        .find((c) => c.startsWith(ATTR_COOKIE + "="));
      if (existing) {
        try {
          const ex = JSON.parse(decodeURIComponent(existing.slice(ATTR_COOKIE.length + 1)));
          const exHasSignal = !!(ex && (ex.s || ex.r));
          if (exHasSignal || !candidateHasSignal) return; // keep existing
        } catch {
          /* corrupt cookie — fall through and overwrite */
        }
      }

      const data = {
        s: utmSource,
        m: utmMedium,
        c: utmCampaign,
        r: internalRef ? "" : refHost.slice(0, 120),
        lp: window.location.pathname.slice(0, 200),
      };
      document.cookie = `${ATTR_COOKIE}=${encodeURIComponent(
        JSON.stringify(data)
      )}; path=/; max-age=${MAX_AGE}; samesite=lax`;
    } catch {
      /* never break the page over attribution */
    }
  }, []);

  return null;
}
