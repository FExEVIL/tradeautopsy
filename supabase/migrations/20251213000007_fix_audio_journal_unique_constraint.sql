-- Fix: Add unique constraint to audio_journal_entries if it doesn't exist
-- This ensures upsert operations work correctly

DO $$ 
BEGIN
  -- Check if unique constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'audio_journal_entries_trade_id_user_id_key'
    AND conrelid = 'audio_journal_entries'::regclass
  ) THEN
    -- Add unique constraint
    ALTER TABLE audio_journal_entries 
    ADD CONSTRAINT audio_journal_entries_trade_id_user_id_key 
    UNIQUE(trade_id, user_id);
    
    RAISE NOTICE 'Added unique constraint on (trade_id, user_id)';
  ELSE
    RAISE NOTICE 'Unique constraint already exists';
  END IF;
END $$;
