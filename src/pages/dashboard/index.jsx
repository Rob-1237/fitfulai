import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, ShoppingBasket, Brain, Clock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  getUserMealPlans,
  getUserGroceryLists,
} from "../../lib/firestoreQueries";
import ProfileEditor from "../../components/dashboard/ProfileEditor";
import GenerationProgressModal from "../../components/generation/GenerationProgressModal";
import {
  shouldResetLimits,
  resetRegenerationLimits,
} from "../../lib/regenerationLimits";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

function Dashboard({ isDark }) {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [lastGeneratedDate, setLastGeneratedDate] = useState(null);
  const [hasGeneratedPlans, setHasGeneratedPlans] = useState(false);

  // Single state logic
  const userState =
    user && userProfile?.onboardingCompleted
      ? "onboarded"
      : user
      ? "logged"
      : "unlogged";

  // Check and reset regeneration limits if needed
  useEffect(() => {
    const checkRegenerationLimits = async () => {
      if (!user?.uid || userState !== "onboarded" || !userProfile) return;

      try {
        // Check if limits need to be reset (past reset date)
        if (shouldResetLimits(userProfile.regenerationResetDate)) {
          const userRef = doc(db, "users", user.uid);
          const newLimits = resetRegenerationLimits(
            userProfile.weeklyRegenerationLimit || 3
          );
          await updateDoc(userRef, newLimits);
          await refreshUserProfile();
        }
      } catch (error) {
        console.error("❌ Error checking regeneration limits:", error);
      }
    };

    checkRegenerationLimits();
  }, [user, userState, userProfile, refreshUserProfile]);

  // Fetch last generation date when user is onboarded
  useEffect(() => {
    const fetchLastGenerationDate = async () => {
      if (!user?.uid || userState !== "onboarded") return;

      try {
        // Fetch meal and grocery plans
        const [meals, groceries] = await Promise.all([
          getUserMealPlans(user.uid),
          getUserGroceryLists(user.uid),
        ]);

        // Check if any plans exist
        const hasPlans = meals.length > 0 || groceries.length > 0;
        setHasGeneratedPlans(hasPlans);

        // Find the most recent generation date across all plan types
        const allDates = [
          ...meals.map((m) => m.generatedAt),
          ...groceries.map((g) => g.generatedAt),
        ].filter((date) => date); // Remove nulls

        if (allDates.length > 0) {
          // Convert Firestore timestamps to JS dates and find the latest
          const latestDate = allDates
            .map((timestamp) =>
              timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
            )
            .sort((a, b) => b - a)[0];

          setLastGeneratedDate(latestDate);
        }
      } catch (error) {
        console.error("Error fetching last generation date:", error);
      }
    };

    fetchLastGenerationDate();
  }, [user, userState]);

  const PreviewContent = () => (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h2
          className={`text-4xl font-bold mb-6 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Your AI Meal Planning Assistant
        </h2>
        <p
          className={`text-xl ${
            isDark ? "text-gray-300" : "text-gray-600"
          } max-w-3xl mx-auto mb-8`}
        >
          Fitful uses nutrition science and AI to build meal plans and grocery
          lists tailored uniquely to you.
        </p>
      </div>

      {/* Core Features Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <motion.div
          className={`text-center p-8 rounded-xl border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } shadow-lg`}
          whileHover={{ scale: 1.03, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <UtensilsCrossed className="text-orange-500 w-10 h-10 mb-4 mx-auto" />
          <h3
            className={`text-xl font-semibold mb-3 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Nutrition Plans
          </h3>
          <p className={`${isDark ? "text-gray-300" : "text-gray-600"} mb-4`}>
            Meal plans and recipes tailored to your dietary preferences,
            allergies, and macro targets.
          </p>
          <div
            className={`text-sm ${
              isDark ? "text-orange-400" : "text-orange-600"
            }`}
          >
            Macro-Focused • Diet-Friendly • Delicious
          </div>
        </motion.div>

        <motion.div
          className={`text-center p-8 rounded-xl border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } shadow-lg`}
          whileHover={{ scale: 1.03, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <ShoppingBasket className="text-green-500 w-10 h-10 mb-4 mx-auto" />
          <h3
            className={`text-xl font-semibold mb-3 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Smart Shopping
          </h3>
          <p className={`${isDark ? "text-gray-300" : "text-gray-600"} mb-4`}>
            Automated grocery lists organized by store layout and optimized for
            your budget.
          </p>
          <div
            className={`text-sm ${
              isDark ? "text-green-400" : "text-green-600"
            }`}
          >
            Automated • Organized • Budget-Friendly
          </div>
        </motion.div>
      </div>

      {/* AI Benefits Section */}
      <div
        className={`p-8 rounded-xl border ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } shadow-lg mb-16`}
      >
        <div className="flex items-center justify-center mb-6">
          <Brain className="text-purple-500 w-8 h-8 mr-4" />
          <h3
            className={`text-2xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            The Power of AI-Driven Personalization
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4
              className={`text-lg font-medium mb-3 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Built Around Your Profile
            </h4>
            <ul
              className={`space-y-2 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <li>• Calorie targets calculated from your stats and goals</li>
              <li>• Meal suggestions matched to your dietary preferences</li>
              <li>• Allergies respected in every generated recipe</li>
              <li>• Macro breakdowns tuned to your nutrition goal</li>
            </ul>
          </div>
          <div>
            <h4
              className={`text-lg font-medium mb-3 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Checks Its Own Work
            </h4>
            <ul
              className={`space-y-2 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <li>• Generated plans are validated against your targets</li>
              <li>• Plans that miss the mark are automatically revised</li>
              <li>• Grocery lists are built directly from your meal plan</li>
              <li>• Ingredient quantities consolidated across the week</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Integration Benefits */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h3
            className={`text-xl font-semibold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Everything Works Together
          </h3>
          <ul
            className={`space-y-3 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            <li className="flex items-start space-x-3">
              <span className="text-blue-500 mt-1">•</span>
              <span>
                Your profile drives calorie and macro targets automatically
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-orange-500 mt-1">•</span>
              <span>
                Meal ingredients sync directly to organized grocery lists
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-green-500 mt-1">•</span>
              <span>
                Preference updates flow into every regenerated plan
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-purple-500 mt-1">•</span>
              <span>One central dashboard provides complete visibility</span>
            </li>
          </ul>
        </div>
        <div>
          <h3
            className={`text-xl font-semibold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Built for Real Life
          </h3>
          <ul
            className={`space-y-3 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
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
    </div>
  );

  return (
    <motion.div
      className={`min-h-screen ${
        isDark ? "bg-[var(--color-black)]" : "bg-[var(--color-white)]"
      }`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section */}
      <div className="p-8">
        <h1
          className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          Dashboard
        </h1>
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
                  ? "bg-gray-800 border-gray-700"
                  : "bg-blue-50 border-blue-200"
              } flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <Clock className="text-blue-500 w-5 h-5" />
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Last Plan Generation
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {lastGeneratedDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {Math.floor(
                  (new Date() - lastGeneratedDate) / (1000 * 60 * 60 * 24)
                )}{" "}
                days ago
              </div>
            </motion.div>
          )}

          {/* Profile Editor Component */}
          <ProfileEditor
            isDark={isDark}
            onRegenerateClick={() => setShowRegenerateModal(true)}
          />
        </div>
      )}

      {/* Regenerate Plans Modal */}
      {showRegenerateModal && (
        <GenerationProgressModal
          isOpen={showRegenerateModal}
          onClose={() => setShowRegenerateModal(false)}
          forceRefresh={true}
          onComplete={async (results) => {
            setShowRegenerateModal(false);

            // Decrement regeneration count
            if (results.success) {
              try {
                const userRef = doc(db, "users", user.uid);
                const currentCount = userProfile.regenerationsThisWeek || 0;
                await updateDoc(userRef, {
                  regenerationsThisWeek: Math.max(0, currentCount - 1),
                });
              } catch (error) {
                console.error("❌ Error updating regeneration count:", error);
              }
            }

            // Refresh user profile and regeneration date
            await refreshUserProfile();

            // Refetch last generation date
            const [meals, groceries] = await Promise.all([
              getUserMealPlans(user.uid),
              getUserGroceryLists(user.uid),
            ]);

            const allDates = [
              ...meals.map((m) => m.generatedAt),
              ...groceries.map((g) => g.generatedAt),
            ].filter((date) => date);

            if (allDates.length > 0) {
              const latestDate = allDates
                .map((timestamp) =>
                  timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
                )
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
