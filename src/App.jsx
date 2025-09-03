import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUIStore } from "./stores/useUIStore";
import ResponsiveNavigation from "./components/nav/ResponsiveNavigation";
import UserProfileButton from "./components/auth/UserProfileButton";
import Logo from "./components/ui/Logo";

// Page imports
import About from "./pages/about/index";
import Workouts from "./pages/workouts/index";
import Meals from "./pages/meals/index";
import Groceries from "./pages/groceries/index";

import { ToastProvider } from "./components/ui/ToastProvider";
import { AuthGuard } from "./components/auth/AuthGuard";
import { AuthButton } from "./components/auth/AuthButton";

import './styles/App.css';

// Home Page Component (replacing the simple test)
const Home = ({ isDark }) => {

  return (
    <motion.div
      className={`flex flex-col items-center justify-center min-h-screen p-8 ${isDark ? 'bg-[var(--color-black)]' : 'bg-[var(--color-white)]'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className={`text-4xl font-bold ${isDark ? 'text-[var(--color-orange)]' : 'text-[var(--color-black)]'} mb-4 text-center`}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        Welcome to FitfulAI
      </motion.h1>
      <motion.p
        className={`${isDark ? 'text-[var(--color-lt-gray)]' : 'text-[var(--color-dk-gray)]'} text-center max-w-md`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Your fitness and nutrition companion
      </motion.p>
    </motion.div>
  );
};

function App() {
  const { currentPage, isMobile } = useUIStore();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  // Simple theme management
  useEffect(() => {
    const handleStorageChange = () => {
      setIsDark(localStorage.getItem('theme') === 'dark');
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'workouts':
        return <Workouts isDark={isDark} />;
      case 'meals':
        return <Meals isDark={isDark} />;
      case 'groceries':
        return <Groceries isDark={isDark} />;
      case 'about':
        return <About isDark={isDark} />;
      default:
        return <Home isDark={isDark} />;
    }
  };

  return (
    <ToastProvider>
      <AuthGuard 
        className={`min-h-screen transition-colors duration-300`}
      >
        <Logo />
        <ResponsiveNavigation />
        <UserProfileButton />

        <main
          className={`transition-all duration-300 ${isMobile ? 'pb-20' : 'pl-0'
            } `}
        >
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {renderCurrentPage()}
          </motion.div>

        </main>
      </AuthGuard>
    </ToastProvider>
  );
}

export default App;
