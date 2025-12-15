import { createClient } from '@/utils/supabase/server';
import { PatternDetector } from '../detection/pattern-detector';
import { RegimeDetector } from '../detection/regime-detector';
import { AnomalyDetector } from '../detection/anomaly-detector';
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
  Achievement,
  Challenge,
  EmotionalState,
  ContextSnapshot,
  UserPreferences,
  Skill,
} from './types';

export class IntelligenceEngine {
  private context: UnifiedContext | null = null;
  private initialized = false;

  // Sub-systems
  private patternDetector: PatternDetector;
  private regimeDetector: RegimeDetector;
  private anomalyDetector: AnomalyDetector;
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
    this.regimeDetector = new RegimeDetector();
    this.anomalyDetector = new AnomalyDetector();
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
      const features = this.featureExtractor.extract(userId, profileId, trades, metrics);
      const patterns = this.patternDetector.detectAll(trades, undefined);
      const patternInteractions = this.patternDetector.detectInteractions(patterns);
      const marketRegime = this.regimeDetector.detect(trades, metrics);
      const anomalyInsights = this.anomalyDetector.detect(trades, metrics);

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
        marketRegime,
        pendingInsights: [],
        deliveredInsights: anomalyInsights,
        coachPersonality: this.aiCoach.getPersonality(preferences.coachPersonalityId),
        chatHistory,
        emotionalState: this.detectEmotionalState(todayTrades, metrics),
        achievements,
        skills: this.calculateSkills(achievements, metrics),
        activeChallenges: challenges.filter((c) => c.status === 'active'),
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
      this.context.metrics = this.metricsCalculator.updateIncremental(this.context.metrics, trade);

      // 3. Pattern detection (incremental)
      const newPatterns = this.patternDetector.detectIncremental(
        trade,
        this.context.recentTrades.slice(0, 30),
      );

      // Add new patterns to active list
      for (const pattern of newPatterns) {
        if (!this.context.activePatterns.find((p) => p.type === pattern.type)) {
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
          this.context.activePatterns,
        );
      }

      // 5. Check milestones & achievements
      const newAchievements = await this.achievementSystem.checkProgress(
        this.context.achievements,
        this.context.metrics,
        trade,
      );

      for (const achievement of newAchievements) {
        response.notifications?.push({
          id: crypto.randomUUID(),
          type: 'achievement',
          severity: 'success',
          title: '🏆 Achievement Unlocked!',
          message: `${achievement.name}: ${achievement.description}`,
          createdAt: new Date(),
        });
      }

      // 6. Update challenge progress
      await this.challengeManager.updateProgress(
        this.context.activeChallenges,
        trade,
        this.context.metrics,
      );

      // 7. Update action plan progress
      if (this.context.currentPlan) {
        await this.updateActionPlanProgress(trade);
      }

      // 8. Update emotional state
      this.context.emotionalState = this.detectEmotionalState(
        this.context.todayTrades,
        this.context.metrics,
      );

      // 9. Update risk score
      this.context.currentRiskScore = this.calculatePortfolioRisk(
        this.context.todayTrades,
        this.context.metrics,
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
      this.context.chatHistory.slice(-10),
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
      this.context.metrics,
    );
  }

  async getOptimalPositionSize(
    symbol: string,
    stopLossPercent: number,
    accountSize: number,
  ): Promise<{ size: number; reasoning: string }> {
    if (!this.context) throw new Error('Engine not initialized');

    return this.tradePredictor.calculateOptimalSize(
      symbol,
      stopLossPercent,
      accountSize,
      this.context.metrics,
      this.context.preferences.riskTolerance,
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
      this.context.activePatterns,
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
        .filter((a) => a.unlockedAt)
        .sort(
          (a, b) =>
            new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime(),
        )
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
      .order('trade_date', { ascending: false })
      .limit(1000);

    if (error) throw error;
    
    // Map database schema to TAI Trade type
    return (data || []).map((row: any) => ({
      ...row,
      // Map trade_date to entry_time/exit_time if needed
      entry_time: row.entry_time || row.trade_date || row.created_at || new Date().toISOString(),
      exit_time: row.exit_time || row.trade_date || row.updated_at || new Date().toISOString(),
      // Ensure numeric fields
      pnl: typeof row.pnl === 'string' ? parseFloat(row.pnl) : (row.pnl ?? 0),
      pnl_percentage: typeof row.pnl_percentage === 'string' ? parseFloat(row.pnl_percentage) : (row.pnl_percentage ?? 0),
      quantity: typeof row.quantity === 'string' ? parseFloat(row.quantity) : (row.quantity ?? 0),
      entry_price: typeof row.entry_price === 'string' ? parseFloat(row.entry_price) : (row.entry_price ?? 0),
      exit_price: typeof row.exit_price === 'string' ? parseFloat(row.exit_price) : (row.exit_price ?? 0),
      // Map symbol if needed
      symbol: row.symbol || row.tradingsymbol || 'UNKNOWN',
      // Map side if needed
      side: row.side || (row.transaction_type?.toLowerCase().includes('buy') ? 'long' : 'short'),
    })) as Trade[];
  }

  private filterToday(trades: Trade[]): Trade[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return trades.filter((t) => {
      const exitDate = new Date(t.exit_time || t.entry_time || t.created_at);
      return exitDate >= today;
    });
  }

  private calculateWinRate(trades: Trade[]): number {
    if (trades.length === 0) return 0;
    return trades.filter((t) => t.pnl > 0).length / trades.length;
  }

  private calculateWeekPnL(): number {
    if (!this.context) return 0;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return this.context.recentTrades
      .filter((t) => {
        const exitDate = new Date(t.exit_time || t.entry_time || t.created_at);
        return exitDate >= weekAgo;
      })
      .reduce((s, t) => s + (t.pnl || 0), 0);
  }

  private calculatePortfolioRisk(trades: Trade[], metrics: Metrics): number {
    if (!this.context) return 0;

    // 0-100 composite risk score
    let risk = 0;

    // Factor 1: Equity drawdown (maxDrawdownPercent is 0-1)
    const ddPct = metrics.maxDrawdownPercent || 0;
    risk += Math.min(ddPct * 200, 40); // up to 40 pts for large drawdowns

    // Factor 2: Today's P&L shock
    const todayPnL = trades.reduce((s, t) => s + t.pnl, 0);
    if (todayPnL < 0) {
      risk += Math.min((Math.abs(todayPnL) / 1000) * 10, 20);
    }

    // Factor 3: Overtrading today
    if (trades.length > 5) {
      risk += Math.min((trades.length - 5) * 3, 15);
    }

    // Factor 4: Losing streak
    if (metrics.currentStreak < -2) {
      risk += Math.min(Math.abs(metrics.currentStreak) * 4, 15);
    }

    // Factor 5: Active pattern pressure (sum of severities)
    const patternPressure = this.context.activePatterns.reduce(
      (s, p) => s + p.severity,
      0,
    );
    risk += Math.min(patternPressure * 1.5, 20);

    // Factor 6: Discipline (low rule-following increases risk)
    const disciplinePenalty = (1 - (metrics.ruleFollowedRate || 0)) * 20;
    risk += disciplinePenalty;

    return Math.max(0, Math.min(risk, 100));
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
      activePatterns: this.context.activePatterns.map((p) => p.type),
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
    ];
  }

  // Database operations
  private async fetchPreferences(userId: string): Promise<UserPreferences> {
    // TODO: Fetch from database or return defaults once tai_preferences is wired
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
      .from('tai_conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(50);

    return (data || []).map((d: any) => ({
      id: d.id,
      role: d.role,
      content: d.message || d.response,
      timestamp: new Date(d.created_at),
    }));
  }

  private async fetchAchievements(userId: string): Promise<Achievement[]> {
    return this.achievementSystem.getAll(userId);
  }

  private async fetchChallenges(userId: string): Promise<Challenge[]> {
    return this.challengeManager.getActive(userId);
  }

  private async fetchActionPlan(userId: string, profileId: string): Promise<ActionPlan | null> {
    // TODO: Fetch current week's action plan from tai_action_plans
    return null;
  }

  private async savePatterns(patterns: DetectedPattern[]): Promise<void> {
    if (patterns.length === 0 || !this.context) return;

    const supabase = await createClient();
    await supabase.from('tai_patterns').insert(
      patterns.map((p) => ({
        user_id: this.context!.userId,
        profile_id: this.context!.profileId,
        pattern_type: p.type,
        severity: p.severity,
        confidence: p.confidence,
        cost: p.cost,
        trades_affected: p.tradesAffected,
        metadata: p.metadata,
      })),
    );
  }

  private async saveInsights(insights: Insight[]): Promise<void> {
    if (insights.length === 0 || !this.context) return;

    const supabase = await createClient();
    await supabase.from('tai_insights').insert(
      insights.map((i) => ({
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
      })),
    );
  }

  private async saveChatMessages(messages: ChatMessage[]): Promise<void> {
    if (!this.context) return;
    const supabase = await createClient();

    for (const msg of messages) {
      await supabase.from('tai_conversations').insert({
        user_id: this.context.userId,
        profile_id: this.context.profileId,
        message: msg.role === 'user' ? msg.content : null,
        response: msg.role === 'assistant' ? msg.content : null,
        context: msg.contextSnapshot,
        sentiment: msg.emotionalState?.primary,
      });
    }
  }

  private async updateActionPlanProgress(trade: Trade): Promise<void> {
    if (!this.context?.currentPlan) return;
    // TODO: implement plan progress updates based on trade and plan goals
  }

  private async processSuggestedActions(actions: string[]): Promise<void> {
    // TODO: Implement suggested action handling (e.g. create tasks, update preferences)
  }
}

