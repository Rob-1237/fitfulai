import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDumbbell,
  faPlateUtensils,
  faShoppingCart,
  faCheck,
  faExclamationTriangle,
  faRotateRight,
  faSparkles
} from '@fortawesome/pro-duotone-svg-icons';

const GenerationProgressModal = ({ isOpen, onClose, onComplete, userProfile, isDark = false }) => {
  const [currentStep, setCurrentStep] = useState(null);
  const [stepStatuses, setStepStatuses] = useState({
    workout: 'pending',
    meals: 'pending',
    groceries: 'pending'
  });
  const [stepData, setStepData] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [generationResults, setGenerationResults] = useState(null);

  const navigate = useNavigate();

  const steps = [
    {
      id: 'workout',
      name: 'Workout Plan',
      description: 'Creating personalized exercise routines',
      icon: faDumbbell,
      color: 'blue'
    },
    {
      id: 'meals',
      name: 'Meal Plan',
      description: 'Designing nutrition-focused meal schedules',
      icon: faPlateUtensils,
      color: 'orange'
    },
    {
      id: 'groceries',
      name: 'Grocery List',
      description: 'Organizing efficient shopping lists',
      icon: faShoppingCart,
      color: 'green'
    }
  ];

  // Start generation when modal opens
  useEffect(() => {
    if (isOpen && userProfile && !isGenerating) {
      startGeneration();
    }
  }, [isOpen, userProfile]);

  // Calculate overall progress
  useEffect(() => {
    const completedSteps = Object.values(stepStatuses).filter(status => status === 'completed').length;
    const failedSteps = Object.values(stepStatuses).filter(status => status === 'failed').length;
    const totalSteps = steps.length;

    const progress = ((completedSteps + failedSteps) / totalSteps) * 100;
    setOverallProgress(progress);
  }, [stepStatuses]);

  const startGeneration = async () => {
    setIsGenerating(true);
    console.log('🚀 Starting complete plan generation...');

    try {
      // Dynamic import to avoid circular dependencies
      const { generateCompleteUserPlan } = await import('../../lib/parallelGenerator');

      const result = await generateCompleteUserPlan(userProfile, handleProgress);

      setGenerationResults(result);
      console.log("result check:", result);
      if (result.success) {
        console.log('🎉 All generations completed successfully');
        // Auto-close modal after a brief celebration
        setTimeout(() => {
          onComplete(result);
          onClose();
        }, 2000);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2500);
      } else {
        console.log('⚠️ Some generations failed, showing results');
        // Show results but don't auto-close
      }

    } catch (error) {
      console.error('❌ Generation process failed:', error);
      setStepStatuses(prev => ({
        workout: prev.workout === 'completed' ? 'completed' : 'failed',
        meals: prev.meals === 'completed' ? 'completed' : 'failed',
        groceries: prev.groceries === 'completed' ? 'completed' : 'failed'
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProgress = (progress) => {
    const { step, status, data } = progress;

    setCurrentStep(step);
    setStepStatuses(prev => ({
      ...prev,
      [step]: status
    }));

    if (data) {
      setStepData(prev => ({
        ...prev,
        [step]: data
      }));
    }
  };

  const getStepIcon = (step, status) => {
    if (status === 'completed') return faCheck;
    if (status === 'failed') return faExclamationTriangle;
    if (status === 'retrying') return faRotateRight;
    return step.icon;
  };

  const getStepColor = (step, status) => {
    if (status === 'completed') return 'text-green-500';
    if (status === 'failed') return 'text-red-500';
    if (status === 'retrying') return 'text-yellow-500';
    if (status === 'in_progress') return `text-${step.color}-500`;
    return isDark ? 'text-gray-400' : 'text-gray-500';
  };

  const getStepMessage = (step, status, data) => {
    if (status === 'completed' && data?.name) {
      return `✅ Generated: ${data.name}`;
    }
    if (status === 'failed' && data?.error) {
      return `❌ Failed: ${data.error}`;
    }
    if (status === 'retrying') {
      return `🔄 Retrying...`;
    }
    if (status === 'in_progress') {
      return `⏳ ${step.description}...`;
    }
    return step.description;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <motion.div
          className={`max-w-md w-full rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 shadow-2xl`}
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4"
              animate={{ rotate: isGenerating ? 360 : 0 }}
              transition={{ duration: 2, repeat: isGenerating ? Infinity : 0, ease: "linear" }}
            >
              <FontAwesomeIcon icon={faSparkles} className="text-white text-2xl" />
            </motion.div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Creating Your Plans
            </h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Please wait while we generate your personalized fitness and nutrition plans
            </p>
          </div>

          {/* Progress Bar */}
          <div className={`w-full bg-gray-200 rounded-full h-2 mb-6 ${isDark ? 'bg-gray-700' : ''}`}>
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Generation Steps */}
          <div className="space-y-4 mb-6">
            {steps.map((step) => {
              const status = stepStatuses[step.id];
              const data = stepData[step.id];

              return (
                <motion.div
                  key={step.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                    status === 'in_progress'
                      ? isDark ? 'bg-gray-700' : 'bg-blue-50'
                      : isDark ? 'bg-gray-750' : 'bg-gray-50'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: steps.indexOf(step) * 0.1 }}
                >
                  <motion.div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      status === 'completed' ? 'bg-green-100' :
                      status === 'failed' ? 'bg-red-100' :
                      status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}
                    animate={status === 'in_progress' ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: status === 'in_progress' ? Infinity : 0 }}
                  >
                    <FontAwesomeIcon
                      icon={getStepIcon(step, status)}
                      className={`text-sm ${getStepColor(step, status)}`}
                      spin={status === 'in_progress' || status === 'retrying'}
                    />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {step.name}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {getStepMessage(step, status, data)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Results Summary */}
          {generationResults && (
            <motion.div
              className={`p-4 rounded-lg ${
                generationResults.success
                  ? isDark ? 'bg-green-900 text-green-100' : 'bg-green-50 text-green-800'
                  : isDark ? 'bg-yellow-900 text-yellow-100' : 'bg-yellow-50 text-yellow-800'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center">
                <h4 className="font-medium mb-2">
                  {generationResults.success ? '🎉 All Done!' : '⚠️ Partial Success'}
                </h4>
                <p className="text-sm">
                  Generated {generationResults.summary.successful}/3 plans
                  {generationResults.summary.totalCost > 0 &&
                    ` • Cost: $${generationResults.summary.totalCost.toFixed(4)}`
                  }
                </p>
                {!generationResults.success && (
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Footer */}
          {!isGenerating && generationResults && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  onComplete(generationResults);
                  onClose();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GenerationProgressModal;