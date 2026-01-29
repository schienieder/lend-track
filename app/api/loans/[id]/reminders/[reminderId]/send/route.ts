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

    // Fetch the loan with user details
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('id, borrower_name, borrower_email, principal_amount, interest_rate, currency, due_date, status, user_id')
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

    // Get lender name from user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single();

    const lenderName = userProfile?.name || userProfile?.email || 'Your Lender';

    // Calculate days until due or days overdue
    const days = daysUntil(loan.due_date);
    const daysUntilDue = days >= 0 ? days : undefined;
    const daysOverdue = days < 0 ? daysSince(loan.due_date) : undefined;

    // Send the reminder
    const sendResult = await sendReminder({
      reminderType: reminder.reminder_type,
      borrowerEmail: loan.borrower_email,
      borrowerName: loan.borrower_name,
      lenderName,
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
