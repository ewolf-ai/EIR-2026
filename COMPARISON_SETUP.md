# Setup de Función de Comparación

Para que el análisis comparativo funcione correctamente, necesitas ejecutar la siguiente función PostgreSQL en tu base de datos Supabase.

## Pasos para Instalar la Función

### 1. Acceder a Supabase SQL Editor
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Haz clic en **New Query**

### 2. Ejecutar el Script
Copia y pega el contenido del archivo `scripts/create-comparison-function.sql` y ejecútalo:

```sql
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
```

### 3. Verificar la Instalación
Ejecuta esta consulta para verificar que la función funciona:

```sql
SELECT * FROM get_users_competing_for_province('MADRID', 'ENFERMERÍA OBSTETRICO-GINECOLÓGICA');
```

Deberías ver una lista de `user_id` que tienen preferencias en Madrid o en hospitales de Madrid para la especialidad de Matrona.

## ¿Qué hace esta función?

La función ejecuta exactamente esta consulta SQL:

```sql
SELECT *
FROM preferences
WHERE specialty = 'ENFERMERÍA OBSTETRICO-GINECOLÓGICA'
AND preference_value IN (
    SELECT province
    FROM offered_positions
    WHERE province = 'MADRID'
    
    UNION
    
    SELECT center
    FROM offered_positions
    WHERE province = 'MADRID'
);
```

Pero de forma parametrizada, permitiendo especificar cualquier provincia y especialidad.

## Uso en la Aplicación

Una vez instalada, la función se usa automáticamente en el endpoint `/api/comparison` para calcular:

- **Usuarios compitiendo por la misma provincia**: Cuenta cuántos usuarios con mejor posición tienen preferencias (hospitales o provincia) en la misma provincia que tu preferencia.

## Troubleshooting

### Error: "function get_users_competing_for_province does not exist"
- Asegúrate de haber ejecutado el script SQL en Supabase
- Verifica que estás conectado a la base de datos correcta

### Error: "permission denied for function"
- Ejecuta el comando GRANT del script:
  ```sql
  GRANT EXECUTE ON FUNCTION get_users_competing_for_province TO authenticated;
  ```

### La función no devuelve resultados
- Verifica que tienes datos en las tablas `preferences` y `offered_positions`
- Asegúrate de usar los nombres exactos de provincias y especialidades que existen en tu base de datos
