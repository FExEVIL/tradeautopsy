'use client'

export function ImprovedEmptyState() {
  const steps = [
    {
      number: '1',
      title: 'Connect Zerodha',
      description: 'Securely link your trading account',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      )
    },
    {
      number: '2',
      title: 'Import Trades',
      description: 'One-click import of your trading history',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    },
    {
      number: '3',
      title: 'Get Insights',
      description: 'AI analyzes patterns instantly',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-white mb-3">Start Your Journey to Profitable Trading</h2>
          <p className="text-xl text-gray-400">Discover why you lose money and what to fix in 3 simple steps</p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {steps.map((step, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mb-4 text-blue-400">
                {step.icon}
              </div>
              <div className="text-3xl font-bold text-gray-700 mb-2">{step.number}</div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 shadow-2xl">
            Connect Zerodha Account
          </button>
          <p className="text-gray-500 text-sm mt-4">
            🔒 Bank-level security • No passwords stored
          </p>
        </div>

        {/* Social Proof */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-500 text-sm mb-4">Trusted by 1,000+ traders</p>
          <div className="flex items-center justify-center gap-8 opacity-40">
            <div className="text-gray-600 font-semibold">Zerodha</div>
            <div className="text-gray-600 font-semibold">Upstox</div>
            <div className="text-gray-600 font-semibold">Angel One</div>
          </div>
        </div>
      </div>
    </div>
  )
}
