'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LoanStatus, LoanStatusBadgeProps } from '@/types/loan';

const statusConfig: Record<LoanStatus, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  },
  paid: {
    label: 'Paid',
    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  },
  defaulted: {
    label: 'Defaulted',
    className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
};

const LoanStatusBadge: React.FC<LoanStatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};

export default LoanStatusBadge;
