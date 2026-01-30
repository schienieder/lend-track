'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
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

const sortOptions = [
  { value: 'created_at:desc', label: 'Newest First' },
  { value: 'created_at:asc', label: 'Oldest First' },
  { value: 'due_date:asc', label: 'Due Date (Earliest)' },
  { value: 'due_date:desc', label: 'Due Date (Latest)' },
  { value: 'principal_amount:desc', label: 'Amount (High to Low)' },
  { value: 'principal_amount:asc', label: 'Amount (Low to High)' },
  { value: 'borrower_name:asc', label: 'Borrower (A-Z)' },
  { value: 'borrower_name:desc', label: 'Borrower (Z-A)' },
];

const LoanFilters: React.FC<LoanFiltersProps> = ({ onFilterChange, currentFilters }) => {
  const [searchValue, setSearchValue] = useState(currentFilters.search || '');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search handler
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (searchValue !== (currentFilters.search || '')) {
        onFilterChange({
          ...currentFilters,
          search: searchValue || undefined,
          page: 1,
        });
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchValue, currentFilters, onFilterChange]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
    },
    []
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

  const handleSortChange = useCallback(
    (value: string) => {
      const [sort_by, sort_order] = value.split(':') as [LoanQueryParams['sort_by'], LoanQueryParams['sort_order']];
      onFilterChange({
        ...currentFilters,
        sort_by,
        sort_order,
        page: 1,
      });
    },
    [currentFilters, onFilterChange]
  );

  const currentSort = currentFilters.sort_by && currentFilters.sort_order
    ? `${currentFilters.sort_by}:${currentFilters.sort_order}`
    : 'created_at:desc';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by borrower name, email, or phone..."
          value={searchValue}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
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

        <Select
          value={currentSort}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
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
