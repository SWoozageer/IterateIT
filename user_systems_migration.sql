-- ============================================================
-- Migration: user_systems
-- Run this in your Supabase project → SQL Editor
-- ============================================================

-- Junction table: which systems each user can access
CREATE TABLE IF NOT EXISTS user_systems (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  system_id  UUID        NOT NULL REFERENCES systems(id)   ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, system_id)
);

ALTER TABLE user_systems ENABLE ROW LEVEL SECURITY;

-- Org members can read assignments within their own org
CREATE POLICY "Org members can view user_systems"
  ON user_systems FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM   systems   s
      JOIN   profiles  p ON p.org_id = s.org_id
      WHERE  s.id  = user_systems.system_id
        AND  p.id  = auth.uid()
    )
  );

-- Only org_admin / super_admin can insert / update / delete
CREATE POLICY "Admins can manage user_systems"
  ON user_systems FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM   profiles p
      JOIN   systems  s ON s.org_id = p.org_id
      WHERE  p.id    = auth.uid()
        AND  p.role  IN ('super_admin', 'org_admin')
        AND  s.id    = user_systems.system_id
    )
  );
