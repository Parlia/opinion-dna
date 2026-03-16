import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildPdfHtml } from "@/lib/report/pdf-template";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, scores } = await request.json();

  if (!content) {
    return NextResponse.json({ error: "No content" }, { status: 400 });
  }

  const html = buildPdfHtml(content, scores || []);

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
