/**
 * Hook to check if a feature is enabled for the current profile
 */
import { useProfileDashboard } from '@/lib/contexts/ProfileDashboardContext'
import { FeatureKey, isFeatureEnabled } from '@/lib/feature-flags'

export function useFeatureEnabled(feature: FeatureKey): boolean {
  const { currentDashboard } = useProfileDashboard()
  
  if (!currentDashboard) {
    // Default to enabled if dashboard not loaded yet
    return true
  }
  
  return isFeatureEnabled(currentDashboard.enabledFeatures, feature)
}
