'use client'

import { useState, useEffect } from 'react'

export function OnboardingTour() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if user has seen tour
    const hasSeenTour = localStorage.getItem('hasSeenTour')
    if (!hasSeenTour) {
      setTimeout(() => setIsVisible(true), 1000)
    }
  }, [])

  const steps = [
    {
      title: '👋 Welcome to TradeAutopsy!',
      description: 'Let\'s take a quick tour to help you get started.',
      emoji: '🚀'
    },
    {
      title: '📊 View Your Analytics',
      description: 'See your total P&L, win rate, and key metrics at a glance.',
      emoji: '📈'
    },
    {
      title: '🧠 Get AI Insights',
      description: 'Our AI analyzes your patterns and tells you exactly what to improve.',
      emoji: '💡'
    },
    {
      title: '📋 Track All Trades',
      description: 'Filter and search through your complete trading history.',
      emoji: '🔍'
    },
    {
      title: '🎯 You\'re All Set!',
      description: 'Import your trades from Zerodha to get started.',
      emoji: '✨'
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    localStorage.setItem('hasSeenTour', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  const step = steps[currentStep]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-slide-down">
        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= currentStep ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{step.emoji}</div>
          <h2 className="text-2xl font-bold text-white mb-3">{step.title}</h2>
          <p className="text-gray-400">{step.description}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>

        {/* Skip */}
        <button
          onClick={handleClose}
          className="w-full mt-4 text-sm text-gray-500 hover:text-gray-400 transition-colors"
        >
          Skip tour
        </button>
      </div>
    </div>
  )
}
