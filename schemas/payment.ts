import { z } from 'zod';

// Payment method options
export const paymentMethodOptions = ['cash', 'check', 'bank_transfer', 'mobile_payment', 'other'] as const;
export type PaymentMethod = typeof paymentMethodOptions[number];

// Create payment schema
export const createPaymentSchema = z.object({
  amount: z
    .number({ message: 'Amount must be a valid number' })
    .positive('Amount must be greater than 0')
    .max(999999999999.99, 'Amount is too large'),
  payment_date: z
    .string()
    .min(1, 'Payment date is required')
    .refine((date) => {
      const paymentDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return paymentDate <= today;
    }, 'Payment date cannot be in the future'),
  payment_method: z
    .enum(paymentMethodOptions, {
      message: 'Please select a valid payment method',
    })
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

// Update payment schema (same as create but all fields optional)
export const updatePaymentSchema = z.object({
  amount: z
    .number({ message: 'Amount must be a valid number' })
    .positive('Amount must be greater than 0')
    .max(999999999999.99, 'Amount is too large')
    .optional(),
  payment_date: z
    .string()
    .min(1, 'Payment date is required')
    .refine((date) => {
      const paymentDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return paymentDate <= today;
    }, 'Payment date cannot be in the future')
    .optional(),
  payment_method: z
    .enum(paymentMethodOptions, {
      message: 'Please select a valid payment method',
    })
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

// Types for TypeScript
export type CreatePaymentData = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentData = z.infer<typeof updatePaymentSchema>;

// Full Payment type (includes database fields)
export interface Payment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Payment with loan info for display
export interface PaymentWithLoanInfo extends Payment {
  loan_borrower_name?: string;
  loan_principal_amount?: number;
}
