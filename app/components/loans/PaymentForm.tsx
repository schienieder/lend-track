'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createPaymentSchema,
  CreatePaymentData,
  Payment,
  paymentMethodOptions,
} from '@/schemas/payment';
import { useState, useEffect } from 'react';

interface PaymentFormProps {
  initialData?: Partial<Payment>;
  remainingBalance: number;
  onSubmit: (data: CreatePaymentData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function PaymentForm({
  initialData,
  remainingBalance,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Record Payment',
}: PaymentFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [balanceAfterPayment, setBalanceAfterPayment] = useState<number>(remainingBalance);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreatePaymentData>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      amount: initialData?.amount || undefined,
      payment_date: initialData?.payment_date
        ? new Date(initialData.payment_date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      payment_method: initialData?.payment_method || '',
      notes: initialData?.notes || '',
    },
  });

  // Watch the amount field to calculate balance after payment
  const watchAmount = watch('amount');

  useEffect(() => {
    const amount = Number(watchAmount) || 0;
    // For edit mode, add back the original amount before subtracting new amount
    const originalAmount = initialData?.amount || 0;
    const adjustedBalance = remainingBalance + originalAmount - amount;
    setBalanceAfterPayment(Math.max(0, adjustedBalance));
  }, [watchAmount, remainingBalance, initialData?.amount]);

  const handleFormSubmit = async (data: CreatePaymentData) => {
    try {
      setError(null);
      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Balance Info */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Current Balance:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(remainingBalance + (initialData?.amount || 0))}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">After Payment:</span>
          <span className={`font-medium ${balanceAfterPayment === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
            {formatCurrency(balanceAfterPayment)}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Payment Amount *
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="amount"
            step="0.01"
            min="0"
            {...register('amount', { valueAsNumber: true })}
            className="block w-full pl-7 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="0.00"
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Payment Date */}
      <div>
        <label
          htmlFor="payment_date"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Payment Date *
        </label>
        <input
          type="date"
          id="payment_date"
          {...register('payment_date')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
        />
        {errors.payment_date && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.payment_date.message}
          </p>
        )}
      </div>

      {/* Payment Method */}
      <div>
        <label
          htmlFor="payment_method"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Payment Method
        </label>
        <select
          id="payment_method"
          {...register('payment_method')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
        >
          <option value="">Select method (optional)</option>
          {paymentMethodOptions.map((method) => (
            <option key={method} value={method}>
              {method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>
        {errors.payment_method && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.payment_method.message}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          rows={2}
          {...register('notes')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
          placeholder="Add any notes about this payment..."
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.notes.message}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
