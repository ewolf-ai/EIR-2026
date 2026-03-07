-- Migration: Add assigned_position_simulation column to users table
-- This stores the calculated position assignment to avoid recalculating on every page load

-- Step 1: Add the column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS assigned_position_simulation TEXT;

-- Step 2: Add metadata columns for tracking recalculation
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS assignment_calculated_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_assigned_position 
ON users(assigned_position_simulation) 
WHERE assigned_position_simulation IS NOT NULL;

-- Step 4: Add comment for documentation
COMMENT ON COLUMN users.assigned_position_simulation IS 'Simulated position assignment based on EIR number and preferences. Recalculated when preferences or positions change.';
COMMENT ON COLUMN users.assignment_calculated_at IS 'Timestamp of last assignment calculation.';
