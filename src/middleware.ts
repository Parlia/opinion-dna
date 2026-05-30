import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const CANONICAL_HOST = "www.opiniondna.com";
// Hosts that must permanently redirect to the canonical www host:
// the retired hyphenated domain and the non-www apex of the live domain.
const REDIRECT_HOSTS = ["opinion-dna.com", "www.opinion-dna.com", "opiniondna.com"];

export async function middleware(request: NextRequest) {
  // Permanent (308) redirect to the canonical www host (preserves path + query string).
  // www is the canonical origin used in metadata, sitemap, and OG tags, so search
  // engines should consolidate all signal there. 308 (not 307) tells crawlers the move
  // is permanent. Redirect straight to www to avoid a double hop (old → apex → www).
  // NOTE: if Vercel is configured to redirect the apex at the edge it returns 307 before
  // this runs — assign opiniondna.com to the project (not "redirect") so this 308 wins.
  const host = request.headers.get("host")?.replace(/:\d+$/, "") ?? "";
  if (REDIRECT_HOSTS.includes(host)) {
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.port = "";
    url.protocol = "https";
    return NextResponse.redirect(url, 308);
  }

  // Catch Supabase OAuth code that lands on wrong path — redirect to /callback
  // Safe: the code is a one-time PKCE token that can only be exchanged once,
  // only by the session that initiated the flow, and expires in minutes.
  // We only forward it — never log, store, or expose it.
  const code = request.nextUrl.searchParams.get("code");
  if (code && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/callback";
    return NextResponse.redirect(url);
  }

  // Supabase session refresh + auth guards
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
