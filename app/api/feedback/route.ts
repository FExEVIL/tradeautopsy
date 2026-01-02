import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()
    
    // Get current user (optional - feedback can be anonymous)
    const { data: { user } } = await supabase.auth.getUser()
    const workosUserId = cookieStore.get('workos_user_id')?.value
    const userId = user?.id || workosUserId

    const body = await request.json()
    const {
      type,
      title,
      description,
      importance,
      steps,
      expected,
      actual,
      rating,
      nps,
      likes,
      improvements,
      email,
      url,
      userAgent,
      timestamp,
    } = body

    // Validate required fields based on type
    if (!type) {
      return NextResponse.json(
        { error: 'Feedback type is required' },
        { status: 400 }
      )
    }

    // Insert feedback into database
    const { data: feedback, error } = await supabase
      .from('feedback')
      .insert({
        user_id: userId || null,
        type,
        title: title || null,
        description: description || null,
        importance: importance || null,
        steps: steps || null,
        expected: expected || null,
        actual: actual || null,
        rating: rating || null,
        nps: nps || null,
        likes: likes || null,
        improvements: improvements || null,
        email: email || null,
        url: url || null,
        user_agent: userAgent || null,
        metadata: {
          timestamp: timestamp || new Date().toISOString(),
        },
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      // If feedback table doesn't exist, log to console (for development)
      console.error('[Feedback] Database error:', error)
      
      // In production, you might want to send to an external service
      // For now, we'll return success even if DB insert fails
      // (allows feedback widget to work before migration is run)
      console.log('[Feedback] Feedback received:', {
        type,
        title,
        description,
        userId,
        url,
      })

      return NextResponse.json({
        success: true,
        message: 'Feedback received (logged for review)',
      })
    }

    // Optional: Send email notification to admin
    // You can add email notification here if needed

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      id: feedback?.id,
    })

  } catch (error: any) {
    console.error('[Feedback] Error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback', details: error.message },
      { status: 500 }
    )
  }
}

