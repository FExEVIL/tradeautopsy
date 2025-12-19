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

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Fetching strategy templates...');

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('strategy_templates')
      .select('*')
      .order('name');

    if (error) {
      console.error('[API] Database error:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(`[API] Successfully fetched ${data?.length || 0} templates`);

    return NextResponse.json(
      { templates: data || [] },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
