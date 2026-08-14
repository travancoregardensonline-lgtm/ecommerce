-- =====================================
-- SEED DATA: Fix broken image URLs
-- Run this in Supabase SQL Editor
-- =====================================

-- Update product images with working URLs (from Pexels/picsum)
UPDATE public.product_images SET image_url = 'https://images.pexels.com/photos/6913087/pexels-photo-6913087.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE product_id = 'b0000000-0000-0000-0000-000000000001'; -- Monstera

UPDATE public.product_images SET image_url = 'https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE product_id = 'b0000000-0000-0000-0000-000000000002'; -- Snake Plant

UPDATE public.product_images SET image_url = 'https://images.pexels.com/photos/1843711/pexels-photo-1843711.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE product_id = 'b0000000-0000-0000-0000-000000000003'; -- Aloe Vera

UPDATE public.product_images SET image_url = 'https://images.pexels.com/photos/3511755/pexels-photo-3511755.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE product_id = 'b0000000-0000-0000-0000-000000000004'; -- Fiddle Leaf Fig

UPDATE public.product_images SET image_url = 'https://images.pexels.com/photos/4751978/pexels-photo-4751978.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE product_id = 'b0000000-0000-0000-0000-000000000005'; -- ZZ Plant

UPDATE public.product_images SET image_url = 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE product_id = 'b0000000-0000-0000-0000-000000000006'; -- Peace Lily

UPDATE public.product_images SET image_url = 'https://images.pexels.com/photos/7728873/pexels-photo-7728873.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE product_id = 'b0000000-0000-0000-0000-000000000007'; -- Jade Plant

UPDATE public.product_images SET image_url = 'https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE product_id = 'b0000000-0000-0000-0000-000000000008'; -- Boston Fern

UPDATE public.product_images SET image_url = 'https://images.pexels.com/photos/5945754/pexels-photo-5945754.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE product_id = 'b0000000-0000-0000-0000-000000000009'; -- Dwarf Lemon

UPDATE public.product_images SET image_url = 'https://images.pexels.com/photos/906150/pexels-photo-906150.jpeg?auto=compress&cs=tinysrgb&w=800'
WHERE product_id = 'b0000000-0000-0000-0000-000000000010'; -- Sweet Basil

-- Update category images with working URLs
UPDATE public.categories SET image_url = 'https://images.pexels.com/photos/6913087/pexels-photo-6913087.jpeg?auto=compress&cs=tinysrgb&w=600'
WHERE slug = 'indoor-plants';

UPDATE public.categories SET image_url = 'https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&cs=tinysrgb&w=600'
WHERE slug = 'air-purifying';

UPDATE public.categories SET image_url = 'https://images.pexels.com/photos/1843711/pexels-photo-1843711.jpeg?auto=compress&cs=tinysrgb&w=600'
WHERE slug = 'succulents';

UPDATE public.categories SET image_url = 'https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&cs=tinysrgb&w=600'
WHERE slug = 'ferns';

UPDATE public.categories SET image_url = 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=600'
WHERE slug = 'flowering-plants';

UPDATE public.categories SET image_url = 'https://images.pexels.com/photos/4751978/pexels-photo-4751978.jpeg?auto=compress&cs=tinysrgb&w=600'
WHERE slug = 'low-light';

UPDATE public.categories SET image_url = 'https://images.pexels.com/photos/1903965/pexels-photo-1903965.jpeg?auto=compress&cs=tinysrgb&w=600'
WHERE slug = 'bonsai';

UPDATE public.categories SET image_url = 'https://images.pexels.com/photos/5945754/pexels-photo-5945754.jpeg?auto=compress&cs=tinysrgb&w=600'
WHERE slug = 'fruit-plants';

UPDATE public.categories SET image_url = 'https://images.pexels.com/photos/906150/pexels-photo-906150.jpeg?auto=compress&cs=tinysrgb&w=600'
WHERE slug = 'herbs-edibles';

UPDATE public.categories SET image_url = 'https://images.pexels.com/photos/1105019/pexels-photo-1105019.jpeg?auto=compress&cs=tinysrgb&w=600'
WHERE slug = 'outdoor-plants';
