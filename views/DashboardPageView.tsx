'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import type { DashboardResponse, RecentActivity } from '@/types/dashboard';
import { formatCurrency, type CurrencyCode } from '@/lib/utils';
import FinancialOverviewChart from '@/app/components/dashboard/FinancialOverviewChart';

// Cached data for current status (always live, doesn't change with year filter)
interface CurrentStatusData {
  active_loans: number;
  overdue_loans: number;
  total_outstanding: number;
  outstanding_currency: CurrencyCode;
}

const DashboardPageView = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [currentStatus, setCurrentStatus] = useState<CurrentStatusData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('current');

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (year: string, forceRefreshAll: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dashboard/stats?year=${year}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      setData(result);

      // Cache current status and recent activity on initial load or forced refresh
      if (forceRefreshAll || currentStatus === null) {
        setCurrentStatus({
          active_loans: result.stats.active_loans,
          overdue_loans: result.stats.overdue_loans,
          total_outstanding: result.stats.total_outstanding,
          outstanding_currency: result.stats.outstanding_currency,
        });
      }
      if (forceRefreshAll || recentActivity.length === 0) {
        setRecentActivity(result.recent_activity);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [currentStatus, recentActivity.length]);

  // Initial load
  useEffect(() => {
    if (isInitialLoad) {
      fetchDashboardData(selectedYear, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Year change (not initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      fetchDashboardData(selectedYear, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
  };

  const currentYear = new Date().getFullYear();

  const getYearLabel = (year: string) => {
    if (year === 'current') return currentYear.toString();
    if (year === 'all') return 'All Time';
    return year;
  };

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

    // Reset time to compare dates only
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = todayOnly.getTime() - dateOnly.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  // Get primary currency for display
  const primaryCurrency = data?.stats.filtered_currency || 'PHP';
  const outstandingCurrency = currentStatus?.outstanding_currency || 'PHP';

  if (error) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchDashboardData(selectedYear)}>Try Again</Button>
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
          <Button
            variant="outline"
            onClick={() => fetchDashboardData(selectedYear, true)}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Current Status Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card className="py-4">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-500/10 p-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Loans</p>
                  {currentStatus === null ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      {currentStatus.active_loans}
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
                  {currentStatus === null ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      {currentStatus.overdue_loans}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4 sm:col-span-2 lg:col-span-1">
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-purple-500/10 p-3">
                  <Wallet className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Outstanding</p>
                  {currentStatus === null ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      {formatCurrency(
                        currentStatus.total_outstanding,
                        outstandingCurrency
                      )}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mb-8">
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
            {isInitialLoad && recentActivity.length === 0 ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <ul className="divide-y divide-border">
                {recentActivity.slice(0, 10).map((activity) => {
                  const isPayment = activity.type === 'payment_received' || activity.type === 'loan_paid_off';
                  const isLoan = activity.type === 'loan_created';

                  return (
                    <li key={activity.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <div className={`rounded-full p-2.5 shrink-0 ${getActivityIconBg(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm">
                          <span className="font-semibold">{activity.borrower_name}</span>{' '}
                          <span className="text-muted-foreground">
                            {activity.type === 'loan_created' && 'received a new loan'}
                            {activity.type === 'payment_received' && 'made a payment'}
                            {activity.type === 'loan_paid_off' && 'fully paid off their loan'}
                            {activity.type === 'loan_overdue' && 'has an overdue loan'}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                      {activity.amount && (
                        <span className={`text-sm font-semibold flex items-center gap-1 shrink-0 ${
                          isPayment ? 'text-green-500' : isLoan ? 'text-orange-500' : 'text-foreground'
                        }`}>
                          {isPayment && <Plus className="h-4 w-4" />}
                          {isLoan && <Minus className="h-4 w-4" />}
                          {formatCurrency(activity.amount, activity.currency || 'PHP')}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent activity</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first loan to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Overview - Parent Card containing stats and chart */}
        <Card className="mb-8">
          {/* Header with Year Selector */}
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Performance Overview</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedYear === 'all' ? 'Showing all time data' : `Showing data for ${getYearLabel(selectedYear)}`}
              </p>
            </div>
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">{currentYear}</SelectItem>
                {data?.stats.available_years
                  .filter((year) => year !== currentYear)
                  .map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                {data?.stats.available_years && data.stats.available_years.length > 1 && (
                  <SelectItem value="all">All Time</SelectItem>
                )}
              </SelectContent>
            </Select>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Performance Stats - Light bordered cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Borrowers</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      {data?.stats.total_borrowers || 0}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loans Created</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      {data?.stats.total_loans || 0}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
                <div className="rounded-lg bg-green-500/10 p-3">
                  <CreditCard className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Collected</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-2xl font-semibold text-foreground">
                      {formatCurrency(
                        data?.stats.total_collected || 0,
                        primaryCurrency
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
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
                        data?.stats.total_interest_earned || 0,
                        primaryCurrency
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Overview Chart - Embedded */}
            <div className="pt-2">
              <FinancialOverviewChart selectedYear={selectedYear} />
            </div>
          </CardContent>
        </Card>

        {/* Additional Currency Summaries (if more than one currency) */}
        {data && data.stats.financial_summary.length > 1 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Summary by Currency {selectedYear === 'all' ? '(All Time)' : `(${getYearLabel(selectedYear)})`}
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
      </div>
    </div>
  );
};

export default DashboardPageView;
