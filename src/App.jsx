import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "./stores/useUIStore";
import ResponsiveNavigation from "./components/nav/ResponsiveNavigation";
import UserProfileButton from "./components/auth/UserProfileButton";
import Logo from "./components/ui/Logo";

// Page imports
import Home from "./pages/home/index";
import Dashboard from "./pages/dashboard/index";
import Workouts from "./pages/workouts/index";
import Meals from "./pages/meals/index";
import Groceries from "./pages/groceries/index";

import { ToastProvider } from "./components/ui/ToastProvider";
import { AuthGuard } from "./components/auth/AuthGuard";
import { AuthButton } from "./components/auth/AuthButton";
import AuthErrorBoundary from "./components/auth/AuthErrorBoundary";

import './styles/App.css';

function App() {
  const { isMobile } = useUIStore();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const location = useLocation();

  // Simple theme management
  useEffect(() => {
    const handleStorageChange = () => {
      setIsDark(localStorage.getItem('theme') === 'dark');
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Development helper - expose auth reset to console
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.resetAuth = () => {
        import('./stores/useProfileStore.js').then((module) => {
          const { useProfileStore } = module;
          useProfileStore.getState().resetAuthState();
        });
      };
      
      console.log('💡 Development helper: Run `resetAuth()` in console to reset authentication state');
    }
  }, []);

  return (
    <AuthErrorBoundary>
      <ToastProvider>
        <AuthGuard 
          className={`min-h-screen transition-colors duration-300`}
        >
          <Logo />
          <ResponsiveNavigation />
          <UserProfileButton />

          <main
            className={`transition-all duration-300 ${isMobile ? 'pb-20' : 'pl-0'} `}
          >
            <AnimatePresence mode="wait">
              {/* <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              > */}
                <Routes>
                  <Route path="/" element={<Home isDark={isDark} />} />
                  <Route path="/workouts" element={<Workouts isDark={isDark} />} />
                  <Route path="/meals" element={<Meals isDark={isDark} />} />
                  <Route path="/groceries" element={<Groceries isDark={isDark} />} />
                  <Route path="/dashboard" element={<Dashboard isDark={isDark} />} />
                  <Route path="*" element={<Home isDark={isDark} />} />
                </Routes>
              {/* </motion.div> */}
            </AnimatePresence>
          </main>
        </AuthGuard>
      </ToastProvider>
    </AuthErrorBoundary>
  );
}

export default App;
