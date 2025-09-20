import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignIn, faSignOut, faCog } from '@fortawesome/pro-duotone-svg-icons';
import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../stores/useUIStore';
import OnboardingWizard from '../onboarding/OnboardingWizard';

const TopNavigation = ({ isDark }) => {
  const { user, userProfile, signOut } = useAuth();
  const { openModal } = useUIStore();
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);

  // Single state logic
  const userState = user && userProfile?.onboardingCompleted ? "onboarded" : user ? "logged" : "unlogged";

  console.log('🔝 TopNavigation - userState:', userState);
  console.log("userProfile: ", userProfile);

  const handleSignIn = () => {
    console.log('🔝 Opening auth modal');
    openModal('auth');
  };

  const handleGetStarted = () => {
    console.log('🔝 Opening onboarding wizard');
    setShowOnboardingWizard(true);
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
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faSignIn} />
            <span>Sign In</span>
          </motion.button>
        );

      case "logged":
        return (
          <div className="flex items-center space-x-3">
            {!userProfile?.onboardingCompleted && (
              <motion.button
                onClick={handleGetStarted}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
      <div className="flex items-center justify-between px-6 py-3 pr-20">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className={`text-xl font-bold ${isDark ? 'text-[var(--color-orange)]' : 'text-[var(--color-dk-gray)]'}`}>
            FitfulAI
          </div>
        </div>

        {/* CTA Section */}
        {renderCTA()}
      </div>

      {/* Onboarding Wizard Modal */}
      <OnboardingWizard
        open={showOnboardingWizard}
        onClose={() => setShowOnboardingWizard(false)}
      />
    </div>
  );
};

const UserProfileCircle = ({ isDark, onSignOut }) => {
  const { user, userProfile } = useAuth();
  const userName = userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="relative group">
      <motion.button
        className={`w-10 h-10 rounded-full ${isDark ? 'bg-[var(--color-orange)]' : 'bg-blue-600'} text-white font-medium flex items-center justify-center hover:opacity-80 transition-opacity`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {userInitials}
      </motion.button>

      {/* Dropdown Menu */}
      <div className={`absolute right-0 top-12 w-48 ${isDark ? 'bg-[var(--color-black)]' : 'bg-white'} border ${isDark ? 'border-[var(--color-dk-gray)]' : 'border-gray-200'} rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}>
        <div className="p-3 border-b ${isDark ? 'border-[var(--color-dk-gray)]' : 'border-gray-200'}">
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {userName}
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {user?.email}
          </p>
        </div>

        <div className="py-1">
          <button className={`w-full px-3 py-2 text-left text-sm ${isDark ? 'text-gray-300 hover:bg-[var(--color-dk-gray)]' : 'text-gray-700 hover:bg-gray-100'} transition-colors flex items-center space-x-2`}>
            <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
            <span>Edit Account</span>
          </button>

          <button className={`w-full px-3 py-2 text-left text-sm ${isDark ? 'text-gray-300 hover:bg-[var(--color-dk-gray)]' : 'text-gray-700 hover:bg-gray-100'} transition-colors flex items-center space-x-2`}>
            <FontAwesomeIcon icon={faCog} className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={onSignOut}
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