import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Opinion DNA <noreply@opiniondna.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export async function sendInviteEmail(
  to: string,
  fromName: string,
  token: string
) {
  const acceptUrl = `${APP_URL}/api/invite/accept?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${fromName} invited you to compare Opinion DNA results`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">
          You&rsquo;ve been invited
        </h1>
        <p style="font-size: 16px; color: #666; line-height: 1.5; margin-bottom: 24px;">
          <strong>${fromName}</strong> has taken the Opinion DNA assessment and wants to compare results with you.
        </p>
        <p style="font-size: 16px; color: #666; line-height: 1.5; margin-bottom: 32px;">
          Opinion DNA maps your personality, values, and meta-thinking across 48 dimensions. Take your own assessment ($47) and see how your minds compare.
        </p>
        <a href="${acceptUrl}" style="display: inline-block; padding: 14px 28px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 12px; font-weight: 500; font-size: 16px;">
          Accept Invitation
        </a>
        <p style="font-size: 13px; color: #999; margin-top: 32px; line-height: 1.4;">
          This invitation expires in 30 days. If you didn&rsquo;t expect this email, you can safely ignore it.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send invite email:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}
