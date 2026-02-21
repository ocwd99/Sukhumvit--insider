-- 優化版 RLS - 效能更好 + 補齊 SELECT 權限

-- 1. 建立管理員檢查函數（效能優化）
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. venues 表權限（補齊 SELECT + 簡化）
DROP POLICY IF EXISTS "Anyone can view venues" ON venues;
DROP POLICY IF EXISTS "Admins can insert venues" ON venues;
DROP POLICY IF EXISTS "Admins can update venues" ON venues;
DROP POLICY IF EXISTS "Admins can delete venues" ON venues;

-- 所有人都能看店家（顯示給客人）
CREATE POLICY "Anyone can view venues" ON venues FOR SELECT USING (true);

-- 管理員才能修改
CREATE POLICY "Admins can insert venues" ON venues FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update venues" ON venues FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete venues" ON venues FOR DELETE USING (is_admin());

-- 3. venue_packages 表權限（同步優化）
DROP POLICY IF EXISTS "Anyone can view packages" ON venue_packages;
DROP POLICY IF EXISTS "Admins can insert packages" ON venue_packages;
DROP POLICY IF EXISTS "Admins can update packages" ON venue_packages;
DROP POLICY IF EXISTS "Admins can delete packages" ON venue_packages;

CREATE POLICY "Anyone can view packages" ON venue_packages FOR SELECT USING (true);
CREATE POLICY "Admins can insert packages" ON venue_packages FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update packages" ON venue_packages FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete packages" ON venue_packages FOR DELETE USING (is_admin());

SELECT '優化完成！' AS status;