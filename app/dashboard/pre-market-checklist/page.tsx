import { Metadata } from 'next'
import { PreMarketChecklistClient } from './PreMarketChecklistClient'

export const metadata: Metadata = {
  title: 'Pre-Market Checklist | TradeAutopsy',
  description: 'Complete your daily pre-market routine before trading',
}

export default function PreMarketChecklistPage() {
  return <PreMarketChecklistClient />
}

