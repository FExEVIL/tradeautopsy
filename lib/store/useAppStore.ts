import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AppState {
  // User
  user: any | null
  setUser: (user: any) => void

  // Dashboard
  dashboardMetrics: any | null
  setDashboardMetrics: (metrics: any) => void

  // Calendar
  selectedDate: Date | null
  setSelectedDate: (date: Date) => void

  // UI
  sidebarOpen: boolean
  toggleSidebar: () => void

  // Cache
  lastFetch: Record<string, number>
  setLastFetch: (key: string, timestamp: number) => void
  shouldRefetch: (key: string, ttl: number) => boolean
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // User
        user: null,
        setUser: (user) => set({ user }),

        // Dashboard
        dashboardMetrics: null,
        setDashboardMetrics: (metrics) => set({ dashboardMetrics: metrics }),

        // Calendar
        selectedDate: null,
        setSelectedDate: (date) => set({ selectedDate: date }),

        // UI
        sidebarOpen: true,
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        // Cache
        lastFetch: {},
        setLastFetch: (key, timestamp) =>
          set((state) => ({
            lastFetch: { ...state.lastFetch, [key]: timestamp },
          })),
        shouldRefetch: (key, ttl) => {
          const lastFetch = get().lastFetch[key]
          if (!lastFetch) return true
          return Date.now() - lastFetch > ttl
        },
      }),
      {
        name: 'tradeautopsy-storage',
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          selectedDate: state.selectedDate,
        }),
      }
    ),
    { name: 'AppStore' }
  )
)
