/**
 * @fileoverview Type definitions for FitfulAI application
 * These JSDoc types serve as contracts between Database, Store, and UI layers
 */

/**
 * User Profile from Supabase profiles table
 * @typedef {Object} Profile
 * @property {string} id - UUID primary key
 * @property {string} created_at - ISO timestamp
 * @property {string} updated_at - ISO timestamp
 * @property {string} email - User email address
 * @property {string} name - User display name
 * @property {string|null} image - Avatar/profile image URL
 * @property {string} tier - Subscription tier (free, basic, premium)
 * @property {boolean} onboarding_completed - Whether user completed setup
 * 
 * // Physical characteristics
 * @property {number|null} age - User age in years
 * @property {number|null} weight_lbs - Weight in pounds
 * @property {number|null} weight_kgs - Weight in kilograms  
 * @property {number|null} height_inches - Height in inches
 * @property {number|null} height_centimeters - Height in centimeters
 * @property {string|null} gender - Gender identity
 * 
 * // Fitness & nutrition preferences
 * @property {string|null} fitness_goal - Primary fitness goal
 * @property {string|null} activity_level - Activity level (sedentary, light, moderate, active, very_active)
 * @property {string[]|null} dietary_preferences - Array of dietary preferences
 * @property {string[]|null} allergies - Array of food allergies
 * 
 * // Calculated metrics
 * @property {number|null} bmr - Basal Metabolic Rate
 * @property {number|null} tdee - Total Daily Energy Expenditure  
 * @property {number|null} calorie_target - Daily calorie target
 * @property {Object|null} macros - Macro targets {protein: number, carbs: number, fat: number}
 * 
 * // Subscription & usage
 * @property {string|null} subscription_id - Stripe subscription ID
 * @property {string|null} subscription_status - Subscription status
 * @property {string|null} subscription_end_date - Subscription end date
 * @property {number} ai_generations_used - AI generations used this period
 * @property {string|null} ai_generations_reset - Last reset timestamp
 */

/**
 * Profile creation data (subset of Profile for new users)
 * @typedef {Object} ProfileCreateData
 * @property {string} id - User UUID from Supabase Auth
 * @property {string} email - User email
 * @property {string} name - User name
 * @property {string} [tier='free'] - Default subscription tier
 * @property {boolean} [onboarding_completed=false] - Default onboarding status
 */

/**
 * Profile update data (partial Profile for updates)
 * @typedef {Partial<Omit<Profile, 'id'|'created_at'|'updated_at'>>} ProfileUpdateData
 */

/**
 * Fitness goals enum
 * @typedef {'lose_weight'|'gain_muscle'|'maintain_weight'|'improve_endurance'|'general_fitness'} FitnessGoal
 */

/**
 * Activity levels enum  
 * @typedef {'sedentary'|'light'|'moderate'|'active'|'very_active'} ActivityLevel
 */

/**
 * Subscription tiers enum
 * @typedef {'free'|'basic'|'premium'} SubscriptionTier
 */

/**
 * Units preference
 * @typedef {'metric'|'imperial'} UnitsPreference
 */

/**
 * Profile validation errors
 * @typedef {Object} ProfileValidationError
 * @property {string} field - Field name that failed validation
 * @property {string} message - Error message
 * @property {string} code - Error code for programmatic handling
 */

// Export types for IDE autocomplete (even though this is JS)
export const ProfileTypes = {};

// Constants based on your schema
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  BASIC: 'basic', 
  PREMIUM: 'premium'
};

export const ACTIVITY_LEVELS = {
  SEDENTARY: 'sedentary',
  LIGHT: 'light', 
  MODERATE: 'moderate',
  ACTIVE: 'active',
  VERY_ACTIVE: 'very_active'
};

export const FITNESS_GOALS = {
  LOSE_WEIGHT: 'lose_weight',
  GAIN_MUSCLE: 'gain_muscle',
  MAINTAIN_WEIGHT: 'maintain_weight', 
  IMPROVE_ENDURANCE: 'improve_endurance',
  GENERAL_FITNESS: 'general_fitness'
};

/**
 * Helper function to validate profile data
 * @param {ProfileUpdateData} profileData 
 * @returns {ProfileValidationError[]} Array of validation errors
 */
export const validateProfile = (profileData) => {
  const errors = [];
  
  if (profileData.email && !/\S+@\S+\.\S+/.test(profileData.email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
      code: 'INVALID_EMAIL'
    });
  }
  
  if (profileData.age && (profileData.age < 13 || profileData.age > 120)) {
    errors.push({
      field: 'age', 
      message: 'Age must be between 13 and 120',
      code: 'INVALID_AGE'
    });
  }
  
  // Add more validation as needed
  return errors;
};