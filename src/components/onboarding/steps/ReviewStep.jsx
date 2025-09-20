import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { initializeUserCollections } from '../../../lib/initializeCollections';

export default function ReviewStep({ data, updateData, isLoading, setIsLoading, onComplete }) {
  const { user } = useAuth();
  console.log('📋 ReviewStep data:', data);

  // Calculate BMR and TDEE
  const calculateMetrics = () => {
    if (!data.age || !data.gender || (!data.weightKg && !data.weightLbs) || (!data.heightCm && (!data.heightFeet || !data.heightInches))) {
      return null;
    }

    // Convert to metric if needed
    const weightKg = data.weightKg || (data.weightLbs * 0.453592);
    const heightCm = data.heightCm || ((data.heightFeet * 12 + data.heightInches) * 2.54);

    // Mifflin-St Jeor Equation
    let bmr;
    if (data.gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * data.age + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * data.age - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = bmr * (activityMultipliers[data.activityLevel] || 1.2);

    // Calorie target based on goal
    let calorieTarget = tdee;
    if (data.fitnessGoal === 'weight_loss') {
      calorieTarget = tdee - 500; // 1lb per week deficit
    } else if (data.fitnessGoal === 'muscle_gain') {
      calorieTarget = tdee + 300; // Lean bulk surplus
    }

    // Macro distribution
    const proteinRatio = data.fitnessGoal === 'muscle_gain' ? 0.3 : 0.25;
    const fatRatio = 0.25;
    const carbRatio = 1 - proteinRatio - fatRatio;

    const macros = {
      protein: Math.round((calorieTarget * proteinRatio) / 4), // 4 cal per gram
      carbs: Math.round((calorieTarget * carbRatio) / 4),
      fat: Math.round((calorieTarget * fatRatio) / 9) // 9 cal per gram
    };

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calorieTarget: Math.round(calorieTarget),
      macros
    };
  };

  const metrics = calculateMetrics();

  const handleComplete = async () => {
    setIsLoading(true);
    console.log('🎉 Starting onboarding completion process...');

    try {
      // Calculate final metrics
      const finalMetrics = metrics || {};

      // Prepare complete onboarding data for collection initialization
      const completeOnboardingData = {
        // Basic info
        age: data.age,
        gender: data.gender,
        unitsPreference: data.unitsPreference,

        // Physical characteristics
        weightLbs: data.weightLbs,
        weightKgs: data.weightKg,
        heightInches: data.unitsPreference === 'imperial'
          ? (data.heightFeet * 12 + data.heightInches)
          : Math.round(data.heightCm / 2.54),
        heightCentimeters: data.heightCm || Math.round((data.heightFeet * 12 + data.heightInches) * 2.54),

        // Fitness & nutrition preferences
        fitnessGoal: data.fitnessGoal,
        activityLevel: data.activityLevel,
        dietaryPreferences: data.dietaryPreferences || [],
        allergies: data.allergies || [],

        // Calculated metrics
        bmr: finalMetrics.bmr,
        tdee: finalMetrics.tdee,
        calorieTarget: finalMetrics.calorieTarget,
        macros: finalMetrics.macros,

        // Additional preferences
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Auto-detect timezone
        preferences: {
          workoutDays: ['monday', 'wednesday', 'friday'], // Default workout days
          mealComplexity: 'intermediate',
          budgetRange: 'medium'
        },

        // Mark onboarding as complete!
        onboardingCompleted: true
      };

      console.log('💾 Initializing user collections with onboarding data:', completeOnboardingData);

      // Get user data for collection initialization
      const userData = {
        email: user.email,
        displayName: user.displayName
      };

      // Initialize all user collections using our new system
      const result = await initializeUserCollections(user.uid, userData, completeOnboardingData);

      if (result.success) {
        console.log('✅ User collections initialized successfully!');

        // Update local data with calculated metrics
        updateData({
          bmr: finalMetrics.bmr,
          tdee: finalMetrics.tdee,
          calorieTarget: finalMetrics.calorieTarget,
          macros: finalMetrics.macros,
          onboardingCompleted: true
        });

        // Clear draft data
        localStorage.removeItem('onboarding_draft');

        // Show success for a moment before closing
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('🎊 User should now see "onboarded" state across the app!');
        console.log('🔥 All Firestore collections created: profiles, workouts, meals, groceries, aiCache');

        // Close the wizard modal
        if (onComplete) {
          onComplete();
        }
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      alert('Sorry, there was an error completing your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Review Your Profile
        </h3>
        <p className="text-gray-600">
          Everything looks good? Let's generate your personalized plans!
        </p>
      </div>

      {/* Profile Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Age:</span>
            <span className="ml-2 font-medium">{data.age} years</span>
          </div>
          <div>
            <span className="text-gray-600">Gender:</span>
            <span className="ml-2 font-medium capitalize">{data.gender}</span>
          </div>
          <div>
            <span className="text-gray-600">Height:</span>
            <span className="ml-2 font-medium">
              {data.unitsPreference === 'imperial'
                ? `${data.heightFeet}'${data.heightInches}"`
                : `${data.heightCm} cm`}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Weight:</span>
            <span className="ml-2 font-medium">
              {data.unitsPreference === 'imperial'
                ? `${data.weightLbs} lbs`
                : `${data.weightKg} kg`}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Goal:</span>
            <span className="ml-2 font-medium">{data.fitnessGoal?.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-gray-600">Activity:</span>
            <span className="ml-2 font-medium">{data.activityLevel?.replace('_', ' ')}</span>
          </div>
        </div>

        {data.dietaryPreferences?.length > 0 && (
          <div>
            <span className="text-gray-600">Diet:</span>
            <span className="ml-2 font-medium">
              {data.dietaryPreferences.join(', ')}
            </span>
          </div>
        )}

        {data.allergies?.length > 0 && (
          <div>
            <span className="text-gray-600">Allergies:</span>
            <span className="ml-2 font-medium">
              {data.allergies.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Calculated Metrics */}
      {metrics && (
        <motion.div
          className="bg-blue-50 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="font-medium text-blue-900 mb-3">Your Personalized Targets</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Daily Calories:</span>
              <span className="ml-2 font-bold text-blue-900">{metrics.calorieTarget}</span>
            </div>
            <div>
              <span className="text-blue-700">BMR:</span>
              <span className="ml-2 font-medium text-blue-900">{metrics.bmr}</span>
            </div>
            <div>
              <span className="text-blue-700">Protein:</span>
              <span className="ml-2 font-medium text-blue-900">{metrics.macros.protein}g</span>
            </div>
            <div>
              <span className="text-blue-700">Carbs:</span>
              <span className="ml-2 font-medium text-blue-900">{metrics.macros.carbs}g</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Complete Button */}
      <motion.button
        onClick={handleComplete}
        disabled={isLoading}
        className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Generating Your Plans...</span>
          </div>
        ) : (
          '🚀 Generate My Personalized Plans'
        )}
      </motion.button>
    </div>
  );
}