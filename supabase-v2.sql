-- Add preferences to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences TEXT[] DEFAULT '{}';

-- Payment receipts table (for approval)
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

-- Admin users table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin', -- admin, store_editor
  name TEXT,
  venue_id UUID REFERENCES venues(id), -- for store editors
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Membership purchases table
CREATE TABLE IF NOT EXISTS membership_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  tier TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow all payment_receipts" ON payment_receipts;
CREATE POLICY "Allow all payment_receipts" ON payment_receipts FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all admins" ON admins;
CREATE POLICY "Allow all admins" ON admins FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all membership_purchases" ON membership_purchases;
CREATE POLICY "Allow all membership_purchases" ON membership_purchases FOR ALL USING (true);
