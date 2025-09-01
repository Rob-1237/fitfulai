
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUIStore } from "./stores/useUIStore";
import ResponsiveNavigation from "./components/nav/ResponsiveNavigation";
import UserProfileButton from "./components/auth/UserProfileButton";

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
const Home = () => {
  const [message, setMessage] = useState("Welcome to FitfulAI");

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-4xl font-bold text-white-800 mb-4 text-center"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.h1>
      <motion.p
        className="text-white-300 text-center max-w-md"
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

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'workouts':
        return <Workouts />;
      case 'meals':
        return <Meals />;
      case 'groceries':
        return <Groceries />;
      case 'about':
        return <About />;
      default:
        return <Home />;
    }
  };

  return (
    <ToastProvider>
      <AuthGuard className="min-h-screen bg-gray-50">
        <ResponsiveNavigation />
        <UserProfileButton />

        <main
          className={`transition-all duration-300 ${isMobile ? 'pb-20' : 'pl-0'
            }`}
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

          {/* <AuthButton /> */}
        </main>
      </AuthGuard>
    </ToastProvider>
  );
}

export default App;
