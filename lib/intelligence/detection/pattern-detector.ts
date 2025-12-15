import {
  Trade,
  DetectedPattern,
  PatternType,
  PatternInteraction,
  UnifiedContext,
} from '../core/types';

interface PatternResult {
  detected: boolean;
  confidence?: number;
  severity?: number;
  cost?: number;
  tradesAffected?: string[];
  metadata?: Record<string, any>;
  suggestions?: string[];
}

export class PatternDetector {
  private lastDetected: Map<PatternType, Date> = new Map();
  private readonly COOLDOWN_MS = 24 * 60 * 60 * 1000; // 1 day

  detectAll(trades: Trade[], context?: UnifiedContext): DetectedPattern[] {
    if (trades.length === 0) return [];
    const window = trades.slice().sort((a, b) => (a.entry_time > b.entry_time ? 1 : -1));
    const latest = window[window.length - 1];

    const patterns: DetectedPattern[] = [];
    const detectors: Array<[PatternType, (t: Trade, w: Trade[]) => PatternResult]> = [
      ['monday_syndrome', (t, w) => this.detectMondaySyndrome(t, w)],
      ['friday_carelessness', (t, w) => this.detectFridayCarelessness(t, w)],
      ['news_trading', (t, w) => this.detectNewsTrading(t, w, context)],
      ['strategy_degradation', (t, w) => this.detectStrategyDegradation(t, w)],
      ['style_drift', (t, w) => this.detectStyleDrift(t, w, context)],
    ];

    for (const [type, fn] of detectors) {
      const result = fn(latest, window);
      if (result.detected) {
        const pattern = this.toDetectedPattern(type, result, latest);
        if (pattern && this.isBeyondCooldown(type)) {
          patterns.push(pattern);
          this.lastDetected.set(type, new Date());
        }
      }
    }

    return patterns;
  }

  detectIncremental(newTrade: Trade, recentWindow: Trade[], context?: UnifiedContext): DetectedPattern[] {
    const window = [newTrade, ...recentWindow].slice(0, 100);

    const patterns: DetectedPattern[] = [];
    const detectors: Array<[PatternType, (t: Trade, w: Trade[]) => PatternResult]> = [
      ['monday_syndrome', (t, w) => this.detectMondaySyndrome(t, w)],
      ['friday_carelessness', (t, w) => this.detectFridayCarelessness(t, w)],
      ['news_trading', (t, w) => this.detectNewsTrading(t, w, context)],
      ['strategy_degradation', (t, w) => this.detectStrategyDegradation(t, w)],
      ['style_drift', (t, w) => this.detectStyleDrift(t, w, context)],
    ];

    for (const [type, fn] of detectors) {
      const result = fn(newTrade, window);
      if (result.detected) {
        const pattern = this.toDetectedPattern(type, result, newTrade);
        if (pattern && this.isBeyondCooldown(type)) {
          patterns.push(pattern);
          this.lastDetected.set(type, new Date());
        }
      }
    }

    return patterns;
  }

  detectInteractions(patterns: DetectedPattern[]): PatternInteraction[] {
    const types = patterns.map((p) => p.type);
    const interactions: PatternInteraction[] = [];

    const has = (t: PatternType) => types.includes(t);

    if (has('revenge_trading') && has('overtrading')) {
      interactions.push({
        patterns: ['revenge_trading', 'overtrading'],
        combined_severity: 9,
        risk_multiplier: 2.0,
        description: 'Revenge trading combined with overtrading massively increases blow-up risk.',
      });
    }

    if (has('monday_syndrome') && has('friday_carelessness')) {
      interactions.push({
        patterns: ['monday_syndrome', 'friday_carelessness'],
        combined_severity: 7,
        risk_multiplier: 1.6,
        description: 'Both start-of-week and end-of-week performance issues detected.',
      });
    }

    if (has('news_trading') && has('position_sizing_error')) {
      interactions.push({
        patterns: ['news_trading', 'position_sizing_error'],
        combined_severity: 8,
        risk_multiplier: 1.8,
        description: 'High-risk news trading combined with sizing errors can cause large losses.',
      });
    }

    return interactions;
  }

  // === Individual pattern detectors (adapted from TAI prompt) ===

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

    const mondayWinRate = monday.filter((t) => t.pnl > 0).length / monday.length;
    const otherWinRate = otherDays.filter((t) => t.pnl > 0).length / otherDays.length;

    if (otherWinRate - mondayWinRate > 0.15) {
      const mondayLosses = monday.filter((t) => t.pnl < 0);

      return {
        detected: true,
        confidence: 0.75,
        severity: 5,
        cost: mondayLosses.reduce((sum, t) => sum + Math.abs(t.pnl), 0),
        tradesAffected: monday.map((t) => t.id),
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

    const friday = window.filter((t) => new Date(t.entry_time).getDay() === 5);
    const otherDays = window.filter((t) => {
      const day = new Date(t.entry_time).getDay();
      return day !== 5 && day !== 0 && day !== 6;
    });

    if (friday.length < 10 || otherDays.length < 30) return { detected: false };

    const fridayAfternoon = friday.filter((t) => new Date(t.entry_time).getHours() >= 14);
    if (fridayAfternoon.length < 5) return { detected: false };

    const fridayAfternoonWinRate =
      fridayAfternoon.filter((t) => t.pnl > 0).length / fridayAfternoon.length;
    const otherWinRate = otherDays.filter((t) => t.pnl > 0).length / otherDays.length;

    if (otherWinRate - fridayAfternoonWinRate > 0.2) {
      return {
        detected: true,
        confidence: 0.7,
        severity: 5,
        cost: fridayAfternoon
          .filter((t) => t.pnl < 0)
          .reduce((sum, t) => sum + Math.abs(t.pnl), 0),
        tradesAffected: fridayAfternoon.map((t) => t.id),
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
          "Review if you're following your plan on Friday afternoons",
        ],
      };
    }

    return { detected: false };
  }

  private detectNewsTrading(newTrade: Trade, _window: Trade[], _context?: UnifiedContext): PatternResult {
    const entryTime = new Date(newTrade.entry_time);
    const hour = entryTime.getHours();
    const minute = entryTime.getMinutes();

    const newsWindows = [
      { start: 14, end: 14.5, event: 'US Market Open / Economic Data' },
      { start: 18, end: 19, event: 'US Fed / Major Announcements' },
      { start: 20, end: 21, event: 'US Economic Data' },
    ];

    const timeDecimal = hour + minute / 60;
    const matchedWindow = newsWindows.find(
      (w) => timeDecimal >= w.start && timeDecimal <= w.end,
    );

    if (matchedWindow) {
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

    const strategyTrades = window.filter((t) => t.strategy === newTrade.strategy);
    if (strategyTrades.length < 20) return { detected: false };

    const midpoint = Math.floor(strategyTrades.length / 2);
    const olderTrades = strategyTrades.slice(midpoint);
    const newerTrades = strategyTrades.slice(0, midpoint);

    const olderWinRate = olderTrades.filter((t) => t.pnl > 0).length / olderTrades.length;
    const newerWinRate = newerTrades.filter((t) => t.pnl > 0).length / newerTrades.length;

    const olderAvgPnL =
      olderTrades.reduce((sum, t) => sum + t.pnl, 0) / olderTrades.length;
    const newerAvgPnL =
      newerTrades.reduce((sum, t) => sum + t.pnl, 0) / newerTrades.length;

    const winRateDecline = olderWinRate - newerWinRate;
    const pnlDecline = olderAvgPnL - newerAvgPnL;

    if (winRateDecline > 0.15 || (olderAvgPnL > 0 && newerAvgPnL < 0)) {
      return {
        detected: true,
        confidence: 0.8,
        severity: 8,
        cost: newerTrades
          .filter((t) => t.pnl < 0)
          .reduce((sum, t) => sum + Math.abs(t.pnl), 0),
        tradesAffected: newerTrades.map((t) => t.id),
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
          `Win rate dropped from ${Math.round(olderWinRate * 100)}% to ${Math.round(
            newerWinRate * 100,
          )}%`,
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
    const tradeStyle = this.inferTradeStyle(newTrade);

    if (tradeStyle && !preferredStyles.includes(tradeStyle)) {
      const recentTrades = window.slice(0, 10);
      const offStyleTrades = recentTrades.filter((t) => {
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
          tradesAffected: offStyleTrades.map((t) => t.id),
          metadata: {
            preferredStyles,
            detectedStyle: tradeStyle,
            offStyleCount: offStyleTrades.length,
            offStylePnL,
          },
          suggestions: [
            'You are drifting away from your declared trading style',
            'Off-style trades are often emotional and lower quality',
            'Recommit to your core style and avoid random trades',
            'Review your best and worst styles in the Strategy Analysis page',
          ],
        };
      }
    }

    return { detected: false };
  }

  private inferTradeStyle(trade: Trade): string | null {
    const duration = trade.duration_minutes ?? 0;

    if (duration < 15) return 'scalping';
    if (duration < 240) return 'day_trading';
    if (duration < 1440) return 'swing_trading';
    return 'position_trading';
  }

  private toDetectedPattern(
    type: PatternType,
    result: PatternResult,
    anchorTrade: Trade,
  ): DetectedPattern | null {
    if (!result.detected) return null;
    return {
      id: crypto.randomUUID(),
      type,
      severity: (result.severity as any) || 5,
      confidence: result.confidence ?? 0.6,
      cost: result.cost ?? 0,
      frequency: 1,
      tradesAffected: result.tradesAffected ?? [anchorTrade.id],
      metadata: result.metadata ?? {},
      suggestions: result.suggestions ?? [],
      detectedAt: new Date(),
    };
  }

  private isBeyondCooldown(type: PatternType): boolean {
    const last = this.lastDetected.get(type);
    if (!last) return true;
    return Date.now() - last.getTime() > this.COOLDOWN_MS;
  }
}

