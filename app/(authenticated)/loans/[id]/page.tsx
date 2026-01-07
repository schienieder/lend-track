'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, Percent, Clock } from 'lucide-react';
import LoanForm from '@/app/components/loans/LoanForm';
import { fetchLoan, updateLoan, deleteLoan } from '@/connections/loan.api';
import { LoanWithBalance, LoanStatus, CreateLoanData } from '@/schemas/loan';

const statusColors: Record<LoanStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function LoanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  const [loan, setLoan] = useState<LoanWithBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadLoan = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchLoan(id);
        setLoan(response.loan);
      } catch (err: any) {
        setError(err.message || 'Failed to load loan');
      } finally {
        setLoading(false);
      }
    };

    loadLoan();
  }, [id]);

  const handleUpdate = async (data: CreateLoanData) => {
    setIsUpdating(true);
    try {
      await updateLoan(id, data);
      const response = await fetchLoan(id);
      setLoan(response.loan);
      router.push(`/loans/${id}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteLoan(id);
      router.push('/loans');
    } catch (err: any) {
      setError(err.message || 'Failed to delete loan');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
            {error || 'Loan not found'}
          </div>
          <Link
            href="/loans"
            className="mt-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to loans
          </Link>
        </div>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link
              href={`/loans/${id}`}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to details
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Edit Loan</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Update the loan details below.
            </p>
          </div>

          <LoanForm
            initialData={loan}
            onSubmit={handleUpdate}
            isLoading={isUpdating}
            submitLabel="Update Loan"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/loans"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to loans
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {/* Loan Header */}
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loan.borrower_name}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Created on {formatDate(loan.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[loan.status]}`}
                >
                  {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                </span>
                <Link
                  href={`/loans/${id}?edit=true`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Loan Summary Cards */}
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Principal</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(loan.principal_amount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <Percent className="h-8 w-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Interest</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {loan.interest_rate}% ({formatCurrency(loan.total_interest)})
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Remaining</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(loan.remaining_amount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDate(loan.due_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Loan Details
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Borrower Email
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {loan.borrower_email || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Borrower Phone
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {loan.borrower_phone || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Payment Schedule
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {loan.payment_schedule.charAt(0).toUpperCase() +
                    loan.payment_schedule.slice(1).replace('-', ' ')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Paid
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatCurrency(loan.total_paid)}
                </dd>
              </div>
              {loan.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {loan.notes}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Payment History Placeholder */}
          <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Payment History</h2>
              <button
                disabled
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              >
                <Clock className="h-4 w-4 mr-1" />
                Record Payment (Coming Soon)
              </button>
            </div>
            {loan.total_paid === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No payments recorded yet.</p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total paid: {formatCurrency(loan.total_paid)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Loan</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this loan? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
