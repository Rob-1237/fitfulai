import { useState } from 'react';
import { motion } from 'framer-motion';

// Validation thresholds
const VALIDATION = {
  heightFeet: { min: 3, max: 8 },
  heightInches: { min: 0, max: 11 },
  heightCm: { min: 91, max: 244 },
  weightLbs: { min: 50, max: 1000 },
  weightKg: { min: 22, max: 453 }
};

export default function PhysicalStatsStep({ data, updateData }) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  console.log('📏 PhysicalStatsStep data:', {
    unitsPreference: data.unitsPreference,
    height: data.unitsPreference === 'imperial' ? `${data.heightFeet}'${data.heightInches}"` : `${data.heightCm}cm`,
    weight: data.unitsPreference === 'imperial' ? `${data.weightLbs}lbs` : `${data.weightKg}kg`
  });

  const handleInputChange = (field, value) => {
    console.log(`📏 PhysicalStatsStep: ${field} = ${value}`);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    updateData({ [field]: value });
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'heightFeet':
        if (!value) return 'Feet is required';
        if (value < VALIDATION.heightFeet.min || value > VALIDATION.heightFeet.max) {
          return `Height must be between ${VALIDATION.heightFeet.min}-${VALIDATION.heightFeet.max} feet`;
        }
        return null;

      case 'heightInches':
        // Allow 0 as valid (e.g., 6'0")
        if (value === null || value === undefined || value === '') return 'Inches is required';
        const numericInches = typeof value === 'string' ? parseInt(value) : value;
        if (isNaN(numericInches) || numericInches < VALIDATION.heightInches.min || numericInches > VALIDATION.heightInches.max) {
          return `Inches must be between ${VALIDATION.heightInches.min}-${VALIDATION.heightInches.max}`;
        }
        // Check total height is reasonable
        const totalInches = (data.heightFeet * 12) + numericInches;
        if (totalInches < 36 || totalInches > 96) {
          return 'Total height must be between 3\'0" and 8\'0"';
        }
        return null;

      case 'heightCm':
        if (!value) return 'Height is required';
        if (value < VALIDATION.heightCm.min || value > VALIDATION.heightCm.max) {
          return `Height must be between ${VALIDATION.heightCm.min}-${VALIDATION.heightCm.max} cm`;
        }
        return null;

      case 'weightLbs':
        if (!value) return 'Weight is required';
        if (value < VALIDATION.weightLbs.min || value > VALIDATION.weightLbs.max) {
          return `Weight must be between ${VALIDATION.weightLbs.min}-${VALIDATION.weightLbs.max} lbs`;
        }
        return null;

      case 'weightKg':
        if (!value) return 'Weight is required';
        if (value < VALIDATION.weightKg.min || value > VALIDATION.weightKg.max) {
          return `Weight must be between ${VALIDATION.weightKg.min}-${VALIDATION.weightKg.max} kg`;
        }
        return null;

      default:
        return null;
    }
  };

  const handleBlur = (field, value) => {
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isValid = () => {
    if (data.unitsPreference === 'imperial') {
      const heightFeetValid = data.heightFeet >= VALIDATION.heightFeet.min && data.heightFeet <= VALIDATION.heightFeet.max;
      // Allow 0 as valid inches value (e.g., 6'0")
      const heightInchesValid = (data.heightInches === 0 || data.heightInches) &&
                                 data.heightInches >= VALIDATION.heightInches.min &&
                                 data.heightInches <= VALIDATION.heightInches.max;
      const totalInches = (data.heightFeet * 12) + (data.heightInches || 0);
      const totalHeightValid = totalInches >= 36 && totalInches <= 96;
      const weightValid = data.weightLbs >= VALIDATION.weightLbs.min && data.weightLbs <= VALIDATION.weightLbs.max;

      return heightFeetValid && heightInchesValid && totalHeightValid && weightValid;
    } else {
      const heightValid = data.heightCm >= VALIDATION.heightCm.min && data.heightCm <= VALIDATION.heightCm.max;
      const weightValid = data.weightKg >= VALIDATION.weightKg.min && data.weightKg <= VALIDATION.weightKg.max;

      return heightValid && weightValid;
    }
  };

  const handleHeightChange = (field, value) => {
    // IMPORTANT: Don't use || null because it converts 0 to null
    // We need to allow 0 as valid (e.g., 6'0")
    const numValue = value === '' ? null : parseInt(value);

    if (field === 'heightFeet' || field === 'heightInches') {
      // Imperial height change
      const newFeet = field === 'heightFeet' ? numValue : data.heightFeet;
      const newInches = field === 'heightInches' ? numValue : data.heightInches;

      // Update the specific field first
      handleInputChange(field, numValue);

      // Calculate total inches and convert to cm (but don't overwrite heightInches!)
      if (newFeet !== null && newInches !== null) {
        const totalInches = (newFeet * 12) + newInches;
        const heightCm = Math.round(totalInches * 2.54);

        updateData({
          heightFeet: newFeet,
          heightInches: newInches,  // Keep the component (0-11), not the total!
          heightCm,
          heightCentimeters: heightCm
        });
      }
    } else {
      // Metric height change - convert to imperial
      if (numValue) {
        const totalInches = numValue / 2.54;
        const heightFeet = Math.floor(totalInches / 12);
        const heightInches = Math.round(totalInches % 12);

        handleInputChange(field, numValue);
        updateData({
          heightCm: numValue,
          heightCentimeters: numValue,
          heightFeet,
          heightInches  // This is the component (0-11), correct!
        });
      } else {
        handleInputChange(field, numValue);
      }
    }
  };

  const handleWeightChange = (value) => {
    const numValue = parseInt(value) || null;

    if (data.unitsPreference === 'imperial') {
      const weightKg = numValue ? Math.round(numValue * 0.453592) : null;
      handleInputChange('weightLbs', numValue);
      updateData({
        weightLbs: numValue,
        weightKg,
        weightKgs: weightKg
      });
    } else {
      const weightLbs = numValue ? Math.round(numValue / 0.453592) : null;
      handleInputChange('weightKg', numValue);
      updateData({
        weightKg: numValue,
        weightLbs,
        weightKgs: numValue
      });
    }
  };

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
            <div className="space-y-2">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min={VALIDATION.heightFeet.min}
                    max={VALIDATION.heightFeet.max}
                    value={data.heightFeet || ''}
                    onChange={(e) => handleHeightChange('heightFeet', e.target.value)}
                    onBlur={(e) => handleBlur('heightFeet', parseInt(e.target.value))}
                    className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      touched.heightFeet && errors.heightFeet ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Feet"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min={VALIDATION.heightInches.min}
                    max={VALIDATION.heightInches.max}
                    value={data.heightInches ?? ''}
                    onChange={(e) => handleHeightChange('heightInches', e.target.value)}
                    onBlur={(e) => handleBlur('heightInches', parseInt(e.target.value))}
                    className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      touched.heightInches && errors.heightInches ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Inches"
                  />
                </div>
              </div>
              {(touched.heightFeet && errors.heightFeet) && (
                <p className="text-red-500 text-sm">{errors.heightFeet}</p>
              )}
              {(touched.heightInches && errors.heightInches) && (
                <p className="text-red-500 text-sm">{errors.heightInches}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="number"
                min={VALIDATION.heightCm.min}
                max={VALIDATION.heightCm.max}
                value={data.heightCm || ''}
                onChange={(e) => handleHeightChange('heightCm', e.target.value)}
                onBlur={(e) => handleBlur('heightCm', parseInt(e.target.value))}
                className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  touched.heightCm && errors.heightCm ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Height in cm"
              />
              {(touched.heightCm && errors.heightCm) && (
                <p className="text-red-500 text-sm">{errors.heightCm}</p>
              )}
            </div>
          )}
        </div>

        {/* Weight Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight
          </label>
          <div className="space-y-2">
            <input
              type="number"
              min={data.unitsPreference === 'imperial' ? VALIDATION.weightLbs.min : VALIDATION.weightKg.min}
              max={data.unitsPreference === 'imperial' ? VALIDATION.weightLbs.max : VALIDATION.weightKg.max}
              value={data.unitsPreference === 'imperial' ? (data.weightLbs || '') : (data.weightKg || '')}
              onChange={(e) => handleWeightChange(e.target.value)}
              onBlur={(e) => {
                const field = data.unitsPreference === 'imperial' ? 'weightLbs' : 'weightKg';
                handleBlur(field, parseInt(e.target.value));
              }}
              className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                (touched.weightLbs || touched.weightKg) && (errors.weightLbs || errors.weightKg) ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={`Weight in ${data.unitsPreference === 'imperial' ? 'lbs' : 'kg'}`}
            />
            {(touched.weightLbs && errors.weightLbs) && (
              <p className="text-red-500 text-sm">{errors.weightLbs}</p>
            )}
            {(touched.weightKg && errors.weightKg) && (
              <p className="text-red-500 text-sm">{errors.weightKg}</p>
            )}
          </div>
        </div>
      </div>

      {/* Validation indicator */}
      {isValid() && Object.keys(touched).length > 0 && (
        <motion.div
          className="bg-green-50 border border-green-200 p-4 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-green-800 text-sm">
            ✓ <strong>Looking good!</strong> Ready to move to the next step.
          </p>
        </motion.div>
      )}

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
