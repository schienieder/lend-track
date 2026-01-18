import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createLoanSchema, loanQuerySchema } from '@/schemas/loan';
import { z } from 'zod';

// GET /api/loans - List loans with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = loanQuerySchema.parse({
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      status: searchParams.get('status') || undefined,
      payment_schedule: searchParams.get('payment_schedule') || undefined,
      search: searchParams.get('search') || undefined,
      sort_by: searchParams.get('sort_by') || undefined,
      sort_order: searchParams.get('sort_order') || undefined,
    });

    const { page, limit, status, payment_schedule, search, sort_by, sort_order } = queryParams;
    const offset = (page - 1) * limit;

    // Build base query
    let query = supabase
      .from('loans')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (payment_schedule) {
      query = query.eq('payment_schedule', payment_schedule);
    }

    if (search) {
      query = query.or(`borrower_name.ilike.%${search}%,borrower_email.ilike.%${search}%,borrower_phone.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: loans, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const total = count || 0;
    const total_pages = Math.ceil(total / limit);

    return NextResponse.json({
      loans: loans || [],
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
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}

// POST /api/loans - Create a new loan
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createLoanSchema.parse(body);

    // Create the loan
    const { data: loan, error } = await supabase
      .from('loans')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ loan }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create loan' },
      { status: 500 }
    );
  }
}
