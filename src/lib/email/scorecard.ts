import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "Opinion DNA <noreply@opiniondna.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export type ReportRelationshipType = "cofounders" | "couples" | "friends";

const TYPE_COPY: Record<
  ReportRelationshipType,
  { title: string; subject: (name: string) => string; preamble: string; shareNote: (name: string) => string }
> = {
  cofounders: {
    title: "Co-Founder Compatibility Report",
    subject: (partnerName) =>
      `Your Co-Founder Compatibility Report with ${partnerName} is ready`,
    preamble:
      "Open the full report together. It includes your alignment map, friction points with mitigation strategies, and specific conversations to have before you commit.",
    shareNote: (partnerName) =>
      `This report is shared between you and ${partnerName}. For the best experience, sit down together when you read it.`,
  },
  couples: {
    title: "Couples Compatibility Report",
    subject: (partnerName) =>
      `Your Couples Compatibility Report with ${partnerName} is ready`,
    preamble:
      "Open the full report together. It's a structured mirror for two minds — your chemistry signature, where you click, where you diverge, and concrete conversations and rituals tailored to your specific pair.",
    shareNote: (partnerName) =>
      `This report is shared between you and ${partnerName}. Read it together, and let it start conversations rather than end them.`,
  },
  friends: {
    title: "Friendship Comparison Report",
    subject: (partnerName) => `Your Friendship Report with ${partnerName} is ready`,
    preamble:
      "Open the full report together. It maps what makes your friendship tick — where you click, where you'll playfully butt heads, and conversation prompts tailored to your specific pair.",
    shareNote: (partnerName) =>
      `This report is shared between you and ${partnerName}. Grab a coffee, open it together, and see what rings true.`,
  },
};

/**
 * Send the scorecard email when a comparison report is ready.
 *
 * For paid reports (couples, cofounders) we include the compatibility score
 * and the standard scorecard. For the Friends report — per the content brief —
 * we do NOT display a compatibility score. We just invite them to open the report.
 */
export async function sendScorecardEmail(
  to: string,
  partnerName: string,
  reportId: string,
  compatibilityScore: number,
  label: string,
  topStrengths: string[],
  topFriction: string,
  relationshipType: ReportRelationshipType = "cofounders"
) {
  const safePartner = escapeHtml(partnerName);
  const reportUrl = `${APP_URL}/compare/${reportId}`;
  const copy = TYPE_COPY[relationshipType];
  const showScore = relationshipType !== "friends";

  const strengthsHtml = topStrengths
    .slice(0, 3)
    .map((s) => `<li style="margin-bottom: 4px; color: #1a7a3a;">${escapeHtml(s)}</li>`)
    .join("");

  const scoreBlock = showScore
    ? `
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 64px; font-weight: 700; color: #6F00FF; line-height: 1;">
            ${compatibilityScore}
          </div>
          <div style="font-size: 14px; color: #666; margin-top: 8px;">
            ${escapeHtml(label)}
          </div>
        </div>`
    : "";

  const strengthsBlock =
    topStrengths.length > 0 && showScore
      ? `
        <p style="font-size: 14px; color: #666; margin-bottom: 4px; font-weight: 600;">
          Where you align:
        </p>
        <ul style="font-size: 14px; line-height: 1.6; padding-left: 20px; margin-bottom: 16px;">
          ${strengthsHtml}
        </ul>`
      : "";

  const frictionBlock =
    topFriction && topFriction !== "No significant gaps" && showScore
      ? `
        <p style="font-size: 14px; color: #D2691E; margin-bottom: 24px;">
          <strong>#1 area to discuss:</strong> ${escapeHtml(topFriction)}
        </p>`
      : "";

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: copy.subject(partnerName),
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        ${scoreBlock}

        <h1 style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">
          Your ${escapeHtml(copy.title)} with ${safePartner} is ready
        </h1>

        ${strengthsBlock}
        ${frictionBlock}

        <p style="font-size: 15px; color: #666; margin-bottom: 24px;">
          ${copy.preamble}
        </p>

        <a href="${reportUrl}" style="display: inline-block; padding: 14px 28px; background-color: #6F00FF; color: white; text-decoration: none; border-radius: 12px; font-weight: 500; font-size: 16px;">
          Open Your Report Together
        </a>

        <p style="font-size: 12px; color: #999; margin-top: 32px; line-height: 1.4;">
          ${copy.shareNote(partnerName)}
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send scorecard email:", error);
    // Don't throw — email failure shouldn't block report generation
  }
}
