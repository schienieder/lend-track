'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  FileText,
  Wallet,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  CreditCard,
  RefreshCw,
  ArrowRight,
  Minus,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import type { DashboardResponse, RecentActivity } from '@/types/dashboard';
import { formatCurrency, type CurrencyCode } from '@/lib/utils';
import FinancialOverviewChart from '@/app/components/dashboard/FinancialOverviewChart';

const DashboardPageView = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartRefresh, setChartRefresh] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dashboard/stats');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      setData(result);
      setChartRefresh((prev) => prev + 1);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'loan_created':
        return <FileText className="h-4 w-4 text-primary" />;
      case 'payment_received':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'loan_paid_off':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'loan_overdue':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityIconBg = (type: RecentActivity['type']) => {
    switch (type) {
      case 'loan_created':
        return 'bg-primary/10';
      case 'payment_received':
        return 'bg-green-500/10';
      case 'loan_paid_off':
        return 'bg-green-500/10';
      case 'loan_overdue':
        return 'bg-destructive/10';
      default:
        return 'bg-muted';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  // Get primary currency summary (first one or PHP as default)
  const primarySummary = data?.stats.financial_summary[0];

  if (error) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Welcome back, {user?.email}</p>
          </div>
          <Button variant="outline" onClick={fetchDashboardData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Loan Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="py-4">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Borrowers</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      {data?.stats.total_borrowers || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Loans</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      {data?.stats.total_loans || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-500/10 p-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Loans</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      {data?.stats.active_loans || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-destructive/10 p-3">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue Loans</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      {data?.stats.overdue_loans || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="py-4">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-purple-500/10 p-3">
                  <Wallet className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Outstanding</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      {formatCurrency(
                        primarySummary?.total_outstanding || 0,
                        primarySummary?.currency || 'PHP'
                      )}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-500/10 p-3">
                  <CreditCard className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      {formatCurrency(
                        primarySummary?.total_paid || 0,
                        primarySummary?.currency || 'PHP'
                      )}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-amber-500/10 p-3">
                  <TrendingUp className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interest Earned</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      {formatCurrency(
                        primarySummary?.total_interest_earned || 0,
                        primarySummary?.currency || 'PHP'
                      )}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Currency Summaries (if more than one currency) */}
        {data && data.stats.financial_summary.length > 1 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Summary by Currency
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.stats.financial_summary.map((summary) => (
                <Card key={summary.currency}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{summary.currency}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Principal</p>
                        <p className="font-medium">
                          {formatCurrency(summary.total_principal, summary.currency as CurrencyCode)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Outstanding</p>
                        <p className="font-medium">
                          {formatCurrency(summary.total_outstanding, summary.currency as CurrencyCode)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Collected</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(summary.total_paid, summary.currency as CurrencyCode)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Interest Earned</p>
                        <p className="font-medium text-amber-600">
                          {formatCurrency(summary.total_interest_earned, summary.currency as CurrencyCode)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Chart and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Monthly Overview Chart */}
          <div className="lg:col-span-3">
            <FinancialOverviewChart onRefresh={chartRefresh} />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Link href="/loans">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : data?.recent_activity && data.recent_activity.length > 0 ? (
                  <ul className="divide-y divide-border max-h-[280px] overflow-y-auto">
                    {data.recent_activity.map((activity) => {
                      const isPayment = activity.type === 'payment_received' || activity.type === 'loan_paid_off';
                      const isLoan = activity.type === 'loan_created';

                      return (
                        <li key={activity.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                          <div className={`rounded-full p-2 shrink-0 ${getActivityIconBg(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground text-sm">
                              <span className="font-semibold">
                                {activity.borrower_name}
                              </span>{' '}
                              <span className="text-muted-foreground">
                                {activity.type === 'loan_created' && 'received a loan'}
                                {activity.type === 'payment_received' && 'made a payment'}
                                {activity.type === 'loan_paid_off' && 'paid off loan'}
                                {activity.type === 'loan_overdue' && 'loan overdue'}
                              </span>
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {activity.amount && (
                                <span className={`text-sm font-medium flex items-center gap-0.5 ${
                                  isPayment ? 'text-green-500' : isLoan ? 'text-orange-500' : 'text-foreground'
                                }`}>
                                  {isPayment && <Plus className="h-3 w-3" />}
                                  {isLoan && <Minus className="h-3 w-3" />}
                                  {formatCurrency(activity.amount, activity.currency || 'PHP')}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDate(activity.timestamp)}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first loan to get started
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPageView;
