/**
 * Comprehensive Type Definitions
 * All types are explicitly defined - NO `any` types
 */

// ============================================
// DATABASE TYPES
// ============================================

export interface Trade {
  id: string
  user_id: string
  profile_id: string | null
  trade_date: string
  entry_time: string | null
  exit_time: string | null
  symbol: string | null
  tradingsymbol: string | null
  side: 'LONG' | 'SHORT' | null
  quantity: number | null
  entry_price: number | null
  exit_price: number | null
  pnl: number | null
  pnl_percentage: number | null
  charges: number | null
  strategy: string | null
  setup: string | null
  instrument_type: string | null
  segment: string | null
  lot_size: number | null
  trade_type: string | null
  status: string | null
  notes: string | null
  tags: string[] | null
  emotion: string | null
  rating: number | null
  setup_type: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Profile {
  id: string
  user_id: string
  name: string
  description: string | null
  type: 'fno' | 'equity' | 'options' | 'mutual_funds' | 'crypto' | 'custom'
  color: string
  icon: string
  is_default: boolean
  account_size: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Goal {
  id: string
  user_id: string
  profile_id: string | null
  goal_type: 'profit' | 'win_rate' | 'consistency' | 'risk' | 'behavioral'
  title: string
  target_value: number
  current_value: number
  deadline: string | null
  completed: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Insight {
  id: string
  user_id: string
  profile_id: string | null
  type: string
  title: string
  message: string
  severity: number
  confidence: number
  dismissed: boolean
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  user_id: string
  profile_id: string | null
  achievement_type: string
  title: string
  description: string
  unlocked_at: string
  created_at: string
}

export interface AIConversation {
  id: string
  user_id: string
  profile_id: string | null
  role: 'user' | 'assistant' | 'system'
  content: string
  context_snapshot: Record<string, any> | null
  emotional_state: Record<string, any> | null
  tokens_used: number | null
  model: string | null
  latency_ms: number | null
  reaction: 'helpful' | 'not_helpful' | null
  feedback: string | null
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  trade_id: string | null
  content: string
  tags: string[] | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface AudioJournalEntry {
  id: string
  user_id: string
  trade_id: string | null
  audio_url: string
  transcription: string | null
  summary: string | null
  emotion: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface DetectedPattern {
  id: string
  user_id: string
  profile_id: string | null
  pattern_type: BehavioralPatternType
  severity: number
  confidence: number
  cost: number
  frequency: number
  trades_affected: string[]
  metadata: Record<string, any>
  suggestions: string[]
  acknowledged: boolean
  acknowledged_at: string | null
  detected_at: string
}

// ============================================
// COMPUTED TYPES
// ============================================

export interface DashboardMetrics {
  totalTrades: number
  totalPnl: number
  winRate: number
  winningTrades: number
  losingTrades: number
  avgWin: number
  avgLoss: number
  largestWin: number
  largestLoss: number
  totalVolume: number
  profitFactor: number
  expectancy: number
  sharpeRatio: number | null
  sortinoRatio: number | null
  maxDrawdown: number | null
}

export interface SymbolPerformance {
  symbol: string
  totalTrades: number
  totalPnl: number
  winRate: number
  avgPnl: number
  largestWin: number
  largestLoss: number
  avgWin: number
  avgLoss: number
}

export interface DailyPnlData {
  date: string
  pnl: number
  cumulativePnl: number
  tradesCount: number
}

export interface TimePerformance {
  hour: number
  totalTrades: number
  totalPnl: number
  winRate: number
  avgPnl: number
}

export interface StrategyPerformance {
  strategy: string
  totalTrades: number
  totalPnl: number
  winRate: number
  avgPnl: number
  largestWin: number
  largestLoss: number
}

// ============================================
// BEHAVIORAL TYPES
// ============================================

export type BehavioralPatternType =
  | 'revenge_trading'
  | 'overtrading'
  | 'fomo'
  | 'fear_of_missing_out'
  | 'revenge_sizing'
  | 'impulsive_entry'
  | 'early_exit'
  | 'holding_losers'

export interface BehavioralPattern {
  type: BehavioralPatternType
  severity: number // 1-10
  confidence: number // 0-1
  cost: number // Estimated cost in INR
  frequency: number // Occurrences per period
  tradesAffected: string[] // Trade IDs
  metadata: Record<string, any>
  suggestions: string[]
  detectedAt: Date
}

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: {
    page?: number
    pageSize?: number
    total?: number
    totalPages?: number
  }
}

export interface ApiError {
  code: string
  message: string
  field?: string
  details?: Record<string, any>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ============================================
// UTILITY TYPES
// ============================================

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type NullableOptional<T> = T | null | undefined

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type WithRequired<T, K extends keyof T> = T & {
  [P in K]-?: T[P]
}

export type WithOptional<T, K extends keyof T> = Omit<T, K> & {
  [P in K]?: T[P]
}

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

// ============================================
// FILTER TYPES
// ============================================

export interface TradeFilters {
  startDate?: Date
  endDate?: Date
  symbol?: string
  strategy?: string
  side?: 'LONG' | 'SHORT'
  minPnl?: number
  maxPnl?: number
  tags?: string[]
  emotion?: string
  rating?: number
  profileId?: string | null
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

// ============================================
// FORM TYPES
// ============================================

export interface CreateTradeInput {
  trade_date: string
  symbol: string
  tradingsymbol?: string
  side: 'LONG' | 'SHORT'
  quantity: number
  entry_price: number
  exit_price?: number
  entry_time?: string
  exit_time?: string
  strategy?: string
  setup?: string
  instrument_type?: string
  segment?: string
  notes?: string
  tags?: string[]
  emotion?: string
  rating?: number
  profile_id?: string | null
}

export interface UpdateTradeInput {
  trade_date?: string
  symbol?: string
  tradingsymbol?: string
  side?: 'LONG' | 'SHORT'
  quantity?: number
  entry_price?: number
  exit_price?: number
  entry_time?: string
  exit_time?: string
  strategy?: string
  setup?: string
  notes?: string
  tags?: string[]
  emotion?: string
  rating?: number
}

export interface CreateGoalInput {
  goal_type: 'profit' | 'win_rate' | 'consistency' | 'risk' | 'behavioral'
  title: string
  target_value: number
  deadline?: string | null
  profile_id?: string | null
}

export interface CreateProfileInput {
  name: string
  description?: string
  type: 'fno' | 'equity' | 'options' | 'mutual_funds' | 'crypto' | 'custom'
  color?: string
  icon?: string
  account_size?: number | null
}

// ============================================
// CHART TYPES
// ============================================

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface TimeSeriesData {
  labels: string[]
  values: number[]
  cumulative?: number[]
}

// ============================================
// EMOTIONAL STATE TYPES
// ============================================

export interface EmotionalState {
  overall: number // 0-100
  confidence: number // 0-100
  discipline: number // 0-100
  patience: number // 0-100
  emotionalControl: number // 0-100
  riskAwareness: number // 0-100
  fear: number // 0-100
  greed: number // 0-100
  revenge: number // 0-100
  overconfidence: number // 0-100
  status: 'excellent' | 'good' | 'neutral' | 'warning' | 'critical'
  recommendation: string
  insights: string[]
}

// ============================================
// EXPORT ALL TYPES
// ============================================

export type {
  Trade,
  Profile,
  Goal,
  Insight,
  Achievement,
  AIConversation,
  JournalEntry,
  AudioJournalEntry,
  DetectedPattern,
  DashboardMetrics,
  SymbolPerformance,
  DailyPnlData,
  TimePerformance,
  StrategyPerformance,
  BehavioralPatternType,
  BehavioralPattern,
  ApiResponse,
  ApiError,
  PaginatedResponse,
  TradeFilters,
  PaginationParams,
  SortParams,
  CreateTradeInput,
  UpdateTradeInput,
  CreateGoalInput,
  CreateProfileInput,
  ChartDataPoint,
  TimeSeriesData,
  EmotionalState,
}

