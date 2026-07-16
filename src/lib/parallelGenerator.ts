import { generateMealPlan } from './mealGenerator';
import { generateGroceryList } from './groceryGenerator';
import type {
  GenerationResult,
  GroceryListDoc,
  MealPlanDoc,
  UserProfile,
} from '../shared/schemas';

export type GenerationStepId = 'meals' | 'groceries';

export type GenerationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'retrying';

export interface GenerationProgress {
  step: GenerationStepId;
  status: GenerationStatus;
  data?: { name?: string; error?: string } | null;
  timestamp: string;
}

export type ProgressCallback = (progress: GenerationProgress) => void;

interface GenerationError {
  type: GenerationStepId;
  error: string;
}

interface PlanResults {
  meals: GenerationResult<MealPlanDoc> | null;
  groceries: GenerationResult<GroceryListDoc> | null;
  errors: GenerationError[];
  totalCost: number;
  totalDuration: number;
}

export interface CompletePlanResult {
  success: boolean;
  error?: string;
  results: PlanResults;
  summary: {
    successful: number;
    failed: number;
    totalCost: number;
    totalDuration: number;
    completedAt: string;
  };
}

// Parallel AI generation orchestrator with progress tracking and retry logic
export const generateCompleteUserPlan = async (
  userProfile: UserProfile,
  onProgress: ProgressCallback = () => {},
  forceRefresh = false
): Promise<CompletePlanResult> => {
  const results: PlanResults = {
    meals: null,
    groceries: null,
    errors: [],
    totalCost: 0,
    totalDuration: 0,
  };

  // Progress tracking
  const updateProgress = (
    step: GenerationStepId,
    status: GenerationStatus,
    data: GenerationProgress['data'] = null
  ) => {
    onProgress({
      step,
      status,
      data,
      timestamp: new Date().toISOString(),
    });
  };

  // Initialize progress for all steps
  updateProgress('meals', 'pending');
  updateProgress('groceries', 'pending');

  try {
    const startTime = Date.now();

    const mealPlanPromise = (async () => {
      updateProgress('meals', 'in_progress');
      try {
        const result = await generateMealPlan(userProfile, 'weekly', forceRefresh);
        if (result.success) {
          updateProgress('meals', 'completed', { name: result.data.name });
          results.meals = result;
          results.totalCost += result.usage?.cost || 0;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('❌ Meal plan generation failed:', error);
        updateProgress('meals', 'failed', { error: message });
        results.errors.push({ type: 'meals', error: message });
        throw error;
      }
    })();

    // Grocery list generation that waits for meal plan
    const groceryPromise = (async () => {
      updateProgress('groceries', 'in_progress');
      try {
        // Wait for meal plan to complete first
        await mealPlanPromise;

        const mealPlan = results.meals?.success ? results.meals.data : null;
        const result = await generateGroceryList(userProfile, mealPlan, forceRefresh);

        if (result.success) {
          updateProgress('groceries', 'completed', { name: result.data.name });
          results.groceries = result;
          results.totalCost += result.usage?.cost || 0;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('❌ Grocery list generation failed:', error);
        updateProgress('groceries', 'failed', { error: message });
        results.errors.push({ type: 'groceries', error: message });
        throw error;
      }
    })();

    // Wait for all generations to complete (with individual error handling)
    const settledResults = await Promise.allSettled([mealPlanPromise, groceryPromise]);

    results.totalDuration = Date.now() - startTime;

    // Check results and handle partial failures
    const failedGenerations = settledResults.filter((result) => result.status === 'rejected');

    if (failedGenerations.length > 0) {
      // Retry logic for failed generations
      const retryResults = await retryFailedGenerations(userProfile, results, onProgress, forceRefresh);
      Object.assign(results, retryResults);
    }

    // Final summary
    const successful = [results.meals, results.groceries].filter((r) => r?.success).length;

    return {
      success: results.errors.length === 0,
      results,
      summary: {
        successful,
        failed: results.errors.length,
        totalCost: results.totalCost,
        totalDuration: results.totalDuration,
        completedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('❌ Critical error in parallel generation:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      results,
      summary: {
        successful: 0,
        failed: 2,
        totalCost: results.totalCost,
        totalDuration: 0,
        completedAt: new Date().toISOString(),
      },
    };
  }
};

// Retry logic for failed generations
const retryFailedGenerations = async (
  userProfile: UserProfile,
  currentResults: PlanResults,
  onProgress: ProgressCallback,
  forceRefresh = false,
  maxRetries = 2
): Promise<PlanResults> => {
  const retryResults: PlanResults = { ...currentResults };

  for (const generationError of currentResults.errors) {
    const { type } = generationError;
    onProgress({ step: type, status: 'retrying', timestamp: new Date().toISOString() });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        let result: GenerationResult<MealPlanDoc> | GenerationResult<GroceryListDoc>;

        switch (type) {
          case 'meals':
            result = await generateMealPlan(userProfile, 'weekly', forceRefresh);
            break;
          case 'groceries': {
            const mealPlan = retryResults.meals?.success ? retryResults.meals.data : null;
            result = await generateGroceryList(userProfile, mealPlan, forceRefresh);
            break;
          }
          default:
            continue;
        }

        if (result.success) {
          onProgress({
            step: type,
            status: 'completed',
            data: { name: result.data.name },
            timestamp: new Date().toISOString(),
          });

          if (type === 'meals') {
            retryResults.meals = result as GenerationResult<MealPlanDoc>;
          } else {
            retryResults.groceries = result as GenerationResult<GroceryListDoc>;
          }
          retryResults.totalCost += result.usage?.cost || 0;

          // Remove this error from the errors array
          retryResults.errors = retryResults.errors.filter((e) => e.type !== type);
          break;
        } else {
          if (attempt === maxRetries) {
            onProgress({
              step: type,
              status: 'failed',
              data: { error: result.error },
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (retryError) {
        if (attempt === maxRetries) {
          onProgress({
            step: type,
            status: 'failed',
            data: { error: retryError instanceof Error ? retryError.message : String(retryError) },
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  }

  return retryResults;
};

// Helper function to get generation progress steps
export const getGenerationSteps = () => [
  { id: 'meals' as const, name: 'Meal Plan', description: 'Designing nutrition-focused meal schedules' },
  { id: 'groceries' as const, name: 'Grocery List', description: 'Organizing efficient shopping lists' },
];

export default generateCompleteUserPlan;
