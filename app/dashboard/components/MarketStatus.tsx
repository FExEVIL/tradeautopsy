'use client'

import { MarketStatusIndicator } from '@/components/MarketStatusIndicator'
import { MarketStatusIndicatorMobile } from '@/components/MarketStatusIndicatorMobile'

export function MarketStatus() {
  return (
    <>
      {/* Desktop version */}
      <div className="hidden sm:block">
        <MarketStatusIndicator />
      </div>
      
      {/* Mobile version */}
      <div className="block sm:hidden">
        <MarketStatusIndicatorMobile />
      </div>
    </>
  )
}
