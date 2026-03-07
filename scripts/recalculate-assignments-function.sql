-- Function to recalculate ALL position assignments
-- This ensures consistent, deterministic results by processing users in strict order

CREATE OR REPLACE FUNCTION recalculate_position_assignments()
RETURNS TABLE (
  users_processed INTEGER,
  users_assigned INTEGER,
  calculation_timestamp TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  user_record RECORD;
  pref_record RECORD;
  position_key TEXT;
  available INTEGER;
  user_assigned BOOLEAN;
  processed_count INTEGER := 0;
  assigned_count INTEGER := 0;
  calc_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Set calculation timestamp
  calc_timestamp := NOW();
  
  -- Step 1: Clear all existing assignments
  UPDATE users 
  SET assigned_position_simulation = NULL,
      assignment_calculated_at = calc_timestamp
  WHERE TRUE; -- Required by Supabase: explicit WHERE clause
  
  -- Step 2: Create temporary table for available positions
  -- This acts as our in-memory counter during the simulation
  CREATE TEMP TABLE IF NOT EXISTS temp_available_positions (
    center TEXT,
    specialty TEXT,
    available_count INTEGER,
    PRIMARY KEY (center, specialty)
  );
  
  DELETE FROM temp_available_positions WHERE TRUE; -- Required by Supabase
  
  -- Initialize available positions from offered_positions
  INSERT INTO temp_available_positions (center, specialty, available_count)
  SELECT center, specialty, num_positions
  FROM offered_positions;
  
  -- Step 3: Process users in strict deterministic order
  -- ORDER BY: eir_position ASC, created_at ASC (tiebreaker)
  FOR user_record IN 
    SELECT id, eir_position
    FROM users
    WHERE eir_position IS NOT NULL
    ORDER BY eir_position ASC, created_at ASC
  LOOP
    processed_count := processed_count + 1;
    user_assigned := FALSE;
    
    -- Try each preference in priority order
    FOR pref_record IN
      SELECT preference_value, preference_type, specialty, priority
      FROM preferences
      WHERE user_id = user_record.id
      ORDER BY priority ASC
    LOOP
      -- Exit if already assigned
      EXIT WHEN user_assigned;
      
      -- Case 1: HOSPITAL preference
      IF pref_record.preference_type = 'hospital' THEN
        -- Try to assign to this specific hospital
        SELECT available_count INTO available
        FROM temp_available_positions
        WHERE center = pref_record.preference_value 
          AND specialty = pref_record.specialty;
        
        IF available IS NOT NULL AND available > 0 THEN
          -- Assign this position
          UPDATE users
          SET assigned_position_simulation = pref_record.preference_value,
              assignment_calculated_at = calc_timestamp
          WHERE id = user_record.id;
          
          -- Decrease available count
          UPDATE temp_available_positions
          SET available_count = available_count - 1
          WHERE center = pref_record.preference_value 
            AND specialty = pref_record.specialty;
          
          user_assigned := TRUE;
          assigned_count := assigned_count + 1;
        END IF;
        
      -- Case 2: PROVINCE preference  
      ELSIF pref_record.preference_type = 'province' THEN
        -- Try to assign to ANY center in this province
        -- CRITICAL: Use ORDER BY to ensure deterministic selection
        FOR position_key IN
          SELECT tap.center
          FROM temp_available_positions tap
          INNER JOIN offered_positions op 
            ON tap.center = op.center AND tap.specialty = op.specialty
          WHERE op.province = pref_record.preference_value
            AND tap.specialty = pref_record.specialty
            AND tap.available_count > 0
          ORDER BY tap.center ASC -- DETERMINISTIC ORDER
          LIMIT 1
        LOOP
          -- Assign this position
          UPDATE users
          SET assigned_position_simulation = position_key,
              assignment_calculated_at = calc_timestamp
          WHERE id = user_record.id;
          
          -- Decrease available count
          UPDATE temp_available_positions
          SET available_count = available_count - 1
          WHERE center = position_key 
            AND specialty = pref_record.specialty;
          
          user_assigned := TRUE;
          assigned_count := assigned_count + 1;
        END LOOP;
        
      -- Case 3: COMMUNITY preference
      ELSIF pref_record.preference_type = 'community' THEN
        -- Try to assign to ANY center in provinces of this community
        -- CRITICAL: Use ORDER BY to ensure deterministic selection
        FOR position_key IN
          SELECT tap.center
          FROM temp_available_positions tap
          INNER JOIN offered_positions op 
            ON tap.center = op.center AND tap.specialty = op.specialty
          WHERE op.province IN (
            -- Get provinces from this community using autonomous_communities table
            SELECT province 
            FROM autonomous_communities
            WHERE community = pref_record.preference_value
          )
          AND tap.specialty = pref_record.specialty
          AND tap.available_count > 0
          ORDER BY tap.center ASC -- DETERMINISTIC ORDER
          LIMIT 1
        LOOP
          -- Assign this position
          UPDATE users
          SET assigned_position_simulation = position_key,
              assignment_calculated_at = calc_timestamp
          WHERE id = user_record.id;
          
          -- Decrease available count
          UPDATE temp_available_positions
          SET available_count = available_count - 1
          WHERE center = position_key 
            AND specialty = pref_record.specialty;
          
          user_assigned := TRUE;
          assigned_count := assigned_count + 1;
        END LOOP;
        
      END IF;
    END LOOP;
  END LOOP;
  
  -- Clean up temp table
  DROP TABLE IF EXISTS temp_available_positions;
  
  -- Return statistics
  RETURN QUERY SELECT processed_count, assigned_count, calc_timestamp;
END;
$$ LANGUAGE plpgsql;

-- Grant execution to authenticated users (or just to service role)
GRANT EXECUTE ON FUNCTION recalculate_position_assignments TO authenticated;

-- Optional: Create a view for assignment statistics
CREATE OR REPLACE VIEW assignment_statistics AS
SELECT 
  COUNT(*) as total_users_with_position,
  COUNT(assigned_position_simulation) as users_with_assignment,
  MAX(assignment_calculated_at) as last_calculation,
  EXTRACT(EPOCH FROM (NOW() - MAX(assignment_calculated_at)))/60 as minutes_since_calculation
FROM users
WHERE eir_position IS NOT NULL;

GRANT SELECT ON assignment_statistics TO authenticated;
