'use client';

import React, { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { LoanFiltersProps, LoanQueryParams } from '@/types/loan';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'defaulted', label: 'Defaulted' },
];

const scheduleOptions = [
  { value: 'all', label: 'All Schedules' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one-time', label: 'One-Time' },
];

const LoanFilters: React.FC<LoanFiltersProps> = ({ onFilterChange, currentFilters }) => {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange({
        ...currentFilters,
        search: e.target.value || undefined,
        page: 1,
      });
    },
    [currentFilters, onFilterChange]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      onFilterChange({
        ...currentFilters,
        status: value === 'all' ? undefined : (value as LoanQueryParams['status']),
        page: 1,
      });
    },
    [currentFilters, onFilterChange]
  );

  const handleScheduleChange = useCallback(
    (value: string) => {
      onFilterChange({
        ...currentFilters,
        payment_schedule: value === 'all' ? undefined : (value as LoanQueryParams['payment_schedule']),
        page: 1,
      });
    },
    [currentFilters, onFilterChange]
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by borrower name, email, or phone..."
          value={currentFilters.search || ''}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2">
        <Select
          value={currentFilters.status || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentFilters.payment_schedule || 'all'}
          onValueChange={handleScheduleChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Schedule" />
          </SelectTrigger>
          <SelectContent>
            {scheduleOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LoanFilters;
