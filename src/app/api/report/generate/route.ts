import { NextResponse } from "next/server";
import https from "node:https";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildSystemPrompt, buildUserPrompt, buildCoverSection, buildPart1Tables } from "@/lib/report/prompt";
import { PARLIA_AVERAGES } from "@/lib/scoring/elements";
import { hasPurchase } from "@/lib/auth/require-purchase";
import { rateLimit } from "@/lib/auth/rate-limit";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Streaming call to Anthropic API — keeps connection alive to avoid VPN/proxy timeouts
function callClaude(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 16000,
      stream: true,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const req = https.request(
      {
        hostname: "api.anthropic.com",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-length": Buffer.byteLength(body),
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          let errorData = "";
          res.on("data", (chunk) => (errorData += chunk));
          res.on("end", () => {
            reject(new Error(`Anthropic API error ${res.statusCode}: ${errorData}`));
          });
          return;
        }

        let fullText = "";
        let buffer = "";

        res.on("data", (chunk) => {
          buffer += chunk.toString();

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const event = JSON.parse(data);
              if (event.type === "content_block_delta" && event.delta?.text) {
                fullText += event.delta.text;
              }
            } catch {
              // Skip unparseable lines
            }
          }
        });

        res.on("end", () => {
          resolve(fullText);
        });
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(`report:${user.id}`, { limit: 3, windowMs: 3600_000 });
  if (limited) return limited;

  if (!(await hasPurchase(user.id))) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  const { data: userScores } = await supabase
    .from("user_scores")
    .select("scores")
    .eq("user_id", user.id)
    .single();

  if (!userScores) {
    return NextResponse.json({ error: "No scores found" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: report } = await admin
    .from("reports")
    .insert({
      user_id: user.id,
      type: "personal",
      status: "generating",
      scores_snapshot: userScores.scores,
    })
    .select("id")
    .single();

  if (!report) {
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }

  try {
    const userName = user.user_metadata?.full_name || "the individual";
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(
      userName,
      userScores.scores,
      PARLIA_AVERAGES,
      1500 // Parlia dataset size
    );

    const aiContent = await callClaude(
      process.env.ANTHROPIC_API_KEY!,
      systemPrompt,
      userPrompt
    );

    // Prepend static cover page + Part 1 (code-generated, not AI-generated)
    const coverSection = buildCoverSection(userName);
    const part1Section = buildPart1Tables(userScores.scores, PARLIA_AVERAGES);

    // Append static closing section
    const whatNow = `

---

## What Now?

This report is a snapshot. The elements it describes are stable, but how you respond to them can change.

Three things worth doing with this information:

**Sit with what surprised you.** The elements that feel wrong or uncomfortable are often the most revealing. Resistance to a score is itself data about how your mind works.

**Share it with someone who knows you well.** A partner, a close friend, a colleague. Their reaction to your profile will tell you something the numbers can't: how the person you think you are compares to the person others experience.

**Come back to it.** Not to retake the assessment (your scores won't change much), but to reread the insights after a few weeks. The things that seemed obvious now may land differently when you're in the middle of a difficult conversation, a career decision, or a moment of friction with someone you love.

Your Opinion DNA is yours. It's the map to your mental territory. The more fluently you can read it, the better you'll navigate everything that matters.

---

*The Opinion DNA was designed in consultation with academic psychologists and behavioral scientists from the universities of Royal Holloway, Oxford, Cambridge, University of Pennsylvania, City University, and NYU.*

*opiniondna.com*`;

    const content = coverSection + "\n\n---\n\n" + part1Section + "\n\n---\n\n" + aiContent + whatNow;

    await admin
      .from("reports")
      .update({
        content,
        status: "completed",
      })
      .eq("id", report.id);

    return NextResponse.json({ reportId: report.id, status: "completed" });
  } catch (error) {
    console.error("Report generation failed:", error);
    await admin
      .from("reports")
      .update({ status: "failed" })
      .eq("id", report.id);

    return NextResponse.json({ reportId: report.id, status: "failed" }, { status: 500 });
  }
}
