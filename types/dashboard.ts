import type { CurrencyCode } from '@/lib/utils';

// Dashboard statistics interface
export interface DashboardStats {
  // Current state metrics (always live, unaffected by year filter)
  active_loans: number;
  overdue_loans: number;
  total_outstanding: number;
  outstanding_currency: CurrencyCode;

  // Filtered metrics (affected by year filter)
  total_loans: number;
  paid_loans: number;
  total_borrowers: number;
  total_collected: number;
  total_interest_earned: number;
  filtered_currency: CurrencyCode;

  // Financial metrics (grouped by currency) - filtered by year
  financial_summary: CurrencyFinancialSummary[];

  // Available years for the dropdown
  available_years: number[];
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

// Chart data types
export interface ChartDataPoint {
  period: string; // Month name (e.g., "Jan") or year (e.g., "2024")
  loansAmount: number;
  paymentsAmount: number;
  interestAmount: number;
}

export interface ChartDataResponse {
  data: ChartDataPoint[];
  availableYears: number[];
  currency: CurrencyCode;
}
