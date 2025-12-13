import { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMetadata } from '@/components/SEO/PageSEO'
import { BreadcrumbStructuredData } from '@/components/SEO/StructuredData'
import { APP_URL } from '@/lib/constants'

export const metadata: Metadata = generatePageMetadata({
  title: 'Trading Blog - Tips, Strategies & Analytics Guides | TradeAutopsy',
  description:
    'Learn trading tips, strategies, pattern detection, risk management, and AI coaching insights from our expert trading blog. Improve your trading discipline and performance.',
  keywords: [
    'trading tips',
    'trading strategies',
    'trading blog',
    'trading guides',
    'trading education',
    'pattern detection',
    'risk management',
    'trading psychology',
  ],
  canonicalUrl: `${APP_URL}/blog`,
})

const breadcrumbs = [
  { name: 'Home', url: 'https://www.tradeautopsy.in' },
  { name: 'Blog', url: 'https://www.tradeautopsy.in/blog' },
]

// Blog post topics targeting high-value keywords
const blogPosts = [
  {
    slug: 'how-to-eliminate-revenge-trading',
    title: 'How to Eliminate Revenge Trading: A Complete Guide',
    excerpt:
      'Learn how to identify and stop revenge trading patterns that cost traders thousands. Discover proven strategies to maintain discipline after losses.',
    keywords: ['revenge trading', 'emotional trading', 'trading discipline'],
    date: '2025-12-10',
  },
  {
    slug: 'best-time-to-trade-stocks-india',
    title: 'Best Time to Trade Stocks in India: Market Hours Analysis',
    excerpt:
      'Discover the optimal trading times in Indian markets based on data from 10,000+ traders. Learn when to trade for maximum profitability.',
    keywords: ['best trading time', 'market hours', 'NSE trading', 'intraday trading'],
    date: '2025-12-08',
  },
  {
    slug: 'position-sizing-calculator-guide',
    title: 'Position Sizing Calculator: Risk Management for Traders',
    excerpt:
      'Master position sizing to protect your capital and maximize returns. Learn how to calculate optimal position sizes based on risk tolerance.',
    keywords: ['position sizing', 'risk management', 'trading calculator'],
    date: '2025-12-05',
  },
  {
    slug: 'f-o-trading-journal-best-practices',
    title: 'F&O Trading Journal: Best Practices for Option Traders',
    excerpt:
      'Complete guide to maintaining an effective F&O trading journal. Track options strategies, Greeks, and improve your derivatives trading.',
    keywords: ['F&O trading', 'options trading journal', 'futures trading'],
    date: '2025-12-03',
  },
  {
    slug: 'day-trading-patterns-detection',
    title: 'Day Trading Patterns: Detect and Profit from Common Setups',
    excerpt:
      'Identify profitable day trading patterns and learn how to detect them early. Data-driven insights from analyzing 50,000+ intraday trades.',
    keywords: ['day trading', 'trading patterns', 'intraday trading', 'scalping'],
    date: '2025-12-01',
  },
  {
    slug: 'trading-psychology-improve-discipline',
    title: 'Trading Psychology: Master Your Emotions & Improve Results',
    excerpt:
      'Understand the psychological factors affecting your trading and learn techniques to improve discipline, reduce emotional trading, and boost performance.',
    keywords: ['trading psychology', 'emotional trading', 'discipline', 'trading mindset'],
    date: '2025-11-28',
  },
]

export default function BlogPage() {
  return (
    <>
      <BreadcrumbStructuredData items={breadcrumbs} />
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-6 py-16 max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Trading Blog & Guides
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl">
            Expert insights, strategies, and guides to help you improve your
            trading performance, detect patterns, and master risk management.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="text-sm text-gray-500 mb-3">
                  {new Date(post.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <h2 className="text-xl font-semibold mb-3 text-white">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.keywords.slice(0, 2).map((keyword) => (
                    <span
                      key={keyword}
                      className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Read more →
                </Link>
              </article>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-16 p-8 bg-gray-900 rounded-lg border border-gray-800 text-center">
            <h2 className="text-2xl font-semibold mb-4">More Content Coming Soon</h2>
            <p className="text-gray-400 mb-6">
              We're constantly adding new guides, strategies, and insights to help you improve your trading.
            </p>
            <p className="text-sm text-gray-500">
              Subscribe to our newsletter to get notified when new posts are published.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
