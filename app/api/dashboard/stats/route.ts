import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { Loan } from '@/types/loan';
import type { Payment } from '@/types/payment';
import type {
  DashboardStats,
  DashboardResponse,
  RecentActivity,
  CurrencyFinancialSummary,
} from '@/types/dashboard';
import type { CurrencyCode } from '@/lib/utils';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all loans for the user
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (loansError) {
      return NextResponse.json({ error: loansError.message }, { status: 500 });
    }

    const typedLoans: Loan[] = loans || [];

    // Get all loan IDs for fetching payments
    const loanIds = typedLoans.map((loan) => loan.id);

    // Fetch all payments for these loans
    let typedPayments: Payment[] = [];
    if (loanIds.length > 0) {
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .in('loan_id', loanIds)
        .order('payment_date', { ascending: false });

      if (paymentsError) {
        return NextResponse.json({ error: paymentsError.message }, { status: 500 });
      }

      typedPayments = payments || [];
    }

    // Calculate loan counts
    const total_loans = typedLoans.length;
    const active_loans = typedLoans.filter((loan) => loan.status === 'active').length;
    const overdue_loans = typedLoans.filter((loan) => loan.status === 'overdue').length;
    const paid_loans = typedLoans.filter((loan) => loan.status === 'paid').length;

    // Calculate unique borrowers
    const uniqueBorrowers = new Set(typedLoans.map((loan) => loan.borrower_name.toLowerCase()));
    const total_borrowers = uniqueBorrowers.size;

    // Group loans by currency for financial calculations
    const loansByCurrency = typedLoans.reduce(
      (acc, loan) => {
        const currency = loan.currency || 'PHP';
        if (!acc[currency]) {
          acc[currency] = [];
        }
        acc[currency].push(loan);
        return acc;
      },
      {} as Record<CurrencyCode, Loan[]>
    );

    // Calculate payments by loan for quick lookup
    const paymentsByLoan = typedPayments.reduce(
      (acc, payment) => {
        if (!acc[payment.loan_id]) {
          acc[payment.loan_id] = [];
        }
        acc[payment.loan_id].push(payment);
        return acc;
      },
      {} as Record<string, Payment[]>
    );

    // Calculate financial summary per currency
    const financial_summary: CurrencyFinancialSummary[] = Object.entries(loansByCurrency).map(
      ([currency, currencyLoans]) => {
        // Total principal for all loans in this currency
        const total_principal = currencyLoans.reduce((sum, loan) => sum + loan.principal_amount, 0);

        // Calculate total paid and outstanding for each loan
        let total_paid = 0;
        let total_outstanding = 0;
        let total_interest_earned = 0;

        currencyLoans.forEach((loan) => {
          const loanPayments = paymentsByLoan[loan.id] || [];
          const paidForLoan = loanPayments.reduce((sum, payment) => sum + payment.amount, 0);
          total_paid += paidForLoan;

          // Calculate total amount due (principal + interest)
          // Interest is calculated as: principal * (interest_rate / 100)
          const interestAmount = loan.principal_amount * (loan.interest_rate / 100);
          const totalDue = loan.principal_amount + interestAmount;

          // Outstanding is total due minus what's been paid
          if (loan.status === 'active' || loan.status === 'overdue') {
            total_outstanding += Math.max(0, totalDue - paidForLoan);
          }

          // Calculate interest earned from payments
          // If paid amount exceeds principal, the excess is interest
          if (paidForLoan > loan.principal_amount) {
            total_interest_earned += paidForLoan - loan.principal_amount;
          } else if (loan.status === 'paid') {
            // For paid loans, assume interest was fully paid
            total_interest_earned += interestAmount;
          }
        });

        return {
          currency: currency as CurrencyCode,
          total_principal,
          total_outstanding,
          total_paid,
          total_interest_earned,
        };
      }
    );

    const stats: DashboardStats = {
      total_loans,
      active_loans,
      overdue_loans,
      paid_loans,
      total_borrowers,
      financial_summary,
    };

    // Build recent activity (last 15 items)
    const recent_activity: RecentActivity[] = [];

    // Add recent loans (created in the last 30 days)
    typedLoans.slice(0, 8).forEach((loan) => {
      recent_activity.push({
        id: `loan-${loan.id}`,
        type: 'loan_created',
        description: `New loan created for ${loan.borrower_name}`,
        borrower_name: loan.borrower_name,
        amount: loan.principal_amount,
        currency: loan.currency,
        timestamp: loan.created_at,
      });
    });

    // Add recent payments
    typedPayments.slice(0, 8).forEach((payment) => {
      const loan = typedLoans.find((l) => l.id === payment.loan_id);
      if (loan) {
        recent_activity.push({
          id: `payment-${payment.id}`,
          type: 'payment_received',
          description: `Payment received from ${loan.borrower_name}`,
          borrower_name: loan.borrower_name,
          amount: payment.amount,
          currency: loan.currency,
          timestamp: payment.payment_date,
        });
      }
    });

    // Sort by timestamp descending and limit to 15
    recent_activity.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const limitedActivity = recent_activity.slice(0, 15);

    const response: DashboardResponse = {
      stats,
      recent_activity: limitedActivity,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
  }
}
