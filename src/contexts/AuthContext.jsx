import { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to create user document in Firestore
  const createUserDocument = useCallback(async (user, additionalData = {}) => {
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
            budgetRange: 'medium'
          },

          ...additionalData
        };

        await setDoc(userDocRef, userData);
      }

      return userDocRef;
    } catch (error) {
      console.error('❌ Error in createUserDocument:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }, []); // No dependencies - pure function

  // Helper function to fetch user profile
  const fetchUserProfile = useCallback(async (uid) => {
    if (!uid) {
      console.warn('⚠️ fetchUserProfile: No uid provided');
      return null;
    }

    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      } else {
        console.warn('⚠️ User document does not exist in Firestore');
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        uid: uid
      });
      return null;
    }
  }, []); // No dependencies - pure function

  // Helper function to update user profile in Firestore
  const updateUserProfile = useCallback(async (profileData) => {
    if (!user) {
      console.warn('⚠️ updateUserProfile: No user authenticated');
      throw new Error('No user authenticated');
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updateData = {
        ...profileData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userDocRef, updateData);

      // Refresh the user profile data
      const updatedProfile = await fetchUserProfile(user.uid);
      setUserProfile(updatedProfile);

      return { success: true, error: null };
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        uid: user?.uid
      });
      return { success: false, error: error.message };
    }
  }, [user, fetchUserProfile]); // Depends on user and fetchUserProfile

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
  }, []);

  // Enhanced profile object combining Firebase user and Firestore profile
  // CRITICAL: useMemo prevents infinite re-render loop by memoizing the object reference
  const profile = useMemo(() => {
    return userProfile || (user ? {
      id: user.uid,
      email: user.email,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      onboardingCompleted: false
    } : null);
  }, [userProfile, user]);

  const signUp = useCallback(async (email, password, name) => {
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
      console.error('❌ SIGNUP FAILED');
      console.error('❌ SignUp error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });

      // Convert Firebase error codes to user-friendly messages
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }

      return { success: false, error: errorMessage };
    }
  }, [createUserDocument]); // Depends on createUserDocument

  const signIn = useCallback(async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ SIGNIN FAILED');
      console.error('❌ SignIn error details:', {
        code: error.code,
        message: error.message
      });

      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      }

      return { success: false, error: errorMessage };
    }
  }, []); // No dependencies

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ SIGNOUT FAILED:', error);
      return { success: false, error: error.message };
    }
  }, []); // No dependencies

  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []); // No dependencies

  const signInWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []); // No dependencies

  // Helper function to refresh user profile (for after onboarding, etc.)
  const refreshUserProfile = useCallback(async () => {
    if (!user?.uid) {
      console.warn('⚠️ Cannot refresh profile: no user logged in');
      return null;
    }

    const freshProfile = await fetchUserProfile(user.uid);
    setUserProfile(freshProfile);
    return freshProfile;
  }, [user?.uid]);

  // Context value - CRITICAL: useMemo prevents infinite re-render loop
  // Memoize to ensure the value object only changes when dependencies actually change
  const value = useMemo(() => ({
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
    getCurrentSession: () => user ? { user } : null,
    // Firestore helpers
    createUserDocument,
    fetchUserProfile,
    updateUserProfile,
    refreshUserProfile  // NEW: Expose refresh function
  }), [
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
    refreshUserProfile
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
