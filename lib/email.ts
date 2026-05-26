import { Resend } from "resend";
import { env } from "./env";

const resend = new Resend(env.RESEND_API_KEY);

/** Resend test sender; with onboarding@resend.dev you can only send to your Resend account email until you verify a domain. */
const FROM_EMAIL = env.RESEND_FROM_EMAIL ?? "SecureGate <onboarding@resend.dev>";

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: Inter, system-ui, -apple-system, sans-serif; background-color: #0F172A; color: #F9FAFB; padding: 40px 20px; min-height: 100%;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #1E293B; border: 1px solid #334155; border-radius: 8px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="margin-bottom: 24px; text-align: center;">
          <span style="font-size: 24px; font-weight: bold; color: #3B82F6; letter-spacing: 0.05em;">
            SECURE<span style="color: #F9FAFB;">GATE</span>
          </span>
        </div>
        <h1 style="font-size: 20px; font-weight: 600; color: #F9FAFB; margin: 0 0 16px 0; text-align: center;">
          Verify Your Email Address
        </h1>
        <p style="font-size: 14px; line-height: 24px; color: #9CA3AF; margin: 0 0 24px 0; text-align: center;">
          Thank you for signing up for SecureGate. Please click the button below to verify your email address and activate your account. This link will expire in 15 minutes.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${verificationUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            Verify Email
          </a>
        </div>
        <div style="border-top: 1px solid #334155; padding-top: 20px; text-align: center;">
          <p style="font-size: 12px; color: #6B7280; margin: 0 0 8px 0;">
            If you did not create a SecureGate account, you can safely ignore this email.
          </p>
          <p style="font-size: 11px; color: #4B5563; margin: 0;">
            SecureGate &copy; ${new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your email address",
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
  
  const html = `
    <div style="font-family: Inter, system-ui, -apple-system, sans-serif; background-color: #0F172A; color: #F9FAFB; padding: 40px 20px; min-height: 100%;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #1E293B; border: 1px solid #334155; border-radius: 8px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="margin-bottom: 24px; text-align: center;">
          <span style="font-size: 24px; font-weight: bold; color: #3B82F6; letter-spacing: 0.05em;">
            SECURE<span style="color: #F9FAFB;">GATE</span>
          </span>
        </div>
        <h1 style="font-size: 20px; font-weight: 600; color: #F9FAFB; margin: 0 0 16px 0; text-align: center;">
          Reset Your Password
        </h1>
        <p style="font-size: 14px; line-height: 24px; color: #9CA3AF; margin: 0 0 24px 0; text-align: center;">
          We received a request to reset your password. Click the button below to choose a new password. This link will expire in 1 hour.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            Reset Password
          </a>
        </div>
        <div style="border-top: 1px solid #334155; padding-top: 20px; text-align: center;">
          <p style="font-size: 12px; color: #6B7280; margin: 0 0 8px 0;">
            If you did not request a password reset, you can safely ignore this email. No changes will be made to your account.
          </p>
          <p style="font-size: 11px; color: #4B5563; margin: 0;">
            SecureGate &copy; ${new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your password",
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
}
