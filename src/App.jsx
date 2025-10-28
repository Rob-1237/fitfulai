import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
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

function App() {
  // console.log('🚀 APP COMPONENT MOUNTING');

  const { isInitialized, userProfile } = useAuth();
  const { isDark, isMobile, setIsMobile, modals, closeModal } = useUIStore();

  console.log('🚀 App state:', {
    isInitialized,
    isDark,
    isMobile,
    modals
  });

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  if (!isInitialized) {
    console.log('⏳ App not initialized yet, showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // console.log('✅ App initialized, rendering main application');

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

          <ResponsiveNavigation />

          <AuthModal
            open={modals.auth}
            onClose={() => closeModal('auth')}
          />
        </div>
      </ToastProvider>
  );
}

export default App;