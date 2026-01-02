import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'TradeAutopsy - Advanced Trading Journal & AI Analytics',
    template: '%s | TradeAutopsy',
  },
  description: 'Advanced AI-powered trading journal and analytics platform for stock traders, F&O traders, and day traders.',
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

