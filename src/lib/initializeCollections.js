import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Initialize all Firestore collections for a new user
 * Creates placeholder documents with proper schema structure
 * @param {string} userId - The authenticated user's ID
 * @param {Object} userData - User data from Firebase Auth (email, displayName)
 * @param {Object} onboardingData - Data collected during onboarding
 */
export const initializeUserCollections = async (userId, userData, onboardingData = {}) => {
  console.log('📋 Initializing collections for user:', userId);

  try {
    // Check if user already has collections initialized
    const profileRef = doc(db, 'profiles', userId);
    const profileDoc = await getDoc(profileRef);

    if (profileDoc.exists()) {
      console.log(' User collections already initialized');
      return { success: true, message: 'Collections already exist' };
    }

    // Create all collections in parallel for performance
    await Promise.all([
      createUserProfile(userId, userData, onboardingData),
      createWorkoutsCollection(userId),
      createMealsCollection(userId),
      createGroceriesCollection(userId),
      initializeAiCache(userId)
    ]);

    console.log(' All collections initialized successfully');
    return { success: true, message: 'Collections initialized' };

  } catch (error) {
    console.error('L Error initializing collections:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create user profile document with all 28 required fields
 * Based on lines 43-78 from FIRESTORE_SETUP_GUIDE.md
 */
const createUserProfile = async (userId, userData, onboardingData) => {
  console.log('=� Creating profile document...');

  const profileData = {
    // Basic user info
    email: userData.email || '',
    name: userData.displayName || userData.email?.split('@')[0] || 'User',

    // Onboarding data (if provided, otherwise defaults)
    age: onboardingData.age || null,
    gender: onboardingData.gender || '',
    activityLevel: onboardingData.activityLevel || '',
    fitnessGoal: onboardingData.fitnessGoal || '',

    // Physical measurements
    heightCentimeters: onboardingData.heightCentimeters || null,
    heightInches: onboardingData.heightInches || null,
    weightKgs: onboardingData.weightKgs || null,
    weightLbs: onboardingData.weightLbs || null,

    // Dietary preferences
    dietaryPreferences: onboardingData.dietaryPreferences || [],
    allergies: onboardingData.allergies || [],

    // Calculated metrics (will be computed during onboarding)
    bmr: onboardingData.bmr || null,
    tdee: onboardingData.tdee || null,
    calorieTarget: onboardingData.calorieTarget || null,
    macros: onboardingData.macros || {
      protein: null,
      carbs: null,
      fat: null
    },

    // Subscription and usage tracking
    tier: 'pro', // Start as Pro tier for testing
    subscriptionStatus: 'active',
    subscriptionEndDate: null, // timestamp type, null value
    aiGenerationsUsed: 0,
    aiGenerationsReset: serverTimestamp(),

    // User preferences (new fields)
    unitsPreference: onboardingData.unitsPreference || 'imperial',
    timezone: onboardingData.timezone || 'America/New_York',
    preferences: {
      workoutDays: onboardingData.workoutDays || ['monday', 'wednesday', 'friday'],
      mealComplexity: 'intermediate',
      budgetRange: 'medium'
    },

    // Status tracking
    onboardingCompleted: onboardingData.onboardingCompleted || false,
    lastActiveDate: serverTimestamp(),

    // Timestamps
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const profileRef = doc(db, 'profiles', userId);
  await setDoc(profileRef, profileData);
  console.log(' Profile document created');
};

/**
 * Create workouts collection structure for Pro tier
 * Based on lines 84-192 evaluation - complex structure for Pro tier
 */
const createWorkoutsCollection = async (userId) => {
  console.log('=� Creating workouts collection structure...');

  // Create a placeholder workout document to establish schema
  const placeholderWorkout = {
    id: `${userId}_workout_placeholder`,
    userId: userId,
    type: 'placeholder',
    name: 'Placeholder Workout',
    description: 'Initial placeholder - will be replaced by AI-generated workouts',

    // AI generation metadata
    generatedAt: serverTimestamp(),
    generatedBy: 'system',
    aiPrompt: null,

    // Pro-tier complex structure (from lines 84-192)
    weeks: [
      {
        weekNumber: 1,
        days: [
          {
            dayNumber: 1,
            dayName: 'monday',
            restDay: false,
            exercises: [
              {
                name: 'Sample Exercise',
                category: 'strength',
                muscleGroups: ['chest'],
                sets: 3,
                reps: '10-12',
                duration: null,
                restBetweenSets: '60s',
                instructions: 'Sample instructions',
                videoUrl: '',
                equipment: ['bodyweight'],
                difficulty: 'beginner'
              }
            ]
          }
        ]
      }
    ],

    // User progress tracking
    progress: {
      completedWorkouts: 0,
      totalWorkouts: 1,
      weeklyStreak: 0,
      lastWorkoutDate: null
    },

    // Metadata
    difficulty: 'beginner',
    estimatedDuration: '30min',
    equipment: ['bodyweight'],
    tags: ['placeholder'],

    // Status
    isActive: false, // Placeholder is not active
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // Use auto-generated document ID
  const workoutRef = doc(collection(db, 'workouts'));
  await setDoc(workoutRef, placeholderWorkout);
  console.log(' Workouts collection initialized with placeholder');
};

/**
 * Create meals collection structure
 * Based on lines 198-230 specifications
 */
const createMealsCollection = async (userId) => {
  console.log('<} Creating meals collection structure...');

  // Create placeholder meal plan to establish schema
  const placeholderMealPlan = {
    id: `${userId}_meals_placeholder`,
    userId: userId,
    type: 'weekly',
    date: null,
    weekStartDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD

    // AI generation metadata
    generatedAt: serverTimestamp(),
    generatedBy: 'system',
    aiPrompt: 'Placeholder meal plan',

    // Nutritional targets (will come from user profile)
    targets: {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 65
    },

    // Weekly meal structure
    days: {
      monday: {
        breakfast: {
          name: 'Sample Breakfast',
          description: 'Placeholder meal',
          calories: 400,
          macros: { protein: 20, carbs: 40, fat: 15 },
          ingredients: [
            { name: 'Sample ingredient', amount: 1, unit: 'cup' }
          ],
          instructions: ['Sample instruction'],
          prepTime: 10,
          cookTime: 5,
          servings: 1,
          tags: ['placeholder'],
          imageUrl: ''
        },
        lunch: {
          name: 'Sample Lunch',
          description: 'Placeholder meal',
          calories: 500,
          macros: { protein: 30, carbs: 45, fat: 20 },
          ingredients: [
            { name: 'Sample ingredient', amount: 1, unit: 'serving' }
          ],
          instructions: ['Sample instruction'],
          prepTime: 15,
          cookTime: 10,
          servings: 1,
          tags: ['placeholder'],
          imageUrl: ''
        },
        dinner: {
          name: 'Sample Dinner',
          description: 'Placeholder meal',
          calories: 600,
          macros: { protein: 35, carbs: 50, fat: 25 },
          ingredients: [
            { name: 'Sample ingredient', amount: 1, unit: 'portion' }
          ],
          instructions: ['Sample instruction'],
          prepTime: 20,
          cookTime: 25,
          servings: 1,
          tags: ['placeholder'],
          imageUrl: ''
        },
        snacks: [
          {
            name: 'Sample Snack',
            description: 'Placeholder snack',
            calories: 150,
            macros: { protein: 10, carbs: 15, fat: 8 },
            ingredients: [
              { name: 'Sample snack item', amount: 1, unit: 'serving' }
            ],
            instructions: ['Ready to eat'],
            prepTime: 0,
            cookTime: 0,
            servings: 1,
            tags: ['placeholder'],
            imageUrl: ''
          }
        ]
      }
      // Note: Only Monday populated for placeholder - AI will generate full week
    },

    // Calculated totals
    actualTotals: {
      calories: 1650,
      protein: 95,
      carbs: 150,
      fat: 68
    },

    // User interaction tracking
    userRatings: {},
    substitutions: [],

    // Status
    isCompleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const mealRef = doc(collection(db, 'meals'));
  await setDoc(mealRef, placeholderMealPlan);
  console.log(' Meals collection initialized with placeholder');
};

/**
 * Create groceries collection with specified fields
 * Based on user requirements: list, estimatedTotal, checkedItems + additional suggestions
 */
const createGroceriesCollection = async (userId) => {
  console.log('=� Creating groceries collection structure...');

  const placeholderGroceryList = {
    id: `${userId}_groceries_placeholder`,
    userId: userId,
    name: 'Sample Grocery List',
    type: 'weekly',

    // Generated from meal plans
    sourceMealPlanIds: [], // Will contain meal plan IDs that generated this list
    generatedAt: serverTimestamp(),

    // Core required fields
    items: [
      {
        id: 'item_1',
        name: 'Sample Item 1',
        quantity: 2,
        unit: 'lbs',
        category: 'produce',
        estimatedPrice: 4.99,
        isChecked: false,
        addedManually: false,
        notes: 'Sample grocery item',
        usedInMeals: ['monday_breakfast']
      },
      {
        id: 'item_2',
        name: 'Sample Item 2',
        quantity: 1,
        unit: 'package',
        category: 'pantry',
        estimatedPrice: 3.49,
        isChecked: false,
        addedManually: true,
        notes: '',
        usedInMeals: []
      }
    ],
    estimatedTotal: 8.48, // Required field - sum of item prices
    checkedItems: [], // Required field - array of item IDs user already has

    // Additional suggested fields for better UX
    storeLayout: {
      produce: { sectionOrder: 1, items: ['item_1'] },
      pantry: { sectionOrder: 2, items: ['item_2'] }
    },
    budgetTarget: 75.00,
    actualTotal: null, // Filled when shopping is completed

    // Shopping session tracking
    shoppingSession: {
      startedAt: null,
      completedAt: null,
      storeLocation: ''
    },

    // Summary statistics
    totalItems: 2,
    checkedItemsCount: 0,

    // Status
    isCompleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const groceryRef = doc(collection(db, 'groceries'));
  await setDoc(groceryRef, placeholderGroceryList);
  console.log(' Groceries collection initialized with placeholder');
};

/**
 * Initialize AI Cache collection structure
 * Purpose: Cache AI responses to save costs and improve performance
 */
const initializeAiCache = async (userId) => {
  console.log('> Initializing AI cache structure...');

  // Create a sample cache entry to establish schema
  const sampleCacheEntry = {
    // Required existing fields (from current data)
    createdAt: serverTimestamp(),
    prompt: 'Sample AI prompt for schema definition',
    response: 'Sample AI response',

    // Additional fields for better cache management
    promptHash: 'sha256_hash_of_prompt', // For efficient lookups
    userContext: {
      userId: userId,
      userTier: 'pro',
      fitnessGoal: 'general_fitness',
      activityLevel: 'light'
    },
    requestType: 'workout', // 'workout', 'meal', 'grocery'
    tokensUsed: 1250,
    cost: 0.025,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    hitCount: 0, // How many times this cache has been used

    // Metadata
    aiModel: 'gpt-4',
    responseTime: 1500, // milliseconds
    successful: true
  };

  const cacheRef = doc(collection(db, 'aiCache'));
  await setDoc(cacheRef, sampleCacheEntry);
  console.log(' AI Cache collection initialized with sample entry');
};

/**
 * Helper function to check if user collections exist
 * @param {string} userId
 * @returns {boolean}
 */
export const userCollectionsExist = async (userId) => {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileDoc = await getDoc(profileRef);
    return profileDoc.exists();
  } catch (error) {
    console.error('Error checking user collections:', error);
    return false;
  }
};

/**
 * Clean up placeholder documents (call after real data is generated)
 * @param {string} userId
 */
export const cleanupPlaceholders = async (userId) => {
  console.log('>� Cleaning up placeholder documents...');
  // This will be implemented later when we have real data generation
  // Will query and remove documents with type: 'placeholder'
};