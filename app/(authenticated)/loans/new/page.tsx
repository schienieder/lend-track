'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoanForm from '@/app/components/loans/LoanForm';
import { createLoan } from '@/connections/loan.api';
import { CreateLoanData } from '@/schemas/loan';

export default function NewLoanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateLoanData) => {
    setIsLoading(true);
    try {
      const response = await createLoan(data);
      if (response.loan) {
        router.push(`/loans/${response.loan.id}`);
      } else {
        router.push('/loans');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Loan</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Fill in the details below to create a new loan record.
          </p>
        </div>

        <LoanForm onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Create Loan" />
      </div>
    </div>
  );
}
