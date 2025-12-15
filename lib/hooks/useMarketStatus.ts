'use client'

import { useState, useEffect } from 'react'

interface MarketStatus {
  isOpen: boolean
  statusText: string
  nextEvent: string
  nextEventTime: Date | null
}

// NSE Market Holidays 2024-2025
const MARKET_HOLIDAYS = [
  // 2024
  '2024-01-26', '2024-03-08', '2024-03-25', '2024-03-29', '2024-04-11',
  '2024-04-17', '2024-04-21', '2024-05-01', '2024-05-23', '2024-06-17',
  '2024-07-17', '2024-08-15', '2024-08-26', '2024-10-02', '2024-11-01',
  '2024-11-15', '2024-12-25',
  // 2025
  '2025-01-26', '2025-02-26', '2025-03-14', '2025-03-31', '2025-04-10',
  '2025-04-14', '2025-04-18', '2025-05-01', '2025-06-06', '2025-08-15',
  '2025-08-27', '2025-10-02', '2025-10-21', '2025-11-05', '2025-12-25',
]

const isMarketHoliday = (date: Date): boolean => {
  const dateString = date.toISOString().split('T')[0]
  return MARKET_HOLIDAYS.includes(dateString)
}

export function useMarketStatus() {
  const [status, setStatus] = useState<MarketStatus>({
    isOpen: false,
    statusText: 'Market closed',
    nextEvent: 'Opens in',
    nextEventTime: null,
  })

  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date()
      
      // Get IST time components
      const istFormatter = new Intl.DateTimeFormat('en', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        weekday: 'short',
        hour12: false,
      })
      
      const parts = istFormatter.formatToParts(now)
      const year = parseInt(parts.find(p => p.type === 'year')?.value || '0')
      const month = parseInt(parts.find(p => p.type === 'month')?.value || '0')
      const day = parseInt(parts.find(p => p.type === 'day')?.value || '0')
      const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0')
      const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0')
      const weekday = parts.find(p => p.type === 'weekday')?.value || 'Mon'
      
      // Convert weekday to number (0 = Sunday, 6 = Saturday)
      const weekdayMap: Record<string, number> = {
        'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
      }
      const dayOfWeek = weekdayMap[weekday] ?? 1
      
      const currentTimeInMinutes = hour * 60 + minute
      const marketOpenTime = 9 * 60 + 15  // 9:15 AM
      const marketCloseTime = 15 * 60 + 30 // 3:30 PM

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const istDateForHoliday = new Date(year, month - 1, day)
      const isHoliday = isMarketHoliday(istDateForHoliday)
      const isDuringMarketHours = currentTimeInMinutes >= marketOpenTime && currentTimeInMinutes < marketCloseTime
      const isMarketOpen = !isWeekend && !isHoliday && isDuringMarketHours

      let nextEventTime: Date | null = null
      let statusText = ''
      let nextEvent = ''

      // Helper to create next event date
      // Creates a Date object representing the IST time for countdown
      const createEventDate = (targetYear: number, targetMonth: number, targetDay: number, targetHour: number, targetMin: number): Date => {
        // Create date string in ISO format with IST timezone offset
        const monthStr = targetMonth.toString().padStart(2, '0')
        const dayStr = targetDay.toString().padStart(2, '0')
        const hourStr = targetHour.toString().padStart(2, '0')
        const minStr = targetMin.toString().padStart(2, '0')
        const dateStr = `${targetYear}-${monthStr}-${dayStr}T${hourStr}:${minStr}:00+05:30`
        // Parse as IST timezone - this creates a Date object that represents that IST time
        return new Date(dateStr)
      }

      if (isHoliday) {
        let nextDay = day + 1
        let nextMonth = month
        let nextYear = year
        const daysInMonth = new Date(year, month, 0).getDate()
        if (nextDay > daysInMonth) {
          nextDay = 1
          nextMonth++
          if (nextMonth > 12) {
            nextMonth = 1
            nextYear++
          }
        }
        nextEventTime = createEventDate(nextYear, nextMonth, nextDay, 9, 15)
        while (nextEventTime.getDay() === 0 || nextEventTime.getDay() === 6 || isMarketHoliday(nextEventTime)) {
          nextEventTime.setDate(nextEventTime.getDate() + 1)
        }
        statusText = 'Market closed (Holiday)'
        nextEvent = 'Opens in'
      } else if (isWeekend) {
        const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek)
        let nextDay = day + daysUntilMonday
        let nextMonth = month
        let nextYear = year
        const daysInMonth = new Date(year, month, 0).getDate()
        if (nextDay > daysInMonth) {
          nextDay = nextDay - daysInMonth
          nextMonth++
          if (nextMonth > 12) {
            nextMonth = 1
            nextYear++
          }
        }
        nextEventTime = createEventDate(nextYear, nextMonth, nextDay, 9, 15)
        while (isMarketHoliday(nextEventTime)) {
          nextEventTime.setDate(nextEventTime.getDate() + 1)
        }
        statusText = 'Market closed (Weekend)'
        nextEvent = dayOfWeek === 0 ? 'Opens tomorrow' : 'Opens on Monday'
      } else if (isMarketOpen) {
        nextEventTime = createEventDate(year, month, day, 15, 30)
        if (nextEventTime.getTime() <= now.getTime()) {
          nextEventTime.setDate(nextEventTime.getDate() + 1)
          nextEventTime.setHours(9, 15, 0, 0)
        }
        statusText = 'Market open'
        nextEvent = 'Closes in'
      } else if (currentTimeInMinutes < marketOpenTime) {
        nextEventTime = createEventDate(year, month, day, 9, 15)
        statusText = 'Market closed (Pre-market)'
        nextEvent = 'Opens in'
      } else {
        let nextDay = day + 1
        let nextMonth = month
        let nextYear = year
        const daysInMonth = new Date(year, month, 0).getDate()
        if (nextDay > daysInMonth) {
          nextDay = 1
          nextMonth++
          if (nextMonth > 12) {
            nextMonth = 1
            nextYear++
          }
        }
        nextEventTime = createEventDate(nextYear, nextMonth, nextDay, 9, 15)
        while (nextEventTime.getDay() === 0 || nextEventTime.getDay() === 6 || isMarketHoliday(nextEventTime)) {
          nextEventTime.setDate(nextEventTime.getDate() + 1)
        }
        statusText = 'Market closed (After-hours)'
        nextEvent = 'Opens in'
      }

      setStatus({
        isOpen: isMarketOpen,
        statusText,
        nextEvent,
        nextEventTime,
      })
    }

    checkMarketStatus()
    const interval = setInterval(checkMarketStatus, 1000)
    return () => clearInterval(interval)
  }, [])

  return status
}
