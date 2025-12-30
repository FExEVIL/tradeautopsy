'use client'

import { useState, useEffect } from 'react'
import { AlertsPanel } from './components/AlertsPanel'
import { ImprovedEquityCurve } from './components/ImprovedEquityCurve'
import { OnboardingTour } from './components/OnboardingTour'
import { CollapsibleSidebar } from './components/CollapsibleSidebar'
import { MobileBottomNav } from './components/MobileBottomNav'
import { TopTabs } from './components/TopTabs'
import { TradesTable } from './components/TradesTable'
import { AnalyticsCards } from './components/AnalyticsCards'
import { MobileAnalyticsCards } from './components/MobileAnalyticsCards'
import { MobileTradesList } from './components/MobileTradeCard'
import { BehavioralInsights } from './components/BehavioralInsights'
import { TradesFilters } from './components/TradesFilters'
import { classifyTradeStrategy } from '@/lib/strategy-classifier'
import { EmotionalInsights } from './components/EmotionalInsights'
import { EquityCurve } from './components/EquityCurve'
import { PnLByDay } from './components/PnLByDay'
import { TimeOfDayChart } from './components/TimeOfDayChart'
import { TiltMeter } from './components/TiltMeter'
import { SkeletonCard, SkeletonChart, SkeletonTable } from './components/SkeletonLoader'
import { ErrorState } from './components/ErrorState'
import { useToast } from './components/Toast'
import { HeroPnLCard } from './components/HeroPnLCard'
import { InsightCards } from './components/InsightCards'
import { ImprovedEmptyState } from './components/ImprovedEmptyState'
import { Logo } from '@/components/ui/Logo'

type SortField = 'date' | 'symbol' | 'pnl' | 'quantity' | 'strategy' | null
type SortDirection = 'asc' | 'desc'

export function DashboardClient({ trades: initialTrades }: { trades: any[] }) {
  const [trades, setTrades] = useState(initialTrades)
  const [filtered, setFiltered] = useState(initialTrades)
  const [activeSection, setActiveSection] = useState('overview')
  const [activeTab, setActiveTab] = useState('analysis')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const { showToast } = useToast()

  // Sort state for TradesTable
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (trades.length === 0) {
      setLoading(true)
      setTimeout(() => setLoading(false), 1000)
    }
  }, [trades.length])

  const handleFilter = (f: any) => {
    try {
      let result = trades

      if (f.search) {
        result = result.filter((t: any) =>
          t.tradingsymbol.toLowerCase().includes(f.search.toLowerCase())
        )
      }
      if (f.type !== 'ALL') {
        result = result.filter((t: any) => t.transaction_type === f.type)
      }
      if (f.strategy !== 'ALL') {
        result = result.filter((t: any) => classifyTradeStrategy(t) === f.strategy)
      }
      if (f.dateFrom) {
        result = result.filter((t: any) => t.trade_date && t.trade_date >= f.dateFrom)
      }
      if (f.dateTo) {
        result = result.filter((t: any) => t.trade_date && t.trade_date <= f.dateTo)
      }

      setFiltered(result)
    } catch (err) {
      showToast('error', 'Failed to filter trades')
    }
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonChart />
          <SkeletonTable />
        </>
      )
    }

    if (error) {
      return <ErrorState message={error} onRetry={() => window.location.reload()} />
    }

    switch (activeSection) {
      case 'overview':
        return (
          <>
            {trades.length === 0 ? (
              <ImprovedEmptyState />
            ) : (
              <>
                <HeroPnLCard trades={filtered} />
                <InsightCards trades={filtered} />
                {trades.length > 0 && <TradesFilters onFilterChange={handleFilter} />}
                {isMobile ? (
                  <MobileAnalyticsCards trades={filtered} />
                ) : (
                  filtered.length > 0 && <AnalyticsCards trades={filtered} />
                )}
                {filtered.length > 0 && <BehavioralInsights trades={filtered} />}
              </>
            )}
          </>
        )

      case 'analytics':
        return (
          <>
            {isMobile ? (
              <MobileAnalyticsCards trades={filtered} />
            ) : (
              filtered.length > 0 && <AnalyticsCards trades={filtered} />
            )}
            {filtered.length > 0 && (
              <div className="grid grid-cols-1 gap-6">
                <ImprovedEquityCurve trades={filtered} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PnLByDay trades={filtered} />
                  <TimeOfDayChart trades={filtered} />
                </div>
              </div>
            )}
          </>
        )

      case 'behavioral':
        return (
          <>
            {filtered.length > 0 && <BehavioralInsights trades={filtered} />}
            {filtered.length > 0 && <TiltMeter trades={filtered} />}
          </>
        )

      case 'emotional':
        return filtered.length > 0 && <EmotionalInsights trades={filtered} />

      case 'charts':
        return (
          filtered.length > 0 && (
            <div className="grid grid-cols-1 gap-6">
              <ImprovedEquityCurve trades={filtered} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PnLByDay trades={filtered} />
                <TimeOfDayChart trades={filtered} />
              </div>
            </div>
          )
        )

      case 'tilt':
        return filtered.length > 0 && <TiltMeter trades={filtered} />

      default:
        return (
          <>
            {trades.length > 0 && <TradesFilters onFilterChange={handleFilter} />}
            {isMobile ? (
              <MobileAnalyticsCards trades={filtered} />
            ) : (
              filtered.length > 0 && <AnalyticsCards trades={filtered} />
            )}
          </>
        )
    }
  }

  return (
    <>
      {/* Top Tabs - Hidden on mobile */}
      <div className="hidden lg:block">
        <TopTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-[#1a1a1a] border-b border-gray-800 p-4 flex items-center justify-between">
        <Logo size="sm" showText={true} showSubtitle={true} href="/dashboard" />
        <button className="text-gray-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-[#0d0d0d] pb-20 lg:pb-0">
        <div className="p-4 lg:p-8 space-y-6">
          {renderContent()}

          {!loading && !error && (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 lg:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg lg:text-xl font-bold text-white">Recent Trades</h2>
                <p className="text-xs lg:text-sm text-gray-400">Showing {filtered.length}</p>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block">
                <TradesTable
                  trades={filtered}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={(field) => {
                    if (!field) return
                    if (field === sortField) {
                      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                    } else {
                      setSortField(field)
                      setSortDirection('desc')
                    }
                  }}
                />
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                <MobileTradesList trades={filtered} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeSection={activeSection} onSectionChange={handleSectionChange} />
    </>
  )
}
