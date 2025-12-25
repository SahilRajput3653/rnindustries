-- Create site_settings table for design and appearance customization
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view site settings
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Only admins can update site settings
CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('theme_colors', '{"primary": "215 75% 45%", "accent": "30 90% 55%", "destructive": "0 84% 60%"}'::jsonb),
('hero_content', '{"title": "Welcome to RN Industries", "subtitle": "Quality products for your business", "cta_text": "Shop Now"}'::jsonb),
('seo_settings', '{"site_title": "RN Industries", "meta_description": "Your trusted partner for industrial products", "meta_keywords": "industrial, products, manufacturing"}'::jsonb),
('social_media', '{"facebook": "", "twitter": "", "instagram": "", "linkedin": ""}'::jsonb),
('site_images', '{"logo_url": "", "hero_image": "", "favicon": ""}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;