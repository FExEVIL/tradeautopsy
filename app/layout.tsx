import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'TradeAutopsy - Stop Losing Money in Trading',
  description: 'Automatically analyze your trades to discover why you lose money and what to fix. Built for Indian traders.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
