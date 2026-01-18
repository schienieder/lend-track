'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import PaymentTable from './PaymentTable';
import PaymentSummary from './PaymentSummary';
import CreatePaymentDialog from './CreatePaymentDialog';
import EditPaymentDialog from './EditPaymentDialog';
import DeletePaymentDialog from './DeletePaymentDialog';
import type { Payment } from '@/types/payment';
import type { Loan } from '@/types/loan';

interface PaymentSectionProps {
  loan: Loan;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ loan }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Summary state
  const [summary, setSummary] = useState({
    total_paid: 0,
    remaining_balance: 0,
    payment_count: 0,
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/loans/${loan.id}/payments?limit=100`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch payments');
      }

      setPayments(result.payments);
      setSummary(result.summary);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [loan.id]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setEditDialogOpen(true);
  };

  const handleDelete = (payment: Payment) => {
    setSelectedPayment(payment);
    setDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchPayments();
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <PaymentSummary
        totalPaid={summary.total_paid}
        remainingBalance={summary.remaining_balance}
        paymentCount={summary.payment_count}
        principalAmount={loan.principal_amount}
        interestRate={loan.interest_rate}
      />

      {/* Payment History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium">Payment History</CardTitle>
          <Button onClick={() => setCreateDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchPayments}>
                Try Again
              </Button>
            </div>
          ) : (
            <PaymentTable
              payments={payments}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreatePaymentDialog
        loanId={loan.id}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSuccess}
      />

      <EditPaymentDialog
        payment={selectedPayment}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleSuccess}
      />

      <DeletePaymentDialog
        payment={selectedPayment}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default PaymentSection;
