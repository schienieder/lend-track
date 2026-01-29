'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, BellOff, ExternalLink } from 'lucide-react';
import ReminderStatusBadge from '@/app/components/reminders/ReminderStatusBadge';
import { formatCurrency } from '@/lib/utils';
import type { ReminderWithLoan, ReminderSentStatus, ReminderType, ReminderQueryParams } from '@/types/reminder';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const reminderTypeLabels: Record<ReminderType, string> = {
  due_date: 'Due Date',
  overdue: 'Overdue',
  custom: 'Custom',
  loan_created: 'Loan Created',
};

const RemindersPageView = () => {
  const router = useRouter();
  const [reminders, setReminders] = useState<ReminderWithLoan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });

  const [filters, setFilters] = useState<ReminderQueryParams>({
    page: 1,
    limit: 20,
    sort_by: 'reminder_date',
    sort_order: 'asc',
  });

  const fetchReminders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));
      if (filters.sent_status) params.set('sent_status', filters.sent_status);
      if (filters.reminder_type) params.set('reminder_type', filters.reminder_type);
      if (filters.sort_by) params.set('sort_by', filters.sort_by);
      if (filters.sort_order) params.set('sort_order', filters.sort_order);

      const response = await fetch(`/api/reminders?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch reminders');
      }

      setReminders(result.reminders);
      setPagination(result.pagination);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleStatusFilterChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      sent_status: value === 'all' ? undefined : (value as ReminderSentStatus),
      page: 1,
    }));
  };

  const handleTypeFilterChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      reminder_type: value === 'all' ? undefined : (value as ReminderType),
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Calculate summary stats
  const pendingCount = reminders.filter((r) => r.sent_status === 'pending').length;
  const sentCount = reminders.filter((r) => r.sent_status === 'sent').length;
  const failedCount = reminders.filter((r) => r.sent_status === 'failed').length;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Reminders</h1>
          <p className="mt-1 text-muted-foreground">
            View and manage payment reminders across all your loans.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
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
                  <p className="text-sm text-muted-foreground">Sent</p>
                  <p className="text-2xl font-bold">{sentCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <BellOff className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold">{failedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>All Reminders</CardTitle>
              <div className="flex gap-2">
                <Select
                  value={filters.sent_status || 'all'}
                  onValueChange={handleStatusFilterChange}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.reminder_type || 'all'}
                  onValueChange={handleTypeFilterChange}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="due_date">Due Date</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {error ? (
              <div className="p-6 text-center">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" className="mt-4" onClick={fetchReminders}>
                  Try Again
                </Button>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading reminders...</p>
              </div>
            ) : reminders.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">No reminders found.</p>
              </div>
            ) : (
              <div className="rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead className="hidden sm:table-cell">Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[70px]">Loan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reminders.map((reminder) => (
                      <TableRow key={reminder.id}>
                        <TableCell className="font-medium">
                          {formatDate(reminder.reminder_date)}
                        </TableCell>
                        <TableCell>
                          {reminder.loans?.borrower_name || '-'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {reminder.loans ? formatCurrency(reminder.loans.principal_amount) : '-'}
                        </TableCell>
                        <TableCell>
                          {reminderTypeLabels[reminder.reminder_type]}
                        </TableCell>
                        <TableCell>
                          <ReminderStatusBadge status={reminder.sent_status} />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/loans/${reminder.loan_id}`)}
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View loan</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} reminders
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemindersPageView;
