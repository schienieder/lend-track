import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { updateLoanSchema } from '@/schemas/loan';

// GET /api/loans/[id] - Get a single loan by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the loan with calculated balance
    const { data: loan, error } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Loan not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Failed to fetch loan', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate balance (fetch payments for this loan)
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('loan_id', id);

    const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const totalInterest = loan.principal_amount * (loan.interest_rate / 100);
    const remainingAmount = loan.principal_amount + totalInterest - totalPaid;

    return new Response(
      JSON.stringify({
        loan: {
          ...loan,
          total_paid: totalPaid,
          total_interest: totalInterest,
          remaining_amount: remainingAmount,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch loan', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// PUT /api/loans/[id] - Update a loan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // First check if the loan exists and belongs to the user
    const { data: existingLoan, error: fetchError } = await supabase
      .from('loans')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingLoan) {
      return new Response(
        JSON.stringify({ error: 'Loan not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const validatedData = updateLoanSchema.parse(body);

    // Clean up the data - only include fields that are provided
    const updateData: Record<string, any> = {};
    if (validatedData.borrower_name !== undefined) updateData.borrower_name = validatedData.borrower_name;
    if (validatedData.borrower_email !== undefined) updateData.borrower_email = validatedData.borrower_email || null;
    if (validatedData.borrower_phone !== undefined) updateData.borrower_phone = validatedData.borrower_phone || null;
    if (validatedData.principal_amount !== undefined) updateData.principal_amount = validatedData.principal_amount;
    if (validatedData.interest_rate !== undefined) updateData.interest_rate = validatedData.interest_rate;
    if (validatedData.due_date !== undefined) updateData.due_date = validatedData.due_date;
    if (validatedData.payment_schedule !== undefined) updateData.payment_schedule = validatedData.payment_schedule;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes || null;

    const { data: loan, error } = await supabase
      .from('loans')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to update loan', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        message: 'Loan updated successfully',
        loan,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Failed to update loan', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE /api/loans/[id] - Delete a loan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // First check if the loan exists and belongs to the user
    const { data: existingLoan, error: fetchError } = await supabase
      .from('loans')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingLoan) {
      return new Response(
        JSON.stringify({ error: 'Loan not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to delete loan', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        message: 'Loan deleted successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Failed to delete loan', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
