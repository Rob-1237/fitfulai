import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Simple profile object from Firebase user
  const profile = user ? {
    id: user.uid,
    email: user.email,
    name: user.displayName || user.email?.split('@')[0] || 'User'
  } : null;

  const signUp = async (email, password, name) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true, error: null };
    } catch (error) {
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
    user,
    isInitialized: !isLoading,
    isSignedIn: !!user,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithGoogle,
    getCurrentUser: () => user,
    getCurrentSession: () => user ? { user } : null
  };
};