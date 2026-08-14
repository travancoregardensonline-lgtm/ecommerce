-- ============================================================
-- ADMIN ROLE SETUP — Run in Supabase SQL Editor
-- ============================================================

-- 1. Add role column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';

-- 2. Drop old constraint and recreate with super_admin
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('customer', 'admin', 'manager', 'super_admin'));

-- 3. Create index for fast middleware lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 4. Upsert the super admin profile for admin@travancore.com
INSERT INTO public.profiles (id, email, name, role, created_at)
SELECT
    u.id,
    u.email,
    'Super Admin',
    'super_admin',
    NOW()
FROM auth.users u
WHERE u.email = 'admin@travancore.com'
ON CONFLICT (id) DO UPDATE
SET
    role = 'super_admin',
    name = COALESCE(NULLIF(public.profiles.name, ''), 'Super Admin');

-- 5. Verify — should show the admin account
SELECT
    p.id,
    p.email,
    p.name,
    p.role,
    u.created_at AS auth_created,
    u.last_sign_in_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role IN ('admin', 'manager', 'super_admin')
ORDER BY p.role;
