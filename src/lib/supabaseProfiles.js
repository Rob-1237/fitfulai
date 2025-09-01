/**
 * @fileoverview Supabase data access layer for profiles
 * Clean interface between application and database
 */

import { supabase } from './supabaseClient.js';
import { validateProfile } from './types.js';

/**
 * Profile API - handles all database operations for user profiles
 */
export const profileAPI = {
  /**
   * Get user profile by ID
   * @param {string} userId - User UUID
   * @returns {Promise<{data: Profile|null, error: string|null}>}
   */
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error);
        return { data: null, error: error.message };
      }

      return { data: data || null, error: null };
    } catch (err) {
      console.error('Exception in getProfile:', err);
      return { data: null, error: 'Failed to fetch profile' };
    }
  },

  /**
   * Create new user profile
   * @param {ProfileCreateData} profileData - Profile creation data
   * @returns {Promise<{data: Profile|null, error: string|null}>}
   */
  async createProfile(profileData) {
    try {
      // Validate input
      const errors = validateProfile(profileData);
      if (errors.length > 0) {
        return { 
          data: null, 
          error: `Validation failed: ${errors.map(e => e.message).join(', ')}` 
        };
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          tier: profileData.tier || 'free',
          onboarding_completed: profileData.onboarding_completed || false,
          ai_generations_used: 0,
          ai_generations_reset: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in createProfile:', err);
      return { data: null, error: 'Failed to create profile' };
    }
  },

  /**
   * Update user profile
   * @param {string} userId - User UUID
   * @param {ProfileUpdateData} updates - Fields to update
   * @returns {Promise<{data: Profile|null, error: string|null}>}
   */
  async updateProfile(userId, updates) {
    try {
      // Validate input
      const errors = validateProfile(updates);
      if (errors.length > 0) {
        return { 
          data: null, 
          error: `Validation failed: ${errors.map(e => e.message).join(', ')}` 
        };
      }

      // Add updated_at timestamp
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in updateProfile:', err);
      return { data: null, error: 'Failed to update profile' };
    }
  },

  /**
   * Update AI generation usage
   * @param {string} userId - User UUID
   * @param {number} increment - Number to increment by (default 1)
   * @returns {Promise<{success: boolean, error: string|null}>}
   */
  async incrementAIUsage(userId, increment = 1) {
    try {
      const { error } = await supabase.rpc('increment_ai_usage', {
        user_id: userId,
        increment_by: increment
      });

      if (error) {
        console.error('Error incrementing AI usage:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Exception in incrementAIUsage:', err);
      
      // Fallback to manual update if RPC function doesn't exist
      const { data: profile } = await this.getProfile(userId);
      if (profile) {
        const newUsage = (profile.ai_generations_used || 0) + increment;
        await this.updateProfile(userId, { ai_generations_used: newUsage });
        return { success: true, error: null };
      }
      
      return { success: false, error: 'Failed to increment AI usage' };
    }
  },

  /**
   * Calculate and update BMR/TDEE for user
   * @param {string} userId - User UUID
   * @returns {Promise<{success: boolean, error: string|null, data: {bmr: number, tdee: number}|null}>}
   */
  async calculateMetrics(userId) {
    try {
      const { data: profile } = await this.getProfile(userId);
      if (!profile) {
        return { success: false, error: 'Profile not found', data: null };
      }

      // Check if we have required data
      const { weight_kgs, height_centimeters, age, gender, activity_level } = profile;
      if (!weight_kgs || !height_centimeters || !age || !gender || !activity_level) {
        return { 
          success: false, 
          error: 'Missing required data for calculation', 
          data: null 
        };
      }

      // Calculate BMR using Mifflin-St Jeor Equation
      let bmr;
      if (gender.toLowerCase() === 'male') {
        bmr = (10 * weight_kgs) + (6.25 * height_centimeters) - (5 * age) + 5;
      } else {
        bmr = (10 * weight_kgs) + (6.25 * height_centimeters) - (5 * age) - 161;
      }

      // Calculate TDEE based on activity level
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      };
      
      const tdee = bmr * (activityMultipliers[activity_level] || 1.2);

      // Update profile with calculated values
      await this.updateProfile(userId, { bmr, tdee });

      return { 
        success: true, 
        error: null, 
        data: { bmr: Math.round(bmr), tdee: Math.round(tdee) }
      };
    } catch (err) {
      console.error('Exception in calculateMetrics:', err);
      return { success: false, error: 'Failed to calculate metrics', data: null };
    }
  },

  /**
   * Delete user profile (for account deletion)
   * @param {string} userId - User UUID  
   * @returns {Promise<{success: boolean, error: string|null}>}
   */
  async deleteProfile(userId) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Exception in deleteProfile:', err);
      return { success: false, error: 'Failed to delete profile' };
    }
  }
};

/**
 * Optional: Database function for atomic AI usage increment
 * You can create this in Supabase SQL editor if needed:
 * 
 * CREATE OR REPLACE FUNCTION increment_ai_usage(user_id UUID, increment_by INT DEFAULT 1)
 * RETURNS void AS $$
 * BEGIN
 *   UPDATE profiles 
 *   SET 
 *     ai_generations_used = COALESCE(ai_generations_used, 0) + increment_by,
 *     updated_at = NOW()
 *   WHERE id = user_id;
 * END;
 * $$ LANGUAGE plpgsql;
 */