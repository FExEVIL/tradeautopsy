import { CollapsibleSidebar } from '@/app/dashboard/components/CollapsibleSidebar'

export default function TiltAssessmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <CollapsibleSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-black scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  )
}
