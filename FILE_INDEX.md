# Índice de Archivos del Proyecto EIR 2026

Este documento lista todos los archivos creados y su propósito.

## 📁 Estructura del Proyecto

```
EIR/
├── 📄 Archivos de configuración
│   ├── package.json                 # Dependencias y scripts NPM
│   ├── tsconfig.json               # Configuración TypeScript
│   ├── next.config.js              # Configuración Next.js
│   ├── tailwind.config.js          # Configuración Tailwind CSS
│   ├── postcss.config.js           # Configuración PostCSS
│   ├── .eslintrc.json              # Configuración ESLint
│   ├── .gitignore                  # Archivos ignorados por Git
│   ├── .env.example                # Ejemplo de variables de entorno
│   └── .env.local                  # Variables de entorno (crear tú)
│
├── 📚 Documentación
│   ├── README.md                   # Documentación principal
│   ├── QUICKSTART.md               # Guía de inicio rápido
│   ├── DATABASE_SCHEMA.md          # Esquema de base de datos
│   ├── DEPLOYMENT.md               # Guía de despliegue
│   ├── SECURITY.md                 # Documentación de seguridad
│   └── FILE_INDEX.md              # Este archivo
│
├── 🎯 Aplicación (src/)
│   ├── app/
│   │   ├── layout.tsx              # Layout principal de la app
│   │   ├── page.tsx                # Página principal (Home/Dashboard)
│   │   └── globals.css             # Estilos globales
│   │
│   ├── components/
│   │   ├── AuthProvider.tsx        # Proveedor de autenticación
│   │   ├── LoginButton.tsx         # Botón de login con Google
│   │   ├── DNIModal.tsx            # Modal para registrar DNI
│   │   ├── Header.tsx              # Cabecera de la aplicación
│   │   ├── Dashboard.tsx           # Dashboard principal
│   │   ├── UserPanel.tsx           # Panel de información del usuario
│   │   ├── PreferencesManager.tsx  # Gestor de preferencias
│   │   └── GlobalTable.tsx         # Tabla global de usuarios
│   │
│   ├── lib/
│   │   ├── firebase.ts             # Configuración Firebase
│   │   ├── supabase.ts             # Configuración Supabase + tipos
│   │   ├── auth.ts                 # Servicios de autenticación
│   │   ├── security.ts             # Utilidades de seguridad
│   │   └── store.ts                # Estado global (Zustand)
│   │
│   └── middleware.ts               # Middleware de seguridad (headers)
│
└── 🛠️ Scripts
    └── import-data.ts              # Script para importar plazas EIR

```

## 📄 Descripción Detallada de Archivos

### Configuración

#### `package.json`
- **Propósito**: Define dependencias, scripts y metadata del proyecto
- **Contenido clave**:
  - Dependencies: next, react, firebase, supabase, zustand
  - Scripts: dev, build, start, lint
- **Cuándo editar**: Al añadir nuevas dependencias

#### `tsconfig.json`
- **Propósito**: Configuración del compilador TypeScript
- **Contenido clave**:
  - Strict mode habilitado
  - Path aliases (@/*)
- **Cuándo editar**: Para cambiar opciones de compilación

#### `next.config.js`
- **Propósito**: Configuración de Next.js
- **Contenido clave**:
  - Dominios permitidos para imágenes
  - React strict mode
- **Cuándo editar**: Para añadir dominios de imágenes, redirects, etc.

#### `tailwind.config.js`
- **Propósito**: Configuración de Tailwind CSS
- **Contenido clave**:
  - Colores personalizados (nursing, pastel)
  - Extensiones de tema
- **Cuándo editar**: Para personalizar colores y estilos

#### `.env.example`
- **Propósito**: Plantilla de variables de entorno
- **Uso**: Copiar a `.env.local` y rellenar con valores reales
- **NO** contiene datos sensibles

### Documentación

#### `README.md`
- **Propósito**: Documentación principal del proyecto
- **Contenido**:
  - Características
  - Instalación paso a paso
  - Configuración
  - Uso
- **Audiencia**: Desarrolladores nuevos en el proyecto

#### `QUICKSTART.md`
- **Propósito**: Guía rápida de configuración (10 minutos)
- **Contenido**:
  - Pasos simplificados
  - Troubleshooting común
  - Checklist
- **Audiencia**: Para empezar rápidamente

#### `DATABASE_SCHEMA.md`
- **Propósito**: Documentación completa de la base de datos
- **Contenido**:
  - Definición de todas las tablas
  - Scripts SQL
  - Políticas RLS
  - Triggers
- **Uso**: Ejecutar en Supabase SQL Editor

#### `DEPLOYMENT.md`
- **Propósito**: Guía para desplegar en producción
- **Contenido**:
  - Opciones de hosting (Vercel, Netlify, Railway)
  - Configuración de producción
  - Checklist de seguridad
  - Monitorización
- **Audiencia**: Para llevar la app a producción

#### `SECURITY.md`
- **Propósito**: Documentación exhaustiva de seguridad
- **Contenido**:
  - Protecciones implementadas
  - Explicación técnica de cada medida
  - Mejoras futuras
  - Proceso de reporte de vulnerabilidades
- **Audiencia**: Desarrolladores, auditores de seguridad

### Aplicación

#### `src/app/layout.tsx`
- **Propósito**: Layout raíz de la aplicación
- **Contenido**:
  - Configuración de fuentes
  - Metadata (SEO)
  - AuthProvider wrapper
- **Renderiza**: Toda la aplicación

#### `src/app/page.tsx`
- **Propósito**: Página principal (Home)
- **Lógica**:
  - Si no hay usuario: muestra pantalla de login
  - Si hay usuario: muestra Dashboard
- **Estado**: Usa useAuthStore

#### `src/app/globals.css`
- **Propósito**: Estilos globales y Tailwind
- **Contenido**:
  - Imports de Tailwind
  - Fondo con decoraciones de enfermería
  - Scrollbar personalizada
  - Animaciones
- **Temática**: Colores pastel, iconos médicos

#### `src/components/AuthProvider.tsx`
- **Propósito**: Gestiona el flujo de autenticación
- **Funcionalidad**:
  - Escucha cambios de auth de Firebase
  - Verifica si usuario existe en Supabase
  - Muestra DNIModal si es usuario nuevo
  - Carga preferencias del usuario
- **Wrapper**: Envuelve toda la app

#### `src/components/LoginButton.tsx`
- **Propósito**: Botón para iniciar sesión con Google
- **UI**: Botón con logo de Google
- **Manejo de errores**: Muestra mensajes de error
- **Estados**: Loading, error

#### `src/components/DNIModal.tsx`
- **Propósito**: Modal para registrar DNI en primer acceso
- **Validación**:
  - Formato: 8 dígitos + letra
  - Algoritmo oficial español
  - Unicidad en BD
- **No cancelable**: Usuario debe registrar DNI o logout

#### `src/components/Header.tsx`
- **Propósito**: Cabecera de la aplicación
- **Contenido**:
  - Logo y título
  - Información de usuario
  - Botón de logout
- **Sticky**: Se queda fijo al hacer scroll

#### `src/components/Dashboard.tsx`
- **Propósito**: Layout del dashboard principal
- **Estructura**:
  - UserPanel (información y stats)
  - PreferencesManager + Info card
  - GlobalTable
  - Footer
- **Responsivo**: Grid adaptativo

#### `src/components/UserPanel.tsx`
- **Propósito**: Panel de información del usuario
- **Muestra**:
  - Avatar, nombre, email
  - Número de plaza (editable)
  - Preferencias (top 3)
  - Análisis comparativo
- **Análisis**: Compara con otros usuarios

#### `src/components/PreferencesManager.tsx`
- **Propósito**: Gestión completa de preferencias
- **Funcionalidades**:
  - Añadir preferencias (hospital/provincia/comunidad)
  - Reordenar por prioridad
  - Eliminar preferencias
  - Autocompletado con sugerencias de BD
- **Real-time**: Actualiza Supabase inmediatamente

#### `src/components/GlobalTable.tsx`
- **Propósito**: Tabla de todos los usuarios y preferencias
- **Funcionalidades**:
  - Ordenar por posición o nombre
  - Ver preferencias de cada usuario
  - Contador de total de usuarios
- **Actualización**: Se recarga al montar

#### `src/lib/firebase.ts`
- **Propósito**: Configuración de Firebase
- **Exports**:
  - `auth`: Instancia de autenticación
  - `googleProvider`: Proveedor de Google
- **Singleton**: Solo inicializa una vez

#### `src/lib/supabase.ts`
- **Propósito**: Configuración de Supabase
- **Exports**:
  - `supabase`: Cliente de Supabase
  - Interfaces TypeScript para todas las tablas
- **TypeScript**: Tipos seguros para BD

#### `src/lib/auth.ts`
- **Propósito**: Servicios de autenticación
- **Funciones**:
  - `signInWithGoogle()`: Login con Google
  - `signOut()`: Cerrar sesión
  - `getUserFromDB()`: Obtener usuario de Supabase
  - `checkDNIExists()`: Verificar unicidad DNI
  - `createUserInDB()`: Crear usuario con DNI
  - `updateEIRPosition()`: Actualizar posición
  - `getUserPreferences()`: Obtener preferencias
- **Validaciones**: Todas las funciones validan inputs

#### `src/lib/security.ts`
- **Propósito**: Utilidades de seguridad
- **Funciones**:
  - `validateDNI()`: Validación con algoritmo oficial
  - `sanitizeDNI()`: Limpieza de DNI
  - `validateEmail()`: Validación de email
  - `sanitizeString()`: Limpieza de strings
  - `validateEIRPosition()`: Validación de posición
  - `checkRateLimit()`: Rate limiting básico
  - `escapeHTML()`: Escape de HTML para XSS
- **Headers**: Definición de CSP y otros headers

#### `src/lib/store.ts`
- **Propósito**: Estado global con Zustand
- **Estado**:
  - `firebaseUser`: Usuario de Firebase
  - `dbUser`: Usuario de Supabase
  - `preferences`: Array de preferencias
  - `loading`: Estado de carga
- **Acciones**: Setters para cada propiedad

#### `src/middleware.ts`
- **Propósito**: Middleware de Next.js para seguridad
- **Headers**:
  - Content-Security-Policy
  - X-Frame-Options
  - HSTS
  - Y más...
- **Aplica a**: Todas las rutas excepto API y assets

### Scripts

#### `scripts/import-data.ts`
- **Propósito**: Importar plazas EIR a Supabase
- **Uso**:
  ```bash
  npx tsx scripts/import-data.ts
  ```
- **Requiere**: 
  - Archivo `eir-positions.json` con datos
  - Variables de entorno configuradas
- **Importa**:
  - Plazas ofertadas (offered_positions)
  - Mapeo provincias-comunidades (autonomous_communities)

## 🎯 Archivos que debes crear tú

### `.env.local`
```bash
# Copiar de .env.example y rellenar con tus valores
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
# etc.
```

### `scripts/eir-positions.json` (opcional)
```json
[
  {
    "locality": "MADRID",
    "province": "MADRID",
    "center": "H. UNIVERSITARIO LA PAZ",
    "specialty": "ENFERMERÍA FAMILIAR Y COMUNITARIA",
    "num_positions": 10
  },
  // ...
]
```

## 📝 Archivos generados automáticamente

Estos archivos se generan automáticamente y NO deben editarse:

- `.next/` - Build de Next.js
- `node_modules/` - Dependencias NPM
- `next-env.d.ts` - Tipos de Next.js

## 🔄 Flujo de Datos

```
1. Usuario hace login
   ↓
2. Firebase Auth valida
   ↓
3. AuthProvider verifica en Supabase
   ↓
4. Si nuevo: DNIModal → Crea en Supabase
   Si existe: Carga datos
   ↓
5. Dashboard renderiza con datos
   ↓
6. Usuario gestiona preferencias
   ↓
7. Updates en tiempo real a Supabase
   ↓
8. GlobalTable muestra a todos
```

## 🛠️ Modificaciones Comunes

### Cambiar colores
**Archivo**: `tailwind.config.js`
```javascript
colors: {
  nursing: {
    500: '#nuevo-color',
  }
}
```

### Añadir nueva tabla en BD
1. **Archivo**: `DATABASE_SCHEMA.md` - Añadir SQL
2. **Archivo**: `src/lib/supabase.ts` - Añadir interface
3. Ejecutar SQL en Supabase

### Añadir nueva página
1. Crear `src/app/nueva-pagina/page.tsx`
2. Next.js creará la ruta automáticamente

### Modificar diseño del dashboard
**Archivo**: `src/components/Dashboard.tsx`

### Cambiar lógica de autenticación
**Archivo**: `src/lib/auth.ts`

## 📊 Tamaño aproximado de archivos

- **Total del proyecto**: ~50 archivos
- **Código fuente**: ~2000 líneas
- **Documentación**: ~4000 líneas
- **Dependencias**: ~300MB (`node_modules`)

## 🎓 Para aprender más

- **Next.js**: Comienza por `src/app/page.tsx`
- **Firebase**: Revisa `src/lib/firebase.ts` y `src/lib/auth.ts`
- **Supabase**: Mira `src/lib/supabase.ts` y `DATABASE_SCHEMA.md`
- **Componentes**: Explora `src/components/`
- **Seguridad**: Lee `SECURITY.md` y `src/lib/security.ts`

---

**Última actualización**: Marzo 2026
**Total de archivos creados**: 30+
