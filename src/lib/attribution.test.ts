import { describe, it, expect } from "vitest";
import { deriveChannel, parseAttributionCookie } from "./attribution";

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
