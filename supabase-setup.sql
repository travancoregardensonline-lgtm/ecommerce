-- ============================================================
-- SUNRISE GARDENS (TRAVANCORE GARDENS)
-- Complete Supabase Database Setup Script (Admin & Ecommerce)
-- Run this script in the Supabase SQL Editor
-- ============================================================

-- =====================================
-- 1. EXTENSIONS
-- =====================================
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- =====================================
-- 2. CUSTOM ENUMS / TYPES
-- =====================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM (
      'pending', 
      'processing', 
      'paid', 
      'completed', 
      'failed', 
      'refunded'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM (
      'pending', 
      'confirmed', 
      'processing', 
      'packed', 
      'shipped', 
      'out_for_delivery', 
      'delivered', 
      'cancelled', 
      'returned'
    );
  END IF;
END $$;

-- =====================================
-- 3. TABLES DEFINITIONS
-- =====================================

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  full_name text, -- Matches TypeScript & API routes
  phone text,
  email text,
  avatar_url text,
  role text not null default 'customer',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint profiles_role_check check (role in ('customer', 'admin', 'manager', 'super_admin'))
);

create index if not exists idx_profiles_phone on public.profiles(phone);
create index if not exists idx_profiles_role on public.profiles(role);

-- ADDRESSES
create table if not exists public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  full_name text,
  name text,              -- Compatibility alias
  phone text,
  address_line1 text,
  address_line2 text,
  line1 text,             -- Compatibility alias
  line2 text,             -- Compatibility alias
  city text,
  state text,
  pincode text,
  country text default 'India',
  is_default boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_address_user on public.addresses(user_id);

-- CATEGORIES
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique,
  description text,
  image_url text,
  parent_id uuid references public.categories(id) on delete set null,
  created_at timestamptz default now()
);

-- PRODUCTS
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique,
  description text,
  short_description text,
  category_id uuid references public.categories(id) on delete set null,
  price numeric(10,2),
  sale_price numeric(10,2),
  sku text,
  stock integer default 0,
  weight numeric default 0.5,
  height numeric,
  width numeric,
  length numeric,
  is_active boolean default true,
  primary_image_url text, -- Queried in API order routes
  care_light text,
  care_water text,
  care_temp text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_category on public.products(category_id);

-- PRODUCT IMAGES
create table if not exists public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade,
  image_url text not null,
  public_id text,
  is_primary boolean default false,
  created_at timestamptz default now()
);

-- PRODUCT VARIANTS
create table if not exists public.product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade,
  variant_name text,
  price numeric,
  stock integer,
  sku text,
  created_at timestamptz default now()
);

-- CARTS
create table if not exists public.carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create index if not exists idx_cart_user on public.carts(user_id);

-- CART ITEMS
create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid references public.carts(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity integer default 1,
  created_at timestamptz default now()
);

-- WISHLISTS
create table if not exists public.wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);
create index if not exists idx_wishlist_user on public.wishlists(user_id);

-- WISHLIST ITEMS
create table if not exists public.wishlist_items (
  id uuid primary key default uuid_generate_v4(),
  wishlist_id uuid references public.wishlists(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamptz default now()
);

-- COUPONS
create table if not exists public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text unique,
  discount_type text,
  discount_value numeric,
  min_order_value numeric,
  expiry_date timestamptz,
  is_active boolean default true,
  usage_count integer default 0,
  max_uses integer,
  created_at timestamptz default now()
);

-- ORDERS
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique,
  user_id uuid references public.profiles(id) on delete set null,
  address_id uuid references public.addresses(id) on delete set null,
  total_amount numeric(10,2),
  payment_method text,
  payment_status payment_status default 'pending',
  order_status order_status default 'pending',
  status text default 'pending',            -- Compatibility alias used by API orders POST route
  courier_partner text,
  tracking_number text,
  weight numeric default 0.5,
  shipping_cost numeric(10,2) default 0,
  shipping_amount numeric(10,2) default 0,  -- Compatibility alias used by API orders POST route
  discount_amount numeric(10,2) default 0,
  coupon_code text,
  shiprocket_order_id text,
  shiprocket_shipment_id text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_orders_user on public.orders(user_id);

-- ORDER ITEMS
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text,                      -- Queried & inserted by API routes
  product_image_url text,                 -- Queried & inserted by API routes
  quantity integer,
  unit_price numeric,                     -- Inserted by API routes
  total_price numeric,                    -- Inserted by API routes
  price numeric,                          -- Compatibility alias
  created_at timestamptz default now()
);

-- PAYMENTS
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete set null,
  payment_gateway text,
  transaction_id text,
  amount numeric,
  payment_status payment_status,
  created_at timestamptz default now()
);

-- SHIPMENTS
create table if not exists public.shipments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  courier text,
  tracking_number text,
  shipment_status text,
  shipped_at timestamptz,
  delivered_at timestamptz
);

-- REVIEWS
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  rating integer check (rating between 1 and 5),
  review text,
  comment text,                   -- Compatibility alias
  is_verified boolean default false, -- Compatibility alias
  created_at timestamptz default now()
);

-- INVOICES
create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  invoice_number text,
  invoice_url text,
  created_at timestamptz default now()
);

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

-- Enable RLS on all relevant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Note: RLS is disabled on Banners and Shipping Zones based on application requirements
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones DISABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

CREATE POLICY "profiles_select_own"   ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_insert_own"   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_admin_all"    ON public.profiles FOR ALL USING (public.is_admin());

-- Addresses Policies
DROP POLICY IF EXISTS "addresses_own" ON public.addresses;
DROP POLICY IF EXISTS "addresses_admin" ON public.addresses;

CREATE POLICY "addresses_own"   ON public.addresses FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "addresses_admin" ON public.addresses FOR ALL USING (public.is_admin());

-- Categories Policies
DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_all"   ON public.categories;

CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_all"   ON public.categories FOR ALL   USING (public.is_admin());

-- Products Policies
DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "products_admin_all"   ON public.products;

CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "products_admin_all"   ON public.products FOR ALL   USING (public.is_admin());

-- Product Images Policies
DROP POLICY IF EXISTS "product_images_public_read" ON public.product_images;
DROP POLICY IF EXISTS "product_images_admin_all"   ON public.product_images;

CREATE POLICY "product_images_public_read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "product_images_admin_all"   ON public.product_images FOR ALL   USING (public.is_admin());

-- Product Variants Policies
DROP POLICY IF EXISTS "variants_public_read" ON public.product_variants;
DROP POLICY IF EXISTS "variants_admin_all"   ON public.product_variants;

CREATE POLICY "variants_public_read" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "variants_admin_all"   ON public.product_variants FOR ALL   USING (public.is_admin());

-- Carts Policies
DROP POLICY IF EXISTS "carts_own"   ON public.carts;
DROP POLICY IF EXISTS "carts_admin" ON public.carts;

CREATE POLICY "carts_own"   ON public.carts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "carts_admin" ON public.carts FOR ALL USING (public.is_admin());

-- Cart Items Policies
DROP POLICY IF EXISTS "cart_items_own"   ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_admin" ON public.cart_items;

CREATE POLICY "cart_items_own" ON public.cart_items FOR ALL
    USING (EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid()));
CREATE POLICY "cart_items_admin" ON public.cart_items FOR ALL USING (public.is_admin());

-- Wishlists Policies
DROP POLICY IF EXISTS "wishlists_own"   ON public.wishlists;
DROP POLICY IF EXISTS "wishlists_admin" ON public.wishlists;
CREATE POLICY "wishlists_own"   ON public.wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "wishlists_admin" ON public.wishlists FOR ALL USING (public.is_admin());

-- Wishlist Items Policies
DROP POLICY IF EXISTS "wishlist_items_own"   ON public.wishlist_items;
DROP POLICY IF EXISTS "wishlist_items_admin" ON public.wishlist_items;
CREATE POLICY "wishlist_items_own" ON public.wishlist_items FOR ALL
    USING (EXISTS (SELECT 1 FROM public.wishlists WHERE id = wishlist_items.wishlist_id AND user_id = auth.uid()));
CREATE POLICY "wishlist_items_admin" ON public.wishlist_items FOR ALL USING (public.is_admin());

-- Orders Policies
DROP POLICY IF EXISTS "orders_own"          ON public.orders;
DROP POLICY IF EXISTS "orders_admin_all"    ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own"   ON public.orders;

CREATE POLICY "orders_own"       ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "orders_admin_all" ON public.orders FOR ALL   USING (public.is_admin());

-- Order Items Policies
DROP POLICY IF EXISTS "order_items_own"   ON public.order_items;
DROP POLICY IF EXISTS "order_items_admin" ON public.order_items;

CREATE POLICY "order_items_own" ON public.order_items FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "order_items_insert_own" ON public.order_items FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "order_items_admin" ON public.order_items FOR ALL USING (public.is_admin());

-- Payments Policies
DROP POLICY IF EXISTS "payments_own"   ON public.payments;
DROP POLICY IF EXISTS "payments_admin" ON public.payments;

CREATE POLICY "payments_own" ON public.payments FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.orders WHERE id = payments.order_id AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "payments_admin" ON public.payments FOR ALL USING (public.is_admin());

-- Shipments Policies
DROP POLICY IF EXISTS "shipments_own"   ON public.shipments;
DROP POLICY IF EXISTS "shipments_admin" ON public.shipments;

CREATE POLICY "shipments_own" ON public.shipments FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.orders WHERE id = shipments.order_id AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "shipments_admin" ON public.shipments FOR ALL USING (public.is_admin());

-- Reviews Policies
DROP POLICY IF EXISTS "reviews_public_read"  ON public.reviews;
DROP POLICY IF EXISTS "reviews_own_write"    ON public.reviews;
DROP POLICY IF EXISTS "reviews_admin_all"    ON public.reviews;

CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_own_write"   ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_admin_all"   ON public.reviews FOR ALL   USING (public.is_admin());

-- Coupons Policies
DROP POLICY IF EXISTS "coupons_public_read" ON public.coupons;
DROP POLICY IF EXISTS "coupons_admin_all"   ON public.coupons;

CREATE POLICY "coupons_public_read" ON public.coupons FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "coupons_admin_all"   ON public.coupons FOR ALL   USING (public.is_admin());

-- Invoices Policies
DROP POLICY IF EXISTS "invoices_own"   ON public.invoices;
DROP POLICY IF EXISTS "invoices_admin" ON public.invoices;

CREATE POLICY "invoices_own" ON public.invoices FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.orders WHERE id = invoices.order_id AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "invoices_admin" ON public.invoices FOR ALL USING (public.is_admin());

-- Blog Posts Policies
DROP POLICY IF EXISTS "blog_posts_public_read" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_admin_all"   ON public.blog_posts;

CREATE POLICY "blog_posts_public_read" ON public.blog_posts FOR SELECT USING (is_published = true OR public.is_admin());
CREATE POLICY "blog_posts_admin_all"   ON public.blog_posts FOR ALL   USING (public.is_admin());


-- =====================================
-- 6. SEED DATA (CATEGORIES, PRODUCTS, IMAGES, BANNERS)
-- =====================================

-- 1. Insert 10 Categories
INSERT INTO public.categories (id, name, slug, description, image_url) VALUES 
('a0000000-0000-0000-0000-000000000001', 'Indoor Plants', 'indoor-plants', 'Bring life to your home with our beautiful indoor plants.', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=600'),
('a0000000-0000-0000-0000-000000000002', 'Air-Purifying Plants', 'air-purifying', 'Plants that clean the air and improve your indoor environment.', 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=600'),
('a0000000-0000-0000-0000-000000000003', 'Succulents', 'succulents', 'Easy to care for and incredibly stylish succulents.', 'https://images.unsplash.com/photo-1459156212000-ee46e3868662?auto=format&fit=crop&q=80&w=600'),
('a0000000-0000-0000-0000-000000000004', 'Ferns', 'ferns', 'Lush, feathery fronds to add a soft touch to any room.', 'https://images.unsplash.com/photo-1601242551403-883a8b417e25?auto=format&fit=crop&q=80&w=600'),
('a0000000-0000-0000-0000-000000000005', 'Flowering Plants', 'flowering-plants', 'Brighten your space with beautiful blooms.', 'https://images.unsplash.com/photo-1588168249053-90d1eedfb2b6?auto=format&fit=crop&q=80&w=600'),
('a0000000-0000-0000-0000-000000000006', 'Low Light Plants', 'low-light', 'Perfect plants for offices and dimly lit spaces.', 'https://images.unsplash.com/photo-1597055900035-7c980327f12e?auto=format&fit=crop&q=80&w=600'),
('a0000000-0000-0000-0000-000000000007', 'Bonsai Trees', 'bonsai', 'Miniature trees that bring zen to your desk or garden.', 'https://images.unsplash.com/photo-1599598425947-33001c3e6ebc?auto=format&fit=crop&q=80&w=600'),
('a0000000-0000-0000-0000-000000000008', 'Fruit Plants', 'fruit-plants', 'Grow your own delicious fruits at home.', 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&q=80&w=600'),
('a0000000-0000-0000-0000-000000000009', 'Herbs & Edibles', 'herbs-edibles', 'Fresh, aromatic herbs for your kitchen garden.', 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=600'),
('a0000000-0000-0000-0000-000000000010', 'Outdoor Plants', 'outdoor-plants', 'Hardy plants to beautify your balcony or garden.', 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&q=80&w=600')
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert 10 Products associated with the above categories
INSERT INTO public.products (id, name, slug, description, short_description, category_id, price, sale_price, sku, stock, weight, is_active, primary_image_url, care_light, care_water, care_temp) VALUES
('b0000000-0000-0000-0000-000000000001', 'Monstera Deliciosa', 'monstera-deliciosa', 'Famous for its natural leaf holes, the Monstera Deliciosa is a vibrant addition to any indoor space. Thrives in bright, indirect light.', 'A classic indoor plant with dramatic, split leaves.', 'a0000000-0000-0000-0000-000000000001', 1299.00, 999.00, 'PL-MON-001', 50, 1.5, true, 'https://images.pexels.com/photos/6913087/pexels-photo-6913087.jpeg?auto=compress&cs=tinysrgb&w=800', 'Bright, indirect light', 'Water weekly', '18°C - 30°C'),
('b0000000-0000-0000-0000-000000000002', 'Snake Plant Laurentii', 'snake-plant', 'An extremely hardy houseplant that purifies the air. It has stiff, sword-like leaves with yellow edges and requires very little water.', 'Hardy, air-purifying plant perfect for beginners.', 'a0000000-0000-0000-0000-000000000002', 799.00, 599.00, 'PL-SNK-001', 100, 1.2, true, 'https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&cs=tinysrgb&w=800', 'Low to bright light', 'Water every 2-3 weeks', '15°C - 27°C'),
('b0000000-0000-0000-0000-000000000003', 'Aloe Vera', 'aloe-vera', 'A widely known succulent valued for its medicinal and skin care properties, plus it looks great on a sunny windowsill.', 'Minimalist succulent with soothing gel properties.', 'a0000000-0000-0000-0000-000000000003', 399.00, 299.00, 'PL-ALOE-001', 80, 0.8, true, 'https://images.pexels.com/photos/1843711/pexels-photo-1843711.jpeg?auto=compress&cs=tinysrgb&w=800', 'Bright, direct sun', 'Water every 3 weeks', '15°C - 27°C'),
('b0000000-0000-0000-0000-000000000004', 'Fiddle Leaf Fig', 'fiddle-leaf-fig', 'This stunning tall plant has very large, heavily veined, violin-shaped leaves that grow upright. Perfect for making a statement.', 'Large, sculptural, violin-shaped green leaves.', 'a0000000-0000-0000-0000-000000000001', 1999.00, 1699.00, 'PL-FIG-001', 30, 3.0, true, 'https://images.pexels.com/photos/3511755/pexels-photo-3511755.jpeg?auto=compress&cs=tinysrgb&w=800', 'Bright, filtered light', 'Water when top soil is dry', '16°C - 24°C'),
('b0000000-0000-0000-0000-000000000005', 'ZZ Plant', 'zz-plant', 'Characterized by its shiny, wide, oval-shaped leaves. Very easy to maintain and famously tolerates low light environments.', 'Virtually indestructible plant for low-light spaces.', 'a0000000-0000-0000-0000-000000000006', 899.00, 749.00, 'PL-ZZ-001', 60, 1.0, true, 'https://images.pexels.com/photos/4751978/pexels-photo-4751978.jpeg?auto=compress&cs=tinysrgb&w=800', 'Low to medium light', 'Water every 3-4 weeks', '18°C - 26°C'),
('b0000000-0000-0000-0000-000000000006', 'Peace Lily', 'peace-lily', 'A graceful plant with dark green foliage and beautiful white flowers. Excellent at cleaning indoor air of toxins.', 'Elegant white blooms and air-filtering green foliage.', 'a0000000-0000-0000-0000-000000000005', 699.00, 699.00, 'PL-PLY-001', 45, 1.1, true, 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800', 'Medium, indirect light', 'Water when leaves droop', '18°C - 29°C'),
('b0000000-0000-0000-0000-000000000007', 'Jade Plant', 'jade-plant', 'A popular succulent houseplant with fleshy, oval-shaped leaves. Traditionally believed to bring good luck and prosperity.', 'A lucky succulent with thick, glossy foliage.', 'a0000000-0000-0000-0000-000000000003', 499.00, 399.00, 'PL-JAD-001', 75, 0.7, true, 'https://images.pexels.com/photos/7728873/pexels-photo-7728873.jpeg?auto=compress&cs=tinysrgb&w=800', 'Bright, indirect light', 'Water every 2 weeks', '18°C - 24°C'),
('b0000000-0000-0000-0000-000000000008', 'Boston Fern', 'boston-fern', 'Known for its lush, arching fronds, the Boston Fern is ideal for hanging baskets or tall plant pedestals in humid rooms.', 'Lush, classic fern for hanging baskets.', 'a0000000-0000-0000-0000-000000000004', 599.00, 599.00, 'PL-FRN-001', 40, 1.3, true, 'https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&cs=tinysrgb&w=800', 'Indirect light, high humidity', 'Keep soil consistently damp', '16°C - 24°C'),
('b0000000-0000-0000-0000-000000000009', 'Dwarf Lemon Tree', 'dwarf-lemon-tree', 'Grow fresh, juicy lemons at home with this compact dwarf citrus tree, ideal for sunny patios or bright sunrooms.', 'A compact citrus tree producing real, edible lemons.', 'a0000000-0000-0000-0000-000000000008', 1499.00, 1299.00, 'PL-LMN-001', 20, 2.5, true, 'https://images.pexels.com/photos/5945754/pexels-photo-5945754.jpeg?auto=compress&cs=tinysrgb&w=800', 'Full direct sun', 'Water weekly, drain well', '21°C - 29°C'),
('b0000000-0000-0000-0000-000000000010', 'Sweet Basil', 'sweet-basil', 'A fragrant, culinary herb perfect for your kitchen window. Ready to harvest and use directly in your home cooking.', 'Aromatic culinary herb for indoor or outdoor growing.', 'a0000000-0000-0000-0000-000000000009', 249.00, 199.00, 'PL-BSL-001', 120, 0.5, true, 'https://images.pexels.com/photos/906150/pexels-photo-906150.jpeg?auto=compress&cs=tinysrgb&w=800', 'Full sun', 'Water daily', '18°C - 25°C')
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Product Images (Beautiful fallback image urls from Pexels)
INSERT INTO public.product_images (product_id, image_url, is_primary) VALUES
('b0000000-0000-0000-0000-000000000001', 'https://images.pexels.com/photos/6913087/pexels-photo-6913087.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('b0000000-0000-0000-0000-000000000002', 'https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('b0000000-0000-0000-0000-000000000003', 'https://images.pexels.com/photos/1843711/pexels-photo-1843711.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('b0000000-0000-0000-0000-000000000004', 'https://images.pexels.com/photos/3511755/pexels-photo-3511755.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('b0000000-0000-0000-0000-000000000005', 'https://images.pexels.com/photos/4751978/pexels-photo-4751978.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('b0000000-0000-0000-0000-000000000006', 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('b0000000-0000-0000-0000-000000000007', 'https://images.pexels.com/photos/7728873/pexels-photo-7728873.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('b0000000-0000-0000-0000-000000000008', 'https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('b0000000-0000-0000-0000-000000000009', 'https://images.pexels.com/photos/5945754/pexels-photo-5945754.jpeg?auto=compress&cs=tinysrgb&w=800', true),
('b0000000-0000-0000-0000-000000000010', 'https://images.pexels.com/photos/906150/pexels-photo-906150.jpeg?auto=compress&cs=tinysrgb&w=800', true)
ON CONFLICT DO NOTHING;

-- 4. Insert Default Banner
INSERT INTO public.banners (id, title, subtitle, description, image_url, button_text, button_link, is_active) VALUES
('c0000000-0000-0000-0000-000000000001', 'Breathe <br /> <span class="text-primary italic font-serif lowercase font-medium">Life</span> Into <br /> Your Space.', 'Premium Nursery', 'Expertly curated indoor & outdoor plants, delivered directly from our nursery to your doorstep.', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1600', 'Start Shopping', '/shop', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Default Shipping Zone
INSERT INTO public.shipping_zones (zone_name, coverage_info, shipping_method, delivery_time, charge, is_active) VALUES
('All India Standard', 'Rest of India', 'Standard', '3-5 business days', 99.00, true)
ON CONFLICT DO NOTHING;
