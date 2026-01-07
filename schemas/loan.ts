import { z } from 'zod';

// Email regex pattern (RFC 5322 compliant)
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Payment schedule options
export const paymentScheduleOptions = ['one-time', 'monthly', 'weekly', 'custom'] as const;
export type PaymentSchedule = typeof paymentScheduleOptions[number];

// Loan status options
export const loanStatusOptions = ['active', 'paid', 'overdue', 'cancelled'] as const;
export type LoanStatus = typeof loanStatusOptions[number];

// Create loan schema
export const createLoanSchema = z.object({
  borrower_name: z
    .string()
    .min(1, 'Borrower name is required')
    .max(255, 'Borrower name must be less than 255 characters'),
  borrower_email: z
    .string()
    .regex(emailRegex, 'Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  borrower_phone: z
    .string()
    .max(50, 'Phone number must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  principal_amount: z
    .number({ message: 'Principal amount must be a valid number' })
    .positive('Principal amount must be greater than 0')
    .max(999999999999.99, 'Principal amount is too large'),
  interest_rate: z
    .number({ message: 'Interest rate must be a valid number' })
    .min(0, 'Interest rate cannot be negative')
    .max(100, 'Interest rate cannot exceed 100%'),
  due_date: z
    .string()
    .min(1, 'Due date is required')
    .refine((date) => {
      const dueDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate >= today;
    }, 'Due date must be today or in the future'),
  payment_schedule: z.enum(paymentScheduleOptions, {
    message: 'Please select a valid payment schedule',
  }),
  status: z.enum(loanStatusOptions, {
    message: 'Please select a valid status',
  }),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
});

// Update loan schema (same as create but all fields optional except id)
export const updateLoanSchema = z.object({
  borrower_name: z
    .string()
    .min(1, 'Borrower name is required')
    .max(255, 'Borrower name must be less than 255 characters')
    .optional(),
  borrower_email: z
    .string()
    .regex(emailRegex, 'Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  borrower_phone: z
    .string()
    .max(50, 'Phone number must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  principal_amount: z
    .number({ message: 'Principal amount must be a valid number' })
    .positive('Principal amount must be greater than 0')
    .max(999999999999.99, 'Principal amount is too large')
    .optional(),
  interest_rate: z
    .number({ message: 'Interest rate must be a valid number' })
    .min(0, 'Interest rate cannot be negative')
    .max(100, 'Interest rate cannot exceed 100%')
    .optional(),
  due_date: z
    .string()
    .min(1, 'Due date is required')
    .optional(),
  payment_schedule: z.enum(paymentScheduleOptions, {
    message: 'Please select a valid payment schedule',
  }).optional(),
  status: z.enum(loanStatusOptions, {
    message: 'Please select a valid status',
  }).optional(),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
});

// Query params schema for listing loans
export const loanQuerySchema = z.object({
  status: z.enum(loanStatusOptions).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['borrower_name', 'principal_amount', 'due_date', 'status', 'created_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Types for TypeScript
export type CreateLoanData = z.infer<typeof createLoanSchema>;
export type UpdateLoanData = z.infer<typeof updateLoanSchema>;
export type LoanQueryParams = z.infer<typeof loanQuerySchema>;

// Full Loan type (includes database fields)
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

// Loan with calculated balance
export interface LoanWithBalance extends Loan {
  total_paid: number;
  remaining_amount: number;
  total_interest: number;
}
