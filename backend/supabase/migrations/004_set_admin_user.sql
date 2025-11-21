-- ============================================
-- SET KHALIFA AS ADMIN USER
-- ============================================

-- Update khalifabahajpro@icloud.com to admin role
UPDATE public.user_profiles
SET role = 'admin'
WHERE email = 'khalifabahajpro@icloud.com';
