import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBasket, ListChecks, MapPin, Check, Plus } from 'lucide-react';
import { getUserGroceryLists, getCurrentWeekData, getWeekData } from '../../lib/firestoreQueries';
import { useAuth } from '../../hooks/useAuth';
import { useWeekContext } from '../../hooks/useWeekContext';
import WeekSelector from '../ui/WeekSelector';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import type { GroceryListDoc } from '../../shared/schemas';
import type { WeekData } from '../../lib/firestoreQueries';

/** A store section as rendered by this component: AI-generated items are
 *  pre-formatted strings; custom items keep their object shape. */
interface UISection {
  section: string;
  items: Array<string | { name: string; quantity?: string }>;
  color: string;
}

export default function GroceriesContent({ isDark }: { isDark: boolean }) {
  const location = useLocation();
  const { user } = useAuth();

  // Week navigation context
  const weekContext = useWeekContext('sunday');
  const {
    selectedWeek,
    isCurrentWeek,
    isPastWeek,
    isFutureWeek,
    weekDisplay,
    canGoToPrevWeek,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek
  } = weekContext;

  const [groceryLists, setGroceryLists] = useState<GroceryListDoc[]>([]);
  const [currentWeekData, setCurrentWeekData] = useState<WeekData | null>(null);
  const [selectedWeekData, setSelectedWeekData] = useState<WeekData | null>(null); // Data for selected week
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWeek, setIsLoadingWeek] = useState(false); // Loading for week changes
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [customItemForm, setCustomItemForm] = useState({
    name: '',
    quantity: '',
    category: 'other',
    estimatedCost: ''
  });

  useEffect(() => {
    const fetchGroceries = async () => {
      if (!user?.uid) return;

      setIsLoading(true);
      try {
        // Bypass cache to get fresh data after generation
        const [userGroceryLists, weekData] = await Promise.all([
          getUserGroceryLists(user.uid, { bypassCache: true }),
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
  }, [user?.uid, location.pathname, location.key]);

  // Fetch data for selected week when week changes
  useEffect(() => {
    const fetchSelectedWeekData = async () => {
      if (!user?.uid || !selectedWeek) return;

      setIsLoadingWeek(true);
      try {
        const weekData = await getWeekData(user.uid, selectedWeek);
        setSelectedWeekData(weekData);
      } catch (error) {
        console.error('❌ Error fetching selected week grocery data:', error);
      } finally {
        setIsLoadingWeek(false);
      }
    };

    fetchSelectedWeekData();
  }, [user?.uid, selectedWeek]);

  // Derive current grocery list
  const currentGroceryList = currentWeekData?.groceryList || groceryLists[0];

  // Use current week's data when viewing current week, otherwise use selected week's data (or null for empty state)
  const displayedGroceryList = isCurrentWeek ? currentGroceryList : (selectedWeekData?.groceryList || null);

  // Load checked items from displayed grocery list
  useEffect(() => {
    if (displayedGroceryList?.checkedItems) {
      setCheckedItems(displayedGroceryList.checkedItems);
    } else {
      setCheckedItems([]);
    }
    if (displayedGroceryList?.completedSections) {
      setCompletedSections(displayedGroceryList.completedSections);
    } else {
      setCompletedSections([]);
    }
  }, [displayedGroceryList]);

  // Pantry tracking functions
  const toggleItemChecked = async (itemName: string, sectionName: string) => {
    const isChecked = checkedItems.includes(itemName);
    let newCheckedItems: string[];

    if (isChecked) {
      // Uncheck item
      newCheckedItems = checkedItems.filter(item => item !== itemName);
    } else {
      // Check item
      newCheckedItems = [...checkedItems, itemName];
    }

    setCheckedItems(newCheckedItems);

    // Check if this completes/uncompletes the section
    const sectionItems = groceryItems.find(section => section.section === sectionName)?.items || [];
    const sectionItemNames = sectionItems.map(item => typeof item === 'string' ? item.split(' (')[0] : item.name);
    const checkedSectionItems = newCheckedItems.filter(item =>
      sectionItemNames.some(sectionItem => sectionItem.includes(item) || item.includes(sectionItem))
    );

    let newCompletedSections = [...completedSections];

    if (checkedSectionItems.length === sectionItems.length && !isChecked) {
      // Section just became complete
      if (!newCompletedSections.includes(sectionName)) {
        newCompletedSections.push(sectionName);
      }
    } else if (isChecked && newCompletedSections.includes(sectionName)) {
      // Section is no longer complete
      newCompletedSections = newCompletedSections.filter(section => section !== sectionName);
    }

    setCompletedSections(newCompletedSections);

    // Save to Firestore
    if (currentGroceryList?.id) {
      try {
        const groceryRef = doc(db, 'groceries', currentGroceryList.id);
        await updateDoc(groceryRef, {
          checkedItems: newCheckedItems,
          completedSections: newCompletedSections,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Error updating grocery list:', error);
      }
    }
  };

  // Calculate remaining cost (excluding checked items)
  const calculateRemainingCost = () => {
    if (!displayedGroceryList?.sections) return { totalCost: 0, remainingCost: 0 };

    let totalCost = 0;
    let remainingCost = 0;

    Object.values(displayedGroceryList.sections).forEach(section => {
      section.items.forEach(item => {
        totalCost += item.estimatedCost || 0;
        const itemName = item.item.split(' (')[0]; // Remove quantity from name
        if (!checkedItems.includes(itemName)) {
          remainingCost += item.estimatedCost || 0;
        }
      });
    });

    // Add custom items to cost
    const customItems = displayedGroceryList?.customItems || [];
    customItems.forEach(item => {
      const cost = Number(item.estimatedCost) || 0;
      totalCost += cost;
      if (!checkedItems.includes(item.name)) {
        remainingCost += cost;
      }
    });

    return { totalCost, remainingCost };
  };

  // Add custom item to grocery list
  const handleAddCustomItem = async () => {
    if (!customItemForm.name.trim() || !currentGroceryList?.id) return;

    try {
      const customItems = currentGroceryList.customItems || [];
      const newItem = {
        name: customItemForm.name.trim(),
        quantity: customItemForm.quantity.trim() || '1',
        category: customItemForm.category,
        estimatedCost: parseFloat(customItemForm.estimatedCost) || 0,
        addedAt: new Date().toISOString(),
        isCustom: true
      };

      const updatedCustomItems = [...customItems, newItem];

      // Update Firestore
      const groceryRef = doc(db, 'groceries', currentGroceryList.id);
      await updateDoc(groceryRef, {
        customItems: updatedCustomItems,
        updatedAt: new Date()
      });

      // Update local state
      setGroceryLists(prevLists =>
        prevLists.map(list =>
          list.id === currentGroceryList.id
            ? { ...list, customItems: updatedCustomItems }
            : list
        )
      );

      // Reset form and close modal
      setCustomItemForm({ name: '', quantity: '', category: 'other', estimatedCost: '' });
      setShowAddItemModal(false);
    } catch (error) {
      console.error('Error adding custom item:', error);
    }
  };

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
        <ShoppingBasket className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
        <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          No grocery lists found
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Your smart grocery lists will appear here once generated.
        </p>
      </div>
    );
  }

  const isPlaceholder = displayedGroceryList?.type === 'placeholder';

  // Sample grocery data structure (fallback)
  const sampleItems: UISection[] = [
    { section: 'Produce', items: ['Spinach (5oz bag)', 'Avocados (2 count)', 'Sweet potatoes (3 lbs)', 'Broccoli crowns (2 heads)'], color: 'green' },
    { section: 'Proteins', items: ['Chicken breast (2 lbs)', 'Salmon fillets (1 lb)', 'Greek yogurt (32oz)', 'Eggs (dozen)'], color: 'blue' },
    { section: 'Pantry', items: ['Rolled oats (32oz)', 'Olive oil (16oz)', 'Quinoa (2 lbs)', 'Almond butter (16oz)'], color: 'purple' }
  ];

  // Transform stored grocery data structure to UI format
  const transformGroceryData = (groceryData: GroceryListDoc): UISection[] => {
    if (!groceryData?.sections) return sampleItems;

    const colorMap: Record<string, string> = {
      produce: 'green',
      proteins: 'blue',
      dairy: 'blue',
      pantry: 'purple',
      frozen: 'purple'
    };

    return Object.entries(groceryData.sections).map(([key, section]) => ({
      section: section.name,
      items: section.items.map(item => `${item.item} (${item.quantity})`),
      color: colorMap[key] || 'gray'
    }));
  };

  const groceryItems = displayedGroceryList?.sections ?
    transformGroceryData(displayedGroceryList) : sampleItems;

  // Calculate costs
  const { totalCost, remainingCost } = calculateRemainingCost();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Week Navigation */}
      <WeekSelector
        weekDisplay={weekDisplay}
        isCurrentWeek={isCurrentWeek}
        isPastWeek={isPastWeek}
        isFutureWeek={isFutureWeek}
        canGoToPrevWeek={canGoToPrevWeek}
        goToNextWeek={goToNextWeek}
        goToPrevWeek={goToPrevWeek}
        goToCurrentWeek={goToCurrentWeek}
        isDark={isDark}
      />

      {/* Selected Week Section */}
      {isLoadingWeek ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <svg className="animate-spin h-6 w-6 text-orange-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Loading grocery list...</span>
          </div>
        </div>
      ) : !displayedGroceryList ? (
        /* Empty State - No grocery list for this week */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-12 text-center rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
        >
          <div className="mb-4">
            <ShoppingBasket className={`w-16 h-16 mx-auto ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No Grocery List for This Week
          </h3>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {isFutureWeek
              ? 'This week hasn\'t been planned yet. Grocery lists are generated with meal plans.'
              : isPastWeek
              ? 'No grocery list was generated for this week.'
              : 'Generate a meal plan to create your grocery list!'}
          </p>
          {isCurrentWeek && (
            <a
              href="/dashboard"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Generate Meal Plan
            </a>
          )}
        </motion.div>
      ) : (
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isPlaceholder ? 'Sample Grocery Structure' : (isCurrentWeek ? 'This Week\'s Grocery List' : 'Week Overview')}
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
                    Week of {displayedGroceryList.weekStartDate?.replace(/_/g, '/') || new Date().toLocaleDateString()}
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
                      {(section.items || []).map((item, itemIndex) => {
                        const itemName = typeof item === 'string' ? item.split(' (')[0] : item.name;
                        const isChecked = checkedItems.includes(itemName);

                        return (
                          <div
                            key={itemIndex}
                            className={`flex items-center space-x-2 p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}
                            onClick={() => toggleItemChecked(itemName, section.section)}
                          >
                            <button className={`w-5 h-5 border-2 rounded ${isDark ? 'border-gray-600 hover:border-green-500' : 'border-gray-300 hover:border-green-500'} flex items-center justify-center ${isChecked ? 'bg-green-500 border-green-500' : ''}`}>
                              <Check
                                className={`text-white w-3 h-3 ${isChecked ? 'opacity-100' : 'opacity-0'}`}
                              />
                            </button>
                            <span className={`text-sm ${isChecked ? 'line-through opacity-50' : ''} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {typeof item === 'string' ? item : item.name}
                              {isChecked && <span className="ml-2 text-xs text-green-600">✓ In Pantry</span>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Custom Items Section */}
                {currentGroceryList?.customItems && currentGroceryList.customItems.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className={`w-3 h-3 rounded-full bg-gray-500`}></div>
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        My Custom Items ({currentGroceryList.customItems.length} items)
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-5">
                      {currentGroceryList.customItems.map((item, itemIndex) => {
                        const isChecked = checkedItems.includes(item.name);
                        return (
                          <div
                            key={itemIndex}
                            className={`flex items-center space-x-2 p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}
                            onClick={() => toggleItemChecked(item.name, 'custom')}
                          >
                            <button className={`w-5 h-5 border-2 rounded ${isDark ? 'border-gray-600 hover:border-green-500' : 'border-gray-300 hover:border-green-500'} flex items-center justify-center ${isChecked ? 'bg-green-500 border-green-500' : ''}`}>
                              <Check
                                className={`text-white w-3 h-3 ${isChecked ? 'opacity-100' : 'opacity-0'}`}
                              />
                            </button>
                            <span className={`text-sm ${isChecked ? 'line-through opacity-50' : ''} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {item.name} ({item.quantity})
                              {isChecked && <span className="ml-2 text-xs text-green-600">✓ In Pantry</span>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Add Custom Item Button */}
              <motion.button
                onClick={() => setShowAddItemModal(true)}
                className={`w-full mt-4 py-3 rounded-lg border-2 border-dashed ${
                  isDark
                    ? 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
                    : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700'
                } transition-colors flex items-center justify-center space-x-2`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Plus className="w-5 h-5" />
                <span>Add Custom Item</span>
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
                {/* Remaining Cost */}
                <div className="text-center p-4 rounded-lg bg-green-50">
                  <div className="text-2xl font-bold text-green-600">
                    ${remainingCost.toFixed(2)}
                  </div>
                  <div className="text-xs text-green-600">Remaining Cost</div>
                  {totalCost > remainingCost && (
                    <div className="text-xs text-gray-500 mt-1">
                      ${(totalCost - remainingCost).toFixed(2)} saved (in pantry)
                    </div>
                  )}
                </div>

                {/* Budget Progress */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Weekly Budget
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${Math.round(remainingCost)}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min((remainingCost / 100) * 100, 100)}%` }}
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
          <MapPin className="text-blue-500 w-5 h-5" />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Optimized Store Route
          </h3>
        </div>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
          Your list is organized by typical store layout for efficient shopping.
        </p>
        <div className="flex flex-wrap gap-3">
          {groceryItems.map((section, index) => {
            const isCompleted = completedSections.includes(section.section);

            return (
              <div
                key={index}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full border cursor-pointer transition-all ${
                  isCompleted
                    ? 'border-green-500 bg-green-50 opacity-75'
                    : isDark ? 'border-gray-600 bg-gray-700 hover:border-gray-500' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => {
                  // Allow manual section completion toggle
                  const newCompletedSections = isCompleted
                    ? completedSections.filter(s => s !== section.section)
                    : [...completedSections, section.section];
                  setCompletedSections(newCompletedSections);

                  // Save to Firestore
                  if (currentGroceryList?.id) {
                    try {
                      const groceryRef = doc(db, 'groceries', currentGroceryList.id);
                      updateDoc(groceryRef, {
                        completedSections: newCompletedSections,
                        updatedAt: new Date()
                      });
                    } catch (error) {
                      console.error('Error updating completed sections:', error);
                    }
                  }
                }}
              >
                <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : `bg-${section.color}-500`}`}></div>
                <span className={`text-sm ${isCompleted ? 'text-green-700 line-through' : isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {index + 1}. {section.section}
                </span>
                {isCompleted && (
                  <Check className="text-green-500 w-3 h-3 ml-1 inline-block" />
                )}
              </div>
            );
          })}
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
          <ListChecks className="w-10 h-10 text-green-500 mb-3 mx-auto" />
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

      {/* Add Custom Item Modal */}
      {showAddItemModal && (
        <Dialog
          open={showAddItemModal}
          onClose={() => setShowAddItemModal(false)}
          className="relative z-50"
        >
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-2xl`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <Dialog.Title className={`text-xl font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Add Custom Item
                </Dialog.Title>
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={customItemForm.name}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, name: e.target.value })}
                    placeholder="e.g., Avocados"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                    autoFocus
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Quantity
                  </label>
                  <input
                    type="text"
                    value={customItemForm.quantity}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, quantity: e.target.value })}
                    placeholder="e.g., 2 count"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Category
                  </label>
                  <select
                    value={customItemForm.category}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, category: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  >
                    <option value="produce">Produce</option>
                    <option value="proteins">Proteins</option>
                    <option value="dairy">Dairy</option>
                    <option value="pantry">Pantry</option>
                    <option value="frozen">Frozen</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Estimated Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={customItemForm.estimatedCost}
                    onChange={(e) => setCustomItemForm({ ...customItemForm, estimatedCost: e.target.value })}
                    placeholder="e.g., 3.99"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className={`flex justify-end gap-3 p-6 border-t ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomItem}
                  disabled={!customItemForm.name.trim()}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !customItemForm.name.trim()
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Add Item
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
}