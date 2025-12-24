-- Add phone and message columns to quotes table
ALTER TABLE public.quotes 
ADD COLUMN phone TEXT,
ADD COLUMN message TEXT;

-- Add helpful comments
COMMENT ON COLUMN public.quotes.phone IS 'Customer phone number';
COMMENT ON COLUMN public.quotes.message IS 'Customer requirements and message';