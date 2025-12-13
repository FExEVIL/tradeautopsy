/**
 * Economic calendar utilities
 */

export interface EconomicEvent {
  id: string
  event_date: string
  event_time?: string
  title: string
  country?: string
  impact: 'high' | 'medium' | 'low'
  category?: string
  actual_value?: string
  forecast_value?: string
  previous_value?: string
  source?: string
}

/**
 * Fetch economic events from external API or cache
 * For now, returns mock data. Replace with actual API integration.
 */
export async function fetchEconomicEvents(
  fromDate: Date,
  toDate: Date,
  country?: string
): Promise<EconomicEvent[]> {
  // TODO: Integrate with economic calendar API (e.g., TradingEconomics, FXStreet)
  // For now, return empty array - will be populated by scheduled job
  
  return []
}

/**
 * Get high-impact events for today and tomorrow
 */
export async function getUpcomingHighImpactEvents(
  days: number = 2
): Promise<EconomicEvent[]> {
  const today = new Date()
  const endDate = new Date()
  endDate.setDate(today.getDate() + days)
  
  // This will be implemented to fetch from database cache
  // populated by a scheduled job
  return []
}

/**
 * Format event for display
 */
export function formatEventTime(event: EconomicEvent): string {
  if (event.event_time) {
    const time = new Date(event.event_time)
    return time.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    })
  }
  return 'All Day'
}
