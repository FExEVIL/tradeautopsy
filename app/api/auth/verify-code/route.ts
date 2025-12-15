import { NextRequest, NextResponse } from 'next/server';
import { workos, WORKOS_CLIENT_ID } from '@/lib/workos';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    if (!workos) {
      return NextResponse.json(
        { error: 'WorkOS not configured. Please set WORKOS_API_KEY and WORKOS_CLIENT_ID.' },
        { status: 500 },
      );
    }

    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 },
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    // 1) Authenticate with WorkOS Magic Auth to get the WorkOS user
    const { user } = await workos.userManagement.authenticateWithMagicAuth({
      email,
      code,
      clientId: WORKOS_CLIENT_ID,
      ipAddress,
      userAgent,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 },
      );
    }

    // 2) Get or create corresponding Supabase auth user + profile
    const supabase = await createClient();

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let adminSupabase: any = null;

    if (serviceKey) {
      const { createClient: createAdminClient } = await import('@supabase/supabase-js');
      adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
      );
    }

    let userId: string | null = null;
    let profileId: string | null = null;

    // Check for existing profile by workos_user_id
    const { data: existingProfileByWorkOS } = await supabase
      .from('profiles')
      .select('*')
      .eq('workos_user_id', user.id)
      .maybeSingle();

    if (existingProfileByWorkOS) {
      userId = existingProfileByWorkOS.user_id;
      profileId = existingProfileByWorkOS.id;

      await supabase
        .from('profiles')
        .update({
          last_sign_in_at: new Date().toISOString(),
          email_verified:
            user.emailVerified !== undefined
              ? user.emailVerified
              : existingProfileByWorkOS.email_verified,
          profile_picture_url:
            user.profilePictureUrl || existingProfileByWorkOS.profile_picture_url,
        })
        .eq('id', profileId);
    } else {
      if (adminSupabase) {
        // Try to find existing Supabase auth user by email
        const { data: authUsers } = await adminSupabase.auth.admin.listUsers();
        const existingAuthUser = authUsers?.users?.find(
          (u: any) => u.email === user.email,
        );

        if (existingAuthUser) {
          userId = existingAuthUser.id;

          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (existingProfile) {
            profileId = existingProfile.id;
            await supabase
              .from('profiles')
              .update({
                workos_user_id: user.id,
                auth_provider: 'workos',
                email_verified:
                  user.emailVerified !== undefined
                    ? user.emailVerified
                    : existingProfile.email_verified,
                profile_picture_url:
                  user.profilePictureUrl || existingProfile.profile_picture_url,
                last_sign_in_at: new Date().toISOString(),
              })
              .eq('id', profileId);
          } else {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                user_id: userId,
                name:
                  `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                  user.email ||
                  'Default',
                workos_user_id: user.id,
                auth_provider: 'workos',
                email_verified: user.emailVerified || false,
                profile_picture_url: user.profilePictureUrl,
                last_sign_in_at: new Date().toISOString(),
                is_default: true,
              })
              .select()
              .single();

            if (createError) {
              throw new Error(`Failed to create profile: ${createError.message}`);
            }

            profileId = newProfile.id;
          }
        } else {
          // Create new Supabase auth user and profile
          const { data: newAuthUser, error: authError } =
            await adminSupabase.auth.admin.createUser({
              email: user.email,
              email_confirm: true,
              user_metadata: {
                full_name:
                  `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                  user.email,
                avatar_url: user.profilePictureUrl,
              },
            });

          if (authError || !newAuthUser?.user) {
            throw new Error(
              `Failed to create user: ${authError?.message || 'Unknown error'}`,
            );
          }

          userId = newAuthUser.user.id;

          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              name:
                `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                user.email ||
                'Default',
              workos_user_id: user.id,
              auth_provider: 'workos',
              email_verified: user.emailVerified || false,
              profile_picture_url: user.profilePictureUrl,
              last_sign_in_at: new Date().toISOString(),
              is_default: true,
            })
            .select()
            .single();

          if (createError) {
            throw new Error(`Failed to create profile: ${createError.message}`);
          }

          profileId = newProfile.id;
        }
      } else {
        // No service role key: cannot auto-create Supabase users
        return NextResponse.json(
          {
            error:
              'Supabase service role key not configured. Cannot link WorkOS user to Supabase profile.',
          },
          { status: 500 },
        );
      }
    }

    if (!userId || !profileId) {
      return NextResponse.json(
        { error: 'Failed to link WorkOS user to Supabase profile' },
        { status: 500 },
      );
    }

    // 3) Create cookies for WorkOS + profile
    const response = NextResponse.json({ success: true });

    response.cookies.set('workos_user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('workos_profile_id', profileId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('active_profile_id', profileId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('workos_email', user.email || email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[WorkOS] verify-code error:', error);
    return NextResponse.json(
      { error: error.message || 'Invalid verification code' },
      { status: 401 },
    );
  }
}

