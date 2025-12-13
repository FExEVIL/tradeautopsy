export function formatINR(value: number, options?: { compact?: boolean }): string {
  const absValue = Math.abs(value)
  
  if (options?.compact && absValue >= 10000) {
    if (absValue >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)}Cr`
    } else if (absValue >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`
    } else {
      return `₹${(value / 1000).toFixed(1)}K`
    }
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value)
}

export function formatPnLWithSign(value: number, compact?: boolean): string {
  const formatted = formatINR(Math.abs(value), { compact })
  return value >= 0 ? `+${formatted}` : `-${formatted}`
}
