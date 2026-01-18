// Payment method enum
export type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'mobile_payment' | 'other';

// Base payment interface (matches database schema)
export interface Payment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Input for creating a new payment
export interface CreatePaymentInput {
  amount: number;
  payment_date: string;
  payment_method?: PaymentMethod | null;
  notes?: string | null;
}

// Input for updating an existing payment
export interface UpdatePaymentInput {
  amount?: number;
  payment_date?: string;
  payment_method?: PaymentMethod | null;
  notes?: string | null;
}

// Query parameters for listing payments
export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'payment_date' | 'amount';
  sort_order?: 'asc' | 'desc';
}

// API response for a single payment
export interface PaymentResponse {
  payment: Payment;
}

// API response for payment list with pagination
export interface PaymentsListResponse {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  summary: {
    total_paid: number;
    remaining_balance: number;
    payment_count: number;
  };
}

// API error response
export interface PaymentErrorResponse {
  error: string;
  details?: unknown;
}

// Component props interfaces
export interface PaymentFormProps {
  payment?: Payment;
  onSubmit: (data: CreatePaymentInput | UpdatePaymentInput) => Promise<void>;
  isLoading?: boolean;
}

export interface PaymentTableProps {
  payments: Payment[];
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
  isLoading?: boolean;
}

export interface CreatePaymentDialogProps {
  loanId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface EditPaymentDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface DeletePaymentDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}
