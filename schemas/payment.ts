import { z } from 'zod';

// Payment method enum as Zod schema
export const paymentMethodSchema = z.enum(['cash', 'bank_transfer', 'check', 'mobile_payment', 'other']);

// Schema for creating a new payment
export const createPaymentSchema = z.object({
  amount: z
    .number()
    .positive('Payment amount must be greater than 0')
    .max(999999999.99, 'Payment amount is too large'),
  payment_date: z
    .string()
    .min(1, 'Payment date is required')
    .refine(
      (date) => !isNaN(Date.parse(date)),
      'Please enter a valid date'
    ),
  payment_method: paymentMethodSchema
    .nullable()
    .optional()
    .transform(val => val || null),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .nullable()
    .optional()
    .transform(val => val || null),
});

// Schema for updating a payment (all fields optional)
export const updatePaymentSchema = z.object({
  amount: z
    .number()
    .positive('Payment amount must be greater than 0')
    .max(999999999.99, 'Payment amount is too large')
    .optional(),
  payment_date: z
    .string()
    .refine(
      (date) => !isNaN(Date.parse(date)),
      'Please enter a valid date'
    )
    .optional(),
  payment_method: paymentMethodSchema
    .nullable()
    .optional(),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .nullable()
    .optional(),
});

// Schema for query parameters when listing payments
export const paymentQuerySchema = z.object({
  page: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.coerce.number().int().positive().optional().default(1)
  ),
  limit: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.coerce.number().int().positive().max(100).optional().default(10)
  ),
  sort_by: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.enum(['created_at', 'payment_date', 'amount']).optional().default('payment_date')
  ),
  sort_order: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.enum(['asc', 'desc']).optional().default('desc')
  ),
});

// Form schema (input before transforms)
export const paymentFormSchema = z.object({
  amount: z
    .number()
    .positive('Payment amount must be greater than 0')
    .max(999999999.99, 'Payment amount is too large'),
  payment_date: z
    .string()
    .min(1, 'Payment date is required'),
  payment_method: paymentMethodSchema
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
});

// Type inference from schemas
export type CreatePaymentData = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentData = z.infer<typeof updatePaymentSchema>;
export type PaymentQueryData = z.infer<typeof paymentQuerySchema>;
export type PaymentFormData = z.infer<typeof paymentFormSchema>;
