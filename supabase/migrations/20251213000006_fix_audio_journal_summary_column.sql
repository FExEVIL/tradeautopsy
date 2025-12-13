-- ============================================
-- Fix: Add missing summary column to audio_journal_entries
-- ============================================
-- This migration fixes the case where the table was created without the summary column

-- Add summary column if it doesn't exist
ALTER TABLE audio_journal_entries 
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Add any other missing columns that might be needed
ALTER TABLE audio_journal_entries 
ADD COLUMN IF NOT EXISTS emotions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS insights JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS duration INTEGER,
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS transcript TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update comment for summary column
COMMENT ON COLUMN audio_journal_entries.summary IS 'AI-generated summary of the journal entry';
