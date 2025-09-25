import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../hooks/useAuth";
// import { faPersonRunning } from "@fortawesome/pro-duotone-svg-icons";

const Home = ({ isDark }) => {
  const { user } = useAuth();

  return (
    <motion.div
      className={`flex flex-col items-center justify-center min-h-screen p-8 ${isDark ? 'bg-[var(--color-black)]' : 'bg-[var(--color-white)]'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className={`text-4xl font-bold ${isDark ? 'text-[var(--color-orange)]' : 'text-[var(--color-black)]'} mb-4 text-center`}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        Welcome to Fitful
      </motion.h1>
      <motion.p
        className={`${isDark ? 'text-[var(--color-lt-gray)]' : 'text-[var(--color-dk-gray)]'} text-center max-w-md mb-8`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Your fitness and nutrition companion
      </motion.p>

      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* {user && (
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium text-lg">✅ Welcome back!</p>
            <p className="text-sm text-green-600 mt-2">
              {user.email}
            </p>
          </div>
        )} */}
        {/* <p className={`${isDark ? 'text-[var(--color-lt-gray)]' : 'text-[var(--color-dk-gray)]'}`}>
          {user
            ? "Navigate using the menu to access your workouts, meals, and more."
            : "Use the top navigation to sign in and unlock your personalized fitness journey."
          }
        </p> */}
      </motion.div>
    </motion.div>
  );
};

export default Home;
