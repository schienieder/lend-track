import type { CurrencyCode } from '@/lib/utils';

// Dashboard statistics interface
export interface DashboardStats {
  // Loan counts
  total_loans: number;
  active_loans: number;
  overdue_loans: number;
  paid_loans: number;

  // Borrower count
  total_borrowers: number;

  // Financial metrics (grouped by currency)
  financial_summary: CurrencyFinancialSummary[];
}

export interface CurrencyFinancialSummary {
  currency: CurrencyCode;
  total_principal: number;
  total_outstanding: number;
  total_paid: number;
  total_interest_earned: number;
}

// Recent activity types
export type ActivityType = 'loan_created' | 'payment_received' | 'loan_paid_off' | 'loan_overdue';

export interface RecentActivity {
  id: string;
  type: ActivityType;
  description: string;
  borrower_name: string;
  amount?: number;
  currency?: CurrencyCode;
  timestamp: string;
}

// API response for dashboard
export interface DashboardResponse {
  stats: DashboardStats;
  recent_activity: RecentActivity[];
}

// API error response
export interface DashboardErrorResponse {
  error: string;
  details?: unknown;
}
