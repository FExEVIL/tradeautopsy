'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  route: string
  category: 'setup' | 'first_trade' | 'analysis' | 'advanced'
}

interface OnboardingContextType {
  steps: OnboardingStep[]
  currentStep: OnboardingStep | null
  completedSteps: number
  totalSteps: number
  progress: number
  completeStep: (stepId: string) => void
  resetOnboarding: () => void
  skipOnboarding: () => void
  isOnboardingComplete: boolean
  showOnboarding: boolean
  setShowOnboarding: (show: boolean) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to TradeAutopsy',
    description: 'Get started with your trading journal',
    completed: false,
    route: '/onboarding/welcome',
    category: 'setup',
  },
  {
    id: 'import_trades',
    title: 'Import Your First Trade',
    description: 'Add trades from your broker or manually',
    completed: false,
    route: '/trades',
    category: 'first_trade',
  },
  {
    id: 'add_tags',
    title: 'Tag Your Trades',
    description: 'Organize trades with tags and categories',
    completed: false,
    route: '/trades',
    category: 'first_trade',
  },
  {
    id: 'view_dashboard',
    title: 'Explore Your Dashboard',
    description: 'See your performance metrics and insights',
    completed: false,
    route: '/dashboard',
    category: 'analysis',
  },
  {
    id: 'behavioral_analysis',
    title: 'Check Behavioral Analysis',
    description: 'Understand your trading psychology',
    completed: false,
    route: '/behavioral-analysis',
    category: 'analysis',
  },
  {
    id: 'tai_insights',
    title: 'Explore TAI Insights',
    description: 'Get AI-powered trading insights',
    completed: false,
    route: '/tai/insights',
    category: 'advanced',
  },
  {
    id: 'set_goals',
    title: 'Set Your Goals',
    description: 'Define your trading objectives',
    completed: false,
    route: '/goals',
    category: 'advanced',
  },
]

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [steps, setSteps] = useState<OnboardingStep[]>(defaultSteps)
  const [showOnboarding, setShowOnboarding] = useState(true)

  // Load progress from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const savedSteps = localStorage.getItem('onboarding_steps')
      const savedShow = localStorage.getItem('show_onboarding')

      if (savedSteps) {
        try {
          setSteps(JSON.parse(savedSteps))
        } catch (e) {
          // Invalid JSON, use defaults
        }
      }

      if (savedShow !== null) {
        setShowOnboarding(savedShow === 'true')
      }
    } catch (error) {
      // localStorage might not be available
      console.warn('Failed to load onboarding state:', error)
    }
  }, [])

  // Save progress to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('onboarding_steps', JSON.stringify(steps))
      localStorage.setItem('show_onboarding', String(showOnboarding))
    } catch (error) {
      // localStorage might not be available (private browsing, quota exceeded, etc.)
      console.warn('Failed to save onboarding state:', error)
    }
  }, [steps, showOnboarding])

  const completeStep = (stepId: string) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    )
  }

  const resetOnboarding = () => {
    setSteps(defaultSteps)
    setShowOnboarding(true)
  }

  const skipOnboarding = () => {
    setShowOnboarding(false)
  }

  const completedSteps = steps.filter((s) => s.completed).length
  const totalSteps = steps.length
  const progress = (completedSteps / totalSteps) * 100
  const currentStep = steps.find((s) => !s.completed) || null
  const isOnboardingComplete = completedSteps === totalSteps

  return (
    <OnboardingContext.Provider
      value={{
        steps,
        currentStep,
        completedSteps,
        totalSteps,
        progress,
        completeStep,
        resetOnboarding,
        skipOnboarding,
        isOnboardingComplete,
        showOnboarding,
        setShowOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}
