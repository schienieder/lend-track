import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createPaymentSchema, paymentQuerySchema } from '@/schemas/payment';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/loans/[id]/payments - List all payments for a loan
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
      .select('id, principal_amount, interest_rate')
      .eq('id', loanId)
      .eq('user_id', user.id)
      .single();

    if (loanError || !loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = paymentQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sort_by: searchParams.get('sort_by'),
      sort_order: searchParams.get('sort_order'),
    });

    const { page, limit, sort_by, sort_order } = queryParams;
    const offset = (page - 1) * limit;

    // Get total count
    const { count, error: countError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('loan_id', loanId);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // Fetch payments with pagination
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('loan_id', loanId)
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate total paid
    const { data: sumData, error: sumError } = await supabase
      .from('payments')
      .select('amount')
      .eq('loan_id', loanId);

    if (sumError) {
      return NextResponse.json({ error: sumError.message }, { status: 500 });
    }

    const totalPaid = sumData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const totalWithInterest = loan.principal_amount * (1 + loan.interest_rate / 100);
    const remainingBalance = Math.max(0, totalWithInterest - totalPaid);

    const total = count || 0;
    const total_pages = Math.ceil(total / limit);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        total_pages,
      },
      summary: {
        total_paid: totalPaid,
        remaining_balance: remainingBalance,
        payment_count: total,
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
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST /api/loans/[id]/payments - Create a new payment
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
    const validatedData = createPaymentSchema.parse(body);

    // Create the payment
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        loan_id: loanId,
        ...validatedData,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
