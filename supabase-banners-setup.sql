-- ============================================================
-- TRAVANCORE GARDENS - BANNERS & CAROUSEL SETUP (SAFE MIGRATION)
-- Run this script in the Supabase SQL Editor
-- ============================================================

-- 1. Ensure UUID extension is active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the Banners Table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    button_text TEXT DEFAULT 'Start Shopping',
    button_link TEXT DEFAULT '/shop',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Safely add columns if the table already existed with fewer columns
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 4. Create Indexes for Fast Queries
CREATE INDEX IF NOT EXISTS idx_banners_active ON public.banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_created ON public.banners(created_at DESC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "banners_public_select" ON public.banners;
DROP POLICY IF EXISTS "banners_admin_all" ON public.banners;
DROP POLICY IF EXISTS "Everyone can view active banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can manage banners" ON public.banners;

-- 7. Create RLS Policies
-- Public visitors can see active banners
CREATE POLICY "banners_public_select" 
ON public.banners 
FOR SELECT 
USING (is_active = true);

-- Admins and staff can view, insert, update, and delete all banners
CREATE POLICY "banners_admin_all" 
ON public.banners 
FOR ALL 
USING (
    public.is_admin() 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'manager', 'super_admin')
    )
);

-- 8. Insert Initial Starter Banners (Standard columns)
INSERT INTO public.banners (title, subtitle, description, image_url, button_text, button_link, is_active)
VALUES 
(
    'Breathe <br /> <span class="text-primary italic font-serif lowercase font-medium">Life</span> Into <br /> Your Space.',
    'Premium Nursery',
    'Expertly curated indoor & outdoor plants, delivered directly from our Kerala nursery to your doorstep.',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1600',
    'Start Shopping',
    '/shop',
    true
),
(
    'Rare <br /> <span class="text-primary italic font-serif lowercase font-medium">Tropical</span> Gems <br /> For Plant Lovers.',
    'Collector Choice',
    'Explore rare Monsteras, Philodendrons, and Calatheas with specialized live-transit packaging guarantee.',
    'https://images.unsplash.com/photo-1466692476878-424526bf1639?auto=format&fit=crop&q=80&w=1600',
    'Explore Rare Plants',
    '/shop?category=rare',
    true
)
ON CONFLICT DO NOTHING;
