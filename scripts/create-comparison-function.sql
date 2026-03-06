-- Función PostgreSQL para obtener usuarios que compiten por una provincia
-- Esta función ejecuta la consulta exacta que necesitas

CREATE OR REPLACE FUNCTION get_users_competing_for_province(
  target_province TEXT,
  target_specialty TEXT
)
RETURNS TABLE (user_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.user_id
  FROM preferences p
  WHERE p.specialty = target_specialty
  AND p.preference_value IN (
    -- Get the province itself
    SELECT province
    FROM offered_positions
    WHERE province = target_province
    
    UNION
    
    -- Get all centers in that province
    SELECT center
    FROM offered_positions
    WHERE province = target_province
  );
END;
$$ LANGUAGE plpgsql;

-- Dar permisos a usuarios autenticados
GRANT EXECUTE ON FUNCTION get_users_competing_for_province TO authenticated;
