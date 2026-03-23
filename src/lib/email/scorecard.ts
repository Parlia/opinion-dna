import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "Opinion DNA <noreply@opiniondna.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Send the scorecard email to both co-founders when their comparison report is ready.
 * Teases the top 3 alignment strengths and #1 friction point.
 */
export async function sendScorecardEmail(
  to: string,
  partnerName: string,
  reportId: string,
  compatibilityScore: number,
  label: string,
  topStrengths: string[],
  topFriction: string
) {
  const safePartner = escapeHtml(partnerName);
  const reportUrl = `${APP_URL}/compare/${reportId}`;

  const strengthsHtml = topStrengths.slice(0, 3)
    .map(s => `<li style="margin-bottom: 4px; color: #1a7a3a;">${escapeHtml(s)}</li>`)
    .join("");

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your Co-Founder Compatibility Report is ready (Score: ${compatibilityScore})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 64px; font-weight: 700; color: #6F00FF; line-height: 1;">
            ${compatibilityScore}
          </div>
          <div style="font-size: 14px; color: #666; margin-top: 8px;">
            ${escapeHtml(label)}
          </div>
        </div>

        <h1 style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">
          Your comparison with ${safePartner} is ready
        </h1>

        <p style="font-size: 14px; color: #666; margin-bottom: 4px; font-weight: 600;">
          Where you align:
        </p>
        <ul style="font-size: 14px; line-height: 1.6; padding-left: 20px; margin-bottom: 16px;">
          ${strengthsHtml}
        </ul>

        <p style="font-size: 14px; color: #D2691E; margin-bottom: 24px;">
          <strong>#1 area to discuss:</strong> ${escapeHtml(topFriction)}
        </p>

        <p style="font-size: 15px; color: #666; margin-bottom: 24px;">
          Open the full report together. It includes your alignment map, friction points with mitigation strategies, and specific conversations to have before you commit.
        </p>

        <a href="${reportUrl}" style="display: inline-block; padding: 14px 28px; background-color: #6F00FF; color: white; text-decoration: none; border-radius: 12px; font-weight: 500; font-size: 16px;">
          Open Your Report Together
        </a>

        <p style="font-size: 12px; color: #999; margin-top: 32px; line-height: 1.4;">
          This report is shared between you and ${safePartner}. For the best experience, sit down together when you read it.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send scorecard email:", error);
    // Don't throw — email failure shouldn't block report generation
  }
}
