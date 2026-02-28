/**
 * Date Utility Functions
 * 
 * Helpers for date formatting, comparison, and filtering.
 */

/**
 * Format a date to ISO 8601 format (YYYY-MM-DD)
 * @param {Date} date - Date to format
 * @returns {string}
 */
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse an ISO 8601 date string
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date}
 */
export function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Check if a date is today
 * @param {string} dateStr - ISO 8601 date string
 * @returns {boolean}
 */
export function isToday(dateStr) {
  const date = parseDate(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if a date is in the past (and not today)
 * @param {string} dateStr - ISO 8601 date string
 * @returns {boolean}
 */
export function isPast(dateStr) {
  const date = parseDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Check if a date is within the next 7 days
 * @param {string} dateStr - ISO 8601 date string
 * @returns {boolean}
 */
export function isUpcoming(dateStr) {
  const date = parseDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  return date >= today && date <= nextWeek;
}

/**
 * Get relative date label
 * @param {string} dateStr - ISO 8601 date string
 * @returns {string}
 */
export function getRelativeDateLabel(dateStr) {
  if (isToday(dateStr)) {
    return '今天';
  }
  
  const date = parseDate(dateStr);
  const today = new Date();
  const diffDays = Math.floor((date - today) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return '明天';
  } else if (diffDays > 1 && diffDays <= 7) {
    return `${diffDays} 天后`;
  } else if (diffDays < 0) {
    return `已过期 ${Math.abs(diffDays)} 天`;
  } else {
    return dateStr;
  }
}
