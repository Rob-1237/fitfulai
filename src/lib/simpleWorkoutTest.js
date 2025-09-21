import { generateAIResponse } from './openai';

// Simple test function to debug the AI integration
export const testWorkoutGeneration = async (userProfile) => {
  console.log('🧪 Starting simple workout test for user:', userProfile.id);

  try {
    const simplePrompt = `Generate a simple workout plan for a ${userProfile.age}-year-old ${userProfile.gender} with ${userProfile.fitnessGoal} as their goal.

Return a JSON object with this structure:
{
  "name": "Simple Workout Plan",
  "description": "A basic workout plan",
  "difficulty": "beginner",
  "exercises": [
    {
      "name": "Push-ups",
      "sets": 3,
      "reps": "10"
    },
    {
      "name": "Squats",
      "sets": 3,
      "reps": "15"
    }
  ]
}`;

    console.log('🧪 About to call generateAIResponse...');

    const result = await generateAIResponse(simplePrompt, {
      max_tokens: 1000,
      temperature: 0.3
    });

    console.log('🧪 AI Response result:', result);

    return result;

  } catch (error) {
    console.error('🧪 Test failed:', error);
    return { success: false, error: error.message };
  }
};

export default testWorkoutGeneration;