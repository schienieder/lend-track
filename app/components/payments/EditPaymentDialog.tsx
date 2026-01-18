'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PaymentForm from './PaymentForm';
import type { PaymentFormData } from '@/schemas/payment';
import type { EditPaymentDialogProps } from '@/types/payment';

const EditPaymentDialog: React.FC<EditPaymentDialogProps> = ({
  payment,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: PaymentFormData) => {
    if (!payment) return;

    setIsLoading(true);
    setError(null);

    try {
      // Transform empty strings to null for API
      const apiData = {
        ...data,
        payment_method: data.payment_method || null,
        notes: data.notes || null,
      };

      const response = await fetch(`/api/loans/${payment.loan_id}/payments/${payment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update payment');
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

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
          <DialogDescription>
            Update the payment details below.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <PaymentForm payment={payment} onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
};

export default EditPaymentDialog;
