/**
 * Profile Templates System
 * Pre-built profile configurations for different trading styles
 */

import { FeatureKey, AVAILABLE_FEATURES } from './feature-flags'

export type TemplateType = 'day_trader' | 'swing_trader' | 'options_trader' | 'investor' | 'custom'

export interface DashboardWidget {
  id: string
  type: string
  position: { x: number; y: number }
  size: { w: number; h: number }
  config?: Record<string, any>
}

export interface ProfileTemplate {
  id: TemplateType
  name: string
  icon: string
  color: string
  description: string
  enabledFeatures: FeatureKey[]
  dashboardWidgets: DashboardWidget[]
  settings: {
    defaultChartType: string
    defaultTimeframe: string
  }
}

export const PROFILE_TEMPLATES: Record<TemplateType, ProfileTemplate> = {
  day_trader: {
    id: 'day_trader',
    name: 'Day Trader',
    icon: 'TrendingUp',
    color: '#10b981',
    description: 'Intraday scalping and momentum trading',
    enabledFeatures: [
      AVAILABLE_FEATURES.BEHAVIORAL_ANALYSIS,
      AVAILABLE_FEATURES.PATTERN_LIBRARY,
      AVAILABLE_FEATURES.RISK_MANAGEMENT,
      AVAILABLE_FEATURES.MORNING_BRIEF,
      AVAILABLE_FEATURES.PREDICTIVE_ALERTS,
    ],
    dashboardWidgets: [
      { 
        id: 'daily_pnl',
        type: 'daily_pnl',
        position: { x: 0, y: 0 },
        size: { w: 2, h: 1 }
      },
      { 
        id: 'win_rate',
        type: 'win_rate',
        position: { x: 2, y: 0 },
        size: { w: 1, h: 1 }
      },
      { 
        id: 'intraday_chart',
        type: 'intraday_chart',
        position: { x: 0, y: 1 },
        size: { w: 3, h: 2 }
      },
      { 
        id: 'pattern_alerts',
        type: 'pattern_alerts',
        position: { x: 3, y: 0 },
        size: { w: 1, h: 2 }
      },
    ],
    settings: {
      defaultChartType: 'candlestick',
      defaultTimeframe: '1D',
    }
  },
  
  swing_trader: {
    id: 'swing_trader',
    name: 'Swing Trader',
    icon: 'BarChart3',
    color: '#3b82f6',
    description: 'Multi-day position trading',
    enabledFeatures: [
      AVAILABLE_FEATURES.STRATEGY_ANALYSIS,
      AVAILABLE_FEATURES.COMPARISONS,
      AVAILABLE_FEATURES.GOALS,
      AVAILABLE_FEATURES.ECONOMIC_CALENDAR,
      AVAILABLE_FEATURES.RISK_MANAGEMENT,
    ],
    dashboardWidgets: [
      { 
        id: 'equity_curve',
        type: 'equity_curve',
        position: { x: 0, y: 0 },
        size: { w: 3, h: 2 }
      },
      { 
        id: 'open_positions',
        type: 'open_positions',
        position: { x: 3, y: 0 },
        size: { w: 1, h: 2 }
      },
      { 
        id: 'weekly_performance',
        type: 'weekly_performance',
        position: { x: 0, y: 2 },
        size: { w: 2, h: 1 }
      },
    ],
    settings: {
      defaultChartType: 'line',
      defaultTimeframe: '90D',
    }
  },
  
  options_trader: {
    id: 'options_trader',
    name: 'Options Trader',
    icon: 'Layers',
    color: '#8b5cf6',
    description: 'Options and derivatives trading',
    enabledFeatures: [
      AVAILABLE_FEATURES.RISK_MANAGEMENT,
      AVAILABLE_FEATURES.AI_COACH,
      AVAILABLE_FEATURES.PREDICTIVE_ALERTS,
      AVAILABLE_FEATURES.STRATEGY_ANALYSIS,
      AVAILABLE_FEATURES.PATTERN_LIBRARY,
    ],
    dashboardWidgets: [
      { 
        id: 'options_pnl',
        type: 'options_pnl',
        position: { x: 0, y: 0 },
        size: { w: 2, h: 1 }
      },
      { 
        id: 'greeks_summary',
        type: 'greeks_summary',
        position: { x: 2, y: 0 },
        size: { w: 2, h: 1 }
      },
      { 
        id: 'expiry_calendar',
        type: 'expiry_calendar',
        position: { x: 0, y: 1 },
        size: { w: 4, h: 1 }
      },
      { 
        id: 'iv_chart',
        type: 'iv_chart',
        position: { x: 0, y: 2 },
        size: { w: 2, h: 2 }
      },
    ],
    settings: {
      defaultChartType: 'bar',
      defaultTimeframe: '30D',
    }
  },
  
  investor: {
    id: 'investor',
    name: 'Portfolio Investor',
    icon: 'PieChart',
    color: '#f59e0b',
    description: 'Long-term equity investing',
    enabledFeatures: [
      AVAILABLE_FEATURES.GOALS,
      AVAILABLE_FEATURES.COMPARISONS,
      AVAILABLE_FEATURES.STRATEGY_ANALYSIS,
      AVAILABLE_FEATURES.ECONOMIC_CALENDAR,
    ],
    dashboardWidgets: [
      { 
        id: 'portfolio_value',
        type: 'portfolio_value',
        position: { x: 0, y: 0 },
        size: { w: 2, h: 1 }
      },
      { 
        id: 'allocation_chart',
        type: 'allocation_chart',
        position: { x: 2, y: 0 },
        size: { w: 2, h: 2 }
      },
      { 
        id: 'yearly_returns',
        type: 'yearly_returns',
        position: { x: 0, y: 1 },
        size: { w: 2, h: 1 }
      },
      { 
        id: 'dividend_tracker',
        type: 'dividend_tracker',
        position: { x: 0, y: 2 },
        size: { w: 4, h: 1 }
      },
    ],
    settings: {
      defaultChartType: 'area',
      defaultTimeframe: '1Y',
    }
  },
  
  custom: {
    id: 'custom',
    name: 'Custom',
    icon: 'Settings',
    color: '#6b7280',
    description: 'Fully customizable profile',
    enabledFeatures: [
      AVAILABLE_FEATURES.BEHAVIORAL_ANALYSIS,
      AVAILABLE_FEATURES.AI_COACH,
      AVAILABLE_FEATURES.PATTERN_LIBRARY,
      AVAILABLE_FEATURES.RISK_MANAGEMENT,
      AVAILABLE_FEATURES.COMPARISONS,
      AVAILABLE_FEATURES.GOALS,
      AVAILABLE_FEATURES.STRATEGY_ANALYSIS,
      AVAILABLE_FEATURES.MORNING_BRIEF,
    ],
    dashboardWidgets: [
      { 
        id: 'net_pnl',
        type: 'net_pnl',
        position: { x: 0, y: 0 },
        size: { w: 2, h: 1 }
      },
      { 
        id: 'cumulative_chart',
        type: 'cumulative_chart',
        position: { x: 0, y: 1 },
        size: { w: 3, h: 2 }
      },
      { 
        id: 'recent_activity',
        type: 'recent_activity',
        position: { x: 3, y: 0 },
        size: { w: 1, h: 3 }
      },
    ],
    settings: {
      defaultChartType: 'line',
      defaultTimeframe: '30D',
    }
  },
}

/**
 * Get template by ID
 */
export function getTemplate(templateId: TemplateType): ProfileTemplate {
  return PROFILE_TEMPLATES[templateId] || PROFILE_TEMPLATES.custom
}

/**
 * Get all templates (excluding custom)
 */
export function getAvailableTemplates(): ProfileTemplate[] {
  return Object.values(PROFILE_TEMPLATES).filter(t => t.id !== 'custom')
}

/**
 * Apply template to profile configuration
 */
export function applyTemplate(templateId: TemplateType): {
  enabledFeatures: string[]
  dashboardWidgets: DashboardWidget[]
  settings: ProfileTemplate['settings']
  themeColor: string
} {
  const template = getTemplate(templateId)
  return {
    enabledFeatures: template.enabledFeatures,
    dashboardWidgets: template.dashboardWidgets,
    settings: template.settings,
    themeColor: template.color,
  }
}
