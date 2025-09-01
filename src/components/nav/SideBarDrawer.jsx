import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faPersonRunning, 
  faPlateUtensils, 
  faBasketShopping, 
  faCommentsQuestion,
  faBars,
  faTimes
} from '@fortawesome/pro-duotone-svg-icons';
import { useUIStore } from '../../stores/useUIStore';

const iconMap = {
  home: faHome,
  workouts: faPersonRunning,
  meals: faPlateUtensils,
  groceries: faBasketShopping,
  about: faCommentsQuestion
};

const SidebarDrawer = () => {
  const { 
    currentPage, 
    pages, 
    setCurrentPage, 
    drawerOpen, 
    toggleDrawer, 
    closeDrawer 
  } = useUIStore();

  const NavItem = ({ page, isActive }) => (
    <motion.button
      className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
        isActive
          ? 'bg-blue-500 text-white shadow-md'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
      onClick={() => setCurrentPage(page)}
      whileHover={!isActive ? { x: 4 } : {}}
      whileTap={{ scale: 0.98 }}
    >
      <FontAwesomeIcon 
        icon={iconMap[page]} 
        className={`text-lg mr-3 ${isActive ? 'text-white' : 'text-gray-500'}`} 
      />
      <span className={`font-medium capitalize ${isActive ? 'text-white' : ''}`}>
        {page}
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
        className="fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
        onClick={toggleDrawer}
        whileHover={{ opacity: .8 }}
        whileTap={{ scale: 0.95 }}
      >
        <FontAwesomeIcon 
          icon={drawerOpen ? faTimes : faBars} 
          className="text-gray-700 text-2xl" 
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
        className="fixed top-0 right-0 h-full bg-white shadow-xl z-60 border-r border-gray-200"
        initial={{ x: 280 }}
        animate={{ x: drawerOpen ? 0 : 280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ width: '280px' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">FitfulAI</h2>
            <motion.button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              onClick={closeDrawer}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
            </motion.button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 py-6 space-y-2">
            {pages.map((page, index) => (
              <motion.div
                key={page}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <NavItem 
                  page={page} 
                  isActive={currentPage === page} 
                />
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              FitfulAI v0.1.0
            </p>
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export default SidebarDrawer;