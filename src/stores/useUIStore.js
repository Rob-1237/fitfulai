import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const useUIStore = create(
  subscribeWithSelector((set, get) => ({
    // Responsive state
    isMobile: window.innerWidth < 768,
    
    // Drawer state (desktop)
    drawerOpen: false,
    
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