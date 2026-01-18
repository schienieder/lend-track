'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import LoanFilters from '@/app/components/loans/LoanFilters';
import LoanTable from '@/app/components/loans/LoanTable';
import CreateLoanDialog from '@/app/components/loans/CreateLoanDialog';
import EditLoanDialog from '@/app/components/loans/EditLoanDialog';
import DeleteLoanDialog from '@/app/components/loans/DeleteLoanDialog';
import type { Loan, LoanQueryParams, LoansListResponse } from '@/types/loan';

const LoansPageView = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });

  const [filters, setFilters] = useState<LoanQueryParams>({
    page: 1,
    limit: 10,
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const fetchLoans = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));
      if (filters.status) params.set('status', filters.status);
      if (filters.payment_schedule) params.set('payment_schedule', filters.payment_schedule);
      if (filters.search) params.set('search', filters.search);
      if (filters.sort_by) params.set('sort_by', filters.sort_by);
      if (filters.sort_order) params.set('sort_order', filters.sort_order);

      const response = await fetch(`/api/loans?${params.toString()}`);
      const result: LoansListResponse = await response.json();

      if (!response.ok) {
        throw new Error((result as unknown as { error: string }).error || 'Failed to fetch loans');
      }

      setLoans(result.loans);
      setPagination(result.pagination);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleFilterChange = (newFilters: LoanQueryParams) => {
    setFilters(newFilters);
  };

  const handleView = (loan: Loan) => {
    // Navigation handled by LoanTable component
  };

  const handleEdit = (loan: Loan) => {
    setSelectedLoan(loan);
    setEditDialogOpen(true);
  };

  const handleDelete = (loan: Loan) => {
    setSelectedLoan(loan);
    setDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchLoans();
    setSelectedLoan(null);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Loans</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your loan records and track payments.
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Loan
          </Button>
        </div>

        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>All Loans</CardTitle>
              <LoanFilters
                currentFilters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {error ? (
              <div className="p-6 text-center">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" className="mt-4" onClick={fetchLoans}>
                  Try Again
                </Button>
              </div>
            ) : (
              <LoanTable
                loans={loans}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} loans
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

        {/* Dialogs */}
        <CreateLoanDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={handleSuccess}
        />

        <EditLoanDialog
          loan={selectedLoan}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setSelectedLoan(null);
          }}
          onSuccess={handleSuccess}
        />

        <DeleteLoanDialog
          loan={selectedLoan}
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setSelectedLoan(null);
          }}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default LoansPageView;
