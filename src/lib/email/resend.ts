import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Opinion DNA <noreply@opiniondna.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function sendInviteEmail(
  to: string,
  fromName: string,
  token: string
) {
  const safeName = escapeHtml(fromName);
  const acceptUrl = `${APP_URL}/api/invite/accept?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${safeName} invited you to compare Opinion DNA results`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">
          You&rsquo;ve been invited
        </h1>
        <p style="font-size: 16px; color: #666; line-height: 1.5; margin-bottom: 24px;">
          <strong>${safeName}</strong> has taken the Opinion DNA assessment and wants to compare results with you.
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

/**
 * Lifecycle emails below are best-effort: they log failures but never throw,
 * so an email outage can never block auth, quiz submission, or report
 * delivery.
 */

const CTA_STYLE =
  "display: inline-block; padding: 14px 28px; background-color: #6F00FF; color: white; text-decoration: none; border-radius: 12px; font-weight: 500; font-size: 16px;";

function wrapper(inner: string): string {
  return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        ${inner}
        <p style="font-size: 12px; color: #999; margin-top: 40px; line-height: 1.4;">
          Opinion DNA — the most complete map of your mind.<br/>
          <a href="${APP_URL}" style="color: #999;">opiniondna.com</a>
        </p>
      </div>
    `;
}

async function sendBestEffort(opts: { to: string; subject: string; html: string; tag: string }) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) console.error(`[email:${opts.tag}] send failed:`, error);
  } catch (err) {
    console.error(`[email:${opts.tag}] send threw:`, err);
  }
}

/** Sent once when a user's personal report finishes generating. */
export async function sendReportReadyEmail(to: string, name: string) {
  const safeName = escapeHtml(name);
  await sendBestEffort({
    to,
    tag: "report-ready",
    subject: "Your Opinion DNA report is ready",
    html: wrapper(`
        <h1 style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">
          Your report is ready${safeName ? `, ${safeName}` : ""}
        </h1>
        <p style="font-size: 16px; color: #666; line-height: 1.5; margin-bottom: 24px;">
          Your full Opinion DNA report — all 48 dimensions across personality, values,
          and meta-thinking, plus your Cognitive Signature — is waiting for you.
        </p>
        <p style="font-size: 16px; color: #666; line-height: 1.5; margin-bottom: 32px;">
          It covers what your profile means for your life, relationships, and career.
          Set aside twenty quiet minutes for the first read.
        </p>
        <a href="${APP_URL}/report" style="${CTA_STYLE}">Read Your Report</a>`),
  });
}

/** Sent to the inviter when their invitee accepts and joins. */
export async function sendInviteAcceptedEmail(to: string, accepterName: string) {
  const safeName = escapeHtml(accepterName);
  await sendBestEffort({
    to,
    tag: "invite-accepted",
    subject: `${safeName} accepted your Opinion DNA invite`,
    html: wrapper(`
        <h1 style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">
          ${safeName} is in
        </h1>
        <p style="font-size: 16px; color: #666; line-height: 1.5; margin-bottom: 24px;">
          <strong>${safeName}</strong> accepted your invitation to compare Opinion DNA results.
        </p>
        <p style="font-size: 16px; color: #666; line-height: 1.5; margin-bottom: 32px;">
          Once you've both completed the assessment, choose a comparison type to
          generate your shared report.
        </p>
        <a href="${APP_URL}/compare" style="${CTA_STYLE}">Go to Compare</a>`),
  });
}

/** Sent once shortly after signup. Idempotency is the caller's job (profiles.welcome_email_sent_at). */
export async function sendWelcomeEmail(to: string, name: string) {
  const safeName = escapeHtml(name);
  await sendBestEffort({
    to,
    tag: "welcome",
    subject: "Welcome to Opinion DNA",
    html: wrapper(`
        <h1 style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">
          Welcome${safeName ? `, ${safeName}` : ""}
        </h1>
        <p style="font-size: 16px; color: #666; line-height: 1.5; margin-bottom: 24px;">
          Opinion DNA maps how you think across 48 dimensions — personality, values,
          and meta-thinking. The assessment takes about 15 minutes, and every answer
          saves automatically, so you can pause and come back anytime.
        </p>
        <p style="font-size: 16px; color: #666; line-height: 1.5; margin-bottom: 32px;">
          When you're done you'll get your scores, a personal report written for you,
          and the option to compare minds with the people who matter.
        </p>
        <a href="${APP_URL}/dashboard" style="${CTA_STYLE}">Start Your Assessment</a>`),
  });
}

/** Sent once to users who started the quiz but stalled. */
export async function sendQuizNudgeEmail(to: string, name: string, answeredCount: number, totalQuestions: number) {
  const safeName = escapeHtml(name);
  const pct = Math.min(99, Math.max(1, Math.round((answeredCount / totalQuestions) * 100)));
  await sendBestEffort({
    to,
    tag: "quiz-nudge",
    subject: "Your assessment is saved — pick up where you left off",
    html: wrapper(`
        <h1 style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">
          You're ${pct}% of the way there${safeName ? `, ${safeName}` : ""}
        </h1>
        <p style="font-size: 16px; color: #666; line-height: 1.5; margin-bottom: 24px;">
          You've answered ${answeredCount} of ${totalQuestions} questions, and every one of them
          is saved. The assessment picks up exactly where you left off.
        </p>
        <p style="font-size: 16px; color: #666; line-height: 1.5; margin-bottom: 32px;">
          Finish the remaining questions and your full report — 48 dimensions,
          plus your Cognitive Signature — generates right away.
        </p>
        <a href="${APP_URL}/quiz" style="${CTA_STYLE}">Continue Your Assessment</a>`),
  });
}
