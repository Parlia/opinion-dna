import { NextResponse } from "next/server";

// Known-weak: resets on cold start and each serverless instance keeps its own
// map, so a determined attacker can bypass by spraying requests across
// instances. Guards against rapid button-mashing, not sustained abuse. Swap to
// Upstash Redis (or equivalent) when abuse signals warrant it.
const hits = new Map<string, { count: number; resetAt: number }>();

/** Simple in-memory rate limiter. Returns a 429 response if limit is exceeded, or null if allowed. */
export function rateLimit(
  key: string,
  { limit = 10, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): NextResponse | null {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count++;
  if (entry.count > limit) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } }
    );
  }

  return null;
}
