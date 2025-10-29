import { generateMealPlan } from './mealGenerator';
import { generateGroceryList } from './groceryGenerator';

// Parallel AI generation orchestrator with progress tracking and retry logic
export const generateCompleteUserPlan = async (userProfile, onProgress = () => {}) => {
  console.log('🚀 Starting complete plan generation for user:', userProfile.id);

  const results = {
    meals: null,
    groceries: null,
    errors: [],
    totalCost: 0,
    totalDuration: 0
  };

  // Progress tracking
  const updateProgress = (step, status, data = null) => {
    const progress = {
      step,
      status, // 'pending', 'in_progress', 'completed', 'failed', 'retrying'
      data,
      timestamp: new Date().toISOString()
    };
    console.log(`📊 Progress Update:`, progress);
    onProgress(progress);
  };

  // Initialize progress for all steps
  updateProgress('meals', 'pending');
  updateProgress('groceries', 'pending');

  try {
    const startTime = Date.now();

    // Start meal plan generation
    console.log('🔄 Starting parallel AI generations...');

    const mealPlanPromise = (async () => {
      updateProgress('meals', 'in_progress');
      try {
        const result = await generateMealPlan(userProfile);
        if (result.success) {
          updateProgress('meals', 'completed', { name: result.data.name });
          results.meals = result;
          results.totalCost += result.usage?.cost || 0;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('❌ Meal plan generation failed:', error);
        updateProgress('meals', 'failed', { error: error.message });
        results.errors.push({ type: 'meals', error: error.message });
        throw error;
      }
    })();

    // Grocery list generation that waits for meal plan
    const groceryPromise = (async () => {
      updateProgress('groceries', 'in_progress');
      try {
        // Wait for meal plan to complete first
        await mealPlanPromise;

        const mealPlan = results.meals?.data;
        const result = await generateGroceryList(userProfile, mealPlan);

        if (result.success) {
          updateProgress('groceries', 'completed', { name: result.data.name });
          results.groceries = result;
          results.totalCost += result.usage?.cost || 0;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('❌ Grocery list generation failed:', error);
        updateProgress('groceries', 'failed', { error: error.message });
        results.errors.push({ type: 'groceries', error: error.message });
        throw error;
      }
    })();

    const generationPromises = [mealPlanPromise, groceryPromise];

    // Wait for all generations to complete (with individual error handling)
    const settledResults = await Promise.allSettled(generationPromises);

    results.totalDuration = Date.now() - startTime;

    // Check results and handle partial failures
    const failedGenerations = settledResults.filter(result => result.status === 'rejected');
    const successfulGenerations = settledResults.filter(result => result.status === 'fulfilled');

    console.log(`✅ Completed ${successfulGenerations.length}/2 generations`);
    console.log(`❌ Failed ${failedGenerations.length}/2 generations`);

    if (failedGenerations.length > 0) {
      console.log('🔄 Attempting retries for failed generations...');

      // Retry logic for failed generations
      const retryResults = await retryFailedGenerations(userProfile, results, onProgress);
      Object.assign(results, retryResults);
    }

    // Final summary
    const finalResults = {
      success: results.errors.length === 0,
      results,
      summary: {
        successful: Object.keys(results).filter(key =>
          key !== 'errors' && key !== 'totalCost' && key !== 'totalDuration' && results[key]?.success
        ).length,
        failed: results.errors.length,
        totalCost: results.totalCost,
        totalDuration: results.totalDuration,
        completedAt: new Date().toISOString()
      }
    };

    console.log('🎉 Complete plan generation finished:', finalResults.summary);

    return finalResults;

  } catch (error) {
    console.error('❌ Critical error in parallel generation:', error);

    return {
      success: false,
      error: error.message,
      results,
      summary: {
        successful: 0,
        failed: 2,
        totalCost: results.totalCost,
        totalDuration: Date.now() - (results.startTime || Date.now()),
        completedAt: new Date().toISOString()
      }
    };
  }
};

// Retry logic for failed generations
const retryFailedGenerations = async (userProfile, currentResults, onProgress, maxRetries = 2) => {
  const retryResults = { ...currentResults };

  for (const error of currentResults.errors) {
    const { type } = error;

    console.log(`🔄 Retrying ${type} generation...`);
    onProgress({ step: type, status: 'retrying', timestamp: new Date().toISOString() });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        let result;

        switch (type) {
          case 'meals':
            result = await generateMealPlan(userProfile);
            break;
          case 'groceries':
            const mealPlan = retryResults.meals?.data;
            result = await generateGroceryList(userProfile, mealPlan);
            break;
          default:
            continue;
        }

        if (result.success) {
          console.log(`✅ ${type} retry attempt ${attempt} succeeded`);
          onProgress({
            step: type,
            status: 'completed',
            data: { name: result.data.name },
            timestamp: new Date().toISOString()
          });

          retryResults[type] = result;
          retryResults.totalCost += result.usage?.cost || 0;

          // Remove this error from the errors array
          retryResults.errors = retryResults.errors.filter(e => e.type !== type);
          break;
        } else {
          console.log(`❌ ${type} retry attempt ${attempt} failed:`, result.error);
          if (attempt === maxRetries) {
            onProgress({
              step: type,
              status: 'failed',
              data: { error: result.error },
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (retryError) {
        console.log(`❌ ${type} retry attempt ${attempt} crashed:`, retryError.message);
        if (attempt === maxRetries) {
          onProgress({
            step: type,
            status: 'failed',
            data: { error: retryError.message },
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }

  return retryResults;
};

// Helper function to check if user has complete plans
export const hasCompletePlans = (user) => {
  // This would check Firestore for existing meal and grocery plans
  // Return true if user has both, false otherwise
  // Implementation depends on your data structure
  return false; // Placeholder
};

// Helper function to get generation progress steps
export const getGenerationSteps = () => [
  { id: 'meals', name: 'Meal Plan', description: 'Designing nutrition-focused meal schedules' },
  { id: 'groceries', name: 'Grocery List', description: 'Organizing efficient shopping lists' }
];

export default generateCompleteUserPlan;