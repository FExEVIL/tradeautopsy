import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('strategy_templates')
      .select('*')
      .order('name');

    if (error) throw error;

    return NextResponse.json({ templates: data });
  } catch (error: any) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
