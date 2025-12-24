-- Add explicit policies to deny public access to sensitive data

-- For orders table: Deny all public access explicitly
CREATE POLICY "Deny public access to orders"
ON public.orders
FOR ALL
TO anon
USING (false);

-- For profiles table: Deny all public access explicitly  
CREATE POLICY "Deny public access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);