import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const OLD_HOSTS = ["opinion-dna.com", "www.opinion-dna.com"];

export async function middleware(request: NextRequest) {
  // 301 redirect old domain → new domain (preserves path + query string)
  const host = request.headers.get("host")?.replace(/:\d+$/, "") ?? "";
  if (OLD_HOSTS.includes(host)) {
    const url = request.nextUrl.clone();
    url.host = "opiniondna.com";
    url.port = "";
    url.protocol = "https";
    return NextResponse.redirect(url, 301);
  }

  // Supabase session refresh + auth guards
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
