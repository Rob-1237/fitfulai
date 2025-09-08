import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useProfileStore } from '../stores/useProfileStore';
import { profileAPI } from '../lib/supabaseProfiles';

/**
 * Authentication hook that manages Supabase auth state
 * and syncs with our profile store
 */
export const useAuth = () => {
  const {
    initializeProfile,
    createProfile,
    reset: resetProfile,
    setSigningOut,
    isInitialized,
    profile
  } = useProfileStore();

  /**
   * Sign up new user with email/password
   * @param {string} email 
   * @param {string} password 
   * @param {string} name 
   * @returns {Promise<{success: boolean, error: string|null}>}
   */
  const signUp = async (email, password, name) => {
    try {
      console.log('🔍 Attempting signUp for:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      console.log('🔍 SignUp response:', { data, error });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if user was created or already exists
      if (data.user && !data.user.email_confirmed_at) {
        console.log('✅ New user created - confirmation email should be sent');

        // DO NOT create profile yet - wait for email confirmation
        return { success: true, error: null, needsConfirmation: true };
        
      } else if (data.user && data.user.email_confirmed_at) {
        console.log('⚠️ User already exists and is confirmed');
      } else {
        console.log('⚠️ Unexpected signUp result:', data);
      }

      // Note: Profile will be created when user confirms email and becomes authenticated
      console.log('✅ User account processed. Profile will be created after email confirmation.');

      return { success: true, error: null };
    } catch (err) {
      console.error('Signup error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  /**
   * Sign in existing user
   */
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if profile exists for this user
      if (data.user) {
        try {
          const { data: profile, error: profileError } = await profileAPI.getProfile(data.user.id);

          if (profileError) {
            console.error('Error checking profile after signin:', profileError);
            return { success: false, error: 'Profile verification failed' };
          }

          if (!profile) {
            console.warn('User authenticated but no profile found - needs onboarding');
            return {
              success: false,
              error: 'Account setup incomplete. Please complete your profile setup.'
            };
          }

          console.log('✅ User signed in with valid profile:', profile.name);
        } catch (err) {
          console.error('Profile check failed after signin:', err);
          return { success: false, error: 'Profile verification failed' };
        }
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Signin error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  /**
   * Sign out current user - CLEAR FIRST
   * User wants out = clear immediately, deal with Supabase after
   */
  const signOut = async () => {
    console.log('🔥 User wants out - setting signing out flag...');

    // Step 1: Set signing out flag to prevent API calls
    setSigningOut(true);

    // Step 2: Reset profile store BEFORE clearing storage
    resetProfile();

    // Step 3: NUKE ALL STORAGE
    console.log('🔥 Clearing storage...');
    localStorage.clear();
    sessionStorage.clear();

    try {
      // Step 4: Tell Supabase (but don't wait around if it fails)
      console.log('📞 Telling Supabase about signout...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.warn('Supabase signout error (ignoring):', error);
      }
    } catch (err) {
      console.warn('Supabase signout failed (ignoring):', err);
    }

    // Step 5: Get out of here
    console.log('🚀 Redirecting to home...');
    setTimeout(() => {
      window.location.href = '/';
    }, 100);

    return { success: true, error: null };
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Password reset error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  /** Get current session */
  const getCurrentSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  };

  /** Get current user */
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  // Set up auth state listener on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check if signing out to prevent unnecessary API calls
        const { isSigningOut } = useProfileStore.getState();
        if (isSigningOut) {
          console.log('🔄 Skipping auth initialization - user is signing out');
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (mounted && session?.user) {
          try {
            await initializeProfile(session.user.id);
          } catch (profileError) {
            console.error('Profile initialization failed:', profileError);
            // Still set initialized to show UI
            useProfileStore.setState({ isInitialized: true });
          }
        } else if (mounted) {
          useProfileStore.setState({ isInitialized: true });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Fallback: still show UI
        if (mounted) {
          useProfileStore.setState({ isInitialized: true });
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        // Check if signing out to prevent API calls during logout
        const { isSigningOut } = useProfileStore.getState();
        if (isSigningOut && event !== 'SIGNED_OUT') {
          console.log(`🔄 Skipping auth state change ${event} - user is signing out`);
          return;
        }

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              try {
                await initializeProfile(session.user.id);
              } catch (profileError) {
                console.error('Profile initialization failed on sign in:', profileError);

                // Check if this is a new user who needs profile creation
                if (profileError.message && profileError.message.includes('Failed to load profile')) {
                  console.log('🆕 New authenticated user detected - creating profile...');

                  try {
                    const profileSuccess = await createProfile({
                      id: session.user.id,
                      email: session.user.email,
                      name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                      tier: 'free',
                      onboarding_completed: false
                    });

                    if (profileSuccess) {
                      console.log('✅ Profile created successfully for new user');
                      // Try to initialize again after creation
                      await initializeProfile(session.user.id);
                    } else {
                      console.error('❌ Failed to create profile for new user');
                    }
                  } catch (createError) {
                    console.error('❌ Exception creating profile for new user:', createError);
                  }
                } else {
                  // Still set initialized to show UI for other errors
                  useProfileStore.setState({ isInitialized: true });
                }
              }
            }
            break;

          case 'SIGNED_OUT':
            resetProfile();
            break;

          case 'TOKEN_REFRESHED':
            // Token refreshed, no action needed
            break;

          case 'INITIAL_SESSION':
            // Initial session loaded, no action needed
            break;
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initializeProfile, resetProfile]);

  return {
    profile,           // <— expose current profile directly
    isInitialized,
    signUp,
    signIn,
    signOut,
    resetPassword,
    getCurrentSession,
    getCurrentUser
  };
};
