import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils,
  faClock,
  faFireFlame,
  faListCheck
} from '@fortawesome/pro-duotone-svg-icons';

export default function RecipeDetailModal({ open, onClose, recipe, mealType, isDark }) {
  if (!recipe) return null;

  const {
    name,
    calories,
    macros = {},
    ingredients = [],
    instructions = '',
    prepTime = 'N/A',
    cookTime = 'N/A'
  } = recipe;

  // Emoji mapping for meal types
  const mealEmojis = {
    breakfast: '🌅',
    lunch: '🌞',
    dinner: '🌙',
    snack1: '🍎',
    snack2: '🥤'
  };

  const getMealTypeDisplay = (type) => {
    if (type === 'snack1') return 'Morning Snack';
    if (type === 'snack2') return 'Afternoon Snack';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          as={motion.div}
          open={open}
          onClose={onClose}
          className="relative z-50"
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />

          {/* Full-screen container */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-2xl`}
            >
              {/* Header */}
              <div className={`sticky top-0 z-10 flex items-start justify-between p-6 border-b ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{mealEmojis[mealType] || '🍽️'}</span>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getMealTypeDisplay(mealType)}
                    </span>
                  </div>
                  <Dialog.Title className={`text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {name}
                  </Dialog.Title>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                  }`}
                  aria-label="Close recipe details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Stats */}
              <div className={`grid grid-cols-3 gap-4 p-6 border-b ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className={`text-center p-4 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-orange-50'
                }`}>
                  <FontAwesomeIcon icon={faFireFlame} className="text-orange-500 text-2xl mb-2" />
                  <div className={`text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {calories}
                  </div>
                  <div className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    calories
                  </div>
                </div>

                <div className={`text-center p-4 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-blue-50'
                }`}>
                  <FontAwesomeIcon icon={faClock} className="text-blue-500 text-2xl mb-2" />
                  <div className={`text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {prepTime}
                  </div>
                  <div className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    prep time
                  </div>
                </div>

                <div className={`text-center p-4 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-green-50'
                }`}>
                  <FontAwesomeIcon icon={faUtensils} className="text-green-500 text-2xl mb-2" />
                  <div className={`text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {cookTime}
                  </div>
                  <div className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    cook time
                  </div>
                </div>
              </div>

              {/* Nutrition Info */}
              <div className={`p-6 border-b ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Nutrition Facts
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className={`p-3 rounded-lg text-center ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className={`text-xl font-bold text-blue-500`}>
                      {macros.protein || 0}g
                    </div>
                    <div className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Protein
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className={`text-xl font-bold text-green-500`}>
                      {macros.carbs || 0}g
                    </div>
                    <div className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Carbs
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className={`text-xl font-bold text-purple-500`}>
                      {macros.fat || 0}g
                    </div>
                    <div className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Fat
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className={`p-6 border-b ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <FontAwesomeIcon icon={faListCheck} className="text-orange-500 text-lg" />
                  <h3 className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Ingredients
                  </h3>
                </div>
                <ul className="space-y-2">
                  {ingredients.map((ingredient, index) => (
                    <li
                      key={index}
                      className={`flex items-start gap-3 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FontAwesomeIcon icon={faUtensils} className="text-green-500 text-lg" />
                  <h3 className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Instructions
                  </h3>
                </div>
                <div className={`${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                } leading-relaxed whitespace-pre-line`}>
                  {instructions}
                </div>
              </div>

              {/* Footer */}
              <div className={`sticky bottom-0 p-6 border-t ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={onClose}
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
