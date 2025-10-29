import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faPlus } from '@fortawesome/pro-duotone-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const DIETARY_RESTRICTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'keto', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'low-carb', label: 'Low-Carb' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' }
];

const SERVING_SIZES = [2, 4, 6, 8];

const QuickOnboardingModal = ({ open, onClose, onComplete }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [selectedRestrictions, setSelectedRestrictions] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [servingSize, setServingSize] = useState(4);

  const toggleRestriction = (restrictionId) => {
    setSelectedRestrictions(prev =>
      prev.includes(restrictionId)
        ? prev.filter(id => id !== restrictionId)
        : [...prev, restrictionId]
    );
  };

  const addAllergy = () => {
    const trimmed = allergyInput.trim();
    if (trimmed && !allergies.includes(trimmed.toLowerCase())) {
      setAllergies([...allergies, trimmed.toLowerCase()]);
      setAllergyInput('');
    }
  };

  const removeAllergy = (allergyToRemove) => {
    setAllergies(allergies.filter(a => a !== allergyToRemove));
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      setError('No user logged in');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Update user profile with onboarding data
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        dietaryRestrictions: selectedRestrictions,
        allergies: allergies,
        defaultServingSize: servingSize,
        onboardingCompleted: true,
        updatedAt: new Date()
      });

      console.log('✅ Onboarding completed successfully');

      // Call completion handler
      if (onComplete) {
        await onComplete({
          dietaryRestrictions: selectedRestrictions,
          allergies: allergies,
          defaultServingSize: servingSize
        });
      }

      onClose();
    } catch (err) {
      console.error('❌ Error completing onboarding:', err);
      setError(err.message || 'Failed to save preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAllergy();
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to Fitful!</h2>
              <p className="text-sm text-gray-600 mt-1">Tell us about your dietary preferences</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-8">
            {/* Dietary Restrictions */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Dietary Restrictions
                <span className="text-gray-500 font-normal ml-2">(optional)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DIETARY_RESTRICTIONS.map(restriction => (
                  <motion.button
                    key={restriction.id}
                    onClick={() => toggleRestriction(restriction.id)}
                    className={`
                      px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium
                      ${selectedRestrictions.includes(restriction.id)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{restriction.label}</span>
                      {selectedRestrictions.includes(restriction.id) && (
                        <FontAwesomeIcon icon={faCheck} className="ml-2 text-green-600" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Allergies
                <span className="text-gray-500 font-normal ml-2">(optional)</span>
              </label>

              {/* Allergy Input */}
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., peanuts, shellfish, dairy"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-0 outline-none transition-colors"
                />
                <motion.button
                  onClick={addAllergy}
                  disabled={!allergyInput.trim()}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: allergyInput.trim() ? 1.02 : 1 }}
                  whileTap={{ scale: allergyInput.trim() ? 0.98 : 1 }}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </motion.button>
              </div>

              {/* Allergy Chips */}
              {allergies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy) => (
                    <motion.div
                      key={allergy}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center space-x-2"
                    >
                      <span className="capitalize">{allergy}</span>
                      <button
                        onClick={() => removeAllergy(allergy)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Serving Size */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Default Serving Size
                <span className="text-gray-500 font-normal ml-2">(servings per recipe)</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {SERVING_SIZES.map(size => (
                  <motion.button
                    key={size}
                    onClick={() => setServingSize(size)}
                    className={`
                      px-4 py-4 rounded-lg border-2 transition-all font-bold text-lg
                      ${servingSize === size
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                You can always adjust servings for individual recipes later
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Skip for now
            </button>
            <motion.button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              {isSubmitting ? 'Saving...' : 'Generate My Meal Plan'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickOnboardingModal;
