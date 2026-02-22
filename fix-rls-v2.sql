-- ===========================================
-- RLS Security Fix v2 - 先刪除現有 policy 再重建
-- ===========================================

-- 1. 刪除所有舊 policy（使用 IF EXISTS 避免錯誤）
DROP POLICY IF EXISTS "Allow all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all venues" ON venues;
DROP POLICY IF EXISTS "Allow all receipts" ON receipts;
DROP POLICY IF EXISTS "Allow all gacha" ON gacha_results;
DROP POLICY IF EXISTS "Allow all emergency" ON emergency_requests;
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can read venues" ON venues;
DROP POLICY IF EXISTS "Users can read own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can insert own receipts" ON receipts;
DROP POLICY IF EXISTS "Users can read own gacha" ON gacha_results;
DROP POLICY IF EXISTS "Users can insert own gacha" ON gacha_results;
DROP POLICY IF EXISTS "Users can read own emergency" ON emergency_requests;
DROP POLICY IF EXISTS "Users can insert own emergency" ON emergency_requests;
DROP POLICY IF EXISTS "Anyone can read admins" ON admins;
DROP POLICY IF EXISTS "Admins can manage admins" ON admins;

-- 2. 建立新的安全政策

-- Profiles
CREATE POLICY "profiles_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Venues (公開讀取)
CREATE POLICY "venues_read" ON venues FOR SELECT USING (true);

-- Receipts
CREATE POLICY "receipts_read" ON receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "receipts_insert" ON receipts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gacha
CREATE POLICY "gacha_read" ON gacha_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "gacha_insert" ON gacha_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Emergency
CREATE POLICY "emergency_read" ON emergency_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "emergency_insert" ON emergency_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (id UUID PRIMARY KEY, email TEXT UNIQUE NOT NULL);
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins policies
CREATE POLICY "admins_read" ON admins FOR SELECT USING (true);
CREATE POLICY "admins_manage" ON admins FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- 3. 加入你的 admin 帳號（替換你的 email）
INSERT INTO admins (id, email) VALUES ('7047577825-aaaa-bbbb-cccc-dddddddddddd', 'your-email@example.com') ON CONFLICT DO NOTHING;
