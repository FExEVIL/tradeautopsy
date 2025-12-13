-- ============================================
-- COPY THIS ENTIRE FILE INTO SUPABASE SQL EDITOR
-- ============================================
-- Instructions:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Select ALL text below (Cmd+A / Ctrl+A)
-- 3. Copy (Cmd+C / Ctrl+C)
-- 4. Paste into Supabase SQL Editor
-- 5. Click "Run" button
-- 6. Wait for "Success" message
-- ============================================

-- ============================================
-- PART 1: AI Coach Tables (Phase 2)
-- ============================================

-- AI Insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
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
  pattern_type TEXT NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  occurrences INTEGER DEFAULT 1,
  total_cost NUMERIC(10,2) DEFAULT 0,
  trades_affected UUID[],
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_detected_patterns_user ON detected_patterns(user_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_detected_patterns_type ON detected_patterns(user_id, pattern_type);

-- Weekly action plans
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  focus_area TEXT NOT NULL,
  goals JSONB NOT NULL,
  progress JSONB DEFAULT '{}',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_week_focus UNIQUE(user_id, week_start, focus_area)
);

CREATE INDEX IF NOT EXISTS idx_action_plans_user ON action_plans(user_id, week_start DESC);

-- ============================================
-- PART 2: Goals & Milestones (Phase 3)
-- ============================================

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL,
  title TEXT NOT NULL,
  target_value NUMERIC(10,2),
  current_value NUMERIC(10,2) DEFAULT 0,
  deadline DATE,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id, created_at DESC);

-- ============================================
-- PART 3: Predictive Alerts (Feature 23)
-- ============================================

-- Predictive alerts table
CREATE TABLE IF NOT EXISTS predictive_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'warning',
  confidence NUMERIC(3,2),
  triggered_by JSONB,
  dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  user_action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictive_alerts_user ON predictive_alerts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_active ON predictive_alerts(user_id, dismissed) WHERE dismissed = false;
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_type ON predictive_alerts(user_id, alert_type);

-- Alert preferences
CREATE TABLE IF NOT EXISTS alert_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tilt_warning_enabled BOOLEAN DEFAULT true,
  avoid_trading_enabled BOOLEAN DEFAULT true,
  best_time_enabled BOOLEAN DEFAULT true,
  take_break_enabled BOOLEAN DEFAULT true,
  notification_frequency TEXT DEFAULT 'normal',
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_preferences ENABLE ROW LEVEL SECURITY;

-- AI Insights policies
CREATE POLICY "Users can view own ai_insights" ON ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai_insights" ON ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ai_insights" ON ai_insights FOR UPDATE USING (auth.uid() = user_id);

-- Detected patterns policies
CREATE POLICY "Users can view own detected_patterns" ON detected_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own detected_patterns" ON detected_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own detected_patterns" ON detected_patterns FOR UPDATE USING (auth.uid() = user_id);

-- Action plans policies
CREATE POLICY "Users can view own action_plans" ON action_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own action_plans" ON action_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own action_plans" ON action_plans FOR UPDATE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);

-- Predictive alerts policies
CREATE POLICY "Users can view own predictive_alerts" ON predictive_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own predictive_alerts" ON predictive_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own predictive_alerts" ON predictive_alerts FOR UPDATE USING (auth.uid() = user_id);

-- Alert preferences policies
CREATE POLICY "Users can view own alert_preferences" ON alert_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alert_preferences" ON alert_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alert_preferences" ON alert_preferences FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- VERIFICATION QUERY (Run after migration)
-- ============================================
-- Uncomment and run this to verify all tables were created:
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('ai_insights', 'predictive_alerts', 'detected_patterns', 'action_plans', 'goals', 'alert_preferences')
-- ORDER BY table_name;

