import { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { DocumentReference } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { UserProfile } from '../shared/schemas';

export interface AuthResult {
  success: boolean;
  error: string | null;
}

interface AuthContextValue {
  /** Firestore profile, falling back to a skeletal profile built from the auth user */
  profile: UserProfile | null;
  /** The raw Firestore profile document (null until loaded) */
  userProfile: UserProfile | null;
  user: User | null;
  isInitialized: boolean;
  isSignedIn: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  getCurrentUser: () => User | null;
  getCurrentSession: () => { user: User } | null;
  createUserDocument: (user: User, additionalData?: Record<string, unknown>) => Promise<DocumentReference | undefined>;
  fetchUserProfile: (uid: string) => Promise<UserProfile | null>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<AuthResult>;
  refreshUserProfile: () => Promise<UserProfile | null>;
}

// Create the context
const AuthContext = createContext<AuthContextValue | null>(null);

// Narrow an unknown error to the Firebase error shape without pulling in FirebaseError
const errorInfo = (error: unknown): { code?: string; message: string } => ({
  code: (error as { code?: string }).code,
  message: error instanceof Error ? error.message : String(error),
});

// Custom hook to use the auth context
// eslint-disable-next-line react-refresh/only-export-components -- context hook co-located with its provider
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to create user document in Firestore
  const createUserDocument = useCallback(
    async (user: User, additionalData: Record<string, unknown> = {}) => {
      if (!user) {
        console.warn('⚠️ createUserDocument: No user provided');
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          const { email, displayName } = user;

          const userData = {
            email,
            name: displayName || email?.split('@')[0] || 'User',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),

            // Onboarding status
            onboardingCompleted: false,

            // Recipe and dietary preferences (will be filled during onboarding)
            dietaryPreferences: [],
            allergies: [],
            defaultServingSize: 4,

            // AI usage tracking
            aiGenerationsUsed: 0,
            aiGenerationsReset: serverTimestamp(),

            // Regeneration limits (set after onboarding completes)
            regenerationsThisWeek: null, // Will be set to 3 after onboarding
            regenerationResetDate: null, // Will be set to next Sunday after onboarding
            weeklyRegenerationLimit: 3,

            // Subscription info
            tier: 'free',
            subscriptionStatus: 'active',
            subscriptionEndDate: null,

            // User preferences
            preferences: {
              mealComplexity: 'intermediate',
              cuisinePreferences: [],
              budgetRange: 'medium',
            },

            ...additionalData,
          };

          await setDoc(userDocRef, userData);
        }

        return userDocRef;
      } catch (error) {
        console.error('❌ Error in createUserDocument:', errorInfo(error));
        throw error;
      }
    },
    []
  ); // No dependencies - pure function

  // Helper function to fetch user profile
  const fetchUserProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    if (!uid) {
      console.warn('⚠️ fetchUserProfile: No uid provided');
      return null;
    }

    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return { ...(userDoc.data() as UserProfile), id: userDoc.id };
      } else {
        console.warn('⚠️ User document does not exist in Firestore');
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', { ...errorInfo(error), uid });
      return null;
    }
  }, []); // No dependencies - pure function

  // Helper function to update user profile in Firestore
  const updateUserProfile = useCallback(
    async (profileData: Partial<UserProfile>): Promise<AuthResult> => {
      if (!user) {
        console.warn('⚠️ updateUserProfile: No user authenticated');
        throw new Error('No user authenticated');
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const updateData = {
          ...profileData,
          updatedAt: serverTimestamp(),
        };

        await updateDoc(userDocRef, updateData);

        // Refresh the user profile data
        const updatedProfile = await fetchUserProfile(user.uid);
        setUserProfile(updatedProfile);

        return { success: true, error: null };
      } catch (error) {
        const info = errorInfo(error);
        console.error('❌ Error updating user profile:', { ...info, uid: user?.uid });
        return { success: false, error: info.message };
      }
    },
    [user, fetchUserProfile]
  );

  // Set up Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          const profile = await fetchUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('❌ Error during user setup:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchUserProfile is stable (empty-dep useCallback); run once on mount
  }, []);

  // Enhanced profile object combining Firebase user and Firestore profile
  // CRITICAL: useMemo prevents infinite re-render loop by memoizing the object reference
  const profile = useMemo<UserProfile | null>(() => {
    return (
      userProfile ||
      (user
        ? {
            id: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            onboardingCompleted: false,
          }
        : null)
    );
  }, [userProfile, user]);

  const signUp = useCallback(
    async (email: string, password: string, name?: string): Promise<AuthResult> => {
      try {
        // Validation
        if (!email || !password) {
          console.warn('⚠️ Missing required fields');
          throw new Error('Email and password are required');
        }

        const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);

        // Update the user's display name
        if (name && newUser) {
          await updateProfile(newUser, { displayName: name });
        }

        // Create Firestore user document
        await createUserDocument(newUser);

        return { success: true, error: null };
      } catch (error) {
        const info = errorInfo(error);
        console.error('❌ SIGNUP FAILED:', info);

        // Convert Firebase error codes to user-friendly messages
        let errorMessage = info.message;
        if (info.code === 'auth/email-already-in-use') {
          errorMessage = 'An account with this email already exists';
        } else if (info.code === 'auth/invalid-email') {
          errorMessage = 'Please enter a valid email address';
        } else if (info.code === 'auth/weak-password') {
          errorMessage = 'Password should be at least 6 characters';
        }

        return { success: false, error: errorMessage };
      }
    },
    [createUserDocument]
  );

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, error: null };
    } catch (error) {
      const info = errorInfo(error);
      console.error('❌ SIGNIN FAILED:', info);

      let errorMessage = info.message;
      if (info.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (info.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (info.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      }

      return { success: false, error: errorMessage };
    }
  }, []); // No dependencies

  const signOut = useCallback(async (): Promise<AuthResult> => {
    try {
      await firebaseSignOut(auth);
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ SIGNOUT FAILED:', error);
      return { success: false, error: errorInfo(error).message };
    }
  }, []); // No dependencies

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: errorInfo(error).message };
    }
  }, []); // No dependencies

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: errorInfo(error).message };
    }
  }, []); // No dependencies

  // Helper function to refresh user profile (for after onboarding, etc.)
  const refreshUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user?.uid) {
      console.warn('⚠️ Cannot refresh profile: no user logged in');
      return null;
    }

    const freshProfile = await fetchUserProfile(user.uid);
    setUserProfile(freshProfile);
    return freshProfile;
  }, [user?.uid, fetchUserProfile]);

  // Context value - CRITICAL: useMemo prevents infinite re-render loop
  // Memoize to ensure the value object only changes when dependencies actually change
  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      userProfile,
      user,
      isInitialized: !isLoading,
      isSignedIn: !!user,
      signUp,
      signIn,
      signOut,
      resetPassword,
      signInWithGoogle,
      getCurrentUser: () => user,
      getCurrentSession: () => (user ? { user } : null),
      // Firestore helpers
      createUserDocument,
      fetchUserProfile,
      updateUserProfile,
      refreshUserProfile,
    }),
    [
      profile,
      userProfile,
      user,
      isLoading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      signInWithGoogle,
      createUserDocument,
      fetchUserProfile,
      updateUserProfile,
      refreshUserProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
