'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WelcomeStep } from './WelcomeStep'
import { ImportStep } from './ImportStep'
import { TourStep } from './TourStep'
import { GoalStep } from './GoalStep'
import { CompletionStep } from './CompletionStep'
import { X } from 'lucide-react'

export type OnboardingStepType = 'welcome' | 'import' | 'tour' | 'goal' | 'completion'

interface OnboardingFlowProps {
  onComplete: () => void
  onSkip: () => void
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStepType>('welcome')
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Check if onboarding was already completed
    const onboardingCompleted = localStorage.getItem('onboarding_completed')
    if (onboardingCompleted === 'true') {
      setIsVisible(false)
      onComplete()
    }
  }, [onComplete])

  const handleNext = () => {
    const steps: OnboardingStepType[] = ['welcome', 'import', 'tour', 'goal', 'completion']
    const currentIndex = steps.indexOf(currentStep)
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    const steps: OnboardingStepType[] = ['welcome', 'import', 'tour', 'goal', 'completion']
    const currentIndex = steps.indexOf(currentStep)
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true')
    setIsVisible(false)
    onSkip()
  }

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true')
    setIsVisible(false)
    onComplete()
  }

  const handleStepComplete = (step: OnboardingStepType, data?: any) => {
    // Store step completion data if needed
    if (data) {
      localStorage.setItem(`onboarding_${step}`, JSON.stringify(data))
    }
    handleNext()
  }

  if (!isVisible) return null

  const stepIndex = ['welcome', 'import', 'tour', 'goal', 'completion'].indexOf(currentStep)
  const totalSteps = 5

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      >
        {/* Ambient background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-primary/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative bg-bg-card border border-border-subtle rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Subtle gradient overlay on top */}
          <div className="absolute inset-0 bg-gradient-to-b from-green-primary/5 via-transparent to-transparent rounded-2xl pointer-events-none" />

          {/* Header with progress */}
          <div className="sticky top-0 bg-bg-card/95 backdrop-blur-sm border-b border-border-subtle px-6 py-5 z-10 rounded-t-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Getting Started</h2>
              <button
                onClick={handleSkip}
                className="text-text-tertiary hover:text-text-primary transition-colors p-1.5 hover:bg-border-subtle rounded-lg"
                aria-label="Skip onboarding"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i <= stepIndex 
                      ? 'bg-gradient-to-r from-green-primary to-green-hover' 
                      : 'bg-border-subtle'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-text-muted mt-2">
              Step {stepIndex + 1} of {totalSteps}
            </p>
          </div>

          {/* Step content */}
          <div className="relative p-6">
            <AnimatePresence mode="wait">
              {currentStep === 'welcome' && (
                <WelcomeStep key="welcome" onNext={handleNext} onSkip={handleSkip} />
              )}
              {currentStep === 'import' && (
                <ImportStep
                  key="import"
                  onNext={handleNext}
                  onBack={handleBack}
                  onSkip={handleSkip}
                  onComplete={(data) => handleStepComplete('import', data)}
                />
              )}
              {currentStep === 'tour' && (
                <TourStep
                  key="tour"
                  onNext={handleNext}
                  onBack={handleBack}
                  onSkip={handleSkip}
                />
              )}
              {currentStep === 'goal' && (
                <GoalStep
                  key="goal"
                  onNext={handleNext}
                  onBack={handleBack}
                  onSkip={handleSkip}
                  onComplete={(data) => handleStepComplete('goal', data)}
                />
              )}
              {currentStep === 'completion' && (
                <CompletionStep
                  key="completion"
                  onComplete={handleComplete}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
