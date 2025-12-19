import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// ✅ Add CORS headers for client-side requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ✅ Handle OPTIONS requests (preflight)
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    // ✅ Add detailed error logging
    console.log('[API] Fetching backtest results...');

    const supabase = await createClient();
    
    // ✅ Better auth error handling
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('[API] Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message },
        { status: 401, headers: corsHeaders }
      );
    }

    if (!user) {
      console.error('[API] No user found');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401, headers: corsHeaders }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    console.log(`[API] Fetching results for user ${user.id}, limit: ${limit}`);

    let query = supabase
      .from('backtest_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[API] Database error:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(`[API] Successfully fetched ${data?.length || 0} results`);

    return NextResponse.json(
      { results: data || [] },
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
