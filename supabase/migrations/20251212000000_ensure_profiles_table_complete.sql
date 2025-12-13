-- ============================================
-- Ensure Profiles Table Exists with All Columns
-- ============================================
-- This migration ensures the profiles table exists with all required columns
-- It's safe to run multiple times (uses IF NOT EXISTS)

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

-- Ensure all columns exist (add if missing)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3b82f6',
  ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_created ON profiles(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
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

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_user_id_name_unique'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_user_id_name_unique UNIQUE(user_id, name);
  END IF;
END $$;
