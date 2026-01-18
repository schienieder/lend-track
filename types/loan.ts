// Loan status enum
export type LoanStatus = 'active' | 'paid' | 'overdue' | 'defaulted';

// Payment schedule enum
export type PaymentSchedule = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly' | 'one-time';

// Base loan interface (matches database schema)
export interface Loan {
  id: string;
  user_id: string;
  borrower_name: string;
  borrower_email: string | null;
  borrower_phone: string | null;
  principal_amount: number;
  interest_rate: number;
  due_date: string;
  payment_schedule: PaymentSchedule;
  status: LoanStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Input for creating a new loan (without auto-generated fields)
export interface CreateLoanInput {
  borrower_name: string;
  borrower_email?: string | null;
  borrower_phone?: string | null;
  principal_amount: number;
  interest_rate: number;
  due_date: string;
  payment_schedule: PaymentSchedule;
  status?: LoanStatus;
  notes?: string | null;
}

// Input for updating an existing loan
export interface UpdateLoanInput {
  borrower_name?: string;
  borrower_email?: string | null;
  borrower_phone?: string | null;
  principal_amount?: number;
  interest_rate?: number;
  due_date?: string;
  payment_schedule?: PaymentSchedule;
  status?: LoanStatus;
  notes?: string | null;
}

// Query parameters for listing loans
export interface LoanQueryParams {
  page?: number;
  limit?: number;
  status?: LoanStatus;
  payment_schedule?: PaymentSchedule;
  search?: string;
  sort_by?: 'created_at' | 'due_date' | 'principal_amount' | 'borrower_name';
  sort_order?: 'asc' | 'desc';
}

// API response for a single loan
export interface LoanResponse {
  loan: Loan;
}

// API response for loan list with pagination
export interface LoansListResponse {
  loans: Loan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// API error response
export interface LoanErrorResponse {
  error: string;
  details?: unknown;
}

// Component props interfaces
export interface LoanStatusBadgeProps {
  status: LoanStatus;
  className?: string;
}

export interface LoanFormProps {
  loan?: Loan;
  onSubmit: (data: CreateLoanInput | UpdateLoanInput) => Promise<void>;
  isLoading?: boolean;
}

export interface LoanFiltersProps {
  onFilterChange: (filters: LoanQueryParams) => void;
  currentFilters: LoanQueryParams;
}

export interface LoanTableProps {
  loans: Loan[];
  onView: (loan: Loan) => void;
  onEdit: (loan: Loan) => void;
  onDelete: (loan: Loan) => void;
  isLoading?: boolean;
}

export interface LoanCardProps {
  loan: Loan;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface CreateLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface EditLoanDialogProps {
  loan: Loan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface DeleteLoanDialogProps {
  loan: Loan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}
