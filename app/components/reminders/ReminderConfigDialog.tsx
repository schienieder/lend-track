'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ReminderConfigForm from '@/app/components/reminders/ReminderConfigForm';
import type { ReminderConfig, ReminderConfigDialogProps, UpdateReminderConfigInput } from '@/types/reminder';

const ReminderConfigDialog: React.FC<ReminderConfigDialogProps> = ({
  loanId,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ReminderConfig | null>(null);

  useEffect(() => {
    if (open) {
      fetchConfig();
    }
  }, [open, loanId]);

  const fetchConfig = async () => {
    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch(`/api/loans/${loanId}/reminders/config`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch reminder config');
      }

      setConfig(result.config);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (data: UpdateReminderConfigInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/loans/${loanId}/reminders/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update reminder config');
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reminder Settings</DialogTitle>
          <DialogDescription>
            Configure when to send payment reminder emails for this loan.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        ) : (
          <ReminderConfigForm
            config={config}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReminderConfigDialog;
