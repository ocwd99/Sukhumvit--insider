-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('payment-receipts', 'payment-receipts', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Anyone can view payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload payment receipts" ON storage.objects;

CREATE POLICY "Anyone can view payment receipts" ON storage.objects FOR SELECT USING (bucket_id = 'payment-receipts');
CREATE POLICY "Authenticated users can upload payment receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-receipts' AND auth.role() = 'authenticated');
