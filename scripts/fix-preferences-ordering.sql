-- Fix for preferences ordering issue
-- Execute this in your Supabase SQL Editor

-- Drop the function if it already exists
DROP FUNCTION IF EXISTS update_preferences_priorities(JSONB);

-- Create the function to update preferences priorities atomically
CREATE OR REPLACE FUNCTION update_preferences_priorities(preferences_data JSONB)
RETURNS void AS $$
DECLARE
  pref JSONB;
  temp_offset INTEGER := 100000;
BEGIN
  -- First pass: Set all priorities to temporary values (offset by temp_offset)
  -- This avoids UNIQUE constraint violations during the update
  FOR pref IN SELECT * FROM jsonb_array_elements(preferences_data)
  LOOP
    UPDATE preferences
    SET priority = ((pref->>'priority')::INTEGER + temp_offset),
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = (pref->>'id')::UUID;
  END LOOP;

  -- Second pass: Set priorities to their final values
  FOR pref IN SELECT * FROM jsonb_array_elements(preferences_data)
  LOOP
    UPDATE preferences
    SET priority = (pref->>'priority')::INTEGER,
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = (pref->>'id')::UUID;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Test the function (optional - remove if you don't want to test)
-- SELECT update_preferences_priorities('[{"id": "your-uuid-here", "priority": 1}]'::JSONB);
