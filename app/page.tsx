'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-emerald-400">TradeAutopsy</div>
        <div className="space-x-4">
          <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-white">
            Login
          </Link>
          <Link 
            href="/signup" 
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Stop guessing why you lose.
            <br />
            <span className="text-emerald-400">Start knowing what works.</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Every night, profitable traders ask: &quot;Was it skill or luck?&quot; Losing traders torture themselves: &quot;What am I doing wrong?&quot; 
            TradeAutopsy analyzes your trades and tells you exactly why you lose—and what to fix.
          </p>

          <div className="space-x-4">
            <Link 
              href="/signup" 
              className="inline-block px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold text-lg hover:bg-emerald-700"
            >
              Analyze My Trades →
            </Link>
            <Link 
              href="#how-it-works" 
              className="inline-block px-8 py-4 border border-gray-400 text-white rounded-lg font-semibold text-lg hover:bg-gray-800"
            >
              See How It Works
            </Link>
          </div>

          <p className="mt-6 text-gray-400">
            First 50 trades free • No credit card required
          </p>
        </div>

        {/* Mock Dashboard Preview */}
        <div className="mt-20 bg-gray-800 rounded-xl p-8 max-w-5xl mx-auto border border-gray-700">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold">Your Trade Analysis Dashboard</h3>
            <p className="text-gray-400 mt-2">Automatically imported from your broker</p>
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-3xl font-bold text-emerald-400">₹2.45L</div>
              <div className="text-sm text-gray-400">Gross Profit</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-3xl font-bold text-red-400">₹2.63L</div>
              <div className="text-sm text-gray-400">Gross Loss</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-3xl font-bold text-yellow-400">-₹18.5K</div>
              <div className="text-sm text-gray-400">Net P&L</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-400">51.7%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
          </div>

          <div className="mt-6 bg-gray-900 p-4 rounded-lg border border-red-700">
            <div className="text-red-400 font-semibold">🔴 CRITICAL INSIGHT</div>
            <div className="text-gray-300 mt-1">
              You lose ₹18,700/month between 2-3:30pm. If you stopped trading after 2pm, you&apos;d be up ₹224,400 this year.
            </div>
          </div>
        </div>
      </main>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
            <h3 className="text-xl font-semibold mb-2">Connect Your Broker</h3>
            <p className="text-gray-400">Link your Zerodha, Upstox, or Angel account in 30 seconds. Read-only access, 100% secure.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
            <h3 className="text-xl font-semibold mb-2">Auto-Import Trades</h3>
            <p className="text-gray-400">We fetch 12 months of historical trades and sync new ones daily. Zero manual entry.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
            <h3 className="text-xl font-semibold mb-2">Get Actionable Insights</h3>
            <p className="text-gray-400">Discover which strategies work, when you lose money, and behavioral patterns costing you lakhs.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20 bg-gray-800">
        <h2 className="text-4xl font-bold text-center mb-12">Features That Save You Money</h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-emerald-400 mb-3">🎯 Strategy Breakdown</h3>
            <p className="text-gray-400">
              Automatically classify trades: Breakout, Mean Reversion, Options Selling, etc. See which strategies make you money and which bleed your account.
            </p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-emerald-400 mb-3">⏰ Time-Based Analysis</h3>
            <p className="text-gray-400">
              Discover you&apos;re losing ₹18K/month after 2pm? Stop trading afternoons. Data-driven discipline.
            </p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-emerald-400 mb-3">🧠 Behavioral Detection</h3>
            <p className="text-gray-400">
              Catch revenge trading, holding losers too long, and overtrading. These patterns cost traders lakhs but are invisible without data.
            </p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-emerald-400 mb-3">📊 Peer Benchmarking</h3>
            <p className="text-gray-400">
              Compare your win rate, risk:reward, and drawdown to traders with similar capital. Know where you stand.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Stop the Bleeding?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join 1,000+ traders who&apos;ve saved ₹50+ lakhs by fixing their losing patterns.
        </p>
        
        <Link 
          href="/signup" 
          className="inline-block px-10 py-4 bg-emerald-600 text-white rounded-lg font-bold text-xl hover:bg-emerald-700"
        >
          Start Free Trial →
        </Link>
        
        <p className="mt-6 text-gray-400">
          ₹499/month after trial • Cancel anytime • 30-day money back guarantee
        </p>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-700">
        <div className="text-center text-gray-400">
          © 2025 TradeAutopsy. Built for Indian traders, by traders.
        </div>
      </footer>
    </div>
  )
}
