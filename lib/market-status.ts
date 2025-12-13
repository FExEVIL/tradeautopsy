/**
 * Market status utilities for NSE/BSE
 */

export interface MarketStatus {
  isOpen: boolean
  status: 'open' | 'closed' | 'pre-market' | 'post-market'
  nextOpen?: Date
  nextClose?: Date
  message: string
}

/**
 * Get current market status for NSE/BSE (Indian markets)
 * Market hours: 9:15 AM - 3:30 PM IST (Monday to Friday)
 */
export function getMarketStatus(timezone: string = 'Asia/Kolkata'): MarketStatus {
  const now = new Date()
  
  // Convert to IST
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  const hour = istTime.getHours()
  const minute = istTime.getMinutes()
  const day = istTime.getDay() // 0 = Sunday, 6 = Saturday
  
  // Check if weekend
  if (day === 0 || day === 6) {
    const nextMonday = new Date(istTime)
    nextMonday.setDate(istTime.getDate() + ((1 + 7 - day) % 7))
    nextMonday.setHours(9, 15, 0, 0)
    
    return {
      isOpen: false,
      status: 'closed',
      nextOpen: nextMonday,
      message: 'Market closed (Weekend)'
    }
  }
  
  const currentTime = hour * 60 + minute
  const marketOpen = 9 * 60 + 15 // 9:15 AM
  const marketClose = 15 * 60 + 30 // 3:30 PM
  
  if (currentTime >= marketOpen && currentTime < marketClose) {
    const nextClose = new Date(istTime)
    nextClose.setHours(15, 30, 0, 0)
    
    return {
      isOpen: true,
      status: 'open',
      nextClose,
      message: 'Market Open'
    }
  } else if (currentTime < marketOpen) {
    const nextOpen = new Date(istTime)
    nextOpen.setHours(9, 15, 0, 0)
    
    return {
      isOpen: false,
      status: 'pre-market',
      nextOpen,
      message: 'Market Closed (Pre-market)'
    }
  } else {
    const nextOpen = new Date(istTime)
    nextOpen.setDate(istTime.getDate() + 1)
    nextOpen.setHours(9, 15, 0, 0)
    
    // If it's Friday, next open is Monday
    if (day === 5) {
      nextOpen.setDate(istTime.getDate() + 3)
    }
    
    return {
      isOpen: false,
      status: 'post-market',
      nextOpen,
      message: 'Market Closed'
    }
  }
}

/**
 * Format time until next market event
 */
export function formatTimeUntil(date: Date): string {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  
  if (diff < 0) return 'Now'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
