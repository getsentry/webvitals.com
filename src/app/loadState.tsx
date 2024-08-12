import { create } from "zustand";

interface LoadState {
    loading: boolean;
    // unsure why this is complaining about loading being unused, given its an interface
    // possibly     
    // eslint-disable-next-line no-unused-vars
    setLoading: (loading: boolean) => void;
}

export const useLoadState = create<LoadState>((set) => ({
    loading: true,
    setLoading: (loading: boolean) => set({ loading }),
}));