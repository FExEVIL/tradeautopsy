-- ============================================
-- FIX PROFILES TABLE - Run this in Supabase SQL Editor
-- ============================================
-- This will create or fix the profiles table with all required columns

-- Drop and recreate if needed (CAREFUL: This will delete existing profiles!)
-- Uncomment only if you want to start fresh:
-- DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'default',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT profiles_user_id_name_unique UNIQUE(user_id, name)
);

-- Add any missing columns (safe to run multiple times)
DO $$ 
BEGIN
  -- Add name column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN name TEXT NOT NULL DEFAULT 'Default Profile';
    -- Remove default after adding
    ALTER TABLE profiles ALTER COLUMN name DROP DEFAULT;
  END IF;

  -- Add description column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE profiles ADD COLUMN description TEXT;
  END IF;

  -- Add type column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN type TEXT;
  END IF;

  -- Add color column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'color'
  ) THEN
    ALTER TABLE profiles ADD COLUMN color TEXT DEFAULT '#3b82f6';
  END IF;

  -- Add icon column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'icon'
  ) THEN
    ALTER TABLE profiles ADD COLUMN icon TEXT DEFAULT 'default';
  END IF;

  -- Add is_default column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_default'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_default BOOLEAN DEFAULT false;
  END IF;

  -- Add created_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add updated_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_created ON profiles(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON profiles;

-- Create RLS policies
CREATE POLICY "Users can view own profiles" ON profiles 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles" ON profiles 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profiles" ON profiles 
  FOR DELETE USING (auth.uid() = user_id);

-- Verify table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;
