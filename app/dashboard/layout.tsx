import { CollapsibleSidebar } from './components/CollapsibleSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <CollapsibleSidebar />
      <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8">
        {children}
      </main>
    </div>
  )
}
