-- =============================================================================
-- FUNCIONES SQL PARA ANÁLISIS DE COMPETENCIA
-- Todas las consultas se ejecutan en la base de datos, sin filtrado en memoria
-- =============================================================================

-- 1. Contar usuarios con una preferencia como 1ª opción
-- =============================================================================
DROP FUNCTION IF EXISTS get_users_first_choice_count CASCADE;

CREATE OR REPLACE FUNCTION get_users_first_choice_count(
  max_position INTEGER,
  target_preference TEXT,
  target_specialty TEXT,
  target_type TEXT
)
RETURNS BIGINT AS $$
DECLARE
  result_count BIGINT := 0;
  provinces_list TEXT[];
BEGIN
  -- Para tipo hospital: buscar coincidencia exacta en priority 1
  IF target_type = 'hospital' THEN
    SELECT COUNT(DISTINCT p.user_id)
    INTO result_count
    FROM preferences p
    JOIN users u ON p.user_id = u.id
    WHERE p.specialty = target_specialty
      AND p.priority = 1
      AND p.preference_value = target_preference
      AND u.eir_position IS NOT NULL
      AND u.eir_position < max_position;
      
  -- Para tipo provincia: contar quien tiene esa provincia O un hospital en esa provincia como priority 1
  ELSIF target_type = 'province' THEN
    SELECT COUNT(DISTINCT p.user_id)
    INTO result_count
    FROM preferences p
    JOIN users u ON p.user_id = u.id
    WHERE p.specialty = target_specialty
      AND p.priority = 1
      AND u.eir_position IS NOT NULL
      AND u.eir_position < max_position
      AND (
        -- Coincide la provincia directamente
        (p.preference_type = 'province' AND p.preference_value = target_preference)
        OR
        -- O es un hospital en esa provincia
        (p.preference_type = 'hospital' AND EXISTS (
          SELECT 1 FROM offered_positions op
          WHERE op.center = p.preference_value
            AND op.province = target_preference
        ))
      );
      
  -- Para tipo comunidad: contar quien tiene esa comunidad, provincia en ella, u hospital en ella como priority 1
  ELSIF target_type = 'community' THEN
    -- Obtener lista de provincias en la comunidad
    SELECT ARRAY_AGG(DISTINCT province)
    INTO provinces_list
    FROM autonomous_communities
    WHERE community = target_preference;
    
    SELECT COUNT(DISTINCT p.user_id)
    INTO result_count
    FROM preferences p
    JOIN users u ON p.user_id = u.id
    WHERE p.specialty = target_specialty
      AND p.priority = 1
      AND u.eir_position IS NOT NULL
      AND u.eir_position < max_position
      AND (
        -- Coincide la comunidad directamente
        (p.preference_type = 'community' AND p.preference_value = target_preference)
        OR
        -- O es una provincia en esa comunidad
        (p.preference_type = 'province' AND p.preference_value = ANY(provinces_list))
        OR
        -- O es un hospital en una provincia de esa comunidad
        (p.preference_type = 'hospital' AND EXISTS (
          SELECT 1 FROM offered_positions op
          WHERE op.center = p.preference_value
            AND op.province = ANY(provinces_list)
        ))
      );
  END IF;
  
  RETURN result_count;
END;
$$ LANGUAGE plpgsql;


-- 2. Contar usuarios con una preferencia en su TOP 3
-- =============================================================================
DROP FUNCTION IF EXISTS get_users_top3_count CASCADE;

CREATE OR REPLACE FUNCTION get_users_top3_count(
  max_position INTEGER,
  target_preference TEXT,
  target_specialty TEXT,
  target_type TEXT
)
RETURNS BIGINT AS $$
DECLARE
  result_count BIGINT := 0;
  provinces_list TEXT[];
BEGIN
  -- Para tipo hospital: buscar coincidencia exacta en priority 1, 2 o 3
  IF target_type = 'hospital' THEN
    SELECT COUNT(DISTINCT p.user_id)
    INTO result_count
    FROM preferences p
    JOIN users u ON p.user_id = u.id
    WHERE p.specialty = target_specialty
      AND p.priority <= 3
      AND p.preference_value = target_preference
      AND u.eir_position IS NOT NULL
      AND u.eir_position < max_position;
      
  -- Para tipo provincia: contar quien tiene esa provincia O un hospital en esa provincia en top 3
  ELSIF target_type = 'province' THEN
    SELECT COUNT(DISTINCT p.user_id)
    INTO result_count
    FROM preferences p
    JOIN users u ON p.user_id = u.id
    WHERE p.specialty = target_specialty
      AND p.priority <= 3
      AND u.eir_position IS NOT NULL
      AND u.eir_position < max_position
      AND (
        -- Coincide la provincia directamente
        (p.preference_type = 'province' AND p.preference_value = target_preference)
        OR
        -- O es un hospital en esa provincia
        (p.preference_type = 'hospital' AND EXISTS (
          SELECT 1 FROM offered_positions op
          WHERE op.center = p.preference_value
            AND op.province = target_preference
        ))
      );
      
  -- Para tipo comunidad: contar quien tiene esa comunidad, provincia en ella, u hospital en ella en top 3
  ELSIF target_type = 'community' THEN
    -- Obtener lista de provincias en la comunidad
    SELECT ARRAY_AGG(DISTINCT province)
    INTO provinces_list
    FROM autonomous_communities
    WHERE community = target_preference;
    
    SELECT COUNT(DISTINCT p.user_id)
    INTO result_count
    FROM preferences p
    JOIN users u ON p.user_id = u.id
    WHERE p.specialty = target_specialty
      AND p.priority <= 3
      AND u.eir_position IS NOT NULL
      AND u.eir_position < max_position
      AND (
        -- Coincide la comunidad directamente
        (p.preference_type = 'community' AND p.preference_value = target_preference)
        OR
        -- O es una provincia en esa comunidad
        (p.preference_type = 'province' AND p.preference_value = ANY(provinces_list))
        OR
        -- O es un hospital en una provincia de esa comunidad
        (p.preference_type = 'hospital' AND EXISTS (
          SELECT 1 FROM offered_positions op
          WHERE op.center = p.preference_value
            AND op.province = ANY(provinces_list)
        ))
      );
  END IF;
  
  RETURN result_count;
END;
$$ LANGUAGE plpgsql;


DROP FUNCTION IF EXISTS get_users_same_province_count CASCADE;

-- 3. Contar usuarios compitiendo por la misma provincia (mejorada)
-- =============================================================================
CREATE OR REPLACE FUNCTION get_users_same_province_count(
  max_position INTEGER,
  target_province TEXT,
  target_specialty TEXT
)
RETURNS BIGINT AS $$
DECLARE
  result_count BIGINT := 0;
BEGIN
  -- Contar usuarios que tienen preferencias en esa provincia y van por delante
  SELECT COUNT(DISTINCT p.user_id)
  INTO result_count
  FROM preferences p
  JOIN users u ON p.user_id = u.id
  WHERE p.specialty = target_specialty
    AND u.eir_position IS NOT NULL
    AND u.eir_position < max_position
    AND p.preference_value IN (
      -- La provincia en sí
      SELECT province
      FROM offered_positions
      WHERE province = target_province
      
      UNION
      
      -- Todos los centros en esa provincia
      SELECT center
      FROM offered_positions
      WHERE province = target_province
    );
    
  RETURN result_count;
END;
$$ LANGUAGE plpgsql;


DROP FUNCTION IF EXISTS get_users_same_community_count CASCADE;

-- 4. Contar usuarios compitiendo por comunidad (mejorada)
-- =============================================================================
CREATE OR REPLACE FUNCTION get_users_same_community_count(
  max_position INTEGER,
  target_community TEXT,
  target_specialty TEXT
)
RETURNS BIGINT AS $$
DECLARE
  result_count BIGINT := 0;
  provinces_list TEXT[];
BEGIN
  -- Obtener todas las provincias de la comunidad
  SELECT ARRAY_AGG(DISTINCT province)
  INTO provinces_list
  FROM autonomous_communities
  WHERE community = target_community;
  
  -- Contar usuarios que compiten por cualquier provincia o centro en la comunidad
  SELECT COUNT(DISTINCT p.user_id)
  INTO result_count
  FROM preferences p
  JOIN users u ON p.user_id = u.id
  WHERE p.specialty = target_specialty
    AND u.eir_position IS NOT NULL
    AND u.eir_position < max_position
    AND (
      -- Coincide la comunidad directamente
      (p.preference_type = 'community' AND p.preference_value = target_community)
      OR
      -- O es una provincia en esa comunidad
      (p.preference_type = 'province' AND p.preference_value = ANY(provinces_list))
      OR
      -- O es un centro en una provincia de esa comunidad
      (p.preference_type = 'hospital' AND EXISTS (
        SELECT 1 FROM offered_positions op
        WHERE op.center = p.preference_value
          AND op.province = ANY(provinces_list)
      ))
    );
    
  RETURN result_count;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- PERMISOS
-- =============================================================================
GRANT EXECUTE ON FUNCTION get_users_first_choice_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_top3_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_same_province_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_same_community_count TO authenticated;

-- =============================================================================
-- REFRESCAR SCHEMA CACHE DE POSTGREST
-- =============================================================================
NOTIFY pgrst, 'reload schema';
