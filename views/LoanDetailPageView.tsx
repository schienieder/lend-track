'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import LoanCard from '@/app/components/loans/LoanCard';
import EditLoanDialog from '@/app/components/loans/EditLoanDialog';
import DeleteLoanDialog from '@/app/components/loans/DeleteLoanDialog';
import type { Loan } from '@/types/loan';

interface LoanDetailPageViewProps {
  loanId: string;
}

const LoanDetailPageView: React.FC<LoanDetailPageViewProps> = ({ loanId }) => {
  const router = useRouter();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchLoan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/loans/${loanId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch loan');
      }

      setLoan(result.loan);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoan();
  }, [loanId]);

  const handleEditSuccess = () => {
    fetchLoan();
  };

  const handleDeleteSuccess = () => {
    router.push('/loans');
  };

  if (isLoading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading loan details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push('/loans')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Loans
          </Button>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchLoan}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push('/loans')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Loans
          </Button>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">Loan not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push('/loans')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Loans
        </Button>

        <LoanCard
          loan={loan}
          onEdit={() => setEditDialogOpen(true)}
          onDelete={() => setDeleteDialogOpen(true)}
        />

        {/* Dialogs */}
        <EditLoanDialog
          loan={loan}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleEditSuccess}
        />

        <DeleteLoanDialog
          loan={loan}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </div>
  );
};

export default LoanDetailPageView;
