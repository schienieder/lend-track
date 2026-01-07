'use client';

import { Payment } from '@/schemas/payment';
import { Edit, Trash2 } from 'lucide-react';

interface PaymentHistoryProps {
  payments: Payment[];
  totalPaid: number;
  principalWithInterest: number;
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
  isDeleting?: string | null;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatPaymentMethod = (method: string | null): string => {
  if (!method) return '-';
  return method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ');
};

export default function PaymentHistory({
  payments,
  totalPaid,
  principalWithInterest,
  onEdit,
  onDelete,
  isDeleting,
}: PaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No payments recorded yet.
        </p>
      </div>
    );
  }

  // Calculate running balance for each payment (from oldest to newest, then reverse for display)
  const paymentsWithBalance = [...payments]
    .sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime())
    .reduce<(Payment & { runningBalance: number })[]>((acc, payment, index) => {
      const previousBalance = index === 0
        ? principalWithInterest
        : acc[index - 1].runningBalance;
      const runningBalance = previousBalance - Number(payment.amount);
      return [...acc, { ...payment, runningBalance }];
    }, [])
    .reverse(); // Reverse to show newest first

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Total Paid
        </span>
        <span className="text-lg font-semibold text-green-600 dark:text-green-400">
          {formatCurrency(totalPaid)}
        </span>
      </div>

      {/* Payment List */}
      <div className="space-y-3">
        {paymentsWithBalance.map((payment) => (
          <div
            key={payment.id}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(Number(payment.amount))}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(payment.payment_date)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Method: {formatPaymentMethod(payment.payment_method)}</span>
                  <span>Balance: {formatCurrency(Math.max(0, payment.runningBalance))}</span>
                </div>
                {payment.notes && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 truncate">
                    {payment.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onEdit(payment)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Edit payment"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(payment)}
                  disabled={isDeleting === payment.id}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Delete payment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
