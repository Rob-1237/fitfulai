import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

// Workout Queries
export const getUserWorkouts = async (userId) => {
  try {
    const workoutsRef = collection(db, 'workouts');
    const q = query(
      workoutsRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const workouts = [];

    querySnapshot.forEach((doc) => {
      workouts.push({ id: doc.id, ...doc.data() });
    });

    // Sort in memory instead of using Firestore orderBy to avoid index requirements
    workouts.sort((a, b) => {
      const aTime = a.generatedAt?.toDate?.() || new Date(0);
      const bTime = b.generatedAt?.toDate?.() || new Date(0);
      return bTime - aTime; // desc order
    });

    console.log(`📊 Found ${workouts.length} workouts for user ${userId}`);
    return workouts;
  } catch (error) {
    console.error('❌ Error fetching user workouts:', error);
    return [];
  }
};

export const getWorkoutById = async (workoutId) => {
  try {
    const workoutRef = doc(db, 'workouts', workoutId);
    const workoutSnap = await getDoc(workoutRef);

    if (workoutSnap.exists()) {
      return { id: workoutSnap.id, ...workoutSnap.data() };
    } else {
      console.warn(`⚠️ Workout ${workoutId} not found`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching workout:', error);
    return null;
  }
};

// Meal Queries
export const getUserMealPlans = async (userId) => {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(
      mealsRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const mealPlans = [];

    querySnapshot.forEach((doc) => {
      mealPlans.push({ id: doc.id, ...doc.data() });
    });

    // Sort in memory instead of using Firestore orderBy
    mealPlans.sort((a, b) => {
      const aTime = a.generatedAt?.toDate?.() || new Date(0);
      const bTime = b.generatedAt?.toDate?.() || new Date(0);
      return bTime - aTime; // desc order
    });

    console.log(`🍽️ Found ${mealPlans.length} meal plans for user ${userId}`);
    return mealPlans;
  } catch (error) {
    console.error('❌ Error fetching user meal plans:', error);
    return [];
  }
};

export const getMealPlanByDate = async (userId, weekStartDate) => {
  try {
    const mealId = `${userId}_meals_${weekStartDate}`;
    const mealRef = doc(db, 'meals', mealId);
    const mealSnap = await getDoc(mealRef);

    if (mealSnap.exists()) {
      return { id: mealSnap.id, ...mealSnap.data() };
    } else {
      console.warn(`⚠️ Meal plan for ${weekStartDate} not found`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching meal plan:', error);
    return null;
  }
};

// Grocery Queries
export const getUserGroceryLists = async (userId) => {
  try {
    const groceriesRef = collection(db, 'groceries');
    const q = query(
      groceriesRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const groceryLists = [];

    querySnapshot.forEach((doc) => {
      groceryLists.push({ id: doc.id, ...doc.data() });
    });

    // Sort in memory instead of using Firestore orderBy
    groceryLists.sort((a, b) => {
      const aTime = a.generatedAt?.toDate?.() || new Date(0);
      const bTime = b.generatedAt?.toDate?.() || new Date(0);
      return bTime - aTime; // desc order
    });

    console.log(`🛒 Found ${groceryLists.length} grocery lists for user ${userId}`);
    return groceryLists;
  } catch (error) {
    console.error('❌ Error fetching user grocery lists:', error);
    return [];
  }
};

export const getGroceryListByDate = async (userId, weekStartDate) => {
  try {
    const groceryId = `${userId}_groceries_${weekStartDate}`;
    const groceryRef = doc(db, 'groceries', groceryId);
    const grocerySnap = await getDoc(groceryRef);

    if (grocerySnap.exists()) {
      return { id: grocerySnap.id, ...grocerySnap.data() };
    } else {
      console.warn(`⚠️ Grocery list for ${weekStartDate} not found`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching grocery list:', error);
    return null;
  }
};

// AI Cache Queries
export const getCachedResponse = async (promptHash, userContext) => {
  try {
    const cacheRef = collection(db, 'aiCache');
    const q = query(
      cacheRef,
      where('promptHash', '==', promptHash),
      where('userContext.userId', '==', userContext.userId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const cacheDoc = querySnapshot.docs[0];
      const cacheData = { id: cacheDoc.id, ...cacheDoc.data() };

      // Check if cache has expired
      const now = new Date();
      const expiresAt = cacheData.expiresAt?.toDate();

      if (expiresAt && now < expiresAt) {
        console.log('✅ Cache hit for prompt:', promptHash.substring(0, 8));
        return cacheData;
      } else {
        console.log('⏰ Cache expired for prompt:', promptHash.substring(0, 8));
        return null;
      }
    }

    console.log('❌ Cache miss for prompt:', promptHash.substring(0, 8));
    return null;
  } catch (error) {
    console.error('❌ Error checking AI cache:', error);
    return null;
  }
};

// Helper function to get current week's data
export const getCurrentWeekData = async (userId) => {
  const today = new Date();
  const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
  const weekStartDate = monday.toISOString().split('T')[0].replace(/-/g, '_');

  try {
    const [mealPlan, groceryList] = await Promise.all([
      getMealPlanByDate(userId, weekStartDate),
      getGroceryListByDate(userId, weekStartDate)
    ]);

    return {
      weekStartDate,
      mealPlan,
      groceryList
    };
  } catch (error) {
    console.error('❌ Error fetching current week data:', error);
    return {
      weekStartDate,
      mealPlan: null,
      groceryList: null
    };
  }
};