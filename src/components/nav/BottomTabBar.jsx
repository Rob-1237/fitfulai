import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faPersonRunning, 
  faPlateUtensils, 
  faBasketShopping, 
  faCommentsQuestion 
} from '@fortawesome/pro-duotone-svg-icons';
import { useUIStore } from '../../stores/useUIStore';

const iconMap = {
  home: faHome,
  workouts: faPersonRunning,
  meals: faPlateUtensils,
  groceries: faBasketShopping,
  about: faCommentsQuestion
};

const BottomTabBar = () => {
  const { currentPage, pages, setCurrentPage } = useUIStore();

  const TabButton = ({ page, isActive }) => (
    <motion.button
      className={`flex flex-col items-center justify-center px-2 py-3 rounded-lg transition-colors duration-200 ${
        isActive 
          ? 'bg-blue-500 text-white' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      }`}
      onClick={() => setCurrentPage(page)}
      whileTap={{ scale: 0.95 }}
      animate={isActive ? { y: -2 } : { y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <FontAwesomeIcon 
        icon={iconMap[page]} 
        className={`text-lg mb-1 ${isActive ? 'text-white' : ''}`} 
      />
      <span className={`text-xs font-medium capitalize ${isActive ? 'text-white' : ''}`}>
        {page}
      </span>
      
      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute -top-1 w-1 h-1 bg-white rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-around px-2 py-1 safe-area-bottom">
        {pages.map((page) => (
          <div key={page} className="flex-1 relative">
            <TabButton 
              page={page} 
              isActive={currentPage === page} 
            />
          </div>
        ))}
      </div>
    </motion.nav>
  );
};

export default BottomTabBar;