-- ============================================
-- Enhance Profiles Table & Add profile_id to All Relevant Tables
-- ============================================

-- Ensure profiles table has all required columns
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS description TEXT, -- Profile description
  ADD COLUMN IF NOT EXISTS type TEXT, -- 'fno', 'equity', 'options', 'mutual_funds', 'crypto', 'custom'
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3b82f6', -- Profile color for UI
  ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'default', -- Lucide icon key (not emoji)
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false; -- Ensure is_default exists

-- Add profile_id to trading_rules
ALTER TABLE trading_rules 
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_trading_rules_profile_id 
  ON trading_rules(profile_id) 
  WHERE profile_id IS NOT NULL;

-- Add profile_id to goals (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'goals') THEN
    ALTER TABLE goals 
      ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
    
    CREATE INDEX IF NOT EXISTS idx_goals_profile_id 
      ON goals(profile_id) 
      WHERE profile_id IS NOT NULL;
  END IF;
END $$;

-- Add profile_id to automation_preferences (nullable, can be per-profile or global)
ALTER TABLE automation_preferences 
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_automation_preferences_profile_id 
  ON automation_preferences(profile_id) 
  WHERE profile_id IS NOT NULL;

-- Ensure user_preferences has current_profile_id
ALTER TABLE user_preferences 
  ADD COLUMN IF NOT EXISTS current_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_preferences_current_profile 
  ON user_preferences(user_id, current_profile_id);

-- Backfill: Assign existing trades to default profile if profile_id is NULL
-- Check if is_default column exists first
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_default'
  ) THEN
    UPDATE trades t
    SET profile_id = (
      SELECT id FROM profiles p 
      WHERE p.user_id = t.user_id 
      AND p.is_default = true
      LIMIT 1
    )
    WHERE profile_id IS NULL 
    AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = t.user_id 
      AND p.is_default = true
    );
  ELSE
    -- Fallback: Use first profile for user if is_default doesn't exist
    UPDATE trades t
    SET profile_id = (
      SELECT id FROM profiles p 
      WHERE p.user_id = t.user_id 
      ORDER BY p.created_at ASC
      LIMIT 1
    )
    WHERE profile_id IS NULL 
    AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = t.user_id
    );
  END IF;
END $$;

-- Backfill: Assign existing trading_rules to default profile if profile_id is NULL
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_default'
  ) THEN
    UPDATE trading_rules tr
    SET profile_id = (
      SELECT id FROM profiles p 
      WHERE p.user_id = tr.user_id 
      AND p.is_default = true
      LIMIT 1
    )
    WHERE profile_id IS NULL 
    AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = tr.user_id 
      AND p.is_default = true
    );
  ELSE
    -- Fallback: Use first profile for user
    UPDATE trading_rules tr
    SET profile_id = (
      SELECT id FROM profiles p 
      WHERE p.user_id = tr.user_id 
      ORDER BY p.created_at ASC
      LIMIT 1
    )
    WHERE profile_id IS NULL 
    AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = tr.user_id
    );
  END IF;
END $$;

-- Backfill: Assign existing goals to default profile if profile_id is NULL
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'goals') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'is_default'
    ) THEN
      UPDATE goals g
      SET profile_id = (
        SELECT id FROM profiles p 
        WHERE p.user_id = g.user_id 
        AND p.is_default = true
        LIMIT 1
      )
      WHERE profile_id IS NULL 
      AND EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.user_id = g.user_id 
        AND p.is_default = true
      );
    ELSE
      -- Fallback: Use first profile for user
      UPDATE goals g
      SET profile_id = (
        SELECT id FROM profiles p 
        WHERE p.user_id = g.user_id 
        ORDER BY p.created_at ASC
        LIMIT 1
      )
      WHERE profile_id IS NULL 
      AND EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.user_id = g.user_id
      );
    END IF;
  END IF;
END $$;
