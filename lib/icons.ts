import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  DollarSign,
  BarChart3,
  PieChart,
  Zap,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  Brain,
  Sparkles,
  Award,
  Trophy,
  Flag,
  Star,
  Heart,
  Flame,
  Wind,
  Waves,
  Mountain,
  Eye,
  Crosshair,
  Rocket,
  CircleDollarSign,
  Wallet,
  CreditCard,
  LineChart,
  BarChart2,
  BarChart4,
  ChartLine,
  ChartBar,
  Gauge,
  AlertTriangle,
  Lightbulb,
  Search,
  Sparkle,
  type LucideIcon
} from 'lucide-react'

// Profile type icons
export const profileIcons: Record<string, LucideIcon> = {
  fno: Activity,           // F&O trading
  equity: TrendingUp,      // Equity/stocks
  options: Target,         // Options trading
  mutual_funds: PieChart,  // Mutual funds
  crypto: Zap,             // Cryptocurrency
  swing: Waves,            // Swing trading
  scalping: Gauge,         // Scalping
  intraday: Clock,         // Intraday
  positional: Mountain,    // Positional
  custom: BarChart3,       // Custom/default
  default: BarChart3       // Fallback
}

// Pattern type icons
export const patternIcons: Record<string, LucideIcon> = {
  revenge_trading: Flame,        // Emotional/hot
  fomo: Wind,                    // Fast/impulsive
  overtrading: Activity,         // Too much activity
  win_streak: TrendingUp,        // Winning streak
  loss_aversion: Shield,         // Defensive
  revenge_sizing: AlertCircle,   // Warning
  weekend_warrior: Calendar,     // Time-based
  news_trader: Sparkles          // Event-driven
}

// Status icons
export const statusIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Eye,
  pending: Clock
}

// Goal/milestone icons
export const goalIcons = {
  profit: CircleDollarSign,
  winrate: Target,
  consistency: CheckCircle,
  discipline: Shield,
  achievement: Trophy,
  milestone: Flag,
  badge: Award,
  star: Star
}

// Strategy icons
export const strategyIcons: Record<string, LucideIcon> = {
  scalping: Gauge,
  intraday: Clock,
  swing: Waves,
  positional: Mountain,
  options: Target,
  default: BarChart3
}

// Setup icons
export const setupIcons: Record<string, LucideIcon> = {
  breakout: TrendingUp,
  breakdown: TrendingDown,
  reversal: Activity,
  pullback: Waves,
  range_bound: BarChart2,
  gap_up: Rocket,
  gap_down: TrendingDown,
  default: Crosshair
}

// Utility function to get icon by type and key
export function getIcon(
  type: 'profile' | 'pattern' | 'status' | 'goal' | 'strategy' | 'setup',
  key: string
): LucideIcon {
  switch (type) {
    case 'profile':
      return profileIcons[key] || profileIcons.default
    case 'pattern':
      return patternIcons[key] || Activity
    case 'status':
      return statusIcons[key as keyof typeof statusIcons] || Eye
    case 'goal':
      return goalIcons[key as keyof typeof goalIcons] || Star
    case 'strategy':
      return strategyIcons[key] || strategyIcons.default
    case 'setup':
      return setupIcons[key] || setupIcons.default
    default:
      return BarChart3
  }
}

// Icon color variants
export const iconColorVariants = {
  primary: 'text-blue-400',
  success: 'text-green-400',
  warning: 'text-amber-400',
  danger: 'text-red-400',
  info: 'text-cyan-400',
  purple: 'text-purple-400',
  pink: 'text-pink-400',
  muted: 'text-slate-400'
}

// Icon background variants
export const iconBackgroundVariants = {
  primary: 'bg-blue-500/20',
  success: 'bg-green-500/20',
  warning: 'bg-amber-500/20',
  danger: 'bg-red-500/20',
  info: 'bg-cyan-500/20',
  purple: 'bg-purple-500/20',
  pink: 'bg-pink-500/20',
  muted: 'bg-slate-700/50'
}
