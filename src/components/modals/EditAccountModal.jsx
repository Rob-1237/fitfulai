import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/ToastProvider';

export default function EditAccountModal({ open, onClose, isDark }) {
  const { user, userProfile, updateUserProfile } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    unitsPreference: 'imperial'
  });

  // Initialize form data when modal opens
  useEffect(() => {
    if (open && userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: user?.email || '',
        unitsPreference: userProfile.unitsPreference || 'imperial'
      });
    }
  }, [open, userProfile, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleUnits = () => {
    setFormData(prev => ({
      ...prev,
      unitsPreference: prev.unitsPreference === 'imperial' ? 'metric' : 'imperial'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('📝 EditAccountModal: Submitting changes:', {
        name: formData.name,
        unitsPreference: formData.unitsPreference
      });

      const result = await updateUserProfile({
        name: formData.name,
        unitsPreference: formData.unitsPreference
      });

      console.log('📝 EditAccountModal: updateUserProfile result:', result);

      if (result.success) {
        console.log('✅ EditAccountModal: Profile updated successfully, closing modal');
        addToast('Account updated successfully!', 'success');
        onClose();
      } else {
        console.error('❌ EditAccountModal: Update failed:', result.error);
        addToast('Failed to update account. Please try again.', 'error');
      }
    } catch (error) {
      console.error('❌ EditAccountModal: Exception during update:', error);
      addToast('Failed to update account. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const subscriptionTier = userProfile?.tier || 'free';
  const tierDisplay = subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1) + ' Plan';

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          as={motion.div}
          open={open}
          onClose={onClose}
          className="relative z-50"
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />

          {/* Full-screen container */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-2xl`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <Dialog.Title className={`text-xl font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Edit Account
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                  }`}
                  aria-label="Close edit account"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name Field */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                {/* Email Field (Read-Only) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'bg-gray-900 border-gray-600 text-gray-400'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                    } cursor-not-allowed`}
                  />
                  <p className={`text-xs mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Email cannot be changed
                  </p>
                </div>

                {/* Units Preference Toggle */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Units Preference
                  </label>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {formData.unitsPreference === 'imperial' ? 'Imperial (lbs, ft)' : 'Metric (kg, cm)'}
                    </span>
                    <button
                      type="button"
                      onClick={toggleUnits}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        formData.unitsPreference === 'metric'
                          ? 'bg-blue-600 focus:ring-blue-500'
                          : 'bg-gray-300 focus:ring-gray-400'
                      }`}
                      aria-label="Toggle units preference"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.unitsPreference === 'metric' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Subscription Tier (Read-Only) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Subscription
                  </label>
                  <div className={`px-3 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-900 border-gray-600 text-gray-400'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}>
                    {tierDisplay}
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div className={`flex justify-end gap-3 p-6 border-t ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
