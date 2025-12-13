-- ============================================
-- Economic Events & Notifications Tables
-- ============================================

-- Economic events cache
CREATE TABLE IF NOT EXISTS economic_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_date DATE NOT NULL,
  event_time TIMESTAMPTZ,
  title TEXT NOT NULL,
  country TEXT, -- 'IN', 'US', etc.
  impact TEXT, -- 'high', 'medium', 'low'
  category TEXT, -- 'inflation', 'interest_rate', 'gdp', etc.
  actual_value TEXT,
  forecast_value TEXT,
  previous_value TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_date, title, country)
);

CREATE INDEX IF NOT EXISTS idx_economic_events_date 
  ON economic_events(event_date DESC, impact);
CREATE INDEX IF NOT EXISTS idx_economic_events_impact 
  ON economic_events(event_date, impact) WHERE impact = 'high';
-- Note: Partial index with CURRENT_DATE removed - CURRENT_DATE is not immutable
-- Use regular index and filter in queries: WHERE event_date >= CURRENT_DATE

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'economic_event', 'rule_violation', 'goal_achieved', 'pattern_detected', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal', -- 'critical', 'high', 'normal', 'low'
  read BOOLEAN DEFAULT false,
  action_url TEXT, -- Optional link
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user 
  ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
  ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_priority 
  ON notifications(user_id, priority, created_at DESC) WHERE read = false;

-- Row Level Security for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
CREATE POLICY "Users can insert own notifications" ON notifications 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications 
  FOR DELETE USING (auth.uid() = user_id);

-- Economic events are public (no RLS needed, but can add if needed)
