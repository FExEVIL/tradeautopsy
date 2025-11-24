'use client'

import { AlertsPanel } from './components/AlertsPanel'
import { ImprovedEquityCurve } from './components/ImprovedEquityCurve'
import { OnboardingTour } from './components/OnboardingTour'
import { useState, useEffect } from 'react'
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

export function DashboardClient({ trades: initialTrades }: { trades: any[] }) {
  const [trades, setTrades] = useState(initialTrades)
  const [filtered, setFiltered] = useState(initialTrades)
  const [activeSection, setActiveSection] = useState('overview')
  const [activeTab, setActiveTab] = useState('analysis')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const { showToast } = useToast()

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
  }, [])

  const handleFilter = (f: any) => {
  try {
    let result = trades
    if (f.search) result = result.filter(t => t.tradingsymbol.toLowerCase().includes(f.search.toLowerCase()))
    if (f.type !== 'ALL') result = result.filter(t => t.transaction_type === f.type)
    if (f.strategy !== 'ALL') result = result.filter(t => classifyTradeStrategy(t) === f.strategy)
    if (f.dateFrom) result = result.filter(t => t.trade_date && t.trade_date >= f.dateFrom)
    if (f.dateTo) result = result.filter(t => t.trade_date && t.trade_date <= f.dateTo)
    setFiltered(result)
    // Only show toast on filter errors, not every filter change
  } catch (err) {
    showToast('error', 'Failed to filter trades')
  }
}
  const handleSectionChange = (section: string) => {
  setActiveSection(section)
  // Removed annoying toast notification
}

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
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
    <div className="flex h-screen bg-[#0d0d0d] overflow-hidden">
      {/* Desktop Sidebar */}
      <CollapsibleSidebar activeSection={activeSection} onSectionChange={handleSectionChange} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Tabs - Hidden on mobile */}
        <div className="hidden lg:block">
          <TopTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden bg-[#1a1a1a] border-b border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">T</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">TradeAutopsy</h1>
              <p className="text-[10px] text-gray-600">Trading Analytics</p>
            </div>
          </div>
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
                {/* Desktop Table / Mobile Cards */}
                <div className="hidden lg:block">
                  <TradesTable trades={filtered} />
                </div>
                <div className="lg:hidden">
                  <MobileTradesList trades={filtered} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeSection={activeSection} onSectionChange={handleSectionChange} />
    </div>
  )
}