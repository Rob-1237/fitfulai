import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  limit,
  getDocsFromServer,
} from 'firebase/firestore';
import { db } from './firebase';
import type { MealPlanDoc, GroceryListDoc, TimestampLike } from '../shared/schemas';

interface QueryOptions {
  /** Force server fetch to bypass cache (fixes refetch issue after generation) */
  bypassCache?: boolean;
}

interface CachedAIResponse {
  id: string;
  promptHash: string;
  response: unknown;
  expiresAt?: TimestampLike;
  [key: string]: unknown;
}

const generatedAtMillis = (docData: { generatedAt?: TimestampLike }): number =>
  docData.generatedAt?.toDate?.().getTime() ?? 0;

// Meal Queries
export const getUserMealPlans = async (
  userId: string,
  options: QueryOptions = {}
): Promise<MealPlanDoc[]> => {
  try {
    const mealsRef = collection(db, 'meals');
    const q = query(mealsRef, where('userId', '==', userId));

    const querySnapshot = options.bypassCache ? await getDocsFromServer(q) : await getDocs(q);

    const mealPlans: MealPlanDoc[] = [];

    querySnapshot.forEach((docSnap) => {
      mealPlans.push({ ...(docSnap.data() as MealPlanDoc), id: docSnap.id });
    });

    // Sort newest-first in memory instead of using Firestore orderBy
    mealPlans.sort((a, b) => generatedAtMillis(b) - generatedAtMillis(a));

    console.log(
      `🍽️ Found ${mealPlans.length} meal plans for user ${userId}${options.bypassCache ? ' (from server)' : ''}`
    );
    return mealPlans;
  } catch (error) {
    console.error('❌ Error fetching user meal plans:', error);
    return [];
  }
};

export const getMealPlanByDate = async (
  userId: string,
  weekStartDate: string
): Promise<MealPlanDoc | null> => {
  try {
    const mealId = `${userId}_meals_${weekStartDate}`;
    const mealRef = doc(db, 'meals', mealId);
    const mealSnap = await getDoc(mealRef);

    if (mealSnap.exists()) {
      return { ...(mealSnap.data() as MealPlanDoc), id: mealSnap.id };
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
export const getUserGroceryLists = async (
  userId: string,
  options: QueryOptions = {}
): Promise<GroceryListDoc[]> => {
  try {
    const groceriesRef = collection(db, 'groceries');
    const q = query(groceriesRef, where('userId', '==', userId));

    const querySnapshot = options.bypassCache ? await getDocsFromServer(q) : await getDocs(q);

    const groceryLists: GroceryListDoc[] = [];

    querySnapshot.forEach((docSnap) => {
      groceryLists.push({ ...(docSnap.data() as GroceryListDoc), id: docSnap.id });
    });

    // Sort newest-first in memory instead of using Firestore orderBy
    groceryLists.sort((a, b) => generatedAtMillis(b) - generatedAtMillis(a));

    console.log(
      `🛒 Found ${groceryLists.length} grocery lists for user ${userId}${options.bypassCache ? ' (from server)' : ''}`
    );
    return groceryLists;
  } catch (error) {
    console.error('❌ Error fetching user grocery lists:', error);
    return [];
  }
};

export const getGroceryListByDate = async (
  userId: string,
  weekStartDate: string
): Promise<GroceryListDoc | null> => {
  try {
    const groceryId = `${userId}_groceries_${weekStartDate}`;
    const groceryRef = doc(db, 'groceries', groceryId);
    const grocerySnap = await getDoc(groceryRef);

    if (grocerySnap.exists()) {
      return { ...(grocerySnap.data() as GroceryListDoc), id: grocerySnap.id };
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
export const getCachedResponse = async (
  promptHash: string,
  userContext: { userId?: string }
): Promise<CachedAIResponse | null> => {
  try {
    if (!userContext?.userId) {
      console.warn('⚠️ No userId provided for cache lookup');
      return null;
    }

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
      const cacheData = { ...cacheDoc.data(), id: cacheDoc.id } as CachedAIResponse;

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

export interface WeekData {
  weekStartDate: string | null;
  mealPlan: MealPlanDoc | null;
  groceryList: GroceryListDoc | null;
}

// Helper function to get current week's data
export const getCurrentWeekData = async (userId: string): Promise<WeekData> => {
  const today = new Date();
  const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
  const weekStartDate = monday.toISOString().split('T')[0].replace(/-/g, '_');

  try {
    const [mealPlan, groceryList] = await Promise.all([
      getMealPlanByDate(userId, weekStartDate),
      getGroceryListByDate(userId, weekStartDate),
    ]);

    return {
      weekStartDate,
      mealPlan,
      groceryList,
    };
  } catch (error) {
    console.error('❌ Error fetching current week data:', error);
    return {
      weekStartDate,
      mealPlan: null,
      groceryList: null,
    };
  }
};

// Get data for a specific week (for week navigation)
export const getWeekData = async (
  userId: string,
  weekStartDate: Date | string
): Promise<WeekData> => {
  try {
    // Convert Date object to underscore format (YYYY_MM_DD)
    const formattedDate =
      weekStartDate instanceof Date
        ? weekStartDate.toISOString().split('T')[0].replace(/-/g, '_')
        : weekStartDate.replace(/-/g, '_');

    const [mealPlan, groceryList] = await Promise.all([
      getMealPlanByDate(userId, formattedDate),
      getGroceryListByDate(userId, formattedDate),
    ]);

    return {
      weekStartDate: formattedDate,
      mealPlan,
      groceryList,
    };
  } catch (error) {
    console.error('❌ Error fetching week data:', error);
    return {
      weekStartDate: null,
      mealPlan: null,
      groceryList: null,
    };
  }
};
