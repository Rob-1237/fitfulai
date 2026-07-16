import { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * SettingsContext
 *
 * Global settings management using React Context
 * Hybrid storage strategy:
 * - Primary: Firestore (syncs across devices)
 * - Cache: localStorage (instant access)
 *
 * Features:
 * - Instant UI updates across all components
 * - Background sync with Firestore
 * - Cross-device synchronization
 * - Persists through browser data clearing
 */

const SETTINGS_STORAGE_KEY = 'fitful_settings';

const DEFAULT_SETTINGS = {
  theme: 'dark',
  notifications: {
    email: true,
    push: false,
    mealReminders: true
  },
  display: {
    measurementSystem: 'imperial',
    weekStartDay: 'sunday',
    compactView: false
  },
  privacy: {
    shareProgress: false,
    publicProfile: false
  }
};

// Create the context
const SettingsContext = createContext(null);

// Custom hook to use the settings context
// eslint-disable-next-line react-refresh/only-export-components -- context hook co-located with its provider
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Settings Provider Component
export const SettingsProvider = ({ children, userId }) => {
  const [settings, setSettings] = useState(() => {
    // Load from localStorage immediately for instant UI
    try {
      const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('⚙️ Settings loaded from localStorage:', parsed);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
    return DEFAULT_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSynced, setIsSynced] = useState(false);

  // Load settings from Firestore on mount or when userId changes
  useEffect(() => {
    const loadFirestoreSettings = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('⚙️ Loading settings from Firestore for user:', userId);
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const firestoreSettings = userData.settings || {};

          // Merge with defaults
          const mergedSettings = {
            ...DEFAULT_SETTINGS,
            ...firestoreSettings
          };

          // Check if Firestore is newer than localStorage
          const localSettings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
          const firestoreUpdated = firestoreSettings.updatedAt?.toMillis() || 0;
          const localUpdated = localSettings.updatedAt || 0;

          if (firestoreUpdated > localUpdated || !localUpdated) {
            console.log('⚙️ Firestore settings are newer, updating localStorage');
            setSettings(mergedSettings);
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
              ...mergedSettings,
              updatedAt: firestoreUpdated
            }));
          } else {
            console.log('⚙️ localStorage settings are current');
          }

          setIsSynced(true);
        } else {
          // User document doesn't exist yet, create with default settings
          console.log('⚙️ No settings found in Firestore, creating defaults');
          await saveToFirestore(userId, DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error('❌ Error loading settings from Firestore:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFirestoreSettings();
  }, [userId]);

  // Save settings to Firestore
  const saveToFirestore = useCallback(async (uid, newSettings) => {
    if (!uid) return;

    try {
      const userRef = doc(db, 'users', uid);
      const timestamp = Date.now();

      const settingsWithTimestamp = {
        ...newSettings,
        updatedAt: new Date()
      };

      // Check if document exists
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Update existing document
        await updateDoc(userRef, {
          settings: settingsWithTimestamp
        });
      } else {
        // Create new document with settings
        await setDoc(userRef, {
          settings: settingsWithTimestamp
        }, { merge: true });
      }

      console.log('✅ Settings saved to Firestore');

      // Update localStorage with timestamp
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
        ...newSettings,
        updatedAt: timestamp
      }));
    } catch (error) {
      console.error('❌ Error saving settings to Firestore:', error);
      throw error;
    }
  }, []);

  // Update a specific setting
  const updateSetting = useCallback(async (key, value) => {
    const newSettings = { ...settings };

    // Handle nested keys (e.g., 'notifications.email')
    if (key.includes('.')) {
      const keys = key.split('.');
      let current = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    } else {
      newSettings[key] = value;
    }

    // Update state immediately (optimistic update)
    setSettings(newSettings);

    // Update localStorage immediately
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
        ...newSettings,
        updatedAt: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to update localStorage:', error);
    }

    // Sync to Firestore in background
    if (userId) {
      try {
        await saveToFirestore(userId, newSettings);
      } catch (error) {
        console.error('Failed to sync settings to Firestore:', error);
        // Don't revert optimistic update - it's still in localStorage
      }
    }
  }, [settings, userId, saveToFirestore]);

  // Toggle theme (convenience method)
  const toggleTheme = useCallback(() => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSetting('theme', newTheme);
  }, [settings.theme, updateSetting]);

  // Reset to defaults
  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    if (userId) {
      await saveToFirestore(userId, DEFAULT_SETTINGS);
    }
  }, [userId, saveToFirestore]);

  // Context value - memoized to prevent unnecessary re-renders
  const value = useMemo(() => ({
    settings,
    isLoading,
    isSynced,
    updateSetting,
    toggleTheme,
    resetSettings,

    // Convenience accessors
    isDark: settings.theme === 'dark',
    theme: settings.theme
  }), [
    settings,
    isLoading,
    isSynced,
    updateSetting,
    toggleTheme,
    resetSettings
  ]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
