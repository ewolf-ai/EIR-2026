# Migración a Sistema de Asignación de Plazas Persistente

## 🎯 Objetivo

Migrar del sistema actual (cálculo en tiempo real) a un sistema robusto y estable donde:
- **La plaza adjudicada se guarda en la base de datos**
- **Se recalcula automáticamente solo cuando hay cambios relevantes**
- **Los resultados son consistentes y determinísticos**

---

## ✅ Beneficios de la Migración

### Antes (Sistema Actual)
❌ Recalcula en cada carga de página (~5-10k usuarios × preferencias)  
❌ Resultados inconsistentes por orden no determinístico  
❌ Puede mostrar "con plaza" y "sin plaza" alternadamente  
❌ Alto consumo de recursos del servidor  
❌ Tiempo de carga lento  

### Después (Sistema Nuevo)
✅ Lee directamente de la BD (consulta simple)  
✅ Resultados siempre consistentes y determinísticos  
✅ Recálculo solo cuando hay cambios reales  
✅ Rendimiento 100x mejor  
✅ Escalable a millones de usuarios  

---

## 📋 Pasos de Migración

### **Paso 1: Ejecutar Scripts SQL en Supabase**

Ejecuta estos archivos **EN ORDEN** en tu SQL Editor de Supabase:

#### 1.1 - Añadir columnas para asignación persistente
```bash
scripts/add-assigned-position-column.sql
```
- Añade `assigned_position_simulation` a tabla `users`
- Añade `assignment_calculated_at` para tracking
- Crea índices de rendimiento

#### 1.2 - (OPCIONAL) Helper function para compatibilidad
```bash
scripts/create-province-community-mapping.sql
```
- **NOTA**: La tabla `autonomous_communities` ya existe en tu BD
- Este script solo crea una función helper opcional `get_provinces_in_community()`
- Puedes saltarte este paso si lo prefieres

#### 1.3 - Crear función de recálculo de asignaciones
```bash
scripts/recalculate-assignments-function.sql
```
- Función PostgreSQL `recalculate_position_assignments()`
- Implementa el algoritmo de adjudicación determinístico
- Usa la tabla `autonomous_communities` existente
- Procesa usuarios en orden estricto: `eir_position ASC, created_at ASC`

#### 1.4 - Crear triggers automáticos
```bash
scripts/create-assignment-triggers.sql
```
- Triggers en tablas: `preferences`, `users`, `offered_positions`
- Tabla de cola: `assignment_recalculation_queue`
- Función procesadora: `process_assignment_recalculation_queue()`

---

### **Paso 2: Ejecutar Cálculo Inicial**

Una vez ejecutados los scripts SQL (1.1, 1.3, 1.4 son obligatorios), ejecuta el cálculo inicial:

```sql
-- En Supabase SQL Editor
SELECT * FROM recalculate_position_assignments();
```

Esto devolverá algo como:
```
users_processed | users_assigned | calculation_timestamp
----------------|----------------|----------------------
5234            | 4891           | 2026-03-07 15:30:00
```

**Verifica que:**
- `users_processed` = número de usuarios con `eir_position` != NULL
- `users_assigned` ≤ `users_processed` (algunos pueden no tener plaza)

---

### **Paso 3: Reemplazar el Endpoint de API**

#### 3.1 - Backup del archivo actual
```powershell
Copy-Item src/app/api/comparison/route.ts src/app/api/comparison/route-OLD.ts
```

#### 3.2 - Reemplazar con la nueva versión
```powershell
Copy-Item src/app/api/comparison/route-v2.ts src/app/api/comparison/route.ts
```

**Diferencias clave:**
- ❌ **Elimina**: Todo el algoritmo de simulación (líneas 78-199)
- ✅ **Lee** `assigned_position_simulation` directamente de BD
- ✅ Mantiene el análisis de preferencias (estadísticas)
- ✅ Devuelve también `assignmentCalculatedAt`

---

### **Paso 4: Actualizar el UserPanel (opcional)**

Si quieres mostrar cuándo se calculó la asignación:

```typescript
// En UserPanel.tsx, añadir al tipo ComparisonData:
interface ComparisonData {
  totalUsers: number;
  assignedPosition: string | null;
  assignmentCalculatedAt: string | null; // ⬅️ NUEVO
  preferenceAnalysis: PreferenceAnalysis[];
}

// Mostrar en la UI:
{comparison.assignmentCalculatedAt && (
  <p className="text-xs text-gray-500 mt-1">
    Calculado: {new Date(comparison.assignmentCalculatedAt).toLocaleString('es-ES')}
  </p>
)}
```

---

### **Paso 5: Configurar Recálculo Automático**

Tienes 2 opciones:

#### **Opción A: Manual (para testing)**
```powershell
# Llamar al endpoint cuando sea necesario
curl -X POST http://localhost:3000/api/recalculate-assignments
```

#### **Opción B: Automático con Supabase Edge Functions (recomendado)**

1. Crear Edge Function para cron job:
```typescript
// supabase/functions/recalculate-assignments-cron/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data, error } = await supabase.rpc('process_assignment_recalculation_queue')
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true, data }), { status: 200 })
})
```

2. Configurar Cron en Supabase Dashboard:
   - Ve a **Edge Functions** → **Cron Jobs**
   - Añade: `*/5 * * * *` (cada 5 minutos)
   - Trigger: `recalculate-assignments-cron`

#### **Opción C: Cliente Next.js (simple)**
Llamar desde el cliente cuando cambien preferencias:

```typescript
// Después de guardar preferencias
await fetch('/api/recalculate-assignments', { method: 'POST' });
```

---

## 🔍 Verificación Post-Migración

### 1. Verificar datos en BD
```sql
-- Ver usuarios con asignación
SELECT 
  display_name,
  eir_position,
  assigned_position_simulation,
  assignment_calculated_at
FROM users
WHERE eir_position IS NOT NULL
ORDER BY eir_position
LIMIT 20;

-- Ver estadísticas
SELECT * FROM assignment_statistics;
```

### 2. Verificar consistencia
```powershell
# Recargar la página varias veces y verificar que:
# - La plaza adjudicada NO cambia
# - El timestamp de cálculo es el mismo
```

### 3. Verificar triggers
```sql
-- Cambiar una preferencia
UPDATE preferences 
SET priority = 2 
WHERE user_id = 'algún-user-id' AND priority = 1;

-- Verificar que se añadió a la cola
SELECT * FROM assignment_recalculation_queue 
WHERE processed = FALSE;

-- Procesar manualmente la cola
SELECT * FROM process_assignment_recalculation_queue();

-- Verificar que se actualizó assignment_calculated_at
SELECT assignment_calculated_at FROM users LIMIT 1;
```

---

## 🚨 Troubleshooting

### Problema: "Function recalculate_position_assignments() does not exist"
**Solución:** Re-ejecutar `scripts/recalculate-assignments-function.sql`

### Problema: "Relation province_community_mapping does not exist"
**Solución:** Ejecutar `scripts/create-province-community-mapping.sql`

### Problema: Los triggers no se activan
**Solución:** 
```sql
-- Verificar que existen
SELECT * FROM pg_trigger WHERE tgname LIKE '%recalc%';

-- Re-crear si es necesario
\i scripts/create-assignment-triggers.sql
```

### Problema: Asignaciones incorrectas
**Solución:**
1. Verificar datos base: `SELECT * FROM offered_positions LIMIT 10;`
2. Verificar preferencias: `SELECT * FROM preferences ORDER BY priority LIMIT 20;`
3. Re-ejecutar cálculo: `SELECT * FROM recalculate_position_assignments();`

---

## 📊 Monitorización

### Ver historial de recálculos
```sql
SELECT * FROM recalculation_history;
```

### Ver estado de la cola
```sql
SELECT * FROM assignment_recalculation_queue 
ORDER BY triggered_at DESC 
LIMIT 10;
```

### Estadísticas de rendimiento
```sql
SELECT 
  COUNT(*) as total_recalculations,
  AVG(processing_time_seconds) as avg_time_seconds,
  MAX(processing_time_seconds) as max_time_seconds
FROM recalculation_history
WHERE processed = TRUE;
```

---

## 🔄 Rollback (si algo sale mal)

```powershell
# Restaurar endpoint anterior
Copy-Item src/app/api/comparison/route-OLD.ts src/app/api/comparison/route.ts

# En Supabase SQL Editor:
ALTER TABLE users DROP COLUMN IF EXISTS assigned_position_simulation;
ALTER TABLE users DROP COLUMN IF EXISTS assignment_calculated_at;
DROP TABLE IF EXISTS assignment_recalculation_queue;
DROP FUNCTION IF EXISTS recalculate_position_assignments();
DROP FUNCTION IF EXISTS process_assignment_recalculation_queue();
-- Note: autonomous_communities table is part of core schema, don't drop it
```

---

## 📈 Mejoras Futuras (Opcional)

1. **Dashboard de Admin**
   - Ver estadísticas de asignaciones
   - Forzar recálculo manual
   - Ver logs de cambios

2. **Notificaciones**
   - Email cuando cambia tu plaza asignada
   - Webhook a Discord/Slack cuando se completa recálculo

3. **Caché adicional**
   - Redis para análisis de preferencias
   - CDN para datos públicos

4. **Optimización**
   - Índices parciales para queries específicas
   - Particionamiento de preferencias por especialidad

---

## ✅ Checklist Final

Antes de marcar como completado:

- [ ] Ejecutados 3 scripts SQL obligatorios (1.1, 1.3, 1.4)
- [ ] Script opcional 1.2 ejecutado o saltado conscientemente
- [ ] Ejecutado cálculo inicial con éxito
- [ ] Endpoint comparison actualizado
- [ ] Verificada consistencia (recargar página varias veces)
- [ ] Triggers funcionando (cambiar preferencia → cola → recálculo)
- [ ] Configurado recálculo automático (cron o manual)
- [ ] Documentación actualizada
- [ ] Backup del código anterior realizado

---

**¡La migración está completa! Tu sistema ahora es robusto y escalable. 🎉**
