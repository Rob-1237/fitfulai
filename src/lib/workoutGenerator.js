import { generateAIResponse, estimatePromptCost } from './openai';
import { getCachedResponse } from './firestoreQueries';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';

// Generate a comprehensive workout plan using AI
export const generateWorkout = async (userProfile, workoutType = 'weekly') => {
  const userId = userProfile.id || userProfile.uid || 'unknown';
  console.log('<� Starting workout generation for user:', userProfile.id);

  try {
    // Create prompt hash for caching (simple string hash)
    const promptContext = {
      userId: userId,
      type: 'workout',
      userData: {
        age: userProfile.age,
        gender: userProfile.gender,
        fitnessGoal: userProfile.fitnessGoal,
        activityLevel: userProfile.activityLevel,
        weightLbs: userProfile.weightLbs,
        heightInches: userProfile.heightInches
      },
      workoutType
    };

    const promptHash = btoa(JSON.stringify(promptContext)).slice(0, 32);

    // Check cache first
    console.log('🔍 Checking AI cache for existing workout...');

    let cachedResponse = null;
    try {
      cachedResponse = await getCachedResponse(promptHash, { userId: userId });
      console.log('🔍 Cache check completed:', !!cachedResponse);
    } catch (cacheError) {
      console.warn('⚠️ Cache check failed, proceeding without cache:', cacheError.message);
    }

    if (cachedResponse) {
      console.log(' Found cached workout, using existing data');
      return {
        success: true,
        data: cachedResponse.response,
        cached: true,
        source: 'cache'
      };
    }

    // Build comprehensive AI prompt
    const prompt = buildWorkoutPrompt(userProfile, workoutType);

    // Estimate cost before making the call
    const costEstimate = estimatePromptCost(prompt, 3000);
    console.log('=� Estimated cost:', `$${costEstimate.estimatedCost.toFixed(4)}`);

    // Generate workout with AI
    console.log('> Generating new workout with AI...');
    const aiResponse = await generateAIResponse(prompt, {
      max_tokens: 8000, // Increased for comprehensive 4-week plan
      temperature: 0.4 // Slightly higher for workout creativity
    });

    if (!aiResponse.success) {
      console.error('L AI generation failed:', aiResponse.error);
      return {
        success: false,
        error: aiResponse.error,
        code: aiResponse.code
      };
    }

    // Validate the AI response
    validateWorkoutData(aiResponse.data);

    // Cache the AI response
    await cacheAIResponse(promptHash, promptContext, aiResponse);

    // Process and save the workout
    const processedWorkout = await saveWorkoutToFirestore(userId, aiResponse.data, aiResponse.usage);

    console.log(' Workout generation completed successfully');

    return {
      success: true,
      data: processedWorkout,
      cached: false,
      source: 'ai',
      usage: aiResponse.usage,
      duration: aiResponse.duration
    };

  } catch (error) {
    console.error('L Workout generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate workout',
      code: 'GENERATION_ERROR'
    };
  }
};

// Build the AI prompt for workout generation
const buildWorkoutPrompt = (userProfile, workoutType) => {
  const {
    age,
    gender,
    fitnessGoal,
    activityLevel,
    weightLbs,
    heightInches,
    preferences = {}
  } = userProfile;

  return `Generate a personalized ${workoutType} workout plan for a ${age}-year-old ${gender}.

USER PROFILE:
- Fitness Goal: ${fitnessGoal}
- Activity Level: ${activityLevel}
- Weight: ${weightLbs} lbs
- Height: ${heightInches} inches
- Workout Preferences: ${preferences.workoutDays?.join(', ') || 'Monday, Wednesday, Friday'}

REQUIREMENTS:
1. Create a structured workout plan appropriate for their fitness level
2. Include exercise progression and variety
3. Consider their fitness goal (${fitnessGoal})
4. Provide clear instructions and safety notes
5. Include rest days and recovery guidance

RESPONSE FORMAT:
IMPORTANT: Return ONLY a valid JSON object with this exact structure. Do NOT include any text before or after the JSON. Ensure all strings are properly quoted and no trailing commas exist:

{
  "name": "Descriptive workout plan name",
  "description": "Brief description of the workout approach",
  "difficulty": "beginner",
  "estimatedDuration": "Total weekly time commitment like 3 hours",
  "equipment": ["bodyweight", "dumbbells", "resistance_band"],
  "tags": ["strength", "cardio", "beginner"],
  "weeks": [
    {
      "weekNumber": 1,
      "days": [
        {
          "dayNumber": 1,
          "dayName": "monday",
          "restDay": false,
          "exercises": [
            {
              "name": "Push-ups",
              "category": "strength",
              "muscleGroups": ["chest", "triceps", "shoulders"],
              "sets": 3,
              "reps": "8-12",
              "duration": null,
              "restBetweenSets": "60s",
              "instructions": "Keep body straight, lower chest to floor, push up explosively",
              "equipment": ["bodyweight"],
              "difficulty": "beginner",
              "modifications": "Knee push-ups for easier, decline push-ups for harder"
            }
          ]
        },
        {
          "dayNumber": 2,
          "dayName": "tuesday",
          "restDay": true,
          "exercises": []
        }
      ]
    }
  ],
  "progress": {
    "completedWorkouts": 0,
    "totalWorkouts": 6,
    "weeklyStreak": 0,
    "lastWorkoutDate": null
  },
  "notes": "Important safety notes and tips"
}

Generate a comprehensive plan with 2 weeks of progression. Include both strength and cardio exercises appropriate for their goal. Make sure to include rest days. Keep the response concise but complete.

CRITICAL: Response must be valid JSON only. No explanatory text, no markdown formatting, no code blocks. Just the raw JSON object starting with { and ending with }.`;
};

// Save the generated workout to Firestore
const saveWorkoutToFirestore = async (userId, workoutData, usage) => {
  try {
    // Create document ID
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '_');
    const workoutId = `${userId}_workout_${timestamp}_${Date.now()}`;

    // Prepare workout document
    const workoutDoc = {
      id: workoutId,
      userId: userId,
      type: 'ai_generated',

      // Core workout data from AI
      ...workoutData,

      // AI generation metadata
      generatedAt: serverTimestamp(),
      generatedBy: 'ai',
      aiPrompt: 'Personalized workout based on user profile',

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
    const workoutRef = doc(db, 'workouts', workoutId);
    await setDoc(workoutRef, workoutDoc);

    // Remove placeholder workout if it exists
    await removeWorkoutPlaceholder(userId);

    console.log('=� Workout saved to Firestore:', workoutId);

    return {
      id: workoutId,
      ...workoutDoc
    };

  } catch (error) {
    console.error('L Error saving workout to Firestore:', error);
    throw error;
  }
};

// Remove placeholder workout after generating real one
const removeWorkoutPlaceholder = async (userId) => {
  try {
    const placeholderId = `${userId}_workout_placeholder`;
    const placeholderRef = doc(db, 'workouts', placeholderId);

    // Mark as inactive instead of deleting (preserve for reference)
    await updateDoc(placeholderRef, {
      isActive: false,
      replacedAt: serverTimestamp()
    });

    console.log('=� Placeholder workout marked as inactive');
  } catch (error) {
    console.log('9 No placeholder workout to remove (this is fine)');
  }
};

// Cache AI response for future use
const cacheAIResponse = async (promptHash, userContext, aiResponse) => {
  try {
    const cacheDoc = {
      promptHash,
      userContext,
      requestType: 'workout',
      response: aiResponse.data,

      // Usage tracking
      tokensUsed: aiResponse.usage.totalTokens,
      cost: aiResponse.usage.cost,
      model: aiResponse.usage.model,

      // Cache management
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      hitCount: 0
    };

    await addDoc(collection(db, 'aiCache'), cacheDoc);
    console.log('=� AI response cached for future use');

  } catch (error) {
    console.warn('� Failed to cache AI response:', error);
    // Don't fail the main operation if caching fails
  }
};

// Validate workout data structure
const validateWorkoutData = (workoutData) => {
  const required = ['name', 'description', 'difficulty', 'weeks'];
  const missing = required.filter(field => !workoutData[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required workout fields: ${missing.join(', ')}`);
  }

  if (!Array.isArray(workoutData.weeks) || workoutData.weeks.length === 0) {
    throw new Error('Workout must include at least one week');
  }

  return true;
};

export default generateWorkout;