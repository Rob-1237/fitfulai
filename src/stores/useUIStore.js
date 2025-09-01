import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const useUIStore = create(
  subscribeWithSelector((set, get) => ({
    // Navigation state
    currentPage: 'home',
    pages: ['home', 'workouts', 'meals', 'groceries', 'about'],
    
    // Responsive state
    isMobile: window.innerWidth < 768,
    
    // Drawer state (desktop)
    drawerOpen: false,
    
    // Page navigation
    setCurrentPage: (page) => {
      const { pages } = get();
      if (pages.includes(page)) {
        set({ currentPage: page });
        
        // Auto-close drawer after navigation (both mobile and desktop overlay mode)
        const { drawerOpen } = get();
        if (drawerOpen) {
          set({ drawerOpen: false });
        }
      }
    },
    
    // Drawer controls
    toggleDrawer: () => set(state => ({ 
      drawerOpen: !state.drawerOpen 
    })),
    
    closeDrawer: () => set({ drawerOpen: false }),
    
    openDrawer: () => set({ drawerOpen: true }),
    
    // Responsive handling
    updateResponsiveState: () => {
      const isMobile = window.innerWidth < 768;
      set({ isMobile });
      
      // Auto-close drawer when switching to mobile
      if (isMobile) {
        set({ drawerOpen: false });
      }
    },
    
    // Page info helpers
    getCurrentPageInfo: () => {
      const { currentPage } = get();
      const pageConfig = {
        home: { title: 'Home', icon: 'faHome' },
        workouts: { title: 'Workouts', icon: 'faPersonRunning' },
        meals: { title: 'Meals', icon: 'faPlateUtensils' },
        groceries: { title: 'Groceries', icon: 'faBasketShopping' },
        about: { title: 'About', icon: 'faCommentsQuestion' }
      };
      
      return pageConfig[currentPage] || pageConfig.home;
    },
    
    // Navigation helpers
    navigateNext: () => {
      const { currentPage, pages, setCurrentPage } = get();
      const currentIndex = pages.indexOf(currentPage);
      const nextIndex = (currentIndex + 1) % pages.length;
      setCurrentPage(pages[nextIndex]);
    },
    
    navigatePrevious: () => {
      const { currentPage, pages, setCurrentPage } = get();
      const currentIndex = pages.indexOf(currentPage);
      const prevIndex = (currentIndex - 1 + pages.length) % pages.length;
      setCurrentPage(pages[prevIndex]);
    }
  }))
);

// Set up window resize listener (less complicated option)
let resizeTimeout;
const handleResize = () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    useUIStore.getState().updateResponsiveState();
  }, 100); // Debounce resize events
};

// Initialize resize listener
if (typeof window !== 'undefined') {
  window.addEventListener('resize', handleResize);
}

// Cleanup function for when needed
export const cleanupUIStore = () => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize);
  }
};