"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserProfileCircle({
  isLoggedIn,
  clientName,
  clientProject,
  clientPath,
  onSignOut,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Debug logging
  console.log("UserProfileCircle render:", { isLoggedIn, clientName });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't render if not logged in
  if (!isLoggedIn || !clientName) {
    return null;
  }

  // Get first letter of client name
  const firstLetter = clientName.charAt(0).toUpperCase() || "U";

  const handleSignOut = () => {
    onSignOut();
    setIsMenuOpen(false);
    window.location.href = "/";
  };

  const handleViewProject = () => {
    if (clientPath) {
      window.open(`https://${clientPath}`, "_blank");
    }
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log("Edit profile clicked");
    setIsMenuOpen(false);
  };

  return (
    <div className="fixed top-8 right-8 z-50 user-profile-circle" ref={menuRef}>
      {/* Profile Circle */}
      <motion.button
        className="w-8 h-8 rounded-full bg-[var(--vibrant-violet)] hover:bg-[var(--my-vibrant-violet)] active:bg-[var(--my-vibrant-violet)] flex items-center justify-center transition-colors duration-200"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-[var(--color-white)] font-primary text-xl">
          {firstLetter}
        </span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="absolute top-12 right-0 bg-[var(--color-black)] rounded-lg shadow-lg border border-[var(--color-gray-faint)] py-2 min-w-[130px]"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <p
              onClick={handleEdit}
              className="w-full px-4 py-2 text-left text-sm text-[var(--color-white)] italic transition-colors font-primary font-bold"
            >
              {clientProject}
            </p>
            <hr className="text-[var(--color-gray-shadow)]"></hr>
            <button
              onClick={handleViewProject}
              className="w-full px-4 py-2 text-left text-sm text-[var(--color-gray-light)] hover:text-[var(--color-cyan-light)] transition-colors font-primary font-bold"
            >
              View Project
            </button>
            <hr className="text-[var(--color-gray-shadow)]"></hr>
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left text-sm text-[var(--color-gray-light)] hover:text-[var(--color-cyan-light)] transition-colors font-primary font-bold"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
