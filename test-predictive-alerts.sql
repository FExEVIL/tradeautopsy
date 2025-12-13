-- Verification Queries for Predictive Alerts Feature
-- Run these in Supabase SQL Editor after migration

-- 1. Check if tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('predictive_alerts', 'alert_preferences')
ORDER BY table_name;

-- 2. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'predictive_alerts'
ORDER BY ordinal_position;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'alert_preferences'
ORDER BY ordinal_position;

-- 3. Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('predictive_alerts', 'alert_preferences')
ORDER BY tablename, indexname;

-- 4. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('predictive_alerts', 'alert_preferences')
ORDER BY tablename, policyname;

-- 5. Test insert (replace 'YOUR_USER_ID' with actual user ID)
-- This will create default preferences for a user
INSERT INTO alert_preferences (user_id)
VALUES ('YOUR_USER_ID')
ON CONFLICT (user_id) DO NOTHING
RETURNING *;

-- 6. Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('predictive_alerts', 'alert_preferences');

