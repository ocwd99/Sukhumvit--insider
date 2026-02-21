-- Users / Members table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  membership_tier TEXT DEFAULT 'free',
  credits INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venues table (Price Index)
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  drink_price INTEGER,
  rating DECIMAL(2,1),
  risk_level TEXT DEFAULT 'Low',
  trend TEXT DEFAULT 'stable',
  location TEXT,
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipts for Gacha
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  venue_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gacha spins/results
CREATE TABLE IF NOT EXISTS gacha_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  reward TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency requests
CREATE TABLE IF NOT EXISTS emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  location TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample venues
INSERT INTO venues (name, drink_price, rating, risk_level, trend, location, is_verified) VALUES
('The Mansion', 350, 4.8, 'Low', 'up', 'Sukhumvit Soi 11', true),
('Club Hyper', 280, 4.5, 'Low', 'stable', 'RCA', true),
('Neon Arcade', 320, 4.2, 'Medium', 'up', 'Silom', true),
('The Vault', 450, 4.9, 'Low', 'up', 'Thonglor', true),
('Silk Road', 380, 4.6, 'Medium', 'down', 'Sukhumvit', true)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for demo)
CREATE POLICY "Allow all profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all venues" ON venues FOR ALL USING (true);
CREATE POLICY "Allow all receipts" ON receipts FOR ALL USING (true);
CREATE POLICY "Allow all gacha" ON gacha_results FOR ALL USING (true);
CREATE POLICY "Allow all emergency" ON emergency_requests FOR ALL USING (true);
