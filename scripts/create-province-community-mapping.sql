-- ============================================
-- NOTE: This table already exists as 'autonomous_communities'
-- ============================================
-- 
-- The database already has a table 'autonomous_communities' that serves
-- the same purpose. No need to create a duplicate table.
--
-- Existing table structure:
-- CREATE TABLE autonomous_communities (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   province TEXT UNIQUE NOT NULL,
--   community TEXT NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
-- );
--
-- This file is kept for documentation purposes only.
-- The recalculation function uses 'autonomous_communities' directly.
--
-- ============================================

-- Optional: Create helper function for backward compatibility
CREATE OR REPLACE FUNCTION get_provinces_in_community(target_community TEXT)
RETURNS TABLE (province TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT ac.province
  FROM autonomous_communities ac
  WHERE ac.community = target_community;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_provinces_in_community TO authenticated;
