-- ============================================
-- Email Preferences Table
-- ============================================

-- Email preferences table
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email notification toggles
  welcome_email BOOLEAN DEFAULT true,
  weekly_report BOOLEAN DEFAULT true,
  goal_achieved BOOLEAN DEFAULT true,
  inactivity_reminder BOOLEAN DEFAULT true,
  daily_summary BOOLEAN DEFAULT false,
  
  -- Frequency settings
  weekly_report_day INTEGER DEFAULT 0 CHECK (weekly_report_day >= 0 AND weekly_report_day <= 6), -- 0 = Sunday
  weekly_report_time TIME DEFAULT '18:00:00', -- 6 PM IST
  daily_summary_time TIME DEFAULT '16:00:00', -- 4 PM IST
  
  -- Inactivity reminder settings
  inactivity_days INTEGER DEFAULT 7 CHECK (inactivity_days > 0),
  
  -- Unsubscribe
  unsubscribe_all BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_preferences_user ON email_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_preferences_weekly_report ON email_preferences(weekly_report, weekly_report_day) WHERE weekly_report = true;
CREATE INDEX IF NOT EXISTS idx_email_preferences_daily_summary ON email_preferences(daily_summary) WHERE daily_summary = true;

-- Row Level Security
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own email preferences" ON email_preferences;
CREATE POLICY "Users can view own email preferences" ON email_preferences 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own email preferences" ON email_preferences;
CREATE POLICY "Users can insert own email preferences" ON email_preferences 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own email preferences" ON email_preferences;
CREATE POLICY "Users can update own email preferences" ON email_preferences 
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_email_preferences_updated_at ON email_preferences;
CREATE TRIGGER trigger_update_email_preferences_updated_at
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_preferences_updated_at();

