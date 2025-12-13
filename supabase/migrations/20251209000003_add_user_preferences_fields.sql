-- ============================================
-- Additional User Preferences Fields
-- ============================================

-- Add new preference fields
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS sidebar_collapsed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS taskbar_visible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS default_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS market_status_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS morning_brief_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS morning_brief_last_read TIMESTAMPTZ;
