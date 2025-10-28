import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faDumbbell, faUtensils, faSave, faRefresh } from '@fortawesome/pro-duotone-svg-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileEditor({ isDark, onRegenerateClick }) {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize edited data from userProfile
  useEffect(() => {
    if (userProfile) {
      setEditedData({
        age: userProfile.age || '',
        gender: userProfile.gender || '',
        weightLbs: userProfile.weightLbs || '',
        heightInches: userProfile.heightInches || '',
        activityLevel: userProfile.activityLevel || '',
        fitnessGoal: userProfile.fitnessGoal || '',
        dietaryPreferences: userProfile.dietaryPreferences || [],
        allergies: userProfile.allergies || [],
        unitsPreference: userProfile.unitsPreference || 'imperial'
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    console.log('💾 ProfileEditor: Starting save with edited data:', editedData);
    try {
      // Convert height back to feet/inches for display
      const heightFeet = Math.floor(editedData.heightInches / 12);
      const heightInchesRemainder = editedData.heightInches % 12;

      // Calculate metrics with updated data
      const weightKg = editedData.weightLbs * 0.453592;
      const heightCm = editedData.heightInches * 2.54;

      // Mifflin-St Jeor Equation
      let bmr;
      if (editedData.gender === 'male') {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * editedData.age + 5;
      } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * editedData.age - 161;
      }

      // Activity multipliers
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      };

      const tdee = bmr * (activityMultipliers[editedData.activityLevel] || 1.2);

      // Calorie target based on goal
      let calorieTarget = tdee;
      if (editedData.fitnessGoal === 'weight_loss') {
        calorieTarget = tdee - 500;
      } else if (editedData.fitnessGoal === 'muscle_gain') {
        calorieTarget = tdee + 300;
      }

      // Macro distribution
      const proteinRatio = editedData.fitnessGoal === 'muscle_gain' ? 0.3 : 0.25;
      const fatRatio = 0.25;
      const carbRatio = 1 - proteinRatio - fatRatio;

      const macros = {
        protein: Math.round((calorieTarget * proteinRatio) / 4),
        carbs: Math.round((calorieTarget * carbRatio) / 4),
        fat: Math.round((calorieTarget * fatRatio) / 9)
      };

      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      const updateData = {
        age: parseInt(editedData.age),
        gender: editedData.gender,
        weightLbs: parseFloat(editedData.weightLbs),
        weightKgs: weightKg,
        heightInches: parseInt(editedData.heightInches),
        heightCentimeters: Math.round(heightCm),
        activityLevel: editedData.activityLevel,
        fitnessGoal: editedData.fitnessGoal,
        dietaryPreferences: editedData.dietaryPreferences,
        allergies: editedData.allergies,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        calorieTarget: Math.round(calorieTarget),
        macros: macros
      };

      console.log('💾 ProfileEditor: Saving to Firestore:', updateData);
      await updateDoc(userRef, updateData);
      console.log('✅ ProfileEditor: Saved successfully to Firestore');

      // Refresh user profile in context
      console.log('🔄 ProfileEditor: Refreshing userProfile in context...');
      await refreshUserProfile();
      console.log('✅ ProfileEditor: userProfile refreshed');

      setIsEditing(false);
      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateClick = async () => {
    console.log('🔄 ProfileEditor: Regenerate clicked, checking for unsaved changes...', {
      isEditing,
      hasUnsavedChanges
    });

    // If user has unsaved changes, save them first
    if (isEditing && hasUnsavedChanges) {
      console.log('💾 ProfileEditor: Unsaved changes detected, saving first...');
      await handleSave();
      console.log('✅ ProfileEditor: Changes saved, now triggering regeneration');
    }

    // Trigger regeneration
    onRegenerateClick();
  };

  const handleCancel = () => {
    // Reset to original values
    setEditedData({
      age: userProfile.age || '',
      gender: userProfile.gender || '',
      weightLbs: userProfile.weightLbs || '',
      heightInches: userProfile.heightInches || '',
      activityLevel: userProfile.activityLevel || '',
      fitnessGoal: userProfile.fitnessGoal || '',
      dietaryPreferences: userProfile.dietaryPreferences || [],
      allergies: userProfile.allergies || [],
      unitsPreference: userProfile.unitsPreference || 'imperial'
    });
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  // Track changes when user edits any field
  const handleFieldChange = (field, value) => {
    setEditedData({ ...editedData, [field]: value });
    setHasUnsavedChanges(true);
  };

  // Convert height to feet/inches for display
  const heightFeet = editedData.heightInches ? Math.floor(editedData.heightInches / 12) : '';
  const heightInches = editedData.heightInches ? editedData.heightInches % 12 : '';

  const handleHeightChange = (feet, inches) => {
    const totalInches = (parseInt(feet) || 0) * 12 + (parseInt(inches) || 0);
    setEditedData({ ...editedData, heightInches: totalInches });
  };

  // Format labels
  const formatLabel = (value) => {
    if (!value) return '';
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Edit/Save buttons */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Profile Settings
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Update your profile to regenerate your personalized plans
          </p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={() => {
                setIsEditing(true);
                setHasUnsavedChanges(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faSave} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success message */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
        >
          Profile updated successfully!
        </motion.div>
      )}

      {/* Profile Form */}
      <div className="space-y-6">
        {/* Basic Info Section */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faUser} className="text-blue-500 text-xl" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Basic Information
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Age
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedData.age}
                  onChange={(e) => setEditedData({ ...editedData, age: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              ) : (
                <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userProfile?.age || 'Not set'}
                </p>
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Gender
              </label>
              {isEditing ? (
                <select
                  value={editedData.gender}
                  onChange={(e) => setEditedData({ ...editedData, gender: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatLabel(userProfile?.gender) || 'Not set'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Physical Stats Section */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faDumbbell} className="text-orange-500 text-xl" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Physical Stats
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Weight (lbs)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedData.weightLbs}
                  onChange={(e) => setEditedData({ ...editedData, weightLbs: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              ) : (
                <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userProfile?.weightLbs || 'Not set'} lbs
                </p>
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Height
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Feet"
                    value={heightFeet}
                    onChange={(e) => handleHeightChange(e.target.value, heightInches)}
                    className={`w-1/2 px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder="Inches"
                    value={heightInches}
                    onChange={(e) => handleHeightChange(heightFeet, e.target.value)}
                    className={`w-1/2 px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              ) : (
                <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userProfile?.heightInches
                    ? `${Math.floor(userProfile.heightInches / 12)}'${userProfile.heightInches % 12}"`
                    : 'Not set'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Fitness Goals Section */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faDumbbell} className="text-green-500 text-xl" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Fitness Goals
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Fitness Goal
              </label>
              {isEditing ? (
                <select
                  value={editedData.fitnessGoal}
                  onChange={(e) => setEditedData({ ...editedData, fitnessGoal: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="general_fitness">General Fitness</option>
                </select>
              ) : (
                <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatLabel(userProfile?.fitnessGoal) || 'Not set'}
                </p>
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Activity Level
              </label>
              {isEditing ? (
                <select
                  value={editedData.activityLevel}
                  onChange={(e) => setEditedData({ ...editedData, activityLevel: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Lightly Active</option>
                  <option value="moderate">Moderately Active</option>
                  <option value="active">Active</option>
                  <option value="very_active">Very Active</option>
                </select>
              ) : (
                <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatLabel(userProfile?.activityLevel) || 'Not set'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dietary Preferences Section */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faUtensils} className="text-purple-500 text-xl" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Dietary Preferences
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Diet Type
              </label>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {['vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean'].map((diet) => (
                    <button
                      key={diet}
                      onClick={() => {
                        const newPrefs = editedData.dietaryPreferences.includes(diet)
                          ? editedData.dietaryPreferences.filter(d => d !== diet)
                          : [...editedData.dietaryPreferences, diet];
                        setEditedData({ ...editedData, dietaryPreferences: newPrefs });
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        editedData.dietaryPreferences.includes(diet)
                          ? 'bg-purple-600 text-white'
                          : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {formatLabel(diet)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userProfile?.dietaryPreferences?.length > 0
                    ? userProfile.dietaryPreferences.map(formatLabel).join(', ')
                    : 'None'}
                </p>
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Allergies / Restrictions
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.allergies.join(', ')}
                  onChange={(e) => setEditedData({
                    ...editedData,
                    allergies: e.target.value.split(',').map(a => a.trim()).filter(a => a)
                  })}
                  placeholder="e.g., peanuts, shellfish, dairy"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              ) : (
                <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userProfile?.allergies?.length > 0
                    ? userProfile.allergies.join(', ')
                    : 'None'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Regenerate Plans Button */}
        <motion.button
          onClick={handleRegenerateClick}
          disabled={isSaving}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isSaving ? 1 : 1.02 }}
          whileTap={{ scale: isSaving ? 1 : 0.98 }}
        >
          <FontAwesomeIcon icon={faRefresh} className="text-xl" />
          {isSaving ? 'Saving Changes...' : 'Regenerate All Plans'}
        </motion.button>
      </div>
    </div>
  );
}
