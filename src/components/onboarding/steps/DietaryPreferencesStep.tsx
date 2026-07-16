import { motion } from 'framer-motion';
import type { StepProps } from '../types';

export default function DietaryPreferencesStep({ data, updateData }: StepProps) {
  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
    { value: 'vegan', label: 'Vegan', emoji: '🌱' },
    { value: 'pescatarian', label: 'Pescatarian', emoji: '🐟' },
    { value: 'keto', label: 'Keto', emoji: '🥑' },
    { value: 'paleo', label: 'Paleo', emoji: '🍖' },
    { value: 'gluten_free', label: 'Gluten-Free', emoji: '🌾' },
    { value: 'dairy_free', label: 'Dairy-Free', emoji: '🥛' },
    { value: 'low_carb', label: 'Low Carb', emoji: '🥗' }
  ];

  const commonAllergies = [
    'Nuts', 'Peanuts', 'Shellfish', 'Fish', 'Eggs', 'Dairy', 'Soy', 'Gluten'
  ];

  const toggleDietaryPreference = (preference: string) => {
    const current = data.dietaryPreferences || [];
    const updated = current.includes(preference)
      ? current.filter(p => p !== preference)
      : [...current, preference];
    updateData({ dietaryPreferences: updated });
  };

  const toggleAllergy = (allergy: string) => {
    const current = data.allergies || [];
    const updated = current.includes(allergy)
      ? current.filter(a => a !== allergy)
      : [...current, allergy];
    updateData({ allergies: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Dietary Preferences
        </h3>
        <p className="text-gray-600">
          Help us create meal plans that fit your lifestyle (optional)
        </p>
      </div>

      <div className="space-y-6">
        {/* Dietary Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Diet Types <span className="text-gray-400">(select all that apply)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {dietaryOptions.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => toggleDietaryPreference(option.value)}
                className={`p-3 border-2 rounded-lg text-center transition-all ${
                  (data.dietaryPreferences || []).includes(option.value)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-xl mb-1">{option.emoji}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Allergies & Intolerances <span className="text-gray-400">(select all that apply)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {commonAllergies.map((allergy) => (
              <motion.button
                key={allergy}
                type="button"
                onClick={() => toggleAllergy(allergy)}
                className={`p-2 border-2 rounded-lg text-sm text-center transition-all ${
                  (data.allergies || []).includes(allergy)
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {allergy}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        className="bg-green-50 p-4 rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-green-800 text-sm">
          ✨ <strong>Good news:</strong> You can always update these preferences later in your profile settings.
        </p>
      </motion.div>
    </div>
  );
}