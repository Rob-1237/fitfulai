import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartUser, faRobot, faPersonRunning, faPlateUtensils, faBasketShopping, faBrain, faClock } from "@fortawesome/pro-duotone-svg-icons";
import { useAuth } from "../../hooks/useAuth";
import { getUserWorkouts, getUserMealPlans, getUserGroceryLists } from "../../lib/firestoreQueries";
import ProfileEditor from "../../components/dashboard/ProfileEditor";
import GenerationProgressModal from "../../components/generation/GenerationProgressModal";

function Dashboard({ isDark }) {
    const { user, userProfile, refreshUserProfile } = useAuth();
    const [showRegenerateModal, setShowRegenerateModal] = useState(false);
    const [lastGeneratedDate, setLastGeneratedDate] = useState(null);
    const [hasGeneratedPlans, setHasGeneratedPlans] = useState(false);

    // Single state logic
    const userState = user && userProfile?.onboardingCompleted ? "onboarded" : user ? "logged" : "unlogged";

    console.log('📊 Dashboard page - userState:', userState, {
        hasUser: !!user,
        hasProfile: !!userProfile,
        onboardingCompleted: userProfile?.onboardingCompleted
    });

    // Fetch last generation date when user is onboarded
    useEffect(() => {
        const fetchLastGenerationDate = async () => {
            if (!user?.uid || userState !== "onboarded") return;

            try {
                // Fetch all three plan types
                const [workouts, meals, groceries] = await Promise.all([
                    getUserWorkouts(user.uid),
                    getUserMealPlans(user.uid),
                    getUserGroceryLists(user.uid)
                ]);

                // Check if any plans exist
                const hasPlans = workouts.length > 0 || meals.length > 0 || groceries.length > 0;
                setHasGeneratedPlans(hasPlans);

                // Find the most recent generation date across all plan types
                const allDates = [
                    ...workouts.map(w => w.generatedAt),
                    ...meals.map(m => m.generatedAt),
                    ...groceries.map(g => g.generatedAt)
                ].filter(date => date); // Remove nulls

                if (allDates.length > 0) {
                    // Convert Firestore timestamps to JS dates and find the latest
                    const latestDate = allDates
                        .map(timestamp => timestamp.toDate ? timestamp.toDate() : new Date(timestamp))
                        .sort((a, b) => b - a)[0];

                    setLastGeneratedDate(latestDate);
                }
            } catch (error) {
                console.error('Error fetching last generation date:', error);
            }
        };

        fetchLastGenerationDate();
    }, [user, userState]);

    const getMessage = () => {
        switch (userState) {
            case "unlogged":
                return "Your central hub for AI-powered fitness and nutrition - Sign in to get started!";
            case "logged":
                return "Welcome! Complete your profile to unlock your personalized dashboard!";
            case "onboarded":
                return "Welcome to your personalized fitness and nutrition dashboard!";
            default:
                return "Loading dashboard...";
        }
    };

    const PreviewContent = () => (
        <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h2 className={`text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Your Complete Fitness Assistant
                </h2>
                <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto mb-8`}>
                    Fitful combines personalized fitness and nutrition science to create a comprehensive wellness platform tailored uniquely to you.
                </p>
                {/* <div className="flex justify-center">
                    <FontAwesomeIcon icon={faRobot} className="text-6xl text-blue-500 mb-6" />
                </div> */}
            </div>

            {/* Core Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                <motion.div
                    className={`text-center p-8 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
                    whileHover={{ scale: 1.03, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <FontAwesomeIcon icon={faPersonRunning} className="text-blue-500 text-4xl mb-4" />
                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Smart Workouts
                    </h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                        Bi-weekly workout plans generated to adapt to your fitness level, goals, and schedule.
                    </p>
                    <div className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        Personalized • Progressive • Flexible
                    </div>
                </motion.div>

                <motion.div
                    className={`text-center p-8 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
                    whileHover={{ scale: 1.03, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <FontAwesomeIcon icon={faPlateUtensils} className="text-orange-500 text-4xl mb-4" />
                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Nutrition Plans
                    </h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                        Meal plans and recipes tailored to your dietary preferences, allergies, and macro targets.
                    </p>
                    <div className={`text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                        Macro-Focused • Diet-Friendly • Delicious
                    </div>
                </motion.div>

                <motion.div
                    className={`text-center p-8 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
                    whileHover={{ scale: 1.03, y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <FontAwesomeIcon icon={faBasketShopping} className="text-green-500 text-4xl mb-4" />
                    <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Smart Shopping
                    </h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                        Automated grocery lists organized by store layout and optimized for your budget.
                    </p>
                    <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        Automated • Organized • Budget-Friendly
                    </div>
                </motion.div>
            </div>

            {/* AI Benefits Section */}
            <div className={`p-8 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg mb-16`}>
                <div className="flex items-center justify-center mb-6">
                    <FontAwesomeIcon icon={faBrain} className="text-purple-500 text-3xl mr-4" />
                    <h3 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        The Power of AI-Driven Personalization
                    </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h4 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Learns from Your Progress
                        </h4>
                        <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <li>• Tracks your workout performance and adjusts difficulty</li>
                            <li>• Monitors eating patterns and refines meal suggestions</li>
                            <li>• Adapts to your lifestyle changes and preferences</li>
                            <li>• Optimizes timing based on your schedule and habits</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Gets Smarter Over Time
                        </h4>
                        <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <li>• Predicts what meals you'll enjoy most</li>
                            <li>• Suggests workout variations to prevent plateaus</li>
                            <li>• Identifies the best times for you to exercise</li>
                            <li>• Recommends strategic rest days and recovery</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Integration Benefits */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Everything Works Together
                    </h3>
                    <ul className={`space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li className="flex items-start space-x-3">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>Your workout calorie burn automatically adjusts your meal plan</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <span className="text-orange-500 mt-1">•</span>
                            <span>Meal ingredients sync directly to organized grocery lists</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <span className="text-green-500 mt-1">•</span>
                            <span>Progress tracking influences all future recommendations</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <span className="text-purple-500 mt-1">•</span>
                            <span>One central dashboard provides complete visibility</span>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Built for Real Life
                    </h3>
                    <ul className={`space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <li className="flex items-start space-x-3">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>Flexible scheduling that adapts to busy days</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <span className="text-orange-500 mt-1">•</span>
                            <span>Substitute suggestions for missing ingredients</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <span className="text-green-500 mt-1">•</span>
                            <span>Budget-conscious meal planning and shopping</span>
                        </li>
                        <li className="flex items-start space-x-3">
                            <span className="text-purple-500 mt-1">•</span>
                            <span>Works with your dietary restrictions and preferences</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* CTA Button */}
            {/* <div className="text-center">
                <motion.button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-lg font-semibold text-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Start Your AI-Powered Fitness Journey
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
            {/* Header Section */}
            <div className="p-8">
                {/* <div className="flex items-center space-x-4 mb-8">
                    <FontAwesomeIcon icon={faChartUser} className="text-purple-500 text-3xl" />
                    <div>
                        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                            Dashboard
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            State: {userState}
                        </p>
                    </div>
                </div> */}

                {/* Centered State Message */}
                {/* <div className="text-center mb-12">
                    <h2 className={`text-xl font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        {getMessage()}
                    </h2>
                </div> */}
            </div>

            {/* Marketing Content - Only show for non-onboarded users */}
            {userState !== "onboarded" && (
                <div className="px-8 pb-8">
                    <PreviewContent />
                </div>
            )}

            {/* Profile Editor - Only show for onboarded users with generated plans */}
            {userState === "onboarded" && hasGeneratedPlans && (
                <div className="px-8 pb-8">
                    {/* Last Generated Banner */}
                    {lastGeneratedDate && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mb-6 p-4 rounded-xl border ${
                                isDark
                                    ? 'bg-gray-800 border-gray-700'
                                    : 'bg-blue-50 border-blue-200'
                            } flex items-center justify-between`}
                        >
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon
                                    icon={faClock}
                                    className="text-blue-500 text-xl"
                                />
                                <div>
                                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Last Plan Generation
                                    </p>
                                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {lastGeneratedDate.toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {Math.floor((new Date() - lastGeneratedDate) / (1000 * 60 * 60 * 24))} days ago
                            </div>
                        </motion.div>
                    )}

                    {/* Profile Editor Component */}
                    <ProfileEditor
                        isDark={isDark}
                        onRegenerateClick={() => {
                            console.log('🔄 Dashboard: Regenerate clicked! Current userProfile:', userProfile);
                            setShowRegenerateModal(true);
                        }}
                    />
                </div>
            )}

            {/* Regenerate Plans Modal */}
            {showRegenerateModal && (
                <GenerationProgressModal
                    isOpen={showRegenerateModal}
                    onClose={() => setShowRegenerateModal(false)}
                    onComplete={async (results) => {
                        console.log('🎉 Plan regeneration completed:', results);
                        setShowRegenerateModal(false);

                        // Refresh user profile and regeneration date
                        await refreshUserProfile();

                        // Refetch last generation date
                        const [workouts, meals, groceries] = await Promise.all([
                            getUserWorkouts(user.uid),
                            getUserMealPlans(user.uid),
                            getUserGroceryLists(user.uid)
                        ]);

                        const allDates = [
                            ...workouts.map(w => w.generatedAt),
                            ...meals.map(m => m.generatedAt),
                            ...groceries.map(g => g.generatedAt)
                        ].filter(date => date);

                        if (allDates.length > 0) {
                            const latestDate = allDates
                                .map(timestamp => timestamp.toDate ? timestamp.toDate() : new Date(timestamp))
                                .sort((a, b) => b - a)[0];
                            setLastGeneratedDate(latestDate);
                        }
                    }}
                    userProfile={userProfile}
                />
            )}
        </motion.div>
    );
}

export default Dashboard;