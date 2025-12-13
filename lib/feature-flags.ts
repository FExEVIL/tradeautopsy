/**
 * Feature Flags System
 * Defines all available features that can be toggled per profile
 */

export const AVAILABLE_FEATURES = {
  BEHAVIORAL_ANALYSIS: 'behavioral_analysis',
  AI_COACH: 'ai_coach',
  PATTERN_LIBRARY: 'pattern_library',
  RISK_MANAGEMENT: 'risk_management',
  ECONOMIC_CALENDAR: 'economic_calendar',
  COMPARISONS: 'comparisons',
  GOALS: 'goals',
  STRATEGY_ANALYSIS: 'strategy_analysis',
  MORNING_BRIEF: 'morning_brief',
  AUDIO_JOURNAL: 'audio_journal',
  PREDICTIVE_ALERTS: 'predictive_alerts',
  ML_INSIGHTS: 'ml_insights',
} as const

export type FeatureKey = typeof AVAILABLE_FEATURES[keyof typeof AVAILABLE_FEATURES]

export interface FeatureConfig {
  key: FeatureKey
  name: string
  description: string
  category: 'core' | 'advanced' | 'premium'
  defaultEnabled: boolean
}

export const FEATURE_CONFIGS: Record<FeatureKey, FeatureConfig> = {
  [AVAILABLE_FEATURES.BEHAVIORAL_ANALYSIS]: {
    key: AVAILABLE_FEATURES.BEHAVIORAL_ANALYSIS,
    name: 'Behavioral Analysis',
    description: 'Analyze trading psychology and behavioral patterns',
    category: 'core',
    defaultEnabled: true,
  },
  [AVAILABLE_FEATURES.AI_COACH]: {
    key: AVAILABLE_FEATURES.AI_COACH,
    name: 'AI Coach',
    description: 'Get AI-powered trading insights and recommendations',
    category: 'core',
    defaultEnabled: true,
  },
  [AVAILABLE_FEATURES.PATTERN_LIBRARY]: {
    key: AVAILABLE_FEATURES.PATTERN_LIBRARY,
    name: 'Pattern Library',
    description: 'Identify and track trading patterns',
    category: 'core',
    defaultEnabled: true,
  },
  [AVAILABLE_FEATURES.RISK_MANAGEMENT]: {
    key: AVAILABLE_FEATURES.RISK_MANAGEMENT,
    name: 'Risk Management',
    description: 'Risk analysis and position sizing tools',
    category: 'core',
    defaultEnabled: true,
  },
  [AVAILABLE_FEATURES.ECONOMIC_CALENDAR]: {
    key: AVAILABLE_FEATURES.ECONOMIC_CALENDAR,
    name: 'Economic Calendar',
    description: 'Track economic events and announcements',
    category: 'core',
    defaultEnabled: false,
  },
  [AVAILABLE_FEATURES.COMPARISONS]: {
    key: AVAILABLE_FEATURES.COMPARISONS,
    name: 'Comparisons',
    description: 'Compare performance across time periods and strategies',
    category: 'core',
    defaultEnabled: true,
  },
  [AVAILABLE_FEATURES.GOALS]: {
    key: AVAILABLE_FEATURES.GOALS,
    name: 'Goals & Milestones',
    description: 'Set and track trading goals',
    category: 'core',
    defaultEnabled: true,
  },
  [AVAILABLE_FEATURES.STRATEGY_ANALYSIS]: {
    key: AVAILABLE_FEATURES.STRATEGY_ANALYSIS,
    name: 'Strategy Analysis',
    description: 'Analyze and compare trading strategies',
    category: 'core',
    defaultEnabled: true,
  },
  [AVAILABLE_FEATURES.MORNING_BRIEF]: {
    key: AVAILABLE_FEATURES.MORNING_BRIEF,
    name: 'Morning Brief',
    description: 'Daily trading brief and market insights',
    category: 'core',
    defaultEnabled: true,
  },
  [AVAILABLE_FEATURES.AUDIO_JOURNAL]: {
    key: AVAILABLE_FEATURES.AUDIO_JOURNAL,
    name: 'Audio Journal',
    description: 'Record voice notes for trade journal entries',
    category: 'advanced',
    defaultEnabled: false,
  },
  [AVAILABLE_FEATURES.PREDICTIVE_ALERTS]: {
    key: AVAILABLE_FEATURES.PREDICTIVE_ALERTS,
    name: 'Predictive Alerts',
    description: 'AI-powered alerts for potential trading opportunities',
    category: 'advanced',
    defaultEnabled: false,
  },
  [AVAILABLE_FEATURES.ML_INSIGHTS]: {
    key: AVAILABLE_FEATURES.ML_INSIGHTS,
    name: 'ML Insights',
    description: 'Machine learning powered trading insights',
    category: 'premium',
    defaultEnabled: false,
  },
}

/**
 * Check if a feature is enabled for a profile
 */
export function isFeatureEnabled(
  enabledFeatures: string[],
  feature: FeatureKey
): boolean {
  return enabledFeatures.includes(feature)
}

/**
 * Get all features by category
 */
export function getFeaturesByCategory(category: FeatureConfig['category']): FeatureConfig[] {
  return Object.values(FEATURE_CONFIGS).filter(f => f.category === category)
}

/**
 * Get default enabled features
 */
export function getDefaultEnabledFeatures(): FeatureKey[] {
  return Object.values(FEATURE_CONFIGS)
    .filter(f => f.defaultEnabled)
    .map(f => f.key)
}
