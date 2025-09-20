import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlateUtensils,
  faUtensils,
  faClock,
  faFireFlame,
  faCalendarWeek,
  faChartPie
} from '@fortawesome/pro-duotone-svg-icons';
import { getUserMealPlans, getCurrentWeekData } from '../../lib/firestoreQueries';
import { useAuth } from '../../hooks/useAuth';

export default function MealsContent({ isDark }) {
  const { user, userProfile } = useAuth();
  const [mealPlans, setMealPlans] = useState([]);
  const [currentWeekData, setCurrentWeekData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      if (!user?.uid) return;

      setIsLoading(true);
      try {
        const [userMealPlans, weekData] = await Promise.all([
          getUserMealPlans(user.uid),
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
  }, [user?.uid]);

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
        <FontAwesomeIcon icon={faPlateUtensils} className="text-6xl text-gray-400 mb-4" />
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
  const isPlaceholder = currentMealPlan?.type === 'placeholder';

  // Get today's meals
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(); // 'monday', 'tuesday', etc
  const todaysMeals = currentMealPlan?.days?.[today] || {};

  return (
    <div className="max-w-6xl mx-auto">
      {/* Current Week Section */}
      {currentMealPlan && (
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isPlaceholder ? 'Sample Meal Structure' : 'This Week\'s Meals'}
          </h2>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Today's Meals Card */}
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

              <div className="space-y-4">
                {/* Breakfast */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        🌅 Breakfast
                      </h4>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {todaysMeals.breakfast?.name || 'Protein Oatmeal Bowl'}
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {todaysMeals.breakfast?.description || 'Oats with protein powder, berries, and nuts'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faFireFlame} className="text-orange-500 text-xs" />
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {todaysMeals.breakfast?.calories || '420'} cal
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <FontAwesomeIcon icon={faClock} className="text-blue-500 text-xs" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {todaysMeals.breakfast?.prepTime || '10 min'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lunch */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        🌞 Lunch
                      </h4>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {todaysMeals.lunch?.name || 'Grilled Chicken Salad'}
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {todaysMeals.lunch?.description || 'Mixed greens, grilled chicken, avocado, and vinaigrette'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faFireFlame} className="text-orange-500 text-xs" />
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {todaysMeals.lunch?.calories || '520'} cal
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <FontAwesomeIcon icon={faClock} className="text-blue-500 text-xs" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {todaysMeals.lunch?.prepTime || '15 min'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dinner */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        🌙 Dinner
                      </h4>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {todaysMeals.dinner?.name || 'Salmon with Vegetables'}
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {todaysMeals.dinner?.description || 'Baked salmon, roasted broccoli, and sweet potato'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faFireFlame} className="text-orange-500 text-xs" />
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {todaysMeals.dinner?.calories || '640'} cal
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <FontAwesomeIcon icon={faClock} className="text-blue-500 text-xs" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {todaysMeals.dinner?.prepTime || '25 min'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                className="w-full mt-6 bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FontAwesomeIcon icon={faUtensils} />
                <span>{isPlaceholder ? 'Preview Recipes' : 'View All Recipes'}</span>
              </motion.button>
            </motion.div>

            {/* Macro Targets Card */}
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
                    {currentMealPlan?.targets?.calories || userProfile?.calorieTarget || '2000'}
                  </div>
                  <div className="text-xs text-orange-600">Daily Calories</div>
                </div>

                {/* Macros */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Protein</span>
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        0/{currentMealPlan?.targets?.protein || userProfile?.macros?.protein || '150'}g
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Carbs</span>
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        0/{currentMealPlan?.targets?.carbs || userProfile?.macros?.carbs || '200'}g
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Fat</span>
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        0/{currentMealPlan?.targets?.fat || userProfile?.macros?.fat || '65'}g
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Meal Plans List */}
      {mealPlans.length > 1 && (
        <div>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            All Meal Plans
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mealPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'} cursor-pointer transition-all`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Week of {plan.weekStartDate?.replace(/_/g, '/')}
                  </h3>
                  {plan.type === 'placeholder' && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Sample
                    </span>
                  )}
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                  {plan.type === 'placeholder'
                    ? 'Sample meal structure showing planned layout'
                    : `${Object.keys(plan.days || {}).length} days planned`
                  }
                </p>
                <div className="flex items-center space-x-3 text-xs">
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {plan.targets?.calories || '2000'} cal/day
                  </span>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {plan.generatedBy || 'manual'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No real meal plans message */}
      {mealPlans.every(p => p.type === 'placeholder') && (
        <motion.div
          className={`mt-8 p-6 rounded-xl border border-dashed ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'} text-center`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <FontAwesomeIcon icon={faChartPie} className="text-4xl text-orange-500 mb-3" />
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Ready for AI-Generated Meal Plans?
          </h3>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            The sample meals above show the structure. Soon you'll have personalized meal plans generated by AI!
          </p>
          <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            Generate My First Meal Plan
          </button>
        </motion.div>
      )}
    </div>
  );
}