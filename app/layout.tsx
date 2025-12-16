import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { ToastProvider } from './dashboard/components/Toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'
import { APP_URL } from '@/lib/constants'
import { reportWebVitals } from '@/lib/vitals'
import PerformanceMonitor from '@/components/PerformanceMonitor'

// ✅ Export reportWebVitals for Next.js automatic integration
export { reportWebVitals }

// ✅ Font optimization with display swap
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

const siteUrl = APP_URL
const siteName = 'TradeAutopsy'
const siteDescription =
  'Advanced AI-powered trading journal and analytics platform for stock traders, F&O traders, and day traders. Track, analyze, and improve your trading with pattern detection, AI coaching, and real-time alerts.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TradeAutopsy - Advanced Trading Journal & AI Analytics Platform',
    template: '%s | TradeAutopsy',
  },
  description: siteDescription,
  keywords: [
    'trading journal',
    'trading analytics',
    'AI trading coach',
    'stock trading software',
    'F&O trading journal',
    'day trading journal',
    'intraday trading',
    'pattern detection',
    'trading rules engine',
    'trading performance tracker',
    'trading analytics software',
    'best trading journal',
    'professional trading software',
    'trading discipline',
    'trading psychology',
    'trading risk management',
    'position sizing calculator',
    'Zerodha journal',
    'trading software India',
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName,
    title: 'TradeAutopsy - Advanced Trading Journal & AI Analytics',
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/og-image-1200x630.png`,
        width: 1200,
        height: 630,
        alt: 'TradeAutopsy - Trading Analytics Dashboard',
        type: 'image/png',
      },
      {
        url: `${siteUrl}/og-image-square.png`,
        width: 800,
        height: 800,
        alt: 'TradeAutopsy Logo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tradeautopsy',
    creator: '@tradeautopsy',
    title: 'TradeAutopsy - Trading Analytics & AI Coach',
    description: siteDescription,
    images: [`${siteUrl}/twitter-image.png`],
  },
  applicationName: siteName,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: siteName,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  appLinks: {
    ios: {
      url: 'https://apps.apple.com/app/tradeautopsy',
      app_store_id: 'YOUR_APP_ID',
    },
    android: {
      package: 'com.tradeautopsy.android',
      app_name: 'TradeAutopsy',
    },
  },
  verification: {
    google: 'GOOGLE_VERIFICATION_CODE',
    yandex: 'YANDEX_VERIFICATION_CODE',
  },
  category: 'Finance Technology',
  other: {
    'theme-color': '#000000',
    'msapplication-TileColor': '#000000',
    'dns-prefetch': 'https://fonts.googleapis.com',
    'preconnect-fonts': 'https://fonts.gstatic.com',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ✅ Preconnect to external domains */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://api.workos.com" />
        <link rel="dns-prefetch" href="https://*.supabase.co" />
        
        {/* ✅ Preload critical assets */}
        <link rel="preload" href="/favicon.ico" as="image" />
      </head>
      <body className={`${inter.variable} ${inter.className}`}>
        <ThemeProvider>
          <ToastProvider>
            {children}
            <KeyboardShortcuts />
            <SpeedInsights />
          </ToastProvider>
        </ThemeProvider>
        
        {/* ✅ Vercel Speed Insights - automatically tracks all Web Vitals */}
        <SpeedInsights />
        
        {/* ✅ Performance Monitor (development only) */}
        <PerformanceMonitor />
      </body>
    </html>
  )
}