import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  modalOpen: boolean;
  modalContent: React.ReactNode | null;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  confirmDialog: {
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
    variant?: 'default' | 'destructive';
  };
  showConfirm: (options: Omit<AppState['confirmDialog'], 'open'>) => void;
  hideConfirm: () => void;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  toggleSelectedItem: (id: string) => void;
  clearSelectedItems: () => void;
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
  isAdminSyncing: boolean;
  setIsAdminSyncing: (syncing: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      },
      sidebarOpen: false, 
      sidebarCollapsed: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      modalOpen: false,
      modalContent: null,
      openModal: (content) => set({ modalOpen: true, modalContent: content }),
      closeModal: () => set({ modalOpen: false, modalContent: null }),
      confirmDialog: {
        open: false,
        title: '',
        description: '',
        onConfirm: () => {},
        variant: 'default',
      },
      showConfirm: (options) => set({ confirmDialog: { ...options, open: true } }),
      hideConfirm: () => set((state) => ({ confirmDialog: { ...state.confirmDialog, open: false } })),
      selectedItems: [],
      setSelectedItems: (items) => set({ selectedItems: items }),
      toggleSelectedItem: (id) => {
        const current = get().selectedItems;
        if (current.includes(id)) {
          set({ selectedItems: current.filter((item) => item !== id) });
        } else {
          set({ selectedItems: [...current, id] });
        }
      },
      clearSelectedItems: () => set({ selectedItems: [] }),
      globalSearch: '',
      setGlobalSearch: (search) => set({ globalSearch: search }),
      isAdminSyncing: false,
      setIsAdminSyncing: (syncing) => set({ isAdminSyncing: syncing }),
    }),
    {
      name: 'pesantren-admin-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('pesantren-admin-storage');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      const theme = state?.theme || 'system';
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    } catch (e) {
      console.error('Failed to parse app storage', e);
    }
  }
}