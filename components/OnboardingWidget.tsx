'use client'

import { useOnboarding } from '@/contexts/OnboardingContext'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle,
  Circle,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function OnboardingWidget() {
  const pathname = usePathname()
  const {
    steps,
    currentStep,
    completedSteps,
    totalSteps,
    progress,
    skipOnboarding,
    showOnboarding,
    isOnboardingComplete,
  } = useOnboarding()

  const [isExpanded, setIsExpanded] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only checking pathname after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Hide on auth pages (login, verify, signup, etc.)
  // Only check after mount to prevent hydration mismatch
  const isAuthPage = mounted && (
    pathname?.startsWith('/login') || 
    pathname?.startsWith('/verify') || 
    pathname?.startsWith('/signup') ||
    pathname?.startsWith('/forgot-password') ||
    pathname?.startsWith('/reset-password') ||
    pathname?.startsWith('/auth/')
  )

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted || isAuthPage || !showOnboarding || isOnboardingComplete) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-gray-800"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${(progress / 100) * 125.66} 125.66`}
                className="text-green-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {completedSteps}/{totalSteps}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white">Getting Started</h3>
            <p className="text-xs text-gray-400">
              {completedSteps} of {totalSteps} completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <button
            onClick={skipOnboarding}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Step Highlight */}
          {currentStep && (
            <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Circle className="w-5 h-5 text-green-400" />
                <span className="text-sm font-semibold text-green-400">
                  Next Step
                </span>
              </div>
              <h4 className="font-semibold text-white mb-1">
                {currentStep.title}
              </h4>
              <p className="text-sm text-gray-400 mb-3">
                {currentStep.description}
              </p>
              <Link
                href={currentStep.route}
                className="inline-flex items-center gap-2 text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
              >
                Start Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* All Steps */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  step.completed
                    ? 'bg-gray-800/50'
                    : step.id === currentStep?.id
                    ? 'bg-green-500/5 border border-green-500/30'
                    : 'bg-gray-800/30'
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      step.completed ? 'text-gray-400' : 'text-white'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {step.description}
                  </p>
                </div>

                {!step.completed && (
                  <Link
                    href={step.route}
                    className="text-green-400 hover:text-green-300"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
