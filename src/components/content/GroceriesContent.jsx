import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBasketShopping,
  faListCheck,
  faDollarSign,
  faMapMarkerAlt,
  faCheck,
  faShoppingCart
} from '@fortawesome/pro-duotone-svg-icons';
import { getUserGroceryLists, getCurrentWeekData } from '../../lib/firestoreQueries';
import { useAuth } from '../../hooks/useAuth';

export default function GroceriesContent({ isDark }) {
  const { user } = useAuth();
  const [groceryLists, setGroceryLists] = useState([]);
  const [currentWeekData, setCurrentWeekData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGroceries = async () => {
      if (!user?.uid) return;

      setIsLoading(true);
      try {
        const [userGroceryLists, weekData] = await Promise.all([
          getUserGroceryLists(user.uid),
          getCurrentWeekData(user.uid)
        ]);

        setGroceryLists(userGroceryLists);
        setCurrentWeekData(weekData);
      } catch (error) {
        console.error('❌ Error loading groceries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroceries();
  }, [user?.uid]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-6 w-6 text-green-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading your grocery lists...</span>
        </div>
      </div>
    );
  }

  if (!groceryLists.length) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faBasketShopping} className="text-6xl text-gray-400 mb-4" />
        <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          No grocery lists found
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Your smart grocery lists will appear here once generated.
        </p>
      </div>
    );
  }

  const currentGroceryList = currentWeekData?.groceryList || groceryLists[0];
  const isPlaceholder = currentGroceryList?.type === 'placeholder';

  // Sample grocery data structure
  const sampleItems = [
    { section: 'Produce', items: ['Spinach (5oz bag)', 'Avocados (2 count)', 'Sweet potatoes (3 lbs)', 'Broccoli crowns (2 heads)'], color: 'green' },
    { section: 'Proteins', items: ['Chicken breast (2 lbs)', 'Salmon fillets (1 lb)', 'Greek yogurt (32oz)', 'Eggs (dozen)'], color: 'blue' },
    { section: 'Pantry', items: ['Rolled oats (32oz)', 'Olive oil (16oz)', 'Quinoa (2 lbs)', 'Almond butter (16oz)'], color: 'purple' }
  ];

  const groceryItems = currentGroceryList?.items || sampleItems;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Current Week Section */}
      {currentGroceryList && (
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isPlaceholder ? 'Sample Grocery Structure' : 'This Week\'s Grocery List'}
          </h2>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Grocery List Card */}
            <motion.div
              className={`lg:col-span-2 p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Shopping List
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Week of {currentGroceryList.weekStartDate?.replace(/_/g, '/') || new Date().toLocaleDateString()}
                  </p>
                </div>
                {isPlaceholder && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Sample
                  </span>
                )}
              </div>

              <div className="space-y-6">
                {groceryItems.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className={`w-3 h-3 rounded-full bg-${section.color}-500`}></div>
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {section.section} ({section.items?.length || 0} items)
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-5">
                      {(section.items || []).map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className={`flex items-center space-x-2 p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}
                        >
                          <button className={`w-5 h-5 border-2 rounded ${isDark ? 'border-gray-600 hover:border-green-500' : 'border-gray-300 hover:border-green-500'} flex items-center justify-center`}>
                            <FontAwesomeIcon icon={faCheck} className="text-green-500 text-xs opacity-0 hover:opacity-100" />
                          </button>
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {typeof item === 'string' ? item : item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <motion.button
                className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FontAwesomeIcon icon={faShoppingCart} />
                <span>{isPlaceholder ? 'Preview Shopping Mode' : 'Start Shopping'}</span>
              </motion.button>
            </motion.div>

            {/* Budget & Summary Card */}
            <motion.div
              className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Shopping Summary
              </h4>

              <div className="space-y-4">
                {/* Total Cost */}
                <div className="text-center p-4 rounded-lg bg-green-50">
                  <div className="text-2xl font-bold text-green-600">
                    ${currentGroceryList?.estimatedTotal || '76.20'}
                  </div>
                  <div className="text-xs text-green-600">Estimated Total</div>
                </div>

                {/* Budget Progress */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Weekly Budget
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${currentGroceryList?.estimatedTotal || '76'}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${((currentGroceryList?.estimatedTotal || 76) / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Item Count by Section */}
                <div className="space-y-2">
                  {groceryItems.map((section, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {section.section}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        section.color === 'green' ? 'bg-green-100 text-green-800' :
                        section.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {section.items?.length || 0} items
                      </span>
                    </div>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="text-center p-2 rounded-lg bg-blue-50">
                    <div className="text-lg font-bold text-blue-600">
                      {groceryItems.reduce((total, section) => total + (section.items?.length || 0), 0)}
                    </div>
                    <div className="text-xs text-blue-600">Total Items</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-purple-50">
                    <div className="text-lg font-bold text-purple-600">
                      {groceryItems.length}
                    </div>
                    <div className="text-xs text-purple-600">Sections</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Store Layout Helper */}
      <motion.div
        className={`mb-8 p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500 text-xl" />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Optimized Store Route
          </h3>
        </div>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
          Your list is organized by typical store layout for efficient shopping.
        </p>
        <div className="flex flex-wrap gap-3">
          {groceryItems.map((section, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
            >
              <div className={`w-2 h-2 rounded-full bg-${section.color}-500`}></div>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {index + 1}. {section.section}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Grocery Lists History */}
      {groceryLists.length > 1 && (
        <div>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Previous Lists
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groceryLists.slice(1).map((list, index) => (
              <motion.div
                key={list.id}
                className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'} cursor-pointer transition-all`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Week of {list.weekStartDate?.replace(/_/g, '/')}
                  </h3>
                  {list.type === 'placeholder' && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Sample
                    </span>
                  )}
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                  {list.isCompleted ? '✅ Completed' : `${list.items?.length || 0} items`}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    ${list.estimatedTotal || '0.00'}
                  </span>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {list.generatedBy || 'manual'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No real grocery lists message */}
      {groceryLists.every(l => l.type === 'placeholder') && (
        <motion.div
          className={`mt-8 p-6 rounded-xl border border-dashed ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'} text-center`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <FontAwesomeIcon icon={faListCheck} className="text-4xl text-green-500 mb-3" />
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Ready for Smart Grocery Lists?
          </h3>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            The sample list above shows the structure. Soon you'll have grocery lists auto-generated from your meal plans!
          </p>
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Generate My First Grocery List
          </button>
        </motion.div>
      )}
    </div>
  );
}