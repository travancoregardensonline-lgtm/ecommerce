-- =====================================
-- SEED DATA: 10 CATEGORIES & 10 PRODUCTS
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
INSERT INTO public.products (id, name, slug, description, short_description, category_id, price, sale_price, sku, stock, weight, is_active) VALUES
('b0000000-0000-0000-0000-000000000001', 'Monstera Deliciosa', 'monstera-deliciosa', 'Famous for its natural leaf holes, the Monstera Deliciosa is a vibrant addition to any indoor space. Thrives in bright, indirect light.', 'A classic indoor plant with dramatic, split leaves.', 'a0000000-0000-0000-0000-000000000001', 1299.00, 999.00, 'PL-MON-001', 50, 1.5, true),
('b0000000-0000-0000-0000-000000000002', 'Snake Plant Laurentii', 'snake-plant', 'An extremely hardy houseplant that purifies the air. It has stiff, sword-like leaves with yellow edges and requires very little water.', 'Hardy, air-purifying plant perfect for beginners.', 'a0000000-0000-0000-0000-000000000002', 799.00, 599.00, 'PL-SNK-001', 100, 1.2, true),
('b0000000-0000-0000-0000-000000000003', 'Aloe Vera', 'aloe-vera', 'A widely known succulent valued for its medicinal and skin care properties, plus it looks great on a sunny windowsill.', 'Minimalist succulent with soothing gel properties.', 'a0000000-0000-0000-0000-000000000003', 399.00, 299.00, 'PL-ALOE-001', 80, 0.8, true),
('b0000000-0000-0000-0000-000000000004', 'Fiddle Leaf Fig', 'fiddle-leaf-fig', 'This stunning tall plant has very large, heavily veined, violin-shaped leaves that grow upright. Perfect for making a statement.', 'Large, sculptural, violin-shaped green leaves.', 'a0000000-0000-0000-0000-000000000001', 1999.00, 1699.00, 'PL-FIG-001', 30, 3.0, true),
('b0000000-0000-0000-0000-000000000005', 'ZZ Plant', 'zz-plant', 'Characterized by its shiny, wide, oval-shaped leaves. Very easy to maintain and famously tolerates low light environments.', 'Virtually indestructible plant for low-light spaces.', 'a0000000-0000-0000-0000-000000000006', 899.00, 749.00, 'PL-ZZ-001', 60, 1.0, true),
('b0000000-0000-0000-0000-000000000006', 'Peace Lily', 'peace-lily', 'A graceful plant with dark green foliage and beautiful white flowers. Excellent at cleaning indoor air of toxins.', 'Elegant white blooms and air-filtering green foliage.', 'a0000000-0000-0000-0000-000000000005', 699.00, 699.00, 'PL-PLY-001', 45, 1.1, true),
('b0000000-0000-0000-0000-000000000007', 'Jade Plant', 'jade-plant', 'A popular succulent houseplant with fleshy, oval-shaped leaves. Traditionally believed to bring good luck and prosperity.', 'A lucky succulent with thick, glossy foliage.', 'a0000000-0000-0000-0000-000000000003', 499.00, 399.00, 'PL-JAD-001', 75, 0.7, true),
('b0000000-0000-0000-0000-000000000008', 'Boston Fern', 'boston-fern', 'Known for its lush, arching fronds, the Boston Fern is ideal for hanging baskets or tall plant pedestals in humid rooms.', 'Lush, classic fern for hanging baskets.', 'a0000000-0000-0000-0000-000000000004', 599.00, 599.00, 'PL-FRN-001', 40, 1.3, true),
('b0000000-0000-0000-0000-000000000009', 'Dwarf Lemon Tree', 'dwarf-lemon-tree', 'Grow fresh, juicy lemons at home with this compact dwarf citrus tree, ideal for sunny patios or bright sunrooms.', 'A compact citrus tree producing real, edible lemons.', 'a0000000-0000-0000-0000-000000000008', 1499.00, 1299.00, 'PL-LMN-001', 20, 2.5, true),
('b0000000-0000-0000-0000-000000000010', 'Sweet Basil', 'sweet-basil', 'A fragrant, culinary herb perfect for your kitchen window. Ready to harvest and use directly in your home cooking.', 'Aromatic culinary herb for indoor or outdoor growing.', 'a0000000-0000-0000-0000-000000000009', 249.00, 199.00, 'PL-BSL-001', 120, 0.5, true)
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Product Images (1 beautiful high-res image per product)
INSERT INTO public.product_images (product_id, image_url, is_primary) VALUES
('b0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800', true),
('b0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1593482892280-9243ab98ce3d?auto=format&fit=crop&q=80&w=800', true),
('b0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1596547609652-9cb5ee5bafa4?auto=format&fit=crop&q=80&w=800', true),
('b0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1597055181308-f46328325af6?auto=format&fit=crop&q=80&w=800', true),
('b0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&q=80&w=800', true),
('b0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1593696954203-bfa1e57c5a2c?auto=format&fit=crop&q=80&w=800', true),
('b0000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1601242398565-d064fb2bc13d?auto=format&fit=crop&q=80&w=800', true),
('b0000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1584443153549-d7b415aefbcf?auto=format&fit=crop&q=80&w=800', true),
('b0000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&q=80&w=800', true),
('b0000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=800', true);
