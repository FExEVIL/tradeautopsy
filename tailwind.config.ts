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
        primary: '#FFF',
        secondary: '#F5F5F5', 
        tertiary: '#777C7C',
        background: '#1F2123',
        surface: '#262628',
        input: '#1A1B1D',
        accent: '#32B8C6',
        'accent-hover': '#2AA4B0',
        error: '#FF5459',
        warning: '#E68161',
        profit: {
          primary: '#22c55e',
          light: '#4ade80',
          bg: 'rgba(34, 197, 94, 0.1)',
          border: 'rgba(34, 197, 94, 0.2)'
        },
        loss: {
          primary: '#ef4444',
          light: '#f87171',
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.2)'
        }
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
  plugins: [],
}
