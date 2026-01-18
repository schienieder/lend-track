'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Mail, Phone, Calendar, Percent, DollarSign, FileText, Clock } from 'lucide-react';
import LoanStatusBadge from './LoanStatusBadge';
import type { LoanCardProps, PaymentSchedule } from '@/types/loan';

const scheduleLabels: Record<PaymentSchedule, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  'bi-weekly': 'Bi-Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  'one-time': 'One-Time',
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const LoanCard: React.FC<LoanCardProps> = ({ loan, onEdit, onDelete }) => {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{loan.borrower_name}</CardTitle>
            <div className="mt-2">
              <LoanStatusBadge status={loan.status} />
            </div>
          </div>
          {(onEdit || onDelete) && (
            <CardAction>
              <div className="flex gap-2">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button variant="destructive" size="sm" onClick={onDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </CardAction>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Contact Information
            </h3>
            <div className="space-y-3">
              {loan.borrower_email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${loan.borrower_email}`}
                    className="text-sm hover:underline"
                  >
                    {loan.borrower_email}
                  </a>
                </div>
              )}
              {loan.borrower_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${loan.borrower_phone}`}
                    className="text-sm hover:underline"
                  >
                    {loan.borrower_phone}
                  </a>
                </div>
              )}
              {!loan.borrower_email && !loan.borrower_phone && (
                <p className="text-sm text-muted-foreground">No contact information provided</p>
              )}
            </div>
          </div>

          {/* Loan Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Loan Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">Principal: </span>
                  <span className="text-sm font-medium">{formatCurrency(loan.principal_amount)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">Interest Rate: </span>
                  <span className="text-sm font-medium">{loan.interest_rate}%</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">Due Date: </span>
                  <span className="text-sm font-medium">{formatDate(loan.due_date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">Payment Schedule: </span>
                  <span className="text-sm font-medium">{scheduleLabels[loan.payment_schedule]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {loan.notes && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">{loan.notes}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="mt-6 pt-4 border-t flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>Created: {formatDateTime(loan.created_at)}</span>
          <span>Updated: {formatDateTime(loan.updated_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanCard;
