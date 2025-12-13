import { APP_URL } from './constants'

export const internalLinks = {
  home: '/',
  features: '/features',
  dashboard: '/dashboard',
  patterns: '/dashboard/patterns',
  aiCoach: '/dashboard/coach',
  rules: '/dashboard/rules',
  risk: '/dashboard/risk',
  performance: '/dashboard/performance',
  blog: '/blog',
  faq: '/faq',
  pricing: '/pricing',
  signup: '/signup',
  login: '/login',
}

export const relatedPosts: Record<string, string[]> = {
  'revenge-trading': [
    'trading-psychology',
    'trading-discipline',
    'pattern-detection',
  ],
  'f-o-trading': ['position-sizing', 'risk-management', 'options-strategies'],
  'day-trading': ['intraday-strategies', 'scalping', 'market-hours'],
  'trading-journal': ['trading-analytics', 'performance-tracking', 'trade-review'],
  'pattern-detection': ['behavioral-analysis', 'trading-psychology', 'discipline'],
  'ai-coach': ['trading-improvement', 'coaching', 'personalized-insights'],
}

export function getFullUrl(path: string): string {
  return `${APP_URL}${path}`
}
