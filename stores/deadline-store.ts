import { create } from "zustand";
import type { Deadline, UpcomingDeadline } from "@/types";
import {
  deadlineService,
  type DeadlineCreateInput,
} from "@/services/deadline-service";

interface DeadlineState {
  deadlines: Deadline[];
  upcoming: UpcomingDeadline[];
  isLoading: boolean;
  error: string | null;

  fetchDeadlines: (caseId: string) => Promise<void>;
  fetchUpcoming: (limit?: number) => Promise<void>;
  createDeadline: (data: DeadlineCreateInput) => Promise<Deadline>;
  updateDeadline: (
    caseId: string,
    eventId: string,
    data: Partial<Deadline>
  ) => Promise<void>;
  setCompleted: (
    caseId: string,
    eventId: string,
    completed: boolean
  ) => Promise<void>;
  deleteDeadline: (caseId: string, eventId: string) => Promise<void>;
  getUpcoming: (days?: number) => Deadline[];
  getOverdue: () => Deadline[];
  /** Drop all in-memory deadline state. Called on sign-out. */
  reset: () => void;
}

const initialDeadlineState = {
  deadlines: [] as Deadline[],
  upcoming: [] as UpcomingDeadline[],
  isLoading: false,
  error: null as string | null,
};

export const useDeadlineStore = create<DeadlineState>()((set, get) => ({
  ...initialDeadlineState,

  reset: () => set(initialDeadlineState),

  fetchDeadlines: async (caseId) => {
    set({ isLoading: true, error: null });
    try {
      const deadlines = await deadlineService.getDeadlines(caseId);
      set({ deadlines, isLoading: false });
    } catch {
      set({ error: "Failed to fetch deadlines", isLoading: false });
    }
  },

  fetchUpcoming: async (limit = 10) => {
    try {
      const upcoming = await deadlineService.getUpcomingDeadlines(limit);
      set({ upcoming });
    } catch {
      set({ error: "Failed to fetch upcoming deadlines" });
    }
  },

  createDeadline: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const deadline = await deadlineService.createDeadline(data);
      set((state) => ({
        deadlines: [...state.deadlines, deadline],
        isLoading: false,
      }));
      return deadline;
    } catch {
      set({ error: "Failed to create deadline", isLoading: false });
      throw new Error("Failed to create deadline");
    }
  },

  updateDeadline: async (caseId, eventId, data) => {
    try {
      const updated = await deadlineService.updateDeadline(
        caseId,
        eventId,
        data
      );
      set((state) => ({
        deadlines: state.deadlines.map((d) =>
          d.id === eventId ? { ...d, ...updated } : d
        ),
        upcoming: state.upcoming.map((d) =>
          d.id === eventId ? { ...d, ...updated } : d
        ),
      }));
    } catch {
      set({ error: "Failed to update deadline" });
    }
  },

  setCompleted: async (caseId, eventId, completed) => {
    try {
      const updated = await deadlineService.setCompleted(
        caseId,
        eventId,
        completed
      );
      set((state) => ({
        deadlines: state.deadlines.map((d) =>
          d.id === eventId ? { ...d, ...updated } : d
        ),
        // Upcoming feed excludes completed events — drop on completion.
        upcoming: completed
          ? state.upcoming.filter((d) => d.id !== eventId)
          : state.upcoming.map((d) =>
              d.id === eventId ? { ...d, ...updated } : d
            ),
      }));
    } catch {
      set({ error: "Failed to update deadline" });
    }
  },

  deleteDeadline: async (caseId, eventId) => {
    try {
      await deadlineService.deleteDeadline(caseId, eventId);
      set((state) => ({
        deadlines: state.deadlines.filter((d) => d.id !== eventId),
        upcoming: state.upcoming.filter((d) => d.id !== eventId),
      }));
    } catch {
      set({ error: "Failed to delete deadline" });
    }
  },

  getUpcoming: (days = 7) => {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return get().deadlines.filter((d) => {
      const date = new Date(d.date);
      return date >= now && date <= future;
    });
  },

  getOverdue: () => {
    const now = new Date();
    return get().deadlines.filter((d) => new Date(d.date) < now);
  },
}));
