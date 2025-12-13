-- Extend user_preferences table with comprehensive settings
-- This migration safely adds new columns if they don't exist

DO $$ 
BEGIN
  -- Add theme column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences' 
    AND column_name = 'theme'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN theme TEXT DEFAULT 'system';
  END IF;

  -- Add date_format column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences' 
    AND column_name = 'date_format'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN date_format TEXT DEFAULT 'DD/MM/YYYY';
  END IF;

  -- Add language column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences' 
    AND column_name = 'language'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN language TEXT DEFAULT 'en';
  END IF;

  -- Add email_notifications column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences' 
    AND column_name = 'email_notifications'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN email_notifications BOOLEAN DEFAULT true;
  END IF;

  -- Add push_notifications column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences' 
    AND column_name = 'push_notifications'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN push_notifications BOOLEAN DEFAULT true;
  END IF;

  -- Add alert_frequency column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences' 
    AND column_name = 'alert_frequency'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN alert_frequency TEXT DEFAULT 'realtime';
  END IF;

  -- Add quiet_hours column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences' 
    AND column_name = 'quiet_hours'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN quiet_hours JSONB DEFAULT '{}';
  END IF;

  -- Add ai_coach_enabled column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences' 
    AND column_name = 'ai_coach_enabled'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN ai_coach_enabled BOOLEAN DEFAULT true;
  END IF;

  -- Add data_retention column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences' 
    AND column_name = 'data_retention'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN data_retention TEXT DEFAULT '1_year';
  END IF;
END $$;

-- Create usage_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS usage_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  trades_count INTEGER DEFAULT 0,
  ai_calls INTEGER DEFAULT 0,
  patterns_detected INTEGER DEFAULT 0,
  reports_generated INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usage_stats
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view own usage stats" ON usage_stats;
  DROP POLICY IF EXISTS "Users can update own usage stats" ON usage_stats;
  
  -- Create policies
  CREATE POLICY "Users can view own usage stats" ON usage_stats
    FOR SELECT USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can update own usage stats" ON usage_stats
    FOR UPDATE USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can insert own usage stats" ON usage_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON usage_stats(user_id);

