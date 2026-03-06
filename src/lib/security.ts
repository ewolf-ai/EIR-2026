/**
 * Security and validation utilities
 * Protects against XSS, SQL Injection, and other attacks
 */

/**
 * Validates and sanitizes DNI (Spanish ID)
 * Format: 8 digits + 1 letter
 */
export function validateDNI(dni: string): boolean {
  // Remove whitespace and convert to uppercase
  const cleanDNI = dni.trim().toUpperCase();
  
  // Regex: 8 digits followed by 1 letter
  const dniRegex = /^[0-9]{8}[A-Z]$/;
  
  if (!dniRegex.test(cleanDNI)) {
    return false;
  }
  
  // Validate check letter
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const number = parseInt(cleanDNI.substring(0, 8), 10);
  const letter = cleanDNI.charAt(8);
  
  return letters.charAt(number % 23) === letter;
}

/**
 * Sanitizes DNI to prevent injection attacks
 */
export function sanitizeDNI(dni: string): string {
  return dni.trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitizes string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>'"]/g, '')
    .substring(0, 500); // Limit length
}

/**
 * Validates EIR position number
 */
export function validateEIRPosition(position: number): boolean {
  return Number.isInteger(position) && position > 0 && position <= 10000;
}

/**
 * Validates preference type
 */
export function validatePreferenceType(type: string): type is 'hospital' | 'province' | 'community' {
  return ['hospital', 'province', 'community'].includes(type);
}

/**
 * Sanitizes and validates user input for preferences
 */
export function sanitizePreferenceValue(value: string): string {
  return sanitizeString(value);
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or similar
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Validates UUID format
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Escapes HTML to prevent XSS
 */
export function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Content Security Policy headers configuration
 */
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://www.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://*.googleapis.com https://*.firebaseapp.com wss://*.supabase.co",
    "frame-src 'self' https://*.firebaseapp.com",
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};
