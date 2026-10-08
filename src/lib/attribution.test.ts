import { describe, it, expect } from "vitest";
import {
  deriveChannel,
  isAppRoute,
  isFreshAccount,
  isRoundTripReferrer,
  parseAttributionCookie,
} from "./attribution";

describe("deriveChannel", () => {
  it("returns 'unknown' when nothing was captured (legacy users)", () => {
    expect(deriveChannel(null)).toBe("unknown");
    expect(deriveChannel({})).toBe("unknown");
    expect(
      deriveChannel({ utmSource: null, utmMedium: null, referrer: null, landingPath: null })
    ).toBe("unknown");
  });

  it("returns 'direct' when captured but with no source or referrer", () => {
    expect(deriveChannel({ landingPath: "/" })).toBe("direct");
  });

  it("buckets known utm_source values", () => {
    expect(deriveChannel({ utmSource: "tiktok", landingPath: "/" })).toBe("tiktok");
    expect(deriveChannel({ utmSource: "TikTok_Ads", landingPath: "/" })).toBe("tiktok");
    expect(deriveChannel({ utmSource: "ig", landingPath: "/" })).toBe("instagram");
    expect(deriveChannel({ utmSource: "instagram", landingPath: "/" })).toBe("instagram");
  });

  it("surfaces an unknown named source verbatim", () => {
    expect(deriveChannel({ utmSource: "producthunt", landingPath: "/" })).toBe("producthunt");
  });

  it("treats referral medium/source as 'referral'", () => {
    expect(deriveChannel({ utmSource: "partnerblog", utmMedium: "referral", landingPath: "/" })).toBe(
      "referral"
    );
    expect(deriveChannel({ utmSource: "referral", landingPath: "/" })).toBe("referral");
  });

  it("buckets by external referrer host when there's no utm_source", () => {
    expect(deriveChannel({ referrer: "www.tiktok.com", landingPath: "/" })).toBe("tiktok");
    expect(deriveChannel({ referrer: "t.co", landingPath: "/" })).toBe("twitter");
    expect(deriveChannel({ referrer: "someblog.example.com", landingPath: "/" })).toBe("referral");
  });
});

describe("deriveChannel: Google split", () => {
  it("web search referrers → google-search (any Google ccTLD)", () => {
    expect(deriveChannel({ referrer: "www.google.com", landingPath: "/" })).toBe("google-search");
    expect(deriveChannel({ referrer: "www.google.co.uk", landingPath: "/" })).toBe("google-search");
    expect(deriveChannel({ referrer: "google.com.au", landingPath: "/" })).toBe("google-search");
    expect(deriveChannel({ referrer: "www.google.de", landingPath: "/" })).toBe("google-search");
  });

  it("Gmail (web or Android app) → gmail", () => {
    expect(deriveChannel({ referrer: "mail.google.com", landingPath: "/" })).toBe("gmail");
    expect(deriveChannel({ referrer: "com.google.android.gm", landingPath: "/" })).toBe("gmail");
    expect(deriveChannel({ utmSource: "gmail", landingPath: "/" })).toBe("gmail");
  });

  it("the Google sign-in round trip → google-oauth (legacy rows only)", () => {
    expect(deriveChannel({ referrer: "accounts.google.com", landingPath: "/dashboard" })).toBe(
      "google-oauth"
    );
  });

  it("other Google surfaces → google-other; Google app search with a path → google-search", () => {
    expect(
      deriveChannel({ referrer: "com.google.android.googlequicksearchbox", landingPath: "/" })
    ).toBe("google-other");
    expect(
      deriveChannel({
        referrer: "com.google.android.googlequicksearchbox/https/www.google.com",
        landingPath: "/",
      })
    ).toBe("google-search");
    expect(deriveChannel({ referrer: "news.google.com", landingPath: "/" })).toBe("google-other");
    expect(deriveChannel({ referrer: "docs.google.com", landingPath: "/" })).toBe("google-other");
  });

  it("utm-tagged Google traffic is never counted as organic search unless it says so", () => {
    expect(deriveChannel({ utmSource: "google", utmMedium: "cpc", landingPath: "/" })).toBe("google-ads");
    expect(deriveChannel({ utmSource: "google", landingPath: "/" })).toBe("google-other");
    expect(deriveChannel({ utmSource: "google", utmMedium: "organic", landingPath: "/" })).toBe(
      "google-search"
    );
  });

  it("utm wins over a Google referrer (invite emails clicked in Gmail web)", () => {
    expect(
      deriveChannel({ utmSource: "invite", utmMedium: "email", referrer: "www.google.com", landingPath: "/signup" })
    ).toBe("invite");
  });

  it("YouTube is still YouTube, not google-other", () => {
    expect(deriveChannel({ referrer: "www.youtube.com", landingPath: "/" })).toBe("youtube");
    expect(deriveChannel({ referrer: "com.google.android.youtube", landingPath: "/" })).toBe("youtube");
  });
});

describe("round trips, app routes, fresh accounts", () => {
  it("treats our own sign-in and checkout legs as round trips", () => {
    expect(isRoundTripReferrer("accounts.google.com")).toBe(true);
    expect(isRoundTripReferrer("checkout.stripe.com")).toBe(true);
    expect(isRoundTripReferrer("www.google.com")).toBe(false);
    expect(isRoundTripReferrer("mail.google.com")).toBe(false);
  });

  it("recognizes signed-in app routes, not public lookalikes", () => {
    expect(isAppRoute("/dashboard")).toBe(true);
    expect(isAppRoute("/compare/abc")).toBe(true);
    expect(isAppRoute("/couples")).toBe(false);
    expect(isAppRoute("/reports-guide")).toBe(false);
    expect(isAppRoute("/")).toBe(false);
  });

  it("only accounts created in the last 24h are fresh", () => {
    const now = Date.parse("2026-10-08T12:00:00Z");
    expect(isFreshAccount("2026-10-08T11:59:00Z", now)).toBe(true);
    expect(isFreshAccount("2026-10-07T12:30:00Z", now)).toBe(true);
    expect(isFreshAccount("2026-10-07T11:00:00Z", now)).toBe(false);
    expect(isFreshAccount("2026-04-30T10:00:00Z", now)).toBe(false);
    expect(isFreshAccount(null, now)).toBe(false);
    expect(isFreshAccount("garbage", now)).toBe(false);
  });
});

describe("parseAttributionCookie", () => {
  it("round-trips an encoded cookie", () => {
    const raw = encodeURIComponent(JSON.stringify({ s: "tiktok", lp: "/" }));
    expect(parseAttributionCookie(raw)).toEqual({ s: "tiktok", lp: "/" });
  });

  it("returns null for missing or corrupt input", () => {
    expect(parseAttributionCookie(null)).toBeNull();
    expect(parseAttributionCookie("")).toBeNull();
    expect(parseAttributionCookie("not-json")).toBeNull();
  });
});
