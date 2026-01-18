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
import type { CreateLoanDialogProps } from '@/types/loan';

const CreateLoanDialog: React.FC<CreateLoanDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: LoanFormData) => {
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

      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create loan');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Loan</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new loan record.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <LoanForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateLoanDialog;
