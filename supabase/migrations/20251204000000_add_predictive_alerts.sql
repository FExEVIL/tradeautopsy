-- Predictive alerts table
CREATE TABLE IF NOT EXISTS predictive_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'tilt_warning', 'avoid_trading', 'best_time', 'take_break'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'warning', -- 'info', 'warning', 'critical'
  confidence NUMERIC(3,2), -- 0.0-1.0 confidence score
  triggered_by JSONB, -- Context: trade_ids, time_of_day, patterns detected
  dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  user_action TEXT, -- 'heeded', 'ignored', 'dismissed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictive_alerts_user ON predictive_alerts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_active ON predictive_alerts(user_id, dismissed) WHERE dismissed = false;
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_type ON predictive_alerts(user_id, alert_type, created_at DESC);

-- Alert preferences
CREATE TABLE IF NOT EXISTS alert_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tilt_warning_enabled BOOLEAN DEFAULT true,
  avoid_trading_enabled BOOLEAN DEFAULT true,
  best_time_enabled BOOLEAN DEFAULT true,
  take_break_enabled BOOLEAN DEFAULT true,
  notification_frequency TEXT DEFAULT 'normal', -- 'low', 'normal', 'high'
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE predictive_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for predictive_alerts
CREATE POLICY "Users can view own alerts" ON predictive_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON predictive_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON predictive_alerts FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for alert_preferences
CREATE POLICY "Users can view own preferences" ON alert_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON alert_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON alert_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Initialize default preferences for existing users (optional trigger)
-- This will be handled in application code when user first accesses alerts

