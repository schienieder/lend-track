import { sendEmail as sendEmailViaBrevo, type SendEmailParams } from '@/lib/brevo';
import { sendEmailViaSMTP } from '@/lib/smtp';

export type { SendEmailParams };

/**
 * Unified email sender that routes to SMTP or Brevo based on configured env vars.
 * Priority: SMTP > Brevo
 */
export async function sendEmail(
  params: SendEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const smtpConfigured = process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD;
  // const brevoConfigured = !!process.env.BREVO_API_KEY;

  if (smtpConfigured) {
    return sendEmailViaSMTP(params);
  }

  // if (brevoConfigured) {
  //   return sendEmailViaBrevo(params);
  // }

  console.warn('No email provider configured. Set SMTP or Brevo credentials.');
  return {
    success: false,
    error: 'No email provider configured',
  };
}
