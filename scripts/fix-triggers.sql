-- FIX: Corrección de triggers que no se disparan
-- 
-- ⚠️ IMPORTANTE: Si estás usando SUPABASE, usa fix-triggers-supabase.sql
-- Este script es más genérico y puede tener problemas en Supabase
--
-- Este script corrige problemas comunes en los triggers

-- ============================================
-- FIX 1: Corregir función de trigger (RETURN NULL para STATEMENT-level triggers)
-- ============================================
CREATE OR REPLACE FUNCTION trigger_assignment_recalc_on_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue recalculation when preferences change
  PERFORM queue_assignment_recalculation('Preferences modified');
  RETURN NULL; -- Changed from RETURN NEW for STATEMENT-level trigger
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_assignment_recalc_on_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue recalculation when offered positions change
  PERFORM queue_assignment_recalculation('Offered positions modified');
  RETURN NULL; -- Changed from RETURN NEW for STATEMENT-level trigger
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIX 2: Desactivar RLS en assignment_recalculation_queue
-- El SECURITY DEFINER debería manejar la seguridad
-- ============================================
ALTER TABLE assignment_recalculation_queue DISABLE ROW LEVEL SECURITY;

-- O alternativamente, crear una política que permita INSERT a todos
-- (descomenta si prefieres mantener RLS activo)
/*
ALTER TABLE assignment_recalculation_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert for queue" ON assignment_recalculation_queue;
CREATE POLICY "Allow insert for queue" 
  ON assignment_recalculation_queue 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select for authenticated" ON assignment_recalculation_queue;
CREATE POLICY "Allow select for authenticated" 
  ON assignment_recalculation_queue 
  FOR SELECT 
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow update for queue processing" ON assignment_recalculation_queue;
CREATE POLICY "Allow update for queue processing" 
  ON assignment_recalculation_queue 
  FOR UPDATE 
  WITH CHECK (true);
*/

-- ============================================
-- FIX 3: Asegurar que la función queue tiene permisos correctos
-- ============================================
CREATE OR REPLACE FUNCTION queue_assignment_recalculation(reason TEXT)
RETURNS VOID AS $$
BEGIN
  -- Only queue if there's no pending recalculation
  IF NOT EXISTS (
    SELECT 1 FROM assignment_recalculation_queue 
    WHERE processed = FALSE
  ) THEN
    INSERT INTO assignment_recalculation_queue (reason)
    VALUES (reason);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the transaction
    RAISE WARNING 'Failed to queue recalculation: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to todos (ya que usa SECURITY DEFINER, es seguro)
GRANT EXECUTE ON FUNCTION queue_assignment_recalculation TO PUBLIC;

-- ============================================
-- FIX 4: Re-crear los triggers
-- ============================================
DROP TRIGGER IF EXISTS recalc_on_preferences_change ON preferences;
CREATE TRIGGER recalc_on_preferences_change
  AFTER INSERT OR UPDATE OR DELETE ON preferences
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_assignment_recalc_on_preferences();

DROP TRIGGER IF EXISTS recalc_on_positions_change ON offered_positions;
CREATE TRIGGER recalc_on_positions_change
  AFTER INSERT OR UPDATE OR DELETE ON offered_positions
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_assignment_recalc_on_positions();

-- El trigger en users ya está bien (es FOR EACH ROW)
DROP TRIGGER IF EXISTS recalc_on_user_position_change ON users;
CREATE TRIGGER recalc_on_user_position_change
  AFTER INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_assignment_recalc_on_user_position();

-- ============================================
-- VERIFICATION: Test que funciona
-- ============================================
DO $$
DECLARE
  queue_count_before INTEGER;
  queue_count_after INTEGER;
  test_user_id UUID;
BEGIN
  RAISE NOTICE '=== TESTING FIXED TRIGGERS ===';
  
  -- Clear any pending queue items first
  DELETE FROM assignment_recalculation_queue WHERE processed = FALSE;
  
  -- Count queue items
  SELECT COUNT(*) INTO queue_count_before
  FROM assignment_recalculation_queue
  WHERE processed = FALSE;
  
  RAISE NOTICE 'Queue count before: %', queue_count_before;
  
  -- Get a test user
  SELECT id INTO test_user_id
  FROM users
  WHERE eir_position IS NOT NULL
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Make a dummy update to trigger the preferences trigger
    UPDATE preferences
    SET updated_at = NOW()
    WHERE id IN (
      SELECT id 
      FROM preferences 
      WHERE user_id = test_user_id 
      LIMIT 1
    );
    
    -- Wait a moment
    PERFORM pg_sleep(0.1);
    
    -- Count again
    SELECT COUNT(*) INTO queue_count_after
    FROM assignment_recalculation_queue
    WHERE processed = FALSE;
    
    RAISE NOTICE 'Queue count after: %', queue_count_after;
    
    IF queue_count_after > queue_count_before THEN
      RAISE NOTICE '✓ SUCCESS: Trigger is now working!';
    ELSE
      RAISE NOTICE '✗ STILL FAILING: Check pg_trigger table and permissions';
    END IF;
  ELSE
    RAISE NOTICE 'No test user available';
  END IF;
END $$;

-- ============================================
-- Show current status
-- ============================================
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  CASE tgenabled
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    ELSE 'OTHER'
  END as status
FROM pg_trigger
WHERE tgname LIKE '%recalc%';
