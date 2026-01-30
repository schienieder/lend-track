import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { Loan } from '@/types/loan';
import type { Payment } from '@/types/payment';
import type { ChartDataPoint, ChartDataResponse } from '@/types/dashboard';
import type { CurrencyCode } from '@/lib/utils';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Helper to calculate interest from a payment
function calculateInterestFromPayment(payment: Payment, loan: Loan, totalPaidBefore: number): number {
  // Interest is any amount paid beyond the principal
  const remainingPrincipal = Math.max(0, loan.principal_amount - totalPaidBefore);
  const principalPortion = Math.min(payment.amount, remainingPrincipal);
  return payment.amount - principalPortion;
}

// GET /api/dashboard/chart - Get chart data for the dashboard
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const yearParam = searchParams.get('year'); // 'current', 'all', or specific year like '2024'

    // Fetch all loans for the user
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', user.id);

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
        .in('loan_id', loanIds);

      if (paymentsError) {
        return NextResponse.json({ error: paymentsError.message }, { status: 500 });
      }

      typedPayments = payments || [];
    }

    // Determine the primary currency (most used)
    const currencyCounts: Record<string, number> = {};
    typedLoans.forEach((loan) => {
      const currency = loan.currency || 'PHP';
      currencyCounts[currency] = (currencyCounts[currency] || 0) + 1;
    });
    const primaryCurrency = (Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'PHP') as CurrencyCode;

    // Filter loans by primary currency for consistent chart data
    const filteredLoans = typedLoans.filter((loan) => (loan.currency || 'PHP') === primaryCurrency);
    const filteredLoanIds = new Set(filteredLoans.map((loan) => loan.id));
    const filteredPayments = typedPayments.filter((payment) => filteredLoanIds.has(payment.loan_id));

    // Get available years from both loans and payments
    const allDates = [
      ...filteredLoans.map((loan) => new Date(loan.created_at)),
      ...filteredPayments.map((payment) => new Date(payment.payment_date)),
    ];
    const yearsSet = new Set(allDates.map((date) => date.getFullYear()));
    const availableYears = Array.from(yearsSet).sort((a, b) => b - a); // Descending order

    // Determine which year(s) to show
    const currentYear = new Date().getFullYear();
    let targetYear: number | 'all' = currentYear;

    if (yearParam === 'all') {
      targetYear = 'all';
    } else if (yearParam && yearParam !== 'current') {
      const parsedYear = parseInt(yearParam, 10);
      if (!isNaN(parsedYear) && availableYears.includes(parsedYear)) {
        targetYear = parsedYear;
      }
    }

    let chartData: ChartDataPoint[];

    // Pre-calculate cumulative payments per loan for interest calculation
    const paymentsByLoanSorted: Record<string, Payment[]> = {};
    filteredPayments.forEach((payment) => {
      if (!paymentsByLoanSorted[payment.loan_id]) {
        paymentsByLoanSorted[payment.loan_id] = [];
      }
      paymentsByLoanSorted[payment.loan_id].push(payment);
    });
    // Sort payments by date for each loan
    Object.keys(paymentsByLoanSorted).forEach((loanId) => {
      paymentsByLoanSorted[loanId].sort(
        (a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
      );
    });

    // Create a map of loan id to loan for quick lookup
    const loanMap: Record<string, Loan> = {};
    filteredLoans.forEach((loan) => {
      loanMap[loan.id] = loan;
    });

    // Calculate cumulative paid before each payment
    const cumulativePaidBefore: Record<string, number> = {};
    Object.entries(paymentsByLoanSorted).forEach(([loanId, payments]) => {
      let cumulative = 0;
      payments.forEach((payment) => {
        cumulativePaidBefore[payment.id] = cumulative;
        cumulative += payment.amount;
      });
    });

    if (targetYear === 'all') {
      // Aggregate by year
      const yearlyData: Record<number, { loans: number; payments: number; interest: number }> = {};

      availableYears.forEach((year) => {
        yearlyData[year] = { loans: 0, payments: 0, interest: 0 };
      });

      filteredLoans.forEach((loan) => {
        const year = new Date(loan.created_at).getFullYear();
        if (yearlyData[year]) {
          yearlyData[year].loans += loan.principal_amount;
        }
      });

      filteredPayments.forEach((payment) => {
        const year = new Date(payment.payment_date).getFullYear();
        if (yearlyData[year]) {
          yearlyData[year].payments += payment.amount;
          const loan = loanMap[payment.loan_id];
          if (loan) {
            const paidBefore = cumulativePaidBefore[payment.id] || 0;
            yearlyData[year].interest += calculateInterestFromPayment(payment, loan, paidBefore);
          }
        }
      });

      chartData = availableYears
        .sort((a, b) => a - b) // Ascending for chart
        .map((year) => ({
          period: year.toString(),
          loansAmount: yearlyData[year].loans,
          paymentsAmount: yearlyData[year].payments,
          interestAmount: yearlyData[year].interest,
        }));
    } else {
      // Aggregate by month for specific year
      const monthlyData: { loans: number; payments: number; interest: number }[] = Array.from(
        { length: 12 },
        () => ({
          loans: 0,
          payments: 0,
          interest: 0,
        })
      );

      filteredLoans.forEach((loan) => {
        const date = new Date(loan.created_at);
        if (date.getFullYear() === targetYear) {
          monthlyData[date.getMonth()].loans += loan.principal_amount;
        }
      });

      filteredPayments.forEach((payment) => {
        const date = new Date(payment.payment_date);
        if (date.getFullYear() === targetYear) {
          monthlyData[date.getMonth()].payments += payment.amount;
          const loan = loanMap[payment.loan_id];
          if (loan) {
            const paidBefore = cumulativePaidBefore[payment.id] || 0;
            monthlyData[date.getMonth()].interest += calculateInterestFromPayment(payment, loan, paidBefore);
          }
        }
      });

      chartData = monthlyData.map((data, index) => ({
        period: MONTH_NAMES[index],
        loansAmount: data.loans,
        paymentsAmount: data.payments,
        interestAmount: data.interest,
      }));
    }

    const response: ChartDataResponse = {
      data: chartData,
      availableYears,
      currency: primaryCurrency,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Dashboard chart error:', error);
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}
