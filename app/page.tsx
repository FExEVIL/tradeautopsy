'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { OrganizationStructuredData, ProductStructuredData } from '@/components/SEO/StructuredData'

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
    <>
      <OrganizationStructuredData />
      <ProductStructuredData />
      <div className="min-h-screen bg-black text-white">
      {/* Simplified Navigation - Remove distracting links */}
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

            {/* Right Actions - Simplified */}
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Optimized Hero Section */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black"></div>
        
        <div className="container mx-auto relative z-10">
          {/* Trust Badge - Moved Up */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-black"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 border-2 border-black"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 border-2 border-black"></div>
            </div>
            <span className="text-sm text-gray-400">Join 2,847+ traders who found their blind spot</span>
          </div>

          <div className="max-w-4xl">
            {/* Optimized Headline - Shorter & Problem-Focused */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Advanced Trading Journal & AI Analytics Platform
            </h1>
            
            {/* Benefit-Focused Subheadline */}
            <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-2xl">
              Track, analyze, and improve your trading with AI-powered pattern detection, behavioral analysis, and real-time coaching. Perfect for F&O traders, day traders, and stock market investors.
            </p>
            
            {/* Action-Oriented CTA */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-xl text-base font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-xl"
              >
                Analyze My Trades Free
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link 
                href="#demo" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl text-base font-semibold hover:bg-white/10 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </Link>
            </div>

            {/* Social Proof - Live Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>2047 traders analyzing now</span>
              </div>
              <span>•</span>
              <span>Free for first 100 trades</span>
            </div>
          </div>

          {/* Optimized Dashboard Preview (Cursor-style) */}
          <div className="mt-20 relative max-w-[1200px] mx-auto perspective-1000">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-[100px] -z-10 rounded-full opacity-60"></div>
            
            {/* Main Window Container */}
            <div 
              className="relative rounded-xl bg-[#0A0A0A] border border-white/10 shadow-2xl overflow-hidden group transform transition-all duration-700 hover:shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] hover:border-white/20"
              style={{
                boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.05), 0 20px 50px -10px rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* Window Chrome / Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#0A0A0A] border-b border-white/5 select-none">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10"></div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-50 text-xs font-medium text-gray-400 font-mono">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 8m0 0a8 8 0 00-8 8c0 2.472.345 4.865.99 7.131M8 8a8 8 0 004.164 6.904m4.165 0A8 8 0 0020 8m-9.356 9.012A12.215 12.215 0 0112 2.944a12.215 12.215 0 017.356 14.068" />
                  </svg>
                  TradeAutopsy
                </div>
                <div className="w-14"></div>
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-[260px_1fr_400px] h-[640px] bg-[#050505]">
                
                {/* Left Sidebar - Activity Stream */}
                <div className="border-r border-white/5 p-4 flex flex-col gap-6">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 pl-2">In Progress (3)</div>
                    {['Strategy Analysis...', 'Trade Import...'].map((task, i) => (
                      <div key={i} className="group flex items-start gap-3 p-2 rounded-md hover:bg-white/5 transition-all cursor-default">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                        <div>
                          <div className="text-xs text-gray-300 group-hover:text-white transition-colors font-medium">{task}</div>
                          <div className="text-[10px] text-gray-600">Generating via Agent...</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 pl-2">Ready for Review</div>
                    {[
                      { label: 'Behavioral Analysis', val: '+162', neg: '-37', time: '15m' },
                      { label: 'Time-Based Patterns', val: '+37', neg: '-0', time: '45m' },
                      { label: 'P&L Breakdown', val: '+135', neg: '-21', time: '1h' }
                    ].map((item, i) => (
                      <div key={i} className="group flex items-center justify-between p-2 rounded-md hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full border border-gray-700 group-hover:border-gray-500 transition-colors flex items-center justify-center`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-gray-500 transition-colors"></div>
                          </div>
                          <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">{item.label}</span>
                        </div>
                        <div className="text-[10px] font-mono">
                          <span className="text-green-400">{item.val}</span>
                          <span className="text-red-400/70 ml-1">{item.neg}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Middle - Chat Interface */}
                <div className="flex flex-col relative bg-[#050505]">
                  <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <h3 className="text-xl font-semibold text-white mb-6">Trade Analysis Results</h3>
                    
                    <div className="space-y-6">
                      <p className="text-sm text-gray-400 leading-relaxed">
                        I've analyzed your last 100 trades. Here are the comprehensive insights with loss prevention, behavioral detection, and performance tracking.
                      </p>

                      {/* Code Block 1 */}
                      <div className="rounded-lg border border-white/10 bg-[#0F0F0F] overflow-hidden group">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                          <div className="flex items-center gap-2">
                            <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <span className="text-xs text-gray-400 font-mono">analysis_report.py</span>
                          </div>
                          <span className="text-[10px] text-green-400 font-mono">+24 -6</span>
                        </div>
                        <div className="p-3 font-mono text-[10px] leading-relaxed text-gray-400 opacity-80 group-hover:opacity-100 transition-opacity">
                          <span className="text-purple-400">def</span> <span className="text-blue-400">generate_report</span>(data):<br/>
                          &nbsp;&nbsp;report = <span className="text-yellow-400">AnalysisReport</span>()<br/>
                          &nbsp;&nbsp;report.<span className="text-blue-400">add_metrics</span>(data.metrics)<br/>
                          &nbsp;&nbsp;<span className="text-gray-500"># Calculating drawdown</span><br/>
                          &nbsp;&nbsp;<span className="text-purple-400">return</span> report.json()
                        </div>
                      </div>

                      {/* Code Block 2 */}
                      <div className="rounded-lg border border-white/10 bg-[#0F0F0F] overflow-hidden group">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02]">
                          <div className="flex items-center gap-2">
                            <svg className="w-3 h-3 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            <span className="text-xs text-gray-400 font-mono">behavioral_detection.py</span>
                          </div>
                          <span className="text-[10px] text-green-400 font-mono">+29</span>
                        </div>
                        <div className="p-3 font-mono text-[10px] leading-relaxed text-gray-400 opacity-80 group-hover:opacity-100 transition-opacity">
                          <span className="text-gray-500"># Detect revenge trading patterns</span><br/>
                          <span className="text-purple-400">if</span> trade.loss &gt; <span className="text-orange-400">1000</span> <span className="text-purple-400">and</span> trade.time_since_last &lt; <span className="text-orange-400">300</span>:<br/>
                          &nbsp;&nbsp;alert = <span className="text-green-400">"Revenge Trading Detected"</span><br/>
                          &nbsp;&nbsp;<span className="text-blue-400">trigger_prevention</span>(alert)
                        </div>
                      </div>

                      <div className="text-sm text-gray-300">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        Analysis complete. Configured alerts for critical loss patterns.
                      </div>
                    </div>
                  </div>
                  
                  {/* Input Area */}
                  <div className="p-4 border-t border-white/5 bg-[#0A0A0A]">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#151515] border border-white/5 text-sm text-gray-500 font-mono">
                      <span className="text-gray-400">Agent</span>
                      <span className="w-px h-4 bg-gray-700"></span>
                      <span className="text-gray-600">Ask follow-up question...</span>
                    </div>
                  </div>
                </div>

                {/* Right - Code Editor View */}
                <div className="border-l border-white/5 bg-[#020202] flex flex-col font-mono text-xs">
                  {/* Editor Tabs */}
                  <div className="flex bg-[#0A0A0A] border-b border-white/5">
                    <div className="px-4 py-2 text-gray-300 bg-[#020202] border-t-2 border-blue-500 flex items-center gap-2">
                      analysis.py
                      <span className="hover:text-white cursor-pointer">×</span>
                    </div>
                    <div className="px-4 py-2 text-gray-600 hover:text-gray-400 cursor-pointer transition-colors">patterns.py</div>
                    <div className="px-4 py-2 text-gray-600 hover:text-gray-400 cursor-pointer transition-colors">config.yaml</div>
                  </div>

                  {/* Code Content */}
                  <div className="p-6 text-gray-400 leading-6 overflow-hidden relative select-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-[#020202]/50 pointer-events-none z-10"></div>
                    
                    <div><span className="text-purple-400">import</span> pandas <span className="text-purple-400">as</span> pd</div>
                    <div><span className="text-purple-400">import</span> numpy <span className="text-purple-400">as</span> np</div>
                    <div className="mb-4"><span className="text-purple-400">from</span> datetime <span className="text-purple-400">import</span> datetime</div>

                    <div><span className="text-blue-400">class</span> <span className="text-yellow-300">TradeAnalyzer</span>:</div>
                    <div className="pl-4"><span className="text-blue-400">def</span> <span className="text-yellow-300">__init__</span>(self, trades):</div>
                    <div className="pl-8">self.trades = trades</div>
                    <div className="pl-8 mb-4">self.df = pd.<span className="text-yellow-300">DataFrame</span>(trades)</div>

                    <div className="pl-4"><span className="text-blue-400">def</span> <span className="text-yellow-300">analyze_patterns</span>(self):</div>
                    <div className="pl-8 text-gray-500 italic"># Detect behavioral patterns</div>
                    <div className="pl-8">revenge_trades = self.<span className="text-blue-400">_detect_revenge</span>()</div>
                    <div className="pl-8">time_losses = self.<span className="text-blue-400">_time_analysis</span>()</div>
                    
                    <div className="pl-8 mb-4">
                      <span className="text-purple-400">return</span> <span className="text-gray-400">{`{`}</span>
                    </div>
                    
                    <div className="pl-12">
                      <span className="text-green-400">"revenge"</span><span className="text-gray-400">:</span> revenge_trades,
                    </div>
                    <div className="pl-12">
                      <span className="text-green-400">"timing"</span><span className="text-gray-400">:</span> time_losses,
                    </div>
                    <div className="pl-12">
                      <span className="text-green-400">"risk_ratio"</span><span className="text-gray-400">:</span> self.<span className="text-blue-400">_calc_rr</span>()
                    </div>
                    <div className="pl-8">
                      <span className="text-gray-400">{`}`}</span>
                    </div>

                    {/* Cursor Animation */}
                    <div className="pl-8 mt-1 flex items-center gap-1">
                       <span className="w-0.5 h-4 bg-white animate-pulse"></span>
                    </div>
                  </div>

                  {/* AI Command Bar Overlay */}
                  <div className="mt-auto m-4 p-3 bg-[#151515] border border-white/10 rounded-lg shadow-2xl">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2 uppercase tracking-wider font-semibold">
                      <span>Autopsy.Agent</span>
                      <span className="text-xs">⌘ K</span>
                    </div>
                    <div className="text-sm text-gray-300 mb-1 font-sans">Generate loss prevention report</div>
                    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-2/3 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Broker Trust Section */}
      <section className="py-12 px-6 border-y border-white/10 bg-white/[0.02]">
        <div className="container mx-auto">
          <p className="text-center text-sm text-gray-400 mb-8">Works seamlessly with all major Indian brokers</p>
          <div className="flex flex-wrap items-center justify-center gap-12">
            {['Zerodha', 'Upstox', 'Angel One', 'ICICI Direct', 'Kotak Securities', '5paisa', 'Groww'].map((name, i) => (
              <div key={i} className="text-gray-500 hover:text-gray-300 transition-colors font-semibold text-sm cursor-pointer">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain-Focused Features Section */}
      <section id="features" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black"></div>
        
        <div className="container mx-auto relative z-10 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Traders Choose TradeAutopsy</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Discover powerful features designed to help you identify patterns, improve discipline, and boost your trading performance.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-x-20 gap-y-16">
            {/* Feature 1 */}
            <div>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Find your ₹18K/month mistake</h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Trading after 2pm? Holding losers 3x longer than winners? Our time-based analysis catches the patterns bleeding your account dry.
                </p>
                <p className="text-sm text-green-400">→ Stop trading afternoons, save ₹2.1L annually</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Catch revenge trading in real-time</h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Lost ₹10K and immediately took 3 more trades? AI detects emotional patterns that turn small losses into disasters.
                </p>
                <p className="text-sm text-green-400">→ Get alerts before revenge trades, not after</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Discover which setups bleed your account</h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Breakout trades profitable but options selling killing you? See exactly which strategies work—and which don't.
                </p>
                <p className="text-sm text-green-400">→ Double down on winners, eliminate losers</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Know exactly where you stand</h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Compare your win rate, risk:reward, and drawdown to 20,847 traders with similar capital. No more guessing.
                </p>
                <p className="text-sm text-green-400">→ Top 20% traders have 2.1x better R:R ratio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black"></div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to find your blind spot?</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join 2,847 traders who stopped guessing and started improving. Free for your first 100 trades.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-2xl"
          >
            Analyze My Trades Free
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-sm text-gray-500 mt-6">No credit card required • Import from Zerodha in 1-click</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black border-t border-white/10">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>© 2025 TradeAutopsy</span>
              <span>•</span>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <span>•</span>
              <Link href="/support" className="hover:text-white transition-colors">Support</Link>
            </div>

            <div className="flex items-center gap-4">
              <a href="https://twitter.com" className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://linkedin.com" className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky CTA Bar */}
      {scrolled && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-white/10 py-4 px-6 animate-slide-up">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Find your ₹18K/month mistake</p>
              <p className="text-xs text-gray-400">Free analysis for first 100 trades</p>
            </div>
            <Link 
              href="/signup" 
              className="px-6 py-3 bg-white text-black rounded-lg font-semibold text-sm hover:bg-gray-100 transition-all hover:scale-105"
            >
              Analyze Free
            </Link>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
