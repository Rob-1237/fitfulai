import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Clock, Flame, CalendarDays, PieChart } from 'lucide-react';
import { getUserMealPlans, getCurrentWeekData, getWeekData } from '../../lib/firestoreQueries';
import { useAuth } from '../../hooks/useAuth';
import { useWeekContext } from '../../hooks/useWeekContext';
import { useToast } from '../ui/ToastProvider';
import WeekSelector from '../ui/WeekSelector';
import RecipeDetailModal from '../modals/RecipeDetailModal';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { WEEK_DAYS } from '../../shared/schemas';
import type { MealPlanDoc, MealType, StoredMeal, WeekDay } from '../../shared/schemas';
import type { WeekData } from '../../lib/firestoreQueries';

/** Today's meals, tolerating both the current shape (days.<day>.meals.<type>)
 *  and the legacy placeholder shape that nests one level deeper. */
type TodayMeals = Partial<Record<MealType, StoredMeal>> & {
  meals?: Partial<Record<MealType, StoredMeal>>;
};

export default function MealsContent({ isDark }: { isDark: boolean }) {
  const location = useLocation();
  const { user, userProfile } = useAuth();
  const { addToast } = useToast();

  // Helper function to round nutrition values for clean display
  const roundNutrition = (value: number | string | undefined): number | string => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? value : Math.round(parsed);
    }
    return Math.round(value || 0);
  };

  // Week navigation context
  const weekContext = useWeekContext('sunday');
  const {
    selectedWeek,
    isCurrentWeek,
    isPastWeek,
    isFutureWeek,
    weekDisplay,
    canGoToPrevWeek,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
    getDaysRemainingInPlan,
    canGeneratePlan
  } = weekContext;

  const [mealPlans, setMealPlans] = useState<MealPlanDoc[]>([]);
  const [currentWeekData, setCurrentWeekData] = useState<WeekData | null>(null);
  const [selectedWeekData, setSelectedWeekData] = useState<WeekData | null>(null); // Data for selected week
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWeek, setIsLoadingWeek] = useState(false); // Loading for week changes
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlanDoc | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<StoredMeal | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [skippedMeals, setSkippedMeals] = useState<string[]>([]);

  useEffect(() => {
    const fetchMeals = async () => {
      if (!user?.uid) return;

      setIsLoading(true);
      try {
        // Bypass cache to get fresh data after generation
        const [userMealPlans, weekData] = await Promise.all([
          getUserMealPlans(user.uid, { bypassCache: true }),
          getCurrentWeekData(user.uid)
        ]);

        setMealPlans(userMealPlans);
        setCurrentWeekData(weekData);
      } catch (error) {
        console.error('❌ Error loading meals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeals();
  }, [user?.uid, location.pathname, location.key]);

  // Load skipped meals from Firestore
  useEffect(() => {
    const loadSkippedMeals = async () => {
      const currentMealPlan = currentWeekData?.mealPlan || mealPlans[0];
      if (!currentMealPlan?.id) return;

      try {
        const mealDoc = await getDoc(doc(db, 'meals', currentMealPlan.id));
        if (mealDoc.exists()) {
          const data = mealDoc.data();
          setSkippedMeals(data.skippedMeals || []);
        }
      } catch (error) {
        console.error('Error loading skipped meals:', error);
      }
    };

    loadSkippedMeals();
  }, [currentWeekData, mealPlans]);

  // Fetch data for selected week when week changes
  useEffect(() => {
    const fetchSelectedWeekData = async () => {
      if (!user?.uid || !selectedWeek) return;

      setIsLoadingWeek(true);
      try {
        const weekData = await getWeekData(user.uid, selectedWeek);
        setSelectedWeekData(weekData);
      } catch (error) {
        console.error('❌ Error fetching selected week data:', error);
      } finally {
        setIsLoadingWeek(false);
      }
    };

    fetchSelectedWeekData();
  }, [user?.uid, selectedWeek]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-6 w-6 text-orange-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading your meal plans...</span>
        </div>
      </div>
    );
  }

  if (!mealPlans.length) {
    return (
      <div className="text-center py-12">
        <UtensilsCrossed className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
        <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          No meal plans found
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Your personalized meal plans will appear here once generated.
        </p>
      </div>
    );
  }

  const currentMealPlan = currentWeekData?.mealPlan || mealPlans[0];

  // Use current week's data when viewing current week, otherwise use selected week's data (or null for empty state)
  const displayedMealPlan = isCurrentWeek ? currentMealPlan : (selectedWeekData?.mealPlan || null);
  const isPlaceholder = displayedMealPlan?.generatedBy === 'system' || displayedMealPlan?.aiPrompt === 'Placeholder meal plan';

  // Get today's meals (only relevant when viewing current week)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as WeekDay;
  const todaysMeals: TodayMeals = currentMealPlan?.days?.[today]?.meals || {};

  // Get all days for the displayed week
  const displayedWeekMeals = WEEK_DAYS.map(day => ({
    day,
    dayName: day.charAt(0).toUpperCase() + day.slice(1),
    meals: displayedMealPlan?.days?.[day]?.meals || null
  }));

  // Handler to open recipe detail modal
  const handleRecipeClick = (recipe: StoredMeal | undefined, mealType: MealType) => {
    if (!recipe) return;
    setSelectedRecipe(recipe);
    setSelectedMealType(mealType);
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
    setSelectedMealType(null);
  };

  // Meal time windows for dimming logic
  const mealTimeRanges: Record<MealType, { end: number }> = {
    breakfast: { end: 11 },  // Dim after 11am
    lunch: { end: 15 },      // Dim after 3pm
    dinner: { end: 22 },     // Dim after 10pm
    snack1: { end: 12 },     // Morning snack
    snack2: { end: 17 }      // Afternoon snack
  };

  // Check if a meal is in the past based on current time
  const isMealPast = (mealType: MealType) => {
    const now = new Date();
    const currentHour = now.getHours();
    const endHour = mealTimeRanges[mealType]?.end || 24;
    return currentHour >= endHour;
  };

  // Toggle meal skipped status
  const toggleMealSkipped = async (mealType: MealType, day: WeekDay = today) => {
    if (!currentMealPlan?.id) return;

    const mealKey = `${day}-${mealType}`;
    const isCurrentlySkipped = skippedMeals.includes(mealKey);

    const updatedSkippedMeals = isCurrentlySkipped
      ? skippedMeals.filter(m => m !== mealKey)
      : [...skippedMeals, mealKey];

    try {
      // Update Firestore
      const mealRef = doc(db, 'meals', currentMealPlan.id);
      await updateDoc(mealRef, {
        skippedMeals: updatedSkippedMeals,
        updatedAt: new Date()
      });

      // Update local state
      setSkippedMeals(updatedSkippedMeals);

      addToast(
        isCurrentlySkipped
          ? 'Meal marked as eaten'
          : 'Meal marked as skipped',
        'success'
      );
    } catch (error) {
      console.error('Error toggling meal skipped:', error);
      addToast('Failed to update meal status', 'error');
    }
  };

  // Calculate today's nutrition for progress tracking (only when viewing current week)
  const calculateTodayNutrition = () => {
    if (!isCurrentWeek || !todaysMeals) {
      return {
        plannedCalories: 0,
        plannedProtein: 0,
        plannedCarbs: 0,
        plannedFat: 0,
        actualCalories: 0,
        actualProtein: 0,
        actualCarbs: 0,
        actualFat: 0
      };
    }

    // Calculate planned macros from today's meals (all meals for the day)
    const plannedCalories = (todaysMeals.breakfast?.calories || 0) +
      (todaysMeals.lunch?.calories || 0) +
      (todaysMeals.dinner?.calories || 0) +
      (todaysMeals.snack1?.calories || 0) +
      (todaysMeals.snack2?.calories || 0);

    const plannedProtein = (todaysMeals.breakfast?.macros?.protein || 0) +
      (todaysMeals.lunch?.macros?.protein || 0) +
      (todaysMeals.dinner?.macros?.protein || 0) +
      (todaysMeals.snack1?.macros?.protein || 0) +
      (todaysMeals.snack2?.macros?.protein || 0);

    const plannedCarbs = (todaysMeals.breakfast?.macros?.carbs || 0) +
      (todaysMeals.lunch?.macros?.carbs || 0) +
      (todaysMeals.dinner?.macros?.carbs || 0) +
      (todaysMeals.snack1?.macros?.carbs || 0) +
      (todaysMeals.snack2?.macros?.carbs || 0);

    const plannedFat = (todaysMeals.breakfast?.macros?.fat || 0) +
      (todaysMeals.lunch?.macros?.fat || 0) +
      (todaysMeals.dinner?.macros?.fat || 0) +
      (todaysMeals.snack1?.macros?.fat || 0) +
      (todaysMeals.snack2?.macros?.fat || 0);

    // Calculate actual macros (only count meals that have passed their time AND haven't been skipped)
    const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2'];
    let actualCalories = 0;
    let actualProtein = 0;
    let actualCarbs = 0;
    let actualFat = 0;

    mealTypes.forEach(mealType => {
      const meal = todaysMeals[mealType];
      const isPast = isMealPast(mealType);
      const isSkipped = skippedMeals.includes(`${today}-${mealType}`);

      // Only count meals that have passed their time AND haven't been skipped
      if (meal && isPast && !isSkipped) {
        actualCalories += meal.calories || 0;
        actualProtein += meal.macros?.protein || 0;
        actualCarbs += meal.macros?.carbs || 0;
        actualFat += meal.macros?.fat || 0;
      }
    });

    return {
      plannedCalories,
      plannedProtein,
      plannedCarbs,
      plannedFat,
      actualCalories,
      actualProtein,
      actualCarbs,
      actualFat
    };
  };

  const todayNutrition = calculateTodayNutrition();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Week Navigation */}
      <WeekSelector
        weekDisplay={weekDisplay}
        isCurrentWeek={isCurrentWeek}
        isPastWeek={isPastWeek}
        isFutureWeek={isFutureWeek}
        canGoToPrevWeek={canGoToPrevWeek}
        goToNextWeek={goToNextWeek}
        goToPrevWeek={goToPrevWeek}
        goToCurrentWeek={goToCurrentWeek}
        isDark={isDark}
      />

      {/* Generation Prompt Banner - Show when <=7 days remain */}
      {(() => {
        if (!isCurrentWeek || !currentMealPlan) return null;

        const daysRemaining = getDaysRemainingInPlan(currentMealPlan);
        const canGenerate = canGeneratePlan(currentMealPlan);

        if (!canGenerate) return null;

        // Different messages based on days remaining
        let message = '';
        let urgency: 'info' | 'warning' | 'urgent' = 'info';

        if (daysRemaining === 0) {
          message = 'Your meal plan has ended. Generate your next week to continue!';
          urgency = 'urgent';
        } else if (daysRemaining === 1) {
          message = 'Only 1 day of meals remaining. Generate next week now!';
          urgency = 'urgent';
        } else if (daysRemaining <= 3) {
          message = `${daysRemaining} days of meals remaining. Time to plan ahead!`;
          urgency = 'warning';
        } else {
          message = `${daysRemaining} days remaining. You can now generate next week's plan.`;
          urgency = 'info';
        }

        const bgColors = {
          info: 'bg-blue-50 border-blue-200',
          warning: 'bg-yellow-50 border-yellow-200',
          urgent: 'bg-red-50 border-red-200'
        };

        const textColors = {
          info: 'text-blue-800',
          warning: 'text-yellow-800',
          urgent: 'text-red-800'
        };

        const iconColors = {
          info: 'text-blue-500',
          warning: 'text-yellow-500',
          urgent: 'text-red-500'
        };

        return (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700' : bgColors[urgency]
            } mb-4`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CalendarDays
                  className={`w-5 h-5 ${isDark ? 'text-gray-400' : iconColors[urgency]}`}
                />
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : textColors[urgency]}`}>
                    {message}
                  </p>
                  {daysRemaining > 0 && (
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : textColors[urgency]} opacity-75`}>
                      Stay ahead of your nutrition goals by planning early.
                    </p>
                  )}
                </div>
              </div>
              <a
                href="/dashboard"
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  urgency === 'urgent'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : urgency === 'warning'
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Generate Next Week
              </a>
            </div>
          </motion.div>
        );
      })()}

      {/* Selected Week Section */}
      {isLoadingWeek ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin h-6 w-6 text-orange-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Loading week data...</span>
          </div>
        </div>
      ) : !displayedMealPlan ? (
        /* Empty State - No plan for this week */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-12 text-center rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
        >
          <div className="mb-4">
            <CalendarDays className={`w-16 h-16 mx-auto ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No Meal Plan for This Week
          </h3>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {isFutureWeek
              ? 'This week hasn\'t been planned yet. Generate a plan when you have 7 days or less remaining.'
              : isPastWeek
              ? 'No meal plan was generated for this week.'
              : 'Generate your first meal plan to get started!'}
          </p>
          {(isCurrentWeek || (isFutureWeek && canGeneratePlan(currentMealPlan))) && (
            <a
              href="/dashboard"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Generate Meal Plan
            </a>
          )}
        </motion.div>
      ) : (
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isPlaceholder ? 'Sample Meal Structure' : (isCurrentWeek ? 'This Week\'s Meals' : 'Week Overview')}
          </h2>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Today's Meals Card - Only show when viewing current week */}
            {isCurrentWeek && (
              <motion.div
                className={`lg:col-span-2 p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Today's Meals
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                {isPlaceholder && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Sample
                  </span>
                )}
              </div>

              {/* Macro Summary - Planned vs Actual */}
              {(() => {
                const hasSkippedMeals = skippedMeals.some(skip => skip.startsWith(`${today}-`));

                return (
                  <div className={`mb-4 p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <PieChart className="w-4 h-4 text-orange-500 mr-2 inline-block" />
                        Today's Nutrition
                      </h4>
                      {hasSkippedMeals && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Adjusted
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {/* Calories */}
                      <div className={`p-3 rounded-lg text-center ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                      }`}>
                        <div className="text-xs text-orange-500 font-medium mb-1">Calories</div>
                        <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {roundNutrition(todayNutrition.actualCalories)}
                        </div>
                        {hasSkippedMeals && (
                          <div className="text-xs text-gray-400 line-through mt-1">
                            {roundNutrition(todayNutrition.plannedCalories)}
                          </div>
                        )}
                      </div>

                      {/* Protein */}
                      <div className={`p-3 rounded-lg text-center ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                      }`}>
                        <div className="text-xs text-blue-500 font-medium mb-1">Protein</div>
                        <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {roundNutrition(todayNutrition.actualProtein)}g
                        </div>
                        {hasSkippedMeals && (
                          <div className="text-xs text-gray-400 line-through mt-1">
                            {roundNutrition(todayNutrition.plannedProtein)}g
                          </div>
                        )}
                      </div>

                      {/* Carbs */}
                      <div className={`p-3 rounded-lg text-center ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                      }`}>
                        <div className="text-xs text-green-500 font-medium mb-1">Carbs</div>
                        <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {roundNutrition(todayNutrition.actualCarbs)}g
                        </div>
                        {hasSkippedMeals && (
                          <div className="text-xs text-gray-400 line-through mt-1">
                            {roundNutrition(todayNutrition.plannedCarbs)}g
                          </div>
                        )}
                      </div>

                      {/* Fat */}
                      <div className={`p-3 rounded-lg text-center ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                      }`}>
                        <div className="text-xs text-purple-500 font-medium mb-1">Fat</div>
                        <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {roundNutrition(todayNutrition.actualFat)}g
                        </div>
                        {hasSkippedMeals && (
                          <div className="text-xs text-gray-400 line-through mt-1">
                            {roundNutrition(todayNutrition.plannedFat)}g
                          </div>
                        )}
                      </div>
                    </div>

                    {hasSkippedMeals && (
                      <p className={`text-xs mt-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Flame className="w-4 h-4 text-orange-500 mr-1 inline-block" />
                        Nutrition adjusted for skipped meals
                      </p>
                    )}
                  </div>
                );
              })()}

              <div className="space-y-4">
                {/* Breakfast */}
                {(() => {
                  const isPast = isMealPast('breakfast');
                  const isSkipped = skippedMeals.includes(`${today}-breakfast`);
                  const dimStyle = isPast ? { opacity: 0.5, filter: 'grayscale(30%)' } : {};
                  return (
                    <div
                      style={dimStyle}
                      className={`p-4 rounded-lg transition-all relative ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div
                        onClick={() => handleRecipeClick(todaysMeals.breakfast || todaysMeals.meals?.breakfast, 'breakfast')}
                        className="cursor-pointer hover:scale-[1.01] transition-transform"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium ${isSkipped ? 'line-through' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              🌅 Breakfast
                            </h4>
                            <p className={`text-sm mt-1 ${isSkipped ? 'line-through' : ''} ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {todaysMeals.breakfast?.name || 'Protein Oatmeal Bowl'}
                            </p>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {todaysMeals.breakfast?.description || 'Oats with protein powder, berries, and nuts'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <Flame className="w-3 h-3 text-orange-500" />
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {todaysMeals.breakfast?.calories || '420'} cal
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              <Clock className="w-3 h-3 text-blue-500" />
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {todaysMeals.breakfast?.prepTime || '10 min'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {isPast && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMealSkipped('breakfast');
                          }}
                          className={`mt-3 w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isSkipped
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : isDark
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {isSkipped ? '✓ Marked as skipped' : "I didn't eat this"}
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Morning Snack */}
                {(todaysMeals.snack1 || todaysMeals.meals?.snack1) && (() => {
                  const isPast = isMealPast('snack1');
                  const isSkipped = skippedMeals.includes(`${today}-snack1`);
                  const dimStyle = isPast ? { opacity: 0.5, filter: 'grayscale(30%)' } : {};
                  return (
                    <div
                      style={dimStyle}
                      className={`p-4 rounded-lg transition-all relative ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div
                        onClick={() => handleRecipeClick(todaysMeals.snack1 || todaysMeals.meals?.snack1, 'snack1')}
                        className="cursor-pointer hover:scale-[1.01] transition-transform"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium ${isSkipped ? 'line-through' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              🍎 Morning Snack
                            </h4>
                            <p className={`text-sm mt-1 ${isSkipped ? 'line-through' : ''} ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {(todaysMeals.snack1 || todaysMeals.meals?.snack1)?.name || 'Protein Snack'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <Flame className="w-3 h-3 text-orange-500" />
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {(todaysMeals.snack1 || todaysMeals.meals?.snack1)?.calories || '150'} cal
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              <Clock className="w-3 h-3 text-blue-500" />
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {(todaysMeals.snack1 || todaysMeals.meals?.snack1)?.prepTime || '5 min'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {isPast && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMealSkipped('snack1');
                          }}
                          className={`mt-3 w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isSkipped
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : isDark
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {isSkipped ? '✓ Marked as skipped' : "I didn't eat this"}
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Lunch */}
                {(() => {
                  const isPast = isMealPast('lunch');
                  const isSkipped = skippedMeals.includes(`${today}-lunch`);
                  const dimStyle = isPast ? { opacity: 0.5, filter: 'grayscale(30%)' } : {};
                  return (
                    <div
                      style={dimStyle}
                      className={`p-4 rounded-lg transition-all relative ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div
                        onClick={() => handleRecipeClick(todaysMeals.lunch || todaysMeals.meals?.lunch, 'lunch')}
                        className="cursor-pointer hover:scale-[1.01] transition-transform"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium ${isSkipped ? 'line-through' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              🌞 Lunch
                            </h4>
                            <p className={`text-sm mt-1 ${isSkipped ? 'line-through' : ''} ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {todaysMeals.lunch?.name || 'Grilled Chicken Salad'}
                            </p>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {todaysMeals.lunch?.description || 'Mixed greens, grilled chicken, avocado, and vinaigrette'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <Flame className="w-3 h-3 text-orange-500" />
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {todaysMeals.lunch?.calories || '520'} cal
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              <Clock className="w-3 h-3 text-blue-500" />
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {todaysMeals.lunch?.prepTime || '15 min'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {isPast && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMealSkipped('lunch');
                          }}
                          className={`mt-3 w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isSkipped
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : isDark
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {isSkipped ? '✓ Marked as skipped' : "I didn't eat this"}
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Afternoon Snack */}
                {(todaysMeals.snack2 || todaysMeals.meals?.snack2) && (() => {
                  const isPast = isMealPast('snack2');
                  const isSkipped = skippedMeals.includes(`${today}-snack2`);
                  const dimStyle = isPast ? { opacity: 0.5, filter: 'grayscale(30%)' } : {};
                  return (
                    <div
                      style={dimStyle}
                      className={`p-4 rounded-lg transition-all relative ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div
                        onClick={() => handleRecipeClick(todaysMeals.snack2 || todaysMeals.meals?.snack2, 'snack2')}
                        className="cursor-pointer hover:scale-[1.01] transition-transform"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium ${isSkipped ? 'line-through' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              🥤 Afternoon Snack
                            </h4>
                            <p className={`text-sm mt-1 ${isSkipped ? 'line-through' : ''} ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {(todaysMeals.snack2 || todaysMeals.meals?.snack2)?.name || 'Energy Snack'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <Flame className="w-3 h-3 text-orange-500" />
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {(todaysMeals.snack2 || todaysMeals.meals?.snack2)?.calories || '200'} cal
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              <Clock className="w-3 h-3 text-blue-500" />
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {(todaysMeals.snack2 || todaysMeals.meals?.snack2)?.prepTime || '5 min'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {isPast && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMealSkipped('snack2');
                          }}
                          className={`mt-3 w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isSkipped
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : isDark
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {isSkipped ? '✓ Marked as skipped' : "I didn't eat this"}
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Dinner */}
                {(() => {
                  const isPast = isMealPast('dinner');
                  const isSkipped = skippedMeals.includes(`${today}-dinner`);
                  const dimStyle = isPast ? { opacity: 0.5, filter: 'grayscale(30%)' } : {};
                  return (
                    <div
                      style={dimStyle}
                      className={`p-4 rounded-lg transition-all relative ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div
                        onClick={() => handleRecipeClick(todaysMeals.dinner || todaysMeals.meals?.dinner, 'dinner')}
                        className="cursor-pointer hover:scale-[1.01] transition-transform"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium ${isSkipped ? 'line-through' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              🌙 Dinner
                            </h4>
                            <p className={`text-sm mt-1 ${isSkipped ? 'line-through' : ''} ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {todaysMeals.dinner?.name || 'Salmon with Vegetables'}
                            </p>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {todaysMeals.dinner?.description || 'Baked salmon, roasted broccoli, and sweet potato'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <Flame className="w-3 h-3 text-orange-500" />
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {todaysMeals.dinner?.calories || '640'} cal
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              <Clock className="w-3 h-3 text-blue-500" />
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {todaysMeals.dinner?.prepTime || '25 min'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {isPast && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMealSkipped('dinner');
                          }}
                          className={`mt-3 w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isSkipped
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : isDark
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {isSkipped ? '✓ Marked as skipped' : "I didn't eat this"}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
              </motion.div>
            )}

            {/* Macro Targets Card - Only show when viewing current week */}
            {isCurrentWeek && (
            <motion.div
              className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Daily Targets
              </h4>

              <div className="space-y-4">
                {/* Total Calories */}
                <div className="text-center p-3 rounded-lg bg-orange-50">
                  <div className="text-2xl font-bold text-orange-600">
                    {roundNutrition(currentMealPlan?.targets?.calories || userProfile?.calorieTarget || 2000)}
                  </div>
                  <div className="text-xs text-orange-600">Daily Calories</div>
                </div>

                {/* Macros */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Protein</span>
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {roundNutrition(todayNutrition.actualProtein)}/{roundNutrition(currentMealPlan?.targets?.protein || userProfile?.macros?.protein || 150)}g
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((todayNutrition.actualProtein / (currentMealPlan?.targets?.protein || userProfile?.macros?.protein || 150)) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Carbs</span>
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {roundNutrition(todayNutrition.actualCarbs)}/{roundNutrition(currentMealPlan?.targets?.carbs || userProfile?.macros?.carbs || 200)}g
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((todayNutrition.actualCarbs / (currentMealPlan?.targets?.carbs || userProfile?.macros?.carbs || 200)) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Fat</span>
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {roundNutrition(todayNutrition.actualFat)}/{roundNutrition(currentMealPlan?.targets?.fat || userProfile?.macros?.fat || 65)}g
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((todayNutrition.actualFat / (currentMealPlan?.targets?.fat || userProfile?.macros?.fat || 65)) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            )}
          </div>

          {/* Weekly Grid - Show all 7 days */}
          <div className="mt-8">
            <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Weekly Schedule
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedWeekMeals.map(({ day, dayName, meals }) => (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {dayName}
                  </h4>

                  {!meals ? (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      No meals planned
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {/* Breakfast */}
                      {meals.breakfast && (
                        <div className="text-sm">
                          <div className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            🌅 {meals.breakfast.name}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {meals.breakfast.calories} cal
                          </div>
                        </div>
                      )}

                      {/* Lunch */}
                      {meals.lunch && (
                        <div className="text-sm">
                          <div className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            🌞 {meals.lunch.name}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {meals.lunch.calories} cal
                          </div>
                        </div>
                      )}

                      {/* Dinner */}
                      {meals.dinner && (
                        <div className="text-sm">
                          <div className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            🌙 {meals.dinner.name}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {meals.dinner.calories} cal
                          </div>
                        </div>
                      )}

                      {/* Total */}
                      <div className={`pt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                        <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Total: {roundNutrition((meals.breakfast?.calories || 0) + (meals.lunch?.calories || 0) + (meals.dinner?.calories || 0) + (meals.snack1?.calories || 0) + (meals.snack2?.calories || 0))} cal
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* Meal Plan Detail Modal */}
      {selectedMealPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className={`max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedMealPlan.name || 'Meal Plan'}
                </h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                  {selectedMealPlan.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedMealPlan(null)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                ✕
              </button>
            </div>

            {/* Meal Plan Content */}
            <div className="space-y-6">
              {selectedMealPlan.days && Object.entries(selectedMealPlan.days).map(([day, dayData]) => (
                <div key={day} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold capitalize mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {day}
                  </h3>
                  {dayData?.meals && Object.entries(dayData.meals).map(([mealType, meal]) => (
                    <div key={mealType} className="mb-4 last:mb-0">
                      <h4 className={`font-medium capitalize ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {mealType}
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {meal?.name} - {meal?.calories} cal
                      </p>
                      {meal?.ingredients && (
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                          Ingredients: {meal.ingredients.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}

            </div>
          </motion.div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        open={!!selectedRecipe}
        onClose={closeRecipeModal}
        recipe={selectedRecipe}
        mealType={selectedMealType}
        isDark={isDark}
      />
    </div>
  );
}