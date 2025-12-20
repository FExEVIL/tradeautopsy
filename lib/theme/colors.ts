/**
 * Color Theme
 * Pure black backgrounds only - NO blue tints
 */

export const colors = {
  // Background Colors (PURE BLACK ONLY)
  background: {
    primary: '#000000',
    secondary: '#0A0A0A',
    tertiary: '#111111',
    elevated: '#141414',
  },

  // Surface Colors
  surface: {
    default: '#0A0A0A',
    hover: '#141414',
    active: '#1A1A1A',
  },

  // Border Colors
  border: {
    default: '#1F1F1F',
    light: '#2A2A2A',
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1A1',
    tertiary: '#6B6B6B',
  },

  // Accent Colors (Emerald Green)
  accent: {
    primary: '#10B981',
    hover: '#059669',
    light: '#34D399',
    dark: '#047857',
  },

  // Semantic Colors
  semantic: {
    profit: '#10B981',
    loss: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    error: '#EF4444',
    success: '#10B981',
  },
} as const

export type ColorTheme = typeof colors

