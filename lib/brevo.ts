import * as brevo from '@getbrevo/brevo';

// Initialize the Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();

// Set the API key
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY || ''
);

// Sender configuration
export const EMAIL_SENDER = {
  email: process.env.BREVO_SENDER_EMAIL || 'noreply@huramtrack.app',
  name: process.env.BREVO_SENDER_NAME || 'HuramTrack',
};

export interface SendEmailParams {
  to: {
    email: string;
    name?: string;
  };
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { to, subject, htmlContent, textContent } = params;

  // Check if API key is configured
  if (!process.env.BREVO_API_KEY) {
    console.warn('BREVO_API_KEY is not configured. Email will not be sent.');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = EMAIL_SENDER;
    sendSmtpEmail.to = [{ email: to.email, name: to.name }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    if (textContent) {
      sendSmtpEmail.textContent = textContent;
    }

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    return {
      success: true,
      messageId: response.body?.messageId,
    };
  } catch (error) {
    console.error('Failed to send email:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export default apiInstance;
