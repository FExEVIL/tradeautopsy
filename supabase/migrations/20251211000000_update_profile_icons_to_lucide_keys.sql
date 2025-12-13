-- Migration: Update profile icons from emojis to Lucide icon keys
-- This migration converts emoji icons stored in the profiles.icon column
-- to Lucide icon keys for consistent, professional icon rendering

-- Update icon column comment
COMMENT ON COLUMN profiles.icon IS 'Lucide icon key (e.g., fno, equity, options, default) instead of emoji';

-- Map existing emoji icons to icon keys based on profile type
-- If type exists, use it; otherwise map common emojis to keys
UPDATE profiles 
SET icon = CASE
  -- If type is set, use it as icon key
  WHEN type IS NOT NULL AND type != '' THEN type
  -- Map common emojis to icon keys
  WHEN icon LIKE '%📊%' OR icon LIKE '%📈%' THEN 'default'
  WHEN icon LIKE '%💰%' THEN 'equity'
  WHEN icon LIKE '%🎯%' THEN 'options'
  WHEN icon LIKE '%⚡%' THEN 'crypto'
  WHEN icon LIKE '%🔥%' THEN 'fno'
  WHEN icon LIKE '%🚀%' THEN 'swing'
  WHEN icon LIKE '%💎%' THEN 'equity'
  -- Default fallback
  ELSE 'default'
END
WHERE icon IS NOT NULL;

-- For profiles with NULL icon, set based on type or default
UPDATE profiles
SET icon = COALESCE(
  NULLIF(type, ''),
  'default'
)
WHERE icon IS NULL OR icon = '';

-- Ensure all profiles have a valid icon key
UPDATE profiles
SET icon = 'default'
WHERE icon IS NULL OR icon = '';
