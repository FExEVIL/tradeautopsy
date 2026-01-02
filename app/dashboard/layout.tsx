import { CollapsibleSidebar } from './components/CollapsibleSidebar'
import { DashboardHeader } from './components/DashboardHeader'
import { ProfileProvider } from '@/lib/contexts/ProfileContext'
import { ProfileDashboardProvider } from '@/lib/contexts/ProfileDashboardContext'
import { UserProvider } from '@/lib/contexts/UserContext'
import { OnboardingWrapper } from './components/OnboardingWrapper'
import { ClientWidgets } from './components/ClientWidgets'
import { Suspense } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <ProfileProvider>
        <ProfileDashboardProvider>
        <OnboardingWrapper />
        <ClientWidgets />
        <div className="flex h-screen bg-black overflow-hidden">
          <CollapsibleSidebar />
          <div className="flex-1 flex flex-col overflow-hidden transition-all duration-200" style={{ transform: 'translateZ(0)' }}>
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto bg-black scrollbar-hide">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-800 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 text-sm">Loading...</p>
                  </div>
                </div>
              }>
                {children}
              </Suspense>
            </main>
          </div>
        </div>
        </ProfileDashboardProvider>
      </ProfileProvider>
    </UserProvider>
  )
}
