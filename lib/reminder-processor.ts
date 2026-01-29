import { createClient } from '@supabase/supabase-js';
import { sendReminder, daysUntil, daysSince } from '@/lib/email/send-reminder';
import type { Reminder, ReminderConfig } from '@/types/reminder';
import type { CurrencyCode } from '@/lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Create a Supabase client with service role for server-side operations
function createServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

interface LoanWithUser {
  id: string;
  user_id: string;
  borrower_name: string;
  borrower_email: string | null;
  lender_name: string;
  principal_amount: number;
  interest_rate: number;
  currency: CurrencyCode;
  due_date: string;
  status: string;
}

interface ProcessResult {
  processed: number;
  sent: number;
  failed: number;
  errors: string[];
}

/**
 * Generate reminders for all active loans based on their configurations
 * This should run daily at midnight
 */
export async function generateReminders(): Promise<ProcessResult> {
  const supabase = createServiceClient();
  const result: ProcessResult = { processed: 0, sent: 0, failed: 0, errors: [] };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  try {
    // Get all active loans with their reminder configs
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select(`
        id,
        borrower_name,
        borrower_email,
        principal_amount,
        interest_rate,
        due_date,
        status,
        reminder_configs (
          enabled,
          due_date_days_before,
          overdue_days_after
        )
      `)
      .in('status', ['active', 'overdue']);

    if (loansError) {
      result.errors.push(`Failed to fetch loans: ${loansError.message}`);
      return result;
    }

    if (!loans || loans.length === 0) {
      return result;
    }

    for (const loan of loans) {
      result.processed++;

      // Get config or use defaults
      const configArray = loan.reminder_configs as ReminderConfig[] | null;
      const config = configArray?.[0] || {
        enabled: true,
        due_date_days_before: [7, 3, 1],
        overdue_days_after: [1, 7, 14],
      };

      if (!config.enabled) {
        continue;
      }

      const daysUntilDue = daysUntil(loan.due_date);

      // Check for due date reminders (days before due date)
      if (daysUntilDue >= 0) {
        for (const daysBefore of config.due_date_days_before) {
          if (daysUntilDue === daysBefore) {
            // Calculate reminder date (today)
            const reminderDate = todayStr;

            // Check if reminder already exists for this date
            const { data: existingReminder } = await supabase
              .from('reminders')
              .select('id')
              .eq('loan_id', loan.id)
              .eq('reminder_type', 'due_date')
              .eq('reminder_date', reminderDate)
              .single();

            if (!existingReminder) {
              // Create reminder record
              const { error: insertError } = await supabase
                .from('reminders')
                .insert({
                  loan_id: loan.id,
                  reminder_type: 'due_date',
                  reminder_date: reminderDate,
                  sent_status: 'pending',
                });

              if (insertError) {
                result.errors.push(`Failed to create due date reminder for loan ${loan.id}: ${insertError.message}`);
              }
            }
          }
        }
      }

      // Check for overdue reminders (days after due date)
      if (daysUntilDue < 0) {
        const daysOverdue = daysSince(loan.due_date);

        for (const daysAfter of config.overdue_days_after) {
          if (daysOverdue === daysAfter) {
            const reminderDate = todayStr;

            // Check if reminder already exists for this date
            const { data: existingReminder } = await supabase
              .from('reminders')
              .select('id')
              .eq('loan_id', loan.id)
              .eq('reminder_type', 'overdue')
              .eq('reminder_date', reminderDate)
              .single();

            if (!existingReminder) {
              // Create reminder record
              const { error: insertError } = await supabase
                .from('reminders')
                .insert({
                  loan_id: loan.id,
                  reminder_type: 'overdue',
                  reminder_date: reminderDate,
                  sent_status: 'pending',
                });

              if (insertError) {
                result.errors.push(`Failed to create overdue reminder for loan ${loan.id}: ${insertError.message}`);
              }
            }
          }
        }
      }
    }

    return result;
  } catch (error) {
    result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Process and send all pending reminders
 * This should run daily at 8 AM
 */
export async function processReminders(): Promise<ProcessResult> {
  const supabase = createServiceClient();
  const result: ProcessResult = { processed: 0, sent: 0, failed: 0, errors: [] };

  try {
    // Get all pending reminders with loan and user details
    const { data: reminders, error: remindersError } = await supabase
      .from('reminders')
      .select(`
        id,
        loan_id,
        reminder_type,
        reminder_date,
        loans (
          id,
          borrower_name,
          borrower_email,
          lender_name,
          principal_amount,
          interest_rate,
          currency,
          due_date,
          status,
          user_id
        )
      `)
      .eq('sent_status', 'pending')
      .lte('reminder_date', new Date().toISOString().split('T')[0]);

    if (remindersError) {
      result.errors.push(`Failed to fetch reminders: ${remindersError.message}`);
      return result;
    }

    if (!reminders || reminders.length === 0) {
      return result;
    }

    for (const reminder of reminders) {
      result.processed++;

      const loan = reminder.loans as unknown as LoanWithUser;

      if (!loan) {
        result.errors.push(`Reminder ${reminder.id}: Loan not found`);
        result.failed++;
        continue;
      }

      // Skip if borrower has no email
      if (!loan.borrower_email) {
        // Mark as failed
        await supabase
          .from('reminders')
          .update({
            sent_status: 'failed',
            error_message: 'Borrower has no email address',
            updated_at: new Date().toISOString(),
          })
          .eq('id', reminder.id);

        result.failed++;
        result.errors.push(`Reminder ${reminder.id}: Borrower has no email address`);
        continue;
      }

      // Calculate days until due or days overdue
      const days = daysUntil(loan.due_date);
      const daysUntilDue = days >= 0 ? days : undefined;
      const daysOverdue = days < 0 ? daysSince(loan.due_date) : undefined;

      // Send the reminder
      const sendResult = await sendReminder({
        reminderType: reminder.reminder_type,
        borrowerEmail: loan.borrower_email,
        borrowerName: loan.borrower_name,
        lenderName: loan.lender_name,
        principalAmount: loan.principal_amount,
        interestRate: loan.interest_rate,
        dueDate: loan.due_date,
        currency: loan.currency,
        daysUntilDue,
        daysOverdue,
      });

      // Update reminder status
      if (sendResult.success) {
        await supabase
          .from('reminders')
          .update({
            sent_status: 'sent',
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', reminder.id);

        result.sent++;
      } else {
        await supabase
          .from('reminders')
          .update({
            sent_status: 'failed',
            error_message: sendResult.error || 'Unknown error',
            updated_at: new Date().toISOString(),
          })
          .eq('id', reminder.id);

        result.failed++;
        result.errors.push(`Reminder ${reminder.id}: ${sendResult.error}`);
      }
    }

    return result;
  } catch (error) {
    result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}
