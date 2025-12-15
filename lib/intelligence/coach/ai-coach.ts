import OpenAI from 'openai';
import { ChatMessage, CoachPersonality, UnifiedContext } from '../core/types';

interface CoachResponse {
  message: string;
  suggestedActions?: string[];
  followUpQuestions?: string[];
}

const PERSONALITIES: Record<string, CoachPersonality> = {
  balanced: {
    id: 'balanced',
    name: 'Balanced Coach',
    style: 'balanced',
    strictness: 6,
    encouragement: 7,
    technicalDepth: 7,
    humorLevel: 4,
    empathy: 7,
    directness: 6,
    responseLength: 'moderate',
    usesEmojis: false,
    usesMetaphors: true,
    focusAreas: ['risk', 'psychology', 'discipline', 'strategy'],
    systemPrompt:
      'You are a balanced, data-driven trading coach for TradeAutopsy. You combine empathy with strict risk management and clear, actionable guidance.',
  },
  drill_sergeant: {
    id: 'drill_sergeant',
    name: 'Drill Sergeant',
    style: 'drill_sergeant',
    strictness: 9,
    encouragement: 5,
    technicalDepth: 6,
    humorLevel: 2,
    empathy: 4,
    directness: 9,
    responseLength: 'brief',
    usesEmojis: false,
    usesMetaphors: false,
    focusAreas: ['discipline', 'risk'],
    systemPrompt:
      'You are a tough trading coach. You don\'t sugarcoat. You push traders to be disciplined, follow rules, and respect risk.',
  },
  mentor: {
    id: 'mentor',
    name: 'Mentor',
    style: 'mentor',
    strictness: 5,
    encouragement: 9,
    technicalDepth: 7,
    humorLevel: 5,
    empathy: 9,
    directness: 5,
    responseLength: 'detailed',
    usesEmojis: false,
    usesMetaphors: true,
    focusAreas: ['psychology', 'learning'],
    systemPrompt:
      'You are a calm, experienced trading mentor. You focus on mindset, learning, and long-term growth rather than quick wins.',
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

  async detectEmotion(_message: string) {
    // Simple placeholder - emotion is derived from context in engine
    return null;
  }

  async respond(
    message: string,
    context: UnifiedContext,
    history: ChatMessage[],
  ): Promise<CoachResponse> {
    if (this.openai) {
      return this.respondWithGPT(message, context, history);
    }
    return this.respondWithRules(message, context);
  }

  private async respondWithGPT(
    message: string,
    context: UnifiedContext,
    history: ChatMessage[],
  ): Promise<CoachResponse> {
    const systemPrompt = this.buildSystemPrompt(context);

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10).map((m) => ({
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

## TRADER SNAPSHOT
- Total Trades: ${context.metrics.totalTrades}
- Win Rate: ${(context.metrics.winRate * 100).toFixed(1)}%
- Profit Factor: ${context.metrics.profitFactor.toFixed(2)}
- Total P&L: ₹${context.metrics.totalPnL.toFixed(0)}
- Current Streak: ${context.metrics.currentStreak}
- Max Drawdown: ₹${context.metrics.maxDrawdown.toFixed(0)} (${(
      context.metrics.maxDrawdownPercent * 100
    ).toFixed(1)}%)
- Consistency Score: ${context.metrics.consistencyScore.toFixed(0)}/100

## TODAY
- Trades Today: ${context.todayTrades.length}
- Today P&L: ₹${context.todayTrades
      .reduce((s, t) => s + t.pnl, 0)
      .toFixed(0)}

## EMOTIONAL STATE
- Current: ${context.emotionalState.primary} (${(
      context.emotionalState.intensity * 100
    ).toFixed(0)}% intensity)

## COACHING RULES
- Use the data above in your guidance
- Be specific, actionable, and concise
- End with ONE concrete action item
- Use ₹ for currency
`;
  }

  private respondWithRules(message: string, context: UnifiedContext): CoachResponse {
    const lower = message.toLowerCase();

    if (
      context.emotionalState.intensity > 0.7 &&
      ['frustrated', 'anxious', 'fearful'].includes(context.emotionalState.primary)
    ) {
      return this.emotionalSupportResponse(context);
    }

    if (lower.includes('win rate')) {
      return this.winRateResponse(context);
    }

    if (lower.includes('risk') || lower.includes('danger')) {
      return this.riskAnalysisResponse(context);
    }

    if (lower.includes('improve') || lower.includes('better') || lower.includes('help')) {
      return this.improvementResponse(context);
    }

    return this.defaultResponse(context);
  }

  private emotionalSupportResponse(context: UnifiedContext): CoachResponse {
    const state = context.emotionalState;
    const message = `I can see you're ${state.primary} right now. This is a signal to protect your capital, not to push harder. Take a break, step away from the screen, and come back only to review—not to trade.`;

    return {
      message,
      suggestedActions: ['Take 30-minute break', 'Review journal instead of trading'],
    };
  }

  private winRateResponse(context: UnifiedContext): CoachResponse {
    const winRate = (context.metrics.winRate * 100).toFixed(1);
    const message = `Your current win rate is ${winRate}%. Focus on your best setups and cut out marginal trades. Consistency in execution will matter more than a high win rate alone.`;

    return {
      message,
      suggestedActions: ['Review top 3 setups', 'Stop trading after 2 consecutive losses'],
    };
  }

  private riskAnalysisResponse(context: UnifiedContext): CoachResponse {
    const message = `Your max drawdown is ₹${context.metrics.maxDrawdown.toFixed(
      0,
    )} and your risk score is ${context.currentRiskScore}/100. You should reduce size until drawdown recovers and set a hard daily loss limit.`;

    return {
      message,
      suggestedActions: ['Cut position size by 50%', 'Define daily loss limit in settings'],
    };
  }

  private improvementResponse(context: UnifiedContext): CoachResponse {
    const message = `To improve from here, focus on one lever at a time: tighten risk, refine entries, and eliminate emotional trades. Your consistency score of ${context.metrics.consistencyScore.toFixed(
      0,
    )}/100 shows there is room to stabilize your results.`;

    return {
      message,
      suggestedActions: ['Limit trades per day', 'Journal before and after each session'],
    };
  }

  private defaultResponse(context: UnifiedContext): CoachResponse {
    const message = `I can help you analyze your performance, risk, and behavior based on your TradeAutopsy data. Ask me about your win rate, drawdown, best strategies, or how to handle your current emotional state.`;

    return {
      message,
      suggestedActions: ['Ask about win rate', 'Ask about current risk'],
    };
  }

  private extractActions(_content: string): string[] {
    return [];
  }

  private generateFollowUpQuestions(_message: string, _content: string): string[] {
    return [];
  }
}
