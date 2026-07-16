import { motion } from 'framer-motion';

export default function FitnessGoalsStep({ data, updateData }) {
  // Stored under the legacy `fitnessGoal` field name in Firestore profiles;
  // values are kept stable so existing profiles and calorie calculations still work.
  const nutritionGoals = [
    { value: 'weight_loss', label: 'Lose Weight', emoji: '📉', desc: 'Eat at a calorie deficit to burn fat' },
    { value: 'muscle_gain', label: 'Build Muscle', emoji: '💪', desc: 'Protein-forward meals with a calorie surplus' },
    { value: 'general_fitness', label: 'Eat Healthier', emoji: '🥗', desc: 'Balanced nutrition at maintenance calories' },
    { value: 'endurance', label: 'Fuel Endurance', emoji: '🏃‍♂️', desc: 'Carb-focused fueling for cardio training' },
    { value: 'strength', label: 'Fuel Strength', emoji: '🏋️', desc: 'High-protein fueling for strength training' }
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
    { value: 'light', label: 'Light Activity', desc: '1-3 days per week' },
    { value: 'moderate', label: 'Moderate Activity', desc: '3-5 days per week' },
    { value: 'active', label: 'Very Active', desc: '6-7 days per week' },
    { value: 'very_active', label: 'Extra Active', desc: 'Daily + physical job' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          What's your nutrition goal?
        </h3>
        <p className="text-gray-600">
          We use this to set your calorie and macro targets
        </p>
      </div>

      <div className="space-y-6">
        {/* Fitness Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Primary Goal
          </label>
          <div className="grid grid-cols-1 gap-3">
            {nutritionGoals.map((goal) => (
              <motion.button
                key={goal.value}
                type="button"
                onClick={() => updateData({ fitnessGoal: goal.value })}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  data.fitnessGoal === goal.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{goal.emoji}</span>
                  <div>
                    <div className="font-medium">{goal.label}</div>
                    <div className="text-sm text-gray-500">{goal.desc}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Current Activity Level
          </label>
          <div className="space-y-2">
            {activityLevels.map((level) => (
              <motion.button
                key={level.value}
                type="button"
                onClick={() => updateData({ activityLevel: level.value })}
                className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                  data.activityLevel === level.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="font-medium">{level.label}</div>
                <div className="text-sm text-gray-500">{level.desc}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}