import { Trade } from '@/lib/intelligence/core/types'

export interface Tag {
  category: string
  value: string
  confidence: number
  auto_generated: boolean
}

export class AutoTagger {
  private static strategies = [
    'scalping',
    'day trading',
    'swing trading',
    'position trading',
    'momentum',
    'mean reversion',
    'breakout',
    'breakdown'
  ]

  private static marketConditions = [
    'trending up',
    'trending down',
    'ranging',
    'volatile',
    'low volatility',
    'high volume',
    'low volume'
  ]

  private static setups = [
    'pullback',
    'breakout',
    'breakdown',
    'reversal',
    'continuation',
    'gap up',
    'gap down',
    'failed breakout'
  ]

  static async generateTags(trade: Trade, previousTrades: Trade[] = []): Promise<Tag[]> {
    const tags: Tag[] = []

    // Tag outcome
    tags.push({
      category: 'outcome',
      value: trade.pnl > 0 ? 'win' : trade.pnl < 0 ? 'loss' : 'breakeven',
      confidence: 1.0,
      auto_generated: true,
    })

    // Tag strategy (from trade strategy field or notes)
    if (trade.strategy) {
      tags.push({
        category: 'strategy',
        value: trade.strategy.toLowerCase(),
        confidence: 1.0,
        auto_generated: true,
      })
    }

    // Tag based on holding time
    const holdingMinutes = trade.duration_minutes || 
      (trade.exit_time && trade.entry_time
        ? (new Date(trade.exit_time).getTime() - new Date(trade.entry_time).getTime()) / 60000
        : 0)

    if (holdingMinutes < 5) {
      tags.push({
        category: 'timeframe',
        value: 'scalping',
        confidence: 0.9,
        auto_generated: true,
      })
    } else if (holdingMinutes < 240) {
      tags.push({
        category: 'timeframe',
        value: 'intraday',
        confidence: 0.8,
        auto_generated: true,
      })
    } else if (holdingMinutes < 1440) {
      tags.push({
        category: 'timeframe',
        value: 'day trading',
        confidence: 0.8,
        auto_generated: true,
      })
    } else {
      tags.push({
        category: 'timeframe',
        value: 'swing trading',
        confidence: 0.7,
        auto_generated: true,
      })
    }

    // Tag based on risk-reward
    if (trade.stop_loss && trade.target && trade.entry_price) {
      const risk = Math.abs(trade.entry_price - trade.stop_loss)
      const reward = Math.abs(trade.target - trade.entry_price)
      const rr = reward / risk
      
      if (rr >= 2) {
        tags.push({
          category: 'risk_management',
          value: 'good risk-reward',
          confidence: 0.9,
          auto_generated: true,
        })
      } else if (rr < 1) {
        tags.push({
          category: 'risk_management',
          value: 'poor risk-reward',
          confidence: 0.9,
          auto_generated: true,
        })
      }
    }

    // Tag emotions from notes
    if (trade.notes) {
      const emotions = this.detectEmotions(trade.notes)
      tags.push(...emotions)
    }

    // Tag based on symbol patterns
    if (trade.symbol) {
      const symbol = trade.symbol.toUpperCase()
      if (symbol.includes('NIFTY') || symbol.includes('BANKNIFTY')) {
        tags.push({
          category: 'instrument',
          value: 'index',
          confidence: 1.0,
          auto_generated: true,
        })
      }
      if (symbol.includes('CE') || symbol.includes('PE')) {
        tags.push({
          category: 'instrument',
          value: 'options',
          confidence: 1.0,
          auto_generated: true,
        })
      }
    }

    // Tag time of day
    if (trade.entry_time) {
      const hour = new Date(trade.entry_time).getHours()
      if (hour >= 9 && hour < 12) {
        tags.push({
          category: 'time',
          value: 'morning',
          confidence: 1.0,
          auto_generated: true,
        })
      } else if (hour >= 12 && hour < 15) {
        tags.push({
          category: 'time',
          value: 'afternoon',
          confidence: 1.0,
          auto_generated: true,
        })
      } else if (hour >= 15 && hour < 16) {
        tags.push({
          category: 'time',
          value: 'closing',
          confidence: 1.0,
          auto_generated: true,
        })
      }
    }

    return tags
  }

  private static detectEmotions(text: string): Tag[] {
    const emotions: Tag[] = []
    const lowerText = text.toLowerCase()
    
    const emotionKeywords = {
      fear: ['scared', 'afraid', 'nervous', 'anxious', 'worried', 'fear'],
      greed: ['greedy', 'wanted more', 'held too long', 'fomo', 'greed'],
      discipline: ['stuck to plan', 'followed rules', 'disciplined', 'patient', 'plan'],
      confidence: ['confident', 'sure', 'certain', 'strong conviction', 'confident'],
      frustration: ['frustrated', 'angry', 'annoyed', 'irritated', 'frustration'],
      revenge: ['revenge', 'get back', 'make it back', 'prove', 'revenge trading'],
    }

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          emotions.push({
            category: 'emotion',
            value: emotion,
            confidence: 0.7,
            auto_generated: true,
          })
          break
        }
      }
    }

    return emotions
  }
}
