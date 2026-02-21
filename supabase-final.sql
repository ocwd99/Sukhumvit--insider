-- ===========================================
-- 最終安全版 SQL
-- ===========================================

-- 1. venues 表新增欄位（公開的）
ALTER TABLE venues ADD COLUMN IF NOT EXISTS decoration_level TEXT DEFAULT '普通';
ALTER TABLE venues ADD COLUMN IF NOT EXISTS friendliness TEXT DEFAULT '中';

-- 2. 建立獨立的「管理員筆記表」（只有管理員能看）
CREATE TABLE IF NOT EXISTS venue_admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES admins(id),
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 建立店家套餐表
CREATE TABLE IF NOT EXISTS venue_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price INTEGER NOT NULL CHECK (price >= 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 新增索引
CREATE INDEX IF NOT EXISTS idx_venue_packages_venue_id ON venue_packages(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_admin_notes_venue_id ON venue_admin_notes(venue_id);

-- 5. 啟用 RLS
ALTER TABLE venue_admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_packages ENABLE ROW LEVEL SECURITY;

-- 6. 權限設定

-- venue_packages（套餐 - 公開給所有人看）
CREATE POLICY "Anyone can view packages" ON venue_packages FOR SELECT USING (true);
CREATE POLICY "Admins can insert packages" ON venue_packages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);
CREATE POLICY "Admins can update packages" ON venue_packages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);
CREATE POLICY "Admins can delete packages" ON venue_packages FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- venue_admin_notes（管理員筆記 - 只有管理員能看/寫）
CREATE POLICY "Admins can view notes" ON venue_admin_notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);
CREATE POLICY "Admins can insert notes" ON venue_admin_notes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);
CREATE POLICY "Admins can update notes" ON venue_admin_notes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);
CREATE POLICY "Admins can delete notes" ON venue_admin_notes FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);