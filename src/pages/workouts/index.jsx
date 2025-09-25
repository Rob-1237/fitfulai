import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonRunning, faDumbbell, faStopwatch, faBullseyeArrow } from "@fortawesome/pro-duotone-svg-icons";
import { useAuth } from "../../hooks/useAuth";
import WorkoutsContent from "../../components/content/WorkoutsContent";

function Workouts({ isDark }) {
    const { user, userProfile } = useAuth();
    const [showSplash, setShowSplash] = useState(true);

    // Single state logic
    const userState = user && userProfile?.onboardingCompleted ? "onboarded" : user ? "logged" : "unlogged";

    console.log('🏃 Workouts page - userState:', userState, {
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
                return "AI-powered fitness plans tailored to you - Sign in to get started!";
            case "logged":
                return "Complete your profile to unlock personalized workout plans!";
            case "onboarded":
                return "Your personalized workout plans are ready!";
            default:
                return "Loading workouts...";
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
            <div
                className="flex items-center space-x-4 mb-6"
            >
                <div className={`text-4xl ${isDark ? 'text-[var(--color-orange)]' : 'text-[var(--color-dk-gray)]'} font-bold`}>
                    FitfulAI
                </div>
                <FontAwesomeIcon icon={faPersonRunning} className="text-blue-500 text-4xl" />
            </div>

            {/* Page Title */}
            <h1
                className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
                Workouts
            </h1>

            {/* Loading Indicator */}
            <div
                className="flex items-center space-x-3"
            >
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Preparing your personalized workouts...
                </span>
            </div>
        </motion.div>
    );

    const PreviewContent = () => (
        <div className="max-w-6xl mx-auto">
            {/* Feature Intro */}
            <div className="text-center mb-12">
                <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    See Your Personalized Workout Plans
                </h2>
                <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                    Fitness plans designed specifically for your goals, fitness level, and available time.
                </p>
            </div>

            {/* Preview Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* Weekly Plan Card */}
                <motion.div
                    className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <FontAwesomeIcon icon={faPersonRunning} className="text-blue-500 text-2xl" />
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            This Week's Plan
                        </h3>
                    </div>
                    <div className="space-y-2">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <strong>Monday:</strong> Upper Body Strength
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <strong>Wednesday:</strong> Cardio & Core
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <strong>Friday:</strong> Full Body Circuit
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <span className="text-sm text-blue-600 font-medium">3 workouts planned</span>
                    </div>
                </motion.div>

                {/* Today's Workout Card */}
                <motion.div
                    className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <FontAwesomeIcon icon={faDumbbell} className="text-green-500 text-2xl" />
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Today's Workout
                        </h3>
                    </div>
                    <div className="space-y-3">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            Upper Body Strength Training
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <FontAwesomeIcon icon={faStopwatch} className="text-orange-500" />
                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>45 min</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <FontAwesomeIcon icon={faBullseyeArrow} className="text-red-500" />
                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>6 exercises</span>
                            </div>
                        </div>
                    </div>
                    <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                        Start Workout
                    </button>
                </motion.div>

                {/* Progress Card */}
                <motion.div
                    className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <FontAwesomeIcon icon={faBullseyeArrow} className="text-purple-500 text-2xl" />
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Your Progress
                        </h3>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>This Week</span>
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>2/3 workouts</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className="text-center">
                                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>24</div>
                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total workouts</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>18h</div>
                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Time trained</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Feature Benefits */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Personalized for You
                    </h3>
                    <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li>• Workouts adapted to your fitness level</li>
                        <li>• Exercise selection based on your goals</li>
                        <li>• Flexible scheduling around your availability</li>
                        <li>• Progressive difficulty as you improve</li>
                    </ul>
                </div>
                <div>
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Smart Features
                    </h3>
                    <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li>• Exercise recommendations</li>
                        <li>• Progress tracking and analytics</li>
                        <li>• Workout history and achievements</li>
                        <li>• Adjustable intensity and duration</li>
                    </ul>
                </div>
            </div>

            {/* CTA Button */}
            {/* <div className="text-center">
                <motion.button
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Get Started with Your Workout Plan
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
                                <FontAwesomeIcon icon={faPersonRunning} className="text-blue-500 text-3xl" />
                                <div>
                                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                        Workouts
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
                                <WorkoutsContent isDark={isDark} />
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

export default Workouts;