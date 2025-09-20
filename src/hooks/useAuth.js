import { useState, useEffect } from 'react';
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

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to create user document in Firestore
  const createUserDocument = async (user, additionalData = {}) => {
    console.log('🔥 createUserDocument called:', {
      userId: user?.uid,
      email: user?.email,
      displayName: user?.displayName,
      additionalData
    });

    if (!user) {
      console.warn('⚠️ createUserDocument: No user provided');
      return;
    }

    try {
      const userDocRef = doc(db, 'profiles', user.uid);
      console.log('🔥 Checking if user document exists:', user.uid);

      const userDoc = await getDoc(userDocRef);
      console.log('🔥 User document exists:', userDoc.exists());

      if (!userDoc.exists()) {
        const { email, displayName } = user;

        const userData = {
          email,
          name: displayName || email?.split('@')[0] || 'User',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),

          // Onboarding status
          onboardingCompleted: false,

          // Physical characteristics (will be filled during onboarding)
          age: null,
          weightLbs: null,
          weightKgs: null,
          heightInches: null,
          heightCentimeters: null,
          gender: null,

          // Fitness & nutrition preferences
          fitnessGoal: null,
          activityLevel: null,
          dietaryPreferences: [],
          allergies: [],

          // AI usage tracking
          aiGenerationsUsed: 0,
          aiGenerationsReset: serverTimestamp(),

          // Subscription info
          tier: 'free',
          subscriptionStatus: 'active',
          subscriptionEndDate: null,

          ...additionalData
        };

        console.log('🔥 Creating user document with data:', userData);
        await setDoc(userDocRef, userData);
        console.log('✅ User document created successfully');
      } else {
        console.log('📄 User document already exists, skipping creation');
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
  };

  // Helper function to fetch user profile
  const fetchUserProfile = async (uid) => {
    console.log('🔍 fetchUserProfile called for uid:', uid);

    if (!uid) {
      console.warn('⚠️ fetchUserProfile: No uid provided');
      return null;
    }

    try {
      const userDocRef = doc(db, 'profiles', uid);
      console.log('🔍 Fetching user document from Firestore...');

      const userDoc = await getDoc(userDocRef);
      console.log('🔍 User document fetch result:', {
        exists: userDoc.exists(),
        id: userDoc.id
      });

      if (userDoc.exists()) {
        const profileData = { id: userDoc.id, ...userDoc.data() };
        console.log('✅ User profile fetched successfully:', {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          onboardingCompleted: profileData.onboardingCompleted,
          tier: profileData.tier
        });
        return profileData;
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
  };

  // Helper function to update user profile in Firestore
  const updateUserProfile = async (profileData) => {
    console.log('🔄 updateUserProfile called with:', profileData);

    if (!user) {
      console.warn('⚠️ updateUserProfile: No user authenticated');
      throw new Error('No user authenticated');
    }

    try {
      const userDocRef = doc(db, 'profiles', user.uid);
      console.log('🔄 Updating user document in Firestore...');

      const updateData = {
        ...profileData,
        updatedAt: serverTimestamp()
      };

      console.log('🔄 Update data:', updateData);
      await updateDoc(userDocRef, updateData);
      console.log('✅ User profile updated successfully');

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
  };

  useEffect(() => {
    console.log('🚀 Setting up auth state listener...');

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', {
        userExists: !!user,
        uid: user?.uid,
        email: user?.email,
        displayName: user?.displayName,
        emailVerified: user?.emailVerified
      });

      setUser(user);

      if (user) {
        console.log('👤 User is authenticated, fetching profile...');

        try {
          // Fetch user profile from Firestore (don't auto-create - onboarding handles that)
          console.log('🔍 Fetching user profile...');
          const profile = await fetchUserProfile(user.uid);
          setUserProfile(profile);

          console.log('✅ User setup complete:', {
            hasProfile: !!profile,
            onboardingCompleted: profile?.onboardingCompleted
          });
        } catch (error) {
          console.error('❌ Error during user setup:', error);
          setUserProfile(null);
        }
      } else {
        console.log('🚫 User not authenticated, clearing profile');
        setUserProfile(null);
      }

      setIsLoading(false);
      console.log('🔄 Auth state processing complete, loading set to false');
    });

    return () => {
      console.log('🛑 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  // Enhanced profile object combining Firebase user and Firestore profile
  const profile = userProfile || (user ? {
    id: user.uid,
    email: user.email,
    name: user.displayName || user.email?.split('@')[0] || 'User',
    onboardingCompleted: false
  } : null);

  const signUp = async (email, password, name) => {
    console.log('📝 SIGNUP ATTEMPT STARTED');
    console.log('📝 signUp called with:', {
      email: email,
      emailLength: email?.length,
      passwordLength: password?.length,
      name: name,
      nameLength: name?.length
    });

    try {
      // Validation logging
      if (!email || !password) {
        console.warn('⚠️ Missing required fields');
        throw new Error('Email and password are required');
      }

      console.log('📝 Creating Firebase Auth user...');
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Firebase Auth user created successfully:', {
        uid: newUser.uid,
        email: newUser.email,
        emailVerified: newUser.emailVerified
      });

      // Update the user's display name
      if (name && newUser) {
        console.log('📝 Updating display name...');
        await updateProfile(newUser, { displayName: name });
        console.log('✅ Display name updated to:', name);
      } else {
        console.log('ℹ️ No name provided or user missing, skipping display name update');
      }

      console.log('🎉 SIGNUP COMPLETED SUCCESSFULLY');
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
        console.log('⚠️ Error type: Email already in use');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
        console.log('⚠️ Error type: Invalid email format');
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
        console.log('⚠️ Error type: Weak password');
      } else {
        console.log('⚠️ Error type: Other -', error.code);
      }

      console.log('📤 Returning error to UI:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signIn = async (email, password) => {
    console.log('🔑 SIGNIN ATTEMPT STARTED');
    console.log('🔑 signIn called with:', {
      email: email,
      emailLength: email?.length,
      passwordLength: password?.length
    });

    try {
      console.log('🔑 Authenticating with Firebase...');
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ SIGNIN SUCCESSFUL');
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

      console.log('📤 Returning signin error to UI:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    console.log('🚪 SIGNOUT ATTEMPT STARTED');

    try {
      console.log('🚪 Signing out from Firebase...');
      await firebaseSignOut(auth);
      console.log('✅ SIGNOUT SUCCESSFUL');
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ SIGNOUT FAILED:', error);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
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
    updateUserProfile
  };
};