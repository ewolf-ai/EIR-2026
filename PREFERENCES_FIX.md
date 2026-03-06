# Solución al Error de Ordenación de Preferencias

## Problema
Cuando un usuario intentaba cambiar el orden de sus preferencias, la actualización fallaba y no se guardaba en la base de datos. 

## Causa Raíz
La tabla `preferences` tiene una restricción `UNIQUE(user_id, priority)` que impide que dos preferencias del mismo usuario tengan la misma prioridad temporalmente. Al actualizar múltiples preferencias en paralelo con `Promise.all`, se generaban conflictos de constraints.

Por ejemplo:
- Preferencia A: priority = 1
- Preferencia B: priority = 2

Al intentar intercambiarlas:
1. Actualizar A a priority = 2 → **ERROR** (B ya tiene priority = 2)

## Solución Implementada

### 1. Función RPC en Supabase
Se creó una función PostgreSQL que actualiza las prioridades en dos fases dentro de una transacción:

1. **Primera fase**: Mueve todas las prioridades a valores temporales únicos (priority + 100000)
2. **Segunda fase**: Actualiza a los valores finales deseados

Esto garantiza que nunca haya conflictos con la restricción UNIQUE.

### 2. Actualización del Endpoint API
El endpoint `/api/preferences` (método PATCH) ahora usa la función RPC en lugar de múltiples actualizaciones en paralelo.

## Pasos para Aplicar la Solución

### 1. Ejecutar el Script SQL en Supabase
1. Ve a tu panel de Supabase → SQL Editor
2. Ejecuta el archivo `scripts/fix-preferences-ordering.sql`

```sql
-- O copia y pega este código directamente:
CREATE OR REPLACE FUNCTION update_preferences_priorities(preferences_data JSONB)
RETURNS void AS $$
DECLARE
  pref JSONB;
  temp_offset INTEGER := 100000;
BEGIN
  -- Primera fase: valores temporales
  FOR pref IN SELECT * FROM jsonb_array_elements(preferences_data)
  LOOP
    UPDATE preferences
    SET priority = ((pref->>'priority')::INTEGER + temp_offset),
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = (pref->>'id')::UUID;
  END LOOP;

  -- Segunda fase: valores finales
  FOR pref IN SELECT * FROM jsonb_array_elements(preferences_data)
  LOOP
    UPDATE preferences
    SET priority = (pref->>'priority')::INTEGER,
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = (pref->>'id')::UUID;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### 2. Reiniciar el Servidor de Desarrollo
```bash
npm run dev
```

### 3. Probar el Reordenamiento
1. Inicia sesión en la aplicación
2. Ve a la sección de preferencias
3. Usa las flechas ▲ ▼ para reordenar tus preferencias
4. El orden debería guardarse correctamente y mantenerse después de recargar la página

## Archivos Modificados

- `src/app/api/preferences/route.ts` - Actualizado método PATCH para usar RPC
- `DATABASE_SCHEMA.md` - Documentada la función RPC
- `scripts/fix-preferences-ordering.sql` - Script SQL para crear la función

## Beneficios

✅ **Transacciones atómicas**: Todas las actualizaciones se realizan en una sola transacción  
✅ **Sin conflictos**: La técnica de dos fases elimina conflictos de constraints  
✅ **Actualizaciones optimistas**: La UI se actualiza inmediatamente con rollback en caso de error  
✅ **Compatible**: No requiere cambios en el esquema de la base de datos
