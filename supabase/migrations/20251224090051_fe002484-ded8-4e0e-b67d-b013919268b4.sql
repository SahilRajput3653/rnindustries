-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Storage policies for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Update products table to support multiple images
ALTER TABLE public.products 
ADD COLUMN image_urls TEXT[] DEFAULT '{}';

-- Migrate existing image_url data to image_urls array
UPDATE public.products 
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL;

-- Keep image_url for backward compatibility but make it nullable
ALTER TABLE public.products 
ALTER COLUMN image_url DROP NOT NULL;