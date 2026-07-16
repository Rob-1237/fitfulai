import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Utensils, Clock, Flame } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import MealsContent from "../../components/content/MealsContent";

function Meals({ isDark }) {
    const { user, userProfile } = useAuth();
    const [showSplash, setShowSplash] = useState(true);

    // Single state logic
    const userState = user && userProfile?.onboardingCompleted ? "onboarded" : user ? "logged" : "unlogged";

    // Handle splash screen timing
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 1200); // Show splash for 1.2 seconds minimum

        return () => clearTimeout(timer);
    }, []);

    const SplashScreen = () => (
        <motion.div
            className="flex flex-col items-center justify-center py-24"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* App Logo + Page Icon */}
            <div
                className="flex items-center space-x-4 mb-6"
            >
                <div className={`text-4xl ${isDark ? 'text-[var(--color-orange)]' : 'text-[var(--color-dk-gray)]'} font-bold`}>
                    FitfulAI
                </div>
                <UtensilsCrossed className="text-orange-500 w-10 h-10" />
            </div>

            {/* Page Title */}
            <h1
                className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
                Meals
            </h1>

            {/* Loading Indicator */}
            <div
                className="flex items-center space-x-3"
            >
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Preparing your personalized meal plans...
                </span>
            </div>
        </motion.div>
    );

    const PreviewContent = () => (
        <div className="max-w-6xl mx-auto">
            {/* Feature Intro */}
            <div className="text-center mb-12">
                <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    See Your Personalized Meal Plans
                </h2>
                <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                    Nutrition plans tailored to your dietary preferences, goals, and macro targets.
                </p>
            </div>

            {/* Preview Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* Today's Meals Card */}
                <motion.div
                    className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <UtensilsCrossed className="text-orange-500 w-6 h-6" />
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Today's Meals
                        </h3>
                    </div>
                    <div className="space-y-3">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <strong>Breakfast:</strong> Protein Oatmeal Bowl
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <strong>Lunch:</strong> Grilled Chicken Salad
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <strong>Dinner:</strong> Salmon with Vegetables
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <strong>Snack:</strong> Greek Yogurt & Berries
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <span className="text-sm text-orange-600 font-medium">1,850 calories planned</span>
                    </div>
                </motion.div>

                {/* Recipe Suggestion Card */}
                <motion.div
                    className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <Utensils className="text-green-500 w-6 h-6" />
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Next Meal
                        </h3>
                    </div>
                    <div className="space-y-3">
                        <div className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            Protein Power Bowl
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <Clock className="text-blue-500 w-4 h-4" />
                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>25 min</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Flame className="text-red-500 w-4 h-4" />
                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>520 cal</span>
                            </div>
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Quinoa, grilled chicken, roasted vegetables, avocado
                        </div>
                    </div>
                    <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                        View Recipe
                    </button>
                </motion.div>

                {/* Macro Tracker Card */}
                <motion.div
                    className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <Flame className="text-purple-500 w-6 h-6" />
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Daily Targets
                        </h3>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Protein</span>
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>45/150g</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Carbs</span>
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>85/200g</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Fat</span>
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>28/65g</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '43%' }}></div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Feature Benefits */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Nutrition Made Simple
                    </h3>
                    <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li>• Meals matched to your calorie targets</li>
                        <li>• Recipes that fit your dietary preferences</li>
                        <li>• Automatic macro tracking and optimization</li>
                        <li>• Weekly meal planning and prep guides</li>
                    </ul>
                </div>
                <div>
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Smart Recipe Engine
                    </h3>
                    <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li>• Recipes based on preferences</li>
                        <li>• Ingredient substitutions for allergies</li>
                        <li>• Cooking time and difficulty ratings</li>
                        <li>• Nutritional breakdowns for every meal</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    return (
        <motion.div
            className={`min-h-screen ${isDark ? 'bg-[var(--color-black)]' : 'bg-[var(--color-white)]'}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <AnimatePresence mode="wait">
                {showSplash ? (
                    <motion.div key="splash">
                        <SplashScreen />
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Header Section */}
                        <div className="p-8">
                            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Meals
                            </h1>
                        </div>

                        {/* Content based on user state */}
                        <div
                            className="px-8 pb-8"
                        >
                            {userState === "onboarded" ? (
                                <MealsContent isDark={isDark} />
                            ) : (
                                <PreviewContent />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default Meals;