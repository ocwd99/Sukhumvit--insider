-- ===========================================
-- SIAM INSIDER 資料庫完整設定
-- ===========================================

-- ===========================================
-- 1. 建立資料表
-- ===========================================

-- 會員資料表 (更新版)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  membership_tier TEXT DEFAULT 'free',
  credits INTEGER DEFAULT 3,
  preferences TEXT[] DEFAULT '{}',  -- A,B,C,D,E,F,G 喜好選項
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 店家資料表
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  drink_price INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  risk_level TEXT DEFAULT 'Low',
  trend TEXT DEFAULT 'stable',
  location TEXT,
  description TEXT,
  category TEXT,  -- A,B,C,D,E,F,G 類型
  is_verified BOOLEAN DEFAULT false,
  image_url TEXT,
  contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 付款收據表 (用於審核)
CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  venue_id UUID REFERENCES venues(id),
  venue_name TEXT,
  amount INTEGER NOT NULL,
  image_url TEXT,
  payment_type TEXT DEFAULT 'receipt', -- receipt, transfer, card
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  admin_notes TEXT,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 轉蛋結果表
CREATE TABLE IF NOT EXISTS gacha_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  reward TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 緊急救援表
CREATE TABLE IF NOT EXISTS emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  location TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 管理員表
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin', -- admin, store_editor
  name TEXT,
  venue_id UUID REFERENCES venues(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 會員購買紀錄表
CREATE TABLE IF NOT EXISTS membership_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  tier TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 2. 範例店家資料
-- ===========================================
INSERT INTO venues (name, drink_price, rating, risk_level, trend, location, category, is_verified) VALUES
('The Mansion', 350, 4.8, 'Low', 'up', 'Sukhumvit Soi 11', 'A', true),
('Club Hyper', 280, 4.5, 'Low', 'stable', 'RCA', 'B', true),
('Neon Arcade', 320, 4.2, 'Medium', 'up', 'Silom', 'C', true),
('The Vault', 450, 4.9, 'Low', 'up', 'Thonglor', 'A', true),
('Silk Road', 380, 4.6, 'Medium', 'down', 'Sukhumvit', 'D', true),
('Golden Dragon', 420, 4.7, 'Low', 'up', 'Patpong', 'E', true),
('Sky Lounge', 520, 4.4, 'Low', 'stable', 'Sathorn', 'F', true),
('Underground', 300, 4.3, 'Medium', 'up', 'Asok', 'G', true)
ON CONFLICT DO NOTHING;

-- ===========================================
-- 3. 啟用 RLS 安全機制
-- ===========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_purchases ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 4. RLS 政策 - profiles (會員)
-- ===========================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ===========================================
-- 5. RLS 政策 - venues (店家)
-- ===========================================
DROP POLICY IF EXISTS "Anyone can view venues" ON venues;
CREATE POLICY "Anyone can view venues" ON venues FOR SELECT USING (true);

-- ===========================================
-- 6. RLS 政策 - payment_receipts (付款收據)
-- ===========================================
DROP POLICY IF EXISTS "Users can view own receipts" ON payment_receipts;
DROP POLICY IF EXISTS "Users can insert own receipts" ON payment_receipts;
DROP POLICY IF EXISTS "Admins can view all receipts" ON payment_receipts;
DROP POLICY IF EXISTS "Admins can update all receipts" ON payment_receipts;

CREATE POLICY "Users can view own receipts" ON payment_receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receipts" ON payment_receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all receipts" ON payment_receipts FOR SELECT USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update all receipts" ON payment_receipts FOR UPDATE USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND role = 'admin'));

-- ===========================================
-- 7. RLS 政策 - gacha_results (轉蛋結果)
-- ===========================================
DROP POLICY IF EXISTS "Users can view own gacha" ON gacha_results;
DROP POLICY IF EXISTS "Users can insert own gacha" ON gacha_results;
CREATE POLICY "Users can view own gacha" ON gacha_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gacha" ON gacha_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- 8. RLS 政策 - emergency_requests (緊急救援)
-- ===========================================
DROP POLICY IF EXISTS "Users can view own emergency" ON emergency_requests;
DROP POLICY IF EXISTS "Users can insert own emergency" ON emergency_requests;
DROP POLICY IF EXISTS "Admins can view all emergency" ON emergency_requests;
CREATE POLICY "Users can view own emergency" ON emergency_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emergency" ON emergency_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all emergency" ON emergency_requests FOR SELECT USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND role = 'admin'));

-- ===========================================
-- 9. RLS 政策 - admins (管理員)
-- ===========================================
DROP POLICY IF EXISTS "Admins can view own record" ON admins;
CREATE POLICY "Admins can view own record" ON admins FOR SELECT USING (auth.uid() = id);

-- ===========================================
-- 10. RLS 政策 - membership_purchases
-- ===========================================
DROP POLICY IF EXISTS "Users can view own purchases" ON membership_purchases;
DROP POLICY IF EXISTS "Users can insert own purchases" ON membership_purchases;
DROP POLICY IF EXISTS "Admins can view all purchases" ON membership_purchases;
DROP POLICY IF EXISTS "Admins can update all purchases" ON membership_purchases;
CREATE POLICY "Users can view own purchases" ON membership_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchases" ON membership_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all purchases" ON membership_purchases FOR SELECT USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update all purchases" ON membership_purchases FOR UPDATE USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND role = 'admin'));

-- ===========================================
-- 完成訊息
-- ===========================================
SELECT '資料庫設定完成！請新增管理員帳號到 admins 表。' AS message;
