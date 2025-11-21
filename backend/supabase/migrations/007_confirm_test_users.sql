-- Confirm all test user email addresses
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email IN ('test1@retech.com', 'test2@retech.com', 'admin@retech.com')
  AND email_confirmed_at IS NULL;
