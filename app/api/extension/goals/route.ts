import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Validate extension token and get user
async function validateExtensionToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', status: 401 }
  }
  
  const token = authHeader.replace('Bearer ', '').trim()
  
  if (!token || !token.startsWith('ta_')) {
    return { error: 'Invalid token format', status: 401 }
  }
  
  const supabase = await createClient()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, user_id')
    .eq('extension_token', token)
    .maybeSingle()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error validating token:', error)
    return { error: 'Token validation failed', status: 500 }
  }
  
  if (!profile) {
    return { error: 'Invalid or expired token', status: 401 }
  }
  
  const userId = profile.user_id || profile.id
  
  return { userId, supabase }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateExtensionToken(request)
    
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }
    
    const { userId, supabase } = authResult
    
    // Fetch active goals
    const { data: goals, error } = await supabase
      .from('goals')
      .select('id, name, title, goal_type, target_value, current_value, period, completed')
      .eq('user_id', userId)
      .eq('completed', false)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('Error fetching goals:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch goals' },
        { status: 500 }
      )
    }
    
    // Map goals with progress
    const goalsWithProgress = (goals || []).map(goal => {
      const current = Number(goal.current_value) || 0
      const target = Number(goal.target_value) || 0
      const progress = target > 0 
        ? Math.min(Math.round((current / target) * 100), 100)
        : 0
      
      return {
        id: goal.id,
        name: goal.name || goal.title || 'Untitled Goal',
        type: goal.goal_type || 'custom',
        period: goal.period || 'monthly',
        current: current,
        target: target,
        progress: progress,
      }
    })
    
    return NextResponse.json({
      success: true,
      goals: goalsWithProgress,
    })
    
  } catch (error: any) {
    console.error('GET /api/extension/goals error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
