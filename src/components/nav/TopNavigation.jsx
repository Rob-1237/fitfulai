import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignIn, faSignOut, faCog } from '@fortawesome/pro-duotone-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../stores/useUIStore';
import SettingsModal from '../modals/SettingsModal';
import EditAccountModal from '../modals/EditAccountModal';
import QuickOnboardingModal from '../onboarding/QuickOnboardingModal';
import GenerationProgressModal from '../generation/GenerationProgressModal';

const TopNavigation = ({ isDark, isMobile, onboarded }) => {
  const { user, userProfile, signOut, refreshUserProfile } = useAuth();
  const { openModal, closeModal, modals } = useUIStore();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);

  console.log("isMobile value: ", isMobile);
  // Single state logic
  const userState = user && userProfile?.onboardingCompleted ? "onboarded" : user ? "logged" : "unlogged";

  const handleSignIn = () => {
    console.log('🔝 Opening auth modal');
    openModal('auth');
  };

  const handleGetStarted = () => {
    console.log('🔝 Opening quick onboarding modal');
    setShowOnboardingModal(true);
  };

  const handleOnboardingComplete = async (data) => {
    console.log('🔝 Onboarding completed with data:', data);

    // Close onboarding modal
    setShowOnboardingModal(false);

    // Refresh user profile to get updated onboarding status
    if (refreshUserProfile) {
      await refreshUserProfile();
    }

    // Trigger automatic meal plan generation
    console.log('🚀 Triggering automatic plan generation based on:', data);
    setShowGenerationModal(true);
  };

  const handleGenerationComplete = (results) => {
    console.log('🎉 TopNavigation: Generation completed with results:', results);
    setShowGenerationModal(false);
  };

  const handleSignOut = async () => {
    try {
      console.log('🔝 Signing out user');
      await signOut();
    } catch (error) {
      console.error("Error Signing Out: ", error);
    } finally {
      location.assign("/");
    }
  };

  const renderCTA = () => {
    switch (userState) {
      case "unlogged":
        return (
          <motion.button
            onClick={handleSignIn}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
            // whileHover={{ scale: 1.02 }}
            // whileTap={{ scale: 0.98 }}
          >
            {/* <FontAwesomeIcon icon={faSignIn} /> */}
            <span>Sign In</span>
          </motion.button>
        );

      case "logged":
        return (
          <div className="flex items-center space-x-5">
            {!onboarded && (
              <motion.button
                onClick={handleGetStarted}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                // whileHover={{ scale: 1.02 }}
                // whileTap={{ scale: 0.98 }}
              >
                Get Started
              </motion.button>
            )}

            <UserProfileCircle isDark={isDark} onSignOut={handleSignOut} />
          </div>
        );

      case "onboarded":
        return <UserProfileCircle isDark={isDark} onSignOut={handleSignOut} />;

      default:
        return null;
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-40 ${isDark ? 'bg-[var(--color-black)]' : 'bg-[var(--color-white)]'} border-b ${isDark ? 'border-[var(--color-dk-gray)]' : 'border-[var(--color-lt-gray)]'} shadow-sm`}>
      <div className={`flex items-center justify-between px-6 py-3 ${isMobile ? 'pr-3' : 'pr-20'}`}>
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className={`text-2xl font-bold ${isDark ? 'text-[var(--color-orange)]' : 'text-[var(--color-dk-gray)]'}`}>
            Fitful
          </div>
        </div>

        {/* CTA Section */}
        {renderCTA()}
      </div>

      {/* Quick Onboarding Modal */}
      <QuickOnboardingModal
        open={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onComplete={handleOnboardingComplete}
      />

      {/* Settings Modal */}
      <SettingsModal
        open={modals.settings}
        onClose={() => closeModal('settings')}
      />

      {/* Edit Account Modal */}
      <EditAccountModal
        open={modals.editAccount}
        onClose={() => closeModal('editAccount')}
        isDark={isDark}
      />

      {/* Generation Progress Modal */}
      <GenerationProgressModal
        isOpen={showGenerationModal}
        onClose={() => setShowGenerationModal(false)}
        onComplete={handleGenerationComplete}
        userProfile={userProfile}
        isDark={isDark}
      />
    </div>
  );
};

const UserProfileCircle = ({ isDark, onSignOut }) => {
  const { user, userProfile } = useAuth();
  const { openModal } = useUIStore();
  const userName = userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Debug logging to track re-renders with updated profile
  useEffect(() => {
    console.log('👤 UserProfileCircle: Profile updated', {
      userName,
      userInitials,
      profileName: userProfile?.name
    });
  }, [userProfile?.name, userName, userInitials]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOutClick = () => {
    setIsDropdownOpen(false);
    onSignOut();
  };

  const handleEditAccountClick = () => {
    setIsDropdownOpen(false);
    openModal('editAccount');
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    openModal('settings');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleDropdown();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        className={`w-10 h-10 rounded-full ${isDark ? 'bg-[var(--color-orange)]' : 'bg-blue-600'} text-white font-medium flex items-center justify-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark ? 'focus:ring-orange-500' : 'focus:ring-blue-500'}`}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        whileTap={{ scale: 0.98 }}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
        tabIndex={0}
      >
        {userInitials}
      </motion.button>

      {/* Dropdown Menu */}
      <div className={`absolute right-0 top-12 w-48 ${isDark ? 'bg-[var(--color-black)]' : 'bg-white'} border ${isDark ? 'border-[var(--color-dk-gray)]' : 'border-gray-200'} rounded-lg shadow-lg transition-all duration-200 ${isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="p-3 border-b ${isDark ? 'border-[var(--color-dk-gray)]' : 'border-gray-200'}">
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {userName}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {user?.email}
          </p>
        </div>

        <div className="py-1">
          <button
            onClick={handleEditAccountClick}
            className={`w-full px-3 py-2 text-left text-sm ${isDark ? 'text-gray-300 hover:bg-[var(--color-dk-gray)]' : 'text-gray-700 hover:bg-gray-100'} transition-colors flex items-center space-x-2`}
          >
            <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
            <span>Edit Account</span>
          </button>

          <button
            onClick={handleSettingsClick}
            className={`w-full px-3 py-2 text-left text-sm ${isDark ? 'text-gray-300 hover:bg-[var(--color-dk-gray)]' : 'text-gray-700 hover:bg-gray-100'} transition-colors flex items-center space-x-2`}
          >
            <FontAwesomeIcon icon={faCog} className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={handleSignOutClick}
            className={`w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2`}
          >
            <FontAwesomeIcon icon={faSignOut} className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;