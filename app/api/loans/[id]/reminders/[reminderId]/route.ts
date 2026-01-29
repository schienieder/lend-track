import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

interface RouteParams {
  params: Promise<{ id: string; reminderId: string }>;
}

// GET /api/loans/[id]/reminders/[reminderId] - Get a single reminder
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: loanId, reminderId } = await params;
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the loan exists and belongs to the user
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('id')
      .eq('id', loanId)
      .eq('user_id', user.id)
      .single();

    if (loanError || !loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Fetch the reminder
    const { data: reminder, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('id', reminderId)
      .eq('loan_id', loanId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reminder });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reminder' },
      { status: 500 }
    );
  }
}

// DELETE /api/loans/[id]/reminders/[reminderId] - Delete a reminder
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: loanId, reminderId } = await params;
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the loan exists and belongs to the user
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('id')
      .eq('id', loanId)
      .eq('user_id', user.id)
      .single();

    if (loanError || !loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Check if the reminder exists
    const { data: existingReminder, error: fetchError } = await supabase
      .from('reminders')
      .select('id')
      .eq('id', reminderId)
      .eq('loan_id', loanId)
      .single();

    if (fetchError || !existingReminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    // Delete the reminder
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId)
      .eq('loan_id', loanId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}
