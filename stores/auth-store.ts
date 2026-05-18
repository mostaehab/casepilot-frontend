import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Firm } from "@/types";

interface AuthState {
  user: User | null;
  firm: Firm | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User, firm: Firm | null) => void;
  updateUser: (user: User) => void;
  setFirm: (firm: Firm) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      firm: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user, firm) =>
        set({ user, firm, isAuthenticated: true, error: null }),

      updateUser: (user) => set({ user }),

      setFirm: (firm) => set({ firm }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      logout: () =>
        set({
          user: null,
          firm: null,
          isAuthenticated: false,
          error: null,
        }),
    }),
    {
      name: "casepilot-auth",
      partialize: (state) => ({
        user: state.user,
        firm: state.firm,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
