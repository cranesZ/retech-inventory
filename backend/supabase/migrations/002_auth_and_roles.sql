-- ============================================
-- AUTH AND USER ROLES SETUP
-- ============================================

-- Create custom user profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'viewer')),
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  two_factor_enabled BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- API CACHE TABLE (for SICKW and other external APIs)
-- ============================================

CREATE TABLE api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  cache_data JSONB NOT NULL,
  unparsed_data TEXT,  -- Store raw API response
  endpoint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_cache_key ON api_cache(cache_key);
CREATE INDEX idx_api_cache_expires ON api_cache(expires_at);
CREATE INDEX idx_api_cache_endpoint ON api_cache(endpoint);

-- Function to clean expired cache
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM api_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS POLICIES FOR USER PROFILES
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM user_profiles WHERE id = auth.uid())
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert profiles
CREATE POLICY "Admins can create profiles"
  ON user_profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES FOR API CACHE
-- ============================================

ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read cache
CREATE POLICY "Authenticated users can read cache"
  ON api_cache
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role can manage cache (backend only)
CREATE POLICY "Service role can manage cache"
  ON api_cache
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- UPDATE DEVICES TABLE WITH USER TRACKING
-- ============================================

-- Add created_by and updated_by columns to devices table
ALTER TABLE devices ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE devices ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- ============================================
-- FUNCTION TO CREATE USER PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SEED INITIAL ADMIN USER (will be created via Auth signup)
-- ============================================

-- Note: First user to sign up should be manually promoted to admin
-- via Supabase Dashboard or by running:
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'admin@retech.com';
