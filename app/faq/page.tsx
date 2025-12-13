import { Metadata } from 'next'
import { generatePageMetadata } from '@/components/SEO/PageSEO'
import { FAQStructuredData, BreadcrumbStructuredData } from '@/components/SEO/StructuredData'
import { APP_URL } from '@/lib/constants'

export const metadata: Metadata = generatePageMetadata({
  title: 'FAQs - Trading Journal, AI Coach, Pattern Detection | TradeAutopsy',
  description:
    'Frequently asked questions about TradeAutopsy trading journal, AI coaching, pattern detection, multi-broker support, and all features.',
  keywords: [
    'trading faq',
    'help',
    'trading questions',
    'trading journal faq',
    'AI coach questions',
  ],
  canonicalUrl: `${APP_URL}/faq`,
})

const breadcrumbs = [
  { name: 'Home', url: 'https://www.tradeautopsy.in' },
  { name: 'FAQ', url: 'https://www.tradeautopsy.in/faq' },
]

const faqs = [
  {
    question: 'What is TradeAutopsy and how does it work?',
    answer:
      'TradeAutopsy is an AI-powered trading journal and analytics platform that helps traders track, analyze, and improve their trading performance. It automatically imports trades from your broker, detects behavioral patterns, provides AI coaching, and offers comprehensive analytics to help you identify what works and what doesn\'t in your trading.',
  },
  {
    question: 'Which brokers does TradeAutopsy support?',
    answer:
      'TradeAutopsy supports multiple Indian brokers including Zerodha, Upstox, Angel One, ICICI Direct, Kotak Securities, 5paisa, Groww, and more. You can also manually import trades via CSV for any broker.',
  },
  {
    question: 'Can I track F&O trading in TradeAutopsy?',
    answer:
      'Yes! TradeAutopsy fully supports F&O (futures & options) trading tracking with specialized pattern detection, position sizing analysis, and risk management tools designed for derivatives trading.',
  },
  {
    question: 'How does the AI coach help improve trading?',
    answer:
      'The AI coach analyzes your trading patterns and provides personalized suggestions to improve your discipline, reduce emotional trading, and optimize your strategy. It identifies behavioral patterns like revenge trading, FOMO, and overtrading, then offers actionable recommendations.',
  },
  {
    question: 'What is pattern detection and how does it work?',
    answer:
      'Pattern detection automatically identifies behavioral patterns in your trading such as revenge trading (trading immediately after losses), FOMO (fear of missing out), overtrading, loss aversion, and more. It analyzes your trade history and alerts you to patterns that may be costing you money.',
  },
  {
    question: 'Can I use multiple trading profiles?',
    answer:
      'Yes! TradeAutopsy supports multiple profiles so you can organize your trading by category (F&O, Equity, Options, etc.) or by strategy. Each profile has its own analytics, rules, and pattern detection.',
  },
  {
    question: 'How does the trading rules engine work?',
    answer:
      'The trading rules engine lets you set custom rules like time restrictions, daily trade limits, loss limits, and position size limits. It monitors your trades in real-time and alerts you before you violate your rules, helping you maintain discipline.',
  },
  {
    question: 'Is TradeAutopsy free to use?',
    answer:
      'TradeAutopsy offers a free tier that allows you to track and analyze your first 100 trades. After that, premium plans are available with advanced features and unlimited trade tracking.',
  },
  {
    question: 'How do I import my trades?',
    answer:
      'You can import trades in three ways: 1) Connect your broker account for automatic import, 2) Upload a CSV file with your trade data, or 3) Manually enter trades through the dashboard. TradeAutopsy supports all major broker CSV formats.',
  },
  {
    question: 'What analytics and reports are available?',
    answer:
      'TradeAutopsy provides comprehensive analytics including win rate, profit & loss, risk-adjusted returns, drawdown analysis, strategy performance comparison, time-based performance metrics, benchmark comparisons, and detailed PDF/CSV reports.',
  },
  {
    question: 'How secure is my trading data?',
    answer:
      'TradeAutopsy uses bank-level encryption and secure authentication. Your data is stored securely and never shared with third parties. We use Supabase for secure, encrypted data storage with industry-standard security practices.',
  },
  {
    question: 'Can I export my data?',
    answer:
      'Yes, you can export your trades and analytics data at any time in CSV or PDF format. Your data belongs to you, and you can download it whenever you need.',
  },
]

export default function FAQPage() {
  return (
    <>
      <BreadcrumbStructuredData items={breadcrumbs} />
      <FAQStructuredData faqs={faqs} />
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-400 mb-12">
            Everything you need to know about TradeAutopsy trading journal and
            analytics platform.
          </p>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <summary className="cursor-pointer font-semibold text-lg text-white mb-2 list-none">
                  <div className="flex items-center justify-between">
                    <span>{faq.question}</span>
                    <svg
                      className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </summary>
                <p className="text-gray-400 mt-4 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          {/* Additional Help Section */}
          <div className="mt-16 p-8 bg-gray-900 rounded-lg border border-gray-800 text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-400 mb-6">
              Contact our support team for personalized assistance.
            </p>
            <a
              href="mailto:support@tradeautopsy.in"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
