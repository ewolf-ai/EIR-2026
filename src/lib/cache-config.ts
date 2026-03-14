/**
 * Cache configuration for API routes
 * 
 * This file centralizes caching strategies to ensure consistent behavior
 * across all API endpoints and prevent stale data issues.
 */

/**
 * No caching - use for real-time, user-specific data
 * Prevents both Next.js and browser caching
 */
export const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
} as const;

/**
 * Short-term caching (30 seconds) - use for semi-static data
 * Good for public data that doesn't change frequently
 */
export const SHORT_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=30, s-maxage=30, stale-while-revalidate=60',
} as const;

/**
 * Medium-term caching (5 minutes) - use for static reference data
 * Good for lookup tables and configuration data
 */
export const MEDIUM_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
} as const;

/**
 * Cache strategy guide:
 * 
 * NO_CACHE (force-dynamic):
 * - /api/comparison - User-specific preference comparisons
 * - /api/preferences - User preference CRUD operations
 * - /api/user - User profile CRUD operations
 * - /api/global - Paginated user table with real-time data
 * - /api/recalculate-assignments - Action endpoint for triggering calculations
 * 
 * SHORT_CACHE (potential optimization for future):
 * - /api/stats - Public statistics (can tolerate 30s delay)
 * - /api/search - Autocomplete results (can tolerate 30s delay)
 * - /api/options - Hospital/province/community lists (can tolerate 30s delay)
 * 
 * Note: All endpoints currently use NO_CACHE (force-dynamic) to ensure data freshness.
 * Future optimization can selectively apply SHORT_CACHE to appropriate endpoints.
 */
