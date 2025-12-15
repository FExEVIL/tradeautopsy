# 🚀 TRADEAUTOPSY INTELLIGENCE v2.0 - ULTIMATE CURSOR AI PROMPT

## 🎯 PROJECT OVERVIEW

You are building **TradeAutopsy Intelligence (TAI) v2.0** - a comprehensive, AI-powered trading analytics platform that transforms raw trading data into actionable insights, predictive analytics, and personalized coaching.

**This is not just a feature. This is the entire nervous system of TradeAutopsy.**

---

## 📋 TABLE OF CONTENTS

1. [Tech Stack & Architecture](#tech-stack)
2. [Phase 1: Core Intelligence Engine](#phase-1)
3. [Phase 2: Advanced Pattern Detection](#phase-2)
4. [Phase 3: AI Coach Enhancement](#phase-3)
5. [Phase 4: Predictive Analytics](#phase-4)
6. [Phase 5: Gamification System](#phase-5)
7. [Phase 6: Advanced Visualizations](#phase-6)
8. [Phase 7: Integrations & Automation](#phase-7)
9. [Phase 8: Enterprise Features](#phase-8)
10. [Database Schema](#database-schema)
11. [API Documentation](#api-docs)
12. [Testing Strategy](#testing)
13. [Deployment Checklist](#deployment)

---

## 🛠️ TECH STACK & ARCHITECTURE {#tech-stack}

```yaml
Frontend:
  - Next.js 14+ (App Router)
  - React 18 with Server Components
  - TypeScript 5.3+ (strict mode)
  - Tailwind CSS + Framer Motion
  - Recharts + D3.js for visualizations
  - Zustand for state management

Backend:
  - Supabase (PostgreSQL, Auth, RLS, Edge Functions)
  - OpenAI GPT-4o-mini (primary AI)
  - Anthropic Claude (fallback)
  - Redis (caching, rate limiting)
  - BullMQ (job queues)

Infrastructure:
  - Vercel (hosting)
  - Supabase (database)
  - Upstash Redis
  - Resend (emails)
  - Cloudflare R2 (file storage)
```

### File Structure

```
lib/intelligence/
├── core/
│   ├── types.ts              # All TypeScript interfaces
│   ├── engine.ts             # Main orchestrator
│   ├── context-store.ts      # Unified context management
│   ├── config.ts             # System configuration
│   └── constants.ts          # Magic numbers & thresholds
│
├── detection/
│   ├── pattern-detector.ts   # 15 behavioral patterns
│   ├── anomaly-detector.ts   # Unusual trade detection
│   ├── regime-detector.ts    # Market condition detection
│   ├── correlation-detector.ts # Multi-position risk
│   └── degradation-detector.ts # Strategy decay
│
├── analytics/
│   ├── metrics-calculator.ts # 30+ trading metrics
│   ├── feature-extractor.ts  # ML feature engineering
│   ├── risk-calculator.ts    # VAR, portfolio risk
│   ├── attribution.ts        # Performance breakdown
│   ├── monte-carlo.ts        # Simulation engine
│   └── statistics.ts         # Rolling stats, z-scores
│
├── prediction/
│   ├── trade-predictor.ts    # Win probability
│   ├── exit-optimizer.ts     # Optimal exit timing
│   ├── position-sizer.ts     # Kelly criterion
│   ├── risk-scorer.ts        # Pre-trade risk score
│   └── scenario-simulator.ts # What-if analysis
│
├── coach/
│   ├── ai-coach.ts           # GPT-4 integration
│   ├── personality.ts        # Coach customization
│   ├── conversation.ts       # Multi-turn context
│   ├── proactive.ts          # Scheduled check-ins
│   ├── emotional.ts          # Sentiment analysis
│   └── voice.ts              # Voice mode
│
├── gamification/
│   ├── achievements.ts       # Badge system
│   ├── skill-tree.ts         # Progression system
│   ├── challenges.ts         # Daily/weekly goals
│   ├── leaderboard.ts        # Anonymous rankings
│   └── rewards.ts            # Unlock system
│
├── visualization/
│   ├── charts.ts             # Chart data generators
│   ├── heatmaps.ts           # Time/day performance
│   ├── reports.ts            # Report generators
│   └── pdf-export.ts         # PDF creation
│
├── integration/
│   ├── notifications.ts      # Discord/Slack/Telegram
│   ├── calendar.ts           # Economic events
│   ├── news.ts               # News sentiment
│   └── webhooks.ts           # External triggers
│
└── enterprise/
    ├── team.ts               # Multi-user analytics
    ├── risk-enforcement.ts   # Rule enforcement
    ├── audit.ts              # Audit logging
    └── rbac.ts               # Access control
```

---

## 📦 PHASE 1: CORE INTELLIGENCE ENGINE {#phase-1}

### 1.1 Complete Type System

```typescript
// lib/intelligence/core/types.ts

// ============================================
// TRADE TYPES
// ============================================

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

// ============================================
// PATTERN TYPES
// ============================================

export type PatternType = 
  // Emotional Patterns
  | 'revenge_trading'          // Trading after loss within 30min
  | 'fomo'                     // Chasing moves without plan
  | 'fear_of_loss'             // Cutting winners too early
  | 'overconfidence'           // Size increase after wins
  | 'tilt'                     // Multiple rapid losses
  
  // Behavioral Patterns  
  | 'overtrading'              // Too many trades per day
  | 'revenge_sizing'           // Size increase after losses
  | 'loss_aversion'            // Holding losers, cutting winners
  | 'position_sizing_error'    // Wrong size for account
  | 'correlation_exposure'     // Multiple correlated positions
  
  // Time Patterns
  | 'time_decay'               // Performance drops late in day
  | 'monday_syndrome'          // Poor Monday performance
  | 'friday_carelessness'      // Rushing before weekend
  | 'news_trading'             // Trading during high-impact news
  
  // Strategy Patterns
  | 'strategy_degradation'     // Winning strategy turning bad
  | 'style_drift'              // Trading outside your style
  | 'plan_deviation'           // Not following trade plan;

export interface DetectedPattern {
  id: string;
  type: PatternType;
  severity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  confidence: number;           // 0-1
  cost: number;                 // Estimated cost in currency
  frequency: number;            // How often this occurs
  tradesAffected: string[];     // Trade IDs
  metadata: Record<string, any>;
  suggestions: string[];        // Actionable recommendations
  detectedAt: Date;
  acknowledgedAt?: Date;
}

export interface PatternInteraction {
  patterns: PatternType[];
  combined_severity: number;
  risk_multiplier: number;
  description: string;
}

// ============================================
// METRICS TYPES
// ============================================

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
  drawdownDuration: number;     // Days
  recoveryFactor: number;
  
  // Consistency Metrics
  consistencyScore: number;     // 0-100
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
  timeInMarket: number;         // Percentage
  
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

// ============================================
// INSIGHT TYPES
// ============================================

export interface Insight {
  id: string;
  type: 'pattern_alert' | 'ml_insight' | 'milestone' | 'prediction' | 'coaching' | 'anomaly';
  category: 'risk' | 'performance' | 'behavior' | 'strategy' | 'opportunity';
  severity: 'critical' | 'warning' | 'info' | 'success';
  priority: number;             // 1-10
  
  title: string;
  message: string;
  explanation: string;          // Detailed explanation
  
  confidence: number;           // 0-1
  impactScore: number;          // Estimated $ impact
  
  data: Record<string, any>;    // Supporting data
  visualization?: ChartConfig;  // Optional chart
  
  actions: InsightAction[];     // Recommended actions
  
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

// ============================================
// PREDICTION TYPES
// ============================================

export interface TradePrediction {
  tradeId?: string;
  
  // Probability Estimates
  winProbability: number;       // 0-1
  lossProbability: number;      // 0-1
  breakEvenProbability: number; // 0-1
  
  // Expected Values
  expectedPnL: number;
  expectedRR: number;
  
  // Risk Assessment
  riskScore: number;            // 0-100 (higher = more risky)
  riskFactors: RiskFactor[];
  
  // Confidence
  confidence: number;           // Model confidence
  dataQuality: number;          // Quality of input data
  
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
  similarity: number;           // 0-1
  outcome: 'win' | 'loss' | 'breakeven';
  pnl: number;
  matchingFactors: string[];
}

// ============================================
// AI COACH TYPES
// ============================================

export interface CoachPersonality {
  id: string;
  name: string;
  style: 'aggressive' | 'conservative' | 'balanced' | 'mentor' | 'drill_sergeant';
  
  // Personality Traits (1-10)
  strictness: number;           // How strict on rules
  encouragement: number;        // Positive reinforcement level
  technicalDepth: number;       // Simple vs complex explanations
  humorLevel: number;           // Professional vs casual
  empathy: number;              // Emotional understanding
  directness: number;           // Blunt vs diplomatic
  
  // Communication Style
  responseLength: 'brief' | 'moderate' | 'detailed';
  usesEmojis: boolean;
  usesMetaphors: boolean;
  
  // Focus Areas
  focusAreas: ('risk' | 'psychology' | 'strategy' | 'execution' | 'discipline')[];
  
  systemPrompt: string;         // Custom system prompt
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
  intensity: number;            // 0-1
  triggers: string[];           // What caused this state
  suggestions: string[];        // How to address it
}

export interface ContextSnapshot {
  metrics: Partial<Metrics>;
  activePatterns: PatternType[];
  recentPnL: number;
  currentStreak: number;
  todayTrades: number;
  emotionalState?: EmotionalState;
}

// ============================================
// GAMIFICATION TYPES
// ============================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  
  category: 'discipline' | 'performance' | 'consistency' | 'learning' | 'milestones';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  
  criteria: AchievementCriteria;
  progress: number;             // 0-1
  
  reward: {
    xp: number;
    badge: string;
    title?: string;             // Display title
    unlock?: string;            // Feature unlock
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
  
  level: number;                // 1-10
  currentXP: number;
  xpToNextLevel: number;
  
  description: string;
  benefits: string[];           // What this skill improves
  
  prerequisites: string[];      // Required skills
  unlockedFeatures: string[];   // What it unlocks
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
  overallProgress: number;      // 0-1
  criteriaProgress: number[];   // Progress per criteria
  lastUpdated: Date;
}

// ============================================
// VISUALIZATION TYPES
// ============================================

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
  
  summary: string;              // AI-generated summary
  highlights: string[];         // Key points
  concerns: string[];           // Areas of concern
  recommendations: string[];    // Action items
  
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

// ============================================
// CONTEXT & STATE TYPES
// ============================================

export interface UnifiedContext {
  // User Identity
  userId: string;
  profileId: string;
  
  // Trading Data (cached)
  recentTrades: Trade[];        // Last 100
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

// ============================================
// API RESPONSE TYPES
// ============================================

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
```

### 1.2 Intelligence Engine

```typescript
// lib/intelligence/core/engine.ts

import { createClient } from '@/lib/supabase/server';
import { PatternDetector } from '../detection/pattern-detector';
import { MetricsCalculator } from '../analytics/metrics-calculator';
import { FeatureExtractor } from '../analytics/feature-extractor';
import { InsightGenerator } from '../analytics/insight-generator';
import { TradePredictor } from '../prediction/trade-predictor';
import { AICoach } from '../coach/ai-coach';
import { AchievementSystem } from '../gamification/achievements';
import { ChallengeManager } from '../gamification/challenges';
import {
  UnifiedContext,
  Trade,
  DetectedPattern,
  Insight,
  TradePrediction,
  IntelligenceResponse,
  ChatMessage,
  Metrics,
  ActionPlan,
} from './types';

export class IntelligenceEngine {
  private context: UnifiedContext | null = null;
  private initialized = false;
  
  // Sub-systems
  private patternDetector: PatternDetector;
  private metricsCalculator: MetricsCalculator;
  private featureExtractor: FeatureExtractor;
  private insightGenerator: InsightGenerator;
  private tradePredictor: TradePredictor;
  private aiCoach: AICoach;
  private achievementSystem: AchievementSystem;
  private challengeManager: ChallengeManager;
  
  // Cache
  private contextCache = new Map<string, { context: UnifiedContext; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.patternDetector = new PatternDetector();
    this.metricsCalculator = new MetricsCalculator();
    this.featureExtractor = new FeatureExtractor();
    this.insightGenerator = new InsightGenerator();
    this.tradePredictor = new TradePredictor();
    this.aiCoach = new AICoach();
    this.achievementSystem = new AchievementSystem();
    this.challengeManager = new ChallengeManager();
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  async initialize(userId: string, profileId: string): Promise<UnifiedContext> {
    const cacheKey = `${userId}:${profileId}`;
    
    // Check cache
    const cached = this.contextCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.context = cached.context;
      this.initialized = true;
      return this.context;
    }

    const startTime = Date.now();
    
    try {
      // Fetch all required data in parallel
      const [trades, preferences, chatHistory, achievements, challenges, actionPlan] = 
        await Promise.all([
          this.fetchTrades(userId, profileId),
          this.fetchPreferences(userId),
          this.fetchChatHistory(userId, profileId),
          this.fetchAchievements(userId),
          this.fetchChallenges(userId),
          this.fetchActionPlan(userId, profileId),
        ]);

      // Compute analytics
      const recentTrades = trades.slice(0, 100);
      const todayTrades = this.filterToday(trades);
      
      const metrics = this.metricsCalculator.calculate(trades);
      const advancedMetrics = this.metricsCalculator.calculateAdvanced(trades);
      const features = this.featureExtractor.extract(userId, profileId, trades);
      const patterns = this.patternDetector.detectAll(trades);
      const patternInteractions = this.patternDetector.detectInteractions(patterns);
      
      // Build context
      this.context = {
        userId,
        profileId,
        recentTrades,
        todayTrades,
        sessionTrades: [],
        openPositions: [],
        metrics,
        advancedMetrics,
        features,
        activePatterns: patterns,
        patternHistory: [],
        patternInteractions,
        currentRiskScore: this.calculatePortfolioRisk(todayTrades, metrics),
        portfolioHeat: this.calculatePortfolioHeat(todayTrades),
        marketRegime: 'ranging', // Would be fetched from external source
        pendingInsights: [],
        deliveredInsights: [],
        coachPersonality: this.aiCoach.getPersonality(preferences.coachPersonalityId),
        chatHistory,
        emotionalState: this.detectEmotionalState(todayTrades, metrics),
        achievements,
        skills: this.calculateSkills(achievements, metrics),
        activeChallenges: challenges.filter(c => c.status === 'active'),
        currentPlan: actionPlan,
        lastInteraction: new Date(),
        sessionStart: new Date(),
        preferences,
      };

      // Cache context
      this.contextCache.set(cacheKey, { context: this.context, timestamp: Date.now() });
      this.initialized = true;

      console.log(`[TAI] Initialized in ${Date.now() - startTime}ms`);
      return this.context;
      
    } catch (error) {
      console.error('[TAI] Initialization failed:', error);
      throw error;
    }
  }

  // ============================================
  // TRADE PROCESSING
  // ============================================

  async onNewTrade(trade: Trade): Promise<IntelligenceResponse> {
    if (!this.context) throw new Error('Engine not initialized');
    
    const startTime = Date.now();
    const response: IntelligenceResponse = {
      success: true,
      operation: 'onNewTrade',
      processingTimeMs: 0,
      patterns: [],
      insights: [],
      notifications: [],
    };

    try {
      // 1. Update context with new trade
      this.context.recentTrades.unshift(trade);
      this.context.todayTrades.unshift(trade);
      this.context.sessionTrades.unshift(trade);
      
      // Trim to limits
      if (this.context.recentTrades.length > 100) {
        this.context.recentTrades.pop();
      }

      // 2. Incremental metrics update
      this.context.metrics = this.metricsCalculator.updateIncremental(
        this.context.metrics,
        trade
      );

      // 3. Pattern detection (incremental)
      const newPatterns = this.patternDetector.detectIncremental(
        trade,
        this.context.recentTrades.slice(0, 30)
      );
      
      // Add new patterns to active list
      for (const pattern of newPatterns) {
        if (!this.context.activePatterns.find(p => p.type === pattern.type)) {
          this.context.activePatterns.push(pattern);
          response.patterns?.push(pattern);
          
          // Generate insight for pattern
          const insight = this.insightGenerator.fromPattern(pattern, this.context);
          if (insight) {
            response.insights?.push(insight);
            response.notifications?.push({
              id: crypto.randomUUID(),
              type: 'pattern',
              severity: insight.severity,
              title: insight.title,
              message: insight.message,
              createdAt: new Date(),
            });
          }
        }
      }

      // 4. Check pattern interactions
      if (newPatterns.length > 0) {
        this.context.patternInteractions = this.patternDetector.detectInteractions(
          this.context.activePatterns
        );
      }

      // 5. Check milestones & achievements
      const newAchievements = await this.achievementSystem.checkProgress(
        this.context.achievements,
        this.context.metrics,
        trade
      );
      
      for (const achievement of newAchievements) {
        response.notifications?.push({
          id: crypto.randomUUID(),
          type: 'achievement',
          severity: 'success',
          title: `🏆 Achievement Unlocked!`,
          message: `${achievement.name}: ${achievement.description}`,
          createdAt: new Date(),
        });
      }

      // 6. Update challenge progress
      await this.challengeManager.updateProgress(
        this.context.activeChallenges,
        trade,
        this.context.metrics
      );

      // 7. Update action plan progress
      if (this.context.currentPlan) {
        await this.updateActionPlanProgress(trade);
      }

      // 8. Update emotional state
      this.context.emotionalState = this.detectEmotionalState(
        this.context.todayTrades,
        this.context.metrics
      );

      // 9. Update risk score
      this.context.currentRiskScore = this.calculatePortfolioRisk(
        this.context.todayTrades,
        this.context.metrics
      );

      // 10. Save to database
      await this.savePatterns(newPatterns);
      await this.saveInsights(response.insights || []);

      response.metrics = this.context.metrics;
      response.processingTimeMs = Date.now() - startTime;

      console.log(`[TAI] Trade processed in ${response.processingTimeMs}ms`);
      return response;

    } catch (error) {
      console.error('[TAI] Trade processing failed:', error);
      return {
        success: false,
        operation: 'onNewTrade',
        processingTimeMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================
  // AI COACH
  // ============================================

  async chat(message: string): Promise<ChatMessage> {
    if (!this.context) throw new Error('Engine not initialized');

    // Add user message to history
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      contextSnapshot: this.createContextSnapshot(),
    };
    this.context.chatHistory.push(userMessage);

    // Detect emotional state from message
    const emotionalState = await this.aiCoach.detectEmotion(message);
    if (emotionalState) {
      this.context.emotionalState = emotionalState;
    }

    // Get AI response
    const response = await this.aiCoach.respond(
      message,
      this.context,
      this.context.chatHistory.slice(-10)
    );

    // Add assistant message to history
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
      emotionalState: this.context.emotionalState,
    };
    this.context.chatHistory.push(assistantMessage);

    // Process any suggested actions
    if (response.suggestedActions) {
      await this.processSuggestedActions(response.suggestedActions);
    }

    // Save to database
    await this.saveChatMessages([userMessage, assistantMessage]);

    return assistantMessage;
  }

  // ============================================
  // PREDICTIONS
  // ============================================

  async predictTrade(tradeSetup: Partial<Trade>): Promise<TradePrediction> {
    if (!this.context) throw new Error('Engine not initialized');

    return this.tradePredictor.predict(
      tradeSetup,
      this.context.recentTrades,
      this.context.features,
      this.context.metrics
    );
  }

  async getOptimalPositionSize(
    symbol: string,
    stopLossPercent: number,
    accountSize: number
  ): Promise<{ size: number; reasoning: string }> {
    if (!this.context) throw new Error('Engine not initialized');

    return this.tradePredictor.calculateOptimalSize(
      symbol,
      stopLossPercent,
      accountSize,
      this.context.metrics,
      this.context.preferences.riskTolerance
    );
  }

  // ============================================
  // INSIGHTS
  // ============================================

  async generateMLInsights(): Promise<Insight[]> {
    if (!this.context) throw new Error('Engine not initialized');

    const insights = this.insightGenerator.generateML(
      this.context.features,
      this.context.metrics,
      this.context.activePatterns
    );

    // Save to database
    await this.saveInsights(insights);

    return insights;
  }

  // ============================================
  // DASHBOARD
  // ============================================

  getDashboard() {
    if (!this.context) throw new Error('Engine not initialized');

    return {
      // Quick Stats
      quickStats: {
        todayPnL: this.context.todayTrades.reduce((s, t) => s + t.pnl, 0),
        todayTrades: this.context.todayTrades.length,
        todayWinRate: this.calculateWinRate(this.context.todayTrades),
        weekPnL: this.calculateWeekPnL(),
        currentStreak: this.context.metrics.currentStreak,
        riskScore: this.context.currentRiskScore,
      },
      
      // Core Metrics
      metrics: this.context.metrics,
      
      // Active Patterns
      activePatterns: this.context.activePatterns,
      patternInteractions: this.context.patternInteractions,
      
      // Recent Insights
      recentInsights: this.context.deliveredInsights.slice(0, 5),
      
      // Action Plan
      actionPlan: this.context.currentPlan,
      
      // Emotional State
      emotionalState: this.context.emotionalState,
      
      // Gamification
      recentAchievements: this.context.achievements
        .filter(a => a.unlockedAt)
        .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
        .slice(0, 3),
      activeChallenges: this.context.activeChallenges,
      
      // Skills
      topSkills: this.context.skills
        .sort((a, b) => b.level - a.level)
        .slice(0, 5),
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private async fetchTrades(userId: string, profileId: string): Promise<Trade[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .eq('profile_id', profileId)
      .order('exit_time', { ascending: false })
      .limit(1000);

    if (error) throw error;
    return data as Trade[];
  }

  private filterToday(trades: Trade[]): Trade[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return trades.filter(t => new Date(t.exit_time) >= today);
  }

  private calculateWinRate(trades: Trade[]): number {
    if (trades.length === 0) return 0;
    return trades.filter(t => t.pnl > 0).length / trades.length;
  }

  private calculateWeekPnL(): number {
    if (!this.context) return 0;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return this.context.recentTrades
      .filter(t => new Date(t.exit_time) >= weekAgo)
      .reduce((s, t) => s + t.pnl, 0);
  }

  private calculatePortfolioRisk(trades: Trade[], metrics: Metrics): number {
    // 0-100 risk score
    let risk = 0;
    
    // Factor 1: Today's drawdown
    const todayPnL = trades.reduce((s, t) => s + t.pnl, 0);
    if (todayPnL < 0) {
      risk += Math.min(Math.abs(todayPnL) / 1000 * 10, 30);
    }
    
    // Factor 2: Trade count (overtrading)
    if (trades.length > 5) {
      risk += (trades.length - 5) * 5;
    }
    
    // Factor 3: Current streak (losing)
    if (metrics.currentStreak < -2) {
      risk += Math.abs(metrics.currentStreak) * 5;
    }
    
    // Factor 4: Pattern count
    if (this.context) {
      risk += this.context.activePatterns.length * 8;
    }
    
    return Math.min(risk, 100);
  }

  private calculatePortfolioHeat(trades: Trade[]): number {
    // Simplified - would calculate based on open positions
    return trades.length > 3 ? 0.7 : trades.length > 1 ? 0.4 : 0.2;
  }

  private detectEmotionalState(trades: Trade[], metrics: Metrics): EmotionalState {
    const todayPnL = trades.reduce((s, t) => s + t.pnl, 0);
    const streak = metrics.currentStreak;
    
    if (todayPnL > 0 && streak >= 3) {
      return {
        primary: 'confident',
        intensity: 0.7,
        triggers: ['positive P&L', 'win streak'],
        suggestions: ['Stay disciplined', 'Avoid overconfidence'],
      };
    }
    
    if (todayPnL < 0 && streak <= -3) {
      return {
        primary: 'frustrated',
        intensity: 0.8,
        triggers: ['negative P&L', 'loss streak'],
        suggestions: ['Take a break', 'Review trading plan', 'Reduce position size'],
      };
    }
    
    if (trades.length > 5) {
      return {
        primary: 'anxious',
        intensity: 0.6,
        triggers: ['high trade count'],
        suggestions: ['Stop trading for today', 'Focus on quality over quantity'],
      };
    }
    
    return {
      primary: 'neutral',
      intensity: 0.3,
      triggers: [],
      suggestions: [],
    };
  }

  private createContextSnapshot(): ContextSnapshot {
    if (!this.context) throw new Error('No context');
    
    return {
      metrics: {
        winRate: this.context.metrics.winRate,
        profitFactor: this.context.metrics.profitFactor,
        currentStreak: this.context.metrics.currentStreak,
        totalPnL: this.context.metrics.totalPnL,
      },
      activePatterns: this.context.activePatterns.map(p => p.type),
      recentPnL: this.context.todayTrades.reduce((s, t) => s + t.pnl, 0),
      currentStreak: this.context.metrics.currentStreak,
      todayTrades: this.context.todayTrades.length,
      emotionalState: this.context.emotionalState,
    };
  }

  private calculateSkills(achievements: Achievement[], metrics: Metrics): Skill[] {
    // Calculate skill levels based on achievements and metrics
    return [
      {
        id: 'psychology',
        name: 'Trading Psychology',
        category: 'psychology',
        level: Math.min(10, Math.floor(metrics.ruleFollowedRate * 10)),
        currentXP: 0,
        xpToNextLevel: 1000,
        description: 'Master your emotions and mental game',
        benefits: ['Better emotional control', 'Reduced revenge trading'],
        prerequisites: [],
        unlockedFeatures: [],
      },
      {
        id: 'risk_management',
        name: 'Risk Management',
        category: 'risk_management',
        level: Math.min(10, metrics.profitFactor > 1.5 ? 6 : 3),
        currentXP: 0,
        xpToNextLevel: 1000,
        description: 'Protect your capital and manage risk',
        benefits: ['Lower drawdowns', 'More consistent returns'],
        prerequisites: [],
        unlockedFeatures: [],
      },
      // ... more skills
    ];
  }

  // Database operations
  private async fetchPreferences(userId: string): Promise<UserPreferences> {
    // Fetch from database or return defaults
    return {
      riskTolerance: 'moderate',
      tradingStyle: ['swing'],
      preferredSymbols: [],
      preferredStrategies: [],
      coachPersonalityId: 'balanced',
      checkInSchedule: {
        morningBriefing: true,
        preTrade: true,
        midDay: false,
        eveningReview: true,
      },
      notificationLevel: 'important',
      channels: { inApp: true, email: false },
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      theme: 'dark',
    };
  }

  private async fetchChatHistory(userId: string, profileId: string): Promise<ChatMessage[]> {
    const supabase = await createClient();
    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    return (data || []).map(d => ({
      id: d.id,
      role: d.role,
      content: d.message || d.response,
      timestamp: new Date(d.created_at),
    }));
  }

  private async fetchAchievements(userId: string): Promise<Achievement[]> {
    // Fetch and return achievements
    return this.achievementSystem.getAll(userId);
  }

  private async fetchChallenges(userId: string): Promise<Challenge[]> {
    return this.challengeManager.getActive(userId);
  }

  private async fetchActionPlan(userId: string, profileId: string): Promise<ActionPlan | null> {
    // Fetch current week's action plan
    return null; // Implement
  }

  private async savePatterns(patterns: DetectedPattern[]): Promise<void> {
    if (patterns.length === 0) return;
    
    const supabase = await createClient();
    await supabase.from('detected_patterns').insert(
      patterns.map(p => ({
        user_id: this.context!.userId,
        pattern_type: p.type,
        severity: p.severity,
        confidence: p.confidence,
        cost: p.cost,
        trades_affected: p.tradesAffected,
        metadata: p.metadata,
      }))
    );
  }

  private async saveInsights(insights: Insight[]): Promise<void> {
    if (insights.length === 0) return;
    
    const supabase = await createClient();
    await supabase.from('tai_insights').insert(
      insights.map(i => ({
        user_id: this.context!.userId,
        profile_id: this.context!.profileId,
        type: i.type,
        category: i.category,
        severity: i.severity,
        title: i.title,
        message: i.message,
        confidence: i.confidence,
        impact_score: i.impactScore,
        metadata: i.data,
      }))
    );
  }

  private async saveChatMessages(messages: ChatMessage[]): Promise<void> {
    const supabase = await createClient();
    
    for (const msg of messages) {
      await supabase.from('ai_conversations').insert({
        user_id: this.context!.userId,
        message: msg.role === 'user' ? msg.content : null,
        response: msg.role === 'assistant' ? msg.content : null,
        context: msg.contextSnapshot,
        sentiment: msg.emotionalState?.primary,
      });
    }
  }

  private async updateActionPlanProgress(trade: Trade): Promise<void> {
    if (!this.context?.currentPlan) return;
    // Update progress based on trade and plan goals
  }

  private async processSuggestedActions(actions: string[]): Promise<void> {
    // Process any actions the AI suggested
  }
}
```

---

I'll continue with Phase 2 in the next section due to length. This covers the complete type system and core engine.
# TAI ULTIMATE PROMPT - PART 2: COMPLETE PATTERN DETECTION

---

## 📦 PHASE 2: ADVANCED PATTERN DETECTION (CONTINUED)

### Pattern Detection Methods (Continued)

```typescript
// lib/intelligence/detection/pattern-detector.ts (continued)

  private detectMondaySyndrome(newTrade: Trade, window: Trade[]): PatternResult {
    if (window.length < 50) return { detected: false };
    
    const byDay: Record<string, Trade[]> = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (const trade of window) {
      const day = days[new Date(trade.entry_time).getDay()];
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(trade);
    }
    
    const monday = byDay['Monday'] || [];
    const otherDays = Object.entries(byDay)
      .filter(([day]) => day !== 'Monday' && day !== 'Saturday' && day !== 'Sunday')
      .flatMap(([, trades]) => trades);
    
    if (monday.length < 10 || otherDays.length < 30) return { detected: false };
    
    const mondayWinRate = monday.filter(t => t.pnl > 0).length / monday.length;
    const otherWinRate = otherDays.filter(t => t.pnl > 0).length / otherDays.length;
    
    if (otherWinRate - mondayWinRate > 0.15) {
      const mondayLosses = monday.filter(t => t.pnl < 0);
      
      return {
        detected: true,
        confidence: 0.75,
        severity: 5,
        cost: mondayLosses.reduce((sum, t) => sum + Math.abs(t.pnl), 0),
        tradesAffected: monday.map(t => t.id),
        metadata: {
          mondayWinRate: Math.round(mondayWinRate * 100),
          otherDaysWinRate: Math.round(otherWinRate * 100),
          mondayTrades: monday.length,
          otherDaysTrades: otherDays.length,
          difference: Math.round((otherWinRate - mondayWinRate) * 100),
        },
        suggestions: [
          'Your Monday performance is significantly worse than other days',
          'Consider starting Mondays with paper trading or observation only',
          'Mondays often have weekend gap risks and different market dynamics',
          'If you must trade Monday, use smaller position sizes',
          'Review what specifically goes wrong on Mondays',
        ],
      };
    }
    
    return { detected: false };
  }

  private detectFridayCarelessness(newTrade: Trade, window: Trade[]): PatternResult {
    if (window.length < 50) return { detected: false };
    
    const friday = window.filter(t => new Date(t.entry_time).getDay() === 5);
    const otherDays = window.filter(t => {
      const day = new Date(t.entry_time).getDay();
      return day !== 5 && day !== 0 && day !== 6;
    });
    
    if (friday.length < 10 || otherDays.length < 30) return { detected: false };
    
    // Check for Friday afternoon specifically (after 2 PM)
    const fridayAfternoon = friday.filter(t => new Date(t.entry_time).getHours() >= 14);
    
    if (fridayAfternoon.length < 5) return { detected: false };
    
    const fridayAfternoonWinRate = fridayAfternoon.filter(t => t.pnl > 0).length / fridayAfternoon.length;
    const otherWinRate = otherDays.filter(t => t.pnl > 0).length / otherDays.length;
    
    if (otherWinRate - fridayAfternoonWinRate > 0.2) {
      return {
        detected: true,
        confidence: 0.7,
        severity: 5,
        cost: fridayAfternoon.filter(t => t.pnl < 0).reduce((sum, t) => sum + Math.abs(t.pnl), 0),
        tradesAffected: fridayAfternoon.map(t => t.id),
        metadata: {
          fridayAfternoonWinRate: Math.round(fridayAfternoonWinRate * 100),
          otherWinRate: Math.round(otherWinRate * 100),
          fridayAfternoonTrades: fridayAfternoon.length,
        },
        suggestions: [
          'Your Friday afternoon trading is significantly worse',
          'You may be rushing to close positions before the weekend',
          'Consider stopping trading by 2 PM on Fridays',
          'Weekend gap risk makes Friday afternoon trades riskier',
          'Review if you\'re following your plan on Friday afternoons',
        ],
      };
    }
    
    return { detected: false };
  }

  private detectNewsTrading(newTrade: Trade, _: Trade[], context?: UnifiedContext): PatternResult {
    // Check if trade was during known high-impact news times
    const entryTime = new Date(newTrade.entry_time);
    const hour = entryTime.getHours();
    const minute = entryTime.getMinutes();
    
    // Common high-impact news times (IST)
    const newsWindows = [
      { start: 14, end: 14.5, event: 'US Market Open / Economic Data' },
      { start: 18, end: 19, event: 'US Fed / Major Announcements' },
      { start: 20, end: 21, event: 'US Economic Data' },
    ];
    
    const timeDecimal = hour + minute / 60;
    const matchedWindow = newsWindows.find(w => timeDecimal >= w.start && timeDecimal <= w.end);
    
    if (matchedWindow) {
      // Check for signs of news trading (high volatility, quick exits)
      const tradeDuration = newTrade.duration_minutes || 0;
      const isQuickTrade = tradeDuration < 10;
      const hasNoStop = !newTrade.stop_loss;
      
      if (isQuickTrade || hasNoStop) {
        return {
          detected: true,
          confidence: 0.65,
          severity: 6,
          cost: newTrade.pnl < 0 ? Math.abs(newTrade.pnl) : 0,
          tradesAffected: [newTrade.id],
          metadata: {
            newsWindow: matchedWindow.event,
            tradeDuration,
            hasStopLoss: !hasNoStop,
            entryTime: newTrade.entry_time,
          },
          suggestions: [
            `You traded during ${matchedWindow.event} window`,
            'News events cause unpredictable volatility',
            'Spreads widen and slippage increases during news',
            'Consider waiting 15-30 minutes after major news',
            'If you trade news, use wider stops and smaller size',
          ],
        };
      }
    }
    
    return { detected: false };
  }

  private detectStrategyDegradation(newTrade: Trade, window: Trade[]): PatternResult {
    if (!newTrade.strategy || window.length < 30) return { detected: false };
    
    const strategyTrades = window.filter(t => t.strategy === newTrade.strategy);
    
    if (strategyTrades.length < 20) return { detected: false };
    
    // Split into two halves
    const midpoint = Math.floor(strategyTrades.length / 2);
    const olderTrades = strategyTrades.slice(midpoint);
    const newerTrades = strategyTrades.slice(0, midpoint);
    
    const olderWinRate = olderTrades.filter(t => t.pnl > 0).length / olderTrades.length;
    const newerWinRate = newerTrades.filter(t => t.pnl > 0).length / newerTrades.length;
    
    const olderAvgPnL = olderTrades.reduce((sum, t) => sum + t.pnl, 0) / olderTrades.length;
    const newerAvgPnL = newerTrades.reduce((sum, t) => sum + t.pnl, 0) / newerTrades.length;
    
    // Strategy is degrading if newer performance is significantly worse
    const winRateDecline = olderWinRate - newerWinRate;
    const pnlDecline = olderAvgPnL - newerAvgPnL;
    
    if (winRateDecline > 0.15 || (olderAvgPnL > 0 && newerAvgPnL < 0)) {
      return {
        detected: true,
        confidence: 0.8,
        severity: 8,
        cost: newerTrades.filter(t => t.pnl < 0).reduce((sum, t) => sum + Math.abs(t.pnl), 0),
        tradesAffected: newerTrades.map(t => t.id),
        metadata: {
          strategy: newTrade.strategy,
          olderWinRate: Math.round(olderWinRate * 100),
          newerWinRate: Math.round(newerWinRate * 100),
          olderAvgPnL: Math.round(olderAvgPnL),
          newerAvgPnL: Math.round(newerAvgPnL),
          winRateDecline: Math.round(winRateDecline * 100),
          tradesAnalyzed: strategyTrades.length,
        },
        suggestions: [
          `Your "${newTrade.strategy}" strategy is showing signs of degradation`,
          `Win rate dropped from ${Math.round(olderWinRate * 100)}% to ${Math.round(newerWinRate * 100)}%`,
          'Market conditions may have changed',
          'Consider pausing this strategy and reviewing the setup',
          'Backtest to see if the edge still exists',
          'You may need to adjust parameters or retire this strategy',
        ],
      };
    }
    
    return { detected: false };
  }

  private detectStyleDrift(newTrade: Trade, window: Trade[], context?: UnifiedContext): PatternResult {
    if (!context?.preferences?.tradingStyle || context.preferences.tradingStyle.length === 0) {
      return { detected: false };
    }
    
    const preferredStyles = context.preferences.tradingStyle;
    
    // Check if current trade matches preferred style
    const tradeStyle = this.inferTradeStyle(newTrade);
    
    if (tradeStyle && !preferredStyles.includes(tradeStyle)) {
      // Check how many recent trades are off-style
      const recentTrades = window.slice(0, 10);
      const offStyleTrades = recentTrades.filter(t => {
        const style = this.inferTradeStyle(t);
        return style && !preferredStyles.includes(style);
      });
      
      if (offStyleTrades.length >= 3) {
        const offStylePnL = offStyleTrades.reduce((sum, t) => sum + t.pnl, 0);
        
        return {
          detected: true,
          confidence: 0.7,
          severity: 6,
          cost: offStylePnL < 0 ? Math.abs(offStylePnL) : 0,
          tradesAffected: offStyleTrades.map(t => t.id),
          metadata: {
            preferredStyles,
            detectedStyle: tradeStyle,
            offStyleCount: offStyleTrades.length,
            offStylePnL,
          },
          suggestions: [
            `You've been trading outside your defined style (${preferredStyles.join(', ')})`,
            `Recent trades look more like ${tradeStyle} trading`,
            'Style drift often happens during losing streaks',
            'Stick to what you know and have tested',
            'If you want to try a new style, do it with smaller size first',
          ],
        };
      }
    }
    
    return { detected: false };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private inferTradeStyle(trade: Trade): string | null {
    const duration = trade.duration_minutes || 0;
    
    if (duration < 5) return 'scalping';
    if (duration < 60) return 'day_trading';
    if (duration < 60 * 24) return 'intraday';
    if (duration < 60 * 24 * 5) return 'swing';
    return 'position';
  }

  private getWindow(trades: Trade[], windowSize: number | 'day' | 'week'): Trade[] {
    if (typeof windowSize === 'number') {
      return trades.slice(0, windowSize);
    }
    
    const now = new Date();
    let cutoff: Date;
    
    if (windowSize === 'day') {
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    return trades.filter(t => new Date(t.entry_time) >= cutoff);
  }

  private isInCooldown(type: PatternType, now: number): boolean {
    const cooldownUntil = this.cooldowns.get(type);
    return cooldownUntil !== undefined && now < cooldownUntil;
  }

  private setCooldown(type: PatternType, until: number): void {
    this.cooldowns.set(type, until);
  }

  private calculateFrequency(type: PatternType, trades: Trade[]): number {
    // Would need to check historical pattern occurrences
    return 0.1; // Placeholder
  }

  private getDefaultSuggestions(type: PatternType): string[] {
    const suggestions: Record<PatternType, string[]> = {
      revenge_trading: [
        'Take a 30-minute break after any loss',
        'Review your trading plan before next entry',
        'Journal your emotions',
      ],
      fomo: [
        'Always set stop loss BEFORE entering',
        'Wait for your setup - don\'t chase',
        'If you missed it, wait for next opportunity',
      ],
      fear_of_loss: [
        'Let trades hit their targets',
        'Use partial exits instead of full closes',
        'Trust your analysis',
      ],
      overconfidence: [
        'Win streaks don\'t change probabilities',
        'Stick to position sizing rules',
        'The market doesn\'t know your streak',
      ],
      tilt: [
        'STOP TRADING IMMEDIATELY',
        'Walk away for at least 1 hour',
        'Do not trade again today',
      ],
      overtrading: [
        'Stop trading for today',
        'Quality over quantity',
        'Review which trades were A+ setups',
      ],
      revenge_sizing: [
        'Reduce size after losses, not increase',
        'Capital preservation is priority',
        'Consider reducing size by 50%',
      ],
      loss_aversion: [
        'Let winners run longer',
        'Cut losers faster',
        'Review risk:reward expectations',
      ],
      position_sizing_error: [
        'Stick to position sizing rules',
        'Size should not be emotional',
        'Calculate proper size before entering',
      ],
      correlation_exposure: [
        'Diversify across uncorrelated instruments',
        'Treat correlated positions as one',
        'Reduce concentrated sector risk',
      ],
      time_decay: [
        'Focus on morning sessions',
        'Reduce or stop afternoon trading',
        'Fatigue affects decision making',
      ],
      monday_syndrome: [
        'Start Mondays with observation only',
        'Use smaller size on Mondays',
        'Be aware of weekend gap risks',
      ],
      friday_carelessness: [
        'Stop trading by 2 PM Friday',
        'Don\'t rush before weekend',
        'Weekend gaps add risk',
      ],
      news_trading: [
        'Wait 15-30 minutes after news',
        'Spreads widen during news',
        'Use wider stops if trading news',
      ],
      strategy_degradation: [
        'Pause the strategy and review',
        'Backtest with recent data',
        'Market conditions may have changed',
      ],
      style_drift: [
        'Stick to your defined style',
        'Test new styles with small size',
        'Style drift often signals emotional trading',
      ],
    };
    
    return suggestions[type] || ['Review your trading plan'];
  }

  /**
   * Clear all cooldowns (for testing or reset)
   */
  clearCooldowns(): void {
    this.cooldowns.clear();
  }
}
```

### 2.2 Insight Generator

```typescript
// lib/intelligence/analytics/insight-generator.ts

import {
  Insight,
  InsightAction,
  DetectedPattern,
  UnifiedContext,
  FeatureMatrix,
  Metrics,
  PatternType,
} from '../core/types';

interface InsightTemplate {
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  category: 'risk' | 'performance' | 'behavior' | 'strategy' | 'opportunity';
  actions: string[];
}

export class InsightGenerator {
  
  /**
   * Generate insight from detected pattern
   */
  fromPattern(pattern: DetectedPattern, context: UnifiedContext): Insight {
    const template = this.getPatternTemplate(pattern.type);
    const historicalCost = this.calculateHistoricalCost(pattern.type, context);
    
    // Interpolate template with pattern data
    const message = this.interpolate(template.message, {
      ...pattern.metadata,
      cost: pattern.cost,
      historicalCost,
      occurrences: pattern.frequency * context.metrics.totalTrades,
    });
    
    return {
      id: crypto.randomUUID(),
      type: 'pattern_alert',
      category: template.category,
      severity: this.adjustSeverity(template.severity, pattern.severity),
      priority: pattern.severity,
      title: template.title,
      message,
      explanation: pattern.suggestions.join(' '),
      confidence: pattern.confidence,
      impactScore: pattern.cost + historicalCost,
      data: pattern.metadata,
      actions: template.actions.map((label, i) => ({
        id: `action-${i}`,
        label,
        description: pattern.suggestions[i] || label,
        type: 'execute' as const,
      })),
      relatedPatterns: [pattern.type],
      relatedTrades: pattern.tradesAffected,
      acknowledged: false,
      createdAt: new Date(),
    };
  }

  /**
   * Generate ML-based insights
   */
  generateML(
    features: FeatureMatrix,
    metrics: Metrics,
    patterns: DetectedPattern[]
  ): Insight[] {
    const insights: Insight[] = [];
    
    // 1. Time Optimization Insight
    const timeInsight = this.generateTimeInsight(features, metrics);
    if (timeInsight) insights.push(timeInsight);
    
    // 2. Strategy Recommendation
    const strategyInsight = this.generateStrategyInsight(features, metrics);
    if (strategyInsight) insights.push(strategyInsight);
    
    // 3. Risk Adjustment Insights
    const riskInsights = this.generateRiskInsights(metrics, patterns);
    insights.push(...riskInsights);
    
    // 4. Symbol Analysis
    const symbolInsight = this.generateSymbolInsight(features);
    if (symbolInsight) insights.push(symbolInsight);
    
    // 5. Consistency Analysis
    const consistencyInsight = this.generateConsistencyInsight(metrics);
    if (consistencyInsight) insights.push(consistencyInsight);
    
    // 6. Edge Analysis
    const edgeInsight = this.generateEdgeInsight(metrics);
    if (edgeInsight) insights.push(edgeInsight);
    
    // Sort by impact and confidence
    return insights.sort((a, b) => 
      (b.confidence * b.impactScore) - (a.confidence * a.impactScore)
    );
  }

  private generateTimeInsight(features: FeatureMatrix, metrics: Metrics): Insight | null {
    const hourlyRates = features.hourlyWinRates;
    if (!hourlyRates || Object.keys(hourlyRates).length < 3) return null;
    
    // Find best and worst hours
    const entries = Object.entries(hourlyRates);
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    
    if (!best || !worst) return null;
    
    const improvement = best[1] - metrics.winRate;
    
    if (improvement < 0.05) return null; // Less than 5% improvement
    
    return {
      id: crypto.randomUUID(),
      type: 'ml_insight',
      category: 'opportunity',
      severity: 'info',
      priority: 6,
      title: '⏰ Time Optimization Opportunity',
      message: `Your win rate during ${best[0]} is ${(best[1] * 100).toFixed(0)}% vs ${(metrics.winRate * 100).toFixed(0)}% overall. Focusing on this time window could improve results by ${(improvement * 100).toFixed(0)}%.`,
      explanation: `Analysis of your trading times shows significant performance variation. Your best time is ${best[0]} (${(best[1] * 100).toFixed(0)}% win rate) while ${worst[0]} is your weakest (${(worst[1] * 100).toFixed(0)}% win rate).`,
      confidence: Math.min(0.7 + Object.keys(hourlyRates).length * 0.02, 0.9),
      impactScore: improvement * metrics.totalPnL,
      data: { bestTime: best[0], worstTime: worst[0], bestWinRate: best[1], worstWinRate: worst[1] },
      actions: [
        { id: '1', label: 'Focus on best hours', description: `Prioritize trading during ${best[0]}`, type: 'execute' },
        { id: '2', label: 'Reduce worst hours', description: `Consider skipping or reducing size during ${worst[0]}`, type: 'execute' },
      ],
      acknowledged: false,
      createdAt: new Date(),
    };
  }

  private generateStrategyInsight(features: FeatureMatrix, metrics: Metrics): Insight | null {
    const strategies = Object.entries(features.strategyPerformance);
    if (strategies.length < 2) return null;
    
    const sorted = strategies.sort((a, b) => b[1].avgPnL - a[1].avgPnL);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    
    if (best[1].avgPnL <= 0) return null;
    
    const spread = best[1].avgPnL - worst[1].avgPnL;
    
    return {
      id: crypto.randomUUID(),
      type: 'ml_insight',
      category: 'strategy',
      severity: worst[1].avgPnL < 0 ? 'warning' : 'info',
      priority: 7,
      title: '🎯 Strategy Performance Analysis',
      message: `"${best[0]}" is your best strategy (avg ₹${best[1].avgPnL.toFixed(0)}, ${(best[1].winRate * 100).toFixed(0)}% win rate) while "${worst[0]}" ${worst[1].avgPnL < 0 ? 'is losing money' : 'underperforms'} (avg ₹${worst[1].avgPnL.toFixed(0)}).`,
      explanation: `Based on ${best[1].tradeCount} trades with "${best[0]}" and ${worst[1].tradeCount} trades with "${worst[0]}", there's a clear performance difference of ₹${spread.toFixed(0)} per trade on average.`,
      confidence: Math.min(0.6 + (best[1].tradeCount / 100) * 0.2, 0.9),
      impactScore: spread * 10,
      data: { 
        bestStrategy: best[0], 
        worstStrategy: worst[0],
        bestStats: best[1],
        worstStats: worst[1],
      },
      actions: [
        { id: '1', label: 'Double down on winner', description: `Allocate more capital to "${best[0]}"`, type: 'execute' },
        { id: '2', label: 'Review underperformer', description: `Analyze why "${worst[0]}" is underperforming`, type: 'navigate' },
      ],
      acknowledged: false,
      createdAt: new Date(),
    };
  }

  private generateRiskInsights(metrics: Metrics, patterns: DetectedPattern[]): Insight[] {
    const insights: Insight[] = [];
    
    // Profit Factor Warning
    if (metrics.profitFactor < 1.2) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'ml_insight',
        category: 'risk',
        severity: metrics.profitFactor < 1 ? 'critical' : 'warning',
        priority: 9,
        title: '⚠️ Profit Factor Alert',
        message: `Your profit factor is ${metrics.profitFactor.toFixed(2)} ${metrics.profitFactor < 1 ? '(losing money)' : '(barely profitable)'}. Target is above 1.5.`,
        explanation: 'Profit factor measures gross profit divided by gross loss. Below 1 means you\'re losing money overall. Above 1.5 indicates a healthy edge.',
        confidence: 0.95,
        impactScore: Math.abs(metrics.grossLoss) * 0.3,
        data: { profitFactor: metrics.profitFactor, grossProfit: metrics.grossProfit, grossLoss: metrics.grossLoss },
        actions: [
          { id: '1', label: 'Reduce average loss', description: 'Tighten stop losses', type: 'execute' },
          { id: '2', label: 'Increase average win', description: 'Let winners run longer', type: 'execute' },
        ],
        acknowledged: false,
        createdAt: new Date(),
      });
    }
    
    // Rule Following Warning
    if (metrics.ruleFollowedRate < 0.8) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'ml_insight',
        category: 'behavior',
        severity: 'warning',
        priority: 8,
        title: '📋 Discipline Alert',
        message: `Your rule-following rate is ${(metrics.ruleFollowedRate * 100).toFixed(0)}%. Breaking rules correlates with losses.`,
        explanation: 'Traders who follow their rules consistently tend to be more profitable. Rule violations often happen during emotional states.',
        confidence: 0.85,
        impactScore: metrics.totalTrades * 100,
        data: { ruleFollowedRate: metrics.ruleFollowedRate },
        actions: [
          { id: '1', label: 'Review rule violations', description: 'Identify which rules you\'re breaking', type: 'navigate' },
          { id: '2', label: 'Simplify rules', description: 'Make rules easier to follow', type: 'execute' },
        ],
        acknowledged: false,
        createdAt: new Date(),
      });
    }
    
    // Drawdown Warning
    if (metrics.maxDrawdownPercent > 0.15) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'ml_insight',
        category: 'risk',
        severity: metrics.maxDrawdownPercent > 0.25 ? 'critical' : 'warning',
        priority: 9,
        title: '📉 Drawdown Alert',
        message: `Your max drawdown is ${(metrics.maxDrawdownPercent * 100).toFixed(1)}%. This is ${metrics.maxDrawdownPercent > 0.2 ? 'dangerously high' : 'above recommended levels'}.`,
        explanation: 'Professional traders typically keep max drawdown under 15-20%. Large drawdowns require exponentially larger gains to recover.',
        confidence: 0.95,
        impactScore: metrics.maxDrawdown,
        data: { maxDrawdown: metrics.maxDrawdown, maxDrawdownPercent: metrics.maxDrawdownPercent },
        actions: [
          { id: '1', label: 'Reduce position size', description: 'Cut size by 50% until drawdown recovers', type: 'execute' },
          { id: '2', label: 'Set daily loss limit', description: 'Stop trading after X% loss per day', type: 'execute' },
        ],
        acknowledged: false,
        createdAt: new Date(),
      });
    }
    
    return insights;
  }

  private generateSymbolInsight(features: FeatureMatrix): Insight | null {
    const symbols = Object.entries(features.symbolPerformance);
    if (symbols.length < 3) return null;
    
    const sorted = symbols.sort((a, b) => b[1].avgPnL - a[1].avgPnL);
    const best = sorted.slice(0, 3);
    const worst = sorted.slice(-3).filter(s => s[1].avgPnL < 0);
    
    if (worst.length === 0) return null;
    
    return {
      id: crypto.randomUUID(),
      type: 'ml_insight',
      category: 'strategy',
      severity: 'info',
      priority: 5,
      title: '📊 Symbol Performance Analysis',
      message: `Best symbols: ${best.map(b => b[0]).join(', ')}. Consider avoiding: ${worst.map(w => w[0]).join(', ')}.`,
      explanation: `Your top performers are ${best.map(b => `${b[0]} (₹${b[1].avgPnL.toFixed(0)}/trade)`).join(', ')}. Meanwhile, ${worst.map(w => w[0]).join(', ')} are costing you money.`,
      confidence: 0.7,
      impactScore: worst.reduce((sum, w) => sum + Math.abs(w[1].totalPnL), 0),
      data: { bestSymbols: best, worstSymbols: worst },
      actions: [
        { id: '1', label: 'Focus on winners', description: 'Trade your best symbols more', type: 'execute' },
        { id: '2', label: 'Review losers', description: 'Understand why certain symbols don\'t work for you', type: 'navigate' },
      ],
      acknowledged: false,
      createdAt: new Date(),
    };
  }

  private generateConsistencyInsight(metrics: Metrics): Insight | null {
    if (metrics.consistencyScore >= 70) return null;
    
    return {
      id: crypto.randomUUID(),
      type: 'ml_insight',
      category: 'performance',
      severity: metrics.consistencyScore < 50 ? 'warning' : 'info',
      priority: 6,
      title: '📈 Consistency Analysis',
      message: `Your consistency score is ${metrics.consistencyScore.toFixed(0)}/100. ${metrics.consistencyScore < 50 ? 'High variance is hurting your results.' : 'Room for improvement.'}`,
      explanation: 'Consistency measures how predictable your results are. High consistency means more reliable income from trading.',
      confidence: 0.8,
      impactScore: metrics.dailyPnLStdDev * 20,
      data: { consistencyScore: metrics.consistencyScore, dailyStdDev: metrics.dailyPnLStdDev },
      actions: [
        { id: '1', label: 'Standardize position sizing', description: 'Use consistent size per trade', type: 'execute' },
        { id: '2', label: 'Reduce trade frequency', description: 'Focus on highest conviction setups only', type: 'execute' },
      ],
      acknowledged: false,
      createdAt: new Date(),
    };
  }

  private generateEdgeInsight(metrics: Metrics): Insight | null {
    if (metrics.expectancy <= 0) {
      return {
        id: crypto.randomUUID(),
        type: 'ml_insight',
        category: 'risk',
        severity: 'critical',
        priority: 10,
        title: '🚨 Negative Edge Detected',
        message: `Your expectancy is ₹${metrics.expectancy.toFixed(0)} per trade. You're expected to lose money on average.`,
        explanation: 'Expectancy = (Win% × Avg Win) - (Loss% × Avg Loss). Negative expectancy means the math is against you.',
        confidence: 0.95,
        impactScore: Math.abs(metrics.expectancy) * metrics.totalTrades,
        data: { expectancy: metrics.expectancy, winRate: metrics.winRate, avgWin: metrics.avgWin, avgLoss: metrics.avgLoss },
        actions: [
          { id: '1', label: 'Stop trading live', description: 'Switch to paper trading until you fix this', type: 'execute' },
          { id: '2', label: 'Analyze losing trades', description: 'Find what\'s causing the negative edge', type: 'navigate' },
        ],
        acknowledged: false,
        createdAt: new Date(),
      };
    }
    
    return null;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private getPatternTemplate(type: PatternType): InsightTemplate {
    const templates: Record<PatternType, InsightTemplate> = {
      revenge_trading: {
        title: '😤 Revenge Trading Detected',
        message: 'You entered a trade {{timeSinceLossMinutes}} minutes after a ₹{{previousLoss}} loss.',
        severity: 'warning',
        category: 'behavior',
        actions: ['Take a break', 'Review plan', 'Journal emotions'],
      },
      fomo: {
        title: '😰 FOMO Trade Detected',
        message: 'You traded during {{volatilityWindow}} without proper risk management.',
        severity: 'warning',
        category: 'behavior',
        actions: ['Set stop loss', 'Wait for setup', 'Don\'t chase'],
      },
      overtrading: {
        title: '📊 Overtrading Alert',
        message: 'You\'ve made {{totalTradesToday}} trades today ({{excessCount}} over limit).',
        severity: 'warning',
        category: 'behavior',
        actions: ['Stop trading today', 'Review A+ setups', 'Reduce daily limit'],
      },
      tilt: {
        title: '🚨 TILT - Emotional Breakdown',
        message: '{{consecutiveLosses}} rapid losses detected. Total loss: ₹{{totalLoss}}.',
        severity: 'critical',
        category: 'behavior',
        actions: ['STOP NOW', 'Walk away', 'No more trades today'],
      },
      loss_aversion: {
        title: '😟 Loss Aversion Pattern',
        message: 'Avg loss (₹{{avgLoss}}) is {{lossToWinRatio}}x your avg win (₹{{avgWin}}).',
        severity: 'warning',
        category: 'behavior',
        actions: ['Let winners run', 'Cut losers faster', 'Review R:R'],
      },
      // Add remaining patterns...
      fear_of_loss: {
        title: '😨 Fear of Loss',
        message: 'You\'re cutting winners early. {{prematureRate}}% of wins closed before target.',
        severity: 'warning',
        category: 'behavior',
        actions: ['Trust your targets', 'Use partial exits', 'Review trade plans'],
      },
      overconfidence: {
        title: '🎰 Overconfidence Detected',
        message: 'After {{winStreak}} wins, you increased size by {{sizeIncreasePercent}}%.',
        severity: 'warning',
        category: 'behavior',
        actions: ['Stick to sizing rules', 'Streaks don\'t change odds', 'Stay humble'],
      },
      revenge_sizing: {
        title: '💢 Revenge Sizing',
        message: 'Position size increased {{sizeIncreasePercent}}% after consecutive losses.',
        severity: 'critical',
        category: 'risk',
        actions: ['Reduce size instead', 'Preserve capital', 'Take a break'],
      },
      position_sizing_error: {
        title: '⚖️ Position Sizing Error',
        message: 'Trade size deviates {{deviationMultiple}}x from your average.',
        severity: 'warning',
        category: 'risk',
        actions: ['Follow sizing rules', 'Calculate before entering', 'Size isn\'t emotional'],
      },
      correlation_exposure: {
        title: '🔗 Correlation Risk',
        message: '{{tradeCount}} positions in {{correlationGroup}} sector.',
        severity: 'warning',
        category: 'risk',
        actions: ['Diversify', 'Treat as one position', 'Reduce concentration'],
      },
      time_decay: {
        title: '⏰ Time Decay Pattern',
        message: 'Afternoon win rate ({{afternoonWinRate}}%) vs morning ({{morningWinRate}}%).',
        severity: 'info',
        category: 'performance',
        actions: ['Focus on mornings', 'Reduce afternoon trading', 'Monitor fatigue'],
      },
      monday_syndrome: {
        title: '📅 Monday Syndrome',
        message: 'Monday win rate: {{mondayWinRate}}% vs other days: {{otherDaysWinRate}}%.',
        severity: 'info',
        category: 'performance',
        actions: ['Start Mondays slowly', 'Observe first', 'Smaller size'],
      },
      friday_carelessness: {
        title: '🏃 Friday Rush',
        message: 'Friday afternoon win rate significantly lower than average.',
        severity: 'info',
        category: 'performance',
        actions: ['Stop by 2 PM Friday', 'Don\'t rush', 'Weekend gap risk'],
      },
      news_trading: {
        title: '📰 News Trading Detected',
        message: 'Trade during {{newsWindow}} high-impact window.',
        severity: 'warning',
        category: 'risk',
        actions: ['Wait after news', 'Wider stops', 'Smaller size'],
      },
      strategy_degradation: {
        title: '📉 Strategy Degradation',
        message: '"{{strategy}}" win rate dropped from {{olderWinRate}}% to {{newerWinRate}}%.',
        severity: 'warning',
        category: 'strategy',
        actions: ['Pause strategy', 'Review and backtest', 'Adjust or retire'],
      },
      style_drift: {
        title: '🎭 Style Drift',
        message: 'Trading style shifted from {{preferredStyles}} to {{detectedStyle}}.',
        severity: 'info',
        category: 'behavior',
        actions: ['Return to your style', 'Test new styles separately', 'Stay disciplined'],
      },
    };
    
    return templates[type] || {
      title: 'Pattern Detected',
      message: 'A trading pattern was detected.',
      severity: 'info',
      category: 'behavior',
      actions: ['Review trade'],
    };
  }

  private interpolate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key]?.toString() || match;
    });
  }

  private calculateHistoricalCost(type: PatternType, context: UnifiedContext): number {
    const historical = context.patternHistory.filter(p => p.type === type);
    return historical.reduce((sum, p) => sum + p.cost, 0);
  }

  private adjustSeverity(
    base: 'critical' | 'warning' | 'info' | 'success',
    severity: number
  ): 'critical' | 'warning' | 'info' | 'success' {
    if (severity >= 9) return 'critical';
    if (severity >= 7) return 'warning';
    if (severity >= 4) return 'info';
    return base;
  }
}
```

---

This completes Part 2 with full pattern detection methods and the insight generator.
# TAI ULTIMATE PROMPT - PART 3: AI COACH, GAMIFICATION & UI

---

## 📦 PHASE 3: ENHANCED AI COACH {#phase-3}

### 3.1 AI Coach with Personality System

```typescript
// lib/intelligence/coach/ai-coach.ts

import OpenAI from 'openai';
import {
  CoachPersonality,
  ChatMessage,
  EmotionalState,
  UnifiedContext,
  ContextSnapshot,
} from '../core/types';

interface CoachResponse {
  message: string;
  suggestedActions?: string[];
  emotionalState?: EmotionalState;
  followUpQuestions?: string[];
}

const PERSONALITIES: Record<string, CoachPersonality> = {
  balanced: {
    id: 'balanced',
    name: 'Alex the Balanced Coach',
    style: 'balanced',
    strictness: 5,
    encouragement: 6,
    technicalDepth: 6,
    humorLevel: 4,
    empathy: 7,
    directness: 6,
    responseLength: 'moderate',
    usesEmojis: true,
    usesMetaphors: true,
    focusAreas: ['risk', 'psychology', 'strategy'],
    systemPrompt: `You are Alex, a balanced and experienced trading coach. You combine encouragement with honest feedback. You use data to support your points but also understand the emotional side of trading. You're professional but approachable.`,
  },
  drill_sergeant: {
    id: 'drill_sergeant',
    name: 'Sergeant Steel',
    style: 'drill_sergeant',
    strictness: 9,
    encouragement: 3,
    technicalDepth: 5,
    humorLevel: 1,
    empathy: 3,
    directness: 10,
    responseLength: 'brief',
    usesEmojis: false,
    usesMetaphors: false,
    focusAreas: ['discipline', 'risk', 'execution'],
    systemPrompt: `You are Sergeant Steel, a no-nonsense trading coach who demands discipline. You don't coddle traders. You call out mistakes directly. You believe trading success comes from strict rule following. You use short, direct sentences.`,
  },
  mentor: {
    id: 'mentor',
    name: 'Dr. Sarah Chen',
    style: 'mentor',
    strictness: 5,
    encouragement: 8,
    technicalDepth: 9,
    humorLevel: 3,
    empathy: 9,
    directness: 5,
    responseLength: 'detailed',
    usesEmojis: false,
    usesMetaphors: true,
    focusAreas: ['psychology', 'strategy', 'risk'],
    systemPrompt: `You are Dr. Sarah Chen, a trading psychologist and mentor with 20 years of experience. You focus on the psychological aspects of trading. You explain concepts in depth and use analogies from other fields. You're patient and understanding.`,
  },
  aggressive: {
    id: 'aggressive',
    name: 'Max Profit',
    style: 'aggressive',
    strictness: 4,
    encouragement: 7,
    technicalDepth: 7,
    humorLevel: 6,
    empathy: 4,
    directness: 8,
    responseLength: 'moderate',
    usesEmojis: true,
    usesMetaphors: true,
    focusAreas: ['strategy', 'execution', 'risk'],
    systemPrompt: `You are Max, an aggressive trading coach who pushes for maximum performance. You're energetic and motivating. You believe in taking calculated risks. You challenge traders to step up their game. You're direct but supportive.`,
  },
  conservative: {
    id: 'conservative',
    name: 'Warren the Wise',
    style: 'conservative',
    strictness: 7,
    encouragement: 6,
    technicalDepth: 8,
    humorLevel: 3,
    empathy: 6,
    directness: 5,
    responseLength: 'detailed',
    usesEmojis: false,
    usesMetaphors: true,
    focusAreas: ['risk', 'psychology', 'discipline'],
    systemPrompt: `You are Warren, a wise and conservative trading coach. You prioritize capital preservation above all. You believe slow and steady wins the race. You often quote trading legends and use historical examples. You're cautious about overtrading.`,
  },
};

export class AICoach {
  private openai: OpenAI | null = null;
  private currentPersonality: CoachPersonality;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    this.currentPersonality = PERSONALITIES.balanced;
  }

  getPersonality(id: string): CoachPersonality {
    return PERSONALITIES[id] || PERSONALITIES.balanced;
  }

  setPersonality(id: string): void {
    this.currentPersonality = this.getPersonality(id);
  }

  async respond(
    message: string,
    context: UnifiedContext,
    history: ChatMessage[]
  ): Promise<CoachResponse> {
    if (this.openai) {
      return this.respondWithGPT(message, context, history);
    }
    return this.respondWithRules(message, context);
  }

  private async respondWithGPT(
    message: string,
    context: UnifiedContext,
    history: ChatMessage[]
  ): Promise<CoachResponse> {
    const systemPrompt = this.buildSystemPrompt(context);
    
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    try {
      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 800,
      });

      const content = response.choices[0].message.content || '';
      
      return {
        message: content,
        suggestedActions: this.extractActions(content),
        followUpQuestions: this.generateFollowUpQuestions(message, content),
      };
    } catch (error) {
      console.error('[AICoach] GPT error:', error);
      return this.respondWithRules(message, context);
    }
  }

  private buildSystemPrompt(context: UnifiedContext): string {
    const p = this.currentPersonality;
    
    return `${p.systemPrompt}

## YOUR PERSONALITY TRAITS
- Strictness: ${p.strictness}/10
- Encouragement: ${p.encouragement}/10
- Technical Depth: ${p.technicalDepth}/10
- Directness: ${p.directness}/10
- Empathy: ${p.empathy}/10
${p.usesEmojis ? '- You use emojis occasionally' : '- You do NOT use emojis'}
${p.usesMetaphors ? '- You use metaphors and analogies' : '- You stick to direct explanations'}
- Response length: ${p.responseLength}
- Focus areas: ${p.focusAreas.join(', ')}

## TRADER'S CURRENT SITUATION

### Performance Snapshot
- Total Trades: ${context.metrics.totalTrades}
- Win Rate: ${(context.metrics.winRate * 100).toFixed(1)}%
- Profit Factor: ${context.metrics.profitFactor.toFixed(2)}
- Total P&L: ₹${context.metrics.totalPnL.toFixed(0)}
- Current Streak: ${context.metrics.currentStreak} ${context.metrics.currentStreak >= 0 ? 'wins' : 'losses'}
- Max Drawdown: ₹${context.metrics.maxDrawdown.toFixed(0)} (${(context.metrics.maxDrawdownPercent * 100).toFixed(1)}%)
- Sharpe Ratio: ${context.metrics.sharpeRatio.toFixed(2)}
- Consistency Score: ${context.metrics.consistencyScore.toFixed(0)}/100

### Today's Trading
- Trades Today: ${context.todayTrades.length}
- Today's P&L: ₹${context.todayTrades.reduce((s, t) => s + t.pnl, 0).toFixed(0)}
- Today's Win Rate: ${context.todayTrades.length > 0 
  ? ((context.todayTrades.filter(t => t.pnl > 0).length / context.todayTrades.length) * 100).toFixed(0) 
  : 0}%

### Active Behavioral Patterns (ISSUES)
${context.activePatterns.length > 0 
  ? context.activePatterns.map(p => 
      `- ${p.metadata.patternName} (Severity: ${p.severity}/10, Cost: ₹${p.cost.toFixed(0)})`
    ).join('\n')
  : 'No active patterns detected - good job!'}

### Pattern Interactions (DANGER ZONES)
${context.patternInteractions.length > 0
  ? context.patternInteractions.map(i =>
      `- ⚠️ ${i.description} (Risk multiplier: ${i.risk_multiplier}x)`
    ).join('\n')
  : 'No dangerous pattern combinations'}

### Emotional State
- Current: ${context.emotionalState.primary} (intensity: ${(context.emotionalState.intensity * 100).toFixed(0)}%)
- Triggers: ${context.emotionalState.triggers.join(', ') || 'None detected'}

### Current Focus Area
${context.currentPlan?.focusArea || 'General improvement'}

### Risk Score
Portfolio Risk: ${context.currentRiskScore}/100 ${context.currentRiskScore > 70 ? '🚨 HIGH RISK' : context.currentRiskScore > 40 ? '⚠️ MODERATE' : '✅ LOW'}

## COACHING RULES

1. Always reference the trader's actual data when giving advice
2. If they ask about something not in the context, say you don't have that data
3. Be ${p.directness > 7 ? 'very direct and blunt' : p.directness > 4 ? 'balanced in directness' : 'diplomatic and gentle'}
4. ${p.strictness > 7 ? 'Call out mistakes firmly' : 'Address mistakes constructively'}
5. ${p.encouragement > 6 ? 'Celebrate wins and progress' : 'Focus on improvements needed'}
6. Keep responses ${p.responseLength === 'brief' ? 'under 100 words' : p.responseLength === 'moderate' ? '100-200 words' : '200-400 words'}
7. End with ONE actionable step they can take
8. Use ₹ for currency (Indian Rupees)
9. ${p.empathy > 6 ? 'Acknowledge emotions before giving advice' : 'Focus on facts and actions'}

## IMPORTANT
- Never make up statistics or data
- If emotional state is frustrated/anxious, prioritize emotional support first
- If risk score > 70, strongly recommend reducing exposure
- If pattern interactions exist, address them as urgent`;
  }

  private respondWithRules(message: string, context: UnifiedContext): CoachResponse {
    const lowerMessage = message.toLowerCase();
    
    // Emotional support first if needed
    if (context.emotionalState.intensity > 0.7 && 
        ['frustrated', 'anxious', 'fearful'].includes(context.emotionalState.primary)) {
      return this.emotionalSupportResponse(context);
    }
    
    // Pattern-based responses
    if (lowerMessage.includes('pattern') || lowerMessage.includes('issue') || lowerMessage.includes('problem')) {
      return this.patternAnalysisResponse(context);
    }
    
    if (lowerMessage.includes('win rate') || lowerMessage.includes('winning')) {
      return this.winRateResponse(context);
    }
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('danger')) {
      return this.riskAnalysisResponse(context);
    }
    
    if (lowerMessage.includes('improve') || lowerMessage.includes('better') || lowerMessage.includes('help')) {
      return this.improvementResponse(context);
    }
    
    if (lowerMessage.includes('today') || lowerMessage.includes('performance')) {
      return this.todayAnalysisResponse(context);
    }
    
    if (lowerMessage.includes('stop') || lowerMessage.includes('break')) {
      return this.takeBreakResponse(context);
    }
    
    // Default response
    return this.defaultResponse(context);
  }

  private emotionalSupportResponse(context: UnifiedContext): CoachResponse {
    const state = context.emotionalState;
    
    let message = '';
    
    switch (state.primary) {
      case 'frustrated':
        message = `I can see you're frustrated right now. ${context.metrics.currentStreak < -2 ? `A ${Math.abs(context.metrics.currentStreak)}-trade losing streak is tough.` : ''} 

Here's the thing: frustration leads to poor decisions. The market will be there tomorrow.

**Right now, I need you to:**
1. Close all your charts
2. Take a 30-minute break
3. Come back ONLY to review, not to trade

Remember: preserving capital during tough times is winning. Your job isn't to recover losses today—it's to live to trade another day.`;
        break;
        
      case 'anxious':
        message = `I sense some anxiety in your trading today. ${context.todayTrades.length > 5 ? 'Taking many trades can be a sign of trying to force outcomes.' : ''}

Anxiety often comes from one of two places:
1. **Position too large** - If a trade's outcome is affecting your emotions, the size is wrong
2. **No clear plan** - Uncertainty breeds anxiety

**My recommendation:**
- If you're in a trade: Is your stop loss set? Is the size appropriate?
- If you're looking to trade: Write down your plan first. If you can't articulate it, skip it.

What's making you anxious specifically?`;
        break;
        
      default:
        message = `How are you feeling about your trading right now? I'm here to help.`;
    }
    
    return {
      message,
      suggestedActions: ['take_break', 'review_plan', 'reduce_size'],
      followUpQuestions: [
        'What triggered this feeling?',
        'How large are your current positions?',
        'Do you have a clear plan for your next trade?',
      ],
    };
  }

  private patternAnalysisResponse(context: UnifiedContext): CoachResponse {
    const patterns = context.activePatterns;
    
    if (patterns.length === 0) {
      return {
        message: `Good news! I'm not detecting any significant behavioral patterns in your recent trading. 

Your discipline metrics:
- Rule Following Rate: ${(context.metrics.ruleFollowedRate * 100).toFixed(0)}%
- Consistency Score: ${context.metrics.consistencyScore.toFixed(0)}/100

Keep up the disciplined approach! The best traders are the most consistent.`,
        followUpQuestions: ['What helped you stay disciplined?', 'Any trades you're proud of?'],
      };
    }
    
    // Sort by severity
    const sortedPatterns = [...patterns].sort((a, b) => b.severity - a.severity);
    const topPattern = sortedPatterns[0];
    
    let message = `I've identified ${patterns.length} behavioral pattern${patterns.length > 1 ? 's' : ''} affecting your trading:\n\n`;
    
    for (const pattern of sortedPatterns.slice(0, 3)) {
      message += `**${pattern.metadata.patternName}** (Severity: ${pattern.severity}/10)\n`;
      message += `- Cost: ₹${pattern.cost.toFixed(0)}\n`;
      message += `- ${pattern.suggestions[0]}\n\n`;
    }
    
    // Check for interactions
    if (context.patternInteractions.length > 0) {
      message += `\n⚠️ **DANGER**: ${context.patternInteractions[0].description}\n`;
      message += `These patterns together multiply your risk by ${context.patternInteractions[0].risk_multiplier}x.\n`;
    }
    
    message += `\n**Priority Action:** ${topPattern.suggestions[0]}`;
    
    return {
      message,
      suggestedActions: topPattern.suggestions.slice(0, 3),
      followUpQuestions: [
        `Can you tell me about a recent ${topPattern.type.replace('_', ' ')} trade?`,
        'What was going through your mind when you took that trade?',
      ],
    };
  }

  private winRateResponse(context: UnifiedContext): CoachResponse {
    const winRate = context.metrics.winRate * 100;
    const profitFactor = context.metrics.profitFactor;
    
    let message = '';
    
    if (winRate >= 60 && profitFactor >= 1.5) {
      message = `Your win rate is strong at ${winRate.toFixed(1)}% with a profit factor of ${profitFactor.toFixed(2)}. Excellent work!

Key stats:
- Average Win: ₹${context.metrics.avgWin.toFixed(0)}
- Average Loss: ₹${Math.abs(context.metrics.avgLoss).toFixed(0)}
- Risk/Reward: ${(context.metrics.avgWin / Math.abs(context.metrics.avgLoss)).toFixed(2)}:1

**Focus on:** Maintaining consistency. Don't let success lead to overconfidence.`;
    } else if (winRate >= 50) {
      message = `Your win rate is ${winRate.toFixed(1)}% - decent, but there's room for improvement.

Analysis:
- Profit Factor: ${profitFactor.toFixed(2)} ${profitFactor < 1.2 ? '(needs improvement)' : ''}
- Average Win: ₹${context.metrics.avgWin.toFixed(0)}
- Average Loss: ₹${Math.abs(context.metrics.avgLoss).toFixed(0)}

${profitFactor < 1.2 
  ? 'Your losses are eating into your wins. Focus on either increasing win rate OR improving risk/reward.'
  : 'Your risk/reward is helping compensate. Keep focusing on quality setups.'}

**Action:** Review your last 10 losing trades. What do they have in common?`;
    } else {
      message = `Your win rate of ${winRate.toFixed(1)}% needs attention. Let's diagnose the issue:

Current stats:
- Profit Factor: ${profitFactor.toFixed(2)}
- Win Streak Best: ${context.metrics.longestWinStreak}
- Loss Streak Worst: ${context.metrics.longestLossStreak}

Low win rate can come from:
1. **Taking trades that don't meet your criteria** - Are you forcing trades?
2. **Poor entry timing** - Are you chasing moves?
3. **Stops too tight** - Are you getting stopped out before the move happens?

**Immediate action:** Take only A+ setups for the next week. If a trade doesn't meet ALL your criteria, skip it.`;
    }
    
    return {
      message,
      suggestedActions: ['review_losing_trades', 'tighten_criteria', 'reduce_frequency'],
      followUpQuestions: [
        'What does your ideal setup look like?',
        'How do you decide when to enter a trade?',
      ],
    };
  }

  private riskAnalysisResponse(context: UnifiedContext): CoachResponse {
    const riskScore = context.currentRiskScore;
    
    let message = `**Current Risk Assessment: ${riskScore}/100** `;
    
    if (riskScore > 70) {
      message += `🚨 HIGH RISK\n\n`;
      message += `You need to reduce exposure immediately. Here's why:\n`;
      message += `- Today's P&L: ₹${context.todayTrades.reduce((s, t) => s + t.pnl, 0).toFixed(0)}\n`;
      message += `- Trades Today: ${context.todayTrades.length}\n`;
      message += `- Active Patterns: ${context.activePatterns.length}\n`;
      message += `- Current Streak: ${context.metrics.currentStreak}\n\n`;
      message += `**RECOMMENDED ACTIONS:**\n`;
      message += `1. Close any marginal positions\n`;
      message += `2. No new trades today\n`;
      message += `3. Review what led to this situation`;
    } else if (riskScore > 40) {
      message += `⚠️ MODERATE RISK\n\n`;
      message += `You're in a manageable zone, but stay alert.\n\n`;
      message += `Risk factors:\n`;
      message += `- Max Drawdown: ${(context.metrics.maxDrawdownPercent * 100).toFixed(1)}%\n`;
      message += `- Portfolio Heat: ${(context.portfolioHeat * 100).toFixed(0)}%\n\n`;
      message += `**Recommendation:** Continue trading but be selective. Only take high-conviction setups.`;
    } else {
      message += `✅ LOW RISK\n\n`;
      message += `Your risk management is solid.\n\n`;
      message += `Key metrics:\n`;
      message += `- Rule Following: ${(context.metrics.ruleFollowedRate * 100).toFixed(0)}%\n`;
      message += `- Position Sizing: Consistent\n`;
      message += `- Drawdown: Under control\n\n`;
      message += `Keep doing what you're doing!`;
    }
    
    return {
      message,
      suggestedActions: riskScore > 70 
        ? ['close_positions', 'stop_trading', 'review']
        : ['continue_selective', 'monitor'],
    };
  }

  private improvementResponse(context: UnifiedContext): CoachResponse {
    // Identify the biggest opportunity for improvement
    const opportunities: { area: string; priority: number; suggestion: string }[] = [];
    
    if (context.metrics.winRate < 0.5) {
      opportunities.push({
        area: 'Win Rate',
        priority: 9,
        suggestion: 'Focus on quality over quantity. Only take A+ setups.',
      });
    }
    
    if (context.metrics.profitFactor < 1.2) {
      opportunities.push({
        area: 'Profit Factor',
        priority: 8,
        suggestion: 'Your losses are too large relative to wins. Tighten stops or improve entries.',
      });
    }
    
    if (context.activePatterns.length > 2) {
      opportunities.push({
        area: 'Behavioral Patterns',
        priority: 10,
        suggestion: 'Address your psychological patterns before focusing on strategy.',
      });
    }
    
    if (context.metrics.ruleFollowedRate < 0.8) {
      opportunities.push({
        area: 'Discipline',
        priority: 9,
        suggestion: 'You\'re breaking your rules too often. Rules exist for a reason.',
      });
    }
    
    // Sort by priority
    opportunities.sort((a, b) => b.priority - a.priority);
    
    let message = `Based on your data, here are your top improvement opportunities:\n\n`;
    
    for (let i = 0; i < Math.min(3, opportunities.length); i++) {
      const opp = opportunities[i];
      message += `**${i + 1}. ${opp.area}**\n`;
      message += `${opp.suggestion}\n\n`;
    }
    
    if (opportunities.length === 0) {
      message = `Your trading is looking solid! Here are some advanced optimizations to consider:\n\n`;
      message += `1. **Time Optimization** - Are you trading during your best hours?\n`;
      message += `2. **Strategy Specialization** - Double down on what works best\n`;
      message += `3. **Risk/Reward** - Can you improve your average R:R?`;
    }
    
    message += `\n**This week's focus:** ${opportunities[0]?.suggestion || 'Maintain consistency'}`;
    
    return {
      message,
      suggestedActions: opportunities.slice(0, 3).map(o => o.area.toLowerCase().replace(' ', '_')),
    };
  }

  private todayAnalysisResponse(context: UnifiedContext): CoachResponse {
    const today = context.todayTrades;
    const todayPnL = today.reduce((s, t) => s + t.pnl, 0);
    const todayWinRate = today.length > 0 
      ? today.filter(t => t.pnl > 0).length / today.length 
      : 0;
    
    let message = `**Today's Summary:**\n\n`;
    message += `- Trades: ${today.length}\n`;
    message += `- P&L: ₹${todayPnL.toFixed(0)} ${todayPnL > 0 ? '🟢' : todayPnL < 0 ? '🔴' : '⚪'}\n`;
    message += `- Win Rate: ${(todayWinRate * 100).toFixed(0)}%\n\n`;
    
    if (today.length === 0) {
      message += `No trades yet today. Remember: not trading is also a decision. Wait for quality setups.`;
    } else if (todayPnL > 0) {
      message += `Good day so far! ${todayWinRate > 0.6 ? 'Your selectivity is paying off.' : 'Your risk management is working.'}\n\n`;
      message += `**Reminder:** Don't give back profits. Consider stopping if you hit your daily target.`;
    } else {
      const lossTrades = today.filter(t => t.pnl < 0);
      message += `Challenging day. Let's learn from it.\n\n`;
      message += `Analysis of losses:\n`;
      message += `- Losing trades: ${lossTrades.length}\n`;
      message += `- Total loss: ₹${Math.abs(lossTrades.reduce((s, t) => s + t.pnl, 0)).toFixed(0)}\n\n`;
      
      if (today.length > 5) {
        message += `⚠️ You've taken ${today.length} trades. Consider if you're overtrading.`;
      }
    }
    
    return {
      message,
      suggestedActions: todayPnL < 0 && today.length > 5 
        ? ['stop_trading', 'review_trades']
        : ['continue_selective'],
    };
  }

  private takeBreakResponse(context: UnifiedContext): CoachResponse {
    const shouldBreak = 
      context.currentRiskScore > 60 ||
      context.emotionalState.intensity > 0.7 ||
      context.metrics.currentStreak < -3 ||
      context.todayTrades.length > 7;
    
    if (shouldBreak) {
      return {
        message: `Yes, you should definitely take a break right now.

**Why:**
${context.currentRiskScore > 60 ? '- Your risk score is elevated\n' : ''}${context.emotionalState.intensity > 0.7 ? `- You're feeling ${context.emotionalState.primary}\n` : ''}${context.metrics.currentStreak < -3 ? `- You're on a ${Math.abs(context.metrics.currentStreak)}-trade losing streak\n` : ''}${context.todayTrades.length > 7 ? '- You\'ve taken many trades today\n' : ''}

**What to do:**
1. Close your charts completely
2. Step away from the screen
3. Do something physical (walk, exercise, stretch)
4. Come back in at least 30 minutes
5. When you return, only review—don't trade

The market will be there when you get back. Your capital might not be if you don't take this break.`,
        suggestedActions: ['close_charts', 'take_walk', 'journal'],
      };
    }
    
    return {
      message: `Your metrics look manageable, so a break isn't urgent. But if you're feeling the need to ask, listen to that instinct.

**Quick mental check:**
- Are you trading your plan or reacting to the market?
- Is each trade meeting your criteria?
- How's your focus level right now?

If you're not at 100%, a short break can help. Even 10 minutes away from the screen can reset your perspective.`,
      suggestedActions: ['quick_break', 'refocus'],
    };
  }

  private defaultResponse(context: UnifiedContext): CoachResponse {
    return {
      message: `I'm here to help with your trading. Here's what I can see right now:

**Quick Stats:**
- Win Rate: ${(context.metrics.winRate * 100).toFixed(1)}%
- Today's P&L: ₹${context.todayTrades.reduce((s, t) => s + t.pnl, 0).toFixed(0)}
- Risk Score: ${context.currentRiskScore}/100
- Active Patterns: ${context.activePatterns.length}

What would you like to discuss?`,
      followUpQuestions: [
        'How can I improve my win rate?',
        'Analyze my patterns',
        'What\'s my biggest risk right now?',
        'Review today\'s performance',
        'Should I take a break?',
      ],
    };
  }

  async detectEmotion(message: string): Promise<EmotionalState | null> {
    const lowerMessage = message.toLowerCase();
    
    // Simple keyword-based detection (could be enhanced with ML)
    const emotionKeywords: Record<string, string[]> = {
      frustrated: ['frustrated', 'angry', 'annoyed', 'hate', 'stupid', 'idiot', 'dumb'],
      anxious: ['anxious', 'worried', 'nervous', 'scared', 'stress', 'pressure'],
      excited: ['excited', 'pumped', 'great', 'amazing', 'killing it', 'fire'],
      confident: ['confident', 'sure', 'certain', 'know', 'feel good'],
      fearful: ['fear', 'afraid', 'terrified', 'panic'],
    };
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(k => lowerMessage.includes(k))) {
        return {
          primary: emotion as any,
          intensity: 0.7,
          triggers: [message],
          suggestions: [],
        };
      }
    }
    
    return null;
  }

  private extractActions(content: string): string[] {
    // Extract any action items mentioned in the response
    const actions: string[] = [];
    
    if (content.includes('stop trading') || content.includes('take a break')) {
      actions.push('stop_trading');
    }
    if (content.includes('review') || content.includes('analyze')) {
      actions.push('review_trades');
    }
    if (content.includes('reduce') && content.includes('size')) {
      actions.push('reduce_position_size');
    }
    
    return actions;
  }

  private generateFollowUpQuestions(message: string, response: string): string[] {
    // Generate relevant follow-up questions
    return [
      'Can you elaborate on that?',
      'What specific action should I take next?',
      'How do I implement this in my trading?',
    ];
  }
}
```

---

## 📦 PHASE 4: GAMIFICATION SYSTEM {#phase-4}

### 4.1 Achievement System

```typescript
// lib/intelligence/gamification/achievements.ts

import { Achievement, AchievementCriteria, Metrics, Trade } from '../core/types';

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'progress' | 'unlockedAt' | 'notified'>[] = [
  // ============================================
  // DISCIPLINE ACHIEVEMENTS
  // ============================================
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Complete your first trade',
    icon: '🎯',
    category: 'milestones',
    rarity: 'common',
    criteria: { type: 'threshold', metric: 'totalTrades', target: 1 },
    reward: { xp: 100, badge: '🎯' },
  },
  {
    id: 'rule_follower',
    name: 'Rule Follower',
    description: 'Complete 10 trades following your rules',
    icon: '📋',
    category: 'discipline',
    rarity: 'common',
    criteria: { type: 'cumulative', metric: 'rulesFollowed', target: 10 },
    reward: { xp: 200, badge: '📋' },
  },
  {
    id: 'discipline_master',
    name: 'Discipline Master',
    description: 'Maintain 90%+ rule following for 50 trades',
    icon: '🏆',
    category: 'discipline',
    rarity: 'epic',
    criteria: { type: 'threshold', metric: 'ruleFollowedRate', target: 0.9, timeframe: 'all_time' },
    reward: { xp: 1000, badge: '🏆', title: 'The Disciplined' },
  },
  {
    id: 'no_revenge',
    name: 'Cool Head',
    description: 'Go 20 trades without revenge trading',
    icon: '🧊',
    category: 'discipline',
    rarity: 'rare',
    criteria: { type: 'streak', metric: 'noRevengeTrades', target: 20 },
    reward: { xp: 500, badge: '🧊' },
  },
  {
    id: 'patient_sniper',
    name: 'Patient Sniper',
    description: 'Take only 3 trades in a day and win all of them',
    icon: '🎯',
    category: 'discipline',
    rarity: 'rare',
    criteria: { type: 'challenge', metric: 'perfectLowVolumeDay', target: 1, timeframe: 'day' },
    reward: { xp: 500, badge: '🎯' },
  },
  
  // ============================================
  // PERFORMANCE ACHIEVEMENTS
  // ============================================
  {
    id: 'green_day',
    name: 'Green Day',
    description: 'Finish a trading day in profit',
    icon: '🟢',
    category: 'performance',
    rarity: 'common',
    criteria: { type: 'threshold', metric: 'profitableDays', target: 1 },
    reward: { xp: 100, badge: '🟢' },
  },
  {
    id: 'green_week',
    name: 'Green Week',
    description: 'Finish a trading week in profit',
    icon: '📈',
    category: 'performance',
    rarity: 'uncommon',
    criteria: { type: 'threshold', metric: 'profitableWeeks', target: 1 },
    reward: { xp: 300, badge: '📈' },
  },
  {
    id: 'profit_master',
    name: 'Profit Master',
    description: 'Achieve profit factor above 2.0',
    icon: '💎',
    category: 'performance',
    rarity: 'epic',
    criteria: { type: 'threshold', metric: 'profitFactor', target: 2.0 },
    reward: { xp: 1000, badge: '💎', title: 'The Profitable' },
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'Achieve 65% win rate over 50+ trades',
    icon: '🎯',
    category: 'performance',
    rarity: 'rare',
    criteria: { type: 'threshold', metric: 'winRate', target: 0.65 },
    reward: { xp: 750, badge: '🎯' },
  },
  {
    id: 'first_lakh',
    name: 'First Lakh',
    description: 'Accumulate ₹1,00,000 in total profits',
    icon: '💰',
    category: 'milestones',
    rarity: 'epic',
    criteria: { type: 'threshold', metric: 'totalPnL', target: 100000 },
    reward: { xp: 2000, badge: '💰', title: 'Lakhpati Trader' },
  },
  
  // ============================================
  // CONSISTENCY ACHIEVEMENTS
  // ============================================
  {
    id: 'winning_streak_3',
    name: 'On Fire',
    description: '3 winning trades in a row',
    icon: '🔥',
    category: 'consistency',
    rarity: 'common',
    criteria: { type: 'streak', metric: 'winStreak', target: 3 },
    reward: { xp: 150, badge: '🔥' },
  },
  {
    id: 'winning_streak_5',
    name: 'Unstoppable',
    description: '5 winning trades in a row',
    icon: '⚡',
    category: 'consistency',
    rarity: 'uncommon',
    criteria: { type: 'streak', metric: 'winStreak', target: 5 },
    reward: { xp: 400, badge: '⚡' },
  },
  {
    id: 'winning_streak_10',
    name: 'Legendary Streak',
    description: '10 winning trades in a row',
    icon: '👑',
    category: 'consistency',
    rarity: 'legendary',
    criteria: { type: 'streak', metric: 'winStreak', target: 10 },
    reward: { xp: 2500, badge: '👑', title: 'Streak Legend' },
  },
  {
    id: 'consistent_week',
    name: 'Consistent Trader',
    description: '5 profitable days in a row',
    icon: '📊',
    category: 'consistency',
    rarity: 'rare',
    criteria: { type: 'streak', metric: 'profitableDayStreak', target: 5 },
    reward: { xp: 750, badge: '📊' },
  },
  {
    id: 'comeback_king',
    name: 'Comeback King',
    description: 'Recover from max drawdown within 10 trades',
    icon: '🦅',
    category: 'consistency',
    rarity: 'epic',
    criteria: { type: 'challenge', metric: 'fastRecovery', target: 1 },
    reward: { xp: 1000, badge: '🦅', title: 'The Resilient' },
  },
  
  // ============================================
  // LEARNING ACHIEVEMENTS
  // ============================================
  {
    id: 'journal_starter',
    name: 'Journal Starter',
    description: 'Add notes to 10 trades',
    icon: '📝',
    category: 'learning',
    rarity: 'common',
    criteria: { type: 'cumulative', metric: 'tradesWithNotes', target: 10 },
    reward: { xp: 200, badge: '📝' },
  },
  {
    id: 'self_aware',
    name: 'Self Aware',
    description: 'Complete 20 AI Coach conversations',
    icon: '🧠',
    category: 'learning',
    rarity: 'uncommon',
    criteria: { type: 'cumulative', metric: 'coachConversations', target: 20 },
    reward: { xp: 300, badge: '🧠' },
  },
  {
    id: 'pattern_hunter',
    name: 'Pattern Hunter',
    description: 'Acknowledge and address 10 detected patterns',
    icon: '🔍',
    category: 'learning',
    rarity: 'rare',
    criteria: { type: 'cumulative', metric: 'patternsAcknowledged', target: 10 },
    reward: { xp: 500, badge: '🔍' },
  },
];

export class AchievementSystem {
  async getAll(userId: string): Promise<Achievement[]> {
    // Fetch user's achievement progress from database
    // For now, return with default progress
    return ACHIEVEMENT_DEFINITIONS.map(def => ({
      ...def,
      progress: 0,
      unlockedAt: undefined,
      notified: false,
    }));
  }

  async checkProgress(
    currentAchievements: Achievement[],
    metrics: Metrics,
    trade?: Trade
  ): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = [];
    
    for (const achievement of currentAchievements) {
      if (achievement.unlockedAt) continue; // Already unlocked
      
      const progress = this.calculateProgress(achievement.criteria, metrics, trade);
      achievement.progress = progress;
      
      if (progress >= 1) {
        achievement.unlockedAt = new Date();
        achievement.progress = 1;
        newlyUnlocked.push(achievement);
      }
    }
    
    return newlyUnlocked;
  }

  private calculateProgress(
    criteria: AchievementCriteria,
    metrics: Metrics,
    trade?: Trade
  ): number {
    switch (criteria.type) {
      case 'threshold':
        const currentValue = this.getMetricValue(criteria.metric, metrics);
        return Math.min(currentValue / criteria.target, 1);
        
      case 'cumulative':
        const cumulativeValue = this.getMetricValue(criteria.metric, metrics);
        return Math.min(cumulativeValue / criteria.target, 1);
        
      case 'streak':
        const streakValue = this.getMetricValue(criteria.metric, metrics);
        return Math.min(streakValue / criteria.target, 1);
        
      case 'challenge':
        // Special handling for challenge-type achievements
        return this.checkChallengeCriteria(criteria.metric, metrics, trade) ? 1 : 0;
        
      default:
        return 0;
    }
  }

  private getMetricValue(metric: string, metrics: Metrics): number {
    const metricMap: Record<string, number> = {
      totalTrades: metrics.totalTrades,
      winRate: metrics.winRate,
      profitFactor: metrics.profitFactor,
      totalPnL: metrics.totalPnL,
      winStreak: metrics.longestWinStreak,
      currentStreak: Math.max(metrics.currentStreak, 0),
      profitableDays: metrics.profitableDays,
      profitableWeeks: metrics.profitableWeeks,
      ruleFollowedRate: metrics.ruleFollowedRate,
      consistencyScore: metrics.consistencyScore,
    };
    
    return metricMap[metric] || 0;
  }

  private checkChallengeCriteria(metric: string, metrics: Metrics, trade?: Trade): boolean {
    // Implement specific challenge checks
    switch (metric) {
      case 'perfectLowVolumeDay':
        // Check if today had exactly 3 trades and all were wins
        return false; // Would need today's trades data
        
      case 'fastRecovery':
        // Check if recovered from drawdown quickly
        return metrics.recoveryFactor > 2;
        
      default:
        return false;
    }
  }
}
```

### 4.2 Challenge System

```typescript
// lib/intelligence/gamification/challenges.ts

import { Challenge, ChallengeCriteria, Metrics, Trade } from '../core/types';

const CHALLENGE_TEMPLATES = {
  daily: [
    {
      name: 'Perfect Day',
      description: 'Win all your trades today (max 5)',
      difficulty: 'hard',
      criteria: [
        { description: 'Win all trades', metric: 'todayWinRate', target: 1, current: 0, completed: false },
        { description: 'Max 5 trades', metric: 'todayTrades', target: 5, current: 0, completed: false },
      ],
      reward: { xp: 500, badge: '⭐' },
    },
    {
      name: 'Disciplined Trader',
      description: 'Follow your rules on every trade today',
      difficulty: 'medium',
      criteria: [
        { description: 'Follow rules', metric: 'todayRuleFollowed', target: 1, current: 0, completed: false },
        { description: 'Take at least 2 trades', metric: 'todayTrades', target: 2, current: 0, completed: false },
      ],
      reward: { xp: 300 },
    },
    {
      name: 'Quality Over Quantity',
      description: 'Take max 3 trades, end in profit',
      difficulty: 'medium',
      criteria: [
        { description: 'Max 3 trades', metric: 'todayTradesMax', target: 3, current: 0, completed: false },
        { description: 'End in profit', metric: 'todayProfit', target: 0.01, current: 0, completed: false },
      ],
      reward: { xp: 350 },
    },
  ],
  weekly: [
    {
      name: 'Consistent Week',
      description: 'End 4 out of 5 trading days in profit',
      difficulty: 'hard',
      criteria: [
        { description: 'Profitable days', metric: 'weekProfitableDays', target: 4, current: 0, completed: false },
      ],
      reward: { xp: 1000, badge: '📈' },
    },
    {
      name: 'Pattern Breaker',
      description: 'Go the entire week without triggering a behavioral pattern',
      difficulty: 'extreme',
      criteria: [
        { description: 'No patterns', metric: 'weekPatternFree', target: 1, current: 0, completed: false },
      ],
      reward: { xp: 1500, badge: '🧘' },
    },
    {
      name: 'Risk Manager',
      description: 'Keep max drawdown under 5% for the week',
      difficulty: 'medium',
      criteria: [
        { description: 'Max drawdown < 5%', metric: 'weekMaxDrawdown', target: 0.05, current: 0, completed: false },
      ],
      reward: { xp: 750 },
    },
  ],
  monthly: [
    {
      name: 'Profit Factor Pro',
      description: 'Maintain profit factor above 1.5 for the month',
      difficulty: 'hard',
      criteria: [
        { description: 'PF > 1.5', metric: 'monthProfitFactor', target: 1.5, current: 0, completed: false },
        { description: 'Min 20 trades', metric: 'monthTrades', target: 20, current: 0, completed: false },
      ],
      reward: { xp: 2000, badge: '💎' },
    },
  ],
};

export class ChallengeManager {
  async getActive(userId: string): Promise<Challenge[]> {
    // Fetch active challenges from database
    // Generate new ones if needed
    return [];
  }

  async generateDailyChallenge(userId: string, metrics: Metrics): Promise<Challenge> {
    // Select appropriate challenge based on user's level
    const template = CHALLENGE_TEMPLATES.daily[Math.floor(Math.random() * CHALLENGE_TEMPLATES.daily.length)];
    
    const today = new Date();
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    return {
      id: crypto.randomUUID(),
      name: template.name,
      description: template.description,
      type: 'daily',
      difficulty: template.difficulty as any,
      criteria: template.criteria,
      progress: {
        overallProgress: 0,
        criteriaProgress: template.criteria.map(() => 0),
        lastUpdated: new Date(),
      },
      reward: template.reward,
      startDate: today,
      endDate: endOfDay,
      status: 'active',
    };
  }

  async updateProgress(
    challenges: Challenge[],
    trade: Trade,
    metrics: Metrics
  ): Promise<void> {
    for (const challenge of challenges) {
      if (challenge.status !== 'active') continue;
      
      // Check if challenge is expired
      if (new Date() > challenge.endDate) {
        challenge.status = 'expired';
        continue;
      }
      
      // Update each criteria
      let allComplete = true;
      for (let i = 0; i < challenge.criteria.length; i++) {
        const criteria = challenge.criteria[i];
        const progress = this.evaluateCriteria(criteria, trade, metrics);
        criteria.current = progress;
        criteria.completed = progress >= criteria.target;
        challenge.progress.criteriaProgress[i] = Math.min(progress / criteria.target, 1);
        
        if (!criteria.completed) allComplete = false;
      }
      
      challenge.progress.overallProgress = 
        challenge.progress.criteriaProgress.reduce((a, b) => a + b, 0) / challenge.criteria.length;
      challenge.progress.lastUpdated = new Date();
      
      if (allComplete) {
        challenge.status = 'completed';
      }
    }
  }

  private evaluateCriteria(criteria: ChallengeCriteria, trade: Trade, metrics: Metrics): number {
    // Evaluate based on metric type
    // This would need more context about today's/this week's trades
    return criteria.current; // Placeholder
  }
}
```

---

This continues in Part 4 with UI Components and Database Schema...
# TAI ULTIMATE PROMPT - PART 4: UI, DATABASE & FINAL IMPLEMENTATION

---

## 📦 PHASE 5: UI COMPONENTS {#phase-5}

### 5.1 Intelligence Dashboard Page

```tsx
// app/dashboard/intelligence/page.tsx

import { Suspense } from 'react';
import { IntelligenceDashboard } from './IntelligenceDashboard';
import { IntelligenceLoading } from './IntelligenceLoading';

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Suspense fallback={<IntelligenceLoading />}>
        <IntelligenceDashboard />
      </Suspense>
    </div>
  );
}
```

### 5.2 Main Dashboard Component

```tsx
// app/dashboard/intelligence/IntelligenceDashboard.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, MessageCircle, TrendingUp, AlertTriangle, 
  Target, Zap, Trophy, BarChart3, Shield, Settings,
  Sparkles, Activity
} from 'lucide-react';
import { useIntelligence } from '@/hooks/useIntelligence';
import { QuickStats } from './components/QuickStats';
import { PatternAlerts } from './components/PatternAlerts';
import { InsightsPanel } from './components/InsightsPanel';
import { AICoachChat } from './components/AICoachChat';
import { ActionPlanCard } from './components/ActionPlanCard';
import { AchievementsBar } from './components/AchievementsBar';
import { RiskGauge } from './components/RiskGauge';
import { EmotionalState } from './components/EmotionalState';

type TabType = 'overview' | 'coach' | 'insights' | 'gamification';

export function IntelligenceDashboard() {
  const { initialized, loading, dashboard, error } = useIntelligence();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!initialized || loading) {
    return <IntelligenceLoading />;
  }

  if (error) {
    return <IntelligenceError error={error} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-xl border border-violet-500/20">
              <Brain className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                TradeAutopsy Intelligence
                <span className="px-2 py-0.5 text-xs bg-violet-500/20 text-violet-400 rounded-full">
                  v2.0
                </span>
              </h1>
              <p className="text-sm text-zinc-500">AI-powered trading analysis & coaching</p>
            </div>
          </div>

          {/* Risk Indicator */}
          <div className="flex items-center gap-4">
            <RiskIndicatorBadge score={dashboard?.quickStats.riskScore || 0} />
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 p-1 bg-white/5 rounded-xl w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'coach', label: 'AI Coach', icon: MessageCircle },
            { id: 'insights', label: 'Insights', icon: Sparkles },
            { id: 'gamification', label: 'Progress', icon: Trophy },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <OverviewTab dashboard={dashboard} />
            </motion.div>
          )}

          {activeTab === 'coach' && (
            <motion.div
              key="coach"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-[calc(100vh-220px)]"
            >
              <AICoachChat />
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <InsightsTab dashboard={dashboard} />
            </motion.div>
          )}

          {activeTab === 'gamification' && (
            <motion.div
              key="gamification"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GamificationTab dashboard={dashboard} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ============================================
// TAB CONTENT COMPONENTS
// ============================================

function OverviewTab({ dashboard }: { dashboard: any }) {
  return (
    <>
      {/* Quick Stats */}
      <QuickStats stats={dashboard.quickStats} />

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Patterns & Emotional State */}
        <div className="col-span-4 space-y-6">
          <PatternAlerts 
            patterns={dashboard.activePatterns} 
            interactions={dashboard.patternInteractions}
          />
          <EmotionalState state={dashboard.emotionalState} />
        </div>

        {/* Center Column - Insights & Action Plan */}
        <div className="col-span-5 space-y-6">
          <InsightsPanel insights={dashboard.recentInsights} />
          <ActionPlanCard plan={dashboard.actionPlan} />
        </div>

        {/* Right Column - Risk & Achievements */}
        <div className="col-span-3 space-y-6">
          <RiskGauge score={dashboard.quickStats.riskScore} />
          <AchievementsBar achievements={dashboard.recentAchievements} />
          <ChallengesCard challenges={dashboard.activeChallenges} />
        </div>
      </div>
    </>
  );
}

function InsightsTab({ dashboard }: { dashboard: any }) {
  const { generateInsights } = useIntelligence();
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateInsights();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">ML-Powered Insights</h2>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          {generating ? 'Generating...' : 'Generate Insights'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {dashboard.mlInsights?.map((insight: any) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}

function GamificationTab({ dashboard }: { dashboard: any }) {
  return (
    <div className="space-y-6">
      {/* Skills Overview */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Your Skills</h2>
        <div className="grid grid-cols-5 gap-4">
          {dashboard.topSkills?.map((skill: any) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </div>

      {/* Active Challenges */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Active Challenges</h2>
        <div className="grid grid-cols-3 gap-4">
          {dashboard.activeChallenges?.map((challenge: any) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </div>

      {/* Achievement Wall */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Achievement Wall</h2>
        <AchievementWall />
      </div>
    </div>
  );
}

// ============================================
// SHARED COMPONENTS
// ============================================

function RiskIndicatorBadge({ score }: { score: number }) {
  const getConfig = () => {
    if (score > 70) return { color: 'red', label: 'HIGH RISK', icon: AlertTriangle };
    if (score > 40) return { color: 'amber', label: 'MODERATE', icon: Shield };
    return { color: 'emerald', label: 'LOW RISK', icon: Shield };
  };

  const config = getConfig();

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-${config.color}-500/10 border border-${config.color}-500/20`}>
      <config.icon className={`w-4 h-4 text-${config.color}-400`} />
      <span className={`text-sm font-medium text-${config.color}-400`}>{config.label}</span>
      <span className={`text-sm text-${config.color}-300`}>{score}/100</span>
    </div>
  );
}

function IntelligenceLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <Brain className="absolute inset-0 m-auto w-6 h-6 text-violet-400" />
        </div>
        <p className="text-zinc-400 animate-pulse">Initializing Intelligence...</p>
      </div>
    </div>
  );
}

function IntelligenceError({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Intelligence Error</h2>
        <p className="text-zinc-400">{error}</p>
      </div>
    </div>
  );
}
```

### 5.3 AI Coach Chat Component

```tsx
// app/dashboard/intelligence/components/AICoachChat.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Mic, MicOff, Sparkles, User, Bot,
  AlertTriangle, TrendingUp, Brain, Coffee, Target
} from 'lucide-react';
import { useIntelligence } from '@/hooks/useIntelligence';

const QUICK_ACTIONS = [
  { icon: TrendingUp, label: 'Analyze my performance', prompt: 'Analyze my recent performance' },
  { icon: AlertTriangle, label: 'Check my patterns', prompt: 'What patterns are affecting my trading?' },
  { icon: Brain, label: 'Improvement tips', prompt: 'How can I improve my trading?' },
  { icon: Coffee, label: 'Should I take a break?', prompt: 'Should I take a break right now?' },
  { icon: Target, label: 'Review today', prompt: "How did I do today?" },
];

export function AICoachChat() {
  const { chatHistory, chat, dashboard } = useIntelligence();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    
    const msg = message;
    setMessage('');
    setSending(true);
    
    try {
      await chat(msg);
    } finally {
      setSending(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-[#111118] border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-lg">
            <Brain className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">AI Trading Coach</h2>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Online • Powered by GPT-4
            </div>
          </div>
        </div>
        
        {/* Emotional State Indicator */}
        {dashboard?.emotionalState && (
          <div className="px-3 py-1.5 bg-white/5 rounded-lg text-sm">
            <span className="text-zinc-400">Mood: </span>
            <span className="text-white capitalize">{dashboard.emotionalState.primary}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <EmptyState onQuickAction={handleQuickAction} />
        ) : (
          <>
            {chatHistory.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {sending && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick Actions */}
      {chatHistory.length === 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                onClick={() => handleQuickAction(action.prompt)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/5">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask your trading coach anything..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
            />
            <button
              onClick={() => setIsListening(!isListening)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                isListening ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-zinc-400'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="p-3 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onQuickAction }: { onQuickAction: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="p-4 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-2xl mb-6">
        <Brain className="w-12 h-12 text-violet-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Your AI Trading Coach</h3>
      <p className="text-zinc-400 max-w-md mb-8">
        I'm here to help you become a better trader. Ask me about your performance, 
        patterns, or anything trading-related.
      </p>
      <div className="grid grid-cols-2 gap-3 max-w-lg">
        {QUICK_ACTIONS.slice(0, 4).map((action, i) => (
          <button
            key={i}
            onClick={() => onQuickAction(action.prompt)}
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-colors"
          >
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <action.icon className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-sm text-zinc-300">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: any }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`p-2 rounded-lg ${isUser ? 'bg-violet-500/20' : 'bg-white/5'}`}>
          {isUser ? <User className="w-4 h-4 text-violet-400" /> : <Bot className="w-4 h-4 text-cyan-400" />}
        </div>
        <div className={`px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-violet-500 text-white rounded-br-md' 
            : 'bg-white/5 border border-white/10 text-zinc-200 rounded-bl-md'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p className={`text-[10px] mt-2 ${isUser ? 'text-violet-200' : 'text-zinc-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="p-2 bg-white/5 rounded-lg">
        <Bot className="w-4 h-4 text-cyan-400" />
      </div>
      <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl rounded-bl-md">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
```

---

## 📦 PHASE 6: DATABASE SCHEMA {#database-schema}

```sql
-- ============================================
-- TRADEAUTOPSY INTELLIGENCE v2.0 SCHEMA
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Unified Insights Table
CREATE TABLE tai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Classification
  type TEXT NOT NULL CHECK (type IN ('pattern_alert', 'ml_insight', 'milestone', 'prediction', 'coaching', 'anomaly')),
  category TEXT NOT NULL CHECK (category IN ('risk', 'performance', 'behavior', 'strategy', 'opportunity')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('critical', 'warning', 'info', 'success')),
  priority INT NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  
  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  explanation TEXT,
  
  -- Scoring
  confidence DECIMAL(4,3) DEFAULT 1.000 CHECK (confidence >= 0 AND confidence <= 1),
  impact_score DECIMAL(12,2) DEFAULT 0,
  
  -- Data
  data JSONB DEFAULT '{}',
  visualization JSONB,
  actions JSONB DEFAULT '[]',
  
  -- Relations
  related_patterns TEXT[] DEFAULT '{}',
  related_trades UUID[] DEFAULT '{}',
  
  -- Status
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Detected Patterns Table
CREATE TABLE tai_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  pattern_type TEXT NOT NULL,
  severity INT NOT NULL CHECK (severity >= 1 AND severity <= 10),
  confidence DECIMAL(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  cost DECIMAL(12,2) DEFAULT 0,
  frequency DECIMAL(5,4) DEFAULT 0,
  
  trades_affected UUID[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  suggestions TEXT[] DEFAULT '{}',
  
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Action Plans Table
CREATE TABLE tai_action_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  week_start DATE NOT NULL,
  focus_area TEXT NOT NULL,
  
  goals JSONB NOT NULL DEFAULT '[]',
  daily_tasks JSONB DEFAULT '[]',
  progress JSONB DEFAULT '{"overall": 0, "goalsCompleted": 0, "tasksCompleted": 0}',
  
  reflection TEXT,
  completed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, profile_id, week_start)
);

-- AI Chat History Table
CREATE TABLE tai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  context_snapshot JSONB,
  emotional_state JSONB,
  
  tokens_used INT,
  model TEXT,
  latency_ms INT,
  
  reaction TEXT CHECK (reaction IN ('helpful', 'not_helpful', NULL)),
  feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GAMIFICATION TABLES
-- ============================================

-- Achievements Table
CREATE TABLE tai_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  achievement_id TEXT NOT NULL,
  progress DECIMAL(5,4) DEFAULT 0 CHECK (progress >= 0 AND progress <= 1),
  
  unlocked_at TIMESTAMPTZ,
  notified BOOLEAN DEFAULT FALSE,
  
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_id)
);

-- Skills Table
CREATE TABLE tai_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  skill_id TEXT NOT NULL,
  category TEXT NOT NULL,
  level INT DEFAULT 1 CHECK (level >= 1 AND level <= 10),
  current_xp INT DEFAULT 0,
  xp_to_next INT DEFAULT 1000,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, skill_id)
);

-- Challenges Table
CREATE TABLE tai_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'special')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'extreme')),
  
  criteria JSONB NOT NULL DEFAULT '[]',
  progress JSONB DEFAULT '{"overallProgress": 0, "criteriaProgress": [], "lastUpdated": null}',
  reward JSONB DEFAULT '{}',
  
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'expired')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PREDICTIONS & ANALYTICS TABLES
-- ============================================

-- Trade Predictions Table
CREATE TABLE tai_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
  
  -- Probability Estimates
  win_probability DECIMAL(5,4),
  loss_probability DECIMAL(5,4),
  expected_pnl DECIMAL(12,2),
  
  -- Risk Assessment
  risk_score INT CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_factors JSONB DEFAULT '[]',
  
  -- Recommendation
  recommendation TEXT,
  reasoning TEXT[],
  
  -- Accuracy Tracking
  actual_outcome TEXT,
  accuracy_score DECIMAL(5,4),
  
  -- Model Info
  confidence DECIMAL(5,4),
  model_version TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences Table
CREATE TABLE tai_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Trading Preferences
  risk_tolerance TEXT DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  trading_styles TEXT[] DEFAULT '{}',
  preferred_symbols TEXT[] DEFAULT '{}',
  preferred_strategies TEXT[] DEFAULT '{}',
  
  -- Coach Preferences
  coach_personality_id TEXT DEFAULT 'balanced',
  check_in_schedule JSONB DEFAULT '{"morningBriefing": true, "preTrade": true, "midDay": false, "eveningReview": true}',
  
  -- Notification Preferences
  notification_level TEXT DEFAULT 'important' CHECK (notification_level IN ('all', 'important', 'critical')),
  channels JSONB DEFAULT '{"inApp": true, "email": false}',
  
  -- Display Preferences
  currency TEXT DEFAULT 'INR',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Insights indexes
CREATE INDEX idx_tai_insights_user ON tai_insights(user_id, profile_id, created_at DESC);
CREATE INDEX idx_tai_insights_type ON tai_insights(type, category);
CREATE INDEX idx_tai_insights_severity ON tai_insights(severity) WHERE severity IN ('critical', 'warning');
CREATE INDEX idx_tai_insights_unack ON tai_insights(user_id, acknowledged) WHERE acknowledged = FALSE;

-- Patterns indexes
CREATE INDEX idx_tai_patterns_user ON tai_patterns(user_id, profile_id, detected_at DESC);
CREATE INDEX idx_tai_patterns_type ON tai_patterns(pattern_type);

-- Action plans indexes
CREATE INDEX idx_tai_action_plans_user ON tai_action_plans(user_id, profile_id, week_start DESC);
CREATE INDEX idx_tai_action_plans_active ON tai_action_plans(user_id, completed) WHERE completed = FALSE;

-- Conversations indexes
CREATE INDEX idx_tai_conversations_user ON tai_conversations(user_id, profile_id, created_at DESC);

-- Achievements indexes
CREATE INDEX idx_tai_achievements_user ON tai_achievements(user_id, unlocked_at DESC);

-- Challenges indexes
CREATE INDEX idx_tai_challenges_user ON tai_challenges(user_id, status);
CREATE INDEX idx_tai_challenges_active ON tai_challenges(user_id) WHERE status = 'active';

-- Predictions indexes
CREATE INDEX idx_tai_predictions_user ON tai_predictions(user_id, created_at DESC);
CREATE INDEX idx_tai_predictions_trade ON tai_predictions(trade_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE tai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE tai_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tai_action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tai_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tai_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE tai_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE tai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tai_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can access own data" ON tai_insights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own data" ON tai_patterns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own data" ON tai_action_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own data" ON tai_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own data" ON tai_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own data" ON tai_skills FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own data" ON tai_challenges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own data" ON tai_predictions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own data" ON tai_preferences FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tai_insights_updated_at
  BEFORE UPDATE ON tai_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tai_action_plans_updated_at
  BEFORE UPDATE ON tai_action_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tai_achievements_updated_at
  BEFORE UPDATE ON tai_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tai_skills_updated_at
  BEFORE UPDATE ON tai_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tai_challenges_updated_at
  BEFORE UPDATE ON tai_challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tai_preferences_updated_at
  BEFORE UPDATE ON tai_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Week 1: Core Engine
- [ ] `lib/intelligence/core/types.ts` - Complete type system
- [ ] `lib/intelligence/core/engine.ts` - Main orchestrator
- [ ] `lib/intelligence/core/context-store.ts` - Context management
- [ ] `lib/intelligence/analytics/metrics-calculator.ts` - 30+ metrics
- [ ] `lib/intelligence/detection/pattern-detector.ts` - 15 patterns
- [ ] Database schema migration

### Week 2: AI Coach
- [ ] `lib/intelligence/coach/ai-coach.ts` - GPT-4 integration
- [ ] `lib/intelligence/coach/personality.ts` - 5 coach personalities
- [ ] `lib/intelligence/coach/conversation.ts` - Multi-turn context
- [ ] `lib/intelligence/coach/emotional.ts` - Emotion detection
- [ ] API route `/api/intelligence/chat`

### Week 3: Gamification
- [ ] `lib/intelligence/gamification/achievements.ts` - 30+ achievements
- [ ] `lib/intelligence/gamification/skill-tree.ts` - 5 skill trees
- [ ] `lib/intelligence/gamification/challenges.ts` - Challenge system
- [ ] Notification system for unlocks

### Week 4: Predictions & Analytics
- [ ] `lib/intelligence/prediction/trade-predictor.ts`
- [ ] `lib/intelligence/prediction/risk-scorer.ts`
- [ ] `lib/intelligence/prediction/position-sizer.ts`
- [ ] `lib/intelligence/analytics/monte-carlo.ts`

### Week 5: UI Components
- [ ] Intelligence Dashboard page
- [ ] AI Coach chat interface
- [ ] Pattern alert cards
- [ ] Insight cards
- [ ] Achievement wall
- [ ] Risk gauge
- [ ] Action plan view

### Week 6: Integration & Polish
- [ ] Connect all components
- [ ] Real-time notifications
- [ ] Performance optimization
- [ ] Error handling
- [ ] Testing
- [ ] Documentation

---

## 🎯 SUCCESS CRITERIA

1. **Performance**
   - [ ] Context initialization < 500ms
   - [ ] Per-trade processing < 100ms
   - [ ] Chat response < 2s
   - [ ] Dashboard load < 300ms

2. **Quality**
   - [ ] Pattern detection accuracy > 85%
   - [ ] Zero critical bugs
   - [ ] TypeScript strict mode passing
   - [ ] 80%+ test coverage

3. **User Experience**
   - [ ] Intuitive navigation
   - [ ] Real-time updates
   - [ ] Mobile responsive
   - [ ] Accessible (WCAG 2.1 AA)

4. **Business Impact**
   - [ ] Increased user engagement
   - [ ] Reduced churn
   - [ ] Premium feature differentiation

---

## 🚀 START BUILDING

**Order of implementation:**

1. Start with `lib/intelligence/core/types.ts`
2. Build `lib/intelligence/core/engine.ts`
3. Implement pattern detection
4. Add AI coach
5. Build UI components
6. Integrate gamification
7. Add predictions
8. Polish and test

**Remember:**
- Type everything (no `any`)
- Test as you build
- Optimize incrementally
- Document API endpoints
- Keep the UI Cursor.com-inspired

**Let's make TradeAutopsy Intelligence legendary! 🧠⚡**
