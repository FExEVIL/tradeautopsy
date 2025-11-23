'use client'

import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { TopTabs } from './components/TopTabs'
import { TradesTable } from './components/TradesTable'
import { AnalyticsCards } from './components/AnalyticsCards'
import { BehavioralInsights } from './components/BehavioralInsights'
import { TradesFilters } from './components/TradesFilters'
import { classifyTradeStrategy } from '@/lib/strategy-classifier'
import { EmotionalInsights } from './components/EmotionalInsights'
import { EquityCurve } from './components/EquityCurve'
import { PnLByDay } from './components/PnLByDay'
import { TimeOfDayChart } from './components/TimeOfDayChart'
import { TiltMeter } from './components/TiltMeter'
import { ChecklistAnalysis } from './components/ChecklistAnalysis'

export function DashboardClient({ trades }: { trades: any[] }) {
  const [filtered, setFiltered] = useState(trades)
  const [activeSection, setActiveSection] = useState('overview')
  const [activeTab, setActiveTab] = useState('analysis')

  const handleFilter = (f: any) => {
    let result = trades
    if (f.search) result = result.filter(t => t.tradingsymbol.toLowerCase().includes(f.search.toLowerCase()))
    if (f.type !== 'ALL') result = result.filter(t => t.transaction_type === f.type)
    if (f.strategy !== 'ALL') result = result.filter(t => classifyTradeStrategy(t) === f.strategy)
    if (f.dateFrom) result = result.filter(t => t.trade_date && t.trade_date >= f.dateFrom)
    if (f.dateTo) result = result.filter(t => t.trade_date && t.trade_date <= f.dateTo)
    setFiltered(result)
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <>
            {trades.length > 0 && <TradesFilters onFilterChange={handleFilter} />}
            {filtered.length > 0 && <AnalyticsCards trades={filtered} />}
            {filtered.length > 0 && <BehavioralInsights trades={filtered} />}
          </>
        )
      
      case 'analytics':
        return (
          <>
            {filtered.length > 0 && <AnalyticsCards trades={filtered} />}
            {filtered.length > 0 && (
              <div className="grid grid-cols-1 gap-6">
                <EquityCurve trades={filtered} />
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
              <EquityCurve trades={filtered} />
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
            {filtered.length > 0 && <AnalyticsCards trades={filtered} />}
          </>
        )
    }
  }

  return (
     <div className="flex h-screen bg-[#0d0d0d] overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Tabs */}
        <TopTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content Area */}
       <div className="flex-1 overflow-y-auto bg-[#0d0d0d]">
          <div className="p-8 space-y-6">
            {renderContent()}
            
            {/* Always show trades table at bottom */}
            <div className="nano app/dashboard/DashboardClient.tsx p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Recent Trades</h2>
                <p className="text-sm text-gray-400">Showing {filtered.length} trades</p>
              </div>
              <TradesTable trades={filtered} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}