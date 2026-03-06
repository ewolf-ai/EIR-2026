# Migración: Añadir Especialidad a Preferencias

## Cambios Implementados

Se ha añadido un selector de especialidad como el primer campo en el gestor de preferencias. Ahora cada preferencia debe tener asociada una especialidad de enfermería.

### ✨ NUEVA FUNCIONALIDAD: Edición de Especialidad

**Ahora los usuarios pueden editar la especialidad de sus preferencias existentes:**
- Haz clic en la etiqueta de color de la especialidad (aparece un icono ✏️ al pasar el cursor)
- Selecciona la nueva especialidad del menú desplegable
- Haz clic en ✓ para guardar o ✕ para cancelar

Esto es especialmente útil para usuarios que ya tenían preferencias registradas antes de que se implementara el campo de especialidad.

### Especialidades Disponibles

Las especialidades disponibles son:

1. **Comunitaria** (ENFERMERÍA FAMILIAR Y COMUNITARIA) - Color: Celeste
2. **Salud Mental** (ENFERMERÍA DE SALUD MENTAL) - Color: Amarillo
3. **Matrona** (ENFERMERÍA OBSTETRICO-GINECOLÓGICA) - Color: Rosa
4. **Pediatría** (ENFERMERÍA PEDIÁTRICA) - Color: Verde
5. **Geriátrica** (ENFERMERÍA GERIÁTRICA) - Color: Morado
6. **Trabajo** (ENFERMERÍA DEL TRABAJO) - Color: Naranja

### Archivos Modificados

1. **DATABASE_SCHEMA.md** - Actualizado el schema de la tabla `preferences`
2. **src/lib/supabase.ts** - Añadido campo `specialty` a la interfaz `Preference`
3. **src/lib/specialties.ts** - NUEVO archivo con constantes y funciones de especialidades
4. **src/lib/security.ts** - Añadida función de validación `validateSpecialty`
5. **src/components/PreferencesManager.tsx** - Añadido selector de especialidad como primer campo + **funcionalidad de edición**
6. **src/components/GlobalTable.tsx** - Mostrar especialidad con código de colores
7. **src/app/api/preferences/route.ts** - Actualizada la API para manejar el campo specialty + **endpoint PUT para actualizar especialidad**

### Cómo Editar una Especialidad

1. Ve a tu panel de "Gestionar Preferencias"
2. Localiza la preferencia cuya especialidad quieres cambiar
3. Haz clic en la etiqueta de color de la especialidad (por ejemplo, "Comunitaria")
4. Se abrirá un selector desplegable con todas las especialidades disponibles
5. Selecciona la nueva especialidad
6. Haz clic en el botón ✓ (check) para guardar el cambio
7. Si cambias de opinión, haz clic en ✕ para cancelar

La especialidad se actualizará inmediatamente en la base de datos y se reflejará en la tabla global.

### Pasos para Aplicar la Migración

⚠️ **IMPORTANTE**: Debes ejecutar el script SQL de migración en tu base de datos de Supabase:

1. Abre el SQL Editor en tu dashboard de Supabase
2. Ejecuta el script ubicado en: `scripts/add-specialty-migration.sql`
3. Verifica que la migración se completó correctamente

### Código de Colores en la Tabla Global

Ahora en la tabla global, cada preferencia muestra una etiqueta de color según su especialidad:

- 🔵 **Celeste** - Comunitaria
- 🟡 **Amarillo** - Salud Mental
- 🩷 **Rosa** - Matrona
- 🟢 **Verde** - Pediatría
- 🟣 **Morado** - Geriátrica
- 🟠 **Naranja** - Trabajo

### Comportamiento

- Al crear una nueva preferencia, el usuario debe seleccionar primero la especialidad
- La especialidad seleccionada por defecto es "Comunitaria" (la más común)
- La especialidad se muestra como una etiqueta de color tanto en el gestor de preferencias como en la tabla global
- El campo especialidad es obligatorio y validado tanto en el frontend como en el backend

### Datos Existentes

Para las preferencias existentes en la base de datos, el script de migración asigna automáticamente la especialidad "ENFERMERÍA FAMILIAR Y COMUNITARIA" como valor por defecto. Si deseas cambiar esto, puedes modificar el script SQL antes de ejecutarlo.
