// Default pre-market checklist items

export interface ChecklistItem {
  id: string
  text: string
  category: 'review' | 'planning' | 'risk' | 'mental' | 'custom'
  required: boolean
  order: number
}

export const defaultChecklistItems: ChecklistItem[] = [
  {
    id: 'review-yesterday',
    text: 'Reviewed yesterday\'s trades',
    category: 'review',
    required: true,
    order: 1,
  },
  {
    id: 'economic-calendar',
    text: 'Checked economic calendar',
    category: 'planning',
    required: true,
    order: 2,
  },
  {
    id: 'support-resistance',
    text: 'Identified key support/resistance levels',
    category: 'planning',
    required: false,
    order: 3,
  },
  {
    id: 'profit-target',
    text: 'Set daily profit target',
    category: 'risk',
    required: true,
    order: 4,
  },
  {
    id: 'loss-limit',
    text: 'Set daily loss limit',
    category: 'risk',
    required: true,
    order: 5,
  },
  {
    id: 'max-trades',
    text: 'Set max trades for today',
    category: 'risk',
    required: false,
    order: 6,
  },
  {
    id: 'watchlist',
    text: 'Watchlist prepared',
    category: 'planning',
    required: false,
    order: 7,
  },
  {
    id: 'mental-state',
    text: 'Mental state check (1-5 scale)',
    category: 'mental',
    required: true,
    order: 8,
  },
  {
    id: 'trading-plan',
    text: 'Trading plan written',
    category: 'planning',
    required: false,
    order: 9,
  },
  {
    id: 'pre-market-news',
    text: 'Pre-market news reviewed',
    category: 'planning',
    required: false,
    order: 10,
  },
]

export const checklistCategories = {
  review: { label: 'Review', color: 'blue' },
  planning: { label: 'Planning', color: 'purple' },
  risk: { label: 'Risk', color: 'red' },
  mental: { label: 'Mental', color: 'emerald' },
  custom: { label: 'Custom', color: 'gray' },
}

