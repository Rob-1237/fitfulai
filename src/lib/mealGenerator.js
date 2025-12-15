import { generateAIResponse, estimatePromptCost } from './openai';
import { getCachedResponse } from './firestoreQueries';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Helper function to get the start date (Sunday) of the current week
const getCurrentWeekStartDate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  return sunday;
};

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to get date for a specific day of the week
const getWeekDate = (weekStartDate, dayOffset) => {
  const date = new Date(weekStartDate);
  date.setDate(weekStartDate.getDate() + dayOffset);
  return formatDate(date);
};

// Generate a comprehensive meal plan using AI
export const generateMealPlan = async (userProfile, planType = 'weekly', forceRefresh = false) => {
  const userId = userProfile.id || userProfile.uid || 'unknown';

  try {
    // Create prompt hash for caching
    const promptContext = {
      userId: userId,
      type: 'meal_plan',
      userData: {
        age: userProfile.age,
        gender: userProfile.gender,
        fitnessGoal: userProfile.fitnessGoal,
        activityLevel: userProfile.activityLevel,
        calorieTarget: userProfile.calorieTarget,
        macros: userProfile.macros,
        dietaryPreferences: userProfile.dietaryPreferences,
        allergies: userProfile.allergies
      },
      planType
    };

    const promptHash = 'meal_' + btoa(JSON.stringify(promptContext)).slice(0, 28);

    // Check cache first (unless forceRefresh is true)
    let cachedResponse = null;
    if (!forceRefresh) {
      try {
        cachedResponse = await getCachedResponse(promptHash, { userId: userId });
      } catch (cacheError) {
        console.warn('⚠ Cache check failed, proceeding without cache:', cacheError.message);
      }
    }

    if (cachedResponse) {
      // Save cached data as new Firestore document
      const processedMealPlan = await saveMealPlanToFirestore(userId, cachedResponse.response, {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        model: 'cached'
      });

      return {
        success: true,
        data: processedMealPlan,
        cached: true,
        source: 'cache'
      };
    }

    // Build comprehensive AI prompt
    const prompt = buildMealPlanPrompt(userProfile, planType);

    // Generate meal plan with AI
    const aiResponse = await generateAIResponse(prompt, {
      max_tokens: 8000, // Large enough for comprehensive meal plan
      temperature: 0.5 // Higher creativity for meal variety
    });

    if (!aiResponse.success) {
      console.error('❌ AI generation failed:', aiResponse.error);
      return {
        success: false,
        error: aiResponse.error,
        code: aiResponse.code
      };
    }

    // Validate the AI response
    validateMealPlanData(aiResponse.data);

    // Cache the AI response
    await cacheAIResponse(promptHash, promptContext, aiResponse);

    // Process and save the meal plan
    const processedMealPlan = await saveMealPlanToFirestore(userId, aiResponse.data, aiResponse.usage);

    return {
      success: true,
      data: processedMealPlan,
      cached: false,
      source: 'ai',
      usage: aiResponse.usage,
      duration: aiResponse.duration
    };

  } catch (error) {
    console.error('❌ Meal plan generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate meal plan',
      code: 'GENERATION_ERROR'
    };
  }
};

// Build the AI prompt for meal plan generation
const buildMealPlanPrompt = (userProfile, planType) => {
  const {
    age,
    gender,
    fitnessGoal,
    activityLevel,
    dietaryPreferences = [],
    allergies = []
  } = userProfile;

  // Handle null/undefined values with proper defaults
  const calorieTarget = userProfile.calorieTarget || 2000;
  const macros = userProfile.macros || { protein: 150, carbs: 200, fat: 67 };

  const dietaryText = dietaryPreferences.length > 0
    ? dietaryPreferences.join(', ')
    : 'No specific dietary restrictions';

  const allergyText = allergies.length > 0
    ? allergies.join(', ')
    : 'No known allergies';

  // Calculate dynamic dates for the current week
  const weekStartDate = getCurrentWeekStartDate();
  const weekStartDateStr = formatDate(weekStartDate);
  const mondayDate = getWeekDate(weekStartDate, 1); // Monday is 1 day after Sunday

  return `Generate a personalized ${planType} meal plan for a ${age}-year-old ${gender}.

USER PROFILE:
- Fitness Goal: ${fitnessGoal}
- Activity Level: ${activityLevel}
- Daily Calorie Target: ${calorieTarget} calories
- Macro Targets: ${macros.protein}g protein, ${macros.carbs}g carbs, ${macros.fat}g fat
- Dietary Preferences: ${dietaryText}
- Allergies: ${allergyText}

REQUIREMENTS:
1. Create a balanced meal plan that meets their calorie and macro targets
2. Include breakfast, lunch, dinner, and 2 snacks daily
3. Provide variety and seasonal ingredients
4. Consider their fitness goal (${fitnessGoal})
5. Respect dietary preferences and allergies
6. Include cooking instructions and prep tips

RESPONSE FORMAT:
IMPORTANT: Return ONLY a valid JSON object with this exact structure. Do NOT include any text before or after the JSON. Ensure all strings are properly quoted and no trailing commas exist:

{
  "name": "Descriptive meal plan name",
  "description": "Brief description of the meal plan approach",
  "weekStartDate": "${weekStartDateStr}",
  "totalCalories": ${calorieTarget},
  "macroTargets": {
    "protein": ${macros.protein},
    "carbs": ${macros.carbs},
    "fat": ${macros.fat}
  },
  "days": {
    "monday": {
      "date": "${mondayDate}",
      "totalCalories": ${calorieTarget},
      "macros": {
        "protein": ${macros.protein},
        "carbs": ${macros.carbs},
        "fat": ${macros.fat}
      },
      "meals": {
        "breakfast": {
          "name": "High-Protein Breakfast Bowl",
          "calories": 400,
          "macros": { "protein": 25, "carbs": 35, "fat": 15 },
          "ingredients": ["2 eggs", "1 cup spinach", "1/2 avocado", "1 slice whole grain toast"],
          "instructions": "Scramble eggs with spinach, serve with sliced avocado and toast",
          "prepTime": "10 minutes",
          "cookTime": "5 minutes"
        },
        "lunch": {
          "name": "Grilled Chicken Salad",
          "calories": 500,
          "macros": { "protein": 35, "carbs": 25, "fat": 20 },
          "ingredients": ["4oz grilled chicken", "mixed greens", "cherry tomatoes", "cucumber"],
          "instructions": "Combine all ingredients with olive oil dressing",
          "prepTime": "15 minutes",
          "cookTime": "0 minutes"
        },
        "dinner": {
          "name": "Salmon with Quinoa",
          "calories": 600,
          "macros": { "protein": 40, "carbs": 45, "fat": 25 },
          "ingredients": ["5oz salmon fillet", "1 cup cooked quinoa", "steamed broccoli"],
          "instructions": "Bake salmon at 400°F for 15 minutes, serve with quinoa and vegetables",
          "prepTime": "10 minutes",
          "cookTime": "15 minutes"
        },
        "snack1": {
          "name": "Greek Yogurt with Berries",
          "calories": 150,
          "macros": { "protein": 15, "carbs": 15, "fat": 5 },
          "ingredients": ["1 cup Greek yogurt", "1/2 cup mixed berries"],
          "instructions": "Mix yogurt with berries",
          "prepTime": "2 minutes",
          "cookTime": "0 minutes"
        },
        "snack2": {
          "name": "Almonds and Apple",
          "calories": 200,
          "macros": { "protein": 8, "carbs": 20, "fat": 12 },
          "ingredients": ["1 medium apple", "1oz almonds"],
          "instructions": "Slice apple, serve with almonds",
          "prepTime": "2 minutes",
          "cookTime": "0 minutes"
        }
      }
    }
  },
  "shoppingList": [
    { "item": "Eggs", "quantity": "1 dozen", "category": "Dairy" },
    { "item": "Spinach", "quantity": "1 bag", "category": "Produce" },
    { "item": "Avocado", "quantity": "3 pieces", "category": "Produce" }
  ],
  "mealPrepTips": [
    "Cook quinoa in bulk at start of week",
    "Pre-wash and chop vegetables",
    "Marinate proteins overnight"
  ],
  "notes": "Adjust portion sizes based on hunger and activity level"
}

Generate a comprehensive plan for 7 days. Include variety in proteins, vegetables, and cooking methods. Keep meals practical and achievable.

CRITICAL: Response must be valid JSON only. No explanatory text, no markdown formatting, no code blocks. Just the raw JSON object starting with { and ending with }.`;
};

// Save the generated meal plan to Firestore
const saveMealPlanToFirestore = async (userId, mealPlanData, usage) => {
  try {
    // Create document ID
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '_');
    const mealPlanId = `${userId}_meals_${timestamp}_${Date.now()}`;

    // Prepare meal plan document
    const mealPlanDoc = {
      id: mealPlanId,
      userId: userId,
      type: 'ai_generated',

      // Core meal plan data from AI
      ...mealPlanData,

      // AI generation metadata
      generatedAt: serverTimestamp(),
      generatedBy: 'ai',
      aiPrompt: 'Personalized meal plan based on user profile and nutrition goals',

      // Usage tracking
      aiUsage: {
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        cost: usage.cost,
        model: usage.model
      },

      // Firestore metadata
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };

    // Save to Firestore
    const mealPlanRef = doc(db, 'meals', mealPlanId);
    await setDoc(mealPlanRef, mealPlanDoc);

    // Remove placeholder meal plan if it exists
    await removeMealPlanPlaceholder(userId);

    return {
      id: mealPlanId,
      ...mealPlanDoc
    };

  } catch (error) {
    console.error('❌ Error saving meal plan to Firestore:', error);
    throw error;
  }
};

// Remove placeholder meal plan after generating real one
const removeMealPlanPlaceholder = async (userId) => {
  try {
    const placeholderId = `${userId}_meals_placeholder`;
    const placeholderRef = doc(db, 'meals', placeholderId);

    // Mark as inactive instead of deleting
    await updateDoc(placeholderRef, {
      isActive: false,
      replacedAt: serverTimestamp()
    });
  } catch (error) {
    // Silently handle - placeholder may not exist
  }
};

// Cache AI response for future use
const cacheAIResponse = async (promptHash, userContext, aiResponse) => {
  try {
    const cacheDoc = {
      promptHash,
      userContext,
      requestType: 'meal_plan',
      response: aiResponse.data,

      // Usage tracking (with defaults to prevent undefined)
      tokensUsed: aiResponse.usage?.totalTokens || 0,
      cost: aiResponse.usage?.cost || 0,
      model: aiResponse.usage?.model || 'unknown',

      // Cache management
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      hitCount: 0
    };

    await addDoc(collection(db, 'aiCache'), cacheDoc);
  } catch (error) {
    console.warn('⚠️ Failed to cache AI response:', error);
    // Don't fail the main operation if caching fails
  }
};

// Validate meal plan data structure
const validateMealPlanData = (mealPlanData) => {
  const required = ['name', 'description', 'days'];
  const missing = required.filter(field => !mealPlanData[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required meal plan fields: ${missing.join(', ')}`);
  }

  if (!mealPlanData.days || Object.keys(mealPlanData.days).length === 0) {
    throw new Error('Meal plan must include at least one day');
  }

  return true;
};

export default generateMealPlan;
