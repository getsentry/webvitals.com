import { create } from "zustand";
import { useEffect } from "react";

interface LoadState {
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

export const useLoadState = create<LoadState>((set) => ({
    loading: true,
    setLoading: (loading: boolean) => set({ loading }),
}));