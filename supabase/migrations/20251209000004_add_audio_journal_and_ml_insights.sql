-- ============================================
-- Audio Journal & ML Insights Tables
-- ============================================

-- Audio journal entries
CREATE TABLE IF NOT EXISTS audio_journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  audio_url TEXT NOT NULL, -- Supabase storage path
  transcript TEXT, -- Speech-to-text result
  ai_summary TEXT, -- AI-generated summary
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audio_journal_user 
  ON audio_journal_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_journal_trade 
  ON audio_journal_entries(trade_id);

-- ML insights table
CREATE TABLE IF NOT EXISTS ml_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  insight_type TEXT NOT NULL, -- 'time_optimization', 'strategy_recommendation', 'risk_adjustment', etc.
  insight_text TEXT NOT NULL,
  confidence_score NUMERIC(3,2), -- 0.00 to 1.00
  metadata JSONB DEFAULT '{}', -- Supporting data, features used
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional expiration
  acknowledged BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_ml_insights_user 
  ON ml_insights(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_insights_profile 
  ON ml_insights(user_id, profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_insights_unacknowledged 
  ON ml_insights(user_id, acknowledged) WHERE acknowledged = false;

-- Row Level Security for audio journal
ALTER TABLE audio_journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own audio entries" ON audio_journal_entries;
CREATE POLICY "Users can view own audio entries" ON audio_journal_entries 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own audio entries" ON audio_journal_entries;
CREATE POLICY "Users can insert own audio entries" ON audio_journal_entries 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own audio entries" ON audio_journal_entries;
CREATE POLICY "Users can update own audio entries" ON audio_journal_entries 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own audio entries" ON audio_journal_entries;
CREATE POLICY "Users can delete own audio entries" ON audio_journal_entries 
  FOR DELETE USING (auth.uid() = user_id);

-- Row Level Security for ML insights
ALTER TABLE ml_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own ML insights" ON ml_insights;
CREATE POLICY "Users can view own ML insights" ON ml_insights 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own ML insights" ON ml_insights;
CREATE POLICY "Users can insert own ML insights" ON ml_insights 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ML insights" ON ml_insights;
CREATE POLICY "Users can update own ML insights" ON ml_insights 
  FOR UPDATE USING (auth.uid() = user_id);
