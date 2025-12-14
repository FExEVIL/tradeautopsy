-- Add auto-generated fields to audio_journal_entries
ALTER TABLE audio_journal_entries
ADD COLUMN IF NOT EXISTS auto_tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS detected_emotions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS detected_mistakes JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS suggested_goals JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT '{}';

-- Create mistakes table
CREATE TABLE IF NOT EXISTS mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Mistake details
  mistake_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  
  -- Related data
  trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
  audio_journal_id UUID REFERENCES audio_journal_entries(id) ON DELETE SET NULL,
  
  -- Impact
  financial_impact DECIMAL(12, 2),
  occurrence_count INTEGER DEFAULT 1,
  
  -- Resolution
  is_resolved BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  
  -- Metadata
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  first_occurred_at TIMESTAMPTZ,
  last_occurred_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own mistakes"
  ON mistakes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mistakes"
  ON mistakes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mistakes"
  ON mistakes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mistakes"
  ON mistakes FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mistakes_user ON mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_profile ON mistakes(user_id, profile_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_type ON mistakes(mistake_type);
CREATE INDEX IF NOT EXISTS idx_mistakes_severity ON mistakes(severity);
CREATE INDEX IF NOT EXISTS idx_mistakes_resolved ON mistakes(user_id, is_resolved) WHERE is_resolved = false;
CREATE INDEX IF NOT EXISTS idx_mistakes_trade ON mistakes(trade_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_audio ON mistakes(audio_journal_id);

-- Add comments
COMMENT ON TABLE mistakes IS 'Trading mistakes detected from audio journal analysis and trade patterns';
COMMENT ON COLUMN mistakes.mistake_type IS 'Type of mistake: entry_timing, exit_timing, position_sizing, risk_management, etc.';
COMMENT ON COLUMN mistakes.severity IS 'Mistake severity: low, medium, high, critical';
COMMENT ON COLUMN mistakes.financial_impact IS 'Estimated financial impact in INR (negative value)';

-- Update audio_journal_entries comments
COMMENT ON COLUMN audio_journal_entries.auto_tags IS 'Auto-generated tags from AI analysis';
COMMENT ON COLUMN audio_journal_entries.detected_emotions IS 'Detected emotional states from transcript';
COMMENT ON COLUMN audio_journal_entries.detected_mistakes IS 'Mistakes detected from audio analysis';
COMMENT ON COLUMN audio_journal_entries.suggested_goals IS 'Goals suggested based on audio content';
COMMENT ON COLUMN audio_journal_entries.ai_analysis IS 'Complete AI analysis JSON';
