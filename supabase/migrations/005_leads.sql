-- Table to store B2B leads and custom quote requests
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    type TEXT NOT NULL,
    email TEXT,
    product_name TEXT,
    quantity TEXT,
    notes TEXT,
    status TEXT DEFAULT 'new'
);
-- RLS Policies
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
-- Allow anonymous and authenticated users to insert requests
CREATE POLICY "Enable insert for everyone" ON public.leads FOR
INSERT WITH CHECK (true);
-- Only admins can view the leads
CREATE POLICY "Enable read for admins" ON public.leads FOR
SELECT USING (auth.jwt()->>'email' = 'info@cristalmad.com');
-- Replace with actual admin logic