import { formatCurrency } from '@/lib/utils';

export interface LoanReminderData {
  borrowerName: string;
  lenderName: string;
  principalAmount: number;
  interestRate: number;
  totalAmount: number;
  dueDate: string;
  daysUntilDue?: number;
  daysOverdue?: number;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const baseStyles = `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #e8e8e8;
    }
    .email-wrapper {
      background-color: #e8e8e8;
      padding: 40px 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background-color: #ffffff;
      padding: 20px 30px;
      border-bottom: 1px solid #e0e0e0;
    }
    .email-subject {
      padding: 20px 30px;
      border-bottom: 1px solid #e0e0e0;
    }
    .email-subject h1 {
      font-size: 18px;
      color: #333;
      margin: 0;
    }
    .email-subject span {
      color: #666;
      font-weight: normal;
    }
    .content {
      padding: 30px;
    }
    .loan-details {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .loan-details table {
      width: 100%;
      border-collapse: collapse;
    }
    .loan-details td {
      padding: 8px 0;
    }
    .loan-details td:first-child {
      font-weight: 600;
      color: #666;
    }
    .loan-details td:last-child {
      text-align: right;
      color: #333;
    }
    .amount-due {
      font-size: 24px;
      font-weight: bold;
      color: #667eea;
      text-align: center;
      padding: 15px;
      background: #f0f4ff;
      border-radius: 8px;
      margin: 20px 0;
    }
    .warning {
      background: #fff3cd;
      border: 1px solid #ffc107;
      color: #856404;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .danger {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .closing-remarks {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    .automated-notice {
      margin-top: 20px;
      padding-top: 20px;
      font-size: 13px;
      color: #888;
    }
    .email-footer {
      background-color: #1e293b;
      padding: 20px 30px;
    }
    .footer-left {
      color: #ffffff;
      font-size: 12px;
    }
    .footer-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .footer-logo-text {
      color: #ffffff;
      font-size: 16px;
      font-weight: bold;
    }
  </style>
`;

// Logo URL from Imgur CDN
const logoUrl = 'https://i.imgur.com/d9iUBzK.png';

// Footer background color options (choose one with good contrast for the green logo):
// #1a1a1a - Dark charcoal (neutral, logo stands out)
// #1e293b - Slate 800 (dark blue-gray)
// #18181b - Zinc 900 (near black)
// #f8fafc - Slate 50 (light gray, if logo has dark elements)
const footerBgColor = '#1e293b';

const emailHeader = `
  <div class="email-header" style="background-color: #ffffff; padding: 20px 30px; border-bottom: 1px solid #e0e0e0;">
    <table cellpadding="0" cellspacing="0" border="0" style="height: 40px;">
      <tr>
        <td style="vertical-align: middle; line-height: 0;">
          <img src="${logoUrl}" alt="LendTrack Logo" style="width: 32px; height: 32px; display: block; vertical-align: middle;" />
        </td>
        <td style="vertical-align: middle; padding-left: 10px; line-height: 1;">
          <span style="font-size: 20px; font-weight: bold; color: #333; vertical-align: middle;">LendTrack</span>
        </td>
      </tr>
    </table>
  </div>
`;

const emailFooter = `
  <div class="email-footer" style="background-color: ${footerBgColor}; padding: 20px 30px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="color: #ffffff; font-size: 12px; vertical-align: middle;">
          &copy; ${new Date().getFullYear()} LendTrack. All Rights Reserved
        </td>
        <td style="text-align: right; vertical-align: middle;">
          <table cellpadding="0" cellspacing="0" border="0" align="right" style="height: 32px;">
            <tr>
              <td style="vertical-align: middle; line-height: 0;">
                <img src="${logoUrl}" alt="LendTrack Logo" style="width: 32px; height: 32px; display: block; vertical-align: middle;" />
              </td>
              <td style="vertical-align: middle; padding-left: 10px; line-height: 1;">
                <span style="color: #ffffff; font-size: 20px; font-weight: bold; vertical-align: middle;">LendTrack</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;

export function getDueDateReminderTemplate(data: LoanReminderData): { subject: string; html: string; text: string } {
  const { borrowerName, lenderName, principalAmount, interestRate, totalAmount, dueDate, daysUntilDue } = data;

  const subject = daysUntilDue === 1
    ? `Payment Reminder: Your loan payment is due tomorrow`
    : `Payment Reminder: Your loan payment is due in ${daysUntilDue} days`;

  const subjectLine = daysUntilDue === 1 ? 'Payment Due Tomorrow' : `Payment Due in ${daysUntilDue} Days`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body style="margin: 0; padding: 0; background-color: #e8e8e8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
      <div class="email-wrapper" style="background-color: #e8e8e8; padding: 40px 20px;">
        <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          ${emailHeader}

          <div class="email-subject" style="padding: 20px 30px; border-bottom: 1px solid #e0e0e0;">
            <h1 style="font-size: 18px; color: #333; margin: 0;"><span style="color: #666; font-weight: normal;">Subject:</span> ${subjectLine}</h1>
          </div>

          <div class="content" style="padding: 30px; line-height: 1.6; color: #333;">
            <p style="margin: 0 0 15px 0;">Dear ${borrowerName},</p>

            <p style="margin: 0 0 15px 0;">This is a friendly reminder that your loan payment to <strong>${lenderName}</strong> is due ${daysUntilDue === 1 ? 'tomorrow' : `in <strong>${daysUntilDue} days</strong>`}.</p>

            <div class="loan-details" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #666;">Principal Amount</td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">${formatCurrency(principalAmount)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #666;">Interest Rate</td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">${interestRate}%</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #666;">Due Date</td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">${formatDate(dueDate)}</td>
                </tr>
              </table>
            </div>

            <div class="amount-due" style="font-size: 24px; font-weight: bold; color: #667eea; text-align: center; padding: 15px; background: #f0f4ff; border-radius: 8px; margin: 20px 0;">
              Total Amount Due: ${formatCurrency(totalAmount)}
            </div>

            ${daysUntilDue && daysUntilDue <= 3 ? `
            <div class="warning" style="background: #fff3cd; border: 1px solid #ffc107; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>Reminder:</strong> Please ensure your payment is made on time to avoid any late fees or penalties.
            </div>
            ` : ''}

            <p style="margin: 0 0 15px 0;">If you have already made this payment, please disregard this reminder.</p>

            <div class="closing-remarks" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 5px 0;">Best regards,</p>
              <p style="margin: 0; font-weight: 600;">LendTrack Team</p>

              <div class="automated-notice" style="margin-top: 20px; padding-top: 20px; font-size: 13px; color: #888;">
                <p style="margin: 0 0 5px 0;">This is an automated reminder from <a href="https://lend-track.vercel.app/" style="color: #059669; text-decoration: none; font-weight: bold;">LendTrack</a>.</p>
                <p style="margin: 0;">If you have any questions, please contact your lender directly.</p>
              </div>
            </div>
          </div>

          ${emailFooter}
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Payment Reminder

Dear ${borrowerName},

This is a friendly reminder that your loan payment to ${lenderName} is due ${daysUntilDue === 1 ? 'tomorrow' : `in ${daysUntilDue} days`}.

Loan Details:
- Principal Amount: ${formatCurrency(principalAmount)}
- Interest Rate: ${interestRate}%
- Due Date: ${formatDate(dueDate)}
- Total Amount Due: ${formatCurrency(totalAmount)}

If you have already made this payment, please disregard this reminder.

Best regards,
LendTrack Team
  `.trim();

  return { subject, html, text };
}

export function getOverdueReminderTemplate(data: LoanReminderData): { subject: string; html: string; text: string } {
  const { borrowerName, lenderName, principalAmount, interestRate, totalAmount, dueDate, daysOverdue } = data;

  const subject = daysOverdue === 1
    ? `Urgent: Your loan payment is 1 day overdue`
    : `Urgent: Your loan payment is ${daysOverdue} days overdue`;

  const subjectLine = daysOverdue === 1 ? 'Payment 1 Day Overdue' : `Payment ${daysOverdue} Days Overdue`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body style="margin: 0; padding: 0; background-color: #e8e8e8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
      <div class="email-wrapper" style="background-color: #e8e8e8; padding: 40px 20px;">
        <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          ${emailHeader}

          <div class="email-subject" style="padding: 20px 30px; border-bottom: 1px solid #e0e0e0;">
            <h1 style="font-size: 18px; color: #dc3545; margin: 0;"><span style="color: #666; font-weight: normal;">Subject:</span> ${subjectLine}</h1>
          </div>

          <div class="content" style="padding: 30px; line-height: 1.6; color: #333;">
            <p style="margin: 0 0 15px 0;">Dear ${borrowerName},</p>

            <div class="danger" style="background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>Important:</strong> Your loan payment to <strong>${lenderName}</strong> is now <strong>${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} overdue</strong>.
            </div>

            <p style="margin: 0 0 15px 0;">We urge you to make your payment as soon as possible to avoid additional late fees and potential impact on your relationship with your lender.</p>

            <div class="loan-details" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #666;">Principal Amount</td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">${formatCurrency(principalAmount)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #666;">Interest Rate</td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">${interestRate}%</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #666;">Original Due Date</td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">${formatDate(dueDate)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #666;">Days Overdue</td>
                  <td style="padding: 8px 0; text-align: right; color: #dc3545; font-weight: bold;">${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'}</td>
                </tr>
              </table>
            </div>

            <div class="amount-due" style="font-size: 24px; font-weight: bold; color: #dc3545; text-align: center; padding: 15px; background: #f8d7da; border-radius: 8px; margin: 20px 0;">
              Total Amount Due: ${formatCurrency(totalAmount)}
            </div>

            <p style="margin: 0 0 15px 0;">If you have already made this payment, please disregard this notice. If you are experiencing difficulties making your payment, we encourage you to reach out to your lender to discuss possible arrangements.</p>

            <div class="closing-remarks" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 5px 0;">Best regards,</p>
              <p style="margin: 0; font-weight: 600;">LendTrack Team</p>

              <div class="automated-notice" style="margin-top: 20px; padding-top: 20px; font-size: 13px; color: #888;">
                <p style="margin: 0 0 5px 0;">This is an automated reminder from <a href="https://lend-track.vercel.app/" style="color: #059669; text-decoration: none; font-weight: bold;">LendTrack</a>.</p>
                <p style="margin: 0;">If you have any questions, please contact your lender directly.</p>
              </div>
            </div>
          </div>

          ${emailFooter}
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
PAYMENT OVERDUE NOTICE

Dear ${borrowerName},

IMPORTANT: Your loan payment to ${lenderName} is now ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} overdue.

We urge you to make your payment as soon as possible to avoid additional late fees.

Loan Details:
- Principal Amount: ${formatCurrency(principalAmount)}
- Interest Rate: ${interestRate}%
- Original Due Date: ${formatDate(dueDate)}
- Days Overdue: ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'}
- Total Amount Due: ${formatCurrency(totalAmount)}

If you have already made this payment, please disregard this notice.

Best regards,
LendTrack Team
  `.trim();

  return { subject, html, text };
}

export function getLoanCreatedTemplate(data: LoanReminderData & { paymentSchedule: string }): { subject: string; html: string; text: string } {
  const { borrowerName, lenderName, principalAmount, interestRate, totalAmount, dueDate, paymentSchedule } = data;

  const subject = `Loan Created: Your loan details from ${lenderName}`;

  const formatPaymentSchedule = (schedule: string): string => {
    const scheduleMap: Record<string, string> = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'bi-weekly': 'Bi-Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'yearly': 'Yearly',
      'one-time': 'One-Time',
    };
    return scheduleMap[schedule] || schedule;
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body style="margin: 0; padding: 0; background-color: #e8e8e8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
      <div class="email-wrapper" style="background-color: #e8e8e8; padding: 40px 20px;">
        <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          ${emailHeader}

          <div class="email-subject" style="padding: 20px 30px; border-bottom: 1px solid #e0e0e0;">
            <h1 style="font-size: 18px; color: #333; margin: 0;"><span style="color: #666; font-weight: normal;">Subject:</span> Loan Created</h1>
          </div>

          <div class="content" style="padding: 30px; line-height: 1.6; color: #333;">
            <p style="margin: 0 0 15px 0;">Dear ${borrowerName},</p>

            <p style="margin: 0 0 15px 0;">A new loan has been created for you by <strong>${lenderName}</strong>. Below are the details of your loan:</p>

            <div class="loan-details" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #666;">Principal Amount</td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">${formatCurrency(principalAmount)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #666;">Interest Rate</td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">${interestRate}%</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #666;">Payment Schedule</td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">${formatPaymentSchedule(paymentSchedule)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #666;">Due Date</td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">${formatDate(dueDate)}</td>
                </tr>
              </table>
            </div>

            <div class="amount-due" style="font-size: 24px; font-weight: bold; color: #667eea; text-align: center; padding: 15px; background: #f0f4ff; border-radius: 8px; margin: 20px 0;">
              Total Amount Due: ${formatCurrency(totalAmount)}
            </div>

            <p style="margin: 0 0 15px 0;">Please ensure your payment is made by the due date to avoid any late fees or penalties.</p>

            <p style="margin: 0 0 15px 0;">If you have any questions about this loan, please contact your lender directly.</p>

            <div class="closing-remarks" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 5px 0;">Best regards,</p>
              <p style="margin: 0; font-weight: 600;">LendTrack Team</p>

              <div class="automated-notice" style="margin-top: 20px; padding-top: 20px; font-size: 13px; color: #888;">
                <p style="margin: 0 0 5px 0;">This is an automated notification from <a href="https://lend-track.vercel.app/" style="color: #059669; text-decoration: none; font-weight: bold;">LendTrack</a>.</p>
                <p style="margin: 0;">If you have any questions, please contact your lender directly.</p>
              </div>
            </div>
          </div>

          ${emailFooter}
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Loan Created

Dear ${borrowerName},

A new loan has been created for you by ${lenderName}. Below are the details of your loan:

Loan Details:
- Principal Amount: ${formatCurrency(principalAmount)}
- Interest Rate: ${interestRate}%
- Payment Schedule: ${formatPaymentSchedule(paymentSchedule)}
- Due Date: ${formatDate(dueDate)}
- Total Amount Due: ${formatCurrency(totalAmount)}

Please ensure your payment is made by the due date to avoid any late fees or penalties.

If you have any questions about this loan, please contact your lender directly.

Best regards,
LendTrack Team
  `.trim();

  return { subject, html, text };
}

export function getCustomReminderTemplate(data: LoanReminderData & { customMessage?: string }): { subject: string; html: string; text: string } {
  const { borrowerName, lenderName, principalAmount, interestRate, totalAmount, dueDate, customMessage } = data;

  const subject = `Loan Reminder from ${lenderName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body style="margin: 0; padding: 0; background-color: #e8e8e8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;">
      <div class="email-wrapper" style="background-color: #e8e8e8; padding: 40px 20px;">
        <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          ${emailHeader}

          <div class="email-subject" style="padding: 20px 30px; border-bottom: 1px solid #e0e0e0;">
            <h1 style="font-size: 18px; color: #333; margin: 0;"><span style="color: #666; font-weight: normal;">Subject:</span> Loan Reminder</h1>
          </div>

          <div class="content" style="padding: 30px; line-height: 1.6; color: #333;">
            <p style="margin: 0 0 15px 0;">Dear ${borrowerName},</p>

            ${customMessage ? `<p style="margin: 0 0 15px 0;">${customMessage}</p>` : `<p style="margin: 0 0 15px 0;">This is a reminder regarding your loan with <strong>${lenderName}</strong>.</p>`}

            <div class="loan-details" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #666;">Principal Amount</td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">${formatCurrency(principalAmount)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #666;">Interest Rate</td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">${interestRate}%</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 600; color: #666;">Due Date</td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">${formatDate(dueDate)}</td>
                </tr>
              </table>
            </div>

            <div class="amount-due" style="font-size: 24px; font-weight: bold; color: #667eea; text-align: center; padding: 15px; background: #f0f4ff; border-radius: 8px; margin: 20px 0;">
              Total Amount: ${formatCurrency(totalAmount)}
            </div>

            <div class="closing-remarks" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 5px 0;">Best regards,</p>
              <p style="margin: 0; font-weight: 600;">LendTrack Team</p>

              <div class="automated-notice" style="margin-top: 20px; padding-top: 20px; font-size: 13px; color: #888;">
                <p style="margin: 0 0 5px 0;">This is an automated reminder from <a href="https://lend-track.vercel.app/" style="color: #059669; text-decoration: none; font-weight: bold;">LendTrack</a>.</p>
                <p style="margin: 0;">If you have any questions, please contact your lender directly.</p>
              </div>
            </div>
          </div>

          ${emailFooter}
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Loan Reminder

Dear ${borrowerName},

${customMessage || `This is a reminder regarding your loan with ${lenderName}.`}

Loan Details:
- Principal Amount: ${formatCurrency(principalAmount)}
- Interest Rate: ${interestRate}%
- Due Date: ${formatDate(dueDate)}
- Total Amount: ${formatCurrency(totalAmount)}

Best regards,
LendTrack Team
  `.trim();

  return { subject, html, text };
}
