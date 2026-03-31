import { sendEmail } from '@/lib/email/send-email';
import {
  getDueDateReminderTemplate,
  getOverdueReminderTemplate,
  getCustomReminderTemplate,
  getLoanCreatedTemplate,
  type LoanReminderData,
} from '@/lib/email/templates';
import type { ReminderType } from '@/types/reminder';
import type { CurrencyCode } from '@/lib/utils';

export interface SendReminderParams {
  reminderType: ReminderType;
  borrowerEmail: string;
  borrowerName: string;
  lenderName: string;
  principalAmount: number;
  interestRate: number;
  isFixedInterest?: boolean;
  fixedInterestAmount?: number;
  dueDate: string;
  currency: CurrencyCode;
  daysUntilDue?: number;
  daysOverdue?: number;
  customMessage?: string;
  paymentSchedule?: string;
  isMonthlyPayment?: boolean;
}

export interface SendReminderResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendReminder(params: SendReminderParams): Promise<SendReminderResult> {
  const {
    reminderType,
    borrowerEmail,
    borrowerName,
    lenderName,
    principalAmount,
    interestRate,
    isFixedInterest = false,
    fixedInterestAmount = 0,
    dueDate,
    currency,
    daysUntilDue,
    daysOverdue,
    customMessage,
    paymentSchedule,
    isMonthlyPayment = false,
  } = params;

  // Calculate total amount with interest
  const totalAmount = isFixedInterest
    ? principalAmount + fixedInterestAmount
    : principalAmount * (1 + interestRate / 100);

  // Prepare loan data
  const loanData: LoanReminderData = {
    borrowerName,
    lenderName,
    principalAmount,
    interestRate,
    isFixedInterest,
    fixedInterestAmount,
    totalAmount,
    dueDate,
    currency,
    daysUntilDue,
    daysOverdue,
    isMonthlyPayment,
  };

  // Get the appropriate template based on reminder type
  let emailContent: { subject: string; html: string; text: string };

  switch (reminderType) {
    case 'due_date':
      emailContent = getDueDateReminderTemplate(loanData);
      break;
    case 'overdue':
      emailContent = getOverdueReminderTemplate(loanData);
      break;
    case 'custom':
      emailContent = getCustomReminderTemplate({ ...loanData, customMessage });
      break;
    case 'loan_created':
      emailContent = getLoanCreatedTemplate({ ...loanData, paymentSchedule: paymentSchedule || 'monthly' });
      break;
    default:
      return {
        success: false,
        error: `Unknown reminder type: ${reminderType}`,
      };
  }

  // Send the email
  const result = await sendEmail({
    to: {
      email: borrowerEmail,
      name: borrowerName,
    },
    subject: emailContent.subject,
    htmlContent: emailContent.html,
    textContent: emailContent.text,
  });

  return {
    success: result.success,
    messageId: result.messageId,
    error: result.error,
  };
}

// Helper function to calculate days until a date
export function daysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

// Helper function to calculate days since a date
export function daysSince(dateString: string): number {
  return -daysUntil(dateString);
}
