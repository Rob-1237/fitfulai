import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faPlateUtensils,
  faBasketShopping,
  faChartUser,
  faBars,
  faTimes
} from '@fortawesome/pro-duotone-svg-icons';
import { useUIStore } from '../../stores/useUIStore';

const navigationItems = [
  { path: '/', page: 'home', icon: faHome, label: 'Home' },
  { path: '/dashboard', page: 'dashboard', icon: faChartUser, label: 'Dashboard' },
  { path: '/meals', page: 'meals', icon: faPlateUtensils, label: 'Meals' },
  { path: '/groceries', page: 'groceries', icon: faBasketShopping, label: 'Groceries' }
];

const SidebarDrawer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isDrawerOpen: drawerOpen,
    toggleDrawer,
    closeDrawer
  } = useUIStore();

  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const handleStorageChange = () => {
      setIsDark(localStorage.getItem('theme') === 'dark');
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    closeDrawer(); // Auto-close drawer after navigation
  };

  const NavItem = ({ item, isActive }) => (
    <motion.button
      className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
        isActive
          ? 'bg-[var(--color-yellow)] text-[var(--color-dk-gray)] shadow-md'
          : isDark ? 'text-[var(--color-md-gray)] hover:bg-[var(--color-lt-gray)] hover:text-[var(--color-dk-gray)]' : 'text-[var(--color-md-gray)] hover:bg-[var(--color-lt-gray)] hover:text-[var(--color-dk-gray)]'
      }`}
      onClick={() => handleNavigation(item.path)}
      whileHover={!isActive ? { x: 4 } : {}}
      whileTap={{ scale: 0.98 }}
    >
      <FontAwesomeIcon 
        icon={item.icon} 
        className={`text-lg mr-3`} 
      />
      <span className={`font-medium`}>
        {item.label}
      </span>
      
      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="ml-auto w-2 h-2 bg-white rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );

  return (
    <>
      {/* Menu Toggle Button */}
      <motion.button
        className={`fixed top-3 right-4 z-50 p-1.75 ${isDark ? 'bg-[var(--color-black)]' : 'bg-[var(--color-white)]'} rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200`}
        onClick={toggleDrawer}
        whileHover={{ opacity: .8 }}
        whileTap={{ scale: 0.95 }}
      >
        <FontAwesomeIcon 
          icon={drawerOpen ? faTimes : faBars} 
          className={`${isDark ? 'text-[var(--color-lt-gray)]' : 'text-[var(--color-dk-gray)]'} text-2xl`} 
        />
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <motion.nav
        className={`fixed top-0 right-0 h-full ${isDark ? 'bg-[var(--color-black)]' : 'bg-[var(--color-white)]'} shadow-xl z-60 transition-colors`}
        style={{ width: '280px' }}
        initial={{ x: 280 }}
        animate={{ x: drawerOpen ? 0 : 280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between ${isDark ? 'text-[var(--color-orange)]' : 'text-[var(--color-dk-gray)]'} p-6 border-b ${isDark ? 'border-[var(--color-dk-gray)]' : 'border-[var(--color-lt-gray)]'}`}>
            <h2 className="text-xl font-bold transition-colors">
              FitfulAI
            </h2>
            <motion.button
              className={`p-2 rounded-lg hover:bg-[var(--color-lt-gray)] ${isDark ? 'text-[var(--color-white)] hover:text-[var(--color-dk-gray)]' : 'text-[var(--color-dk-gray)]'} transition-colors duration-200`}
              onClick={closeDrawer}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FontAwesomeIcon icon={faTimes} className={`${isDark ? 'text-[var(--color-white)] hover:text-[var(--color-dk-gray)]' : 'text-[var(--color-dk-gray)]'}`} />
            </motion.button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item, index) => (
              <motion.div
                key={item.page}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <NavItem 
                  item={item} 
                  isActive={location.pathname === item.path} 
                />
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className={`p-4 border-t ${isDark ? 'border-[var(--color-dk-gray)]' : 'border-[var(--color-lt-gray)]'}`}>
            <p className={`text-xs ${isDark ? 'text-[var(--color-md-gray)]' : 'text-[var(--color-md-gray)]'} text-center`}>
              &copy; 2025 FitfulAI
            </p>
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export default SidebarDrawer;