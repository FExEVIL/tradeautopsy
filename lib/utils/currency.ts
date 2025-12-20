/**
 * INR Currency Utilities
 * All currency formatting uses Indian Rupee (₹) with lakhs/crores notation
 */

// ============================================
// CONSTANTS
// ============================================

const INR_SYMBOL = '₹'
const INR_LOCALE = 'en-IN'
const LAKH = 100000
const CRORE = 10000000

// ============================================
// FORMATTING FUNCTIONS
// ============================================

/**
 * Format currency as ₹X,XX,XXX.XX (Indian notation)
 */
export function formatCurrency(
  amount: number | null | undefined,
  options: {
    decimals?: number
    showSign?: boolean
    compact?: boolean
    showSymbol?: boolean
  } = {}
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${INR_SYMBOL}0`
  }

  const {
    decimals = 2,
    showSign = false,
    compact = false,
    showSymbol = true,
  } = options

  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? '-' : showSign && amount > 0 ? '+' : ''
  const symbol = showSymbol ? INR_SYMBOL : ''

  if (compact && absAmount >= 10000) {
    return `${sign}${symbol}${formatCompact(absAmount)}`
  }

  const formatted = new Intl.NumberFormat(INR_LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(absAmount)

  return `${sign}${symbol}${formatted}`
}

/**
 * Format currency in compact notation (₹X.XXL or ₹X.XXCr)
 */
export function formatCompact(amount: number): string {
  const absAmount = Math.abs(amount)

  if (absAmount >= CRORE) {
    return `${(absAmount / CRORE).toFixed(2)}Cr`
  } else if (absAmount >= LAKH) {
    return `${(absAmount / LAKH).toFixed(2)}L`
  } else if (absAmount >= 1000) {
    return `${(absAmount / 1000).toFixed(1)}K`
  }

  return absAmount.toFixed(0)
}

/**
 * Format P&L with color class (green for profit, red for loss)
 */
export function formatPnL(
  value: number | null | undefined,
  options: {
    compact?: boolean
    showSign?: boolean
  } = {}
): {
  formatted: string
  colorClass: string
  isPositive: boolean
} {
  if (value === null || value === undefined || isNaN(value)) {
    return {
      formatted: `${INR_SYMBOL}0`,
      colorClass: 'text-gray-400',
      isPositive: false,
    }
  }

  const isPositive = value > 0
  const colorClass = isPositive ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400'

  const formatted = formatCurrency(value, {
    decimals: 2,
    showSign: options.showSign,
    compact: options.compact,
  })

  return {
    formatted,
    colorClass,
    isPositive,
  }
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number | null | undefined,
  options: {
    decimals?: number
    showSign?: boolean
  } = {}
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%'
  }

  const { decimals = 2, showSign = false } = options
  const sign = showSign && value > 0 ? '+' : ''

  return `${sign}${Math.abs(value).toFixed(decimals)}%`
}

/**
 * Format number with Indian notation
 */
export function formatNumber(
  value: number | null | undefined,
  options: {
    decimals?: number
  } = {}
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }

  const { decimals = 0 } = options

  return new Intl.NumberFormat(INR_LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

// ============================================
// PARSING FUNCTIONS
// ============================================

/**
 * Parse currency string to number
 * Handles formats like: ₹1,23,456.78, ₹1.23L, ₹1.23Cr
 */
export function parseCurrency(value: string): number {
  if (!value || typeof value !== 'string') {
    return 0
  }

  // Remove currency symbol and whitespace
  let cleaned = value.replace(/[₹\s]/g, '').trim()

  if (!cleaned) {
    return 0
  }

  // Handle compact notation (L, Cr, K)
  if (cleaned.toUpperCase().endsWith('CR')) {
    const num = parseFloat(cleaned.slice(0, -2))
    return isNaN(num) ? 0 : num * CRORE
  }

  if (cleaned.toUpperCase().endsWith('L')) {
    const num = parseFloat(cleaned.slice(0, -1))
    return isNaN(num) ? 0 : num * LAKH
  }

  if (cleaned.toUpperCase().endsWith('K')) {
    const num = parseFloat(cleaned.slice(0, -1))
    return isNaN(num) ? 0 : num * 1000
  }

  // Remove commas and parse
  cleaned = cleaned.replace(/,/g, '')
  const num = parseFloat(cleaned)

  return isNaN(num) ? 0 : num
}

/**
 * Format currency as user types (for input fields)
 */
export function formatCurrencyInput(value: string): string {
  if (!value) {
    return ''
  }

  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '')

  // Parse and format
  const num = parseFloat(cleaned)
  if (isNaN(num)) {
    return ''
  }

  return formatCurrency(num, { decimals: 2, showSymbol: false })
}

// ============================================
// EXPORTS
// ============================================

export {
  formatCurrency,
  formatCompact,
  formatPnL,
  formatPercentage,
  formatNumber,
  parseCurrency,
  formatCurrencyInput,
  INR_SYMBOL,
  INR_LOCALE,
  LAKH,
  CRORE,
}
