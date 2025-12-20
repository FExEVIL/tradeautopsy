'use client'

interface TopTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function TopTabs({ activeTab, onTabChange }: TopTabsProps) {
  const tabs = [
    { id: 'analysis', label: 'analysis.py' },
    { id: 'patterns', label: 'patterns.py' },
    { id: 'trades', label: 'trades.json' },
  ]

  return (
<div className="bg-bg-card border-b border-border-subtle">
      <div className="flex items-center px-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'text-text-primary border-green-primary'
                : 'text-text-tertiary border-transparent hover:text-text-primary'
            }`}
          >
            <span onClick={() => onTabChange(tab.id)}>{tab.label}</span>
            {activeTab === tab.id && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle close logic here
                }}
                className="ml-2 text-text-tertiary hover:text-text-primary hover:bg-border-subtle rounded px-1"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}