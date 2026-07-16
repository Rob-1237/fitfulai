import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { OnboardingData, StepProps } from '../types';

type BasicField = 'age' | 'gender' | 'unitsPreference';
type FieldErrors = Partial<Record<BasicField, string | null>>;
type FieldTouched = Partial<Record<BasicField, boolean>>;

export default function BasicInfoStep({ data, updateData, onNext }: StepProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<FieldTouched>({});

  const handleInputChange = (field: BasicField, value: string | number | null) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    updateData({ [field]: value } as Partial<OnboardingData>);
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateField = (field: BasicField, value: string | number | null): string | null => {
    switch (field) {
      case 'age':
        if (!value) return 'Age is required';
        if (typeof value === 'number' && value < 13) return 'Must be at least 13 years old';
        if (typeof value === 'number' && value > 100) return 'Please enter a valid age';
        return null;
      case 'gender':
        if (!value) return 'Please select your gender';
        return null;
      case 'unitsPreference':
        if (!value) return 'Please select your preferred units';
        return null;
      default:
        return null;
    }
  };

  const handleBlur = (field: BasicField, value: string | number | null) => {
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isValid = () => {
    const ageValid = data.age !== null && data.age >= 13 && data.age <= 100;
    const genderValid = !!data.gender;
    const unitsValid = !!data.unitsPreference;

    return ageValid && genderValid && unitsValid;
  };

  // Auto-advance when all fields are valid
  useEffect(() => {
    if (isValid() && touched.age && touched.gender && touched.unitsPreference) {
      const timer = setTimeout(() => {
        onNext();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [data.age, data.gender, data.unitsPreference, touched, onNext]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Let's start with the basics
        </h3>
        <p className="text-gray-600">
          Help us personalize your fitness and nutrition plans
        </p>
      </div>

      <div className="space-y-4">
        {/* Age Input */}
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
            How old are you?
          </label>
          <input
            id="age"
            type="number"
            min="13"
            max="100"
            value={data.age || ''}
            onChange={(e) => handleInputChange('age', parseInt(e.target.value) || null)}
            onBlur={(e) => handleBlur('age', parseInt(e.target.value) || null)}
            className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.age && touched.age ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your age"
            aria-describedby={errors.age ? "age-error" : undefined}
          />
          {errors.age && touched.age && (
            <motion.p
              id="age-error"
              className="text-red-600 text-sm mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.age}
            </motion.p>
          )}
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: 'male', label: 'Male', emoji: '👨' },
              { value: 'female', label: 'Female', emoji: '👩' },
              { value: 'other', label: 'Other', emoji: '👤' }
            ] as const).map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => handleInputChange('gender', option.value)}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  data.gender === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl mb-1">{option.emoji}</div>
                <div className="font-medium">{option.label}</div>
              </motion.button>
            ))}
          </div>
          {errors.gender && touched.gender && (
            <motion.p
              className="text-red-600 text-sm mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.gender}
            </motion.p>
          )}
        </div>

        {/* Units Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred units
          </label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'imperial', label: 'Imperial', desc: 'lbs, ft/in, °F' },
              { value: 'metric', label: 'Metric', desc: 'kg, cm, °C' }
            ] as const).map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => handleInputChange('unitsPreference', option.value)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  data.unitsPreference === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-500">{option.desc}</div>
              </motion.button>
            ))}
          </div>
          {errors.unitsPreference && touched.unitsPreference && (
            <motion.p
              className="text-red-600 text-sm mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.unitsPreference}
            </motion.p>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      {isValid() && (
        <motion.div
          className="flex items-center justify-center text-green-600 text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Looking good! Moving to next step...
        </motion.div>
      )}
    </div>
  );
}