import { z } from 'zod';

/**
 * Domain schemas — the single source of truth for the app's data shapes.
 *
 * These zod schemas serve triple duty:
 *  1. TypeScript types via z.infer<>
 *  2. Runtime validation of AI responses (strict, server-side — Day 4/5 of the rework)
 *  3. The OpenAI structured-output response format (schema-enforced JSON)
 *
 * Client code that reads *stored* Firestore documents should use the
 * `*Doc` types below, which tolerate legacy/partial data.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export const MacrosSchema = z.object({
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
});
export type Macros = z.infer<typeof MacrosSchema>;

export const WEEK_DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2'] as const;
export type MealType = (typeof MEAL_TYPES)[number];

/** Structural stand-in for a Firestore Timestamp, so this module stays
 *  usable from both the client SDK and firebase-admin (server). */
export interface TimestampLike {
  toDate(): Date;
  toMillis(): number;
}

// ---------------------------------------------------------------------------
// Meal plan
// ---------------------------------------------------------------------------

export const MealSchema = z.object({
  name: z.string(),
  calories: z.number(),
  macros: MacrosSchema,
  ingredients: z.array(z.string()),
  instructions: z.string(),
  prepTime: z.string(),
  cookTime: z.string(),
});
export type Meal = z.infer<typeof MealSchema>;

export const DayPlanSchema = z.object({
  /** YYYY-MM-DD */
  date: z.string(),
  totalCalories: z.number(),
  macros: MacrosSchema,
  meals: z.object({
    breakfast: MealSchema,
    lunch: MealSchema,
    dinner: MealSchema,
    snack1: MealSchema,
    snack2: MealSchema,
  }),
});
export type DayPlan = z.infer<typeof DayPlanSchema>;

export const ShoppingListItemSchema = z.object({
  item: z.string(),
  quantity: z.string(),
  category: z.string(),
});
export type ShoppingListItem = z.infer<typeof ShoppingListItemSchema>;

/** The complete AI-generated weekly meal plan. All 7 days are required —
 *  structured outputs guarantee this shape once generation moves server-side. */
export const MealPlanSchema = z.object({
  name: z.string(),
  description: z.string(),
  /** YYYY-MM-DD, the Sunday the plan starts on */
  weekStartDate: z.string(),
  totalCalories: z.number(),
  macroTargets: MacrosSchema,
  days: z.object({
    sunday: DayPlanSchema,
    monday: DayPlanSchema,
    tuesday: DayPlanSchema,
    wednesday: DayPlanSchema,
    thursday: DayPlanSchema,
    friday: DayPlanSchema,
    saturday: DayPlanSchema,
  }),
  shoppingList: z.array(ShoppingListItemSchema),
  mealPrepTips: z.array(z.string()),
  notes: z.string(),
});
export type MealPlan = z.infer<typeof MealPlanSchema>;

// ---------------------------------------------------------------------------
// Grocery list
// ---------------------------------------------------------------------------

export const GroceryItemSchema = z.object({
  item: z.string(),
  quantity: z.string(),
  estimatedCost: z.number(),
  notes: z.string(),
});
export type GroceryItem = z.infer<typeof GroceryItemSchema>;

export const GrocerySectionSchema = z.object({
  name: z.string(),
  items: z.array(GroceryItemSchema),
});
export type GrocerySection = z.infer<typeof GrocerySectionSchema>;

export const GroceryListSchema = z.object({
  name: z.string(),
  description: z.string(),
  /** YYYY-MM-DD */
  weekStartDate: z.string(),
  totalEstimatedCost: z.number(),
  /** Keyed by section slug: produce, proteins, dairy, pantry, frozen, ... */
  sections: z.record(z.string(), GrocerySectionSchema),
  shoppingTips: z.array(z.string()),
  budgetAlternatives: z.array(
    z.object({
      item: z.string(),
      alternative: z.string(),
      savings: z.string(),
    })
  ),
  mealPrepNotes: z.array(z.string()),
});
export type GroceryList = z.infer<typeof GroceryListSchema>;

// ---------------------------------------------------------------------------
// Stored Firestore documents (generated data + user-added state)
// ---------------------------------------------------------------------------

export interface AiUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  model: string;
}

interface GeneratedDocMeta {
  id: string;
  userId: string;
  type: string;
  generatedAt?: TimestampLike;
  generatedBy?: string;
  aiPrompt?: string;
  aiUsage?: AiUsage;
  isActive?: boolean;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
}

/** A meal as found in stored documents — legacy placeholder docs carry a
 *  `description` and may omit fields the strict schema requires. */
export type StoredMeal = Partial<Meal> & { description?: string };

/** A day's plan as stored — meals may be partial on legacy documents. */
export type StoredDayPlan = Partial<Omit<DayPlan, 'meals'>> & {
  meals?: Partial<Record<MealType, StoredMeal>>;
};

/** A meal plan as stored in `meals/{id}`. Legacy documents may be missing
 *  days or fields, so everything from the AI payload is Partial. */
export type MealPlanDoc = Omit<Partial<MealPlan>, 'days'> & GeneratedDocMeta & {
  days?: Partial<Record<WeekDay, StoredDayPlan>>;
  /** Legacy placeholder-document nutrition targets */
  targets?: { calories?: number; protein?: number; carbs?: number; fat?: number };
  skippedMeals?: string[];
};

/** An item the user added manually to a grocery list. */
export interface CustomGroceryItem {
  name: string;
  quantity: string;
  category?: string;
  estimatedCost?: number;
  addedAt?: string;
  isCustom?: boolean;
}

/** A grocery list as stored in `groceries/{id}`. */
export type GroceryListDoc = Partial<GroceryList> & GeneratedDocMeta & {
  /** Item names the user has checked off while shopping */
  checkedItems?: string[];
  /** Store sections the user has fully shopped */
  completedSections?: string[];
  isCompleted?: boolean;
  customItems?: CustomGroceryItem[];
  mealPlanId?: string;
  /** Legacy placeholder-document fields */
  items?: unknown[];
  estimatedTotal?: number;
};

// ---------------------------------------------------------------------------
// User profile
// ---------------------------------------------------------------------------

export const NUTRITION_GOALS = [
  'weight_loss',
  'muscle_gain',
  'general_fitness',
  'endurance',
  'strength',
] as const;
export type NutritionGoal = (typeof NUTRITION_GOALS)[number];

export const ACTIVITY_LEVELS = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active',
] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

export interface UserPreferences {
  mealComplexity?: string;
  cuisinePreferences?: string[];
  budgetRange?: string;
}

/** The `users/{uid}` document. Most fields are optional because the document
 *  is created skeletal at signup and filled in by onboarding. */
export interface UserProfile {
  id?: string;
  uid?: string;
  email?: string | null;
  name?: string;

  // Physical stats (from onboarding)
  age?: number | null;
  gender?: 'male' | 'female' | 'other' | null;
  unitsPreference?: 'imperial' | 'metric';
  weightLbs?: number | null;
  weightKg?: number | null;
  heightInches?: number | null;
  heightCm?: number | null;

  /** Stored under the legacy `fitnessGoal` field name; the UI presents this
   *  as "nutrition goal". Do not rename — existing documents depend on it. */
  fitnessGoal?: NutritionGoal | null;
  activityLevel?: ActivityLevel | null;

  // Calculated targets (Mifflin-St Jeor, client-side)
  bmr?: number | null;
  tdee?: number | null;
  calorieTarget?: number;
  macros?: Macros;

  // Dietary preferences
  dietaryPreferences?: string[];
  allergies?: string[];
  defaultServingSize?: number;

  // Status & usage tracking
  onboardingCompleted?: boolean;
  aiGenerationsUsed?: number;
  regenerationsThisWeek?: number | null;
  regenerationResetDate?: string | null;
  weeklyRegenerationLimit?: number;
  tier?: string;

  preferences?: UserPreferences;
  timezone?: string;
  budgetPreference?: string;

  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
}

// ---------------------------------------------------------------------------
// Agent loop (generate → validate → critique → revise)
// ---------------------------------------------------------------------------

export type ViolationRule = 'calories' | 'macros' | 'allergen' | 'diet';

export interface Violation {
  rule: ViolationRule;
  severity: 'error' | 'warn';
  /** Human-readable description fed back to the model as critique */
  detail: string;
}

export interface AgentStep {
  attempt: number;
  action: 'generate' | 'validate' | 'revise';
  violations: Violation[];
  durationMs: number;
}

export interface AgentTrace {
  steps: AgentStep[];
  attempts: number;
  outcome: 'clean' | 'best-effort';
}

// ---------------------------------------------------------------------------
// Generation results (shared shape returned by the generator layer)
// ---------------------------------------------------------------------------

export type GenerationResult<T> =
  | {
      success: true;
      data: T;
      cached: boolean;
      source: 'cache' | 'ai';
      usage?: AiUsage;
      duration?: number;
    }
  | {
      success: false;
      error: string;
      code?: string;
    };
