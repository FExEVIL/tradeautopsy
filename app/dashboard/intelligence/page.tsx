import { PageLayout } from '@/components/layouts/PageLayout'
import IntelligenceDashboard from './IntelligenceDashboard'

export default function IntelligencePage() {
  return (
    <PageLayout
      title="TAI"
      subtitle="TradeAutopsy Intelligence: unified patterns, risk, and AI coaching"
      icon="activity"
    >
      <IntelligenceDashboard />
    </PageLayout>
  )
}
