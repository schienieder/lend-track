'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loanFormSchema, type LoanFormData } from '@/schemas/loan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CURRENCIES, type CurrencyCode } from '@/lib/utils';
import type { Loan, PaymentSchedule, LoanStatus } from '@/types/loan';
import { useAuth } from '@/app/contexts/AuthContext';
import { CalendarClock } from 'lucide-react';

const paymentScheduleOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one-time', label: 'One-Time' },
];

const currencyOptions = Object.entries(CURRENCIES).map(([code, config]) => ({
  value: code,
  label: `${config.symbol} ${code}`,
}));

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'defaulted', label: 'Defaulted' },
];

function formatOrdinal(day: number): string {
  if (day === 1 || day === 21 || day === 31) return `${day}st`;
  if (day === 2 || day === 22) return `${day}nd`;
  if (day === 3 || day === 23) return `${day}rd`;
  return `${day}th`;
}

function getDayLabel(day: number): string {
  if (day <= 28) return `${formatOrdinal(day)} of every month`;
  if (day === 29) return `29th (last day in Feb)`;
  if (day === 30) return `30th (last day in shorter months)`;
  return `Last day of every month`;
}

/** Format the day for display (e.g. in badges/cards) */
export function formatReminderDay(day: number): string {
  if (day === 31) return 'Last day of month';
  if (day === 30) return '30th (or last day)';
  if (day === 29) return '29th (or last day)';
  return formatOrdinal(day);
}

export interface MonthlyReminderConfig {
  enabled: boolean;
  day: number | null;
}

interface LoanFormProps {
  loan?: Loan;
  onSubmit: (data: LoanFormData, monthlyConfig?: MonthlyReminderConfig) => Promise<void>;
  isLoading?: boolean;
  initialMonthlyConfig?: MonthlyReminderConfig;
}

const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

const LoanForm: React.FC<LoanFormProps> = ({ loan, onSubmit, isLoading, initialMonthlyConfig }) => {
  const isEditing = !!loan;
  const { user } = useAuth();
  const defaultLenderName = user?.name || user?.email || '';

  const [monthlyReminderEnabled, setMonthlyReminderEnabled] = useState(
    initialMonthlyConfig?.enabled ?? false
  );
  const [monthlyReminderDay, setMonthlyReminderDay] = useState<number | null>(
    initialMonthlyConfig?.day ?? null
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: loan
      ? {
          borrower_name: loan.borrower_name,
          borrower_email: loan.borrower_email || '',
          borrower_phone: loan.borrower_phone || '',
          lender_name: loan.lender_name,
          principal_amount: loan.principal_amount,
          interest_rate: loan.interest_rate,
          is_fixed_interest: loan.is_fixed_interest || false,
          fixed_interest_amount: loan.fixed_interest_amount || 0,
          due_date: loan.due_date.split('T')[0],
          payment_schedule: loan.payment_schedule,
          currency: loan.currency || 'PHP',
          status: loan.status,
          notes: loan.notes || '',
        }
      : {
          borrower_name: '',
          borrower_email: '',
          borrower_phone: '',
          lender_name: defaultLenderName,
          principal_amount: 0,
          interest_rate: 0,
          is_fixed_interest: false,
          fixed_interest_amount: 0,
          due_date: '',
          payment_schedule: 'monthly',
          currency: 'PHP',
          status: 'active',
          notes: '',
        },
  });

  const paymentSchedule = watch('payment_schedule');
  const currency = watch('currency');
  const status = watch('status');
  const isFixedInterest = watch('is_fixed_interest');
  const isMonthly = paymentSchedule === 'monthly';

  const handleFormSubmit = async (data: LoanFormData) => {
    const monthlyConfig: MonthlyReminderConfig | undefined = isMonthly
      ? { enabled: monthlyReminderEnabled, day: monthlyReminderDay }
      : undefined;
    await onSubmit(data, monthlyConfig);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="borrower_name">Borrower Name *</Label>
          <Input
            id="borrower_name"
            placeholder="Enter borrower name"
            aria-invalid={!!errors.borrower_name}
            {...register('borrower_name')}
          />
          {errors.borrower_name && (
            <p className="text-sm text-destructive">{errors.borrower_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="borrower_email">Borrower Email</Label>
          <Input
            id="borrower_email"
            type="email"
            placeholder="Enter borrower email"
            aria-invalid={!!errors.borrower_email}
            {...register('borrower_email')}
          />
          {errors.borrower_email && (
            <p className="text-sm text-destructive">{errors.borrower_email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="borrower_phone">Borrower Phone</Label>
          <Input
            id="borrower_phone"
            placeholder="Enter borrower phone"
            aria-invalid={!!errors.borrower_phone}
            {...register('borrower_phone')}
          />
          {errors.borrower_phone && (
            <p className="text-sm text-destructive">{errors.borrower_phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lender_name">Lender Name *</Label>
          <Input
            id="lender_name"
            placeholder="Enter lender name"
            aria-invalid={!!errors.lender_name}
            {...register('lender_name')}
          />
          {errors.lender_name && (
            <p className="text-sm text-destructive">{errors.lender_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="principal_amount">Principal Amount *</Label>
          <Input
            id="principal_amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter principal amount"
            aria-invalid={!!errors.principal_amount}
            {...register('principal_amount', { valueAsNumber: true })}
          />
          {errors.principal_amount && (
            <p className="text-sm text-destructive">{errors.principal_amount.message}</p>
          )}
        </div>

        {isFixedInterest ? (
          <div className="space-y-2">
            <Label htmlFor="fixed_interest_amount">Fixed Interest Amount *</Label>
            <Input
              id="fixed_interest_amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter fixed interest amount"
              aria-invalid={!!errors.fixed_interest_amount}
              {...register('fixed_interest_amount', { valueAsNumber: true })}
            />
            {errors.fixed_interest_amount && (
              <p className="text-sm text-destructive">{errors.fixed_interest_amount.message}</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="interest_rate">Interest Rate (%) *</Label>
            <Input
              id="interest_rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="Enter interest rate"
              aria-invalid={!!errors.interest_rate}
              {...register('interest_rate', { valueAsNumber: true })}
            />
            {errors.interest_rate && (
              <p className="text-sm text-destructive">{errors.interest_rate.message}</p>
            )}
          </div>
        )}

        <div className="hidden sm:block" />
        <div className="flex items-center gap-2">
          <Switch
            id="is_fixed_interest"
            checked={isFixedInterest || false}
            onCheckedChange={(checked) => {
              setValue('is_fixed_interest', checked);
              if (checked) {
                setValue('interest_rate', 0);
              } else {
                setValue('fixed_interest_amount', 0);
              }
            }}
          />
          <Label htmlFor="is_fixed_interest" className="text-sm cursor-pointer">
            Fixed Interest Amount?
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date *</Label>
          <Input
            id="due_date"
            type="date"
            aria-invalid={!!errors.due_date}
            {...register('due_date')}
          />
          {errors.due_date && (
            <p className="text-sm text-destructive">{errors.due_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_schedule">Payment Schedule *</Label>
          <Select
            value={paymentSchedule}
            onValueChange={(value) => {
              setValue('payment_schedule', value as PaymentSchedule);
              if (value !== 'monthly') {
                setMonthlyReminderEnabled(false);
                setMonthlyReminderDay(null);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select payment schedule" />
            </SelectTrigger>
            <SelectContent>
              {paymentScheduleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.payment_schedule && (
            <p className="text-sm text-destructive">{errors.payment_schedule.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency *</Label>
          <Select
            value={currency}
            onValueChange={(value) => setValue('currency', value as CurrencyCode)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.currency && (
            <p className="text-sm text-destructive">{errors.currency.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setValue('status', value as LoanStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>
      </div>

      {isMonthly && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="monthly_reminder_toggle">Monthly Recurring Reminder</Label>
                <p className="text-sm text-muted-foreground">
                  Send a reminder email on a specific day every month
                </p>
              </div>
            </div>
            <Switch
              id="monthly_reminder_toggle"
              checked={monthlyReminderEnabled}
              onCheckedChange={(checked) => {
                setMonthlyReminderEnabled(checked);
                if (!checked) {
                  setMonthlyReminderDay(null);
                }
              }}
            />
          </div>

          {monthlyReminderEnabled && (
            <div className="space-y-2">
              <Label>Reminder Day of Month</Label>
              <Select
                value={monthlyReminderDay?.toString() || ''}
                onValueChange={(value) => setMonthlyReminderDay(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select day of month" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="31">Last day of every month</SelectItem>
                  {dayOptions.filter((d) => d <= 30).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {getDayLabel(day)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Days 1-28 are available in every month. For days 29-31, the reminder will be sent on the last available day of shorter months (e.g., Feb 28th).
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Enter any additional notes"
          rows={3}
          aria-invalid={!!errors.notes}
          {...register('notes')}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Loan' : 'Create Loan')}
      </Button>
    </form>
  );
};

export default LoanForm;
