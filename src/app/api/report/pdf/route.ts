import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildPdfHtml } from "@/lib/report/pdf-template";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: report } = await supabase
    .from("reports")
    .select("id, content, pdf_url, scores_snapshot")
    .eq("user_id", user.id)
    .eq("type", "personal")
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!report || !report.content) {
    return NextResponse.json({ error: "No report found" }, { status: 404 });
  }

  // If PDF already generated, redirect to it
  if (report.pdf_url) {
    return NextResponse.redirect(report.pdf_url);
  }

  // Build self-contained HTML from markdown + scores
  const html = buildPdfHtml(report.content, report.scores_snapshot || []);

  // Launch headless Chromium
  const isDev = process.env.NODE_ENV === "development";
  const executablePath = isDev
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : await chromium.executablePath();

  const browser = await puppeteer.launch({
    args: isDev ? [] : chromium.args,
    defaultViewport: { width: 1280, height: 900 },
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const dateStr = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "4mm", bottom: "12mm", left: "0", right: "0" },
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `
        <div style="width:100%;font-size:8px;color:#999;font-family:system-ui,-apple-system,Helvetica,Arial,sans-serif;padding:0 18mm;display:flex;justify-content:space-between;">
          <span>${dateStr} &nbsp;&middot;&nbsp; opiniondna.com</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
    });

    // Upload to Supabase Storage
    const admin = createAdminClient();
    const fileName = `reports/${user.id}/${report.id}.pdf`;

    const { error: uploadError } = await admin.storage
      .from("pdfs")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (!uploadError) {
      const { data: urlData } = admin.storage
        .from("pdfs")
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        await admin
          .from("reports")
          .update({ pdf_url: urlData.publicUrl })
          .eq("id", report.id);
      }
    } else {
      console.error("PDF storage upload failed:", uploadError);
    }

    // Return the PDF directly regardless of storage success
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="opinion-dna-report.pdf"',
      },
    });
  } finally {
    await browser.close();
  }
}
