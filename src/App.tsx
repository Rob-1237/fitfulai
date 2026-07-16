import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import { useUIStore } from "./stores/useUIStore";
import { ToastProvider } from "./components/ui/ToastProvider";
import ResponsiveNavigation from "./components/nav/ResponsiveNavigation";
import TopNavigation from "./components/nav/TopNavigation";
import AuthModal from "./components/auth/AuthModal";

// Import pages
import Home from "./pages/home/index.jsx";
import Meals from "./pages/meals/index.jsx";
import Groceries from "./pages/groceries/index.jsx";
import Dashboard from "./pages/dashboard/index.jsx";

import "./styles/App.css";

// Inner App component that uses settings context
function AppContent() {
  const { isInitialized, userProfile } = useAuth();
  const { isDark, isLoading: settingsLoading } = useSettings();
  const { isMobile, setIsMobile, modals, closeModal } = useUIStore();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const newIsMobile = window.innerWidth < 768;
      // Only update if value actually changed to prevent infinite loops
      setIsMobile(newIsMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []); // Empty deps - setIsMobile from Zustand is stable

  if (!isInitialized || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }


  return (
    <ToastProvider>
        <div className={`min-h-screen ${isDark ? 'bg-[var(--color-black)]' : 'bg-[var(--color-white)]'} ${isMobile ? 'pb-20' : ''} pt-16`}>
          <TopNavigation isDark={isDark} isMobile={isMobile} onboarded={userProfile?.onboardingCompleted} />

          <Routes>
            <Route path="/" element={<Home isDark={isDark} />} />
            <Route path="/meals" element={<Meals isDark={isDark} />} />
            <Route path="/groceries" element={<Groceries isDark={isDark} />} />
            <Route path="/dashboard" element={<Dashboard isDark={isDark} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <ResponsiveNavigation isDark={isDark} />

          <AuthModal
            open={modals.auth}
            onClose={() => closeModal('auth')}
          />
        </div>
      </ToastProvider>
  );
}

// Main App component that wraps AppContent with SettingsProvider
function App() {
  const { user } = useAuth();

  return (
    <SettingsProvider userId={user?.uid}>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;