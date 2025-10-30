import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faSave, faRefresh, faPlus, faTimes } from '@fortawesome/pro-duotone-svg-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';

const DIETARY_RESTRICTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'keto', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'low-carb', label: 'Low-Carb' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' }
];

const SERVING_SIZES = [2, 4, 6, 8];

export default function ProfileEditor({ isDark, onRegenerateClick }) {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [allergyInput, setAllergyInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize edited data from userProfile
  useEffect(() => {
    if (userProfile) {
      setEditedData({
        dietaryRestrictions: userProfile.dietaryRestrictions || [],
        allergies: userProfile.allergies || [],
        defaultServingSize: userProfile.defaultServingSize || 4
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    console.log('💾 ProfileEditor: Starting save with edited data:', editedData);
    try {
      // Update Firestore with recipe-relevant fields only
      const userRef = doc(db, 'users', user.uid);
      const updateData = {
        dietaryRestrictions: editedData.dietaryRestrictions,
        allergies: editedData.allergies,
        defaultServingSize: editedData.defaultServingSize,
        updatedAt: new Date()
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
      dietaryRestrictions: userProfile.dietaryRestrictions || [],
      allergies: userProfile.allergies || [],
      defaultServingSize: userProfile.defaultServingSize || 4
    });
    setIsEditing(false);
    setHasUnsavedChanges(false);
    setAllergyInput('');
  };

  // Track changes when user edits any field
  const handleFieldChange = (field, value) => {
    setEditedData({ ...editedData, [field]: value });
    setHasUnsavedChanges(true);
  };

  const toggleRestriction = (restrictionId) => {
    const newRestrictions = editedData.dietaryRestrictions.includes(restrictionId)
      ? editedData.dietaryRestrictions.filter(id => id !== restrictionId)
      : [...editedData.dietaryRestrictions, restrictionId];

    setEditedData({ ...editedData, dietaryRestrictions: newRestrictions });
    setHasUnsavedChanges(true);
  };

  const addAllergy = () => {
    const trimmed = allergyInput.trim();
    if (trimmed && !editedData.allergies.includes(trimmed.toLowerCase())) {
      setEditedData({
        ...editedData,
        allergies: [...editedData.allergies, trimmed.toLowerCase()]
      });
      setAllergyInput('');
      setHasUnsavedChanges(true);
    }
  };

  const removeAllergy = (allergyToRemove) => {
    setEditedData({
      ...editedData,
      allergies: editedData.allergies.filter(a => a !== allergyToRemove)
    });
    setHasUnsavedChanges(true);
  };

  const handleAllergyKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAllergy();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Edit/Save buttons */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recipe Preferences
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Update your preferences to regenerate your personalized meal plans
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
              Edit Preferences
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
          Preferences updated successfully!
        </motion.div>
      )}

      {/* Profile Form */}
      <div className="space-y-6">
        {/* Dietary Restrictions Section */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faUtensils} className="text-green-500 text-xl" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Dietary Restrictions
            </h3>
          </div>
          {isEditing ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DIETARY_RESTRICTIONS.map(restriction => (
                <motion.button
                  key={restriction.id}
                  onClick={() => toggleRestriction(restriction.id)}
                  className={`
                    px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium
                    ${editedData.dietaryRestrictions.includes(restriction.id)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : isDark
                      ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {restriction.label}
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {editedData.dietaryRestrictions.length > 0 ? (
                editedData.dietaryRestrictions.map(id => {
                  const restriction = DIETARY_RESTRICTIONS.find(r => r.id === id);
                  return (
                    <span
                      key={id}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isDark
                          ? 'bg-green-900 text-green-200'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {restriction?.label || id}
                    </span>
                  );
                })
              ) : (
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  None selected
                </p>
              )}
            </div>
          )}
        </div>

        {/* Allergies Section */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faUtensils} className="text-red-500 text-xl" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Allergies & Food Restrictions
            </h3>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              {/* Allergy Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyPress={handleAllergyKeyPress}
                  placeholder="e.g., peanuts, shellfish, dairy"
                  className={`flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-0 transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-red-500'
                  }`}
                />
                <motion.button
                  onClick={addAllergy}
                  disabled={!allergyInput.trim()}
                  className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: allergyInput.trim() ? 1.02 : 1 }}
                  whileTap={{ scale: allergyInput.trim() ? 0.98 : 1 }}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </motion.button>
              </div>

              {/* Allergy Chips */}
              {editedData.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {editedData.allergies.map((allergy) => (
                    <motion.div
                      key={allergy}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center space-x-2"
                    >
                      <span className="capitalize">{allergy}</span>
                      <button
                        onClick={() => removeAllergy(allergy)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {editedData.allergies.length > 0 ? (
                editedData.allergies.map(allergy => (
                  <span
                    key={allergy}
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      isDark
                        ? 'bg-red-900 text-red-200'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {allergy}
                  </span>
                ))
              ) : (
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No allergies specified
                </p>
              )}
            </div>
          )}
        </div>

        {/* Default Serving Size Section */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faUtensils} className="text-orange-500 text-xl" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Default Serving Size
            </h3>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Choose the default number of servings for recipes in your meal plans
          </p>

          {isEditing ? (
            <div className="grid grid-cols-4 gap-3">
              {SERVING_SIZES.map(size => (
                <motion.button
                  key={size}
                  onClick={() => {
                    setEditedData({ ...editedData, defaultServingSize: size });
                    setHasUnsavedChanges(true);
                  }}
                  className={`
                    px-4 py-4 rounded-lg border-2 transition-all font-bold text-lg
                    ${editedData.defaultServingSize === size
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : isDark
                      ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {size}
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                {editedData.defaultServingSize || 4}
              </span>
              <span className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                servings per recipe
              </span>
            </div>
          )}
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
