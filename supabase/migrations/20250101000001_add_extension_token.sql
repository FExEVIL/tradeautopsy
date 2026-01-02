-- Add extension token columns to profiles table
-- This allows users to authenticate their browser extension

-- Add the extension_token column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS extension_token TEXT UNIQUE;

-- Add timestamp for when token was created
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS extension_token_created_at TIMESTAMPTZ;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_extension_token 
ON profiles(extension_token) 
WHERE extension_token IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.extension_token IS 'API token for browser extension authentication';
COMMENT ON COLUMN profiles.extension_token_created_at IS 'Timestamp when the extension token was generated';

