/**
 * UUID Generation Utility
 *
 * Generates UUID v4 with fallback for older browsers
 */

/**
 * Generate a UUID v4
 * @returns {string}
 */
export function generateUUID() {
  // Use custom implementation for maximum compatibility
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
