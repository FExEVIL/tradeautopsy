-- ============================================
-- COMBINED MIGRATION: All Phase 2, 3 & Feature 23 Tables
-- Run this in Supabase SQL Editor to create all tables at once
-- ============================================

-- ============================================
-- PART 1: AI Coach Tables (Phase 2)
-- ============================================

-- AI Insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'warning', 'recommendation', 'achievement', 'weekly_plan'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info', -- 'critical', 'warning', 'info', 'success'
  triggered_by_trade_id UUID REFERENCES trades(id),
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_user ON ai_insights(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_dismissed ON ai_insights(user_id, dismissed) WHERE dismissed = false;

-- Detected patterns table
CREATE TABLE IF NOT EXISTS detected_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL, -- 'revenge_trading', 'fomo', 'overtrading', 'win_streak_overconfidence'
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  occurrences INTEGER DEFAULT 1,
  total_cost NUMERIC(10,2) DEFAULT 0, -- Total ₹ lost to this pattern
  trades_affected UUID[], -- Array of trade IDs
  metadata JSONB -- Additional pattern-specific data
);

CREATE INDEX IF NOT EXISTS idx_detected_patterns_user ON detected_patterns(user_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_detected_patterns_type ON detected_patterns(user_id, pattern_type);

-- Weekly action plans
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  focus_area TEXT NOT NULL, -- 'position_sizing', 'stop_loss', 'revenge_trading', 'fomo', 'overtrading'
  goals JSONB NOT NULL, -- {"reduce_revenge_trades": 50, "improve_win_rate": 5}
  progress JSONB DEFAULT '{}', -- {"revenge_trades_reduced": 30, "win_rate_improved": 2}
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_action_plans_user ON action_plans(user_id, week_start DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_action_plans_user_week ON action_plans(user_id, week_start);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL, -- 'profit', 'win_rate', 'consistency', 'risk', 'behavioral'
  title TEXT NOT NULL,
  target_value NUMERIC(10,2),
  current_value NUMERIC(10,2) DEFAULT 0,
  deadline DATE,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_completed ON goals(user_id, completed) WHERE completed = false;

-- ============================================
-- PART 2: Predictive Alerts Tables (Feature 23)
-- ============================================

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

-- ============================================
-- PART 3: Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_insights
DROP POLICY IF EXISTS "Users can view own insights" ON ai_insights;
CREATE POLICY "Users can view own insights" ON ai_insights FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own insights" ON ai_insights;
CREATE POLICY "Users can insert own insights" ON ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own insights" ON ai_insights;
CREATE POLICY "Users can update own insights" ON ai_insights FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for detected_patterns
DROP POLICY IF EXISTS "Users can view own patterns" ON detected_patterns;
CREATE POLICY "Users can view own patterns" ON detected_patterns FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own patterns" ON detected_patterns;
CREATE POLICY "Users can insert own patterns" ON detected_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own patterns" ON detected_patterns;
CREATE POLICY "Users can update own patterns" ON detected_patterns FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for action_plans
DROP POLICY IF EXISTS "Users can view own action plans" ON action_plans;
CREATE POLICY "Users can view own action plans" ON action_plans FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own action plans" ON action_plans;
CREATE POLICY "Users can insert own action plans" ON action_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own action plans" ON action_plans;
CREATE POLICY "Users can update own action plans" ON action_plans FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for goals
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own goals" ON goals;
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for predictive_alerts
DROP POLICY IF EXISTS "Users can view own alerts" ON predictive_alerts;
CREATE POLICY "Users can view own alerts" ON predictive_alerts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own alerts" ON predictive_alerts;
CREATE POLICY "Users can insert own alerts" ON predictive_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own alerts" ON predictive_alerts;
CREATE POLICY "Users can update own alerts" ON predictive_alerts FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for alert_preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON alert_preferences;
CREATE POLICY "Users can view own preferences" ON alert_preferences FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own preferences" ON alert_preferences;
CREATE POLICY "Users can insert own preferences" ON alert_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own preferences" ON alert_preferences;
CREATE POLICY "Users can update own preferences" ON alert_preferences FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this after migration to verify all tables exist:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('ai_insights', 'predictive_alerts', 'detected_patterns', 'action_plans', 'goals', 'alert_preferences')
-- ORDER BY table_name;

