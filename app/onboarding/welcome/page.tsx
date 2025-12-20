'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/OnboardingContext'
import {
  Sparkles,
  TrendingUp,
  Brain,
  Target,
  BarChart3,
  ArrowRight,
} from 'lucide-react'

export default function WelcomePage() {
  const router = useRouter()
  const { completeStep } = useOnboarding()

  useEffect(() => {
    // Mark welcome step as completed
    completeStep('welcome')
  }, [completeStep])

  const features = [
    {
      icon: TrendingUp,
      title: 'Trade Analytics',
      description: 'Comprehensive performance metrics and insights',
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get personalized trading recommendations',
    },
    {
      icon: Target,
      title: 'Goals & Milestones',
      description: 'Set and track your trading objectives',
    },
    {
      icon: BarChart3,
      title: 'Backtesting',
      description: 'Test strategies on historical data',
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to TradeAutopsy
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your AI-powered trading intelligence platform. Track trades, analyze
            patterns, and improve your trading performance.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-green-500/50 transition-colors"
              >
                <Icon className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => router.push('/trades')}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-lg inline-flex items-center gap-3 transition-colors shadow-lg shadow-green-500/20"
          >
            Get Started
            <ArrowRight className="w-6 h-6" />
          </button>

          <p className="text-sm text-gray-500 mt-6">
            Takes less than 2 minutes to set up
          </p>
        </div>
      </div>
    </div>
  )
}
