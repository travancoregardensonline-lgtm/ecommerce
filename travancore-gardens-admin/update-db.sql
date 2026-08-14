-- ============================================================
-- DATABASE SCHEMA UPDATES
-- Travancore Gardens
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. ADD COLUMNS TO ORDERS TABLE
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_cost numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_code text,
ADD COLUMN IF NOT EXISTS shiprocket_order_id text,
ADD COLUMN IF NOT EXISTS shiprocket_shipment_id text;

-- 2. UPDATE COUPONS TABLE
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS usage_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_uses integer,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 3. VERIFY
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('shipping_cost', 'discount_amount', 'coupon_code', 'shiprocket_order_id');

-- 4. RPC for Incrementing Coupon Usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.coupons
  SET usage_count = usage_count + 1
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. BLOG POSTS
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    slug text not null unique,
    excerpt text,
    content text,
    image_url text,
    category text,
    is_published boolean default false,
    read_time text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- RLS for Blog Posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_posts_public_read" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_admin_all" ON public.blog_posts;

CREATE POLICY "blog_posts_public_read" ON public.blog_posts FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "blog_posts_admin_all" ON public.blog_posts FOR ALL USING (public.is_admin());
