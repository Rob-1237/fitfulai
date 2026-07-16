import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import GenerationProgressModal from '../generation/GenerationProgressModal';

// Import step components (will create these next)
import BasicInfoStep from './steps/BasicInfoStep';
import PhysicalStatsStep from './steps/PhysicalStatsStep';
import FitnessGoalsStep from './steps/FitnessGoalsStep';
import DietaryPreferencesStep from './steps/DietaryPreferencesStep';
import ReviewStep from './steps/ReviewStep';

export default function OnboardingWizard({ open, onClose }) {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [completedUserProfile, setCompletedUserProfile] = useState(null);

  // Onboarding data state with smart defaults
  const [onboardingData, setOnboardingData] = useState({
    // Step 1: Basic Info
    age: null,
    gender: '',
    unitsPreference: detectLocaleUnits(), // 'imperial' or 'metric'

    // Step 2: Physical Stats
    heightFeet: null,
    heightInches: null,
    heightCm: null,
    weightLbs: null,
    weightKg: null,

    // Step 3: Fitness Goals
    fitnessGoal: '',
    activityLevel: '',

    // Step 4: Dietary Preferences
    dietaryPreferences: [],
    allergies: [],
    mealPreferences: [],

    // Calculated values (Step 5)
    bmr: null,
    tdee: null,
    calorieTarget: null,
    macros: null
  });

  const steps = [
    { id: 1, title: 'Basic Info', component: BasicInfoStep },
    { id: 2, title: 'Physical Stats', component: PhysicalStatsStep },
    { id: 3, title: 'Fitness Goals', component: FitnessGoalsStep },
    { id: 4, title: 'Dietary Preferences', component: DietaryPreferencesStep },
    { id: 5, title: 'Review & Generate', component: ReviewStep }
  ];

  const progress = (currentStep / steps.length) * 100;

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only save if user has entered meaningful data (not just defaults)
      const hasUserData = onboardingData.age ||
                         onboardingData.gender ||
                         onboardingData.heightFeet ||
                         onboardingData.heightCm ||
                         onboardingData.weightLbs ||
                         onboardingData.weightKg ||
                         onboardingData.fitnessGoal ||
                         onboardingData.activityLevel;

      if (hasUserData) {
        localStorage.setItem('onboarding_draft', JSON.stringify({
          ...onboardingData,
          lastSaved: Date.now(),
          currentStep
        }));
      }
    }, 750);

    return () => clearTimeout(timer);
  }, [onboardingData, currentStep]);

  // Load draft data on mount
  useEffect(() => {
    const draft = localStorage.getItem('onboarding_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setOnboardingData(parsed);
        setCurrentStep(parsed.currentStep || 1);
      } catch (error) {
        console.warn('⚠️ Failed to parse onboarding draft:', error);
      }
    }
  }, []);

  const updateData = (stepData) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));
  };

  const validateCurrentStep = () => {
    // Step-specific validation logic
    switch (currentStep) {
      case 1: // Basic Info
        return onboardingData.age && onboardingData.gender && onboardingData.unitsPreference;
      case 2: // Physical Stats - Apply validation thresholds
        if (onboardingData.unitsPreference === 'imperial') {
          const heightFeetValid = onboardingData.heightFeet >= 3 && onboardingData.heightFeet <= 8;
          // Allow 0 as valid inches value (e.g., 6'0")
          const heightInchesValid = (onboardingData.heightInches === 0 || onboardingData.heightInches) &&
                                    onboardingData.heightInches >= 0 &&
                                    onboardingData.heightInches <= 11;
          const totalInches = (onboardingData.heightFeet * 12) + (onboardingData.heightInches || 0);
          const totalHeightValid = totalInches >= 36 && totalInches <= 96;
          const weightValid = onboardingData.weightLbs >= 50 && onboardingData.weightLbs <= 1000;
          return heightFeetValid && heightInchesValid && totalHeightValid && weightValid;
        } else {
          const heightValid = onboardingData.heightCm >= 91 && onboardingData.heightCm <= 244;
          const weightValid = onboardingData.weightKg >= 22 && onboardingData.weightKg <= 453;
          return heightValid && weightValid;
        }
      case 3: // Fitness Goals
        return onboardingData.fitnessGoal && onboardingData.activityLevel;
      case 4: // Dietary Preferences (optional step)
        return true; // Always valid, preferences are optional
      case 5: // Review
        return true; // Final step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onClose={handleClose} className="relative z-50">
          <motion.div
            className="fixed inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
            >
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close wizard"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="pr-8">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Complete Your Profile
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>{Math.round(progress)}% Complete</span>
                    <span>Step {currentStep}/{steps.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {CurrentStepComponent && (
                      <CurrentStepComponent
                        data={onboardingData}
                        updateData={updateData}
                        onNext={nextStep}
                        onSkip={skipStep}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                        onComplete={() => {
                          // Store the completed user profile for generation
                          setCompletedUserProfile({
                            ...userProfile,
                            ...onboardingData,
                            id: user?.uid, // Ensure we have the user ID
                            onboardingCompleted: true
                          });

                          // Open generation modal immediately (don't close wizard yet)
                          // The GenerationProgressModal will close the wizard when done
                          setShowGenerationModal(true);
                        }}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer Navigation */}
              <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <div className="flex space-x-3">
                  {currentStep < steps.length && currentStep !== 5 && (
                    <button
                      onClick={skipStep}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Skip
                    </button>
                  )}

                  {/* Hide Next/Complete button on final step - ReviewStep handles its own completion */}
                  {currentStep < steps.length && (
                    <button
                      onClick={nextStep}
                      disabled={!validateCurrentStep() || isLoading}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </Dialog>
      )}

      {/* AI Generation Progress Modal */}
      <GenerationProgressModal
        isOpen={showGenerationModal}
        onClose={() => setShowGenerationModal(false)}
        onComplete={async () => {
          setShowGenerationModal(false);

          // Clear draft data since onboarding is complete
          localStorage.removeItem('onboarding_draft');

          // Refresh userProfile in AuthContext to reflect onboarding completion
          try {
            await refreshUserProfile();
          } catch (error) {
            console.error('❌ Error refreshing profile:', error);
          }

          // Close and let parent handle navigation to dashboard
          onClose();
        }}
        userProfile={completedUserProfile}
      />
    </AnimatePresence>
  );
}

// Helper function to detect locale-based units
function detectLocaleUnits() {
  // Detect based on browser locale
  const locale = navigator.language || navigator.languages[0] || 'en-US';

  // US and a few others use imperial
  const imperialCountries = ['en-US', 'en-LR', 'en-MM'];

  return imperialCountries.includes(locale) ? 'imperial' : 'metric';
}