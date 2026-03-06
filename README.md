# EIR 2026 - Gestión de Plazas 🩺

Aplicación web para gestionar las plazas ofertadas del EIR 2026. Permite a los aspirantes organizar sus preferencias, comparar su posición con otros usuarios y tomar decisiones informadas sobre la elección de plaza.

## ✨ Características

- 🔐 **Autenticación segura** con Google (Firebase Authentication)
- 🆔 **Verificación de DNI único** para garantizar transparencia
- 📊 **Análisis comparativo** de posiciones entre usuarios
- 🎯 **Gestión de preferencias** por hospital, provincia o comunidad autónoma
- 👥 **Tabla global** para ver las preferencias de todos los usuarios
- 🎨 **Diseño moderno** con temática de enfermería y colores pastel
- 🔒 **Seguridad robusta** contra XSS, SQL Injection, MITM, etc.

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Autenticación**: Firebase Auth
- **Base de datos**: Supabase (PostgreSQL)
- **Gestión de estado**: Zustand
- **Seguridad**: CSP, HTTPS, Row Level Security (RLS)

## 📋 Requisitos previos

- Node.js 18+ y npm/yarn
- Cuenta de Firebase
- Cuenta de Supabase

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd EIR
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication → Google Sign-In
3. Obtener las credenciales del proyecto:
   - Ir a Project Settings → General
   - Copiar la configuración de Firebase

### 4. Configurar Supabase

1. Crear un proyecto en [Supabase](https://supabase.com/)
2. Ir a Settings → API
3. Copiar:
   - Project URL
   - `anon` public key
   - `service_role` key (mantener segura)

### 5. Crear base de datos

1. Abrir el SQL Editor en Supabase
2. Ejecutar los comandos del archivo `DATABASE_SCHEMA.md`
3. Verificar que las tablas se crearon correctamente

### 6. Configurar variables de entorno

Crear archivo `.env.local` en la raíz del proyecto:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu_proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7. Importar datos de plazas (Opcional)

Para importar las 2279 plazas ofertadas del EIR 2026, puedes:

**Opción A: Importación manual en Supabase**
1. Ir a Table Editor en Supabase
2. Seleccionar la tabla `offered_positions`
3. Importar el archivo CSV/Excel proporcionado con los datos

**Opción B: Usar el script de importación**
```bash
npm install -D dotenv tsx
npx tsx scripts/import-data.ts
```

### 8. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 📦 Build para producción

```bash
npm run build
npm start
```

## 🔒 Seguridad

La aplicación implementa múltiples capas de seguridad:

### Protección contra MITM (Man-in-the-Middle)
- ✅ HTTPS obligatorio en producción
- ✅ Strict Transport Security (HSTS)
- ✅ Secure cookies
- ✅ Headers de seguridad configurados

### Protección contra SQL Injection
- ✅ Uso de Supabase con queries parametrizadas
- ✅ Row Level Security (RLS) habilitado
- ✅ Validación de entradas en cliente y servidor
- ✅ Sanitización de datos

### Protección contra XSS
- ✅ Content Security Policy (CSP) estricta
- ✅ Sanitización de inputs
- ✅ Escape de HTML
- ✅ React escapa automáticamente el contenido

### Protección contra inyección de código
- ✅ Validación estricta de tipos con TypeScript
- ✅ Sanitización de strings
- ✅ Rate limiting básico
- ✅ Validación de DNI con algoritmo oficial

### Control de acceso
- ✅ Autenticación obligatoria con Firebase
- ✅ RLS en Supabase (usuarios solo acceden a sus datos)
- ✅ Verificación de DNI único
- ✅ Tokens JWT seguros

## 📊 Estructura del proyecto

```
EIR/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx             # Página principal
│   │   └── globals.css          # Estilos globales
│   ├── components/
│   │   ├── AuthProvider.tsx     # Proveedor de autenticación
│   │   ├── LoginButton.tsx      # Botón de login
│   │   ├── DNIModal.tsx         # Modal para registrar DNI
│   │   ├── Header.tsx           # Cabecera
│   │   ├── Dashboard.tsx        # Dashboard principal
│   │   ├── UserPanel.tsx        # Panel de usuario
│   │   ├── PreferencesManager.tsx # Gestor de preferencias
│   │   └── GlobalTable.tsx      # Tabla global
│   ├── lib/
│   │   ├── firebase.ts          # Configuración Firebase
│   │   ├── supabase.ts          # Configuración Supabase
│   │   ├── auth.ts              # Servicios de autenticación
│   │   ├── security.ts          # Utilidades de seguridad
│   │   └── store.ts             # Estado global (Zustand)
│   └── middleware.ts            # Middleware de seguridad
├── scripts/
│   └── import-data.ts           # Script de importación
├── DATABASE_SCHEMA.md           # Esquema de base de datos
├── .env.example                 # Ejemplo de variables de entorno
└── README.md                    # Este archivo
```

## 🎨 Diseño

El diseño sigue una temática de enfermería con:
- Colores pastel suaves (rosa, azul, menta, lavanda)
- Iconos temáticos (🩺, 💉, ❤️, 🏥)
- Fondo con decoraciones sutiles de baja opacidad
- Interfaz limpia y moderna
- Totalmente responsive

## 📝 Uso de la aplicación

1. **Iniciar sesión**: Click en "Sign in with Google"
2. **Registrar DNI**: En el primer acceso, introducir DNI (será único)
3. **Añadir posición**: Introducir número de plaza del EIR
4. **Gestionar preferencias**:
   - Añadir hospitales, provincias o comunidades
   - Ordenar por prioridad
   - Eliminar las que no interesen
5. **Ver análisis**: El panel muestra estadísticas comparativas
6. **Consultar tabla global**: Ver preferencias de todos los usuarios

## ⚠️ Notas importantes

- Esta aplicación es **orientativa** y no oficial
- Los datos dependen de lo que cada usuario introduzca
- Las preferencias aquí NO son vinculantes con la elección real
- Verificar siempre la información oficial del EIR
- Un DNI = Una cuenta (no se pueden crear duplicados)

## 🐛 Troubleshooting

### Error: "Firebase not configured"
- Verificar que todas las variables de entorno de Firebase estén en `.env.local`
- Reiniciar el servidor de desarrollo

### Error: "Supabase connection failed"
- Verificar URL y claves de Supabase
- Comprobar que RLS esté configurado correctamente

### Error al registrar DNI: "DNI ya existe"
- El DNI ya está registrado en el sistema
- Cada DNI solo puede usarse una vez

### Problemas de login con Google
- Verificar que el dominio esté autorizado en Firebase Console
- Para localhost, añadir `http://localhost:3000` en Authorized domains

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## 📧 Soporte

Para preguntas o problemas, abre un issue en el repositorio.

---

Desarrollado con ❤️ para futuros residentes de enfermería 🩺
