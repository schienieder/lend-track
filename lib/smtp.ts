import nodemailer from 'nodemailer';
import type { SendEmailParams } from '@/lib/brevo';

// Create reusable transporter using Gmail SMTP
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function sendEmailViaSMTP(
  params: SendEmailParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { to, subject, htmlContent, textContent } = params;

  if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP credentials are not configured. Email will not be sent.');
    return {
      success: false,
      error: 'SMTP service not configured',
    };
  }

  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"LendTrack" <${process.env.SMTP_USERNAME}>`,
      to: to.name ? `"${to.name}" <${to.email}>` : to.email,
      subject,
      html: htmlContent,
      ...(textContent && { text: textContent }),
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Failed to send email via SMTP:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
    };
  }
}
