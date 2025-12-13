import { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMetadata } from '@/components/SEO/PageSEO'
import { BreadcrumbStructuredData } from '@/components/SEO/StructuredData'
import { InternalLink } from '@/components/SEO/InternalLink'
import { internalLinks } from '@/lib/internal-links'

export const metadata: Metadata = generatePageMetadata({
  title: 'Features - TradeAutopsy Trading Platform',
  description:
    'Discover all features: AI coaching, pattern detection, trading rules, risk management, multi-profile support, multi-broker integration, and comprehensive analytics.',
  keywords: [
    'trading features',
    'AI coach',
    'pattern detection',
    'trading rules engine',
    'risk calculator',
    'multi-profile trading',
    'trading analytics',
    'behavioral analysis',
  ],
  canonicalUrl: `${internalLinks.features}`,
})

const breadcrumbs = [
  { name: 'Home', url: 'https://www.tradeautopsy.in' },
  { name: 'Features', url: 'https://www.tradeautopsy.in/features' },
]

export default function FeaturesPage() {
  return (
    <>
      <BreadcrumbStructuredData items={breadcrumbs} />
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            TradeAutopsy Features
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl">
            Everything you need to track, analyze, and improve your trading
            performance. Built for serious traders who want data-driven
            insights.
          </p>

          <div className="space-y-16">
            {/* Pattern Detection */}
            <section>
              <h2 className="text-3xl font-semibold mb-4">
                Pattern Detection & Analysis
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Automatically detect and track behavioral patterns in your
                trading. Identify revenge trading, FOMO, overtrading, loss
                aversion, and other emotional patterns that impact your
                performance.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                <li>Revenge trading detection</li>
                <li>FOMO pattern identification</li>
                <li>Overtrading alerts</li>
                <li>Win streak overconfidence tracking</li>
                <li>Loss aversion analysis</li>
                <li>Weekend warrior pattern detection</li>
              </ul>
              <InternalLink href={internalLinks.patterns} keyword="pattern detection">
                Explore Pattern Library →
              </InternalLink>
            </section>

            {/* AI Trading Coach */}
            <section>
              <h2 className="text-3xl font-semibold mb-4">AI Trading Coach</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Receive personalized AI-powered coaching based on your trading
                behavior and patterns. Get actionable insights, improvement
                suggestions, and real-time alerts to help you trade more
                disciplined.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                <li>Personalized coaching recommendations</li>
                <li>Real-time trading alerts</li>
                <li>Behavioral improvement suggestions</li>
                <li>Performance analysis and insights</li>
                <li>Action plans for better discipline</li>
              </ul>
              <InternalLink href={internalLinks.aiCoach} keyword="AI trading coach">
                Try AI Coach →
              </InternalLink>
            </section>

            {/* Trading Rules Engine */}
            <section>
              <h2 className="text-3xl font-semibold mb-4">
                Trading Rules Engine
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Create and enforce custom trading rules with real-time alerts.
                Set time restrictions, trade limits, loss limits, position size
                limits, and strategy restrictions. Get notified before you
                violate your rules.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                <li>Time-based trading restrictions</li>
                <li>Daily trade count limits</li>
                <li>Loss limit enforcement</li>
                <li>Position size controls</li>
                <li>Strategy-based rules</li>
                <li>Real-time violation alerts</li>
              </ul>
              <InternalLink href={internalLinks.rules} keyword="trading rules">
                Set Up Rules →
              </InternalLink>
            </section>

            {/* Risk Management */}
            <section>
              <h2 className="text-3xl font-semibold mb-4">Risk Management</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Comprehensive risk management tools including position sizing
                calculators, risk of ruin analysis, drawdown tracking, and
                risk-adjusted performance metrics.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                <li>Position sizing calculator</li>
                <li>Risk of ruin analysis</li>
                <li>Drawdown tracking</li>
                <li>Sharpe ratio calculation</li>
                <li>Risk-adjusted returns</li>
                <li>Portfolio risk metrics</li>
              </ul>
              <InternalLink href={internalLinks.risk} keyword="risk management">
                View Risk Tools →
              </InternalLink>
            </section>

            {/* Multi-Broker Integration */}
            <section>
              <h2 className="text-3xl font-semibold mb-4">
                Multi-Broker Integration
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Connect multiple brokers and manage all your trading activity in
                one place. Supports Zerodha, Upstox, Angel One, ICICI Direct,
                and more.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                <li>Zerodha integration</li>
                <li>Upstox support</li>
                <li>Angel One connectivity</li>
                <li>ICICI Direct integration</li>
                <li>Automatic trade import</li>
                <li>Multi-account management</li>
              </ul>
            </section>

            {/* Multi-Profile Support */}
            <section>
              <h2 className="text-3xl font-semibold mb-4">
                Multi-Profile Support
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Organize your trading by category with multiple profiles. Track
                F&O separately from equity, or create profiles for different
                strategies or accounts.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                <li>Create unlimited profiles</li>
                <li>Profile-specific analytics</li>
                <li>Separate rule sets per profile</li>
                <li>Profile-based pattern detection</li>
                <li>Easy profile switching</li>
              </ul>
            </section>

            {/* Performance Analytics */}
            <section>
              <h2 className="text-3xl font-semibold mb-4">
                Performance Analytics
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Comprehensive performance tracking with detailed analytics,
                strategy comparison, time-based analysis, and benchmark
                comparisons.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                <li>Win rate analysis</li>
                <li>Profit & loss tracking</li>
                <li>Strategy performance comparison</li>
                <li>Time-based performance metrics</li>
                <li>Benchmark comparisons (Nifty, Sensex)</li>
                <li>Equity curve visualization</li>
              </ul>
              <InternalLink
                href={internalLinks.performance}
                keyword="trading analytics"
              >
                View Analytics →
              </InternalLink>
            </section>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-8">
              Start tracking and improving your trading today. Free for your
              first 100 trades.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-all hover:scale-105"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
