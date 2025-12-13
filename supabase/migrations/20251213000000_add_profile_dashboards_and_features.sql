-- ============================================
-- Profile Dashboards and Features System
-- ============================================
-- This migration creates tables for isolated profile dashboards
-- Each profile can have its own dashboard layout and enabled features

-- Create profile_dashboards table
CREATE TABLE IF NOT EXISTS profile_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dashboard Configuration
  layout_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Widget positions and layout
  enabled_features JSONB NOT NULL DEFAULT '[]'::jsonb, -- List of enabled feature IDs
  dashboard_widgets JSONB NOT NULL DEFAULT '[]'::jsonb, -- Active widgets configuration
  
  -- Visual Customization
  theme_color VARCHAR(7) DEFAULT '#3b82f6', -- Hex color for profile theme
  sidebar_collapsed BOOLEAN DEFAULT false,
  
  -- Settings
  default_chart_type VARCHAR(50) DEFAULT 'line',
  default_timeframe VARCHAR(10) DEFAULT '30D',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(profile_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profile_dashboards_profile_id 
  ON profile_dashboards(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_dashboards_user_id 
  ON profile_dashboards(user_id);

-- Enable RLS
ALTER TABLE profile_dashboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_dashboards
DROP POLICY IF EXISTS "Users can view own profile dashboards" ON profile_dashboards;
CREATE POLICY "Users can view own profile dashboards" ON profile_dashboards 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile dashboards" ON profile_dashboards;
CREATE POLICY "Users can insert own profile dashboards" ON profile_dashboards 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile dashboards" ON profile_dashboards;
CREATE POLICY "Users can update own profile dashboards" ON profile_dashboards 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profile dashboards" ON profile_dashboards;
CREATE POLICY "Users can delete own profile dashboards" ON profile_dashboards 
  FOR DELETE USING (auth.uid() = user_id);

-- Create profile_features table
CREATE TABLE IF NOT EXISTS profile_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Feature Toggles (individual control)
  show_behavioral_analysis BOOLEAN DEFAULT true,
  show_ai_coach BOOLEAN DEFAULT true,
  show_pattern_library BOOLEAN DEFAULT true,
  show_risk_management BOOLEAN DEFAULT true,
  show_economic_calendar BOOLEAN DEFAULT false,
  show_comparisons BOOLEAN DEFAULT true,
  show_goals BOOLEAN DEFAULT true,
  show_strategy_analysis BOOLEAN DEFAULT true,
  show_morning_brief BOOLEAN DEFAULT true,
  
  -- Advanced Features
  enable_audio_journal BOOLEAN DEFAULT false,
  enable_predictive_alerts BOOLEAN DEFAULT false,
  enable_ml_insights BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(profile_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profile_features_profile_id 
  ON profile_features(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_features_user_id 
  ON profile_features(user_id);

-- Enable RLS
ALTER TABLE profile_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_features
DROP POLICY IF EXISTS "Users can view own profile features" ON profile_features;
CREATE POLICY "Users can view own profile features" ON profile_features 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile features" ON profile_features;
CREATE POLICY "Users can insert own profile features" ON profile_features 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile features" ON profile_features;
CREATE POLICY "Users can update own profile features" ON profile_features 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profile features" ON profile_features;
CREATE POLICY "Users can delete own profile features" ON profile_features 
  FOR DELETE USING (auth.uid() = user_id);

-- Update profiles table with new columns
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS template_type VARCHAR(50) DEFAULT 'custom',
  ADD COLUMN IF NOT EXISTS theme_color VARCHAR(7) DEFAULT '#3b82f6',
  ADD COLUMN IF NOT EXISTS dashboard_layout VARCHAR(20) DEFAULT 'default';

-- Create function to automatically create dashboard and features when profile is created
CREATE OR REPLACE FUNCTION create_profile_dashboard_and_features()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default dashboard config (ignore errors - will be created on first load if fails)
  BEGIN
    INSERT INTO profile_dashboards (
      profile_id,
      user_id,
      layout_config,
      enabled_features,
      dashboard_widgets,
      theme_color
    ) VALUES (
      NEW.id,
      NEW.user_id,
      '{}'::jsonb,
      '[]'::jsonb,
      '[]'::jsonb,
      COALESCE(NEW.theme_color, NEW.color, '#3b82f6')
    )
    ON CONFLICT (profile_id, user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail profile creation
    RAISE WARNING 'Failed to create dashboard for profile %: %', NEW.id, SQLERRM;
  END;
  
  -- Create default features config (ignore errors - will be created on first load if fails)
  BEGIN
    INSERT INTO profile_features (
      profile_id,
      user_id
    ) VALUES (
      NEW.id,
      NEW.user_id
    )
    ON CONFLICT (profile_id, user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail profile creation
    RAISE WARNING 'Failed to create features for profile %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create dashboard and features
DROP TRIGGER IF EXISTS trigger_create_profile_dashboard_and_features ON profiles;
CREATE TRIGGER trigger_create_profile_dashboard_and_features
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_dashboard_and_features();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profile_dashboards_updated_at ON profile_dashboards;
CREATE TRIGGER update_profile_dashboards_updated_at
  BEFORE UPDATE ON profile_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profile_features_updated_at ON profile_features;
CREATE TRIGGER update_profile_features_updated_at
  BEFORE UPDATE ON profile_features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing profiles: Create dashboard and features for all existing profiles
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN SELECT id, user_id, COALESCE(theme_color, color, '#3b82f6') as theme FROM profiles
  LOOP
    -- Create dashboard if doesn't exist
    INSERT INTO profile_dashboards (
      profile_id,
      user_id,
      layout_config,
      enabled_features,
      dashboard_widgets,
      theme_color
    ) VALUES (
      profile_record.id,
      profile_record.user_id,
      '{}'::jsonb,
      '[]'::jsonb,
      '[]'::jsonb,
      profile_record.theme
    )
    ON CONFLICT (profile_id, user_id) DO NOTHING;
    
    -- Create features if doesn't exist
    INSERT INTO profile_features (
      profile_id,
      user_id
    ) VALUES (
      profile_record.id,
      profile_record.user_id
    )
    ON CONFLICT (profile_id, user_id) DO NOTHING;
  END LOOP;
END $$;
