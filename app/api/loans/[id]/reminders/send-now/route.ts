import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { sendReminder, daysUntil, daysSince } from '@/lib/email/send-reminder';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/loans/[id]/reminders/send-now - Create and send a reminder immediately
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: loanId } = await params;
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the loan with user details
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('id, borrower_name, borrower_email, principal_amount, interest_rate, due_date, status, user_id')
      .eq('id', loanId)
      .eq('user_id', user.id)
      .single();

    if (loanError || !loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Check if borrower has email
    if (!loan.borrower_email) {
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

    // Calculate days until due or days overdue to determine reminder type
    const days = daysUntil(loan.due_date);
    const reminderType = days < 0 ? 'overdue' : 'due_date';
    const daysUntilDue = days >= 0 ? days : undefined;
    const daysOverdue = days < 0 ? daysSince(loan.due_date) : undefined;

    // Create reminder record first
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: reminder, error: createError } = await supabase
      .from('reminders')
      .insert({
        loan_id: loanId,
        reminder_type: reminderType,
        reminder_date: todayStr,
        sent_status: 'pending',
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { error: 'Failed to create reminder record' },
        { status: 500 }
      );
    }

    // Send the reminder
    const sendResult = await sendReminder({
      reminderType,
      borrowerEmail: loan.borrower_email,
      borrowerName: loan.borrower_name,
      lenderName,
      principalAmount: loan.principal_amount,
      interestRate: loan.interest_rate,
      dueDate: loan.due_date,
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

      return NextResponse.json({
        success: true,
        message: 'Reminder sent successfully',
        reminder: {
          ...reminder,
          sent_status: 'sent',
          sent_at: new Date().toISOString(),
        },
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
        .eq('id', reminder.id);

      return NextResponse.json(
        {
          success: false,
          error: sendResult.error || 'Failed to send reminder',
          reminder: {
            ...reminder,
            sent_status: 'failed',
            error_message: sendResult.error,
          },
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
