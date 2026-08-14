-- Disable Row Level Security on banners so admin can edit it without complex auth setup
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;
