import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useProfileStore } from '../stores/useProfileStore';

/**
 * Authentication hook that manages Supabase auth state
 * and syncs with our profile store
 */
export const useAuth = () => {
  const { 
    initializeProfile, 
    createProfile, 
    reset: resetProfile,
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create matching profile row
        const profileSuccess = await createProfile({
          id: data.user.id,          // PK matches auth.users.id
          email: data.user.email,
          name,
          tier: 'free',
          onboarding_completed: false
        });

        if (!profileSuccess) {
          return { 
            success: false, 
            error: 'Account created but profile setup failed. Please try signing in.' 
          };
        }
      }

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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Signin error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      resetProfile();
      return { success: true, error: null };
    } catch (err) {
      console.error('Signout error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
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

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              try {
                await initializeProfile(session.user.id);
              } catch (profileError) {
                console.error('Profile initialization failed on sign in:', profileError);
                // Still set initialized to show UI
                useProfileStore.setState({ isInitialized: true });
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
