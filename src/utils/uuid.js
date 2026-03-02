/**
 * UUID Generation Utility
 *
 * Generates UUID v4 with fallback for older browsers / environments
 * (crypto.randomUUID not available in Safari < 15.4, older WebViews, etc.)
 */

/**
 * Fallback UUID v4 using Math.random (works in all environments)
 * @returns {string}
 */
function generateUUIDFallback() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a UUID v4
 * Uses crypto.randomUUID when available, falls back to Math.random for compatibility
 * @returns {string}
 */
export function generateUUID() {
  // if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
  //   return crypto.randomUUID();
  // }
  return generateUUIDFallback();
}
