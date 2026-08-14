-- ============================================================
-- SUNRISE GARDENS (TRAVANCORE GARDENS)
-- Delta Database Migration Script (Updates Only)
-- Run this in your Supabase SQL Editor if you already ran the base schema.sql
-- ============================================================

-- =====================================
-- 1. UPDATE CUSTOM ENUMS
-- =====================================
-- Add new status values to order_status enum
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'packed';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'out_for_delivery';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'returned';

-- Add new status values to payment_status enum
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'processing';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'completed';

-- =====================================
-- 2. ALTER EXISTING TABLES (ADD MISSING COLUMNS)
-- =====================================

-- PROFILES
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS role text not null default 'customer',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check check (role in ('customer', 'admin', 'manager', 'super_admin'));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ADDRESSES
ALTER TABLE public.addresses 
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS line1 text,
  ADD COLUMN IF NOT EXISTS line2 text;

-- PRODUCTS
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS primary_image_url text,
  ADD COLUMN IF NOT EXISTS care_light text,
  ADD COLUMN IF NOT EXISTS care_water text,
  ADD COLUMN IF NOT EXISTS care_temp text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

-- PRODUCT IMAGES
ALTER TABLE public.product_images 
  ADD COLUMN IF NOT EXISTS public_id text;

-- COUPONS
ALTER TABLE public.coupons 
  ADD COLUMN IF NOT EXISTS is_active boolean default true,
  ADD COLUMN IF NOT EXISTS usage_count integer default 0,
  ADD COLUMN IF NOT EXISTS max_uses integer,
  ADD COLUMN IF NOT EXISTS created_at timestamptz default now();

-- ORDERS
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS status text default 'pending',
  ADD COLUMN IF NOT EXISTS weight numeric default 0.5,
  ADD COLUMN IF NOT EXISTS shipping_cost numeric(10,2) default 0,
  ADD COLUMN IF NOT EXISTS shipping_amount numeric(10,2) default 0,
  ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) default 0,
  ADD COLUMN IF NOT EXISTS coupon_code text,
  ADD COLUMN IF NOT EXISTS shiprocket_order_id text,
  ADD COLUMN IF NOT EXISTS shiprocket_shipment_id text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

-- ORDER ITEMS
ALTER TABLE public.order_items 
  ADD COLUMN IF NOT EXISTS product_name text,
  ADD COLUMN IF NOT EXISTS product_image_url text,
  ADD COLUMN IF NOT EXISTS unit_price numeric,
  ADD COLUMN IF NOT EXISTS total_price numeric,
  ADD COLUMN IF NOT EXISTS price numeric;

-- REVIEWS
ALTER TABLE public.reviews 
  ADD COLUMN IF NOT EXISTS comment text,
  ADD COLUMN IF NOT EXISTS is_verified boolean default false;


-- =====================================
-- 3. CREATE NEW TABLES (IF THEY DON'T EXIST)
-- =====================================

-- BANNERS
create table if not exists public.banners (
  id uuid primary key default uuid_generate_v4(),
  title text,
  subtitle text,
  description text,
  image_url text,
  button_text text,
  button_link text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- BLOG POSTS
create table if not exists public.blog_posts (
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

-- SHIPPING ZONES
create table if not exists public.shipping_zones (
  id uuid primary key default uuid_generate_v4(),
  zone_name text not null,
  coverage_info text,
  shipping_method text default 'Standard',
  delivery_time text,
  charge numeric default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);


-- =====================================
-- 4. FUNCTIONS & TRIGGERS
-- =====================================

-- 1. IS ADMIN Check Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin', 'manager')
    );
$$;

-- 2. Coupon usage increment function
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.coupons
  SET usage_count = usage_count + 1
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Handle new auth user signup (auto-create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, full_name, role, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'customer',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger binding
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- =====================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================

-- Enable RLS on new tables
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Disable RLS on Banners and Shipping Zones (Application configuration tables)
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones DISABLE ROW LEVEL SECURITY;

-- Blog Posts Policies
DROP POLICY IF EXISTS "blog_posts_public_read" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_admin_all"   ON public.blog_posts;

CREATE POLICY "blog_posts_public_read" ON public.blog_posts FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "blog_posts_admin_all"   ON public.blog_posts FOR ALL   USING (public.is_admin());


-- =====================================
-- 6. SEEDING & UPDATING SEEDED DATA
-- =====================================

-- 1. Update existing seeded products with primary_image_url and care instructions
UPDATE public.products SET 
  primary_image_url = 'https://images.pexels.com/photos/6913087/pexels-photo-6913087.jpeg?auto=compress&cs=tinysrgb&w=800',
  care_light = 'Bright, indirect light', care_water = 'Water weekly', care_temp = '18°C - 30°C'
WHERE id = 'b0000000-0000-0000-0000-000000000001';

UPDATE public.products SET 
  primary_image_url = 'https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&cs=tinysrgb&w=800',
  care_light = 'Low to bright light', care_water = 'Water every 2-3 weeks', care_temp = '15°C - 27°C'
WHERE id = 'b0000000-0000-0000-0000-000000000002';

UPDATE public.products SET 
  primary_image_url = 'https://images.pexels.com/photos/1843711/pexels-photo-1843711.jpeg?auto=compress&cs=tinysrgb&w=800',
  care_light = 'Bright, direct sun', care_water = 'Water every 3 weeks', care_temp = '15°C - 27°C'
WHERE id = 'b0000000-0000-0000-0000-000000000003';

UPDATE public.products SET 
  primary_image_url = 'https://images.pexels.com/photos/3511755/pexels-photo-3511755.jpeg?auto=compress&cs=tinysrgb&w=800',
  care_light = 'Bright, filtered light', care_water = 'Water when top soil is dry', care_temp = '16°C - 24°C'
WHERE id = 'b0000000-0000-0000-0000-000000000004';

UPDATE public.products SET 
  primary_image_url = 'https://images.pexels.com/photos/4751978/pexels-photo-4751978.jpeg?auto=compress&cs=tinysrgb&w=800',
  care_light = 'Low to medium light', care_water = 'Water every 3-4 weeks', care_temp = '18°C - 26°C'
WHERE id = 'b0000000-0000-0000-0000-000000000005';

UPDATE public.products SET 
  primary_image_url = 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800',
  care_light = 'Medium, indirect light', care_water = 'Water when leaves droop', care_temp = '18°C - 29°C'
WHERE id = 'b0000000-0000-0000-0000-000000000006';

UPDATE public.products SET 
  primary_image_url = 'https://images.pexels.com/photos/7728873/pexels-photo-7728873.jpeg?auto=compress&cs=tinysrgb&w=800',
  care_light = 'Bright, indirect light', care_water = 'Water every 2 weeks', care_temp = '18°C - 24°C'
WHERE id = 'b0000000-0000-0000-0000-000000000007';

UPDATE public.products SET 
  primary_image_url = 'https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&cs=tinysrgb&w=800',
  care_light = 'Indirect light, high humidity', care_water = 'Keep soil consistently damp', care_temp = '16°C - 24°C'
WHERE id = 'b0000000-0000-0000-0000-000000000008';

UPDATE public.products SET 
  primary_image_url = 'https://images.pexels.com/photos/5945754/pexels-photo-5945754.jpeg?auto=compress&cs=tinysrgb&w=800',
  care_light = 'Full direct sun', care_water = 'Water weekly, drain well', care_temp = '21°C - 29°C'
WHERE id = 'b0000000-0000-0000-0000-000000000009';

UPDATE public.products SET 
  primary_image_url = 'https://images.pexels.com/photos/906150/pexels-photo-906150.jpeg?auto=compress&cs=tinysrgb&w=800',
  care_light = 'Full sun', care_water = 'Water daily', care_temp = '18°C - 25°C'
WHERE id = 'b0000000-0000-0000-0000-000000000010';

-- 2. Insert Default Banner (If missing)
INSERT INTO public.banners (id, title, subtitle, description, image_url, button_text, button_link, is_active) VALUES
('c0000000-0000-0000-0000-000000000001', 'Breathe <br /> <span class="text-primary italic font-serif lowercase font-medium">Life</span> Into <br /> Your Space.', 'Premium Nursery', 'Expertly curated indoor & outdoor plants, delivered directly from our nursery to your doorstep.', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1600', 'Start Shopping', '/shop', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Default Shipping Zone (If missing)
INSERT INTO public.shipping_zones (zone_name, coverage_info, shipping_method, delivery_time, charge, is_active) VALUES
('All India Standard', 'Rest of India', 'Standard', '3-5 business days', 99.00, true)
ON CONFLICT DO NOTHING;
