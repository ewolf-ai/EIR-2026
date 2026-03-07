-- Triggers to automatically recalculate assignments when data changes
-- We use a flag-based approach to avoid triggering on every single change

-- Step 1: Create a table to track when recalculation is needed
CREATE TABLE IF NOT EXISTS assignment_recalculation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reason TEXT NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS (Service role only)
ALTER TABLE assignment_recalculation_queue ENABLE ROW LEVEL SECURITY;

-- Step 2: Function to queue a recalculation
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Trigger on preferences table
CREATE OR REPLACE FUNCTION trigger_assignment_recalc_on_preferences()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue recalculation when preferences change
  PERFORM queue_assignment_recalculation('Preferences modified');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recalc_on_preferences_change ON preferences;
CREATE TRIGGER recalc_on_preferences_change
  AFTER INSERT OR UPDATE OR DELETE ON preferences
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_assignment_recalc_on_preferences();

-- Step 4: Trigger on users table (when eir_position changes)
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recalc_on_user_position_change ON users;
CREATE TRIGGER recalc_on_user_position_change
  AFTER INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_assignment_recalc_on_user_position();

-- Step 5: Trigger on offered_positions table
CREATE OR REPLACE FUNCTION trigger_assignment_recalc_on_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue recalculation when offered positions change
  PERFORM queue_assignment_recalculation('Offered positions modified');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recalc_on_positions_change ON offered_positions;
CREATE TRIGGER recalc_on_positions_change
  AFTER INSERT OR UPDATE OR DELETE ON offered_positions
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_assignment_recalc_on_positions();

-- Step 6: Function to process the queue (call this from API)
CREATE OR REPLACE FUNCTION process_assignment_recalculation_queue()
RETURNS TABLE (
  queue_id UUID,
  reason TEXT,
  users_processed INTEGER,
  users_assigned INTEGER,
  calculation_timestamp TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  queue_record RECORD;
  recalc_result RECORD;
BEGIN
  -- Get the oldest pending recalculation
  SELECT * INTO queue_record
  FROM assignment_recalculation_queue
  WHERE processed = FALSE
  ORDER BY triggered_at ASC
  LIMIT 1;
  
  IF NOT FOUND THEN
    -- No pending recalculations
    RETURN;
  END IF;
  
  -- Execute the recalculation
  SELECT * INTO recalc_result
  FROM recalculate_position_assignments()
  LIMIT 1;
  
  -- Mark as processed
  UPDATE assignment_recalculation_queue
  SET processed = TRUE,
      processed_at = NOW()
  WHERE id = queue_record.id;
  
  -- Return result
  RETURN QUERY
  SELECT 
    queue_record.id,
    queue_record.reason,
    recalc_result.users_processed,
    recalc_result.users_assigned,
    recalc_result.calculation_timestamp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION process_assignment_recalculation_queue TO authenticated;

-- Optional: Create a view to see recalculation history
CREATE OR REPLACE VIEW recalculation_history AS
SELECT 
  id,
  reason,
  triggered_at,
  processed,
  processed_at,
  CASE 
    WHEN processed THEN EXTRACT(EPOCH FROM (processed_at - triggered_at))
    ELSE NULL
  END as processing_time_seconds
FROM assignment_recalculation_queue
ORDER BY triggered_at DESC
LIMIT 100;

GRANT SELECT ON recalculation_history TO authenticated;
