-- ============================================
-- FIX TRIGGERS - VERSIÓN PARA SUPABASE
-- ============================================
-- Este script corrige problemas de triggers en Supabase específicamente

-- ============================================
-- FIX 1: Crear/Corregir todas las funciones de trigger
-- ============================================

-- Función para trigger de preferencias (STATEMENT-level)
CREATE OR REPLACE FUNCTION trigger_assignment_recalc_on_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue recalculation when preferences change
  PERFORM queue_assignment_recalculation('Preferences modified');
  RETURN NULL; -- NULL for STATEMENT-level triggers
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para trigger de offered_positions (STATEMENT-level)
CREATE OR REPLACE FUNCTION trigger_assignment_recalc_on_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue recalculation when offered positions change
  PERFORM queue_assignment_recalculation('Offered positions modified');
  RETURN NULL; -- NULL for STATEMENT-level triggers
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para trigger de users (ROW-level)
CREATE OR REPLACE FUNCTION trigger_assignment_recalc_on_user_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue recalculation when EIR position changes
  IF (TG_OP = 'UPDATE' AND OLD.eir_position IS DISTINCT FROM NEW.eir_position) THEN
    PERFORM queue_assignment_recalculation('User EIR position changed');
  ELSIF (TG_OP = 'INSERT' AND NEW.eir_position IS NOT NULL) THEN
    PERFORM queue_assignment_recalculation('New user with EIR position');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIX 2: Configurar RLS de manera Supabase-friendly
-- ============================================

-- Opción A (RECOMENDADA para Supabase): Mantener RLS con políticas permisivas
ALTER TABLE assignment_recalculation_queue ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Allow all operations for queue" ON assignment_recalculation_queue;
DROP POLICY IF EXISTS "Allow insert for queue" ON assignment_recalculation_queue;
DROP POLICY IF EXISTS "Allow select for authenticated" ON assignment_recalculation_queue;
DROP POLICY IF EXISTS "Allow update for queue processing" ON assignment_recalculation_queue;

-- Crear política permisiva (funciona con SECURITY DEFINER)
CREATE POLICY "Allow all operations for queue" 
  ON assignment_recalculation_queue 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Si prefieres desactivar RLS completamente (menos recomendado):
-- ALTER TABLE assignment_recalculation_queue DISABLE ROW LEVEL SECURITY;

-- ============================================
-- FIX 3: Función de cola con manejo de errores robusto
-- ============================================
CREATE OR REPLACE FUNCTION queue_assignment_recalculation(reason TEXT)
RETURNS VOID AS $$
BEGIN
  -- Only queue if there's no pending recalculation
  IF NOT EXISTS (
    SELECT 1 FROM assignment_recalculation_queue 
    WHERE processed = FALSE
  ) THEN
    INSERT INTO assignment_recalculation_queue (reason, triggered_at)
    VALUES (reason, NOW());
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the transaction
    RAISE WARNING 'Failed to queue recalculation: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIX 4: Permisos específicos de Supabase
-- ============================================

-- Grant a los roles de Supabase
GRANT EXECUTE ON FUNCTION queue_assignment_recalculation(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION queue_assignment_recalculation(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION queue_assignment_recalculation(TEXT) TO service_role;

GRANT EXECUTE ON FUNCTION trigger_assignment_recalc_on_preferences() TO anon;
GRANT EXECUTE ON FUNCTION trigger_assignment_recalc_on_preferences() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_assignment_recalc_on_preferences() TO service_role;

GRANT EXECUTE ON FUNCTION trigger_assignment_recalc_on_positions() TO anon;
GRANT EXECUTE ON FUNCTION trigger_assignment_recalc_on_positions() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_assignment_recalc_on_positions() TO service_role;

GRANT EXECUTE ON FUNCTION trigger_assignment_recalc_on_user_position() TO anon;
GRANT EXECUTE ON FUNCTION trigger_assignment_recalc_on_user_position() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_assignment_recalc_on_user_position() TO service_role;

-- ============================================
-- FIX 5: Re-crear todos los triggers
-- ============================================

-- Trigger en preferences
DROP TRIGGER IF EXISTS recalc_on_preferences_change ON preferences;
CREATE TRIGGER recalc_on_preferences_change
  AFTER INSERT OR UPDATE OR DELETE ON preferences
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_assignment_recalc_on_preferences();

-- Trigger en offered_positions
DROP TRIGGER IF EXISTS recalc_on_positions_change ON offered_positions;
CREATE TRIGGER recalc_on_positions_change
  AFTER INSERT OR UPDATE OR DELETE ON offered_positions
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_assignment_recalc_on_positions();

-- Trigger en users
DROP TRIGGER IF EXISTS recalc_on_user_position_change ON users;
CREATE TRIGGER recalc_on_user_position_change
  AFTER INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_assignment_recalc_on_user_position();

-- ============================================
-- VERIFICATION: Test manual (sin pg_sleep)
-- ============================================
DO $$
DECLARE
  queue_count_before INTEGER;
  queue_count_after INTEGER;
  test_user_id UUID;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TESTING FIXED TRIGGERS (Supabase)';
  RAISE NOTICE '========================================';
  
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
    RAISE NOTICE 'Test user ID: %', test_user_id;
    
    -- Make a dummy update to trigger the preferences trigger
    -- Use a subquery for LIMIT in UPDATE (Supabase/PostgreSQL compatible)
    UPDATE preferences
    SET priority = priority -- No-op update to trigger the trigger
    WHERE id IN (
      SELECT id 
      FROM preferences 
      WHERE user_id = test_user_id 
      LIMIT 1
    );
    
    -- Check immediate result (no sleep needed in Supabase)
    SELECT COUNT(*) INTO queue_count_after
    FROM assignment_recalculation_queue
    WHERE processed = FALSE;
    
    RAISE NOTICE 'Queue count after: %', queue_count_after;
    
    IF queue_count_after > queue_count_before THEN
      RAISE NOTICE '✓ SUCCESS: Trigger is now working!';
      RAISE NOTICE '✓ A recalculation has been queued';
    ELSE
      RAISE NOTICE '⚠ No new queue item added';
      RAISE NOTICE '  Possible reasons:';
      RAISE NOTICE '  1. No preferences exist for test user';
      RAISE NOTICE '  2. Trigger not properly installed';
      RAISE NOTICE '  3. Already had a pending item';
    END IF;
  ELSE
    RAISE NOTICE '⚠ No test user available (no users with eir_position)';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- Show current trigger status
-- ============================================
DO $$
DECLARE
  trigger_rec RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'CURRENT TRIGGER STATUS:';
  RAISE NOTICE '------------------------';
  
  FOR trigger_rec IN
    SELECT 
      tgname as trigger_name,
      tgrelid::regclass as table_name,
      CASE tgenabled
        WHEN 'O' THEN 'ENABLED'
        WHEN 'D' THEN 'DISABLED'
        WHEN 'R' THEN 'REPLICA'
        WHEN 'A' THEN 'ALWAYS'
        ELSE 'UNKNOWN'
      END as status
    FROM pg_trigger
    WHERE tgname LIKE '%recalc%'
    ORDER BY tgrelid::regclass::text, tgname
  LOOP
    RAISE NOTICE '% on % - %', 
      trigger_rec.trigger_name, 
      trigger_rec.table_name, 
      trigger_rec.status;
  END LOOP;
END $$;

-- ============================================
-- Show queue status
-- ============================================
DO $$
DECLARE
  pending_count INTEGER;
  processed_count INTEGER;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE processed = FALSE),
    COUNT(*) FILTER (WHERE processed = TRUE)
  INTO pending_count, processed_count
  FROM assignment_recalculation_queue;
  
  RAISE NOTICE '';
  RAISE NOTICE 'QUEUE STATUS:';
  RAISE NOTICE '-------------';
  RAISE NOTICE 'Pending items: %', pending_count;
  RAISE NOTICE 'Processed items: %', processed_count;
  
  IF pending_count > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '✓ There are pending recalculations in queue';
    RAISE NOTICE '  Process them with: SELECT * FROM process_assignment_recalculation_queue();';
  END IF;
END $$;

-- ============================================
-- NEXT STEPS
-- ============================================
-- Si el test fue exitoso:
-- 1. Procesar la cola: SELECT * FROM process_assignment_recalculation_queue();
-- 2. Verificar en la web que funciona
-- 3. Configurar procesamiento automático (cron o desde API)
