import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { reminderQuerySchema } from '@/schemas/reminder';
import { z } from 'zod';

// GET /api/reminders - Get all reminders for the current user (across all loans)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Get all loan IDs for the user
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('id')
      .eq('user_id', user.id);

    if (loansError) {
      return NextResponse.json({ error: loansError.message }, { status: 500 });
    }

    const loanIds = loans?.map(loan => loan.id) || [];

    if (loanIds.length === 0) {
      return NextResponse.json({
        reminders: [],
        pagination: {
          page,
          limit,
          total: 0,
          total_pages: 0,
        },
      });
    }

    // Build count query
    let countQuery = supabase
      .from('reminders')
      .select('*', { count: 'exact', head: true })
      .in('loan_id', loanIds);

    if (sent_status) {
      countQuery = countQuery.eq('sent_status', sent_status);
    }

    if (reminder_type) {
      countQuery = countQuery.eq('reminder_type', reminder_type);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // Build data query with join to loans table
    let dataQuery = supabase
      .from('reminders')
      .select(`
        *,
        loans (
          id,
          borrower_name,
          borrower_email,
          lender_name,
          principal_amount,
          currency,
          due_date,
          status
        )
      `)
      .in('loan_id', loanIds);

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
