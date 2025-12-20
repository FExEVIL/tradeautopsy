/**
 * Currency Formatting Utilities for TradeAutopsy
 * All amounts are in Indian Rupees (₹)
 */

const INR_SYMBOL = '₹';
const INR_LOCALE = 'en-IN';

export function formatCurrency(
  amount: number | null | undefined,
  options: {
    decimals?: number;
    showSign?: boolean;
    compact?: boolean;
    showSymbol?: boolean;
  } = {}
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${INR_SYMBOL}0`;
  }

  const {
    decimals = 2,
    showSign = false,
    compact = false,
    showSymbol = true,
  } = options;

  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : (showSign && amount > 0 ? '+' : '');
  const symbol = showSymbol ? INR_SYMBOL : '';

  if (compact) {
    return `${sign}${symbol}${formatCompact(absAmount)}`;
  }

  const formatted = new Intl.NumberFormat(INR_LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(absAmount);

  return `${sign}${symbol}${formatted}`;
}

function formatCompact(amount: number): string {
  const absAmount = Math.abs(amount);

  if (absAmount >= 10000000) {
    const crores = absAmount / 10000000;
    return `${crores.toFixed(2)}Cr`;
  }

  if (absAmount >= 100000) {
    const lakhs = absAmount / 100000;
    return `${lakhs.toFixed(2)}L`;
  }

  if (absAmount >= 1000) {
    const thousands = absAmount / 1000;
    return `${thousands.toFixed(1)}K`;
  }

  return absAmount.toFixed(2);
}

export function formatPnL(
  amount: number | null | undefined,
  options: {
    decimals?: number;
    compact?: boolean;
  } = {}
): { text: string; className: string; isProfit: boolean } {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return {
      text: `${INR_SYMBOL}0`,
      className: 'text-gray-400',
      isProfit: false,
    };
  }

  const text = formatCurrency(amount, {
    ...options,
    showSign: true,
  });

  if (amount > 0) {
    return {
      text,
      className: 'text-emerald-400',
      isProfit: true,
    };
  }

  if (amount < 0) {
    return {
      text,
      className: 'text-red-400',
      isProfit: false,
    };
  }

  return {
    text: `${INR_SYMBOL}0`,
    className: 'text-gray-400',
    isProfit: false,
  };
}

export function formatPercentage(
  value: number | null | undefined,
  options: {
    decimals?: number;
    showSign?: boolean;
  } = {}
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const { decimals = 2, showSign = false } = options;
  const sign = value < 0 ? '-' : (showSign && value > 0 ? '+' : '');

  return `${sign}${Math.abs(value).toFixed(decimals)}%`;
}

export function formatNumber(
  value: number | null | undefined,
  options: {
    decimals?: number;
  } = {}
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const { decimals = 0 } = options;

  return new Intl.NumberFormat(INR_LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
