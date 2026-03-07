-- Diagnóstico rápido de triggers
-- Ejecuta esto en Supabase SQL Editor y envíame el resultado completo

-- 1. ¿Existen los triggers?
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  CASE tgenabled 
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    WHEN 'R' THEN 'REPLICA'
    WHEN 'A' THEN 'ALWAYS'
  END as status
FROM pg_trigger
WHERE tgname IN (
  'recalc_on_preferences_change',
  'recalc_on_positions_change', 
  'recalc_on_user_position_change'
)
ORDER BY tgrelid::regclass::text;

-- 2. ¿Las funciones de trigger tienen SECURITY DEFINER?
SELECT 
  proname as function_name,
  CASE 
    WHEN prosecdef THEN 'SECURITY DEFINER ✓'
    ELSE 'SECURITY INVOKER ✗'
  END as security_mode
FROM pg_proc
WHERE proname IN (
  'trigger_assignment_recalc_on_preferences',
  'trigger_assignment_recalc_on_positions',
  'trigger_assignment_recalc_on_user_position',
  'queue_assignment_recalculation'
);

-- 3. Test real: hacer un cambio y verificar
DO $$
DECLARE
  test_user_id UUID;
  queue_count_before INT;
  queue_count_after INT;
  test_pref_id UUID;
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'TRIGGER TEST - Simulating preference change';
  RAISE NOTICE '==========================================';
  
  -- Contar items en cola antes
  SELECT COUNT(*) INTO queue_count_before
  FROM assignment_recalculation_queue
  WHERE processed = FALSE;
  
  RAISE NOTICE 'Queue items BEFORE: %', queue_count_before;
  
  -- Encontrar un usuario con preferencias
  SELECT user_id INTO test_user_id
  FROM preferences
  LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'ERROR: No se encontraron preferencias para testear';
    RETURN;
  END IF;
  
  -- Hacer un UPDATE en preferences (esto debería disparar el trigger)
  -- Usamos updated_at para no causar conflictos con unique constraints
  UPDATE preferences
  SET updated_at = NOW()
  WHERE id IN (
    SELECT id FROM preferences 
    WHERE user_id = test_user_id 
    LIMIT 1
  )
  RETURNING id INTO test_pref_id;
  
  RAISE NOTICE 'Updated preference ID: %', test_pref_id;
  
  -- Pequeña espera
  PERFORM pg_sleep(0.2);
  
  -- Contar items en cola después
  SELECT COUNT(*) INTO queue_count_after
  FROM assignment_recalculation_queue
  WHERE processed = FALSE;
  
  RAISE NOTICE 'Queue items AFTER: %', queue_count_after;
  RAISE NOTICE '';
  
  IF queue_count_after > queue_count_before THEN
    RAISE NOTICE '✓✓✓ SUCCESS: Trigger está funcionando!';
    RAISE NOTICE 'Se añadió un item a la cola de recálculo';
  ELSE
    RAISE NOTICE '✗✗✗ FAILED: Trigger NO está funcionando';
    RAISE NOTICE 'Posibles causas:';
    RAISE NOTICE '  1. Trigger no instalado correctamente';
    RAISE NOTICE '  2. Ya había un item pendiente (la función previene duplicados)';
    RAISE NOTICE '  3. RLS bloqueando el INSERT en la cola';
  END IF;
  
  RAISE NOTICE '==========================================';
END $$;

-- 4. Ver el estado de la cola
SELECT 
  id,
  reason,
  triggered_at,
  processed,
  processed_at
FROM assignment_recalculation_queue
ORDER BY triggered_at DESC
LIMIT 5;
