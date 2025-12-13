'use client'

import { useState, useMemo } from 'react'
import { Calendar, TrendingUp, AlertCircle, Info, Filter } from 'lucide-react'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { formatEventTime } from '@/lib/economic-calendar'

interface EconomicEvent {
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
}

interface EconomicCalendarClientProps {
  events: EconomicEvent[]
}

export default function EconomicCalendarClient({ events }: EconomicCalendarClientProps) {
  const [selectedImpact, setSelectedImpact] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [selectedCountry, setSelectedCountry] = useState<string>('all')

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (selectedImpact !== 'all' && event.impact !== selectedImpact) return false
      if (selectedCountry !== 'all' && event.country !== selectedCountry) return false
      return true
    })
  }, [events, selectedImpact, selectedCountry])

  const groupedEvents = useMemo(() => {
    const groups: Record<string, EconomicEvent[]> = {}
    filteredEvents.forEach(event => {
      const date = event.event_date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(event)
    })
    return groups
  }, [filteredEvents])

  const countries = useMemo(() => {
    const countrySet = new Set<string>()
    events.forEach(event => {
      if (event.country) countrySet.add(event.country)
    })
    return Array.from(countrySet).sort()
  }, [events])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEE, MMM dd')
  }

  if (events.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-2">No economic events available</p>
          <p className="text-sm text-gray-500">
            Economic calendar data will be updated daily
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Economic Calendar</h1>
          <p className="text-gray-400 mt-1">Track high-impact economic events</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-[#111111] border border-gray-800 rounded-lg">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          value={selectedImpact}
          onChange={(e) => setSelectedImpact(e.target.value as any)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="all">All Impact Levels</option>
          <option value="high">High Impact</option>
          <option value="medium">Medium Impact</option>
          <option value="low">Low Impact</option>
        </select>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="all">All Countries</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      {/* Events by Date */}
      <div className="space-y-6">
        {Object.entries(groupedEvents)
          .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
          .map(([date, dateEvents]) => (
            <div key={date} className="bg-[#111111] border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                {getDateLabel(date)}
              </h2>
              <div className="space-y-3">
                {dateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getImpactColor(event.impact)}`}>
                            {event.impact.toUpperCase()}
                          </span>
                          {event.country && (
                            <span className="text-xs text-gray-500">{event.country}</span>
                          )}
                          {event.category && (
                            <span className="text-xs text-gray-500">{event.category}</span>
                          )}
                        </div>
                        <h3 className="text-white font-medium mb-1">{event.title}</h3>
                        {event.event_time && (
                          <p className="text-sm text-gray-400 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            {formatEventTime(event)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {event.forecast_value && (
                          <div className="text-sm">
                            <span className="text-gray-500">Forecast: </span>
                            <span className="text-white">{event.forecast_value}</span>
                          </div>
                        )}
                        {event.actual_value && (
                          <div className="text-sm mt-1">
                            <span className="text-gray-500">Actual: </span>
                            <span className="text-green-400">{event.actual_value}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
