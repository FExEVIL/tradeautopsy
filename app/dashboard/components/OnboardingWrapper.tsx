'use client'

import { useState, useEffect } from 'react'
import { OnboardingFlow } from './onboarding'

export function OnboardingWrapper() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Check if onboarding was completed
    const onboardingCompleted = localStorage.getItem('onboarding_completed')
    
    // Also check profile onboarding_completed flag from server if available
    // For now, just use localStorage
    if (onboardingCompleted !== 'true') {
      setShowOnboarding(true)
    }
  }, [])

  const handleComplete = () => {
    setShowOnboarding(false)
    // Optionally refresh the page to show new data
    window.location.reload()
  }

  const handleSkip = () => {
    setShowOnboarding(false)
  }

  if (!showOnboarding) return null

  return <OnboardingFlow onComplete={handleComplete} onSkip={handleSkip} />
}

