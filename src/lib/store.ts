import { create } from 'zustand';

interface AppState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  currentWorkspace: string | null;
  setCurrentWorkspace: (workspaceId: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  currentWorkspace: null,
  setCurrentWorkspace: (workspaceId) => set({ currentWorkspace: workspaceId }),
}));
