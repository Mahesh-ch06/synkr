-- ============================================================
-- Synkr Database Schema (Run in Supabase SQL Editor)
-- ============================================================

-- Drop existing tables if recreating
DROP TABLE IF EXISTS public.bills CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.groceries CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- Bills Table
CREATE TABLE public.bills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    category TEXT NOT NULL,
    is_autopay BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT false,
    recurring_interval TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    paid_date DATE,
    notes TEXT,
    remind_days_before INTEGER DEFAULT 3,
    provider TEXT,
    account_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Groceries Table (matches store table name 'groceries')
CREATE TABLE public.groceries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    frequency TEXT NOT NULL,
    last_purchase_date DATE,
    next_purchase_date DATE NOT NULL,
    quantity TEXT,
    estimated_price NUMERIC,
    category TEXT,
    auto_remind BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    billing_cycle TEXT NOT NULL,
    category TEXT NOT NULL,
    renewal_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_used_date DATE,
    logo_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groceries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Open policies: Since we use Clerk (not Supabase Auth), auth.uid() won't work.
-- We filter by user_id in application code. These policies allow all operations via anon key.
CREATE POLICY "Allow all for bills" ON public.bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for groceries" ON public.groceries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for subscriptions" ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);
