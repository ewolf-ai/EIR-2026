# Documentación de Seguridad - EIR 2026

Este documento detalla todas las medidas de seguridad implementadas en la aplicación.

## 🔒 Resumen de Seguridad

La aplicación EIR 2026 implementa múltiples capas de seguridad para proteger los datos de los usuarios y prevenir ataques comunes.

## 1. Protección contra MITM (Man-in-the-Middle)

### Medidas implementadas:

✅ **HTTPS obligatorio**
- En producción, todo el tráfico es HTTPS
- Configurado automáticamente por Vercel/Netlify
- Certificados SSL renovados automáticamente

✅ **HSTS (HTTP Strict Transport Security)**
```typescript
// src/middleware.ts
response.headers.set(
  'Strict-Transport-Security',
  'max-age=63072000; includeSubDomains; preload'
);
```
- Fuerza HTTPS durante 2 años
- Incluye subdominios
- Preload para navegadores

✅ **Secure Cookies**
- Firebase Auth usa cookies seguras automáticamente
- HttpOnly cookies para tokens de sesión
- SameSite=Strict para prevenir CSRF

✅ **Integridad de subrecursos**
- Firebase y Supabase usan CDNs con HTTPS
- Verificación de integridad en scripts externos

## 2. Protección contra SQL Injection

### Medidas implementadas:

✅ **Queries parametrizadas**
```typescript
// Supabase usa queries parametrizadas internamente
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('dni', sanitizedDNI); // Parámetro seguro
```

✅ **Row Level Security (RLS)**
```sql
-- Los usuarios solo pueden ver/editar sus propios datos
CREATE POLICY "Users can view their own data" 
  ON users FOR SELECT 
  USING (auth.uid()::text = firebase_uid);
```

✅ **Validación de entrada**
```typescript
// src/lib/security.ts
export function sanitizeDNI(dni: string): string {
  return dni.trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
}
```

✅ **Tipos seguros con TypeScript**
- Interfaces definidas para todos los datos
- Validación de tipos en compile-time

## 3. Protección contra XSS (Cross-Site Scripting)

### Medidas implementadas:

✅ **Content Security Policy (CSP)**
```typescript
// src/middleware.ts
'Content-Security-Policy': [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' https://trusted-domains.com",
  "style-src 'self' 'unsafe-inline'",
  // ...
].join('; ')
```

✅ **React escaping automático**
- React escapa automáticamente todo el contenido
- No se usa `dangerouslySetInnerHTML`

✅ **Sanitización de inputs**
```typescript
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>'"]/g, '')
    .substring(0, 500);
}
```

✅ **Validación estricta de URLs**
- Solo permitidos dominios de confianza
- No se permiten `javascript:` URLs

## 4. Protección contra CSRF (Cross-Site Request Forgery)

### Medidas implementadas:

✅ **SameSite Cookies**
- Firebase Auth configura SameSite=Strict
- Previene envío de cookies en requests cross-site

✅ **CORS configurado correctamente**
```typescript
// Supabase CORS settings
connect-src 'self' https://*.supabase.co
```

✅ **Tokens CSRF en Firebase**
- Firebase Auth incluye protección CSRF integrada
- Tokens verificados en cada request

## 5. Protección contra inyección de código

### Medidas implementadas:

✅ **TypeScript estricto**
```json
// tsconfig.json
{
  "strict": true,
  "noImplicitAny": true
}
```

✅ **Validación de tipos de preferencia**
```typescript
export function validatePreferenceType(
  type: string
): type is 'hospital' | 'province' | 'community' {
  return ['hospital', 'province', 'community'].includes(type);
}
```

✅ **Sanitización de valores**
```typescript
export function sanitizePreferenceValue(value: string): string {
  return sanitizeString(value);
}
```

✅ **No uso de eval() o Function()**
- Código sin evaluación dinámica
- No se ejecuta código de usuarios

## 6. Autenticación y Autorización

### Firebase Authentication

✅ **OAuth 2.0 con Google**
- Proceso de autenticación seguro
- Tokens JWT firmados
- Refresh tokens seguros

✅ **Verificación de sesión**
```typescript
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Token verificado por Firebase
  }
});
```

### Supabase Row Level Security

✅ **Políticas por tabla**
```sql
-- Usuarios solo acceden a sus datos
CREATE POLICY "Users can view their own data" 
  ON users FOR SELECT 
  USING (auth.uid()::text = firebase_uid);

-- Preferencias privadas
CREATE POLICY "Users can manage their own preferences" 
  ON preferences FOR ALL 
  USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text));
```

✅ **Lectura pública solo para datos públicos**
```sql
-- Plazas ofertadas: lectura para todos
CREATE POLICY "All users can view offered positions" 
  ON offered_positions FOR SELECT 
  TO authenticated
  USING (true);
```

## 7. Validación de DNI

### Algoritmo de validación

✅ **Validación matemática**
```typescript
export function validateDNI(dni: string): boolean {
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const number = parseInt(dni.substring(0, 8), 10);
  const letter = dni.charAt(8);
  return letters.charAt(number % 23) === letter;
}
```

✅ **Unicidad garantizada**
```sql
-- Constraint en base de datos
ALTER TABLE users ADD CONSTRAINT users_dni_unique UNIQUE (dni);
```

✅ **Verificación doble**
- Validación en frontend
- Validación en backend (Supabase)

## 8. Rate Limiting

### Implementación básica

✅ **Rate limiting en memoria**
```typescript
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  // Limita a 10 requests por minuto
}
```

### Recomendaciones para producción

- Usar Redis para rate limiting distribuido
- Implementar en API routes de Next.js
- Configurar límites en Supabase

## 9. Headers de Seguridad

### Headers configurados

```typescript
// src/middleware.ts
'X-Frame-Options': 'DENY',                    // Anti-clickjacking
'X-Content-Type-Options': 'nosniff',          // Anti-MIME sniffing
'Referrer-Policy': 'strict-origin-when-cross-origin',
'Permissions-Policy': 'geolocation=(), camera=()',
'X-XSS-Protection': '1; mode=block',          // Legacy XSS protection
```

## 10. Gestión de secretos

### Variables de entorno

✅ **Separación de claves**
- Claves públicas: `NEXT_PUBLIC_*`
- Claves privadas: sin prefijo
- Service role key: NUNCA en cliente

✅ **Archivo .env.local**
```bash
# NUNCA commitear este archivo
# Añadido a .gitignore
```

✅ **Rotación de claves**
- Cambiar service_role_key periódicamente
- Regenerar API keys si se comprometen

## 11. Logging y Monitorización

### Registros de seguridad

✅ **Logs de autenticación**
- Firebase Auth registra intentos de login
- Supabase registra queries

✅ **Errores monitorizados**
```typescript
console.error('Error creating user:', error);
// En producción, enviar a servicio de logging
```

### Recomendaciones

- Implementar Sentry para error tracking
- Configurar alertas para patrones sospechosos
- Monitorear intentos fallidos de autenticación

## 12. Protección de datos personales (GDPR)

### Cumplimiento GDPR

✅ **Minimización de datos**
- Solo se almacenan datos necesarios
- DNI cifrado en tránsito (HTTPS)

✅ **Derecho al olvido**
- Eliminación en cascada configurada
```sql
ON DELETE CASCADE
```

✅ **Transparencia**
- README explica qué datos se recopilan
- Política clara de uso de DNI

✅ **Consentimiento**
- Usuario debe aceptar compartir DNI
- Explicación clara del propósito

## 13. Backups y Recuperación

### Supabase Backups

✅ **Configurar backups automáticos**
- Dashboard → Settings → Database → Backups
- Backup diario recomendado

✅ **Punto de restauración**
- Posibilidad de restaurar a día anterior
- Test de recuperación periódico

## 14. Auditoría de Seguridad

### Checklist de revisión periódica

- [ ] Revisar dependencias con `npm audit`
- [ ] Actualizar librerías con vulnerabilidades conocidas
- [ ] Verificar políticas RLS en Supabase
- [ ] Comprobar logs de Firebase Auth
- [ ] Revisar intentos de acceso sospechosos
- [ ] Verificar integridad de backups
- [ ] Test de penetración (opcional)

### Comandos útiles

```bash
# Auditoría de dependencias
npm audit

# Fix automático de vulnerabilidades
npm audit fix

# Actualizar dependencias
npm update
```

## 15. Reporte de vulnerabilidades

Si encuentras una vulnerabilidad de seguridad:

1. **NO** abrir un issue público
2. Enviar email a: [tu-email-seguridad]
3. Incluir:
   - Descripción del problema
   - Pasos para reproducir
   - Impacto potencial
   - Sugerencias de mitigación (opcional)

## 16. Mejoras futuras de seguridad

### Recomendaciones para versiones futuras

- **2FA (Two-Factor Authentication)**
  - Implementar verificación en dos pasos
  - SMS o app authenticator

- **Captcha**
  - reCAPTCHA en registro
  - Prevenir bots

- **Rate limiting avanzado**
  - Redis para distribuir límites
  - Por IP y por usuario

- **Cifrado adicional**
  - Cifrar DNI en base de datos
  - Usar campo encrypted en Supabase

- **WAF (Web Application Firewall)**
  - Cloudflare o similar
  - Protección DDoS

- **Honeypot fields**
  - Detectar bots en formularios

## 17. Contacto de Seguridad

Para cuestiones de seguridad:
- Email: [seguridad@tu-dominio.com]
- PGP Key: [opcional]

---

🔒 La seguridad es un proceso continuo. Revisar y actualizar estas medidas regularmente.

**Última actualización**: Marzo 2026
