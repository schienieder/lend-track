'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LoanForm from './LoanForm';
import type { LoanFormData } from '@/schemas/loan';
import type { EditLoanDialogProps } from '@/types/loan';

const EditLoanDialog: React.FC<EditLoanDialogProps> = ({
  loan,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: LoanFormData) => {
    if (!loan) return;

    setIsLoading(true);
    setError(null);

    try {
      // Transform empty strings to null for API
      const apiData = {
        ...data,
        borrower_email: data.borrower_email || null,
        borrower_phone: data.borrower_phone || null,
        notes: data.notes || null,
      };

      const response = await fetch(`/api/loans/${loan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update loan');
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Loan</DialogTitle>
          <DialogDescription>
            Update the loan details for {loan.borrower_name}.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <LoanForm loan={loan} onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
};

export default EditLoanDialog;
