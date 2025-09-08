import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faPersonRunning } from "@fortawesome/pro-duotone-svg-icons";

const Home = ({ isDark }) => {

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

export default Home;
