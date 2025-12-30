'use client'

import { FeatureGate } from '@/components/FeatureGate'
import { MorningBrief } from './MorningBrief'
import { PredictiveAlerts } from './PredictiveAlerts'
import { AICoachCard } from './AICoachCard'

export function FeatureGatedMorningBrief() {
  return (
    <FeatureGate feature="morning_brief">
      <MorningBrief />
    </FeatureGate>
  )
}

export function FeatureGatedPredictiveAlerts() {
  return (
    <FeatureGate feature="predictive_alerts">
      <PredictiveAlerts />
    </FeatureGate>
  )
}

export function FeatureGatedAICoach() {
  return (
    <FeatureGate feature="ai_coach">
      <AICoachCard />
    </FeatureGate>
  )
}

