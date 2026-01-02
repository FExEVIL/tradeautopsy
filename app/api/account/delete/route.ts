import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Check WorkOS auth (fallback)
    const workosUserId = cookieStore.get('workos_user_id')?.value
    
    if (authError || (!user && !workosUserId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { confirmation, password } = await request.json()

    // Validate confirmation
    if (confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Invalid confirmation' },
        { status: 400 }
      )
    }

    const effectiveUserId = user?.id || workosUserId

    // Verify password if Supabase user
    if (user && password) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password,
      })

      if (verifyError) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        )
      }
    }

    // Delete all user data (cascading deletes should handle related data)
    // Delete trades
    await supabase
      .from('trades')
      .delete()
      .eq('user_id', effectiveUserId)

    // Delete profiles
    await supabase
      .from('profiles')
      .delete()
      .eq('user_id', effectiveUserId)

    // Delete goals
    await supabase
      .from('goals')
      .delete()
      .eq('user_id', effectiveUserId)

    // Delete trading rules
    await supabase
      .from('trading_rules')
      .delete()
      .eq('user_id', effectiveUserId)

    // Delete rule violations
    await supabase
      .from('rule_violations')
      .delete()
      .eq('user_id', effectiveUserId)

    // Delete rule adherence stats
    await supabase
      .from('rule_adherence_stats')
      .delete()
      .eq('user_id', effectiveUserId)

    // Delete automation preferences
    await supabase
      .from('automation_preferences')
      .delete()
      .eq('user_id', effectiveUserId)

    // Delete user preferences
    await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', effectiveUserId)

    // Delete notifications
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', effectiveUserId)

    // Delete audio journal entries
    await supabase
      .from('audio_journal_entries')
      .delete()
      .eq('user_id', effectiveUserId)

    // Delete ML insights
    await supabase
      .from('ml_insights')
      .delete()
      .eq('user_id', effectiveUserId)

    // Delete brokers
    await supabase
      .from('brokers')
      .delete()
      .eq('user_id', effectiveUserId)

    // Delete broker profiles
    await supabase
      .from('broker_profiles')
      .delete()
      .eq('user_id', effectiveUserId)

    // Delete auth account (Supabase)
    if (user) {
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(user.id)
      if (deleteAuthError) {
        console.error('[Delete Account] Auth deletion error:', deleteAuthError)
        // Continue even if auth deletion fails (user might be WorkOS only)
      }
    }

    // Clear all cookies
    cookieStore.delete('workos_user_id')
    cookieStore.delete('workos_access_token')
    cookieStore.delete('workos_profile_id')
    cookieStore.delete('active_profile_id')

    // Log deletion for audit (optional - you might want to store this in a separate audit table)
    console.log(`[Delete Account] User ${effectiveUserId} account deleted`)

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })

  } catch (error: any) {
    console.error('[Delete Account] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account', details: error.message },
      { status: 500 }
    )
  }
}

