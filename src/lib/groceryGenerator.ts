import { generateAIResponse } from './openai';
import { getCachedResponse } from './firestoreQueries';
import { doc, setDoc, updateDoc, serverTimestamp, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type {
  AiUsage,
  GenerationResult,
  GroceryList,
  GroceryListDoc,
  MealPlanDoc,
  UserProfile,
} from '../shared/schemas';

// Helper function to get the start date (Sunday) of the current week
const getCurrentWeekStartDate = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  return sunday;
};

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Generate a comprehensive grocery list using AI
export const generateGroceryList = async (
  userProfile: UserProfile,
  mealPlan: MealPlanDoc | null = null,
  forceRefresh = false
): Promise<GenerationResult<GroceryListDoc>> => {
  const userId = userProfile.id || userProfile.uid || 'unknown';

  try {
    // Create prompt hash for caching
    const promptContext = {
      userId: userId,
      type: 'grocery_list',
      userData: {
        dietaryPreferences: userProfile.dietaryPreferences,
        allergies: userProfile.allergies,
        budgetPreference: userProfile.budgetPreference || 'moderate',
      },
      mealPlanId: mealPlan?.id || 'standalone',
    };

    const promptHash = 'grocery_' + btoa(JSON.stringify(promptContext)).slice(0, 26);

    // Check cache first (unless forceRefresh is true)
    let cachedResponse = null;
    if (!forceRefresh) {
      try {
        cachedResponse = await getCachedResponse(promptHash, { userId: userId });
      } catch (cacheError) {
        console.warn(
          '⚠️ Cache check failed, proceeding without cache:',
          cacheError instanceof Error ? cacheError.message : cacheError
        );
      }
    }

    if (cachedResponse) {
      // Save cached data as new Firestore document
      const processedGroceryList = await saveGroceryListToFirestore(
        userId,
        cachedResponse.response as GroceryList,
        {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          cost: 0,
          model: 'cached',
        }
      );

      return {
        success: true,
        data: processedGroceryList,
        cached: true,
        source: 'cache',
      };
    }

    // Build comprehensive AI prompt
    const prompt = buildGroceryListPrompt(userProfile, mealPlan);
    const aiResponse = await generateAIResponse(prompt, {
      max_tokens: 6000, // Sufficient for detailed grocery lists
      temperature: 0.3, // Lower temperature for precise lists
    });

    if (!aiResponse.success) {
      console.error('❌ AI generation failed:', aiResponse.error);
      return {
        success: false,
        error: aiResponse.error,
        code: aiResponse.code,
      };
    }

    // Validate the AI response
    validateGroceryListData(aiResponse.data);

    // Cache the AI response
    await cacheAIResponse(promptHash, promptContext, aiResponse.data, aiResponse.usage);

    // Process and save the grocery list
    const processedGroceryList = await saveGroceryListToFirestore(userId, aiResponse.data, aiResponse.usage);

    return {
      success: true,
      data: processedGroceryList,
      cached: false,
      source: 'ai',
      usage: aiResponse.usage,
      duration: aiResponse.duration,
    };
  } catch (error) {
    console.error('❌ Grocery list generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate grocery list',
      code: 'GENERATION_ERROR',
    };
  }
};

// Build the AI prompt for grocery list generation
const buildGroceryListPrompt = (userProfile: UserProfile, mealPlan: MealPlanDoc | null): string => {
  const { dietaryPreferences = [], allergies = [], budgetPreference = 'moderate' } = userProfile;

  const dietaryText =
    dietaryPreferences.length > 0 ? dietaryPreferences.join(', ') : 'No specific dietary restrictions';

  const allergyText = allergies.length > 0 ? allergies.join(', ') : 'No known allergies';

  // Calculate dynamic dates for the current week
  const weekStartDate = getCurrentWeekStartDate();
  const weekStartDateStr = formatDate(weekStartDate);

  // Extract ingredients from meal plan if provided
  const mealPlanIngredients = mealPlan?.shoppingList
    ? mealPlan.shoppingList.map((item) => `${item.quantity} ${item.item}`).join(', ')
    : '';

  return `Generate a comprehensive and organized shopping list for grocery shopping.

USER PROFILE:
- Dietary Preferences: ${dietaryText}
- Allergies: ${allergyText}
- Budget Preference: ${budgetPreference}

${
  mealPlan
    ? `MEAL PLAN INGREDIENTS:
${mealPlanIngredients}

Based on the meal plan ingredients above, create an optimized shopping list.`
    : 'Create a weekly grocery list for healthy meal preparation.'
}

REQUIREMENTS:
1. Organize items by store sections for efficient shopping
2. Include appropriate quantities for a week
3. Suggest budget-friendly alternatives where appropriate
4. Include staples and pantry items
5. Consolidate duplicate items with total quantities

RESPONSE FORMAT:
IMPORTANT: Return ONLY a valid JSON object with this exact structure. Do NOT include any text before or after the JSON. Ensure all strings are properly quoted and no trailing commas exist:

{
  "name": "Weekly Grocery List",
  "description": "Organized shopping list for efficient grocery shopping",
  "weekStartDate": "${weekStartDateStr}",
  "totalEstimatedCost": 85.50,
  "sections": {
    "produce": {
      "name": "Produce",
      "items": [
        {
          "item": "Bananas",
          "quantity": "2 lbs",
          "estimatedCost": 2.50,
          "notes": "For breakfast and snacks"
        },
        {
          "item": "Spinach",
          "quantity": "1 bag",
          "estimatedCost": 3.99,
          "notes": "Fresh baby spinach"
        }
      ]
    },
    "proteins": {
      "name": "Meat & Seafood",
      "items": [
        {
          "item": "Chicken breast",
          "quantity": "2 lbs",
          "estimatedCost": 8.99,
          "notes": "Boneless, skinless"
        }
      ]
    },
    "dairy": {
      "name": "Dairy & Eggs",
      "items": [
        {
          "item": "Greek yogurt",
          "quantity": "1 large container",
          "estimatedCost": 5.99,
          "notes": "Plain, non-fat"
        }
      ]
    },
    "pantry": {
      "name": "Pantry & Dry Goods",
      "items": [
        {
          "item": "Quinoa",
          "quantity": "1 bag",
          "estimatedCost": 4.99,
          "notes": "Organic preferred"
        }
      ]
    },
    "frozen": {
      "name": "Frozen",
      "items": [
        {
          "item": "Mixed berries",
          "quantity": "1 bag",
          "estimatedCost": 4.99,
          "notes": "For smoothies"
        }
      ]
    }
  },
  "shoppingTips": [
    "Shop produce section first for best selection",
    "Check unit prices for best value",
    "Buy proteins in bulk and freeze portions"
  ],
  "budgetAlternatives": [
    {
      "item": "Organic spinach",
      "alternative": "Regular spinach",
      "savings": "$1.50"
    }
  ],
  "mealPrepNotes": [
    "Wash and prep vegetables after shopping",
    "Portion proteins for weekly meals",
    "Store berries in freezer for longer freshness"
  ]
}

Generate a well-organized grocery list that promotes efficient shopping and healthy eating while respecting dietary preferences and budget considerations.

CRITICAL: Response must be valid JSON only. No explanatory text, no markdown formatting, no code blocks. Just the raw JSON object starting with { and ending with }.`;
};

// Save the generated grocery list to Firestore
const saveGroceryListToFirestore = async (
  userId: string,
  groceryListData: GroceryList,
  usage: AiUsage
): Promise<GroceryListDoc> => {
  try {
    // Create document ID
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '_');
    const groceryListId = `${userId}_groceries_${timestamp}_${Date.now()}`;

    // Prepare grocery list document
    const groceryListDoc = {
      id: groceryListId,
      userId: userId,
      type: 'ai_generated',

      // Core grocery list data from AI
      ...groceryListData,

      // AI generation metadata
      generatedAt: serverTimestamp(),
      generatedBy: 'ai',
      aiPrompt: 'Personalized grocery list based on user profile and meal plan',

      // Usage tracking
      aiUsage: {
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        cost: usage.cost,
        model: usage.model,
      },

      // Shopping progress tracking
      checkedItems: [] as string[],
      isCompleted: false,
      shoppingDate: null,

      // Firestore metadata
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    };

    // Save to Firestore
    const groceryListRef = doc(db, 'groceries', groceryListId);
    await setDoc(groceryListRef, groceryListDoc);

    // Remove placeholder grocery list if it exists
    await removeGroceryListPlaceholder(userId);

    return groceryListDoc as unknown as GroceryListDoc;
  } catch (error) {
    console.error('❌ Error saving grocery list to Firestore:', error);
    throw error;
  }
};

// Remove placeholder grocery list after generating real one
const removeGroceryListPlaceholder = async (userId: string): Promise<void> => {
  try {
    const placeholderId = `${userId}_groceries_placeholder`;
    const placeholderRef = doc(db, 'groceries', placeholderId);

    // Mark as inactive instead of deleting
    await updateDoc(placeholderRef, {
      isActive: false,
      replacedAt: serverTimestamp(),
    });
  } catch {
    // Silently handle - placeholder may not exist
  }
};

// Cache AI response for future use
const cacheAIResponse = async (
  promptHash: string,
  userContext: Record<string, unknown>,
  data: unknown,
  usage: AiUsage
): Promise<void> => {
  try {
    const cacheDoc = {
      promptHash,
      userContext,
      requestType: 'grocery_list',
      response: data,

      // Usage tracking (with defaults to prevent undefined)
      tokensUsed: usage?.totalTokens || 0,
      cost: usage?.cost || 0,
      model: usage?.model || 'unknown',

      // Cache management
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      hitCount: 0,
    };

    await addDoc(collection(db, 'aiCache'), cacheDoc);
  } catch (error) {
    console.warn('⚠️ Failed to cache AI response:', error);
    // Don't fail the main operation if caching fails
  }
};

// Validate grocery list data structure.
// NOTE: intentionally loose for now — it asserts the minimum shape the UI
// needs. Strict zod validation (GroceryListSchema) moves server-side on Day 4
// when structured outputs guarantee the full schema.
function validateGroceryListData(groceryListData: unknown): asserts groceryListData is GroceryList {
  if (typeof groceryListData !== 'object' || groceryListData === null) {
    throw new Error('Grocery list response is not an object');
  }

  const data = groceryListData as Record<string, unknown>;
  const required = ['name', 'description', 'sections'];
  const missing = required.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required grocery list fields: ${missing.join(', ')}`);
  }

  if (!data.sections || Object.keys(data.sections).length === 0) {
    throw new Error('Grocery list must include at least one section');
  }
}

export default generateGroceryList;
