-- ===========================================
-- 擴充店家資料表結構
-- ===========================================

-- 新增欄位到 venues 表
ALTER TABLE venues ADD COLUMN IF NOT EXISTS decoration_level TEXT DEFAULT '普通';
ALTER TABLE venues ADD COLUMN IF NOT EXISTS friendliness TEXT DEFAULT '中';
ALTER TABLE notes ADD COLUMN IF NOT EXISTS friendliness_notes TEXT;

-- 如果 notes 表不存在，建立它
CREATE TABLE IF NOT EXISTS venue_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id),
  admin_id UUID REFERENCES admins(id),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立店家套餐表
CREATE TABLE IF NOT EXISTS venue_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id),
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 RLS
ALTER TABLE venue_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_packages ENABLE ROW LEVEL SECURITY;

-- RLS 政策
DROP POLICY IF EXISTS "Anyone can view venue_notes" ON venue_notes;
DROP POLICY IF EXISTS "Users can insert venue_notes" ON venue_notes;
DROP POLICY IF EXISTS "Admins can view all venue_notes" ON venue_notes;
DROP POLICY IF EXISTS "Admins can manage venue_notes" ON venue_notes;

DROP POLICY IF EXISTS "Anyone can view packages" ON venue_packages;
DROP POLICY IF EXISTS "Admins can manage packages" ON venue_packages;

-- venue_notes 權限
CREATE POLICY "Anyone can view venue_notes" ON venue_notes FOR SELECT USING (true);
CREATE POLICY "Admins can view all venue_notes" ON venue_notes FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
CREATE POLICY "Admins can insert venue_notes" ON venue_notes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
CREATE POLICY "Admins can update venue_notes" ON venue_notes FOR UPDATE USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- venue_packages 權限
CREATE POLICY "Anyone can view packages" ON venue_packages FOR SELECT USING (true);
CREATE POLICY "Admins can manage packages" ON venue_packages FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- 確認欄位已新增
SELECT '升級完成！' AS status;