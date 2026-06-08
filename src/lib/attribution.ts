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

/** Compact cookie shape (short keys keep the cookie small). */
export interface AttributionCookie {
  s?: string; // utm_source
  m?: string; // utm_medium
  c?: string; // utm_campaign
  r?: string; // referrer host
  lp?: string; // landing path
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
  if (s.includes("google")) return "google";
  if (s.includes("bing")) return "bing";
  if (s.includes("newsletter") || s === "email") return "email";
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
    return knownBucket(src) || src;
  }
  if (refHost) {
    return knownBucket(refHost) || "referral";
  }
  return "direct";
}
