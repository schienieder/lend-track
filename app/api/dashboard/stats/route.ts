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
export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year') || 'current';
    const currentYear = new Date().getFullYear();
    const filterYear = yearParam === 'current' ? currentYear : yearParam === 'all' ? null : parseInt(yearParam);

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

    // Get available years from loans
    const yearsFromLoans = typedLoans.map((loan) => new Date(loan.created_at).getFullYear());
    const yearsFromPayments = typedPayments.map((payment) => new Date(payment.payment_date).getFullYear());
    const allYears = [...new Set([...yearsFromLoans, ...yearsFromPayments])].sort((a, b) => b - a);
    const available_years = allYears.length > 0 ? allYears : [currentYear];

    // Filter loans and payments by year for filtered metrics
    const filteredLoans = filterYear
      ? typedLoans.filter((loan) => new Date(loan.created_at).getFullYear() === filterYear)
      : typedLoans;

    const filteredPayments = filterYear
      ? typedPayments.filter((payment) => new Date(payment.payment_date).getFullYear() === filterYear)
      : typedPayments;

    // =====================================================
    // CURRENT STATE METRICS (always live, unaffected by filter)
    // =====================================================
    const active_loans = typedLoans.filter((loan) => loan.status === 'active').length;
    const overdue_loans = typedLoans.filter((loan) => loan.status === 'overdue').length;

    // Calculate payments by loan for quick lookup (using all payments)
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

    // Calculate total outstanding (current state - always live)
    let total_outstanding = 0;
    let primaryCurrency: CurrencyCode = 'PHP';

    // Find primary currency (most used)
    const currencyCount = typedLoans.reduce(
      (acc, loan) => {
        const currency = loan.currency || 'PHP';
        acc[currency] = (acc[currency] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    if (Object.keys(currencyCount).length > 0) {
      primaryCurrency = Object.entries(currencyCount).sort((a, b) => b[1] - a[1])[0][0] as CurrencyCode;
    }

    // Calculate outstanding for primary currency
    typedLoans
      .filter((loan) => (loan.currency || 'PHP') === primaryCurrency)
      .forEach((loan) => {
        if (loan.status === 'active' || loan.status === 'overdue') {
          const loanPayments = paymentsByLoan[loan.id] || [];
          const paidForLoan = loanPayments.reduce((sum, payment) => sum + payment.amount, 0);
          const interestAmount = loan.principal_amount * (loan.interest_rate / 100);
          const totalDue = loan.principal_amount + interestAmount;
          total_outstanding += Math.max(0, totalDue - paidForLoan);
        }
      });

    // =====================================================
    // FILTERED METRICS (affected by year filter)
    // =====================================================
    const total_loans = filteredLoans.length;
    const paid_loans = filteredLoans.filter((loan) => loan.status === 'paid').length;

    // Calculate unique borrowers from filtered loans
    const uniqueBorrowers = new Set(filteredLoans.map((loan) => loan.borrower_name.toLowerCase()));
    const total_borrowers = uniqueBorrowers.size;

    // Calculate payments by loan for filtered payments
    const filteredPaymentsByLoan = filteredPayments.reduce(
      (acc, payment) => {
        if (!acc[payment.loan_id]) {
          acc[payment.loan_id] = [];
        }
        acc[payment.loan_id].push(payment);
        return acc;
      },
      {} as Record<string, Payment[]>
    );

    // Group filtered loans by currency for financial calculations
    const filteredLoansByCurrency = filteredLoans.reduce(
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

    // Calculate filtered financial metrics for primary currency
    let total_collected = 0;
    let total_interest_earned = 0;

    // For total collected, sum payments in the filtered period
    filteredPayments
      .filter((payment) => {
        const loan = typedLoans.find((l) => l.id === payment.loan_id);
        return loan && (loan.currency || 'PHP') === primaryCurrency;
      })
      .forEach((payment) => {
        total_collected += payment.amount;
      });

    // For interest earned, iterate over ALL loans that have payments in the filtered period
    // (not just loans created in that period)
    typedLoans
      .filter((loan) => (loan.currency || 'PHP') === primaryCurrency)
      .forEach((loan) => {
        const loanPaymentsInPeriod = filteredPaymentsByLoan[loan.id] || [];
        const paidInPeriod = loanPaymentsInPeriod.reduce((sum, payment) => sum + payment.amount, 0);

        // Skip if no payments in this period
        if (paidInPeriod === 0) return;

        const interestAmount = loan.principal_amount * (loan.interest_rate / 100);
        const allLoanPayments = paymentsByLoan[loan.id] || [];
        const totalPaid = allLoanPayments.reduce((sum, payment) => sum + payment.amount, 0);

        // Calculate cumulative paid BEFORE this period to determine interest portion
        const paymentsBeforePeriod = allLoanPayments.filter((p) => {
          if (!filterYear) return false; // All time - no "before"
          return new Date(p.payment_date).getFullYear() < filterYear;
        });
        const paidBeforePeriod = paymentsBeforePeriod.reduce((sum, p) => sum + p.amount, 0);

        // Determine how much of the period's payments went to principal vs interest
        const principalRemainingBeforePeriod = Math.max(0, loan.principal_amount - paidBeforePeriod);
        const principalPaidInPeriod = Math.min(paidInPeriod, principalRemainingBeforePeriod);
        const interestPaidInPeriod = Math.max(0, paidInPeriod - principalPaidInPeriod);

        // Cap interest at the loan's total interest amount
        const maxInterestRemaining = Math.max(0, interestAmount - Math.max(0, paidBeforePeriod - loan.principal_amount));
        total_interest_earned += Math.min(interestPaidInPeriod, maxInterestRemaining);
      });

    // Group ALL loans by currency for financial summary
    const allLoansByCurrency = typedLoans.reduce(
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

    // Calculate financial summary per currency (based on payments in the filtered period)
    const financial_summary: CurrencyFinancialSummary[] = Object.entries(allLoansByCurrency).map(
      ([currency, currencyLoans]) => {
        // Only include loans created in the period for principal calculation
        const loansCreatedInPeriod = filterYear
          ? currencyLoans.filter((loan) => new Date(loan.created_at).getFullYear() === filterYear)
          : currencyLoans;
        const total_principal = loansCreatedInPeriod.reduce((sum, loan) => sum + loan.principal_amount, 0);

        let currency_total_paid = 0;
        let currency_total_outstanding = 0;
        let currency_total_interest_earned = 0;

        // For paid and interest, iterate over ALL loans that have payments in the period
        currencyLoans.forEach((loan) => {
          const loanPaymentsInPeriod = filteredPaymentsByLoan[loan.id] || [];
          const paidInPeriod = loanPaymentsInPeriod.reduce((sum, payment) => sum + payment.amount, 0);
          currency_total_paid += paidInPeriod;

          const interestAmount = loan.principal_amount * (loan.interest_rate / 100);
          const totalDue = loan.principal_amount + interestAmount;

          // Use all payments for outstanding calculation (current state)
          const allLoanPayments = paymentsByLoan[loan.id] || [];
          const totalPaid = allLoanPayments.reduce((sum, payment) => sum + payment.amount, 0);

          if (loan.status === 'active' || loan.status === 'overdue') {
            currency_total_outstanding += Math.max(0, totalDue - totalPaid);
          }

          // Calculate interest earned in this period
          if (paidInPeriod > 0) {
            const paymentsBeforePeriod = allLoanPayments.filter((p) => {
              if (!filterYear) return false;
              return new Date(p.payment_date).getFullYear() < filterYear;
            });
            const paidBeforePeriod = paymentsBeforePeriod.reduce((sum, p) => sum + p.amount, 0);

            const principalRemainingBeforePeriod = Math.max(0, loan.principal_amount - paidBeforePeriod);
            const principalPaidInPeriod = Math.min(paidInPeriod, principalRemainingBeforePeriod);
            const interestPaidInPeriod = Math.max(0, paidInPeriod - principalPaidInPeriod);

            const maxInterestRemaining = Math.max(0, interestAmount - Math.max(0, paidBeforePeriod - loan.principal_amount));
            currency_total_interest_earned += Math.min(interestPaidInPeriod, maxInterestRemaining);
          }
        });

        return {
          currency: currency as CurrencyCode,
          total_principal,
          total_outstanding: currency_total_outstanding,
          total_paid: currency_total_paid,
          total_interest_earned: currency_total_interest_earned,
        };
      }
    );

    const stats: DashboardStats = {
      // Current state (always live)
      active_loans,
      overdue_loans,
      total_outstanding,
      outstanding_currency: primaryCurrency,
      // Filtered by year
      total_loans,
      paid_loans,
      total_borrowers,
      total_collected,
      total_interest_earned,
      filtered_currency: primaryCurrency,
      financial_summary,
      available_years,
    };

    // Build recent activity (last 15 items) - always use all data
    const recent_activity: RecentActivity[] = [];

    typedLoans.slice(0, 10).forEach((loan) => {
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

    typedPayments.slice(0, 10).forEach((payment) => {
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
