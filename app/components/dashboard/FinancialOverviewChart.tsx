'use client';

import { useState, useEffect, useRef } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3 } from 'lucide-react';
import type { ChartDataResponse } from '@/types/dashboard';
import { formatCurrency, type CurrencyCode } from '@/lib/utils';

interface FinancialOverviewChartProps {
  selectedYear: string; // Controlled from parent
}

const FinancialOverviewChart = ({ selectedYear }: FinancialOverviewChartProps) => {
  const [data, setData] = useState<ChartDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchChartData = async () => {
      // Only show loading skeleton on first fetch (smoother UX on year changes)
      if (!hasFetchedRef.current) {
        setIsLoading(true);
      }

      try {
        const response = await fetch(`/api/dashboard/chart?year=${selectedYear}`);
        const result = await response.json();

        if (!isCancelled && response.ok) {
          setData(result);
          hasFetchedRef.current = true;
        }
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchChartData();

    return () => {
      isCancelled = true;
    };
  }, [selectedYear]);

  const formatYAxisValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const currency = (data?.currency || 'PHP') as CurrencyCode;
      const getLabel = (dataKey: string) => {
        if (dataKey === 'loansAmount') return 'Loans Disbursed';
        if (dataKey === 'paymentsAmount') return 'Payments Collected';
        return 'Interest Earned';
      };
      const getColor = (dataKey: string) => {
        if (dataKey === 'loansAmount') return '#f97316';
        if (dataKey === 'paymentsAmount') return '#22c55e';
        return '#eab308';
      };
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: getColor(entry.dataKey) }}
            >
              {getLabel(entry.dataKey)}:{' '}
              <span className="font-medium">
                {formatCurrency(entry.value, currency)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4" />
        Financial Trends
      </h3>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-[250px] w-full" />
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="loansGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="paymentsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="interestGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#d1d5db" strokeWidth={1} vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 12, fill: 'currentColor' }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tickFormatter={formatYAxisValue}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => {
                  if (value === 'loansAmount') return 'Loans Disbursed';
                  if (value === 'paymentsAmount') return 'Payments Collected';
                  return 'Interest Earned';
                }}
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="loansAmount"
                stroke="#f97316"
                fill="url(#loansGradient)"
                strokeWidth={2}
                name="loansAmount"
              />
              <Area
                type="monotone"
                dataKey="paymentsAmount"
                stroke="#22c55e"
                fill="url(#paymentsGradient)"
                strokeWidth={2}
                name="paymentsAmount"
              />
              <Area
                type="monotone"
                dataKey="interestAmount"
                stroke="#eab308"
                fill="url(#interestGradient)"
                strokeWidth={2}
                name="interestAmount"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[280px] text-muted-foreground">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No data available</p>
            <p className="text-sm mt-1">Create loans to see the overview</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialOverviewChart;
