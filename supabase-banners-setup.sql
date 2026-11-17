-- ============================================================
-- TRAVANCORE GARDENS - BANNERS & CAROUSEL SETUP
-- Run this script in the Supabase SQL Editor
-- ============================================================

-- 1. Ensure UUID extension is active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the Banners Table
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    button_text TEXT DEFAULT 'Start Shopping',
    button_link TEXT DEFAULT '/shop',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Index for Fast Queries
CREATE INDEX IF NOT EXISTS idx_banners_active ON public.banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_created ON public.banners(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "banners_public_select" ON public.banners;
DROP POLICY IF EXISTS "banners_admin_all" ON public.banners;
DROP POLICY IF EXISTS "Everyone can view active banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can manage banners" ON public.banners;

-- 6. Create RLS Policies
-- Public visitors can see active banners
CREATE POLICY "banners_public_select" 
ON public.banners 
FOR SELECT 
USING (is_active = true);

-- Admins and authenticated staff can view, insert, update, and delete all banners
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

-- 7. Insert Initial Default Banners
INSERT INTO public.banners (title, subtitle, description, image_url, button_text, button_link, is_active, display_order)
VALUES 
(
    'Breathe <br /> <span class="text-primary italic font-serif lowercase font-medium">Life</span> Into <br /> Your Space.',
    'Premium Nursery',
    'Expertly curated indoor & outdoor plants, delivered directly from our Kerala nursery to your doorstep.',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1600',
    'Start Shopping',
    '/shop',
    true,
    1
),
(
    'Rare <br /> <span class="text-primary italic font-serif lowercase font-medium">Tropical</span> Gems <br /> For Plant Lovers.',
    'Collector Choice',
    'Explore rare Monsteras, Philodendrons, and Calatheas with specialized live-transit packaging guarantee.',
    'https://images.unsplash.com/photo-1466692476878-424526bf1639?auto=format&fit=crop&q=80&w=1600',
    'Explore Rare Plants',
    '/shop?category=rare',
    true,
    2
)
ON CONFLICT DO NOTHING;
