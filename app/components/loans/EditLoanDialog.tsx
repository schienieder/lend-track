'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import LoanForm from '@/app/components/loans/LoanForm';
import type { MonthlyReminderConfig } from '@/app/components/loans/LoanForm';
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
  const [initialMonthlyConfig, setInitialMonthlyConfig] = useState<MonthlyReminderConfig | undefined>(undefined);
  const [configFetched, setConfigFetched] = useState(false);

  useEffect(() => {
    if (open && loan && loan.payment_schedule === 'monthly') {
      setConfigFetched(false);
      fetch(`/api/loans/${loan.id}/reminders/config`)
        .then((res) => res.json())
        .then((result) => {
          if (result.config) {
            setInitialMonthlyConfig({
              enabled: result.config.monthly_reminder_enabled ?? false,
              day: result.config.monthly_reminder_day ?? null,
            });
          }
          setConfigFetched(true);
        })
        .catch(() => {
          setConfigFetched(true);
        });
    } else if (open) {
      setInitialMonthlyConfig(undefined);
      setConfigFetched(true);
    }
  }, [open, loan]);

  const handleSubmit = async (data: LoanFormData, monthlyConfig?: MonthlyReminderConfig) => {
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

      // Save monthly reminder config
      if (data.payment_schedule === 'monthly') {
        await fetch(`/api/loans/${loan.id}/reminders/config`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            monthly_reminder_enabled: monthlyConfig?.enabled ?? false,
            monthly_reminder_day: monthlyConfig?.day ?? null,
          }),
        });
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

  const isMonthly = loan.payment_schedule === 'monthly';
  const showForm = !isMonthly || configFetched;

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

        {showForm ? (
          <LoanForm
            loan={loan}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialMonthlyConfig={initialMonthlyConfig}
          />
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditLoanDialog;
