import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { updateReminderConfigSchema } from '@/schemas/reminder';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/loans/[id]/reminders/config - Get reminder config for a loan
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: loanId } = await params;
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

    // Fetch the reminder config
    const { data: config, error } = await supabase
      .from('reminder_configs')
      .select('*')
      .eq('loan_id', loanId)
      .single();

    // If no config exists, return default values
    if (error && error.code === 'PGRST116') {
      return NextResponse.json({
        config: {
          id: null,
          loan_id: loanId,
          enabled: true,
          due_date_days_before: [7, 3, 1],
          overdue_days_after: [1, 7, 14],
          created_at: null,
          updated_at: null,
        },
      });
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ config });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reminder config' },
      { status: 500 }
    );
  }
}

// PUT /api/loans/[id]/reminders/config - Create or update reminder config
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: loanId } = await params;
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateReminderConfigSchema.parse(body);

    // Check if config already exists
    const { data: existingConfig, error: fetchError } = await supabase
      .from('reminder_configs')
      .select('id')
      .eq('loan_id', loanId)
      .single();

    let config;
    let error;

    if (existingConfig) {
      // Update existing config
      const result = await supabase
        .from('reminder_configs')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString(),
        })
        .eq('loan_id', loanId)
        .select()
        .single();

      config = result.data;
      error = result.error;
    } else {
      // Create new config
      const result = await supabase
        .from('reminder_configs')
        .insert({
          loan_id: loanId,
          ...validatedData,
        })
        .select()
        .single();

      config = result.data;
      error = result.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ config });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update reminder config' },
      { status: 500 }
    );
  }
}
