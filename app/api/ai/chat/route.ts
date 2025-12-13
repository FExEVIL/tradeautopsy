import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// AI chat with OpenAI GPT-4 support (falls back to rule-based if not configured)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, context } = await request.json()

    // Try OpenAI if configured
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (openaiApiKey) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: `You are a professional trading coach AI assistant for TradeAutopsy. Help users improve their trading performance by analyzing their data and providing actionable advice. Be concise, specific, and encouraging.`
              },
              {
                role: 'user',
                content: `User question: ${message}\n\nContext: ${JSON.stringify(context || {})}`
              }
            ],
            max_tokens: 500,
            temperature: 0.7
          })
        })

        if (openaiResponse.ok) {
          const data = await openaiResponse.json()
          const aiResponse = data.choices?.[0]?.message?.content
          if (aiResponse) {
            return NextResponse.json({ response: aiResponse })
          }
        }
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError)
        // Fall through to rule-based responses
      }
    }

    // Fallback to rule-based responses
    let response = ''

    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('win rate') || lowerMessage.includes('winrate')) {
      const winRate = context.recentTrades.length > 0
        ? (context.recentTrades.filter((t: any) => parseFloat(String(t.pnl || '0')) > 0).length / context.recentTrades.length * 100).toFixed(1)
        : '0'
      response = `Your current win rate is ${winRate}%. A good win rate is typically 50-60% for day trading. Focus on improving entry quality and following your trading plan consistently.`
    } else if (lowerMessage.includes('pattern') || lowerMessage.includes('behavior')) {
      const patternCount = context.insights?.length || 0
      response = `I've detected ${patternCount} behavioral patterns in your recent trading. Review the Pattern Library page for detailed analysis and specific steps to improve.`
    } else if (lowerMessage.includes('overtrad') || lowerMessage.includes('too many')) {
      response = 'Overtrading is a common issue. Set a daily limit of 3-5 trades and stick to it. Quality over quantity - focus on your best setups only.'
    } else if (lowerMessage.includes('risk') || lowerMessage.includes('dangerous')) {
      response = 'Check the Risk Management dashboard for detailed metrics. Key things to watch: Max Drawdown should be under 20%, Sharpe Ratio above 1.0, and maintain consistent position sizing.'
    } else if (lowerMessage.includes('revenge') || lowerMessage.includes('loss')) {
      response = 'After a loss, take a 15-minute break before trading again. Set a daily loss limit and stop when you hit it. Journal your emotions to understand what triggers revenge trading.'
    } else {
      response = 'I can help you analyze your trading patterns, improve your win rate, manage risk, and overcome behavioral issues. Ask me specific questions about your performance or check the insights I\'ve generated for you.'
    }

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    )
  }
}

