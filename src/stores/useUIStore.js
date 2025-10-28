import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  // Current page state
  currentPage: 'home',
  setCurrentPage: (page) => set({ currentPage: page }),

  // Theme state
  isDark: false,
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),

  // Mobile detection
  isMobile: false,
  setIsMobile: (isMobile) => set({ isMobile }),

  // Drawer state
  isDrawerOpen: false,
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  // Modal states
  modals: {
    auth: false,
    profile: false,
    settings: false,
    editAccount: false,
  },

  openModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: true }
    })),

  closeModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: false }
    })),

  closeAllModals: () =>
    set((state) => ({
      modals: Object.keys(state.modals).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {})
    })),

  // Page definitions
  pages: ['home', 'workouts', 'meals', 'groceries', 'dashboard'],
}));