import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketShopping, faListCheck, faDollarSign, faMapMarkerAlt } from "@fortawesome/pro-duotone-svg-icons";
import { useAuth } from "../../hooks/useAuth";
import GroceriesContent from "../../components/content/GroceriesContent";

function Groceries({ isDark }) {
    const { user, userProfile } = useAuth();
    const [showSplash, setShowSplash] = useState(true);

    // Single state logic
    const userState = user && userProfile?.onboardingCompleted ? "onboarded" : user ? "logged" : "unlogged";

    console.log('🫒 Groceries page - userState:', userState, {
        hasUser: !!user,
        hasProfile: !!userProfile,
        onboardingCompleted: userProfile?.onboardingCompleted
    });

    // Handle splash screen timing
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 1200); // Show splash for 1.2 seconds minimum

        return () => clearTimeout(timer);
    }, []);

    const getMessage = () => {
        switch (userState) {
            case "unlogged":
                return "Smart grocery lists from your meal plans - Sign in to get started!";
            case "logged":
                return "Complete your profile to unlock smart grocery lists!";
            case "onboarded":
                return "Your smart grocery lists are ready!";
            default:
                return "Loading groceries...";
        }
    };

    const SplashScreen = () => (
        <motion.div
            className="flex flex-col items-center justify-center py-24"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* App Logo + Page Icon */}
            <div className="flex items-center space-x-4 mb-6">
                <div className={`text-4xl ${isDark ? 'text-[var(--color-orange)]' : 'text-[var(--color-dk-gray)]'} font-bold`}>
                    FitfulAI
                </div>
                <FontAwesomeIcon icon={faBasketShopping} className="text-green-500 text-4xl" />
            </div>

            {/* Page Title */}
            <h1
                className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
                Groceries
            </h1>

            {/* Loading Indicator */}
            <div
                className="flex items-center space-x-3"
            >
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Preparing your smart grocery lists...
                </span>
            </div>
        </motion.div>
    );

    const PreviewContent = () => (
        <div className="max-w-6xl mx-auto">
            {/* Feature Intro */}
            <div className="text-center mb-12">
                <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    See Your Smart Grocery Lists
                </h2>
                <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                    Automatically generated shopping lists from your meal plans, organized for maximum efficiency.
                </p>
            </div>

            {/* Preview Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* This Week's List Card */}
                <motion.div
                    className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <FontAwesomeIcon icon={faBasketShopping} className="text-green-500 text-2xl" />
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            This Week's List
                        </h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Produce (8 items)</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">$24.50</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Proteins (6 items)</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">$32.80</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Pantry (12 items)</span>
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">$18.90</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-green-600">26 items total</span>
                            <span className="text-sm font-bold text-green-600">$76.20</span>
                        </div>
                    </div>
                </motion.div>

                {/* Smart Organization Card */}
                <motion.div
                    className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <FontAwesomeIcon icon={faListCheck} className="text-blue-500 text-2xl" />
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Store Layout
                        </h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Produce Section</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Meat & Seafood</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Dairy & Eggs</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Pantry Items</span>
                        </div>
                    </div>
                    {/* <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        View Full List
                    </button> */}
                </motion.div>

                {/* Budget Tracker Card */}
                <motion.div
                    className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <FontAwesomeIcon icon={faDollarSign} className="text-purple-500 text-2xl" />
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Budget Tracking
                        </h3>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Weekly Budget</span>
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>$76/$100</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '76%' }}></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className="text-center">
                                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>$24</div>
                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Saved this week</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>$312</div>
                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Monthly total</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Feature Benefits */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Shop Smarter
                    </h3>
                    <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li>• Lists organized by store layout</li>
                        <li>• Automatic quantity calculations</li>
                        <li>• Budget tracking and cost estimates</li>
                        <li>• Ingredient consolidation across meals</li>
                    </ul>
                </div>
                <div>
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Never Miss Anything
                    </h3>
                    <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li>• Auto-sync with your meal plans</li>
                        <li>• Check off items as you shop</li>
                        <li>• Substitute suggestions for missing items</li>
                        <li>• Weekly and monthly shopping insights</li>
                    </ul>
                </div>
            </div>

            {/* CTA Button */}
            {/* <div className="text-center">
                <motion.button
                    className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Get Started with Smart Grocery Lists
                </motion.button>
            </div> */}
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
                            {/* <motion.div
                                className="flex items-center space-x-4 mb-8"
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.5 }}
                            >
                                <FontAwesomeIcon icon={faBasketShopping} className="text-green-500 text-3xl" />
                                <div>
                                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                        Groceries
                                    </h1>
                                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        State: {userState}
                                    </p>
                                </div>
                            </motion.div> */}

                            {/* Centered State Message - Only show for non-onboarded users */}
                            {/* {userState !== "onboarded" && (
                                <motion.div
                                    className="text-center mb-12"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                >
                                    <h2 className={`text-xl font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                        {getMessage()}
                                    </h2>
                                </motion.div>
                            )} */}
                        </div>

                        {/* Content based on user state */}
                        <div
                            className="px-8 pb-8"
                        >
                            {userState === "onboarded" ? (
                                <GroceriesContent isDark={isDark} />
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

export default Groceries;