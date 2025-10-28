import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDumbbell,
  faStopwatch,
  faBullseyeArrow,
  faPersonRunning,
  faCalendarWeek
} from '@fortawesome/pro-duotone-svg-icons';
import { getUserWorkouts } from '../../lib/firestoreQueries';
import { useAuth } from '../../hooks/useAuth';

export default function WorkoutsContent({ isDark }) {
  const location = useLocation();
  const { user, userProfile } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Component mount/unmount logging
  useEffect(() => {
    console.log('🏋️ WorkoutsContent: Component MOUNTED', {
      userUid: user?.uid,
      userEmail: user?.email,
      hasUserProfile: !!userProfile,
      userProfileKeys: userProfile ? Object.keys(userProfile) : [],
      pathname: location.pathname,
      locationKey: location.key
    });

    return () => {
      console.log('🏋️ WorkoutsContent: Component UNMOUNTED');
    };
  }, []);

  useEffect(() => {
    console.log('🏋️ WorkoutsContent: useEffect TRIGGERED', {
      userUid: user?.uid,
      pathname: location.pathname,
      locationKey: location.key,
      willFetch: !!user?.uid
    });

    const fetchWorkouts = async () => {
      if (!user?.uid) {
        console.log('🔍 WorkoutsContent: No user ID, skipping fetch', {
          user,
          hasUser: !!user,
          uid: user?.uid
        });
        return;
      }

      console.log('🔍 WorkoutsContent: Refetch triggered - Starting fetch for user:', user.uid, {
        pathname: location.pathname,
        locationKey: location.key
      });
      setIsLoading(true);
      try {
        // Bypass cache to get fresh data after generation
        const userWorkouts = await getUserWorkouts(user.uid, { bypassCache: true });
        console.log('🔍 WorkoutsContent: Received workouts:', userWorkouts);
        setWorkouts(userWorkouts);

        // Set the first non-placeholder workout as current, or the placeholder if none
        const activeWorkout = userWorkouts.find(w => w.type !== 'placeholder') || userWorkouts[0];
        console.log('🔍 WorkoutsContent: Setting current workout:', activeWorkout);
        setCurrentWorkout(activeWorkout);
      } catch (error) {
        console.error('❌ Error loading workouts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, [user?.uid, location.pathname, location.key]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading your workouts...</span>
        </div>
      </div>
    );
  }

  if (!workouts.length) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faDumbbell} className="text-6xl text-gray-400 mb-4" />
        <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          No workouts found
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Your personalized workouts will appear here once generated.
        </p>
      </div>
    );
  }

  const isPlaceholder = currentWorkout?.type === 'placeholder';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Current Workout Section */}
      {currentWorkout && (
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isPlaceholder ? 'Sample Workout Structure' : 'Current Workout'}
          </h2>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Workout Overview Card */}
            <motion.div
              className={`lg:col-span-2 p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currentWorkout.name}
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {currentWorkout.description}
                  </p>
                </div>
                {isPlaceholder && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Sample
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faStopwatch} className="text-blue-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {currentWorkout.estimatedDuration || '30-45 min'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faBullseyeArrow} className="text-green-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {currentWorkout.difficulty || 'Beginner'}
                  </span>
                </div>
              </div>

              {/* Today's Exercises */}
              {currentWorkout.weeks?.[0]?.days?.[0]?.exercises && (
                <div>
                  <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Today's Exercises
                  </h4>
                  <div className="space-y-3">
                    {currentWorkout.weeks[0].days[0].exercises.slice(0, 3).map((exercise, index) => (
                      <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {exercise.name}
                            </h5>
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {exercise.sets} sets × {exercise.reps} reps
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
                            {exercise.muscleGroups?.[0] || 'All'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Progress Stats Card */}
            <motion.div
              className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Your Progress
              </h4>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      This Week
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {currentWorkout.progress?.completedWorkouts || 0}/{currentWorkout.progress?.totalWorkouts || 1}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${((currentWorkout.progress?.completedWorkouts || 0) / (currentWorkout.progress?.totalWorkouts || 1)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="text-center p-3 rounded-lg bg-blue-50">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentWorkout.progress?.weeklyStreak || 0}
                    </div>
                    <div className="text-xs text-blue-600">Week Streak</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50">
                    <div className="text-2xl font-bold text-green-600">
                      {currentWorkout.progress?.completedWorkouts || 0}
                    </div>
                    <div className="text-xs text-green-600">Completed</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Workout Plans List */}
      {workouts.length > 1 && (
        <div>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            All Workout Plans
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map((workout, index) => (
              <motion.div
                key={workout.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  currentWorkout?.id === workout.id
                    ? `${isDark ? 'bg-blue-900 border-blue-600' : 'bg-blue-50 border-blue-200'}`
                    : `${isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'}`
                }`}
                onClick={() => setCurrentWorkout(workout)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {workout.name}
                  </h3>
                  {workout.type === 'placeholder' && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Sample
                    </span>
                  )}
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                  {workout.description?.substring(0, 60)}...
                </p>
                <div className="flex items-center space-x-3 text-xs">
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {workout.difficulty}
                  </span>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {workout.estimatedDuration}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}