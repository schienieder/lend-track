import { z } from 'zod';

// Status and schedule enums as Zod schemas
export const loanStatusSchema = z.enum(['active', 'paid', 'overdue', 'defaulted']);
export const paymentScheduleSchema = z.enum(['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly', 'one-time']);

// Schema for creating a new loan
export const createLoanSchema = z.object({
  borrower_name: z
    .string()
    .min(1, 'Borrower name is required')
    .max(255, 'Borrower name must be less than 255 characters'),
  borrower_email: z
    .string()
    .email('Please enter a valid email address')
    .nullable()
    .optional()
    .transform(val => val || null),
  borrower_phone: z
    .string()
    .max(20, 'Phone number must be less than 20 characters')
    .nullable()
    .optional()
    .transform(val => val || null),
  principal_amount: z
    .number()
    .positive('Principal amount must be greater than 0')
    .max(999999999.99, 'Principal amount is too large'),
  interest_rate: z
    .number()
    .min(0, 'Interest rate cannot be negative')
    .max(100, 'Interest rate cannot exceed 100%'),
  due_date: z
    .string()
    .min(1, 'Due date is required')
    .refine(
      (date) => !isNaN(Date.parse(date)),
      'Please enter a valid date'
    ),
  payment_schedule: paymentScheduleSchema,
  status: loanStatusSchema.optional().default('active'),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .nullable()
    .optional()
    .transform(val => val || null),
});

// Schema for updating a loan (all fields optional)
export const updateLoanSchema = z.object({
  borrower_name: z
    .string()
    .min(1, 'Borrower name is required')
    .max(255, 'Borrower name must be less than 255 characters')
    .optional(),
  borrower_email: z
    .string()
    .email('Please enter a valid email address')
    .nullable()
    .optional(),
  borrower_phone: z
    .string()
    .max(20, 'Phone number must be less than 20 characters')
    .nullable()
    .optional(),
  principal_amount: z
    .number()
    .positive('Principal amount must be greater than 0')
    .max(999999999.99, 'Principal amount is too large')
    .optional(),
  interest_rate: z
    .number()
    .min(0, 'Interest rate cannot be negative')
    .max(100, 'Interest rate cannot exceed 100%')
    .optional(),
  due_date: z
    .string()
    .refine(
      (date) => !isNaN(Date.parse(date)),
      'Please enter a valid date'
    )
    .optional(),
  payment_schedule: paymentScheduleSchema.optional(),
  status: loanStatusSchema.optional(),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .nullable()
    .optional(),
});

// Schema for query parameters when listing loans
export const loanQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: loanStatusSchema.optional(),
  payment_schedule: paymentScheduleSchema.optional(),
  search: z.string().optional(),
  sort_by: z.enum(['created_at', 'due_date', 'principal_amount', 'borrower_name']).optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Form schema (input before transforms)
export const loanFormSchema = z.object({
  borrower_name: z
    .string()
    .min(1, 'Borrower name is required')
    .max(255, 'Borrower name must be less than 255 characters'),
  borrower_email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  borrower_phone: z
    .string()
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  principal_amount: z
    .number()
    .positive('Principal amount must be greater than 0')
    .max(999999999.99, 'Principal amount is too large'),
  interest_rate: z
    .number()
    .min(0, 'Interest rate cannot be negative')
    .max(100, 'Interest rate cannot exceed 100%'),
  due_date: z
    .string()
    .min(1, 'Due date is required'),
  payment_schedule: paymentScheduleSchema,
  status: loanStatusSchema.optional(),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
});

// Type inference from schemas
export type CreateLoanData = z.infer<typeof createLoanSchema>;
export type UpdateLoanData = z.infer<typeof updateLoanSchema>;
export type LoanQueryData = z.infer<typeof loanQuerySchema>;
export type LoanFormData = z.infer<typeof loanFormSchema>;
