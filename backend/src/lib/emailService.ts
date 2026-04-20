/**
 * Email Service — sends transactional emails via Resend (free tier: 100/day).
 * Used for: email verification, password reset, weekly parent digests.
 *
 * Set RESEND_API_KEY environment variable to enable.
 * When not configured, emails are logged to console (dev mode).
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = 'Kids Learning Fun <onboarding@resend.dev>';
const APP_NAME = 'Kids Learning Fun';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email via Resend API.
 * Falls back to console.log in development or when API key is missing.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`[EmailService] DEV MODE — would send email:`);
    console.log(`  To: ${options.to}`);
    console.log(`  Subject: ${options.subject}`);
    console.log(`  HTML: ${options.html.slice(0, 200)}...`);
    return true;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error(`[EmailService] Failed to send email: ${error}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[EmailService] Error:', err);
    return false;
  }
}

/** Send email verification link */
export async function sendVerificationEmail(to: string, token: string, name: string): Promise<boolean> {
  const verifyUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/verify?token=${token}`;

  return sendEmail({
    to,
    subject: `Verify your ${APP_NAME} account`,
    html: `
      <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-family: 'Fredoka One', cursive; color: #FF6B6B; font-size: 28px; margin: 0;">
            ${APP_NAME}
          </h1>
        </div>
        <h2 style="color: #2D2D3A; font-size: 22px;">Hi ${name}! 👋</h2>
        <p style="color: #6B6B7B; font-size: 16px; line-height: 1.6;">
          Thanks for signing up! Please verify your email to get started.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="background: linear-gradient(135deg, #FF6B6B, #FF8C42); color: white; padding: 14px 32px; border-radius: 16px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #9B9BAB; font-size: 12px; text-align: center;">
          If you didn't create this account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

/** Send password reset link */
export async function sendPasswordResetEmail(to: string, token: string): Promise<boolean> {
  const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/reset-password?token=${token}`;

  return sendEmail({
    to,
    subject: `Reset your ${APP_NAME} password`,
    html: `
      <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-family: 'Fredoka One', cursive; color: #FF6B6B; font-size: 28px; margin: 0;">
            ${APP_NAME}
          </h1>
        </div>
        <h2 style="color: #2D2D3A; font-size: 22px;">Password Reset</h2>
        <p style="color: #6B6B7B; font-size: 16px; line-height: 1.6;">
          Click the button below to reset your password. This link expires in 1 hour.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #4ECDC4, #3DBDB4); color: white; padding: 14px 32px; border-radius: 16px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #9B9BAB; font-size: 12px; text-align: center;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

/** Send weekly parent digest */
export async function sendWeeklyDigest(
  to: string,
  parentName: string,
  childName: string,
  stats: { starsEarned: number; activitiesCompleted: number; minutesLearned: number; streakDays: number }
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `${childName}'s Weekly Learning Report — ${APP_NAME}`,
    html: `
      <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-family: 'Fredoka One', cursive; color: #FF6B6B; font-size: 28px; margin: 0;">
            ${APP_NAME}
          </h1>
        </div>
        <h2 style="color: #2D2D3A; font-size: 22px;">Hi ${parentName}!</h2>
        <p style="color: #6B6B7B; font-size: 16px; line-height: 1.6;">
          Here's what ${childName} accomplished this week:
        </p>
        <div style="background: #FFF8F0; border-radius: 16px; padding: 20px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #6B6B7B;">⭐ Stars Earned</span>
            <strong style="color: #FFD93D;">${stats.starsEarned}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #6B6B7B;">📚 Activities Completed</span>
            <strong style="color: #4ECDC4;">${stats.activitiesCompleted}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #6B6B7B;">⏱️ Minutes Learning</span>
            <strong style="color: #FF8C42;">${stats.minutesLearned}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #6B6B7B;">🔥 Day Streak</span>
            <strong style="color: #FF6B6B;">${stats.streakDays}</strong>
          </div>
        </div>
        <p style="color: #6B6B7B; font-size: 14px;">
          Keep up the great work! ${childName} is making amazing progress. 🎉
        </p>
      </div>
    `,
  });
}
