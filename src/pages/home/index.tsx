import { motion } from "framer-motion";

const Home = ({ isDark }: { isDark: boolean }) => {
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
        Your AI meal planning & grocery companion
      </motion.p>

      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
      </motion.div>
    </motion.div>
  );
};

export default Home;
