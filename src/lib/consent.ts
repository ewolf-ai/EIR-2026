/**
 * Cookie Consent Management Utility
 * Handles user consent preferences for GDPR/RGPD compliance
 */

export interface ConsentPreferences {
  necessary: boolean;      // Always true, required for basic functionality
  marketing: boolean;      // Optional, for ad networks and tracking
  timestamp: number;       // When consent was given
  version: string;         // Consent policy version
}

const CONSENT_KEY = 'cookie-consent';
const CONSENT_VERSION = '1.0';

/**
 * Get the current consent preferences from localStorage
 */
export function getConsentPreferences(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    
    const preferences = JSON.parse(stored) as ConsentPreferences;
    
    // Check if consent version matches
    if (preferences.version !== CONSENT_VERSION) {
      return null; // Invalidate old consent
    }
    
    return preferences;
  } catch (error) {
    console.error('Error reading consent preferences:', error);
    return null;
  }
}

/**
 * Set the consent preferences in localStorage
 */
export function setConsentPreferences(preferences: Omit<ConsentPreferences, 'timestamp' | 'version'>): void {
  if (typeof window === 'undefined') return;
  
  const consentData: ConsentPreferences = {
    ...preferences,
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };
  
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
    
    // Dispatch custom event so components can react to consent changes
    window.dispatchEvent(new CustomEvent('consentChanged', { detail: consentData }));
  } catch (error) {
    console.error('Error saving consent preferences:', error);
  }
}

/**
 * Check if the user has given consent for marketing cookies
 */
export function hasMarketingConsent(): boolean {
  const preferences = getConsentPreferences();
  return preferences?.marketing ?? false;
}

/**
 * Check if the user has made a consent choice
 */
export function hasConsentChoice(): boolean {
  return getConsentPreferences() !== null;
}

/**
 * Accept all cookies
 */
export function acceptAllCookies(): void {
  setConsentPreferences({
    necessary: true,
    marketing: true,
  });
}

/**
 * Reject all optional cookies (only keeping necessary)
 */
export function rejectAllCookies(): void {
  setConsentPreferences({
    necessary: true,
    marketing: false,
  });
}

/**
 * Clear consent preferences (for testing or policy updates)
 */
export function clearConsent(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONSENT_KEY);
  window.dispatchEvent(new CustomEvent('consentChanged', { detail: null }));
}
