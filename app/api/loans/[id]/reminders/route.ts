import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createReminderSchema, reminderQuerySchema } from '@/schemas/reminder';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/loans/[id]/reminders - List all reminders for a loan
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = reminderQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sent_status: searchParams.get('sent_status'),
      reminder_type: searchParams.get('reminder_type'),
      sort_by: searchParams.get('sort_by'),
      sort_order: searchParams.get('sort_order'),
    });

    const { page, limit, sent_status, reminder_type, sort_by, sort_order } = queryParams;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('reminders')
      .select('*', { count: 'exact' })
      .eq('loan_id', loanId);

    if (sent_status) {
      query = query.eq('sent_status', sent_status);
    }

    if (reminder_type) {
      query = query.eq('reminder_type', reminder_type);
    }

    // Get total count
    const { count, error: countError } = await query;

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // Fetch reminders with pagination
    let dataQuery = supabase
      .from('reminders')
      .select('*')
      .eq('loan_id', loanId);

    if (sent_status) {
      dataQuery = dataQuery.eq('sent_status', sent_status);
    }

    if (reminder_type) {
      dataQuery = dataQuery.eq('reminder_type', reminder_type);
    }

    const { data: reminders, error } = await dataQuery
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count || 0;
    const total_pages = Math.ceil(total / limit);

    return NextResponse.json({
      reminders,
      pagination: {
        page,
        limit,
        total,
        total_pages,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

// POST /api/loans/[id]/reminders - Create a new reminder
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const validatedData = createReminderSchema.parse(body);

    // Create the reminder
    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({
        loan_id: loanId,
        ...validatedData,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}
