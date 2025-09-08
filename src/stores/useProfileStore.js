import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { profileAPI } from '../lib/supabaseProfiles.js';
import { SUBSCRIPTION_TIERS, ACTIVITY_LEVELS, FITNESS_GOALS } from '../lib/types.js';

export const useProfileStore = create(
  subscribeWithSelector((set, get) => ({
    // Profile state
    profile: null,
    isLoading: false,
    error: null,
    isInitialized: false,
    isSigningOut: false,
    
    // Profile actions
    
    /**
     * Initialize profile for authenticated user
     * @param {string} userId - User UUID from Supabase Auth
     */
    initializeProfile: async (userId) => {
      // Skip if signing out
      const { isSigningOut } = get();
      if (isSigningOut) {
        console.log('🔄 Skipping profile initialization - user is signing out');
        return;
      }
      
      set({ isLoading: true, error: null });
      
      try {
        const { data: profile, error } = await profileAPI.getProfile(userId);
        
        if (error) {
          set({ error, isLoading: false });
          throw new Error(error.message || error);
        }
        
        if (!profile) {
          // Profile doesn't exist - user needs onboarding
          set({ 
            profile: null, 
            isLoading: false, 
            isInitialized: true 
          });
          return;
        }
        
        set({ 
          profile, 
          isLoading: false, 
          error: null, 
          isInitialized: true 
        });
      } catch (err) {
        console.error('Error initializing profile:', err);
        set({ 
          error: 'Failed to load profile', 
          isLoading: false 
        });
        throw err;
      }
    },
    
    /**
     * Create new user profile (onboarding)
     * @param {ProfileCreateData} profileData - New profile data
     */
    createProfile: async (profileData) => {
      console.log('🔍 createProfile called with:', profileData);
      set({ isLoading: true, error: null });
      
      try {
        const { data: profile, error } = await profileAPI.createProfile(profileData);
        
        if (error) {
          console.error('❌ Profile creation failed:', error);
          set({ error, isLoading: false });
          return false;
        }
        
        console.log('✅ Profile created successfully:', profile);
        set({ 
          profile, 
          isLoading: false, 
          error: null,
          isInitialized: true 
        });
        
        return true;
      } catch (err) {
        console.error('❌ Exception in createProfile:', err);
        set({ 
          error: 'Failed to create profile', 
          isLoading: false 
        });
        return false;
      }
    },
    
    /**
     * Update profile with optimistic updates
     * @param {ProfileUpdateData} updates - Fields to update
     */
    updateProfile: async (updates) => {
      const { profile } = get();
      if (!profile) {
        set({ error: 'No profile loaded' });
        return false;
      }
      
      // Optimistic update
      const previousProfile = { ...profile };
      const optimisticProfile = { 
        ...profile, 
        ...updates, 
        updated_at: new Date().toISOString() 
      };
      
      set({ 
        profile: optimisticProfile, 
        error: null 
      });
      
      try {
        const { data: updatedProfile, error } = await profileAPI.updateProfile(
          profile.id, 
          updates
        );
        
        if (error) {
          // Revert optimistic update
          set({ profile: previousProfile, error });
          return false;
        }
        
        set({ profile: updatedProfile });
        return true;
      } catch (err) {
        console.error('Error updating profile:', err);
        // Revert optimistic update
        set({ 
          profile: previousProfile, 
          error: 'Failed to update profile' 
        });
        return false;
      }
    },
    
    /**
     * Update basic info (name, email, image)
     * @param {Object} basicInfo - Basic profile info
     */
    updateBasicInfo: async (basicInfo) => {
      return await get().updateProfile(basicInfo);
    },
    
    /**
     * Update physical characteristics and recalculate metrics
     * @param {Object} physicalData - Physical characteristics
     */
    updatePhysicalData: async (physicalData) => {
      const success = await get().updateProfile(physicalData);
      
      if (success) {
        // Trigger metrics recalculation
        await get().calculateMetrics();
      }
      
      return success;
    },
    
    /**
     * Update fitness preferences
     * @param {Object} preferences - Fitness preferences
     */
    updateFitnessPreferences: async (preferences) => {
      return await get().updateProfile(preferences);
    },
    
    /**
     * Complete onboarding process
     * @param {ProfileUpdateData} onboardingData - Complete profile data
     */
    completeOnboarding: async (onboardingData) => {
      const finalData = {
        ...onboardingData,
        onboarding_completed: true
      };
      
      const success = await get().updateProfile(finalData);
      
      if (success) {
        // Calculate initial metrics
        await get().calculateMetrics();
      }
      
      return success;
    },
    
    /**
     * Calculate and update BMR/TDEE
     */
    calculateMetrics: async () => {
      const { profile } = get();
      if (!profile) return false;
      
      try {
        const { success, data, error } = await profileAPI.calculateMetrics(profile.id);
        
        if (error) {
          set({ error });
          return false;
        }
        
        if (success && data) {
          // Update profile with calculated metrics
          set({ 
            profile: { 
              ...profile, 
              bmr: data.bmr, 
              tdee: data.tdee,
              updated_at: new Date().toISOString()
            } 
          });
        }
        
        return success;
      } catch (err) {
        console.error('Error calculating metrics:', err);
        set({ error: 'Failed to calculate metrics' });
        return false;
      }
    },
    
    /**
     * Increment AI generation usage
     * @param {number} increment - Number to increment by
     */
    incrementAIUsage: async (increment = 1) => {
      const { profile } = get();
      if (!profile) return false;
      
      // Optimistic update
      const updatedProfile = {
        ...profile,
        ai_generations_used: (profile.ai_generations_used || 0) + increment
      };
      set({ profile: updatedProfile });
      
      try {
        const { success, error } = await profileAPI.incrementAIUsage(profile.id, increment);
        
        if (!success) {
          // Revert optimistic update
          set({ profile, error });
          return false;
        }
        
        return true;
      } catch (err) {
        console.error('Error incrementing AI usage:', err);
        // Revert optimistic update
        set({ profile, error: 'Failed to update AI usage' });
        return false;
      }
    },
    
    /**
     * Check if user can make AI requests based on tier limits
     * @returns {boolean} Whether user can make AI requests
     */
    canUseAI: () => {
      const { profile } = get();
      if (!profile) return false;
      
      const limits = {
        free: { daily: 3, monthly: 20 },
        basic: { daily: 15, monthly: 200 },
        premium: { daily: 50, monthly: 1000 }
      };
      
      const tierLimits = limits[profile.tier] || limits.free;
      const usage = profile.ai_generations_used || 0;
      
      return usage < tierLimits.monthly;
    },
    
    /**
     * Get remaining AI generations
     * @returns {number} Remaining AI generations
     */
    getRemainingAI: () => {
      const { profile } = get();
      if (!profile) return 0;
      
      const limits = {
        free: 20,
        basic: 200,
        premium: 1000
      };
      
      const limit = limits[profile.tier] || limits.free;
      const usage = profile.ai_generations_used || 0;
      
      return Math.max(0, limit - usage);
    },
    
    /**
     * Clear any errors
     */
    clearError: () => {
      set({ error: null });
    },
    
    /**
     * Set signing out flag to prevent API calls during logout
     */
    setSigningOut: (isSigningOut) => {
      set({ isSigningOut });
    },

    /**
     * Reset profile state (for logout)
     */
    reset: () => {
      set({
        profile: null,
        isLoading: false,
        error: null,
        isInitialized: false,
        isSigningOut: false
      });
    },

    /**
     * Emergency authentication reset - clears all auth data and reloads app
     * Use this when auth state gets corrupted or stuck
     */
    resetAuthState: () => {
      console.warn('Performing emergency auth reset...');
      
      try {
        // Clear all Supabase auth-related localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            console.log(`Clearing localStorage key: ${key}`);
            localStorage.removeItem(key);
          }
        });
        
        // Clear session/index storage as well
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            console.log(`Clearing sessionStorage key: ${key}`);
            sessionStorage.removeItem(key);
          }
        });
        
        // Reset all stores to initial state
        const { reset } = get();
        reset();
        
        // Clear any UI state
        const { useUIStore } = require('./useUIStore.js');
        if (useUIStore) {
          useUIStore.getState().closeDrawer();
        }
        
        console.log('Auth reset complete - reloading page...');
        
        // Force page reload to completely reset the app
        window.location.href = '/';
        
      } catch (error) {
        console.error('Error during auth reset:', error);
        // Fallback: still try to reload
        window.location.reload();
      }
    },

    /**
     * Check if auth state appears corrupted
     * @returns {boolean} Whether auth state seems corrupted
     */
    isAuthStateCorrupted: () => {
      const { profile, isInitialized, isLoading } = get();
      
      // Check for common corruption patterns
      const hasCorruptedTokens = Object.keys(localStorage).some(key => {
        if (key.startsWith('sb-') && key.includes('auth-token')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            // Check if token exists but is malformed or expired
            return !data || !data.access_token || data.expires_at < Date.now() / 1000;
          } catch {
            return true; // Malformed JSON
          }
        }
        return false;
      });
      
      // Auth appears stuck - initialized but no profile and not loading
      const stuckState = isInitialized && !profile && !isLoading;
      
      return hasCorruptedTokens || stuckState;
    },
    
    // Computed getters
    
    /**
     * Check if user has completed onboarding
     * @returns {boolean}
     */
    isOnboardingComplete: () => {
      const { profile } = get();
      return profile?.onboarding_completed || false;
    },
    
    /**
     * Get user's preferred units based on location data
     * @returns {'metric'|'imperial'}
     */
    getPreferredUnits: () => {
      const { profile } = get();
      if (!profile) return 'metric';
      
      // If user has metric measurements, prefer metric
      if (profile.weight_kgs || profile.height_centimeters) {
        return 'metric';
      }
      
      // If user has imperial measurements, prefer imperial  
      if (profile.weight_lbs || profile.height_inches) {
        return 'imperial';
      }
      
      // Default to metric
      return 'metric';
    },
    
    /**
     * Get formatted weight for display
     * @returns {string}
     */
    getDisplayWeight: () => {
      const { profile } = get();
      if (!profile) return '';
      
      const units = get().getPreferredUnits();
      
      if (units === 'imperial' && profile.weight_lbs) {
        return `${profile.weight_lbs} lbs`;
      }
      
      if (profile.weight_kgs) {
        return `${profile.weight_kgs} kg`;
      }
      
      return '';
    },
    
    /**
     * Get formatted height for display
     * @returns {string}
     */
    getDisplayHeight: () => {
      const { profile } = get();
      if (!profile) return '';
      
      const units = get().getPreferredUnits();
      
      if (units === 'imperial' && profile.height_inches) {
        const feet = Math.floor(profile.height_inches / 12);
        const inches = profile.height_inches % 12;
        return `${feet}'${inches}"`;
      }
      
      if (profile.height_centimeters) {
        return `${profile.height_centimeters} cm`;
      }
      
      return '';
    }
  }))
);

// Set up cross-store reactivity if needed
useProfileStore.subscribe(
  (state) => state.profile?.tier,
  (tier) => {
    if (tier) {
      console.log(`Subscription tier updated to: ${tier}`);
      // Could trigger UI updates, feature gate recalculation, etc.
    }
  }
);