import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency configuration
export type CurrencyCode = 'PHP' | 'USD';

export interface CurrencyConfig {
  code: CurrencyCode;
  locale: string;
  symbol: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  PHP: {
    code: 'PHP',
    locale: 'en-PH',
    symbol: '₱',
  },
  USD: {
    code: 'USD',
    locale: 'en-US',
    symbol: '$',
  },
};

// Default currency - Philippine Peso
export const DEFAULT_CURRENCY: CurrencyCode = 'PHP';

export function formatCurrency(amount: number, currencyCode: CurrencyCode = DEFAULT_CURRENCY): string {
  const config = CURRENCIES[currencyCode];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
  }).format(amount);
}
