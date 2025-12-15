// Helper functions for managing weekly regeneration limits

/**
 * Get the date of the next Sunday (week reset date)
 * @returns {Date} Next Sunday's date at 00:00:00
 */
export const getNextSunday = () => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Calculate days until next Sunday
  const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay;

  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(0, 0, 0, 0); // Set to midnight

  return nextSunday;
};

/**
 * Format date as YYYY-MM-DD for storage
 * @param {Date} date
 * @returns {string}
 */
export const formatResetDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Initialize regeneration limits after onboarding
 * @param {number} limit - Weekly regeneration limit (default 3)
 * @returns {Object} regeneration fields to add to user document
 */
export const initializeRegenerationLimits = (limit = 3) => {
  const nextSunday = getNextSunday();

  return {
    regenerationsThisWeek: limit, // Start with full limit
    regenerationResetDate: formatResetDate(nextSunday),
    weeklyRegenerationLimit: limit
  };
};

/**
 * Check if regeneration limits need to be reset (past reset date)
 * @param {string} resetDateStr - Reset date in YYYY-MM-DD format
 * @returns {boolean}
 */
export const shouldResetLimits = (resetDateStr) => {
  if (!resetDateStr) return false;

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalize to midnight

  const resetDate = new Date(resetDateStr);
  return now >= resetDate;
};

/**
 * Reset regeneration limits for a new week
 * @param {number} limit - Weekly regeneration limit
 * @returns {Object} Updated regeneration fields
 */
export const resetRegenerationLimits = (limit = 3) => {
  const nextSunday = getNextSunday();

  return {
    regenerationsThisWeek: limit,
    regenerationResetDate: formatResetDate(nextSunday)
  };
};

/**
 * Check if user can regenerate (has remaining regenerations)
 * @param {Object} userProfile
 * @returns {boolean}
 */
export const canRegenerate = (userProfile) => {
  if (!userProfile) return false;

  // If regeneration limits haven't been initialized yet (pre-onboarding users)
  if (userProfile.regenerationsThisWeek === null || userProfile.regenerationsThisWeek === undefined) {
    return true; // Allow first generation during onboarding
  }

  return userProfile.regenerationsThisWeek > 0;
};

/**
 * Get user-friendly message about remaining regenerations
 * @param {Object} userProfile
 * @returns {string}
 */
export const getRegenerationMessage = (userProfile) => {
  if (!userProfile) return '';

  const remaining = userProfile.regenerationsThisWeek;
  const resetDate = userProfile.regenerationResetDate;

  if (remaining === null || remaining === undefined) {
    return ''; // Not initialized yet
  }

  if (remaining === 0) {
    return `No regenerations remaining this week. Resets on ${formatResetDateForDisplay(resetDate)}.`;
  }

  return `${remaining} of ${userProfile.weeklyRegenerationLimit || 3} regenerations remaining this week`;
};

/**
 * Format reset date for display (e.g., "Sunday, Dec 1")
 * @param {string} resetDateStr - YYYY-MM-DD format
 * @returns {string}
 */
const formatResetDateForDisplay = (resetDateStr) => {
  if (!resetDateStr) return 'Next Sunday';

  const resetDate = new Date(resetDateStr);
  return resetDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
};
