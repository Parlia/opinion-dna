import { NextRequest, NextResponse } from "next/server";
import { buildPdfHtml } from "@/lib/report/pdf-template";

export async function POST(request: NextRequest) {
  const { content, scores } = await request.json();

  if (!content) {
    return NextResponse.json({ error: "No content" }, { status: 400 });
  }

  const html = buildPdfHtml(content, scores || []);

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
