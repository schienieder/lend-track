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
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Payment, PaymentTableProps } from '@/types/payment';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatPaymentMethod = (method: string | null) => {
  if (!method) return '-';
  return method
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  onEdit,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading payments...</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No payments recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="hidden sm:table-cell">Method</TableHead>
            <TableHead className="hidden md:table-cell">Notes</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">
                {formatDate(payment.payment_date)}
              </TableCell>
              <TableCell>{formatCurrency(payment.amount)}</TableCell>
              <TableCell className="hidden sm:table-cell">
                {formatPaymentMethod(payment.payment_method)}
              </TableCell>
              <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                {payment.notes || '-'}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(payment)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(payment)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentTable;
