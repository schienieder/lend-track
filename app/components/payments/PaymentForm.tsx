'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentFormSchema, type PaymentFormData } from '@/schemas/payment';
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
import type { Payment, PaymentMethod } from '@/types/payment';

const paymentMethodOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'mobile_payment', label: 'Mobile Payment' },
  { value: 'other', label: 'Other' },
];

interface PaymentFormProps {
  payment?: Payment;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  isLoading?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ payment, onSubmit, isLoading }) => {
  const isEditing = !!payment;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: payment
      ? {
          amount: payment.amount,
          payment_date: payment.payment_date.split('T')[0],
          payment_method: payment.payment_method || '',
          notes: payment.notes || '',
        }
      : {
          amount: 0,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: '',
          notes: '',
        },
  });

  const paymentMethod = watch('payment_method');

  const handleFormSubmit = async (data: PaymentFormData) => {
    await onSubmit(data);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter payment amount"
            aria-invalid={!!errors.amount}
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_date">Payment Date *</Label>
          <Input
            id="payment_date"
            type="date"
            aria-invalid={!!errors.payment_date}
            {...register('payment_date')}
          />
          {errors.payment_date && (
            <p className="text-sm text-destructive">{errors.payment_date.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="payment_method">Payment Method</Label>
          <Select
            value={paymentMethod || ''}
            onValueChange={(value) => setValue('payment_method', value as PaymentMethod)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.payment_method && (
            <p className="text-sm text-destructive">{errors.payment_method.message}</p>
          )}
        </div>
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
        {isLoading ? (isEditing ? 'Updating...' : 'Recording...') : (isEditing ? 'Update Payment' : 'Record Payment')}
      </Button>
    </form>
  );
};

export default PaymentForm;
