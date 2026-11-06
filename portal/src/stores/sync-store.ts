
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SyncState {
  isSyncing: boolean;
  progress: number;
  currentStep: string;
  totalSteps: number;
  lastSynced: number | null;
  errors: string[];
  
  setSyncing: (isSyncing: boolean) => void;
  setProgress: (progress: number) => void;
  setStep: (step: string) => void;
  setTotalSteps: (total: number) => void;
  setLastSynced: (timestamp: number) => void;
  addError: (error: string) => void;
  clearErrors: () => void;
  reset: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      isSyncing: false,
      progress: 0,
      currentStep: '',
      totalSteps: 0,
      lastSynced: null,
      errors: [],

      setSyncing: (isSyncing) => set({ isSyncing }),
      setProgress: (progress) => set({ progress }),
      setStep: (currentStep) => set({ currentStep }),
      setTotalSteps: (totalSteps) => set({ totalSteps }),
      setLastSynced: (lastSynced) => set({ lastSynced }),
      addError: (error) => set((state) => ({ errors: [...state.errors, error] })),
      clearErrors: () => set({ errors: [] }),
      reset: () => set({ isSyncing: false, progress: 0, currentStep: '', errors: [] }),
    }),
    {
      name: 'app-sync-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lastSynced: state.lastSynced }), // Only persist lastSynced
    }
  )
);
