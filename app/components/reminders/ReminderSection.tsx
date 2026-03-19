'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Bell, AlertCircle, Send, CalendarClock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ReminderTable from '@/app/components/reminders/ReminderTable';
import ReminderConfigDialog from '@/app/components/reminders/ReminderConfigDialog';
import DeleteReminderDialog from '@/app/components/reminders/DeleteReminderDialog';
import SendReminderDialog from '@/app/components/reminders/SendReminderDialog';
import type { Reminder, ReminderConfig, ReminderSectionProps } from '@/types/reminder';

function formatReminderDay(day: number): string {
  const ordinal = (d: number) => {
    if (d === 1 || d === 21 || d === 31) return `${d}st`;
    if (d === 2 || d === 22) return `${d}nd`;
    if (d === 3 || d === 23) return `${d}rd`;
    return `${d}th`;
  };
  if (day === 31) return 'last day of month';
  if (day === 30) return '30th (or last day)';
  if (day === 29) return '29th (or last day)';
  return ordinal(day);
}

const ReminderSection: React.FC<ReminderSectionProps> = ({ loanId, loanDueDate, borrowerEmail, borrowerName, paymentSchedule }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig | null>(null);

  // Dialog states
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [isSendingReminder, setIsSendingReminder] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/loans/${loanId}/reminders?limit=100`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch reminders');
      }

      setReminders(result.reminders);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [loanId]);

  const fetchConfig = useCallback(async () => {
    try {
      const response = await fetch(`/api/loans/${loanId}/reminders/config`);
      const result = await response.json();
      if (response.ok && result.config) {
        setReminderConfig(result.config);
      }
    } catch {
      // Config fetch is non-critical
    }
  }, [loanId]);

  useEffect(() => {
    fetchReminders();
    fetchConfig();
  }, [fetchReminders, fetchConfig]);

  const handleDelete = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setDeleteDialogOpen(true);
  };

  const handleRetry = async (reminder: Reminder) => {
    setIsSendingReminder(reminder.id);
    try {
      const response = await fetch(`/api/loans/${loanId}/reminders/${reminder.id}/send`, {
        method: 'POST',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to send reminder');
      }

      fetchReminders();
    } catch (err) {
      console.error('Failed to retry reminder:', err);
    } finally {
      setIsSendingReminder(null);
    }
  };

  const handleSuccess = () => {
    fetchReminders();
    fetchConfig();
  };

  // Calculate days until due
  const daysUntilDue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(loanDueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const days = daysUntilDue();
  const pendingCount = reminders.filter(r => r.sent_status === 'pending').length;
  const sentCount = reminders.filter(r => r.sent_status === 'sent').length;
  const isMonthly = paymentSchedule === 'monthly';
  const hasMonthlyReminder = isMonthly && reminderConfig?.monthly_reminder_enabled && reminderConfig?.monthly_reminder_day;

  return (
    <div className="space-y-6">
      {/* Warning if no email */}
      {!borrowerEmail && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Email reminders cannot be sent because the borrower has no email address.
            Update the loan with a borrower email to enable reminders.
          </AlertDescription>
        </Alert>
      )}

      {/* Monthly Reminder Status */}
      {isMonthly && (
        <Card>
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <CalendarClock className="hidden sm:block h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base">Monthly Recurring Reminder</p>
                {hasMonthlyReminder ? (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Reminder sent on the <span className="font-medium text-foreground">{formatReminderDay(reminderConfig.monthly_reminder_day!)}</span> of every month
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    No monthly recurring reminder configured
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasMonthlyReminder ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="secondary">Not Set</Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfigDialogOpen(true)}
              >
                {hasMonthlyReminder ? 'Edit' : 'Set Up'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reminder Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Reminders</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Reminders Sent</p>
                <p className="text-2xl font-bold">{sentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bell className={`h-5 w-5 ${days < 0 ? 'text-red-600' : days <= 7 ? 'text-yellow-600' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-sm text-muted-foreground">
                  {days < 0 ? 'Days Overdue' : 'Days Until Due'}
                </p>
                <p className={`text-2xl font-bold ${days < 0 ? 'text-red-600' : days <= 7 ? 'text-yellow-600' : ''}`}>
                  {Math.abs(days)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminder History */}
      <Card>
        <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-medium">Reminder History</CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setSendDialogOpen(true)}
              size="sm"
              disabled={!borrowerEmail}
              className="flex-1 sm:flex-none"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Now
            </Button>
            <Button onClick={() => setConfigDialogOpen(true)} size="sm" variant="outline" className="flex-1 sm:flex-none">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchReminders}>
                Try Again
              </Button>
            </div>
          ) : (
            <ReminderTable
              reminders={reminders}
              onDelete={handleDelete}
              onRetry={handleRetry}
              isLoading={isLoading}
              sendingReminderId={isSendingReminder}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ReminderConfigDialog
        loanId={loanId}
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        onSuccess={handleSuccess}
        paymentSchedule={paymentSchedule}
      />

      <DeleteReminderDialog
        reminder={selectedReminder}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleSuccess}
      />

      <SendReminderDialog
        loanId={loanId}
        borrowerName={borrowerName}
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default ReminderSection;
