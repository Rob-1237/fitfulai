import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faPlateUtensils,
  faBasketShopping,
  faChartUser
} from '@fortawesome/pro-duotone-svg-icons';
import { useUIStore } from '../../stores/useUIStore';

const navigationItems = [
  { path: '/', page: 'home', icon: faHome, label: 'Home' },
  { path: '/dashboard', page: 'dashboard', icon: faChartUser, label: 'Dashboard' },
  { path: '/meals', page: 'meals', icon: faPlateUtensils, label: 'Meals' },
  { path: '/groceries', page: 'groceries', icon: faBasketShopping, label: 'Groceries' }
];

const BottomTabBar = ({ isDark }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { closeDrawer } = useUIStore();

  const handleNavigation = (path) => {
    navigate(path);
    closeDrawer(); // Auto-close drawer after navigation
  };

  const TabButton = ({ item, isActive }) => (
    <motion.button
      className={`flex flex-col items-center justify-center px-2 py-3 rounded-lg transition-colors duration-200 w-20 ${
        isActive 
          ? isDark ? 'bg-[var(--color-yellow)] text-[var(--color-dk-gray)]' : 'bg-[var(--color-yellow)]' 
          : isDark ? 'text-[var(--color-md-gray)] hover:text-[var(--color-lt-gray)] hover:bg-[var(--color-md-gray)]' : 'text-gray-600 hover:text-[var(--color-dk-gray)] hover:bg-[var(--color-md-gray)]'
      }`}
      onClick={() => handleNavigation(item.path)}
      whileTap={{ scale: 0.95 }}
      animate={isActive ? { y: -2 } : { y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <FontAwesomeIcon 
        icon={item.icon} 
        className={`text-lg my-1`} 
      />
      <span className={`text-xs font-medium`}>
        {item.label}
      </span>
    </motion.button>
  );

  return (
    <motion.nav
      className={`fixed bottom-0 left-0 right-0 ${isDark ? 'bg-[var(--color-black)]' : 'bg-[var(--color-white)]'} border-t ${isDark ? 'border-[var(--color-dk-gray)]' : 'border-[var(--color-lt-gray)]'} shadow-lg z-50`}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className={`flex items-center ${isDark ? 'bg-[var(--color-black)]' : 'bg-[var(--color-white)]'} px-2 py-1 safe-area-bottom`}>
        {navigationItems.map((item) => (
          <div key={item.page} className="w-1/5 relative">
            <TabButton
              item={item}
              isActive={location.pathname === item.path}
            />
          </div>
        ))}
      </div>
    </motion.nav>
  );
};

export default BottomTabBar;