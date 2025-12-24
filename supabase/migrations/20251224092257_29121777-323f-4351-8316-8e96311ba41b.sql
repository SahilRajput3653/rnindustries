-- Create messages table for customer inquiries
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  admin_reply TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  replied_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'replied', 'closed'))
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own messages
CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create messages
CREATE POLICY "Users can create messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON public.messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Policy: Admins can update messages
CREATE POLICY "Admins can update messages"
ON public.messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Add helpful comments
COMMENT ON TABLE public.messages IS 'Customer inquiries and messages';
COMMENT ON COLUMN public.messages.status IS 'Message status: pending, replied, or closed';
COMMENT ON COLUMN public.messages.admin_reply IS 'Admin response to the customer message';

-- Create index for better performance
CREATE INDEX idx_messages_status ON public.messages(status);
CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);