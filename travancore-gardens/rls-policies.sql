-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Travancore Gardens — Full Policy Setup
-- Run this in Supabase SQL Editor
-- ============================================================

-- Helper function: checks if the current user is an admin/super_admin
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

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

CREATE POLICY "profiles_select_own"   ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_insert_own"   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_admin_all"    ON public.profiles FOR ALL USING (public.is_admin());

-- ============================================================
-- ADDRESSES
-- ============================================================
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "addresses_own" ON public.addresses;
DROP POLICY IF EXISTS "addresses_admin" ON public.addresses;

CREATE POLICY "addresses_own"   ON public.addresses FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "addresses_admin" ON public.addresses FOR ALL USING (public.is_admin());

-- ============================================================
-- CATEGORIES — public read, admin write
-- ============================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_all"   ON public.categories;

CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_all"   ON public.categories FOR ALL   USING (public.is_admin());

-- ============================================================
-- PRODUCTS — public read, admin write
-- ============================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "products_admin_all"   ON public.products;

CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "products_admin_all"   ON public.products FOR ALL   USING (public.is_admin());

-- ============================================================
-- PRODUCT IMAGES — public read, admin write
-- ============================================================
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_images_public_read" ON public.product_images;
DROP POLICY IF EXISTS "product_images_admin_all"   ON public.product_images;

CREATE POLICY "product_images_public_read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "product_images_admin_all"   ON public.product_images FOR ALL   USING (public.is_admin());

-- ============================================================
-- PRODUCT VARIANTS — public read, admin write
-- ============================================================
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "variants_public_read" ON public.product_variants;
DROP POLICY IF EXISTS "variants_admin_all"   ON public.product_variants;

CREATE POLICY "variants_public_read" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "variants_admin_all"   ON public.product_variants FOR ALL   USING (public.is_admin());

-- ============================================================
-- CARTS — users own their cart
-- ============================================================
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "carts_own"   ON public.carts;
DROP POLICY IF EXISTS "carts_admin" ON public.carts;

CREATE POLICY "carts_own"   ON public.carts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "carts_admin" ON public.carts FOR ALL USING (public.is_admin());

-- ============================================================
-- CART ITEMS
-- ============================================================
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_items_own"   ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_admin" ON public.cart_items;

CREATE POLICY "cart_items_own" ON public.cart_items FOR ALL
    USING (EXISTS (SELECT 1 FROM public.carts WHERE id = cart_items.cart_id AND user_id = auth.uid()));
CREATE POLICY "cart_items_admin" ON public.cart_items FOR ALL USING (public.is_admin());

-- ============================================================
-- ORDERS — users see own orders, admins see all
-- ============================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_own"          ON public.orders;
DROP POLICY IF EXISTS "orders_admin_all"    ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own"   ON public.orders;

CREATE POLICY "orders_own"       ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "orders_admin_all" ON public.orders FOR ALL   USING (public.is_admin());

-- ============================================================
-- ORDER ITEMS
-- ============================================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_own"   ON public.order_items;
DROP POLICY IF EXISTS "order_items_admin" ON public.order_items;

CREATE POLICY "order_items_own" ON public.order_items FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "order_items_admin" ON public.order_items FOR ALL USING (public.is_admin());

-- ============================================================
-- PAYMENTS
-- ============================================================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_own"   ON public.payments;
DROP POLICY IF EXISTS "payments_admin" ON public.payments;

CREATE POLICY "payments_own" ON public.payments FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.orders WHERE id = payments.order_id AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "payments_admin" ON public.payments FOR ALL USING (public.is_admin());

-- ============================================================
-- SHIPMENTS
-- ============================================================
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shipments_own"   ON public.shipments;
DROP POLICY IF EXISTS "shipments_admin" ON public.shipments;

CREATE POLICY "shipments_own" ON public.shipments FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.orders WHERE id = shipments.order_id AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "shipments_admin" ON public.shipments FOR ALL USING (public.is_admin());

-- ============================================================
-- REVIEWS — public read, owner can insert/update their own
-- ============================================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_public_read"  ON public.reviews;
DROP POLICY IF EXISTS "reviews_own_write"    ON public.reviews;
DROP POLICY IF EXISTS "reviews_admin_all"    ON public.reviews;

CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_own_write"   ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_admin_all"   ON public.reviews FOR ALL   USING (public.is_admin());

-- ============================================================
-- COUPONS — public read for validation, admin manages
-- ============================================================
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupons_public_read" ON public.coupons;
DROP POLICY IF EXISTS "coupons_admin_all"   ON public.coupons;

CREATE POLICY "coupons_public_read" ON public.coupons FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "coupons_admin_all"   ON public.coupons FOR ALL   USING (public.is_admin());

-- ============================================================
-- INVOICES
-- ============================================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoices_own"   ON public.invoices;
DROP POLICY IF EXISTS "invoices_admin" ON public.invoices;

CREATE POLICY "invoices_own" ON public.invoices FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.orders WHERE id = invoices.order_id AND user_id = auth.uid()) OR public.is_admin());
CREATE POLICY "invoices_admin" ON public.invoices FOR ALL USING (public.is_admin());

-- ============================================================
-- VERIFY — list all active policies
-- ============================================================
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
