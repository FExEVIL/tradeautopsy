export interface Trade {
  id: string;
  user_id: string;
  profile_id: string;

  // Core trade data
  symbol: string;
  side: 'long' | 'short';
  entry_price: number;
  exit_price: number;
  quantity: number;

  // P&L
  pnl: number;
  pnl_percentage: number;
  gross_pnl: number;
  commission: number;

  // Timing
  entry_time: string;
  exit_time: string;
  duration_minutes: number;

  // Strategy & Setup
  strategy?: string;
  setup?: string;
  timeframe?: string;

  // Risk Management
  stop_loss?: number;
  target?: number;
  initial_risk?: number;
  risk_reward_ratio?: number;

  // Execution Quality
  slippage?: number;
  entry_type?: 'market' | 'limit' | 'stop';
  exit_type?: 'target' | 'stop' | 'manual' | 'time';

  // Psychology & Notes
  emotion_before?: 'confident' | 'fearful' | 'neutral' | 'excited' | 'anxious';
  emotion_after?: 'satisfied' | 'frustrated' | 'regretful' | 'relieved' | 'neutral';
  rule_followed?: boolean;
  notes?: string;

  // Tags & Classification
  tags?: string[];
  grade?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

  // Screenshots
  entry_screenshot?: string;
  exit_screenshot?: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

export type PatternType =
  // Emotional Patterns
  | 'revenge_trading'
  | 'fomo'
  | 'fear_of_loss'
  | 'overconfidence'
  | 'tilt'
  // Behavioral Patterns
  | 'overtrading'
  | 'revenge_sizing'
  | 'loss_aversion'
  | 'position_sizing_error'
  | 'correlation_exposure'
  // Time Patterns
  | 'time_decay'
  | 'monday_syndrome'
  | 'friday_carelessness'
  | 'news_trading'
  // Strategy Patterns
  | 'strategy_degradation'
  | 'style_drift'
  | 'plan_deviation';

export interface DetectedPattern {
  id: string;
  type: PatternType;
  severity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  confidence: number; // 0-1
  cost: number; // Estimated cost in currency
  frequency: number; // How often this occurs
  tradesAffected: string[]; // Trade IDs
  metadata: Record<string, any>;
  suggestions: string[]; // Actionable recommendations
  detectedAt: Date;
  acknowledgedAt?: Date;
}

export interface PatternInteraction {
  patterns: PatternType[];
  combined_severity: number;
  risk_multiplier: number;
  description: string;
}

export interface Metrics {
  // Core Performance
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRate: number;
  lossRate: number;

  // P&L Metrics
  totalPnL: number;
  grossProfit: number;
  grossLoss: number;
  netProfit: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;

  // Risk-Adjusted Metrics
  profitFactor: number;
  expectancy: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;

  // Drawdown Analysis
  maxDrawdown: number;
  maxDrawdownPercent: number;
  avgDrawdown: number;
  drawdownDuration: number; // Days
  recoveryFactor: number;

  // Consistency Metrics
  consistencyScore: number; // 0-100
  profitableDays: number;
  profitableWeeks: number;
  profitableMonths: number;
  avgDailyPnL: number;
  dailyPnLStdDev: number;

  // Streak Analysis
  currentStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
  avgWinStreak: number;
  avgLossStreak: number;

  // Risk Metrics
  avgRiskReward: number;
  avgRiskPerTrade: number;
  maxRiskPerTrade: number;
  riskAdjustedReturn: number;

  // Time Metrics
  avgTradeDuration: number;
  avgHoldingTime: number;
  timeInMarket: number; // Percentage

  // Execution Quality
  avgSlippage: number;
  fillRate: number;

  // Discipline Metrics
  ruleFollowedRate: number;
  planDeviationRate: number;

  // Edge Analysis
  edge: number;
  edgeDecayRate: number;

  // Timestamps
  periodStart: Date;
  periodEnd: Date;
  calculatedAt: Date;
}

export interface AdvancedMetrics extends Metrics {
  // Value at Risk
  var95: number;
  var99: number;
  cvar95: number;

  // Rolling Statistics
  rolling7DayReturn: number;
  rolling30DayReturn: number;
  rolling90DayReturn: number;

  // Performance Attribution
  attribution: {
    byStrategy: Record<string, number>;
    bySymbol: Record<string, number>;
    byTimeOfDay: Record<string, number>;
    byDayOfWeek: Record<string, number>;
    byMarketCondition: Record<string, number>;
  };

  // Z-Scores
  pnlZScore: number;
  winRateZScore: number;
  drawdownZScore: number;
}

export interface Insight {
  id: string;
  type: 'pattern_alert' | 'ml_insight' | 'milestone' | 'prediction' | 'coaching' | 'anomaly';
  category: 'risk' | 'performance' | 'behavior' | 'strategy' | 'opportunity';
  severity: 'critical' | 'warning' | 'info' | 'success';
  priority: number; // 1-10

  title: string;
  message: string;
  explanation: string; // Detailed explanation

  confidence: number; // 0-1
  impactScore: number; // Estimated $ impact

  data: Record<string, any>; // Supporting data
  visualization?: ChartConfig; // Optional chart

  actions: InsightAction[]; // Recommended actions

  relatedPatterns?: PatternType[];
  relatedTrades?: string[];

  acknowledged: boolean;
  dismissedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface InsightAction {
  id: string;
  label: string;
  description: string;
  type: 'navigate' | 'execute' | 'dismiss' | 'learn';
  payload?: Record<string, any>;
}

export interface TradePrediction {
  tradeId?: string;

  // Probability Estimates
  winProbability: number; // 0-1
  lossProbability: number; // 0-1
  breakEvenProbability: number; // 0-1

  // Expected Values
  expectedPnL: number;
  expectedRR: number;

  // Risk Assessment
  riskScore: number; // 0-100 (higher = more risky)
  riskFactors: RiskFactor[];

  // Confidence
  confidence: number; // Model confidence
  dataQuality: number; // Quality of input data

  // Similar Trades
  similarTrades: SimilarTrade[];

  // Recommendation
  recommendation: 'strong_take' | 'take' | 'neutral' | 'skip' | 'strong_skip';
  reasoning: string[];

  // Optimal Parameters
  suggestedStopLoss?: number;
  suggestedTarget?: number;
  suggestedSize?: number;

  createdAt: Date;
}

export interface RiskFactor {
  factor: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  mitigation?: string;
}

export interface SimilarTrade {
  tradeId: string;
  similarity: number; // 0-1
  outcome: 'win' | 'loss' | 'breakeven';
  pnl: number;
  matchingFactors: string[];
}

export interface CoachPersonality {
  id: string;
  name: string;
  style: 'aggressive' | 'conservative' | 'balanced' | 'mentor' | 'drill_sergeant';

  // Personality Traits (1-10)
  strictness: number; // How strict on rules
  encouragement: number; // Positive reinforcement level
  technicalDepth: number; // Simple vs complex explanations
  humorLevel: number; // Professional vs casual
  empathy: number; // Emotional understanding
  directness: number; // Blunt vs diplomatic

  // Communication Style
  responseLength: 'brief' | 'moderate' | 'detailed';
  usesEmojis: boolean;
  usesMetaphors: boolean;

  // Focus Areas
  focusAreas: ('risk' | 'psychology' | 'strategy' | 'execution' | 'discipline')[];

  systemPrompt: string; // Custom system prompt
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;

  // Context
  contextSnapshot?: ContextSnapshot;
  emotionalState?: EmotionalState;

  // Metadata
  tokensUsed?: number;
  model?: string;
  latencyMs?: number;

  // Reactions
  reaction?: 'helpful' | 'not_helpful';
  feedback?: string;
}

export interface EmotionalState {
  primary: 'confident' | 'anxious' | 'frustrated' | 'excited' | 'fearful' | 'calm' | 'neutral';
  intensity: number; // 0-1
  triggers: string[]; // What caused this state
  suggestions: string[]; // How to address it
}

export interface ContextSnapshot {
  metrics: Partial<Metrics>;
  activePatterns: PatternType[];
  recentPnL: number;
  currentStreak: number;
  todayTrades: number;
  emotionalState?: EmotionalState;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;

  category: 'discipline' | 'performance' | 'consistency' | 'learning' | 'milestones';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

  criteria: AchievementCriteria;
  progress: number; // 0-1

  reward: {
    xp: number;
    badge: string;
    title?: string; // Display title
    unlock?: string; // Feature unlock
  };

  unlockedAt?: Date;
  notified: boolean;
}

export interface AchievementCriteria {
  type: 'threshold' | 'streak' | 'cumulative' | 'challenge';
  metric: string;
  target: number;
  timeframe?: 'day' | 'week' | 'month' | 'all_time';
}

export interface Skill {
  id: string;
  name: string;
  category: 'psychology' | 'risk_management' | 'technical_analysis' | 'strategy' | 'execution';

  level: number; // 1-10
  currentXP: number;
  xpToNextLevel: number;

  description: string;
  benefits: string[]; // What this skill improves

  prerequisites: string[]; // Required skills
  unlockedFeatures: string[]; // What it unlocks
}

export interface Challenge {
  id: string;
  name: string;
  description: string;

  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';

  criteria: ChallengeCriteria[];
  progress: ChallengeProgress;

  reward: {
    xp: number;
    badge?: string;
    achievement?: string;
  };

  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'failed' | 'expired';
}

export interface ChallengeCriteria {
  description: string;
  metric: string;
  target: number;
  current: number;
  completed: boolean;
}

export interface ChallengeProgress {
  overallProgress: number; // 0-1
  criteriaProgress: number[]; // Progress per criteria
  lastUpdated: Date;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'pie' | 'heatmap' | 'scatter' | 'radar' | 'treemap';
  data: any[];
  xKey?: string;
  yKey?: string;
  series?: SeriesConfig[];
  options?: ChartOptions;
}

export interface SeriesConfig {
  key: string;
  name: string;
  color: string;
  type?: 'line' | 'bar' | 'area';
}

export interface ChartOptions {
  title?: string;
  subtitle?: string;
  legend?: boolean;
  tooltip?: boolean;
  animations?: boolean;
  responsive?: boolean;
}

export interface HeatmapData {
  data: HeatmapCell[];
  xLabels: string[];
  yLabels: string[];
  colorScale: string[];
  valueRange: [number, number];
}

export interface HeatmapCell {
  x: number;
  y: number;
  value: number;
  label?: string;
}

export interface Report {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';

  period: {
    start: Date;
    end: Date;
  };

  sections: ReportSection[];

  summary: string; // AI-generated summary
  highlights: string[]; // Key points
  concerns: string[]; // Areas of concern
  recommendations: string[]; // Action items

  pdfUrl?: string;
  createdAt: Date;
}

export interface ReportSection {
  title: string;
  content: string;
  charts?: ChartConfig[];
  tables?: TableData[];
  insights?: Insight[];
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
  footer?: (string | number)[];
}

export interface UnifiedContext {
  // User Identity
  userId: string;
  profileId: string;

  // Trading Data (cached)
  recentTrades: Trade[]; // Last 100
  todayTrades: Trade[];
  sessionTrades: Trade[];
  openPositions: Trade[];

  // Computed Analytics
  metrics: Metrics;
  advancedMetrics: AdvancedMetrics;
  features: FeatureMatrix;

  // Pattern Detection
  activePatterns: DetectedPattern[];
  patternHistory: DetectedPattern[];
  patternInteractions: PatternInteraction[];

  // Predictions
  currentRiskScore: number;
  portfolioHeat: number;
  marketRegime: MarketRegime;

  // Insights
  pendingInsights: Insight[];
  deliveredInsights: Insight[];

  // AI Coach
  coachPersonality: CoachPersonality;
  chatHistory: ChatMessage[];
  emotionalState: EmotionalState;

  // Gamification
  achievements: Achievement[];
  skills: Skill[];
  activeChallenges: Challenge[];

  // Action Plan
  currentPlan: ActionPlan | null;

  // Session
  lastInteraction: Date;
  sessionStart: Date;

  // Preferences
  preferences: UserPreferences;
}

export interface UserPreferences {
  // Trading Preferences
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  tradingStyle: string[];
  preferredSymbols: string[];
  preferredStrategies: string[];

  // Coach Preferences
  coachPersonalityId: string;
  checkInSchedule: {
    morningBriefing: boolean;
    preTrade: boolean;
    midDay: boolean;
    eveningReview: boolean;
  };

  // Notification Preferences
  notificationLevel: 'all' | 'important' | 'critical';
  channels: {
    inApp: boolean;
    email: boolean;
    discord?: string;
    slack?: string;
    telegram?: string;
  };

  // Display Preferences
  currency: string;
  timezone: string;
  dateFormat: string;
  theme: 'dark' | 'light' | 'system';
}

export interface ActionPlan {
  id: string;
  userId: string;

  weekStart: Date;
  focusArea: PatternType | 'general_improvement';

  goals: Goal[];
  dailyTasks: DailyTask[];

  progress: {
    overall: number;
    goalsCompleted: number;
    tasksCompleted: number;
  };

  reflection?: string;

  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  description: string;
  metric: string;
  target: number;
  current: number;
  completed: boolean;
}

export interface DailyTask {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  task: string;
  completed: boolean;
  completedAt?: Date;
}

export type MarketRegime =
  | 'strong_uptrend'
  | 'weak_uptrend'
  | 'strong_downtrend'
  | 'weak_downtrend'
  | 'ranging'
  | 'high_volatility'
  | 'low_volatility'
  | 'choppy';

export interface FeatureMatrix {
  // Time Features
  timeDistribution: Record<string, number>;
  dayDistribution: Record<string, number>;
  hourlyWinRates: Record<string, number>;

  // Strategy Features
  strategyPerformance: Record<string, StrategyStats>;
  setupPerformance: Record<string, SetupStats>;

  // Symbol Features
  symbolPerformance: Record<string, SymbolStats>;
  symbolCorrelations: Record<string, Record<string, number>>;

  // Performance Features
  performance: {
    winRate: number;
    profitFactor: number;
    avgRR: number;
    maxDrawdown: number;
    sharpeRatio: number;
    consistencyScore: number;
  };

  // Pattern Features
  patternFrequencies: Record<PatternType, number>;
  patternCosts: Record<PatternType, number>;

  // Risk Features
  avgRiskPerTrade: number;
  ruleViolationRate: number;
  positionSizeVariance: number;

  // Labels (for ML)
  labels: {
    totalProfit: number;
    riskAdjustedReturn: number;
    consistencyScore: number;
  };
}

export interface StrategyStats {
  name: string;
  tradeCount: number;
  winRate: number;
  avgPnL: number;
  totalPnL: number;
  profitFactor: number;
  avgRR: number;
  maxDrawdown: number;
  sharpeRatio: number;
  consistency: number;
  isDecaying: boolean;
  decayRate?: number;
}

export interface SetupStats {
  name: string;
  tradeCount: number;
  winRate: number;
  avgPnL: number;
  bestSymbols: string[];
  bestTimes: string[];
}

export interface SymbolStats {
  symbol: string;
  tradeCount: number;
  winRate: number;
  avgPnL: number;
  totalPnL: number;
  avgVolatility: number;
  bestStrategy: string;
  bestTimeOfDay: string;
}

export interface IntelligenceResponse {
  success: boolean;
  data?: any;
  error?: string;

  // Operation metadata
  operation: string;
  processingTimeMs: number;

  // Updates
  patterns?: DetectedPattern[];
  insights?: Insight[];
  metrics?: Partial<Metrics>;
  predictions?: TradePrediction;

  // Notifications
  notifications?: Notification[];
}

export interface Notification {
  id: string;
  type: 'pattern' | 'insight' | 'achievement' | 'challenge' | 'system';
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  action?: InsightAction;
  createdAt: Date;
}

