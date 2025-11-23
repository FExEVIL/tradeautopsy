
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation - Cursor Style */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 border border-gray-300">
                <span className="text-black font-bold text-sm">T</span>
              </div>
              <span className="text-lg font-semibold">TradeAutopsy</span>
            </Link>
            
            {/* Center Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-gray-300 hover:text-white transition-colors duration-200">
                Features
              </Link>
              <Link href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors duration-200">
                Pricing
              </Link>
              <Link href="#resources" className="text-sm text-gray-300 hover:text-white transition-colors duration-200">
                Resources
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                Sign in
              </Link>
              <Link 
                href="/signup" 
                className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-all duration-200 hover:scale-105"
              >
                Download
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl">
            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
              Built to make you extraordinarily profitable,<br />
              TradeAutopsy is the best way to analyze trades with AI.
            </h1>
            
            {/* CTA Button */}
            <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-sm font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105 mb-8"
            >
              Sign in for free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </Link>
          </div>

          {/* Dashboard Preview with Window Chrome */}
          <div className="mt-16 max-w-7xl mx-auto">
            <div className="relative">
              {/* Subtle Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-gray-500/5 to-gray-600/5 rounded-3xl blur-3xl"></div>
              
              <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {/* Window Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-black/80 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="flex-1 text-center text-xs text-gray-500 font-medium">TradeAutopsy</div>
                  <div className="w-16"></div>
                </div>

                {/* Three-Column Layout */}
                <div className="grid grid-cols-[240px_1fr_380px] min-h-[600px] bg-gradient-to-br from-gray-900 to-black">
                  {/* Left Sidebar */}
                  <div className="border-r border-white/5 bg-black/20 p-4">
                    {/* In Progress Section */}
                    <div className="mb-6">
                      <div className="text-[10px] uppercase text-gray-500 mb-3 font-medium tracking-wider">IN PROGRESS 3</div>
                      <div className="space-y-2">
                        <div className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                            <div className="w-3 h-3 flex items-center justify-center">
                              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                            <span className="truncate">Strategy Analysis...</span>
                          </div>
                          <div className="text-[10px] text-gray-600">Generating</div>
                        </div>
                        <div className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                            <div className="w-3 h-3 flex items-center justify-center">
                              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                            <span className="truncate">Trade Import...</span>
                          </div>
                          <div className="text-[10px] text-gray-600">Generating</div>
                        </div>
                      </div>
                    </div>

                    {/* Ready for Review Section */}
                    <div>
                      <div className="text-[10px] uppercase text-gray-500 mb-3 font-medium tracking-wider">READY FOR REVIEW 3</div>
                      <div className="space-y-1">
                        {[
                          { title: 'Behavioral Analysis', time: '15m', changes: '+162 -37' },
                          { title: 'Time-Based Patterns', time: '45m', changes: '+37 -0' },
                          { title: 'P&L Breakdown', time: '1h', changes: '+135 -21' }
                        ].map((item, i) => (
                          <div key={i} className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-3 h-3 rounded-full border border-gray-600"></div>
                              <span className="text-xs text-gray-300 truncate">{item.title}</span>
                              <span className="text-[10px] text-gray-600 ml-auto">{item.time}</span>
                            </div>
                            <div className="text-[10px] text-green-400">{item.changes}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Center Content */}
                  <div className="p-6 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">Trade Analysis Results</h3>
                    
                    <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                      <p>
                        Add comprehensive trade analysis with loss prevention insights, behavioral pattern detection,
                        and time-based performance tracking.
                      </p>
                      
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">analysis_report.py</div>
                          <span className="text-xs text-green-400">+24 -6</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Now let me update the evaluation module to save results and generate a detailed report:
                        </p>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">behavioral_detection.py</div>
                          <span className="text-xs text-green-400">+29</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Let me create behavioral pattern detection with revenge trading and overtrading alerts:
                        </p>
                      </div>

                      <p>Done, configurable analysis framework with performance metrics and alerts.</p>
                      
                      <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
                        <li><strong>Analysis:</strong> Strategy breakdown, time-based patterns, behavioral detection</li>
                        <li><strong>Metrics:</strong> Win rate, avg P&L, drawdown tracking, risk:reward ratios</li>
                        <li><strong>Alerts:</strong> Critical loss patterns, revenge trading detection, time-based warnings</li>
                      </ul>
                    </div>
                  </div>

                  {/* Right Code Panel */}
                  <div className="border-l border-white/5 bg-black/40 flex flex-col">
                    {/* Tabs */}
                    <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 bg-black/20">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-xs text-gray-300">
                        analysis.py
                        <button className="hover:text-white transition-colors">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
                        patterns.py
                      </div>
                    </div>

                    {/* Code Content */}
                    <div className="flex-1 p-4 font-mono text-xs overflow-y-auto">
                      <div className="space-y-1">
                        <div className="text-gray-600">import</div>
                        <div className="text-gray-400">import pandas <span className="text-gray-600">as</span> pd</div>
                        <div className="text-gray-400">import numpy <span className="text-gray-600">as</span> np</div>
                        <div className="text-gray-400"><span className="text-gray-600">from</span> datetime <span className="text-gray-600">import</span> datetime</div>
                        <div className="h-4"></div>
                        <div className="text-cyan-400"><span className="text-gray-600">class</span> TradeAnalyzer:</div>
                        <div className="pl-4 text-gray-400"><span className="text-gray-600">def</span> <span className="text-cyan-400">__init__</span>(self, trades):</div>
                        <div className="pl-8 text-gray-400">self.trades = trades</div>
                        <div className="pl-8 text-gray-400">self.df = pd.DataFrame(trades)</div>
                        <div className="h-4"></div>
                        <div className="pl-4 text-gray-400"><span className="text-gray-600">def</span> <span className="text-cyan-400">analyze_patterns</span>(self):</div>
                        <div className="pl-8 text-gray-500"># Detect behavioral patterns</div>
                        <div className="pl-8 text-gray-400">revenge_trades = self._detect_revenge()</div>
                        <div className="pl-8 text-gray-400">time_losses = self._time_analysis()</div>
                        <div className="pl-8 text-gray-400"><span className="text-gray-600">return</span> {`{patterns...}`}</div>
                      </div>
                    </div>

                    {/* Bottom Input */}
                    <div className="border-t border-white/5 p-3 bg-black/40">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Plan, search, build anything...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 px-6 border-y border-white/10">
        <div className="container mx-auto">
          <p className="text-center text-sm text-gray-500 mb-8">Trusted every day by thousands of Indian traders</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
            {/* Logo placeholders */}
            {['Zerodha', 'Upstox', 'Angel One', 'ICICI Direct', 'Kotak Securities', '5paisa', 'Groww'].map((name, i) => (
              <div key={i} className="text-gray-600 font-semibold text-sm">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Neutral Gray */}
      <section id="features" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-x-32 gap-y-20 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Strategy Breakdown</h3>
                <p className="text-gray-400 leading-relaxed">
                  Automatically classify trades: Breakout, Mean Reversion, Options Selling, etc. See which strategies make you money and which bleed your account.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Time-Based Analysis</h3>
                <p className="text-gray-400 leading-relaxed">
                  Discover you're losing ₹18K/month after 2pm? Stop trading afternoons. Data-driven discipline that compounds into lakhs saved.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Behavioral Detection</h3>
                <p className="text-gray-400 leading-relaxed">
                  Catch revenge trading, holding losers too long, and overtrading. These patterns cost traders lakhs but are invisible without data.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Peer Benchmarking</h3>
                <p className="text-gray-400 leading-relaxed">
                  Compare your win rate, risk:reward, and drawdown to traders with similar capital. Know exactly where you stand.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-10">Try TradeAutopsy now.</h2>
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 hover:scale-110"
          >
            Download for free
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer - Cursor Style */}
      <footer className="relative bg-black border-t border-white/10">
        <div className="container mx-auto px-6 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
            {/* Product Column */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link href="/features" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">Features</Link></li>
                <li><Link href="/enterprise" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">Enterprise</Link></li>
                <li><Link href="/pricing" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">Pricing</Link></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><Link href="/download" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">Download</Link></li>
                <li><Link href="/docs" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">Docs</Link></li>
                <li><Link href="/blog" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">Blog</Link></li>
                <li><Link href="/changelog" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">Changelog</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/careers" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">Careers</Link></li>
                <li><Link href="/about" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">About</Link></li>
                <li><Link href="/community" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">Community</Link></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/terms" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
                <li><Link href="/security" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">Security</Link></li>
              </ul>
            </div>

            {/* Connect Column */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Connect</h3>
              <ul className="space-y-3">
                <li><a href="https://twitter.com" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">X (Twitter)</a></li>
                <li><a href="https://linkedin.com" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">LinkedIn</a></li>
                <li><a href="https://youtube.com" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">YouTube</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>© 2025 TradeAutopsy, Inc.</span>
              </div>

              {/* Theme Switcher */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                  <button className="p-1.5 rounded-md hover:bg-white/10 transition-colors" aria-label="System theme">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button className="p-1.5 rounded-md hover:bg-white/10 transition-colors" aria-label="Light mode">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </button>
                  <button className="p-1.5 rounded-md bg-white/10" aria-label="Dark mode">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </button>
                </div>

                <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span className="text-sm text-gray-400">English</span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
