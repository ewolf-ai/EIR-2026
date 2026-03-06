-- Migration: Add specialty field to preferences table
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Add the specialty column (allowing NULL temporarily)
ALTER TABLE preferences 
ADD COLUMN specialty TEXT;

-- Step 2: Set a default value for existing rows
-- You can change this default to the most common specialty in your data
UPDATE preferences 
SET specialty = 'ENFERMERÍA FAMILIAR Y COMUNITARIA' 
WHERE specialty IS NULL;

-- Step 3: Make the column NOT NULL and add constraint
ALTER TABLE preferences 
ALTER COLUMN specialty SET NOT NULL;

ALTER TABLE preferences 
ADD CONSTRAINT preferences_specialty_check 
CHECK (specialty IN (
  'ENFERMERÍA FAMILIAR Y COMUNITARIA',
  'ENFERMERÍA DE SALUD MENTAL',
  'ENFERMERÍA OBSTETRICO-GINECOLÓGICA',
  'ENFERMERÍA PEDIÁTRICA',
  'ENFERMERÍA GERIÁTRICA',
  'ENFERMERÍA DEL TRABAJO'
));

-- Step 4: Add index for better query performance
CREATE INDEX idx_preferences_specialty ON preferences(specialty);

-- Step 5: Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'preferences' 
AND column_name = 'specialty';
