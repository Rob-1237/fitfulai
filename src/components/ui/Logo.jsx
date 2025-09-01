import { motion } from "framer-motion";

export default function Logo({ className = "" }) {
  return (
    <motion.div
      className={`fixed top-4 left-4 z-50 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-xl font-bold text-[var(--color-md-gray)]">
        FitfulAI
      </h1>
    </motion.div>
  );
}