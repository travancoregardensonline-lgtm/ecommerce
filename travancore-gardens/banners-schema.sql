create table if not exists banners (
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

-- insert default banner
insert into banners (title, subtitle, description, image_url, button_text, button_link)
values (
    'Breathe <br /> <span class="text-primary italic font-serif lowercase font-medium">Life</span> Into <br /> Your Space.',
    'Premium Nursery',
    'Expertly curated indoor & outdoor plants, delivered directly from our nursery to your doorstep.',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1600',
    'Start Shopping',
    '/shop'
) on conflict do nothing;

alter table banners enable row level security;
create policy "Everyone can view active banners" on banners for select using (is_active = true);
