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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
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
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e0e0e0;
      border-top: none;
      border-radius: 0 0 10px 10px;
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
    .footer {
      text-align: center;
      padding: 20px;
      color: #888;
      font-size: 12px;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
`;

export function getDueDateReminderTemplate(data: LoanReminderData): { subject: string; html: string; text: string } {
  const { borrowerName, lenderName, principalAmount, interestRate, totalAmount, dueDate, daysUntilDue } = data;

  const subject = daysUntilDue === 1
    ? `Payment Reminder: Your loan payment is due tomorrow`
    : `Payment Reminder: Your loan payment is due in ${daysUntilDue} days`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body>
      <div class="header">
        <h1>Payment Reminder</h1>
      </div>
      <div class="content">
        <p>Dear ${borrowerName},</p>

        <p>This is a friendly reminder that your loan payment to <strong>${lenderName}</strong> is due ${daysUntilDue === 1 ? 'tomorrow' : `in <strong>${daysUntilDue} days</strong>`}.</p>

        <div class="loan-details">
          <table>
            <tr>
              <td>Principal Amount</td>
              <td>${formatCurrency(principalAmount)}</td>
            </tr>
            <tr>
              <td>Interest Rate</td>
              <td>${interestRate}%</td>
            </tr>
            <tr>
              <td>Due Date</td>
              <td>${formatDate(dueDate)}</td>
            </tr>
          </table>
        </div>

        <div class="amount-due">
          Total Amount Due: ${formatCurrency(totalAmount)}
        </div>

        ${daysUntilDue && daysUntilDue <= 3 ? `
        <div class="warning">
          <strong>Reminder:</strong> Please ensure your payment is made on time to avoid any late fees or penalties.
        </div>
        ` : ''}

        <p>If you have already made this payment, please disregard this reminder.</p>

        <p>Best regards,<br>LendTrack Team</p>
      </div>
      <div class="footer">
        <p>This is an automated reminder from <a href="#">LendTrack</a>.</p>
        <p>If you have any questions, please contact your lender directly.</p>
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

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      ${baseStyles}
    </head>
    <body>
      <div class="header" style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);">
        <h1>Payment Overdue Notice</h1>
      </div>
      <div class="content">
        <p>Dear ${borrowerName},</p>

        <div class="danger">
          <strong>Important:</strong> Your loan payment to <strong>${lenderName}</strong> is now <strong>${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} overdue</strong>.
        </div>

        <p>We urge you to make your payment as soon as possible to avoid additional late fees and potential impact on your relationship with your lender.</p>

        <div class="loan-details">
          <table>
            <tr>
              <td>Principal Amount</td>
              <td>${formatCurrency(principalAmount)}</td>
            </tr>
            <tr>
              <td>Interest Rate</td>
              <td>${interestRate}%</td>
            </tr>
            <tr>
              <td>Original Due Date</td>
              <td>${formatDate(dueDate)}</td>
            </tr>
            <tr>
              <td>Days Overdue</td>
              <td style="color: #dc3545; font-weight: bold;">${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'}</td>
            </tr>
          </table>
        </div>

        <div class="amount-due" style="background: #f8d7da; color: #dc3545;">
          Total Amount Due: ${formatCurrency(totalAmount)}
        </div>

        <p>If you have already made this payment, please disregard this notice. If you are experiencing difficulties making your payment, we encourage you to reach out to your lender to discuss possible arrangements.</p>

        <p>Best regards,<br>LendTrack Team</p>
      </div>
      <div class="footer">
        <p>This is an automated reminder from <a href="#">LendTrack</a>.</p>
        <p>If you have any questions, please contact your lender directly.</p>
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
    <body>
      <div class="header">
        <h1>Loan Created</h1>
      </div>
      <div class="content">
        <p>Dear ${borrowerName},</p>

        <p>A new loan has been created for you by <strong>${lenderName}</strong>. Below are the details of your loan:</p>

        <div class="loan-details">
          <table>
            <tr>
              <td>Principal Amount</td>
              <td>${formatCurrency(principalAmount)}</td>
            </tr>
            <tr>
              <td>Interest Rate</td>
              <td>${interestRate}%</td>
            </tr>
            <tr>
              <td>Payment Schedule</td>
              <td>${formatPaymentSchedule(paymentSchedule)}</td>
            </tr>
            <tr>
              <td>Due Date</td>
              <td>${formatDate(dueDate)}</td>
            </tr>
          </table>
        </div>

        <div class="amount-due">
          Total Amount Due: ${formatCurrency(totalAmount)}
        </div>

        <p>Please ensure your payment is made by the due date to avoid any late fees or penalties.</p>

        <p>If you have any questions about this loan, please contact your lender directly.</p>

        <p>Best regards,<br>LendTrack Team</p>
      </div>
      <div class="footer">
        <p>This is an automated notification from <a href="#">LendTrack</a>.</p>
        <p>If you have any questions, please contact your lender directly.</p>
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
    <body>
      <div class="header">
        <h1>Loan Reminder</h1>
      </div>
      <div class="content">
        <p>Dear ${borrowerName},</p>

        ${customMessage ? `<p>${customMessage}</p>` : `<p>This is a reminder regarding your loan with <strong>${lenderName}</strong>.</p>`}

        <div class="loan-details">
          <table>
            <tr>
              <td>Principal Amount</td>
              <td>${formatCurrency(principalAmount)}</td>
            </tr>
            <tr>
              <td>Interest Rate</td>
              <td>${interestRate}%</td>
            </tr>
            <tr>
              <td>Due Date</td>
              <td>${formatDate(dueDate)}</td>
            </tr>
          </table>
        </div>

        <div class="amount-due">
          Total Amount: ${formatCurrency(totalAmount)}
        </div>

        <p>Best regards,<br>LendTrack Team</p>
      </div>
      <div class="footer">
        <p>This is an automated reminder from <a href="#">LendTrack</a>.</p>
        <p>If you have any questions, please contact your lender directly.</p>
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
