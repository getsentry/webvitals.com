import { create } from "zustand";

interface LoadState {
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

export const useLoadState = create<LoadState>((set) => ({
    loading: true,
    setLoading: (loading: boolean) => set({ loading }),
}));