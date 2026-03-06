# Guía de Inicio Rápido - EIR 2026 🚀

Esta guía te ayudará a tener la aplicación funcionando en menos de 10 minutos.

## 📋 Prerrequisitos

Antes de empezar, asegúrate de tener:

- [ ] Node.js 18+ instalado ([descargar aquí](https://nodejs.org/))
- [ ] Cuenta de Google (para login)
- [ ] Editor de código (VS Code recomendado)

## ⚡ Inicio Rápido (5 pasos)

### 1️⃣ Instalar dependencias

```bash
npm install
```

⏱️ Esto tomará ~2-3 minutos

### 2️⃣ Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Add project" (Crear proyecto)
3. Nombre: "EIR-2026" (o el que prefieras)
4. Desactiva Google Analytics (opcional)
5. Habilita Authentication:
   - Click en "Authentication" en el menú lateral
   - Click en "Get Started"
   - Habilita "Google" como proveedor
6. Copia las credenciales:
   - Click en el ícono de engranaje ⚙️ → Project settings
   - Scroll down hasta "Your apps"
   - Click en el ícono web `</>`
   - Copia los valores de configuración

### 3️⃣ Configurar Supabase

1. Ve a [Supabase](https://supabase.com/)
2. Click en "New project"
3. Rellena:
   - Name: "eir-2026"
   - Database Password: (guarda esto en un lugar seguro)
   - Region: Europe West (Londres) o la más cercana
4. Espera ~2 minutos a que se cree
5. Ve a Settings → API
6. Copia:
   - Project URL
   - `anon` `public` key
   - `service_role` key ⚠️ (mantenla secreta)

### 4️⃣ Crear archivo .env.local

Crea un archivo llamado `.env.local` en la raíz del proyecto y pega:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=pega_aqui_tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

💡 **Nota**: Reemplaza todos los valores con los que copiaste en los pasos anteriores.

### 5️⃣ Crear las tablas en Supabase

1. En Supabase, ve a SQL Editor
2. Abre el archivo `DATABASE_SCHEMA.md`
3. Copia todo el SQL y pégalo en el editor
4. Click en "Run" (Ejecutar)
5. Verifica que las tablas se crearon en Table Editor

## ✅ ¡Listo! Ejecutar la aplicación

```bash
npm run dev
```

Abre tu navegador en [http://localhost:3000](http://localhost:3000)

## 🎉 Primeros pasos en la app

1. **Click en "Sign in with Google"**
   - Usa tu cuenta de Google
   - Aparecerá un modal

2. **Introduce tu DNI**
   - Formato: 12345678Z
   - Este será único y no podrás cambiarlo
   - La validación es automática

3. **Añade tu número de plaza**
   - Click en "Añadir" junto a "Número de Plaza"
   - Introduce tu posición del EIR

4. **Añade preferencias**
   - Click en "+ Añadir" en Gestionar Preferencias
   - Elige tipo: Hospital, Provincia o Comunidad
   - Escribe el nombre (aparecerán sugerencias)
   - Click en "Añadir"

5. **Explora el dashboard**
   - Ve tu análisis comparativo
   - Revisa la tabla global de usuarios

## 🐛 Solución de problemas comunes

### Error: "Firebase not configured"

**Solución**: 
- Verifica que copiaste TODAS las variables de Firebase
- Asegúrate de que el archivo se llama `.env.local` (no `.env`)
- Reinicia el servidor (`Ctrl+C` y luego `npm run dev`)

### Error: "Supabase connection failed"

**Solución**:
- Verifica la URL de Supabase (debe empezar con `https://`)
- Comprueba que las keys no tengan espacios al inicio/final
- Verifica que ejecutaste el SQL para crear las tablas

### Error al hacer login: "Unauthorized domain"

**Solución**:
1. Ve a Firebase Console
2. Authentication → Settings → Authorized domains
3. Añade `localhost`

### El DNI no se acepta

**Solución**:
- Formato correcto: 8 números + 1 letra mayúscula
- Ejemplo válido: `12345678Z`
- La letra debe coincidir con el algoritmo oficial

## 📚 Próximos pasos

- 📖 Lee el [README.md](README.md) completo
- 🔒 Revisa [SECURITY.md](SECURITY.md) para entender la seguridad
- 🚀 Consulta [DEPLOYMENT.md](DEPLOYMENT.md) para desplegar en producción

## 💬 ¿Necesitas ayuda?

- 🐛 Issues: [GitHub Issues]
- 📧 Email: [tu-email]
- 💡 Documentación: Ver carpeta `/docs`

## 🎯 Checklist completo

Usa esto para verificar que todo está configurado:

- [ ] Node.js instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Proyecto Firebase creado
- [ ] Google Auth habilitado en Firebase
- [ ] Credenciales Firebase copiadas
- [ ] Proyecto Supabase creado
- [ ] Credenciales Supabase copiadas
- [ ] Archivo `.env.local` creado
- [ ] Todas las variables configuradas
- [ ] Tablas creadas en Supabase
- [ ] App funcionando en localhost:3000
- [ ] Login con Google funcionando
- [ ] Registro de DNI funcionando

## 🎨 Personalización (opcional)

### Cambiar colores

Edita `tailwind.config.js`:

```javascript
colors: {
  nursing: {
    500: '#tu-color-aqui',
  },
  pastel: {
    pink: '#tu-color-aqui',
    // ...
  }
}
```

### Cambiar logo

Reemplaza el emoji 🩺 en:
- `src/components/Header.tsx`
- `src/app/page.tsx`

### Añadir más información

Edita los componentes en `src/components/`

## ⚠️ Importante

- ⚠️ **NUNCA** compartas tu `service_role` key
- ⚠️ **NUNCA** commites el archivo `.env.local` a Git
- ⚠️ Los datos en desarrollo son de prueba, bórralos antes de producción

## 🎓 Recursos de aprendizaje

Si quieres entender mejor el código:

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

¿Todo funcionando? ¡Excelente! 🎉

Si tienes problemas, revisa la sección de troubleshooting arriba o abre un issue.

**Tiempo estimado de configuración**: 10-15 minutos
**Dificultad**: ⭐⭐☆☆☆ (Fácil-Medio)
