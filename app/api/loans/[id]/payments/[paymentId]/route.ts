import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { updatePaymentSchema } from '@/schemas/payment';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string; paymentId: string }>;
}

// GET /api/loans/[id]/payments/[paymentId] - Get a single payment
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: loanId, paymentId } = await params;
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

    // Fetch the payment
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('loan_id', loanId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

// PUT /api/loans/[id]/payments/[paymentId] - Update a payment
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: loanId, paymentId } = await params;
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

    // Check if the payment exists
    const { data: existingPayment, error: fetchError } = await supabase
      .from('payments')
      .select('id')
      .eq('id', paymentId)
      .eq('loan_id', loanId)
      .single();

    if (fetchError || !existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updatePaymentSchema.parse(body);

    // Update the payment
    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .eq('loan_id', loanId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

// DELETE /api/loans/[id]/payments/[paymentId] - Delete a payment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: loanId, paymentId } = await params;
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

    // Check if the payment exists
    const { data: existingPayment, error: fetchError } = await supabase
      .from('payments')
      .select('id')
      .eq('id', paymentId)
      .eq('loan_id', loanId)
      .single();

    if (fetchError || !existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Delete the payment
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId)
      .eq('loan_id', loanId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
