'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reminderConfigFormSchema, type ReminderConfigFormData } from '@/schemas/reminder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import type { ReminderConfig, ReminderConfigFormProps } from '@/types/reminder';

function formatDayLabel(day: number): string {
  const ordinal = (d: number) => {
    if (d === 1 || d === 21 || d === 31) return `${d}st`;
    if (d === 2 || d === 22) return `${d}nd`;
    if (d === 3 || d === 23) return `${d}rd`;
    return `${d}th`;
  };
  if (day <= 28) return ordinal(day);
  if (day === 29) return '29th (last day in Feb)';
  if (day === 30) return '30th (last day in shorter months)';
  return 'Last day of every month';
}

const ReminderConfigForm: React.FC<ReminderConfigFormProps> = ({
  config,
  onSubmit,
  isLoading,
  paymentSchedule,
}) => {
  const [dueDateDays, setDueDateDays] = useState<number[]>(
    config?.due_date_days_before || [7, 3, 1]
  );
  const [overdueDays, setOverdueDays] = useState<number[]>(
    config?.overdue_days_after || [1, 7, 14]
  );
  const [newDueDateDay, setNewDueDateDay] = useState<string>('');
  const [newOverdueDay, setNewOverdueDay] = useState<string>('');

  const isMonthly = paymentSchedule === 'monthly';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReminderConfigFormData>({
    resolver: zodResolver(reminderConfigFormSchema),
    defaultValues: {
      enabled: config?.enabled ?? true,
      due_date_days_before: config?.due_date_days_before || [7, 3, 1],
      overdue_days_after: config?.overdue_days_after || [1, 7, 14],
      monthly_reminder_enabled: config?.monthly_reminder_enabled ?? false,
      monthly_reminder_day: config?.monthly_reminder_day ?? null,
    },
  });

  const enabled = watch('enabled');
  const monthlyReminderEnabled = watch('monthly_reminder_enabled');
  const monthlyReminderDay = watch('monthly_reminder_day');

  const handleAddDueDateDay = () => {
    const day = parseInt(newDueDateDay);
    if (!isNaN(day) && day >= 0 && day <= 365 && !dueDateDays.includes(day)) {
      const newDays = [...dueDateDays, day].sort((a, b) => b - a);
      setDueDateDays(newDays);
      setValue('due_date_days_before', newDays);
      setNewDueDateDay('');
    }
  };

  const handleRemoveDueDateDay = (day: number) => {
    const newDays = dueDateDays.filter((d) => d !== day);
    setDueDateDays(newDays);
    setValue('due_date_days_before', newDays);
  };

  const handleAddOverdueDay = () => {
    const day = parseInt(newOverdueDay);
    if (!isNaN(day) && day >= 0 && day <= 365 && !overdueDays.includes(day)) {
      const newDays = [...overdueDays, day].sort((a, b) => a - b);
      setOverdueDays(newDays);
      setValue('overdue_days_after', newDays);
      setNewOverdueDay('');
    }
  };

  const handleRemoveOverdueDay = (day: number) => {
    const newDays = overdueDays.filter((d) => d !== day);
    setOverdueDays(newDays);
    setValue('overdue_days_after', newDays);
  };

  const handleFormSubmit = async (data: ReminderConfigFormData) => {
    await onSubmit({
      enabled: data.enabled,
      due_date_days_before: dueDateDays,
      overdue_days_after: overdueDays,
      monthly_reminder_enabled: data.monthly_reminder_enabled,
      monthly_reminder_day: data.monthly_reminder_day,
    });
  };

  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="enabled">Enable Reminders</Label>
          <p className="text-sm text-muted-foreground">
            Automatically send email reminders for this loan
          </p>
        </div>
        <Switch
          id="enabled"
          checked={enabled}
          onCheckedChange={(checked: boolean) => setValue('enabled', checked)}
        />
      </div>

      {enabled && (
        <>
          {isMonthly && (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="monthly_reminder_enabled">Monthly Recurring Reminder</Label>
                  <p className="text-sm text-muted-foreground">
                    Send a reminder on a specific day every month
                  </p>
                </div>
                <Switch
                  id="monthly_reminder_enabled"
                  checked={monthlyReminderEnabled}
                  onCheckedChange={(checked: boolean) => {
                    setValue('monthly_reminder_enabled', checked);
                    if (!checked) {
                      setValue('monthly_reminder_day', null);
                    }
                  }}
                />
              </div>

              {monthlyReminderEnabled && (
                <div className="space-y-2">
                  <Label>Day of Month</Label>
                  <Select
                    value={monthlyReminderDay?.toString() || ''}
                    onValueChange={(value) => setValue('monthly_reminder_day', parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select day of month" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      <SelectItem value="31">Last day of every month</SelectItem>
                      {dayOptions.filter((d) => d <= 30).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {formatDayLabel(day)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Days 1-28 are available in every month. For days 29-31, the reminder will be sent on the last available day of shorter months (e.g., Feb 28th).
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <Label>Days Before Due Date</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Send reminders this many days before the loan is due
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {dueDateDays.map((day) => (
                <Badge
                  key={day}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {day} {day === 1 ? 'day' : 'days'}
                  <button
                    type="button"
                    onClick={() => handleRemoveDueDateDay(day)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                max="365"
                placeholder="Days"
                value={newDueDateDay}
                onChange={(e) => setNewDueDateDay(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDueDateDay();
                  }
                }}
                className="w-24"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDueDateDay}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label>Days After Due Date (Overdue)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Send reminders this many days after the loan becomes overdue
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {overdueDays.map((day) => (
                <Badge
                  key={day}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {day} {day === 1 ? 'day' : 'days'}
                  <button
                    type="button"
                    onClick={() => handleRemoveOverdueDay(day)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                max="365"
                placeholder="Days"
                value={newOverdueDay}
                onChange={(e) => setNewOverdueDay(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddOverdueDay();
                  }
                }}
                className="w-24"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOverdueDay}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  );
};

export default ReminderConfigForm;
