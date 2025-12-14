-- ============================================
-- Additional Auth Features
-- ============================================
-- Adds onboarding, plan_type, and MFA columns to profiles table

-- Add missing columns to profiles table
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- Add onboarding and plan columns
    ALTER TABLE profiles 
    ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20) DEFAULT 'hobby',
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS mfa_secret TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT;

    -- Add index for plan_type
    CREATE INDEX IF NOT EXISTS idx_profiles_plan_type 
    ON profiles(plan_type);

    -- Add index for onboarding_completed
    CREATE INDEX IF NOT EXISTS idx_profiles_onboarding 
    ON profiles(onboarding_completed);
  END IF;
END $$;

-- Add email column if it doesn't exist (for profiles that might not have it)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- Check if email column exists, if not add it
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'email'
    ) THEN
      ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
  END IF;
END $$;

-- Update existing profiles to have default values
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    UPDATE profiles 
    SET 
      plan_type = COALESCE(plan_type, 'hobby'),
      onboarding_completed = COALESCE(onboarding_completed, false),
      mfa_enabled = COALESCE(mfa_enabled, false)
    WHERE plan_type IS NULL 
       OR onboarding_completed IS NULL 
       OR mfa_enabled IS NULL;
  END IF;
END $$;

-- Add comments
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    COMMENT ON COLUMN profiles.plan_type IS 'User plan type: hobby or pro';
    COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether user has completed onboarding';
    COMMENT ON COLUMN profiles.mfa_enabled IS 'Whether MFA is enabled for this user';
    COMMENT ON COLUMN profiles.mfa_secret IS 'TOTP secret for MFA (encrypted)';
  END IF;
END $$;
