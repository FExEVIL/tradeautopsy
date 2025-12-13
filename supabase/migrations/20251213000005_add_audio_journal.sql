-- ============================================
-- Audio Journaling Feature
-- ============================================
-- Adds audio recording, transcription, and AI summarization for trade journals

-- Audio journal entries table
-- Use CREATE TABLE and handle existing table case
DO $$ 
BEGIN
  -- Create table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audio_journal_entries') THEN
    CREATE TABLE audio_journal_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
      
      -- Audio data
      audio_url TEXT NOT NULL,
      duration INTEGER NOT NULL, -- seconds
      
      -- Transcription
      transcript TEXT NOT NULL,
      summary TEXT,
      
      -- AI extracted data
      emotions JSONB DEFAULT '[]'::jsonb,
      insights JSONB DEFAULT '[]'::jsonb,
      tags JSONB DEFAULT '[]'::jsonb,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      
      UNIQUE(trade_id, user_id)
    );
  ELSE
    -- Table exists, add missing columns
    ALTER TABLE audio_journal_entries 
    ADD COLUMN IF NOT EXISTS summary TEXT,
    ADD COLUMN IF NOT EXISTS emotions JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS insights JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS duration INTEGER,
    ADD COLUMN IF NOT EXISTS audio_url TEXT,
    ADD COLUMN IF NOT EXISTS transcript TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    
    -- Add unique constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'audio_journal_entries_trade_id_user_id_key'
    ) THEN
      ALTER TABLE audio_journal_entries 
      ADD CONSTRAINT audio_journal_entries_trade_id_user_id_key 
      UNIQUE(trade_id, user_id);
    END IF;
  END IF;
END $$;

-- Add audio flag to trades table
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS has_audio_journal BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE audio_journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own audio journals" ON audio_journal_entries;
CREATE POLICY "Users can view their own audio journals"
  ON audio_journal_entries
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own audio journals" ON audio_journal_entries;
CREATE POLICY "Users can insert their own audio journals"
  ON audio_journal_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own audio journals" ON audio_journal_entries;
CREATE POLICY "Users can update their own audio journals"
  ON audio_journal_entries
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own audio journals" ON audio_journal_entries;
CREATE POLICY "Users can delete their own audio journals"
  ON audio_journal_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-journals',
  'audio-journals',
  true,
  10485760, -- 10MB limit
  ARRAY['audio/webm', 'audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for audio-journals bucket
DROP POLICY IF EXISTS "Users can upload their audio" ON storage.objects;
CREATE POLICY "Users can upload their audio"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'audio-journals' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

DROP POLICY IF EXISTS "Anyone can view audio" ON storage.objects;
CREATE POLICY "Anyone can view audio"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'audio-journals');

DROP POLICY IF EXISTS "Users can delete their audio" ON storage.objects;
CREATE POLICY "Users can delete their audio"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'audio-journals' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audio_journal_trade ON audio_journal_entries(trade_id);
CREATE INDEX IF NOT EXISTS idx_audio_journal_user ON audio_journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_journal_created ON audio_journal_entries(user_id, created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE audio_journal_entries IS 'Stores audio journal entries with AI transcription and analysis';
COMMENT ON COLUMN audio_journal_entries.audio_url IS 'URL to audio file in Supabase Storage';
COMMENT ON COLUMN audio_journal_entries.transcript IS 'AI-generated transcript from audio';
COMMENT ON COLUMN audio_journal_entries.summary IS 'AI-generated summary of the journal entry';
COMMENT ON COLUMN audio_journal_entries.emotions IS 'Extracted emotions from speech (JSON array)';
COMMENT ON COLUMN audio_journal_entries.insights IS 'Key insights extracted from journal (JSON array)';
COMMENT ON COLUMN audio_journal_entries.tags IS 'Suggested tags for the journal entry (JSON array)';
