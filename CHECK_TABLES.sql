-- Quick Verification Query
-- Run this in Supabase SQL Editor to check which tables exist

-- Check all Phase 2, 3, and Feature 23 tables
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('ai_insights', 'predictive_alerts', 'detected_patterns', 'action_plans', 'goals', 'alert_preferences') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ai_insights', 'predictive_alerts', 'detected_patterns', 'action_plans', 'goals', 'alert_preferences')
ORDER BY table_name;

-- If this returns 0 rows, tables don't exist - run the migration!
-- If this returns 6 rows, all tables exist ✅

