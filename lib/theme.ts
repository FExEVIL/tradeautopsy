/**
 * TradeAutopsy Design System
 * Based on Performance Analytics page design
 */

export const theme = {
  colors: {
    background: {
      primary: 'bg-black',
      card: 'bg-white/5',
      cardDark: 'bg-[#0F0F0F]',
      cardDarker: 'bg-[#0A0A0A]',
      cardHover: 'hover:bg-white/10',
      elevated: 'bg-[#141414]',
    },
    border: {
      default: 'border-white/5',
      hover: 'hover:border-white/10',
      focus: 'focus:border-blue-500/50',
      active: 'border-white/20',
    },
    text: {
      primary: 'text-white',
      secondary: 'text-gray-400',
      tertiary: 'text-gray-500',
      muted: 'text-gray-600',
    },
    profit: {
      primary: 'text-green-400',
      light: 'text-green-500',
      bg: 'bg-green-500/10',
      bgIcon: 'bg-green-500/20',
      border: 'border-green-500/20',
    },
    loss: {
      primary: 'text-red-400',
      light: 'text-red-500',
      bg: 'bg-red-500/10',
      bgIcon: 'bg-red-500/20',
      border: 'border-red-500/20',
    },
    accent: {
      blue: 'text-blue-400',
      blueBg: 'bg-blue-500/10',
      blueBgIcon: 'bg-blue-500/20',
      purple: 'text-purple-400',
      orange: 'text-orange-400',
      pink: 'text-pink-400',
    },
  },

  typography: {
    pageTitle: 'text-3xl font-bold text-white',
    pageSubtitle: 'text-sm text-gray-400 mt-1',
    sectionHeading: 'text-lg font-semibold text-white',
    cardLabel: 'text-xs text-gray-500 font-medium uppercase tracking-wider',
    primaryValue: 'text-2xl font-bold text-white',
    primaryValueProfit: 'text-2xl font-bold text-green-400',
    primaryValueLoss: 'text-2xl font-bold text-red-400',
    secondaryValue: 'text-sm text-gray-400',
    body: 'text-sm text-gray-300',
    subtitle: 'text-[10px] text-gray-500',
  },

  spacing: {
    page: 'p-6',
    pageMobile: 'p-4 md:p-6',
    card: 'p-5',
    cardLarge: 'p-6',
    sectionGap: 'space-y-8',
    sectionGapSmall: 'space-y-6',
    gridGap: 'gap-4',
    gridGapLarge: 'gap-6',
  },

  components: {
    card: {
      base: 'bg-white/5 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all',
      dark: 'bg-[#0F0F0F] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all',
      darker: 'bg-[#0A0A0A] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all',
      profit: 'bg-green-500/10 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all',
      loss: 'bg-red-500/10 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all',
      highlighted: 'bg-white/5 border border-blue-500/30 rounded-xl p-5 shadow-lg shadow-blue-500/10',
    },
    icon: {
      container: 'p-2 rounded-lg',
      size: 'w-4 h-4',
      sizeLarge: 'w-6 h-6',
    },
    button: {
      primary: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium text-white',
      secondary: 'px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition text-white',
      success: 'px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition font-medium text-white',
      danger: 'px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition font-medium text-white',
    },
    input: {
      base: 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 transition text-white placeholder-gray-500',
    },
  },

  layout: {
    container: 'w-full max-w-7xl mx-auto px-6 py-8',
    grid2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    grid3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    grid4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
  },
}

// Helper function to combine classes (re-export from utils)
export { cn } from '@/lib/utils'
