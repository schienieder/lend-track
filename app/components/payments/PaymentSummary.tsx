'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingDown, Receipt } from 'lucide-react';

interface PaymentSummaryProps {
  totalPaid: number;
  remainingBalance: number;
  paymentCount: number;
  principalAmount: number;
  interestRate: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  totalPaid,
  remainingBalance,
  paymentCount,
  principalAmount,
  interestRate,
}) => {
  const totalWithInterest = principalAmount * (1 + interestRate / 100);
  const progressPercentage = totalWithInterest > 0
    ? Math.min(100, (totalPaid / totalWithInterest) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900">
                <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining Balance</p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(remainingBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                <Receipt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payments Made</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {paymentCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Progress</span>
              <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(totalPaid)} paid</span>
              <span>{formatCurrency(totalWithInterest)} total (with interest)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSummary;
