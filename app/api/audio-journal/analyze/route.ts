import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Comprehensive AI analysis of audio journal transcript
 * Extracts: tags, emotions, mistakes, goals, behavioral patterns
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { transcript, tradeId } = await request.json()
    
    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 })
    }

    console.log('[Analyze] Analyzing transcript for trade:', tradeId)

    // Get current profile
    const { getCurrentProfileId } = await import('@/lib/profile-utils')
    const profileId = await getCurrentProfileId(user.id)

    // COMPREHENSIVE AI ANALYSIS
    let analysis: any = {
      summary: '',
      autoTags: [],
      emotions: [],
      mistakes: [],
      goals: [],
      behavioralPatterns: [],
      insights: []
    }

    if (process.env.OPENAI_API_KEY) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert trading psychology analyst. Analyze the trader's voice note and provide comprehensive insights.

Your analysis MUST include:
1. **Summary** (2-3 sentences)
2. **Auto-tags** (5-10 relevant tags like "breakout", "support-resistance", "entry-timing", "risk-management", "emotion-control", etc.)
3. **Emotions** (detected emotional states: "calm", "anxious", "confident", "fearful", "greedy", "disciplined", etc.)
4. **Mistakes** (any trading errors mentioned or implied)
5. **Goals** (any goals or intentions mentioned)
6. **Behavioral Patterns** (revenge trading, FOMO, overconfidence, etc.)
7. **Insights** (key takeaways and recommendations)

Format your response as JSON:
{
  "summary": "Brief summary",
  "autoTags": ["tag1", "tag2", "tag3"],
  "emotions": ["emotion1", "emotion2"],
  "mistakes": [
    {
      "type": "mistake_type",
      "description": "what went wrong",
      "severity": "low|medium|high|critical",
      "financialImpact": -1000
    }
  ],
  "goals": [
    {
      "goal": "goal description",
      "category": "risk-management|strategy|discipline|learning",
      "priority": "low|medium|high"
    }
  ],
  "behavioralPatterns": ["pattern1", "pattern2"],
  "insights": ["insight1", "insight2"]
}`
            },
            {
              role: 'user',
              content: `Analyze this trading journal entry: "${transcript}"`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        })

        analysis = JSON.parse(completion.choices[0].message.content || '{}')
        
        console.log('[Analyze] AI Analysis complete:', {
          tagsCount: analysis.autoTags?.length || 0,
          mistakesCount: analysis.mistakes?.length || 0,
          goalsCount: analysis.goals?.length || 0,
        })
      } catch (openaiError: any) {
        console.error('[Analyze] OpenAI error:', openaiError)
        // Fallback analysis
        analysis = {
          summary: transcript.substring(0, 200) + '...',
          autoTags: [],
          emotions: [],
          mistakes: [],
          goals: [],
          behavioralPatterns: [],
          insights: []
        }
      }
    } else {
      // Fallback if no API key
      analysis = {
        summary: transcript.substring(0, 200) + '...',
        autoTags: [],
        emotions: [],
        mistakes: [],
        goals: [],
        behavioralPatterns: [],
        insights: []
      }
    }

    // AUTO-SAVE MISTAKES to database
    if (analysis.mistakes && analysis.mistakes.length > 0) {
      for (const mistake of analysis.mistakes) {
        try {
          await supabase.from('mistakes').insert({
            user_id: user.id,
            profile_id: profileId,
            trade_id: tradeId || null,
            mistake_type: mistake.type || 'general',
            description: mistake.description,
            severity: mistake.severity || 'medium',
            financial_impact: mistake.financialImpact || 0,
            first_occurred_at: new Date().toISOString(),
            last_occurred_at: new Date().toISOString(),
          })
        } catch (mistakeError) {
          console.error('[Analyze] Error saving mistake:', mistakeError)
          // Continue even if mistake save fails
        }
      }
      console.log(`[Analyze] Saved ${analysis.mistakes.length} mistakes`)
    }

    // AUTO-ADD GOALS
    if (analysis.goals && analysis.goals.length > 0) {
      for (const goalData of analysis.goals) {
        try {
          await supabase.from('goals').insert({
            user_id: user.id,
            profile_id: profileId,
            title: goalData.goal,
            goal_type: goalData.category || 'behavioral',
            priority: goalData.priority || 'medium',
            completed: false,
            source: 'ai_audio_analysis',
          })
        } catch (goalError) {
          console.error('[Analyze] Error creating goal:', goalError)
          // Continue even if goal creation fails
        }
      }
      console.log(`[Analyze] Created ${analysis.goals.length} goals`)
    }

    return NextResponse.json(analysis)

  } catch (error: any) {
    console.error('[Analyze] Error:', error)
    return NextResponse.json(
      { error: 'Analysis failed', details: error.message },
      { status: 500 }
    )
  }
}
