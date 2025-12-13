-- ============================================
-- Soft Delete Support & Profiles Foundation
-- ============================================

-- Add soft delete support to trades
ALTER TABLE trades 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_trades_deleted 
  ON trades(user_id, deleted_at) 
  WHERE deleted_at IS NULL;

-- Profiles table for multi-profile support
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_profiles_user 
  ON profiles(user_id, created_at DESC);

-- Add profile_id to trades (nullable for backward compatibility)
ALTER TABLE trades 
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_trades_profile 
  ON trades(user_id, profile_id, trade_date DESC) 
  WHERE deleted_at IS NULL;

-- Row Level Security for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
CREATE POLICY "Users can view own profiles" ON profiles 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profiles" ON profiles;
CREATE POLICY "Users can insert own profiles" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profiles" ON profiles;
CREATE POLICY "Users can update own profiles" ON profiles 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profiles" ON profiles;
CREATE POLICY "Users can delete own profiles" ON profiles 
  FOR DELETE USING (auth.uid() = user_id);

-- Function to create default profile for existing users
CREATE OR REPLACE FUNCTION create_default_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, name, description, is_default, color)
  VALUES (NEW.id, 'Default', 'Default trading profile', true, '#3b82f6')
  ON CONFLICT (user_id, name) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create default profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_profile_for_user();
