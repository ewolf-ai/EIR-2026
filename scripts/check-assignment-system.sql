-- Quick check script to verify assignment system status
-- Run this in Supabase SQL Editor to diagnose the current state

-- ============================================
-- 1. CHECK: Database Schema
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '=== CHECKING DATABASE SCHEMA ===';
  
  -- Check if assigned_position_simulation column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'assigned_position_simulation'
  ) THEN
    RAISE NOTICE '✓ Column users.assigned_position_simulation exists';
  ELSE
    RAISE NOTICE '✗ Column users.assigned_position_simulation MISSING - Run add-assigned-position-column.sql';
  END IF;

  -- Check if autonomous_communities table exists (already in schema)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'autonomous_communities'
  ) THEN
    RAISE NOTICE '✓ Table autonomous_communities exists';
  ELSE
    RAISE NOTICE '✗ Table autonomous_communities MISSING - Should already exist in schema';
  END IF;

  -- Check if assignment_recalculation_queue table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'assignment_recalculation_queue'
  ) THEN
    RAISE NOTICE '✓ Table assignment_recalculation_queue exists';
  ELSE
    RAISE NOTICE '✗ Table assignment_recalculation_queue MISSING - Run create-assignment-triggers.sql';
  END IF;
END $$;

-- ============================================
-- 2. CHECK: Functions
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== CHECKING FUNCTIONS ===';
  
  -- Check recalculate_position_assignments
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'recalculate_position_assignments'
  ) THEN
    RAISE NOTICE '✓ Function recalculate_position_assignments exists';
  ELSE
    RAISE NOTICE '✗ Function recalculate_position_assignments MISSING - Run recalculate-assignments-function.sql';
  END IF;

  -- Check process_assignment_recalculation_queue
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'process_assignment_recalculation_queue'
  ) THEN
    RAISE NOTICE '✓ Function process_assignment_recalculation_queue exists';
  ELSE
    RAISE NOTICE '✗ Function process_assignment_recalculation_queue MISSING - Run create-assignment-triggers.sql';
  END IF;
END $$;

-- ============================================
-- 3. CHECK: Triggers
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== CHECKING TRIGGERS ===';
  
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'recalc_on_preferences_change'
  ) THEN
    RAISE NOTICE '✓ Trigger recalc_on_preferences_change exists';
  ELSE
    RAISE NOTICE '✗ Trigger recalc_on_preferences_change MISSING - Run create-assignment-triggers.sql';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'recalc_on_user_position_change'
  ) THEN
    RAISE NOTICE '✓ Trigger recalc_on_user_position_change exists';
  ELSE
    RAISE NOTICE '✗ Trigger recalc_on_user_position_change MISSING - Run create-assignment-triggers.sql';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'recalc_on_positions_change'
  ) THEN
    RAISE NOTICE '✓ Trigger recalc_on_positions_change exists';
  ELSE
    RAISE NOTICE '✗ Trigger recalc_on_positions_change MISSING - Run create-assignment-triggers.sql';
  END IF;
END $$;

-- ============================================
-- 4. STATISTICS: Current Data State
-- ============================================
SELECT '=== CURRENT DATA STATISTICS ===' as status;

-- Users with EIR position
SELECT 
  'Users with EIR position' as metric,
  COUNT(*) as count
FROM users
WHERE eir_position IS NOT NULL

UNION ALL

-- Users with assignment calculated
SELECT 
  'Users with assignment calculated' as metric,
  COUNT(*) as count
FROM users
WHERE assigned_position_simulation IS NOT NULL

UNION ALL

-- Users with assignment (not null)
SELECT 
  'Users assigned to position' as metric,
  COUNT(*) as count
FROM users
WHERE assigned_position_simulation IS NOT NULL

UNION ALL

-- Total preferences
SELECT 
  'Total preferences' as metric,
  COUNT(*) as count
FROM preferences

UNION ALL

-- Total offered positions
SELECT 
  'Total positions offered' as metric,
  SUM(num_positions)::INTEGER as count
FROM offered_positions;

-- ============================================
-- 5. LAST CALCULATION INFO
-- ============================================
SELECT '=== LAST CALCULATION INFO ===' as status;

SELECT 
  assignment_calculated_at as last_calculation_time,
  COUNT(*) as users_calculated,
  COUNT(*) FILTER (WHERE assigned_position_simulation IS NOT NULL) as users_assigned
FROM users
WHERE assignment_calculated_at IS NOT NULL
GROUP BY assignment_calculated_at
ORDER BY assignment_calculated_at DESC
LIMIT 1;

-- ============================================
-- 6. RECALCULATION QUEUE STATUS
-- ============================================
SELECT '=== RECALCULATION QUEUE ===' as status;

SELECT 
  COUNT(*) FILTER (WHERE processed = FALSE) as pending_recalculations,
  COUNT(*) FILTER (WHERE processed = TRUE) as completed_recalculations,
  MAX(triggered_at) FILTER (WHERE processed = FALSE) as oldest_pending,
  MAX(processed_at) as last_processed
FROM assignment_recalculation_queue;

-- ============================================
-- 7. SAMPLE ASSIGNMENTS (Top 10 users)
-- ============================================
SELECT '=== SAMPLE ASSIGNMENTS ===' as status;

SELECT 
  eir_position,
  display_name,
  assigned_position_simulation,
  assignment_calculated_at
FROM users
WHERE eir_position IS NOT NULL
ORDER BY eir_position ASC
LIMIT 10;

-- ============================================
-- 8. RECOMMENDATIONS
-- ============================================
DO $$
DECLARE
  has_assignments BOOLEAN;
  has_pending BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== RECOMMENDATIONS ===';
  
  -- Check if initial calculation was run
  SELECT EXISTS (
    SELECT 1 FROM users WHERE assigned_position_simulation IS NOT NULL
  ) INTO has_assignments;
  
  IF NOT has_assignments THEN
    RAISE NOTICE '⚠ No assignments found - Run: SELECT * FROM recalculate_position_assignments();';
  ELSE
    RAISE NOTICE '✓ Assignments are populated';
  END IF;

  -- Check for pending recalculations
  SELECT EXISTS (
    SELECT 1 FROM assignment_recalculation_queue WHERE processed = FALSE
  ) INTO has_pending;
  
  IF has_pending THEN
    RAISE NOTICE '⚠ Pending recalculations in queue - Run: SELECT * FROM process_assignment_recalculation_queue();';
  ELSE
    RAISE NOTICE '✓ No pending recalculations';
  END IF;
END $$;
