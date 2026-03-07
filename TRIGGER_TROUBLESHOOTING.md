# 🔧 Guía Rápida: Arreglar Triggers que No Se Disparan

## 🎯 Problema Identificado

Los triggers no se disparan cuando cambias preferencias debido a **2 errores comunes**:

1. **RLS bloqueando inserciones** en `assignment_recalculation_queue`
2. **RETURN incorrecto** en triggers de nivel STATEMENT (debe ser `RETURN NULL`, no `RETURN NEW`)

---

## ✅ Solución Inmediata

### Opción A: Script de Fix Rápido para Supabase (RECOMENDADO)

**Si estás usando Supabase (que es tu caso), usa este:**

```bash
scripts/fix-triggers-supabase.sql
```

Este script específico para Supabase:
- ✅ Usa roles de Supabase (`anon`, `authenticated`, `service_role`)
- ✅ RLS configurado correctamente con políticas permisivas
- ✅ Crea TODAS las funciones necesarias (incluyendo la que falta para users)
- ✅ SECURITY DEFINER en todas las funciones de trigger
- ✅ Test sin `pg_sleep` (no disponible siempre en Supabase)
- ✅ Manejo robusto de errores

**Tiempo estimado: 10 segundos**

### Opción B: Script Genérico (para PostgreSQL estándar)

```bash
scripts/fix-triggers.sql
```

⚠️ Este script puede tener problemas en Supabase. Úsalo solo si NO estás en Supabase.

---

### Opción B: Diagnóstico Primero

Si quieres ver exactamente qué está mal antes de arreglar:

```bash
scripts/diagnose-triggers.sql
```

Este script te mostrará:
- 🔍 Si los triggers existen y están habilitados
- 🔍 Estado de la cola
- 🔍 Test manual del trigger
- 🔍 Permisos de funciones
- 🔍 Políticas RLS
- 🔍 Recomendaciones específicas

---

## 📋 Verificación Post-Fix

### 1. Verificar que los triggers funcionan

```sql
-- Hacer un cambio de prueba en preferencias
UPDATE preferences 
SET updated_at = NOW() 
WHERE user_id IN (SELECT id FROM users LIMIT 1);

-- Verificar que se añadió a la cola
SELECT * FROM assignment_recalculation_queue 
WHERE processed = FALSE 
ORDER BY triggered_at DESC 
LIMIT 5;
```

**Resultado esperado:** Debe aparecer un item con `reason = 'Preferences modified'`

### 2. Procesar la cola

```sql
SELECT * FROM process_assignment_recalculation_queue();
```

**Resultado esperado:** Debe devolver estadísticas del recálculo

### 3. Verificar en la web

1. Ve a tu perfil de usuario
2. Cambia el orden de una preferencia
3. Refresca la página (Ctrl+F5)
4. La plaza asignada debería reflejar el cambio

---

## 🔍 Síntomas y Causas

| Síntoma | Causa Probable | Solución |
|---------|----------------|----------|
| La cola siempre está vacía | Triggers no instalados o deshabilitados | Ejecutar `fix-triggers.sql` |
| Error "permission denied" | RLS bloqueando inserts | Desactivar RLS en queue table |
| Trigger existe pero no dispara | RETURN incorrecto en función | Cambiar a `RETURN NULL` |
| Cola se llena pero no procesa | No hay cron/manual trigger | Llamar `process_assignment_recalculation_queue()` |

---

## 🚀 Configuración Automática (Opcional)

Una vez arreglados los triggers, configura procesamiento automático:

### Opción 1: Desde el cliente (Next.js)

Añade al endpoint de preferencias:

```typescript
// En src/app/api/preferences/route.ts
// Después de modificar preferencias exitosamente:

try {
  // Trigger recalculation
  await fetch('/api/recalculate-assignments', { 
    method: 'POST' 
  });
} catch (err) {
  console.error('Failed to trigger recalculation:', err);
  // No fallar la request principal
}
```

### Opción 2: Cron job (Supabase Edge Functions)

```typescript
// supabase/functions/process-queue/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data, error } = await supabase
    .rpc('process_assignment_recalculation_queue')

  if (error) throw error

  return new Response(JSON.stringify({ success: true, data }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

Luego configura cron: `*/5 * * * *` (cada 5 minutos)

---

## 🧪 Tests de Integración

```sql
-- Test completo: trigger → cola → procesamiento → resultado

-- 1. Limpiar cola
DELETE FROM assignment_recalculation_queue;

-- 2. Hacer cambio
UPDATE preferences SET priority = priority WHERE user_id IN (SELECT id FROM users LIMIT 1);

-- 3. Verificar cola (debe tener 1 item)
SELECT COUNT(*) FROM assignment_recalculation_queue WHERE processed = FALSE;

-- 4. Procesar
SELECT * FROM process_assignment_recalculation_queue();

-- 5. Verificar que se procesó (debe estar en 0)
SELECT COUNT(*) FROM assignment_recalculation_queue WHERE processed = FALSE;

-- 6. Verificar que se actualizó assignment_calculated_at
SELECT 
  COUNT(*) as users_with_calculation,
  MAX(assignment_calculated_at) as last_calculation
FROM users
WHERE assigned_position_simulation IS NOT NULL;
```

---

## ❓ FAQ

**P: ¿Por qué desactivar RLS en assignment_recalculation_queue?**  
R: Porque la función usa `SECURITY DEFINER`, que ya maneja la seguridad. RLS adicional puede bloquear inserts legítimos.

**P: ¿Es seguro desactivar RLS?**  
R: Sí, porque solo la función `queue_assignment_recalculation()` puede insertar (con SECURITY DEFINER), y esta función tiene lógica de validación.

**P: ¿Qué pasa si hay muchos cambios simultáneos?**  
R: La función solo añade UN item a la cola si no hay ninguno pendiente. Esto evita spam pero asegura que siempre se procese.

**P: ¿Cuánto tarda el recálculo?**  
R: Depende del número de usuarios:
- 1-1000 usuarios: 1-5 segundos
- 1000-5000 usuarios: 5-15 segundos
- 5000-10000 usuarios: 15-30 segundos

---

## 📞 Si Sigue Sin Funcionar

1. Ejecuta `scripts/diagnose-triggers.sql` y envíame el output
2. Verifica logs de Supabase Database → Logs
3. Intenta insertar manualmente:
   ```sql
   INSERT INTO assignment_recalculation_queue (reason) 
   VALUES ('Manual test');
   ```
   Si esto falla, hay un problema de permisos/RLS.

---

**💡 Tip:** Una vez que funcione, puedes ver el historial de recálculos:
```sql
SELECT * FROM recalculation_history ORDER BY triggered_at DESC LIMIT 20;
```
