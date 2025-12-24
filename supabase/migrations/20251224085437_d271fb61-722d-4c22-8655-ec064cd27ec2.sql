-- Create function to decrement product stock
CREATE OR REPLACE FUNCTION public.decrement_stock(product_id UUID, quantity INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock = GREATEST(stock - quantity, 0)
  WHERE id = product_id;
END;
$$;