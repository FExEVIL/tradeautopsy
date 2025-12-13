-- Create storage bucket for trade screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trade-screenshots',
  'trade-screenshots',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Users can upload their own screenshots
CREATE POLICY "Users can upload own screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'trade-screenshots' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can view their own screenshots
CREATE POLICY "Users can view own screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'trade-screenshots' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can update their own screenshots
CREATE POLICY "Users can update own screenshots"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'trade-screenshots' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can delete their own screenshots
CREATE POLICY "Users can delete own screenshots"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'trade-screenshots' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

