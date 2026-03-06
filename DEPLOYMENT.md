# Guía de Despliegue - EIR 2026

Esta guía explica cómo desplegar la aplicación en producción.

## Opciones de despliegue

### 1. Vercel (Recomendado para Next.js)

Vercel es la plataforma creada por el equipo de Next.js y ofrece la mejor integración.

#### Pasos:

1. **Crear cuenta en Vercel**
   - Ir a [vercel.com](https://vercel.com)
   - Registrarse con GitHub/GitLab/Bitbucket

2. **Conectar repositorio**
   - Hacer push del código a GitHub/GitLab/Bitbucket
   - En Vercel: "New Project" → Importar repositorio

3. **Configurar variables de entorno**
   - En el dashboard de Vercel → Settings → Environment Variables
   - Añadir todas las variables del archivo `.env.example`:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
     NEXT_PUBLIC_FIREBASE_PROJECT_ID
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
     NEXT_PUBLIC_FIREBASE_APP_ID
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     SUPABASE_SERVICE_ROLE_KEY ⚠️ IMPORTANTE (ver nota abajo)
     NEXT_PUBLIC_APP_URL (tu dominio de Vercel)
     ```
   
   **⚠️ IMPORTANTE - SUPABASE_SERVICE_ROLE_KEY:**
   - Esta es la clave de administrador de Supabase que BYPASA Row Level Security
   - Solo se usa en API Routes del servidor (nunca se expone al cliente)
   - Obtenerla en: Supabase Dashboard → Settings → API → `service_role` key (secret)
   - **NUNCA** la expongas en el código cliente ni la compartas
   - Es necesaria porque usamos Firebase Auth en lugar de Supabase Auth

4. **Configurar dominios autorizados en Firebase**
   - Ir a Firebase Console → Authentication → Settings
   - En "Authorized domains" añadir:
     - `tu-proyecto.vercel.app`
     - Tu dominio personalizado (si tienes)

5. **Desplegar**
   - Vercel desplegará automáticamente
   - Cada push a main/master desencadenará un nuevo deploy

### 2. Netlify

1. **Crear cuenta en Netlify**
   - Ir a [netlify.com](https://netlify.com)

2. **Conectar repositorio**
   - "Add new site" → Import from Git

3. **Configurar build**
   - Build command: `npm run build`
   - Publish directory: `.next`

4. **Variables de entorno**
   - Site settings → Environment variables
   - Añadir todas las variables necesarias

5. **Configurar redirects**
   - Crear archivo `netlify.toml` en la raíz:
     ```toml
     [[redirects]]
       from = "/*"
       to = "/index.html"
       status = 200
     ```

### 3. Railway

1. **Crear proyecto en Railway**
   - Ir a [railway.app](https://railway.app)

2. **Deploy from GitHub**
   - Conectar repositorio
   - Railway detectará Next.js automáticamente

3. **Variables de entorno**
   - Settings → Variables
   - Añadir todas las variables

## Configuración de Firebase para producción

1. **Dominios autorizados**
   ```
   Authentication → Settings → Authorized domains
   - localhost (desarrollo)
   - tu-dominio.com (producción)
   - tu-proyecto.vercel.app (si usas Vercel)
   ```

2. **Configurar OAuth**
   - Asegurarse de que el redirect URI esté configurado correctamente

3. **Restricciones de API**
   - Project Settings → API Keys
   - Añadir restricciones de dominio a las API keys

## Configuración de Supabase para producción

1. **Políticas RLS**
   - Verificar todas las políticas de seguridad
   - Asegurarse de que estén habilitadas

2. **Configurar CORS**
   - Settings → API → CORS
   - Añadir tu dominio de producción

3. **Copias de seguridad**
   - Settings → Database → Backups
   - Configurar backups automáticos

4. **Límites de uso**
   - Monitorear el uso en Settings → Usage
   - Considerar upgrade del plan si es necesario

## Checklist de seguridad para producción

- [ ] HTTPS habilitado (automático en Vercel/Netlify)
- [ ] Variables de entorno configuradas correctamente
- [ ] Service role key NUNCA expuesta al cliente
- [ ] RLS habilitado en todas las tablas de Supabase
- [ ] Dominios autorizados configurados en Firebase
- [ ] CSP headers activos (middleware)
- [ ] HSTS habilitado
- [ ] Validación de DNI funcionando
- [ ] Rate limiting implementado
- [ ] Backups de base de datos configurados

## Monitorización

### Vercel Analytics
```bash
npm install @vercel/analytics
```

Añadir en `src/app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Supabase Monitoring
- Dashboard → Database → Logs
- Monitorear queries lentas
- Revisar errores de autenticación

## Optimizaciones para producción

### 1. Imágenes
- Usar Next.js Image component para optimización automática
- Configurar dominios en `next.config.js`

### 2. Caché
- Vercel cachea automáticamente assets estáticos
- Configurar revalidación en las páginas:
  ```tsx
  export const revalidate = 3600; // 1 hora
  ```

### 3. Performance
- Lazy loading de componentes pesados
- Code splitting automático por Next.js
- Optimizar bundle size

## Actualización del contenido

### Actualizar plazas ofertadas
1. Preparar archivo CSV/JSON con nuevas plazas
2. Usar Supabase Table Editor para importar
3. O ejecutar script de importación:
   ```bash
   npm run import-data
   ```

### Actualizar código
1. Hacer cambios en local
2. Hacer commit y push a repositorio
3. El despliegue es automático

## Dominios personalizados

### Vercel
1. Ir a Settings → Domains
2. Añadir dominio personalizado
3. Configurar DNS según instrucciones
4. Vercel proveerá SSL automáticamente

### Configurar DNS
```
Type: CNAME
Name: www (o tu subdominio)
Value: cname.vercel-dns.com
```

## Troubleshooting en producción

### Error 500
- Revisar logs en Vercel/Netlify
- Verificar variables de entorno
- Comprobar conexión con Supabase

### Firebase Auth no funciona
- Verificar dominios autorizados
- Comprobar API keys
- Revisar configuración OAuth

### Supabase connection issues
- Verificar CORS settings
- Comprobar URL y keys
- Revisar políticas RLS

## Costos estimados

- **Vercel**: Plan gratuito suficiente para empezar
- **Firebase**: Plan Spark (gratuito) hasta 10K auth/mes
- **Supabase**: Plan gratuito hasta 500MB DB + 2GB transferencia

Para mayor escala, considerar planes de pago.

## Soporte

Para problemas de despliegue:
1. Revisar logs de la plataforma
2. Consultar documentación oficial
3. Abrir issue en el repositorio

---

✅ Una vez desplegado, probar todas las funcionalidades en producción antes de compartir la URL.
