'use client';

import React from 'react';
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
import type { Loan, PaymentSchedule, LoanStatus } from '@/types/loan';

const paymentScheduleOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one-time', label: 'One-Time' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'defaulted', label: 'Defaulted' },
];

interface LoanFormProps {
  loan?: Loan;
  onSubmit: (data: LoanFormData) => Promise<void>;
  isLoading?: boolean;
}

const LoanForm: React.FC<LoanFormProps> = ({ loan, onSubmit, isLoading }) => {
  const isEditing = !!loan;

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
          principal_amount: loan.principal_amount,
          interest_rate: loan.interest_rate,
          due_date: loan.due_date.split('T')[0],
          payment_schedule: loan.payment_schedule,
          status: loan.status,
          notes: loan.notes || '',
        }
      : {
          borrower_name: '',
          borrower_email: '',
          borrower_phone: '',
          principal_amount: 0,
          interest_rate: 0,
          due_date: '',
          payment_schedule: 'monthly',
          status: 'active',
          notes: '',
        },
  });

  const paymentSchedule = watch('payment_schedule');
  const status = watch('status');

  const handleFormSubmit = async (data: LoanFormData) => {
    await onSubmit(data);
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
            onValueChange={(value) => setValue('payment_schedule', value as PaymentSchedule)}
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

        {isEditing && (
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
        )}
      </div>

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
