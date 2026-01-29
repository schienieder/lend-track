'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, RefreshCw, Send, Loader2 } from 'lucide-react';
import ReminderStatusBadge from './ReminderStatusBadge';
import type { ReminderTableProps, ReminderType } from '@/types/reminder';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const reminderTypeLabels: Record<ReminderType, string> = {
  due_date: 'Due Date',
  overdue: 'Overdue',
  custom: 'Custom',
};

const ReminderTable: React.FC<ReminderTableProps> = ({
  reminders,
  onDelete,
  onRetry,
  isLoading,
  sendingReminderId,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading reminders...</p>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No reminders scheduled.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Sent At</TableHead>
            {(onDelete || onRetry) && <TableHead className="w-[70px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {reminders.map((reminder) => (
            <TableRow key={reminder.id}>
              <TableCell className="font-medium">
                {formatDate(reminder.reminder_date)}
              </TableCell>
              <TableCell>{reminderTypeLabels[reminder.reminder_type]}</TableCell>
              <TableCell>
                <ReminderStatusBadge status={reminder.sent_status} />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {formatDateTime(reminder.sent_at)}
              </TableCell>
              {(onDelete || onRetry) && (
                <TableCell>
                  {sendingReminderId === reminder.id ? (
                    <Button variant="ghost" size="icon" disabled>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </Button>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onRetry && reminder.sent_status === 'failed' && (
                          <DropdownMenuItem onClick={() => onRetry(reminder)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                          </DropdownMenuItem>
                        )}
                        {onRetry && reminder.sent_status === 'pending' && (
                          <DropdownMenuItem onClick={() => onRetry(reminder)}>
                            <Send className="mr-2 h-4 w-4" />
                            Send Now
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete(reminder)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReminderTable;
