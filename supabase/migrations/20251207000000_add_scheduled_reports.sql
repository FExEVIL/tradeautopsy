-- ============================================
-- Scheduled Reports & Report History Tables
-- ============================================

-- Scheduled reports table
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL DEFAULT 'performance', -- 'performance', 'risk', 'behavioral', 'full'
  schedule_frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  schedule_time TIME DEFAULT '09:00:00', -- Time of day to send (for daily/weekly)
  schedule_day INTEGER, -- Day of week (0-6, Sunday=0) for weekly, or day of month (1-31) for monthly
  email_enabled BOOLEAN DEFAULT true,
  email_address TEXT,
  include_notes BOOLEAN DEFAULT true,
  include_tags BOOLEAN DEFAULT true,
  enabled BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_user ON scheduled_reports(user_id, enabled);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_send ON scheduled_reports(next_send_at) WHERE enabled = true;

-- Report history table (stores generated reports)
CREATE TABLE IF NOT EXISTS report_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_report_id UUID REFERENCES scheduled_reports(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  report_format TEXT NOT NULL, -- 'pdf', 'csv'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  file_url TEXT, -- URL to stored report file (if stored in storage)
  file_size BIGINT, -- Size in bytes
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB -- Additional report metadata
);

CREATE INDEX IF NOT EXISTS idx_report_history_user ON report_history(user_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_history_scheduled ON report_history(scheduled_report_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scheduled_reports
DROP POLICY IF EXISTS "Users can view own scheduled reports" ON scheduled_reports;
CREATE POLICY "Users can view own scheduled reports" ON scheduled_reports FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own scheduled reports" ON scheduled_reports;
CREATE POLICY "Users can insert own scheduled reports" ON scheduled_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own scheduled reports" ON scheduled_reports;
CREATE POLICY "Users can update own scheduled reports" ON scheduled_reports FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own scheduled reports" ON scheduled_reports;
CREATE POLICY "Users can delete own scheduled reports" ON scheduled_reports FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for report_history
DROP POLICY IF EXISTS "Users can view own report history" ON report_history;
CREATE POLICY "Users can view own report history" ON report_history FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own report history" ON report_history;
CREATE POLICY "Users can insert own report history" ON report_history FOR INSERT WITH CHECK (auth.uid() = user_id);
