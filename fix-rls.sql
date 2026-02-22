-- ===========================================
-- RLS Security Fix - Run in Supabase SQL Editor
-- ===========================================

-- 1. Drop overly permissive policies
DROP POLICY IF EXISTS "Allow all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all venues" ON venues;
DROP POLICY IF EXISTS "Allow all receipts" ON receipts;
DROP POLICY IF EXISTS "Allow all gacha" ON gacha_results;
DROP POLICY IF EXISTS "Allow all emergency" ON emergency_requests;

-- 2. Create secure policies

-- Profiles: anyone can read, users can only update own
CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Venues: public read-only
CREATE POLICY "Anyone can read venues" ON venues FOR SELECT USING (true);

-- Receipts: users can only see/manage own
CREATE POLICY "Users can read own receipts" ON receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receipts" ON receipts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gacha: users can only see/manage own
CREATE POLICY "Users can read own gacha" ON gacha_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gacha" ON gacha_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Emergency: users can only see/manage own
CREATE POLICY "Users can read own emergency" ON emergency_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emergency" ON emergency_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Ensure admins table exists
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admin policies
DROP POLICY IF EXISTS "Anyone can read admins" ON admins;
DROP POLICY IF EXISTS "Admins can manage admins" ON admins;

CREATE POLICY "Anyone can read admins" ON admins FOR SELECT USING (true);
CREATE POLICY "Admins can manage admins" ON admins FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- 4. Add your admin email (replace with your email)
INSERT INTO admins (email) VALUES ('YOUR_EMAIL@example.com') ON CONFLICT DO NOTHING;
