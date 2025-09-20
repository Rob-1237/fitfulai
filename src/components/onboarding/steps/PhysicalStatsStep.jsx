import { motion } from 'framer-motion';

export default function PhysicalStatsStep({ data, updateData }) {
  console.log('📏 PhysicalStatsStep data:', {
    unitsPreference: data.unitsPreference,
    height: data.unitsPreference === 'imperial' ? `${data.heightFeet}'${data.heightInches}"` : `${data.heightCm}cm`,
    weight: data.unitsPreference === 'imperial' ? `${data.weightLbs}lbs` : `${data.weightKg}kg`
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Physical Stats
        </h3>
        <p className="text-gray-600">
          We'll use these to calculate your personalized targets
        </p>
      </div>

      <div className="space-y-4">
        {/* Height Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height
          </label>
          {data.unitsPreference === 'imperial' ? (
            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="number"
                  min="3"
                  max="8"
                  value={data.heightFeet || ''}
                  onChange={(e) => updateData({ heightFeet: parseInt(e.target.value) || null })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Feet"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={data.heightInches || ''}
                  onChange={(e) => updateData({ heightInches: parseInt(e.target.value) || null })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Inches"
                />
              </div>
            </div>
          ) : (
            <input
              type="number"
              min="100"
              max="250"
              value={data.heightCm || ''}
              onChange={(e) => updateData({ heightCm: parseInt(e.target.value) || null })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Height in cm"
            />
          )}
        </div>

        {/* Weight Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight
          </label>
          <input
            type="number"
            min={data.unitsPreference === 'imperial' ? "50" : "20"}
            max={data.unitsPreference === 'imperial' ? "500" : "250"}
            value={data.unitsPreference === 'imperial' ? (data.weightLbs || '') : (data.weightKg || '')}
            onChange={(e) => {
              const value = parseInt(e.target.value) || null;
              if (data.unitsPreference === 'imperial') {
                updateData({
                  weightLbs: value,
                  weightKg: value ? Math.round(value * 0.453592) : null
                });
              } else {
                updateData({
                  weightKg: value,
                  weightLbs: value ? Math.round(value / 0.453592) : null
                });
              }
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Weight in ${data.unitsPreference === 'imperial' ? 'lbs' : 'kg'}`}
          />
        </div>
      </div>

      <motion.div
        className="bg-blue-50 p-4 rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-blue-800 text-sm">
          💡 <strong>Tip:</strong> We'll use these measurements to calculate your BMR and daily calorie needs.
        </p>
      </motion.div>
    </div>
  );
}