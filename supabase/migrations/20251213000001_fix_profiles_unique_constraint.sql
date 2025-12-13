-- ============================================
-- Fix Profiles Unique Constraint
-- ============================================
-- This migration fixes the incorrect unique constraint on user_id
-- The correct constraint should be on (user_id, name) to allow multiple profiles per user

-- Drop the incorrect unique constraint on user_id if it exists
DO $$ 
BEGIN
  -- Drop constraint if it exists (various possible names)
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_user_id_key'
    AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_user_id_key;
    RAISE NOTICE 'Dropped incorrect constraint: profiles_user_id_key';
  END IF;
  
  -- Also check for any other unique constraints on just user_id
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname LIKE '%user_id%key%'
    AND conrelid = 'profiles'::regclass
    AND contype = 'u'
    AND array_length(conkey, 1) = 1
  ) THEN
    -- Get the constraint name and drop it
    DECLARE
      constraint_name TEXT;
    BEGIN
      SELECT conname INTO constraint_name
      FROM pg_constraint 
      WHERE conname LIKE '%user_id%key%'
      AND conrelid = 'profiles'::regclass
      AND contype = 'u'
      AND array_length(conkey, 1) = 1
      LIMIT 1;
      
      IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Dropped incorrect constraint: %', constraint_name;
      END IF;
    END;
  END IF;
END $$;

-- Ensure the correct constraint exists (user_id, name) unique
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_user_id_name_unique'
    AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_user_id_name_unique UNIQUE(user_id, name);
    RAISE NOTICE 'Added correct constraint: profiles_user_id_name_unique';
  ELSE
    RAISE NOTICE 'Correct constraint already exists: profiles_user_id_name_unique';
  END IF;
END $$;

-- Verify the constraint
DO $$
DECLARE
  constraint_count INTEGER;
  constraint_name TEXT;
  constraint_columns TEXT[];
BEGIN
  -- Count unique constraints
  SELECT COUNT(*), string_agg(conname, ', '), array_agg(conkey)
  INTO constraint_count, constraint_name, constraint_columns
  FROM pg_constraint 
  WHERE conrelid = 'profiles'::regclass
  AND contype = 'u';
  
  RAISE NOTICE 'Unique constraints on profiles table: %', constraint_count;
  RAISE NOTICE 'Constraint names: %', constraint_name;
  
  -- Verify we have the correct constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_user_id_name_unique'
    AND conrelid = 'profiles'::regclass
  ) THEN
    RAISE EXCEPTION 'Correct constraint profiles_user_id_name_unique not found after migration!';
  END IF;
END $$;
