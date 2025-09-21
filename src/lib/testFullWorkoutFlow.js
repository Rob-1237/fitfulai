import { generateWorkout } from './workoutGenerator.js';

// Test the complete workout generation flow
export const testFullWorkoutFlow = async () => {
  console.log('🧪 Starting full workout generation flow test...');

  // Mock user profile (similar to what an onboarded user would have)
  const mockUserProfile = {
    id: 'test_user_' + Date.now(),
    age: 35,
    gender: 'male',
    fitnessGoal: 'weight_loss',
    activityLevel: 'moderately_active',
    weightLbs: 180,
    heightInches: 70,
    preferences: {
      workoutDays: ['Monday', 'Wednesday', 'Friday']
    }
  };

  try {
    console.log('🧪 Calling generateWorkout with profile:', mockUserProfile);

    const result = await generateWorkout(mockUserProfile, 'weekly');

    console.log('🧪 Full workout generation result:', {
      success: result.success,
      cached: result.cached,
      source: result.source,
      hasData: !!result.data,
      dataKeys: result.data ? Object.keys(result.data) : [],
      error: result.error
    });

    if (result.success && result.data) {
      console.log('✅ Full workout flow test PASSED!');
      console.log('📋 Generated workout:', {
        name: result.data.name,
        difficulty: result.data.difficulty,
        weekCount: result.data.weeks?.length,
        totalDays: result.data.weeks?.reduce((total, week) => total + week.days?.length, 0)
      });
      return { success: true, result };
    } else {
      console.log('❌ Full workout flow test FAILED:', result.error);
      return { success: false, error: result.error };
    }

  } catch (error) {
    console.error('❌ Full workout flow test CRASHED:', error);
    return { success: false, error: error.message };
  }
};

// Export for console testing
window.testFullWorkoutFlow = testFullWorkoutFlow;

export default testFullWorkoutFlow;