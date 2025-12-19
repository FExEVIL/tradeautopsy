import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// ✅ Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[API] Fetching backtest result...');

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[API] Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const { id } = await params;

    console.log(`[API] Fetching result ${id} for user ${user.id}`);

    const { data, error } = await supabase
      .from('backtest_results')
      .select('*, backtest_configs(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('[API] Database error:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500, headers: corsHeaders }
      );
    }

    if (!data) {
      console.error('[API] Result not found');
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    console.log('[API] Successfully fetched result');

    return NextResponse.json(data, { headers: corsHeaders });
  } catch (error: any) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
