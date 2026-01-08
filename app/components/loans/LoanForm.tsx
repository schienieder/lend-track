'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createLoanSchema,
  CreateLoanData,
  Loan,
  paymentScheduleOptions,
  loanStatusOptions,
} from '@/schemas/loan';
import { useState } from 'react';

interface LoanFormProps {
  initialData?: Partial<Loan>;
  onSubmit: (data: CreateLoanData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function LoanForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Create Loan',
}: LoanFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLoanData>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      borrower_name: initialData?.borrower_name || '',
      borrower_email: initialData?.borrower_email || '',
      borrower_phone: initialData?.borrower_phone || '',
      principal_amount: initialData?.principal_amount || undefined,
      interest_rate: initialData?.interest_rate ?? 0,
      due_date: initialData?.due_date
        ? new Date(initialData.due_date).toISOString().split('T')[0]
        : '',
      payment_schedule: initialData?.payment_schedule || 'one-time',
      status: initialData?.status || 'active',
      notes: initialData?.notes || '',
    },
  });

  const handleFormSubmit = async (data: CreateLoanData) => {
    try {
      setError(null);
      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Borrower Information */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Borrower Information
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="borrower_name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Borrower Name *
            </label>
            <input
              type="text"
              id="borrower_name"
              {...register('borrower_name')}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
              placeholder="Enter borrower's name"
            />
            {errors.borrower_name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.borrower_name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="borrower_email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email (Optional)
            </label>
            <input
              type="email"
              id="borrower_email"
              {...register('borrower_email')}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
              placeholder="borrower@example.com"
            />
            {errors.borrower_email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.borrower_email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="borrower_phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Phone (Optional)
            </label>
            <input
              type="tel"
              id="borrower_phone"
              {...register('borrower_phone')}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
              placeholder="+1 (555) 123-4567"
            />
            {errors.borrower_phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.borrower_phone.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Loan Details */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Loan Details
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="principal_amount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Principal Amount *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="principal_amount"
                step="0.01"
                min="0"
                {...register('principal_amount', { valueAsNumber: true })}
                className="block w-full pl-7 pr-3 py-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="0.00"
              />
            </div>
            {errors.principal_amount && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.principal_amount.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="interest_rate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Interest Rate (%) *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="interest_rate"
                step="0.01"
                min="0"
                max="100"
                {...register('interest_rate', { valueAsNumber: true })}
                className="block w-full pr-8 pl-3 py-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">%</span>
              </div>
            </div>
            {errors.interest_rate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.interest_rate.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="due_date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Due Date *
            </label>
            <input
              type="date"
              id="due_date"
              {...register('due_date')}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
            />
            {errors.due_date && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.due_date.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="payment_schedule"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Payment Schedule *
            </label>
            <select
              id="payment_schedule"
              {...register('payment_schedule')}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
            >
              {paymentScheduleOptions.map((schedule) => (
                <option key={schedule} value={schedule}>
                  {schedule.charAt(0).toUpperCase() + schedule.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
            {errors.payment_schedule && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.payment_schedule.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Status
            </label>
            <select
              id="status"
              {...register('status')}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
            >
              {loanStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              {...register('notes')}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white sm:text-sm px-3 py-2"
              placeholder="Add any additional notes about this loan..."
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.notes.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel ?? (() => window.history.back())}
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
