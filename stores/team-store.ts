import { create } from "zustand";
import type { Firm, TeamMember, Case } from "@/types";
import { teamService } from "@/services/team-service";

interface TeamState {
  // List of all teams the user belongs to
  teams: Firm[];
  isLoadingTeams: boolean;

  // Detail for the currently viewed team
  currentTeam: Firm | null;
  /**
   * The team's roster. Per the API, this includes BOTH active members
   * (status === "active") and pending invitations (status === "pending").
   * The page splits them at render time.
   */
  members: TeamMember[];
  cases: Case[];
  isLoading: boolean;

  error: string | null;

  fetchMyTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<Firm>;
  fetchTeamDetail: (teamId: string) => Promise<void>;
  inviteMember: (email: string, teamId: string) => Promise<void>;
  /** Removes both active members and pending invitations — same endpoint. */
  removeMember: (teamId: string, userId: string) => Promise<void>;
  clearCurrentTeam: () => void;
}

export const useTeamStore = create<TeamState>()((set) => ({
  teams: [],
  isLoadingTeams: false,
  currentTeam: null,
  members: [],
  cases: [],
  isLoading: false,
  error: null,

  fetchMyTeams: async () => {
    set({ isLoadingTeams: true, error: null });
    try {
      const teams = await teamService.getMyTeams();
      set({ teams, isLoadingTeams: false });
    } catch {
      set({ error: "Failed to fetch teams", isLoadingTeams: false });
    }
  },

  createTeam: async (name) => {
    const team = await teamService.createTeam(name);
    set((state) => ({ teams: [team, ...state.teams] }));
    return team;
  },

  fetchTeamDetail: async (teamId) => {
    set({ isLoading: true, error: null });
    try {
      const { team, members } = await teamService.getTeam(teamId);
      set({ currentTeam: team, members, isLoading: false });
    } catch {
      set({ error: "Failed to load team", isLoading: false });
      return;
    }

    // Cases are secondary — failures here must not blank out the team page.
    try {
      const cases = await teamService.getTeamCases(teamId);
      set({ cases });
    } catch {
      set({ cases: [] });
    }
  },

  inviteMember: async (email, teamId) => {
    const member = await teamService.inviteMember(email, teamId);
    // The API returns a member row with status="pending"; push it onto
    // the roster so the pending list updates immediately.
    set((state) => ({ members: [...state.members, member] }));
  },

  removeMember: async (teamId, userId) => {
    try {
      await teamService.removeMember(teamId, userId);
      set((state) => ({
        members: state.members.filter((m) => m.userId !== userId),
      }));
    } catch (err) {
      throw err;
    }
  },

  clearCurrentTeam: () =>
    set({
      currentTeam: null,
      members: [],
      cases: [],
    }),
}));
