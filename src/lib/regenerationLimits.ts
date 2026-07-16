// Helper functions for managing weekly regeneration limits

import type { UserProfile } from '../shared/schemas';

export interface RegenerationLimits {
  regenerationsThisWeek: number;
  regenerationResetDate: string;
  weeklyRegenerationLimit: number;
}

/**
 * Get the date of the next Sunday (week reset date) at 00:00:00.
 */
export const getNextSunday = (): Date => {
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
 * Format date as YYYY-MM-DD for storage.
 */
export const formatResetDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Initialize regeneration limits after onboarding.
 */
export const initializeRegenerationLimits = (limit = 3): RegenerationLimits => {
  const nextSunday = getNextSunday();

  return {
    regenerationsThisWeek: limit, // Start with full limit
    regenerationResetDate: formatResetDate(nextSunday),
    weeklyRegenerationLimit: limit,
  };
};

/**
 * Check if regeneration limits need to be reset (past reset date).
 */
export const shouldResetLimits = (resetDateStr: string | null | undefined): boolean => {
  if (!resetDateStr) return false;

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalize to midnight

  const resetDate = new Date(resetDateStr);
  return now >= resetDate;
};

/**
 * Reset regeneration limits for a new week.
 */
export const resetRegenerationLimits = (
  limit = 3
): Omit<RegenerationLimits, 'weeklyRegenerationLimit'> => {
  const nextSunday = getNextSunday();

  return {
    regenerationsThisWeek: limit,
    regenerationResetDate: formatResetDate(nextSunday),
  };
};

/**
 * Check if user can regenerate (has remaining regenerations).
 */
export const canRegenerate = (userProfile: UserProfile | null | undefined): boolean => {
  if (!userProfile) return false;

  // If regeneration limits haven't been initialized yet (pre-onboarding users)
  if (userProfile.regenerationsThisWeek === null || userProfile.regenerationsThisWeek === undefined) {
    return true; // Allow first generation during onboarding
  }

  return userProfile.regenerationsThisWeek > 0;
};

/**
 * Get user-friendly message about remaining regenerations.
 */
export const getRegenerationMessage = (userProfile: UserProfile | null | undefined): string => {
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
 * Format reset date for display (e.g., "Sunday, Dec 1").
 */
const formatResetDateForDisplay = (resetDateStr: string | null | undefined): string => {
  if (!resetDateStr) return 'Next Sunday';

  const resetDate = new Date(resetDateStr);
  return resetDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
};
