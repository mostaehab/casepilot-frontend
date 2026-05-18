import { create } from "zustand";
import type { Case } from "@/types";
import { caseService } from "@/services/case-service";

interface CaseState {
  cases: Case[];
  selectedCase: Case | null;
  isLoading: boolean;
  error: string | null;

  fetchCases: () => Promise<void>;
  fetchCase: (id: string) => Promise<void>;
  createCase: (data: Omit<Case, "id" | "createdAt" | "updatedAt">) => Promise<Case>;
  updateCase: (id: string, data: Partial<Case>) => Promise<void>;
  archiveCase: (id: string) => Promise<void>;
  /** Drop all in-memory case state. Called on sign-out. */
  reset: () => void;
}

const initialCaseState = {
  cases: [] as Case[],
  selectedCase: null as Case | null,
  isLoading: false,
  error: null as string | null,
};

export const useCaseStore = create<CaseState>()((set) => ({
  ...initialCaseState,

  reset: () => set(initialCaseState),

  fetchCases: async () => {
    set({ isLoading: true, error: null });
    try {
      const cases = await caseService.getCases();
      set({ cases, isLoading: false });
    } catch {
      set({ error: "Failed to fetch cases", isLoading: false });
    }
  },

  fetchCase: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const selectedCase = await caseService.getCase(id);
      set({ selectedCase, isLoading: false });
    } catch {
      set({ error: "Failed to fetch case", isLoading: false });
    }
  },

  createCase: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newCase = await caseService.createCase(data);
      set((state) => ({
        cases: [newCase, ...state.cases],
        isLoading: false,
      }));
      return newCase;
    } catch {
      set({ error: "Failed to create case", isLoading: false });
      throw new Error("Failed to create case");
    }
  },

  updateCase: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCase = await caseService.updateCase(id, data);
      set((state) => ({
        cases: state.cases.map((c) => (c.id === id ? updatedCase : c)),
        selectedCase:
          state.selectedCase?.id === id ? updatedCase : state.selectedCase,
        isLoading: false,
      }));
    } catch {
      set({ error: "Failed to update case", isLoading: false });
    }
  },

  archiveCase: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await caseService.archiveCase(id);
      set((state) => ({
        cases: state.cases.filter((c) => c.id !== id),
        selectedCase:
          state.selectedCase?.id === id ? null : state.selectedCase,
        isLoading: false,
      }));
    } catch {
      set({ error: "Failed to archive case", isLoading: false });
    }
  },
}));
