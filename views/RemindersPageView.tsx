'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, BellOff, Clock, MoreHorizontal, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
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
    limit: 10,
    total: 0,
    total_pages: 0,
  });

  const [filters, setFilters] = useState<ReminderQueryParams>({
    page: 1,
    limit: 10,
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

  const handleLimitChange = (newLimit: string) => {
    setFilters((prev) => ({ ...prev, limit: Number(newLimit), page: 1 }));
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          <Card className="py-4">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-yellow-500/10 p-3">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-semibold text-foreground">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-500/10 p-3">
                  <Bell className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sent</p>
                  <p className="text-2xl font-semibold text-foreground">{sentCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-destructive/10 p-3">
                  <BellOff className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-semibold text-foreground">{failedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card className="py-0 gap-0">
          <CardHeader className="border-b px-6 py-4 !pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-2">
                <Select
                  value={filters.sent_status || 'all'}
                  onValueChange={handleStatusFilterChange}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.reminder_type || 'all'}
                  onValueChange={handleTypeFilterChange}
                >
                  <SelectTrigger className="w-[140px]">
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
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading reminders...</div>
              </div>
            ) : reminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No reminders found.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Reminders will appear here when loans have upcoming due dates.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead className="hidden sm:table-cell">Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminders.map((reminder) => (
                    <TableRow key={reminder.id}>
                      <TableCell className="font-medium">
                        {formatDate(reminder.reminder_date)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reminder.loans?.borrower_name || '-'}</div>
                          {reminder.loans?.borrower_email && (
                            <div className="text-sm text-muted-foreground">{reminder.loans.borrower_email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {reminder.loans ? formatCurrency(reminder.loans.principal_amount, reminder.loans.currency) : '-'}
                      </TableCell>
                      <TableCell>
                        {reminderTypeLabels[reminder.reminder_type]}
                      </TableCell>
                      <TableCell>
                        <ReminderStatusBadge status={reminder.sent_status} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/loans/${reminder.loan_id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Loan
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="border-t px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Show</span>
                <Select
                  value={String(filters.limit)}
                  onValueChange={handleLimitChange}
                >
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span>
                  of {pagination.total} {pagination.total === 1 ? 'reminder' : 'reminders'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.total_pages || 1}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.total_pages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RemindersPageView;
