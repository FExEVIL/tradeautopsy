import {
  Insight,
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
  fromPattern(pattern: DetectedPattern, context: UnifiedContext): Insight {
    const template = this.getPatternTemplate(pattern.type);
    const historicalCost = this.calculateHistoricalCost(pattern.type, context);

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

  generateML(features: FeatureMatrix, metrics: Metrics, patterns: DetectedPattern[]): Insight[] {
    const insights: Insight[] = [];

    const timeInsight = this.generateTimeInsight(features, metrics);
    if (timeInsight) insights.push(timeInsight);

    const strategyInsight = this.generateStrategyInsight(features, metrics);
    if (strategyInsight) insights.push(strategyInsight);

    const riskInsights = this.generateRiskInsights(metrics, patterns);
    insights.push(...riskInsights);

    const symbolInsight = this.generateSymbolInsight(features);
    if (symbolInsight) insights.push(symbolInsight);

    const consistencyInsight = this.generateConsistencyInsight(metrics);
    if (consistencyInsight) insights.push(consistencyInsight);

    const edgeInsight = this.generateEdgeInsight(metrics);
    if (edgeInsight) insights.push(edgeInsight);

    return insights.sort(
      (a, b) => b.confidence * b.impactScore - a.confidence * a.impactScore,
    );
  }

  private generateTimeInsight(features: FeatureMatrix, metrics: Metrics): Insight | null {
    const hourlyRates = features.hourlyWinRates;
    if (!hourlyRates || Object.keys(hourlyRates).length < 3) return null;

    const entries = Object.entries(hourlyRates);
    const sorted = entries.sort((a, b) => b[1] - a[1]);

    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    if (!best || !worst) return null;

    const improvement = best[1] - metrics.winRate;
    if (improvement < 0.05) return null;

    return {
      id: crypto.randomUUID(),
      type: 'ml_insight',
      category: 'opportunity',
      severity: 'info',
      priority: 6,
      title: 'Time Optimization Opportunity',
      message: `Your win rate during ${best[0]} is ${(best[1] * 100).toFixed(0)}% vs ${(metrics.winRate * 100).toFixed(0)}% overall. Focusing on this time window could improve results by ${(improvement * 100).toFixed(0)}%.`,
      explanation: `Analysis of your trading times shows significant performance variation. Your best time is ${best[0]} (${(best[1] * 100).toFixed(0)}% win rate) while ${worst[0]} is your weakest (${(worst[1] * 100).toFixed(0)}% win rate).`,
      confidence: Math.min(0.7 + Object.keys(hourlyRates).length * 0.02, 0.9),
      impactScore: improvement * metrics.totalPnL,
      data: { bestTime: best[0], worstTime: worst[0], bestWinRate: best[1], worstWinRate: worst[1] },
      actions: [
        {
          id: '1',
          label: 'Focus on best hours',
          description: `Prioritize trading during ${best[0]}`,
          type: 'execute',
        },
        {
          id: '2',
          label: 'Reduce worst hours',
          description: `Consider skipping or reducing size during ${worst[0]}`,
          type: 'execute',
        },
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
      title: 'Strategy Performance Analysis',
      message: `"${best[0]}" is your best strategy (avg ₹${best[1].avgPnL.toFixed(0)}, ${(best[1].winRate * 100).toFixed(0)}% win rate) while "${worst[0]}" ${
        worst[1].avgPnL < 0 ? 'is losing money' : 'underperforms'
      } (avg ₹${worst[1].avgPnL.toFixed(0)}).`,
      explanation: `Based on ${best[1].tradeCount} trades with "${best[0]}" and ${
        worst[1].tradeCount
      } trades with "${worst[0]}", there's a clear performance difference of ₹${spread.toFixed(
        0,
      )} per trade on average.`,
      confidence: Math.min(0.6 + (best[1].tradeCount / 100) * 0.2, 0.9),
      impactScore: spread * 10,
      data: {
        bestStrategy: best[0],
        worstStrategy: worst[0],
        bestStats: best[1],
        worstStats: worst[1],
      },
      actions: [
        {
          id: '1',
          label: 'Double down on winner',
          description: `Allocate more capital to "${best[0]}"`,
          type: 'execute',
        },
        {
          id: '2',
          label: 'Review underperformer',
          description: `Analyze why "${worst[0]}" is underperforming`,
          type: 'navigate',
        },
      ],
      acknowledged: false,
      createdAt: new Date(),
    };
  }

  private generateRiskInsights(metrics: Metrics, patterns: DetectedPattern[]): Insight[] {
    const insights: Insight[] = [];

    if (metrics.profitFactor < 1.2) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'ml_insight',
        category: 'risk',
        severity: metrics.profitFactor < 1 ? 'critical' : 'warning',
        priority: 9,
        title: 'Profit Factor Alert',
        message: `Your profit factor is ${metrics.profitFactor.toFixed(2)} ${
          metrics.profitFactor < 1 ? '(losing money)' : '(barely profitable)'
        }. Target is above 1.5.`,
        explanation:
          "Profit factor measures gross profit divided by gross loss. Below 1 means you're losing money overall. Above 1.5 indicates a healthy edge.",
        confidence: 0.95,
        impactScore: Math.abs(metrics.grossLoss) * 0.3,
        data: {
          profitFactor: metrics.profitFactor,
          grossProfit: metrics.grossProfit,
          grossLoss: metrics.grossLoss,
        },
        actions: [
          { id: '1', label: 'Reduce average loss', description: 'Tighten stop losses', type: 'execute' },
          { id: '2', label: 'Increase average win', description: 'Let winners run longer', type: 'execute' },
        ],
        acknowledged: false,
        createdAt: new Date(),
      });
    }

    if (metrics.ruleFollowedRate < 0.8) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'ml_insight',
        category: 'behavior',
        severity: 'warning',
        priority: 8,
        title: 'Discipline Alert',
        message: `Your rule-following rate is ${(metrics.ruleFollowedRate * 100).toFixed(
          0,
        )}%. Breaking rules correlates with losses.`,
        explanation:
          "Traders who follow their rules consistently tend to be more profitable. Rule violations often happen during emotional states.",
        confidence: 0.85,
        impactScore: metrics.totalTrades * 100,
        data: { ruleFollowedRate: metrics.ruleFollowedRate },
        actions: [
          {
            id: '1',
            label: 'Review rule violations',
            description: "Identify which rules you're breaking",
            type: 'navigate',
          },
          {
            id: '2',
            label: 'Simplify rules',
            description: 'Make rules easier to follow',
            type: 'execute',
          },
        ],
        acknowledged: false,
        createdAt: new Date(),
      });
    }

    if (metrics.maxDrawdownPercent > 0.15) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'ml_insight',
        category: 'risk',
        severity: metrics.maxDrawdownPercent > 0.25 ? 'critical' : 'warning',
        priority: 9,
        title: 'Drawdown Alert',
        message: `Your max drawdown is ${(metrics.maxDrawdownPercent * 100).toFixed(
          1,
        )}%. This is ${
          metrics.maxDrawdownPercent > 0.2 ? 'dangerously high' : 'above recommended levels'
        }.`,
        explanation:
          'Professional traders typically keep max drawdown under 15-20%. Large drawdowns require exponentially larger gains to recover.',
        confidence: 0.95,
        impactScore: metrics.maxDrawdown,
        data: {
          maxDrawdown: metrics.maxDrawdown,
          maxDrawdownPercent: metrics.maxDrawdownPercent,
        },
        actions: [
          {
            id: '1',
            label: 'Reduce position size',
            description: 'Cut size by 50% until drawdown recovers',
            type: 'execute',
          },
          {
            id: '2',
            label: 'Set daily loss limit',
            description: 'Stop trading after X% loss per day',
            type: 'execute',
          },
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
    const worst = sorted.slice(-3).filter((s) => s[1].avgPnL < 0);
    if (worst.length === 0) return null;

    return {
      id: crypto.randomUUID(),
      type: 'ml_insight',
      category: 'strategy',
      severity: 'info',
      priority: 5,
      title: 'Symbol Performance Analysis',
      message: `Best symbols: ${best.map((b) => b[0]).join(', ')}. Consider avoiding: ${
        worst.map((w) => w[0]).join(', ')
      }.`,
      explanation: `Your top performers are ${best
        .map((b) => `${b[0]} (₹${b[1].avgPnL.toFixed(0)}/trade)`)
        .join(', ')}. Meanwhile, ${worst
        .map((w) => w[0])
        .join(', ')} are costing you money.`,
      confidence: 0.7,
      impactScore: worst.reduce((sum, w) => sum + Math.abs(w[1].totalPnL), 0),
      data: { bestSymbols: best, worstSymbols: worst },
      actions: [
        {
          id: '1',
          label: 'Focus on winners',
          description: 'Trade your best symbols more',
          type: 'execute',
        },
        {
          id: '2',
          label: 'Review losers',
          description: "Understand why certain symbols don't work for you",
          type: 'navigate',
        },
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
      title: 'Consistency Improvement Opportunity',
      message: `Your consistency score is ${metrics.consistencyScore}/100. Improving consistency will stabilize your equity curve.`,
      explanation:
        'Consistency is measured based on the variability of your daily results. Large swings up and down indicate unstable execution or risk management.',
      confidence: 0.8,
      impactScore: Math.abs(metrics.totalPnL) * 0.2,
      data: { consistencyScore: metrics.consistencyScore },
      actions: [
        {
          id: '1',
          label: 'Reduce size after losses',
          description: 'Cut risk after a losing day to stabilize results',
          type: 'execute',
        },
        {
          id: '2',
          label: 'Limit daily trades',
          description: 'Cap number of trades per day to reduce noise',
          type: 'execute',
        },
      ],
      acknowledged: false,
      createdAt: new Date(),
    };
  }

  private generateEdgeInsight(metrics: Metrics): Insight | null {
    if (metrics.expectancy <= 0) return null;

    return {
      id: crypto.randomUUID(),
      type: 'ml_insight',
      category: 'performance',
      severity: 'success',
      priority: 4,
      title: 'Positive Edge Detected',
      message: `Your expectancy is ₹${metrics.expectancy.toFixed(
        0,
      )} per trade. This means you're making money on average per trade.`,
      explanation:
        'Expectancy combines win rate and average win/loss. A positive expectancy indicates a statistical edge. The goal is to scale this edge while controlling risk.',
      confidence: 0.9,
      impactScore: metrics.expectancy * metrics.totalTrades,
      data: { expectancy: metrics.expectancy, winRate: metrics.winRate },
      actions: [
        {
          id: '1',
          label: 'Scale gradually',
          description: 'Increase position size slowly while monitoring drawdown',
          type: 'execute',
        },
      ],
      acknowledged: false,
      createdAt: new Date(),
    };
  }

  private getPatternTemplate(type: PatternType): InsightTemplate {
    const templates: Record<PatternType, InsightTemplate> = {
      revenge_trading: {
        title: 'Revenge Trading Detected',
        message:
          'Revenge trades have cost you approximately ₹{{cost}} in this period (historical cost: ₹{{historicalCost}}).',
        severity: 'critical',
        category: 'behavior',
        actions: ['Set strict daily loss limit', 'Pause trading after big loss'],
      },
      fomo: {
        title: 'FOMO Trading Pattern',
        message:
          'Fear of missing out trades are appearing frequently ({{occurrences}} times). They are eroding your edge.',
        severity: 'warning',
        category: 'behavior',
        actions: ['Define A+ setup checklist', 'Only trade pre-planned setups'],
      },
      fear_of_loss: {
        title: 'Fear of Loss Detected',
        message:
          'You are cutting winners too early and letting losers run. This fear pattern is reducing your profit potential.',
        severity: 'warning',
        category: 'psychology',
        actions: ['Move stop to breakeven, not exit early', 'Use alerts instead of watching P&L'],
      },
      overconfidence: {
        title: 'Overconfidence Warning',
        message:
          'After winning streaks, your risk and trade frequency increase, leading to give-back of profits.',
        severity: 'warning',
        category: 'behavior',
        actions: ['Reduce size after streaks', 'Set maximum trades per day'],
      },
      tilt: {
        title: 'Tilt Detected',
        message: 'Emotional trading detected. Recent decisions are deviating from your plan.',
        severity: 'critical',
        category: 'behavior',
        actions: ['Take a mandatory break', 'Journal emotions before trading'],
      },
      overtrading: {
        title: 'Overtrading Pattern',
        message: 'High trade count with declining performance indicates overtrading behavior.',
        severity: 'warning',
        category: 'behavior',
        actions: ['Set daily trade cap', 'Pre-select maximum setups per day'],
      },
      revenge_sizing: {
        title: 'Revenge Sizing Detected',
        message:
          'Position sizes are increasing after losses, which has historically cost you ₹{{historicalCost}}.',
        severity: 'critical',
        category: 'risk',
        actions: ['Fix risk per trade', 'Use checklist before increasing size'],
      },
      loss_aversion: {
        title: 'Loss Aversion Pattern',
        message:
          'You are holding losing trades too long and cutting winners quickly, which is skewing your payoff ratio.',
        severity: 'warning',
        category: 'behavior',
        actions: ['Use predefined exit rules', 'Track average win vs loss'],
      },
      position_sizing_error: {
        title: 'Position Sizing Issues',
        message: 'Inconsistent position sizes are increasing your risk and volatility.',
        severity: 'warning',
        category: 'risk',
        actions: ['Standardize risk per trade', 'Use position sizing calculator'],
      },
      correlation_exposure: {
        title: 'Correlation Risk High',
        message: 'Multiple positions in correlated symbols are increasing portfolio risk.',
        severity: 'warning',
        category: 'risk',
        actions: ['Limit correlated positions', 'Diversify instruments'],
      },
      time_decay: {
        title: 'Time Decay Pattern',
        message: 'Holding trades too long is leading to time decay in performance.',
        severity: 'info',
        category: 'strategy',
        actions: ['Set maximum holding time', 'Review intraday vs swing results'],
      },
      monday_syndrome: {
        title: 'Monday Syndrome',
        message: 'Your Monday performance is significantly worse than other days.',
        severity: 'warning',
        category: 'behavior',
        actions: ['Trade smaller on Mondays', 'Start week with observation only'],
      },
      friday_carelessness: {
        title: 'Friday Carelessness',
        message: 'Friday afternoon trades show degraded performance and higher losses.',
        severity: 'warning',
        category: 'behavior',
        actions: ['Stop trading early on Fridays', 'Avoid revenge trades before weekend'],
      },
      news_trading: {
        title: 'News Trading Risk',
        message: 'Trades around major news events show abnormal volatility and risk.',
        severity: 'warning',
        category: 'risk',
        actions: ['Avoid trading during major news', 'Use smaller size and wider stops'],
      },
      strategy_degradation: {
        title: 'Strategy Degradation',
        message:
          'A previously profitable strategy now shows declining performance. Recent trades are underperforming older ones.',
        severity: 'warning',
        category: 'strategy',
        actions: ['Pause this strategy', 'Re-evaluate edge with backtests'],
      },
      style_drift: {
        title: 'Style Drift Detected',
        message:
          'Recent trades do not match your declared trading style, leading to unpredictable results.',
        severity: 'warning',
        category: 'behavior',
        actions: ['Recommit to core style', 'Create checklist for acceptable setups'],
      },
      plan_deviation: {
        title: 'Plan Deviation Pattern',
        message:
          'Trades frequently deviate from your pre-market plan, which is reducing performance consistency.',
        severity: 'warning',
        category: 'behavior',
        actions: ['Tighten rule enforcement', 'Journal plan vs execution daily'],
      },
    };

    return templates[type];
  }

  private calculateHistoricalCost(type: PatternType, context: UnifiedContext): number {
    const history = context.patternHistory.filter((p) => p.type === type);
    return history.reduce((sum, p) => sum + p.cost, 0);
  }

  private interpolate(template: string, data: Record<string, any>): string {
    return template.replace(/{{(\w+)}}/g, (_, key) => {
      const value = data[key];
      return typeof value === 'number' ? value.toString() : value ?? '';
    });
  }

  private adjustSeverity(
    base: Insight['severity'],
    patternSeverity: DetectedPattern['severity'],
  ): Insight['severity'] {
    if (patternSeverity >= 8) return 'critical';
    if (patternSeverity >= 5) return base === 'info' ? 'warning' : base;
    return base;
  }
}
