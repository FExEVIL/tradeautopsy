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
<div className="bg-[#1a1a1a] border-b border-gray-800">
      <div className="flex items-center px-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'text-white border-white'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            <span onClick={() => onTabChange(tab.id)}>{tab.label}</span>
            {activeTab === tab.id && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle close logic here
                }}
                className="ml-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded px-1"
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