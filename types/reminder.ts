// Reminder type enum
export type ReminderType = 'due_date' | 'overdue' | 'custom' | 'loan_created';

// Reminder sent status enum
export type ReminderSentStatus = 'pending' | 'sent' | 'failed';

// Base reminder interface (matches database schema)
export interface Reminder {
  id: string;
  loan_id: string;
  reminder_type: ReminderType;
  reminder_date: string;
  sent_status: ReminderSentStatus;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

import type { CurrencyCode } from '@/lib/utils';

// Reminder with loan details (for dashboard view)
export interface ReminderWithLoan extends Reminder {
  loans?: {
    id: string;
    borrower_name: string;
    borrower_email: string | null;
    principal_amount: number;
    currency: CurrencyCode;
    due_date: string;
    status: string;
  };
}

// Base reminder config interface (matches database schema)
export interface ReminderConfig {
  id: string;
  loan_id: string;
  enabled: boolean;
  due_date_days_before: number[];
  overdue_days_after: number[];
  created_at: string;
  updated_at: string;
}

// Input for creating a new reminder
export interface CreateReminderInput {
  reminder_type: ReminderType;
  reminder_date: string;
}

// Input for updating reminder config
export interface UpdateReminderConfigInput {
  enabled?: boolean;
  due_date_days_before?: number[];
  overdue_days_after?: number[];
}

// Query parameters for listing reminders
export interface ReminderQueryParams {
  page?: number;
  limit?: number;
  sent_status?: ReminderSentStatus;
  reminder_type?: ReminderType;
  sort_by?: 'created_at' | 'reminder_date' | 'sent_at';
  sort_order?: 'asc' | 'desc';
}

// API response for a single reminder
export interface ReminderResponse {
  reminder: Reminder;
}

// API response for reminder list with pagination
export interface RemindersListResponse {
  reminders: Reminder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// API response for all reminders (dashboard view)
export interface AllRemindersListResponse {
  reminders: ReminderWithLoan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// API response for reminder config
export interface ReminderConfigResponse {
  config: ReminderConfig;
}

// API error response
export interface ReminderErrorResponse {
  error: string;
  details?: unknown;
}

// Component props interfaces
export interface ReminderStatusBadgeProps {
  status: ReminderSentStatus;
  className?: string;
}

export interface ReminderTableProps {
  reminders: Reminder[];
  onDelete?: (reminder: Reminder) => void;
  onRetry?: (reminder: Reminder) => void;
  isLoading?: boolean;
  sendingReminderId?: string | null;
}

export interface ReminderConfigFormProps {
  config: ReminderConfig | null;
  onSubmit: (data: UpdateReminderConfigInput) => Promise<void>;
  isLoading?: boolean;
}

export interface ReminderConfigDialogProps {
  loanId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface ReminderSectionProps {
  loanId: string;
  loanDueDate: string;
  borrowerEmail: string | null;
  borrowerName: string;
}

export interface DeleteReminderDialogProps {
  reminder: Reminder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}
