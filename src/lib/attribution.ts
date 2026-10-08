/**
 * Channel attribution — shared between the client capture component, the auth
 * callback (persists the cookie onto the profile), and the admin metrics module
 * (normalizes a profile's stored attribution into a channel bucket).
 *
 * First-touch model: the first page load that carries a real signal (utm_* or an
 * external referrer) wins and is stored once. We keep things minimal — utm_*,
 * the referrer HOST only (not full URL), and the landing path. The presence of a
 * landing_path marks a user whose attribution was captured, which lets us tell
 * "direct" (captured, no source) apart from "unknown" (never captured / legacy).
 */

export const ATTR_COOKIE = "odna_attr";

/**
 * Referrer hosts that are legs of our OWN flows (Google sign-in, Stripe
 * checkout, Turnstile), never acquisition. A page load arriving from one of
 * these must not create or upgrade the first-touch cookie. Before this list
 * existed, the post-OAuth /dashboard load could record accounts.google.com as
 * a "google" first touch.
 */
const ROUND_TRIP_HOSTS = new Set([
  "accounts.google.com",
  "accounts.youtube.com",
  "checkout.stripe.com",
  "pay.stripe.com",
  "billing.stripe.com",
  "challenges.cloudflare.com",
]);

export function isRoundTripReferrer(host: string): boolean {
  return ROUND_TRIP_HOSTS.has(host.toLowerCase());
}

/**
 * Signed-in app routes. A first page view here is never an acquisition landing
 * (signed-out visitors get bounced to /login by middleware), so the capture
 * component ignores them. Keeps landing_path a public page.
 */
const APP_ROUTE_PREFIXES = [
  "/dashboard",
  "/quiz",
  "/scores",
  "/report",
  "/compare",
  "/settings",
  "/admin",
  "/callback",
];

export function isAppRoute(pathname: string): boolean {
  return APP_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/**
 * Persist attribution only onto accounts created in this window. Older
 * accounts were created before capture (or on another device); writing a
 * later login's cookie onto them would invent a first touch.
 */
export const ATTRIBUTION_FRESH_ACCOUNT_MS = 24 * 3600_000;

export function isFreshAccount(createdAt: string | null | undefined, now = Date.now()): boolean {
  if (!createdAt) return false;
  const t = new Date(createdAt).getTime();
  return Number.isFinite(t) && now - t <= ATTRIBUTION_FRESH_ACCOUNT_MS;
}

/** Compact cookie shape (short keys keep the cookie small). */
export interface AttributionCookie {
  s?: string; // utm_source
  m?: string; // utm_medium
  c?: string; // utm_campaign
  r?: string; // referrer host (android-app referrers: "<package>/<path>")
  lp?: string; // landing path: first public page of the attributed visit
}

export function parseAttributionCookie(raw: string | null | undefined): AttributionCookie | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(decodeURIComponent(raw));
    if (obj && typeof obj === "object") return obj as AttributionCookie;
  } catch {
    /* corrupt cookie — ignore */
  }
  return null;
}

export interface ProfileAttribution {
  utmSource?: string | null;
  utmMedium?: string | null;
  referrer?: string | null;
  landingPath?: string | null;
}

/**
 * Split Google traffic by where it actually came from:
 * - google-search: web search result (www.google.<tld>). Note Gmail's web link
 *   redirector (google.com/url) also reports www.google.com, which is why our
 *   own emails carry utm_* tags (utm wins over referrer).
 * - gmail:         mail.google.com or the Gmail Android app
 * - google-oauth:  accounts.google.com (sign-in round trip; legacy rows only,
 *   new loads from it are ignored by the capture component)
 * - google-other:  any other Google surface, e.g. the Google Android app
 *   (com.google.android.googlequicksearchbox: Discover feed, app search,
 *   Lens), News, Docs
 */
function googleBucket(s: string): string | null {
  // Android app referrers are stored as "<package>/<path>" (see
  // AttributionCapture); everything else is a bare host.
  const [host, ...rest] = s.split("/");
  const path = rest.join("/");
  if (host === "mail.google.com" || host === "com.google.android.gm" || host === "gmail") return "gmail";
  if (host === "accounts.google.com") return "google-oauth";
  if (/^(www\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(host)) return "google-search";
  // The Google app reports ".../https/www.google.com" for an in-app search
  // result; with no path (Discover and other app surfaces, or rows stored
  // before the path was kept) we can't call it search.
  if (host === "com.google.android.googlequicksearchbox" && /^https?\/www\.google\./.test(path))
    return "google-search";
  if (host.includes("google")) return "google-other";
  return null;
}

/** Map a raw source/host string to a known channel bucket, or null if unknown. */
function knownBucket(s: string): string | null {
  if (!s) return null;
  if (s.includes("tiktok")) return "tiktok";
  if (s.includes("instagram") || s === "ig" || s === "l.instagram.com") return "instagram";
  if (s.includes("facebook") || s === "fb" || s === "meta" || s.includes("fb.com")) return "facebook";
  if (s.includes("youtube") || s.includes("youtu.be")) return "youtube";
  if (s.includes("linkedin") || s === "lnkd.in") return "linkedin";
  if (s.includes("twitter") || s === "x" || s === "x.com" || s === "t.co") return "twitter";
  if (s.includes("reddit")) return "reddit";
  const g = googleBucket(s);
  if (g) return g;
  if (s.includes("bing")) return "bing";
  if (s.includes("newsletter") || s === "email") return "email";
  if (s === "invite") return "invite";
  return null;
}

/**
 * Normalize a profile's stored attribution into a single channel bucket.
 * - never captured (all null) → "unknown"
 * - utm_source present → its known bucket, else the raw source verbatim
 *   (utm_medium "referral" or source "referral" → "referral")
 * - else external referrer → its known bucket, else "referral"
 * - else (captured, no signal) → "direct"
 */
export function deriveChannel(p: ProfileAttribution | null | undefined): string {
  if (!p) return "unknown";
  const captured = !!(p.landingPath || p.utmSource || p.referrer);
  if (!captured) return "unknown";

  const src = (p.utmSource || "").toLowerCase().trim();
  const med = (p.utmMedium || "").toLowerCase().trim();
  const refHost = (p.referrer || "").toLowerCase().trim();

  if (src) {
    if (med === "referral" || src === "referral") return "referral";
    if (src === "google") {
      // Tagged Google traffic: paid if the medium says so; otherwise a Google
      // property we tagged ourselves (Business Profile, etc.), not web search.
      if (["cpc", "ppc", "paid", "paidsearch"].includes(med)) return "google-ads";
      return med === "organic" ? "google-search" : "google-other";
    }
    return knownBucket(src) || src;
  }
  if (refHost) {
    return knownBucket(refHost) || "referral";
  }
  return "direct";
}
