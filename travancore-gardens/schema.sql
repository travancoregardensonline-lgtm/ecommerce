-- =====================================
-- EXTENSIONS
-- =====================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- =====================================
-- ENUMS
-- =====================================

create type order_status as enum (
'pending',
'confirmed',
'processing',
'shipped',
'delivered',
'cancelled'
);

create type payment_status as enum (
'pending',
'paid',
'failed',
'refunded'
);

-- =====================================
-- PROFILES
-- =====================================

create table if not exists profiles (
id uuid primary key references auth.users(id) on delete cascade,
name text,
phone text,
email text,
avatar_url text,
created_at timestamptz default now()
);

create index if not exists idx_profiles_phone on profiles(phone);

-- =====================================
-- ADDRESSES
-- =====================================

create table if not exists addresses (
id uuid primary key default uuid_generate_v4(),
user_id uuid references profiles(id) on delete cascade,
full_name text,
phone text,
address_line1 text,
address_line2 text,
city text,
state text,
pincode text,
country text default 'India',
is_default boolean default false,
created_at timestamptz default now()
);

create index idx_address_user on addresses(user_id);

-- =====================================
-- CATEGORIES
-- =====================================

create table if not exists categories (
id uuid primary key default uuid_generate_v4(),
name text not null,
slug text unique,
description text,
image_url text,
parent_id uuid references categories(id) on delete set null,
created_at timestamptz default now()
);

-- =====================================
-- PRODUCTS
-- =====================================

create table if not exists products (
id uuid primary key default uuid_generate_v4(),
name text not null,
slug text unique,
description text,
short_description text,
category_id uuid references categories(id),
price numeric(10,2),
sale_price numeric(10,2),
sku text,
stock integer default 0,
weight numeric,
height numeric,
width numeric,
length numeric,
is_active boolean default true,
created_at timestamptz default now()
);

create index idx_products_category on products(category_id);

-- =====================================
-- PRODUCT IMAGES
-- =====================================

create table if not exists product_images (
id uuid primary key default uuid_generate_v4(),
product_id uuid references products(id) on delete cascade,
image_url text,
is_primary boolean default false,
created_at timestamptz default now()
);

-- =====================================
-- PRODUCT VARIANTS
-- =====================================

create table if not exists product_variants (
id uuid primary key default uuid_generate_v4(),
product_id uuid references products(id) on delete cascade,
variant_name text,
price numeric,
stock integer,
sku text,
created_at timestamptz default now()
);

-- =====================================
-- CARTS
-- =====================================

create table if not exists carts (
id uuid primary key default uuid_generate_v4(),
user_id uuid references profiles(id) on delete cascade,
created_at timestamptz default now()
);

create index idx_cart_user on carts(user_id);

-- =====================================
-- CART ITEMS
-- =====================================

create table if not exists cart_items (
id uuid primary key default uuid_generate_v4(),
cart_id uuid references carts(id) on delete cascade,
product_id uuid references products(id),
variant_id uuid references product_variants(id),
quantity integer default 1,
created_at timestamptz default now()
);

-- =====================================
-- ORDERS
-- =====================================

create table if not exists orders (
id uuid primary key default uuid_generate_v4(),
order_number text unique,
user_id uuid references profiles(id),
address_id uuid references addresses(id),
total_amount numeric(10,2),
payment_method text,
payment_status payment_status default 'pending',
order_status order_status default 'pending',
courier_partner text,
tracking_number text,
created_at timestamptz default now()
);

create index idx_orders_user on orders(user_id);

-- =====================================
-- ORDER ITEMS
-- =====================================

create table if not exists order_items (
id uuid primary key default uuid_generate_v4(),
order_id uuid references orders(id) on delete cascade,
product_id uuid references products(id),
variant_id uuid references product_variants(id),
quantity integer,
price numeric,
created_at timestamptz default now()
);

-- =====================================
-- PAYMENTS
-- =====================================

create table if not exists payments (
id uuid primary key default uuid_generate_v4(),
order_id uuid references orders(id),
payment_gateway text,
transaction_id text,
amount numeric,
payment_status payment_status,
created_at timestamptz default now()
);

-- =====================================
-- SHIPMENTS
-- =====================================

create table if not exists shipments (
id uuid primary key default uuid_generate_v4(),
order_id uuid references orders(id),
courier text,
tracking_number text,
shipment_status text,
shipped_at timestamptz,
delivered_at timestamptz
);

-- =====================================
-- REVIEWS
-- =====================================

create table if not exists reviews (
id uuid primary key default uuid_generate_v4(),
product_id uuid references products(id),
user_id uuid references profiles(id),
rating integer check (rating between 1 and 5),
review text,
created_at timestamptz default now()
);

-- =====================================
-- COUPONS
-- =====================================

create table if not exists coupons (
id uuid primary key default uuid_generate_v4(),
code text unique,
discount_type text,
discount_value numeric,
min_order_value numeric,
expiry_date timestamptz
);

-- =====================================
-- INVOICES
-- =====================================

create table if not exists invoices (
id uuid primary key default uuid_generate_v4(),
order_id uuid references orders(id),
invoice_number text,
invoice_url text,
created_at timestamptz default now()
);

-- =====================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================

alter table profiles enable row level security;
alter table addresses enable row level security;
alter table carts enable row level security;

-- Example policy
create policy "Users can view own profile"
on profiles
for select
using (auth.uid() = id);