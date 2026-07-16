import { create } from 'zustand';

export type ModalName = 'auth' | 'profile' | 'settings' | 'editAccount';

interface UIState {
  // Current page state
  currentPage: string;
  setCurrentPage: (page: string) => void;

  // Theme state (DEPRECATED - use useSettings hook instead)
  // Kept for backwards compatibility only
  isDark: boolean;
  toggleTheme: () => void;

  // Mobile detection
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;

  // Drawer state
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // Modal states
  modals: Record<ModalName, boolean>;
  openModal: (modalName: ModalName) => void;
  closeModal: (modalName: ModalName) => void;
  closeAllModals: () => void;

  // Page definitions
  pages: string[];
}

const ALL_MODALS_CLOSED: Record<ModalName, boolean> = {
  auth: false,
  profile: false,
  settings: false,
  editAccount: false,
};

export const useUIStore = create<UIState>((set) => ({
  currentPage: 'home',
  setCurrentPage: (page) => set({ currentPage: page }),

  isDark: false,
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),

  isMobile: false,
  setIsMobile: (isMobile) => set({ isMobile }),

  isDrawerOpen: false,
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  modals: { ...ALL_MODALS_CLOSED },

  openModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: true },
    })),

  closeModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: false },
    })),

  closeAllModals: () => set({ modals: { ...ALL_MODALS_CLOSED } }),

  pages: ['home', 'meals', 'groceries', 'dashboard'],
}));
