import { NextRequest, NextResponse } from 'next/server';
import { workos } from '@/lib/workos';

export async function POST(request: NextRequest) {
  try {
    if (!workos) {
      return NextResponse.json(
        { error: 'WorkOS not configured. Please set WORKOS_API_KEY and WORKOS_CLIENT_ID.' },
        { status: 500 },
      );
    }

    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Send a 6-digit Magic Auth code via email.
    await workos.userManagement.sendMagicAuthCode({ email });

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
    });
  } catch (error: any) {
    console.error('[WorkOS] send-code error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification code' },
      { status: 500 },
    );
  }
}

