import { z } from 'zod';

// Reminder type enum as Zod schema
export const reminderTypeSchema = z.enum(['due_date', 'overdue', 'custom']);

// Reminder sent status enum as Zod schema
export const reminderSentStatusSchema = z.enum(['pending', 'sent', 'failed']);

// Schema for creating a new reminder
export const createReminderSchema = z.object({
  reminder_type: reminderTypeSchema,
  reminder_date: z
    .string()
    .min(1, 'Reminder date is required')
    .refine(
      (date) => !isNaN(Date.parse(date)),
      'Please enter a valid date'
    ),
});

// Schema for updating reminder config
export const updateReminderConfigSchema = z.object({
  enabled: z.boolean().optional(),
  due_date_days_before: z
    .array(z.number().int().min(0).max(365))
    .min(0)
    .max(10)
    .optional(),
  overdue_days_after: z
    .array(z.number().int().min(0).max(365))
    .min(0)
    .max(10)
    .optional(),
  monthly_reminder_enabled: z.boolean().optional(),
  monthly_reminder_day: z.number().int().min(1).max(31).nullable().optional(),
});

// Schema for query parameters when listing reminders
export const reminderQuerySchema = z.object({
  page: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.coerce.number().int().positive().optional().default(1)
  ),
  limit: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.coerce.number().int().positive().max(100).optional().default(10)
  ),
  sent_status: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    reminderSentStatusSchema.optional()
  ),
  reminder_type: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    reminderTypeSchema.optional()
  ),
  sort_by: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.enum(['created_at', 'reminder_date', 'sent_at']).optional().default('reminder_date')
  ),
  sort_order: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.enum(['asc', 'desc']).optional().default('asc')
  ),
});

// Form schema for reminder config (for UI validation)
export const reminderConfigFormSchema = z.object({
  enabled: z.boolean(),
  due_date_days_before: z
    .array(z.number().int().min(0).max(365))
    .min(0)
    .max(10),
  overdue_days_after: z
    .array(z.number().int().min(0).max(365))
    .min(0)
    .max(10),
  monthly_reminder_enabled: z.boolean(),
  monthly_reminder_day: z.number().int().min(1).max(31).nullable(),
});

// Type inference from schemas
export type CreateReminderData = z.infer<typeof createReminderSchema>;
export type UpdateReminderConfigData = z.infer<typeof updateReminderConfigSchema>;
export type ReminderQueryData = z.infer<typeof reminderQuerySchema>;
export type ReminderConfigFormData = z.infer<typeof reminderConfigFormSchema>;
