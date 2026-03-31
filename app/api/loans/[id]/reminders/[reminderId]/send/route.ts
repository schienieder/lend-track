import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { sendReminder, daysUntil, daysSince } from '@/lib/email/send-reminder';

interface RouteParams {
  params: Promise<{ id: string; reminderId: string }>;
}

// POST /api/loans/[id]/reminders/[reminderId]/send - Send a reminder immediately
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: loanId, reminderId } = await params;
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the loan with user details and reminder config
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('id, borrower_name, borrower_email, lender_name, principal_amount, interest_rate, is_fixed_interest, fixed_interest_amount, currency, due_date, status, user_id, payment_schedule, reminder_configs(monthly_reminder_enabled)')
      .eq('id', loanId)
      .eq('user_id', user.id)
      .single();

    if (loanError || !loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Fetch the reminder
    const { data: reminder, error: reminderError } = await supabase
      .from('reminders')
      .select('*')
      .eq('id', reminderId)
      .eq('loan_id', loanId)
      .single();

    if (reminderError || !reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    // Check if already sent
    if (reminder.sent_status === 'sent') {
      return NextResponse.json(
        { error: 'Reminder has already been sent' },
        { status: 400 }
      );
    }

    // Check if borrower has email
    if (!loan.borrower_email) {
      // Mark as failed
      await supabase
        .from('reminders')
        .update({
          sent_status: 'failed',
          error_message: 'Borrower has no email address',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reminderId);

      return NextResponse.json(
        { error: 'Borrower has no email address' },
        { status: 400 }
      );
    }

    // Calculate days until due or days overdue
    const days = daysUntil(loan.due_date);
    const daysUntilDue = days >= 0 ? days : undefined;
    const daysOverdue = days < 0 ? daysSince(loan.due_date) : undefined;

    // Detect if this is a monthly payment loan with monthly reminders enabled
    const reminderConfigArray = (loan as Record<string, unknown>).reminder_configs as Array<{ monthly_reminder_enabled: boolean }> | null;
    const isMonthlyPayment = (loan as Record<string, unknown>).payment_schedule === 'monthly'
      && reminderConfigArray?.[0]?.monthly_reminder_enabled === true
      && days > 0;

    // Send the reminder
    const sendResult = await sendReminder({
      reminderType: reminder.reminder_type,
      borrowerEmail: loan.borrower_email,
      borrowerName: loan.borrower_name,
      lenderName: loan.lender_name,
      principalAmount: loan.principal_amount,
      interestRate: loan.interest_rate,
      isFixedInterest: loan.is_fixed_interest,
      fixedInterestAmount: loan.fixed_interest_amount,
      dueDate: loan.due_date,
      currency: loan.currency,
      daysUntilDue,
      daysOverdue,
      isMonthlyPayment,
    });

    // Update reminder status
    if (sendResult.success) {
      await supabase
        .from('reminders')
        .update({
          sent_status: 'sent',
          sent_at: new Date().toISOString(),
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reminderId);

      return NextResponse.json({
        success: true,
        message: 'Reminder sent successfully',
        messageId: sendResult.messageId,
      });
    } else {
      await supabase
        .from('reminders')
        .update({
          sent_status: 'failed',
          error_message: sendResult.error || 'Unknown error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reminderId);

      return NextResponse.json(
        {
          success: false,
          error: sendResult.error || 'Failed to send reminder',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to send reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    );
  }
}
