-- ============================================
-- WorkOS Authentication Integration
-- ============================================
-- Adds WorkOS SSO support alongside existing Supabase auth

-- Note: This assumes you have a 'users' table or similar
-- If using Supabase Auth, you may need to create a separate profiles/users table
-- or extend the auth.users table via triggers

-- Check if we're using auth.users or a custom users table
-- For Supabase Auth, we'll create a user_profiles table that links to auth.users

-- Create user_profiles table if it doesn't exist (for WorkOS users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name TEXT,
  workos_user_id VARCHAR(255) UNIQUE,
  auth_provider VARCHAR(50) DEFAULT 'supabase', -- 'supabase' or 'workos'
  email_verified BOOLEAN DEFAULT false,
  profile_picture_url TEXT,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add WorkOS fields to existing profiles table (if it exists)
DO $$ 
BEGIN
  -- Check if profiles table exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- Add WorkOS columns to profiles table
    ALTER TABLE profiles 
    ADD COLUMN IF NOT EXISTS workos_user_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'supabase',
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
    ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

    -- Add unique constraint for workos_user_id
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'profiles_workos_user_id_key'
    ) THEN
      ALTER TABLE profiles 
      ADD CONSTRAINT profiles_workos_user_id_key 
      UNIQUE(workos_user_id);
    END IF;
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_workos_id 
ON user_profiles(workos_user_id) 
WHERE workos_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_provider 
ON user_profiles(auth_provider);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
ON user_profiles(email);

-- If profiles table exists, add indexes there too
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_workos_id 
    ON profiles(workos_user_id) 
    WHERE workos_user_id IS NOT NULL;

    CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider 
    ON profiles(auth_provider);
  END IF;
END $$;

-- Update existing users to have Supabase as provider
UPDATE user_profiles 
SET auth_provider = 'supabase' 
WHERE auth_provider IS NULL;

-- If profiles table exists, update it too
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    UPDATE profiles 
    SET auth_provider = 'supabase' 
    WHERE auth_provider IS NULL;
  END IF;
END $$;

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id OR workos_user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (true); -- WorkOS callback will create profiles

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id OR workos_user_id IS NOT NULL);

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'User profiles supporting both Supabase and WorkOS authentication';
COMMENT ON COLUMN user_profiles.workos_user_id IS 'WorkOS user ID for SSO users';
COMMENT ON COLUMN user_profiles.auth_provider IS 'Authentication provider: supabase or workos';
COMMENT ON COLUMN user_profiles.email_verified IS 'Whether the user email is verified';
