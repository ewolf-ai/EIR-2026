-- Script de diagnóstico para verificar por qué los triggers no funcionan
-- Ejecuta esto en Supabase SQL Editor

-- ============================================
-- 1. Verificar si los triggers existen
-- ============================================
SELECT 
  'TRIGGER CHECK' as section,
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled,
  CASE tgtype::integer & 66
    WHEN 2 THEN 'BEFORE'
    WHEN 64 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END as trigger_timing,
  CASE tgtype::integer & 28
    WHEN 4 THEN 'INSERT'
    WHEN 8 THEN 'DELETE'
    WHEN 16 THEN 'UPDATE'
    WHEN 12 THEN 'INSERT OR DELETE'
    WHEN 20 THEN 'INSERT OR UPDATE'
    WHEN 24 THEN 'DELETE OR UPDATE'
    WHEN 28 THEN 'INSERT OR UPDATE OR DELETE'
  END as trigger_event
FROM pg_trigger
WHERE tgname LIKE '%recalc%'
ORDER BY tgrelid::regclass::text, tgname;

-- ============================================
-- 2. Verificar la cola de recálculo
-- ============================================
SELECT 
  'QUEUE STATUS' as section,
  COUNT(*) as total_items,
  COUNT(*) FILTER (WHERE processed = TRUE) as processed_count,
  COUNT(*) FILTER (WHERE processed = FALSE) as pending_count,
  MAX(triggered_at) FILTER (WHERE processed = FALSE) as oldest_pending,
  MAX(triggered_at) FILTER (WHERE processed = TRUE) as last_processed
FROM assignment_recalculation_queue;

-- ============================================
-- 3. Ver últimos elementos en la cola
-- ============================================
SELECT 
  'RECENT QUEUE ITEMS' as section,
  id,
  reason,
  triggered_at,
  processed,
  processed_at
FROM assignment_recalculation_queue
ORDER BY triggered_at DESC
LIMIT 10;

-- ============================================
-- 4. Test manual del trigger
-- ============================================
-- Vamos a insertar un registro de prueba para ver si el trigger se ejecuta
DO $$
DECLARE
  test_user_id UUID;
  queue_before INTEGER;
  queue_after INTEGER;
BEGIN
  RAISE NOTICE '=== TESTING TRIGGER MANUALLY ===';
  
  -- Contar elementos en cola antes
  SELECT COUNT(*) INTO queue_before
  FROM assignment_recalculation_queue
  WHERE processed = FALSE;
  
  RAISE NOTICE 'Queue items before: %', queue_before;
  
  -- Obtener un usuario de prueba (el primero disponible)
  SELECT id INTO test_user_id
  FROM users
  WHERE eir_position IS NOT NULL
  LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No test user found with eir_position';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Test user: %', test_user_id;
  
  -- Hacer un UPDATE trivial en preferences (esto debería disparar el trigger)
  -- Si no hay preferencias, intentar crear una temporal
  UPDATE preferences
  SET updated_at = NOW()
  WHERE id IN (
    SELECT id FROM preferences
    WHERE user_id = test_user_id
    LIMIT 1
  );
  
  -- Esperar un poco
  PERFORM pg_sleep(0.1);
  
  -- Contar elementos en cola después
  SELECT COUNT(*) INTO queue_after
  FROM assignment_recalculation_queue
  WHERE processed = FALSE;
  
  RAISE NOTICE 'Queue items after: %', queue_after;
  
  IF queue_after > queue_before THEN
    RAISE NOTICE '✓ TRIGGER WORKING - Queue item added';
  ELSE
    RAISE NOTICE '✗ TRIGGER NOT WORKING - No queue item added';
    RAISE NOTICE 'Possible reasons:';
    RAISE NOTICE '  1. Trigger not installed';
    RAISE NOTICE '  2. Trigger disabled';
    RAISE NOTICE '  3. Queue already has pending item (by design)';
    RAISE NOTICE '  4. RLS blocking the insert';
  END IF;
END $$;

-- ============================================
-- 5. Verificar permisos de la función
-- ============================================
SELECT 
  'FUNCTION PERMISSIONS' as section,
  proname as function_name,
  prosecdef as security_definer,
  rolname as owner
FROM pg_proc
JOIN pg_roles ON pg_proc.proowner = pg_roles.oid
WHERE proname IN ('queue_assignment_recalculation', 'recalculate_position_assignments', 'process_assignment_recalculation_queue');

-- ============================================
-- 6. Verificar RLS en assignment_recalculation_queue
-- ============================================
SELECT 
  'RLS POLICIES' as section,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'assignment_recalculation_queue';

-- ============================================
-- 7. Test directo de la función queue
-- ============================================
DO $$
DECLARE
  queue_before INTEGER;
  queue_after INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TESTING QUEUE FUNCTION DIRECTLY ===';
  
  SELECT COUNT(*) INTO queue_before
  FROM assignment_recalculation_queue
  WHERE processed = FALSE;
  
  RAISE NOTICE 'Queue items before: %', queue_before;
  
  -- Llamar directamente a la función
  PERFORM queue_assignment_recalculation('Manual test from diagnostics');
  
  SELECT COUNT(*) INTO queue_after
  FROM assignment_recalculation_queue
  WHERE processed = FALSE;
  
  RAISE NOTICE 'Queue items after: %', queue_after;
  
  IF queue_after > queue_before THEN
    RAISE NOTICE '✓ FUNCTION WORKING - Queue item added';
  ELSE
    RAISE NOTICE '⚠ Function executed but no item added (may already have pending item)';
  END IF;
END $$;

-- ============================================
-- 8. Recomendaciones
-- ============================================
SELECT 
  'RECOMMENDATIONS' as section,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'recalc_on_preferences_change') 
    THEN '✗ CRITICAL: Trigger recalc_on_preferences_change does not exist - Run create-assignment-triggers.sql'
    WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'recalc_on_preferences_change' AND tgenabled = 'D')
    THEN '✗ WARNING: Trigger is DISABLED - Enable it'
    WHEN EXISTS (SELECT 1 FROM assignment_recalculation_queue WHERE processed = FALSE)
    THEN '⚠ INFO: There are pending items in queue - Process them with: SELECT * FROM process_assignment_recalculation_queue();'
    ELSE '✓ OK: Triggers appear to be working'
  END as status;
