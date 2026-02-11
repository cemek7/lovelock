import { Resend } from "resend";

const resend = () => new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "LoveLock <onboarding@resend.dev>";

export async function sendMagicLink(email: string, url: string) {
  await resend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Your LoveLock Dashboard Link",
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1a0a1e; color: #f5f5f5; border-radius: 12px;">
        <h1 style="font-size: 24px; color: #fb7185; margin-bottom: 16px;">LoveLock</h1>
        <p style="margin-bottom: 24px; line-height: 1.6;">Click the button below to access your puzzle dashboard. This link expires in 15 minutes.</p>
        <a href="${url}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #e11d48, #9333ea); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Open Dashboard</a>
        <p style="margin-top: 24px; font-size: 13px; color: #888;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPuzzleCreated(
  email: string,
  shareUrl: string,
  dashboardUrl: string,
  revealAt?: string | null
) {
  const revealNote = revealAt
    ? `<p style="margin-top: 16px; padding: 12px; background: rgba(251, 113, 133, 0.1); border-radius: 8px; font-size: 14px;">Your puzzle is set to unlock on <strong>${new Date(revealAt).toLocaleString("en-NG", { dateStyle: "full", timeStyle: "short" })}</strong>. Your partner won't be able to open it until then.</p>`
    : "";

  await resend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Your LoveLock Puzzle is ready!",
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1a0a1e; color: #f5f5f5; border-radius: 12px;">
        <h1 style="font-size: 24px; color: #fb7185; margin-bottom: 16px;">Your Puzzle is Ready!</h1>
        <p style="margin-bottom: 16px; line-height: 1.6;">Share this link with your partner so they can solve the puzzle and reveal your love message:</p>
        <a href="${shareUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #e11d48, #9333ea); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-bottom: 16px;">Puzzle Link</a>
        <p style="margin-top: 8px; font-size: 13px; color: #ccc; word-break: break-all;">${shareUrl}</p>
        ${revealNote}
        <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />
        <p style="font-size: 14px; color: #aaa;">Track your puzzle's status on your <a href="${dashboardUrl}" style="color: #fb7185;">dashboard</a>.</p>
      </div>
    `,
  });
}
