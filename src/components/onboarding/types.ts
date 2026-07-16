import type { ActivityLevel, Macros, NutritionGoal, UserProfile } from '../../shared/schemas';

/** Draft data collected across the onboarding wizard steps.
 *  Also persisted to localStorage under 'onboarding_draft'. */
export interface OnboardingData {
  // Step 1: Basic Info
  age: number | null;
  gender: '' | 'male' | 'female' | 'other';
  unitsPreference: 'imperial' | 'metric';

  // Step 2: Physical Stats
  heightFeet: number | null;
  heightInches: number | null;
  heightCm: number | null;
  weightLbs: number | null;
  weightKg: number | null;
  /** Mirror fields kept in sync for the Firestore profile shape */
  heightCentimeters?: number | null;
  weightKgs?: number | null;

  // Step 3: Nutrition Goals (legacy field name: fitnessGoal)
  fitnessGoal: NutritionGoal | '';
  activityLevel: ActivityLevel | '';

  // Step 4: Dietary Preferences
  dietaryPreferences: string[];
  allergies: string[];
  mealPreferences: string[];

  // Calculated values (Step 5)
  bmr: number | null;
  tdee: number | null;
  calorieTarget: number | null;
  macros: Macros | null;

  // Set once the wizard completes
  onboardingCompleted?: boolean;

  // Draft persistence metadata
  lastSaved?: number;
  currentStep?: number;
}

/** Props passed by OnboardingWizard to every step component. */
export interface StepProps {
  data: OnboardingData;
  updateData: (stepData: Partial<OnboardingData>) => void;
  onNext: () => void;
  onSkip: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  /** Called by ReviewStep with the completed profile to kick off generation */
  onComplete: (profile: UserProfile) => void;
}
