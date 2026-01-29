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
import { X, Plus } from 'lucide-react';
import type { ReminderConfig, ReminderConfigFormProps } from '@/types/reminder';

const ReminderConfigForm: React.FC<ReminderConfigFormProps> = ({
  config,
  onSubmit,
  isLoading,
}) => {
  const [dueDateDays, setDueDateDays] = useState<number[]>(
    config?.due_date_days_before || [7, 3, 1]
  );
  const [overdueDays, setOverdueDays] = useState<number[]>(
    config?.overdue_days_after || [1, 7, 14]
  );
  const [newDueDateDay, setNewDueDateDay] = useState<string>('');
  const [newOverdueDay, setNewOverdueDay] = useState<string>('');

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
    },
  });

  const enabled = watch('enabled');

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
    });
  };

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
