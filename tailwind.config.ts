/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background Colors - flat names to support bg-bg-card pattern
        'bg-app': '#000000',
        'bg-card': '#0a0a0a',
        'bg-card-hover': '#121212',
        'bg-section': '#050505',
        'bg-header': '#0d0d0d',
        
        // Border Colors - flat names to support border-border-subtle pattern
        'border-subtle': '#1a1a1a',
        'border-default': '#262626',
        'border-emphasis': '#333333',
        
        // Text Colors - flat names to support text-text-primary pattern
        'text-primary': '#ffffff',
        'text-secondary': '#a3a3a3',
        'text-tertiary': '#737373',
        'text-muted': '#525252',
        'text-disabled': '#404040',
        
        // Green - Success/Positive
        'green-primary': '#22c55e',
        'green-hover': '#16a34a',
        'green-subtle': 'rgba(34, 197, 94, 0.1)',
        'green-border': 'rgba(34, 197, 94, 0.3)',
        'green-text': '#4ade80',
        
        // Red - Danger/Negative
        'red-primary': '#ef4444',
        'red-hover': '#dc2626',
        'red-subtle': 'rgba(239, 68, 68, 0.1)',
        'red-border': 'rgba(239, 68, 68, 0.3)',
        'red-text': '#f87171',
        
        // Purple - AI/TAI Features
        'purple-primary': '#a855f7',
        'purple-hover': '#9333ea',
        'purple-subtle': 'rgba(168, 85, 247, 0.1)',
        'purple-border': 'rgba(168, 85, 247, 0.3)',
        
        // Blue - Info/Secondary Actions
        'blue-primary': '#3b82f6',
        'blue-subtle': 'rgba(59, 130, 246, 0.1)',
        'blue-border': 'rgba(59, 130, 246, 0.3)',
        
        // Yellow/Orange - Warnings
        'yellow-primary': '#f59e0b',
        'yellow-subtle': 'rgba(245, 158, 11, 0.1)',
        'yellow-border': 'rgba(245, 158, 11, 0.3)',
        
        // Legacy support (mapped to new system)
        primary: '#ffffff',
        secondary: '#a3a3a3',
        tertiary: '#737373',
        background: '#000000',
        surface: '#0a0a0a',
        input: '#1a1a1a',
        profit: {
          primary: '#22c55e',
          light: '#4ade80',
          bg: 'rgba(34, 197, 94, 0.1)',
          border: 'rgba(34, 197, 94, 0.3)'
        },
        loss: {
          primary: '#ef4444',
          light: '#f87171',
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.3)'
        }
      },
      borderRadius: {
        'sm': '0.375rem',   // 6px
        'md': '0.5rem',     // 8px
        'lg': '0.75rem',    // 12px
        'xl': '1rem',       // 16px
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.5)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.5)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.5)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.5)',
        'green': '0 0 20px rgba(34, 197, 94, 0.3)',
        'red': '0 0 20px rgba(239, 68, 68, 0.3)',
        'purple': '0 0 20px rgba(168, 85, 247, 0.3)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'blink': 'blink 1.5s ease-in-out infinite',
        'pulse-smooth': 'pulse-smooth 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'pulse-smooth': {
          '0%, 100%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '0.4',
            transform: 'scale(0.95)',
          },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }: any) {
      // Add utilities for double-prefix color patterns used in components
      // These are needed because components use bg-bg-card directly in className
      addUtilities({
        '.bg-bg-card': { backgroundColor: 'var(--color-bg-card)' },
        '.bg-bg-app': { backgroundColor: 'var(--color-bg-app)' },
        '.bg-bg-card-hover': { backgroundColor: 'var(--color-bg-card-hover)' },
        '.bg-bg-section': { backgroundColor: 'var(--color-bg-section)' },
        '.bg-bg-header': { backgroundColor: 'var(--color-bg-header)' },
        '.border-border-subtle': { borderColor: 'var(--color-border-subtle)' },
        '.border-border-default': { borderColor: 'var(--color-border-default)' },
        '.border-border-emphasis': { borderColor: 'var(--color-border-emphasis)' },
        '.hover\\:border-border-default:hover': { borderColor: 'var(--color-border-default)' },
        '.text-text-primary': { color: 'var(--color-text-primary)' },
        '.text-text-secondary': { color: 'var(--color-text-secondary)' },
        '.text-text-tertiary': { color: 'var(--color-text-tertiary)' },
        '.text-text-muted': { color: 'var(--color-text-muted)' },
        '.text-text-disabled': { color: 'var(--color-text-disabled)' },
        '.hover\\:text-text-primary:hover': { color: 'var(--color-text-primary)' },
        '.hover\\:bg-border-subtle:hover': { backgroundColor: 'var(--color-border-subtle)' },
        '.hover\\:bg-border-default:hover': { backgroundColor: 'var(--color-border-default)' },
        '.placeholder\\:text-text-muted::placeholder': { color: 'var(--color-text-muted)' },
      });
    },
  ],
}
