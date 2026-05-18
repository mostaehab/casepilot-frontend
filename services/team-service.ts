/**
 * Team service. Endpoints from the CasePilot API Postman collection
 * (uid 33613903-e0544731-42ea-4efd-824f-81929da724a7).
 *
 * The API names this domain "teams". The frontend types still call them
 * "Firm" (legacy); the shape is identical.
 *
 * Documented endpoints used here:
 *   POST   /teams                              { name, description? }
 *   GET    /teams/me                           the user's primary team
 *   GET    /teams/memberships                  every team the user is in
 *   GET    /teams/{teamId}                     team detail (includes
 *                                              members + owner profile)
 *   POST   /teams/{teamId}/members             { email, role }   (invite)
 *   POST   /teams/{teamId}/members/accept      accept invitation
 *   PATCH  /teams/{teamId}/members/{userId}    { role }
 *   DELETE /teams/{teamId}/members/{userId}    remove member
 *
 * Endpoints assumed by REST convention but NOT yet documented in Postman:
 *   GET    /teams/{teamId}/invitations         pending invitations
 *   DELETE /invitations/{invitationId}         revoke invitation
 *
 * The undocumented calls below are wrapped to fail gracefully so the team
 * detail page can still render the rest of the team when they 404.
 */

import type {
  Firm,
  TeamInvitation,
  TeamMember,
  Case,
  UserRole,
} from "@/types";
import { apiClient, ApiError } from "@/lib/api-client";
import { mapApiCase, type ApiCase } from "@/services/case-service";

/**
 * Wire shape of GET /teams/{teamId}, after the api-client has unwrapped the
 * envelope and camelized keys. The response embeds the full member roster
 * (each row already carries name + email + status) and the owner's
 * profile alongside the bare team fields.
 */
interface ApiTeamDetail {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  ownerName: string;
  ownerEmail: string;
  members: TeamMember[];
}

export interface TeamDetail {
  team: Firm;
  members: TeamMember[];
  owner: { id: string; name: string; email: string };
}

/**
 * Wire-format invitation as it arrives from the api-client (already
 * camelized). The API field is `team_id`; our internal type uses `firmId`
 * for legacy reasons, so we rename here.
 */
interface ApiInvitation
  extends Omit<TeamInvitation, "firmId" | "invitedAt" | "invitedBy"> {
  teamId?: string | null;
  invitedAt?: string;
  invitedBy?: string;
  /* The API may also return these in the invitation row. */
  createdAt?: string;
  createdBy?: string;
}

function mapInvitation(api: ApiInvitation): TeamInvitation {
  return {
    id: api.id,
    email: api.email,
    status: api.status,
    role: api.role,
    firmId: api.teamId ?? "",
    invitedBy: api.invitedBy ?? api.createdBy ?? "",
    invitedAt: api.invitedAt ?? api.createdAt ?? "",
  };
}

export const teamService = {
  /** GET /teams/memberships — every team the current user belongs to. */
  async getMyTeams(): Promise<Firm[]> {
    return apiClient.get<Firm[]>("/teams/memberships");
  },

  /** GET /teams/me — convenience for "default team". */
  async getMyTeam(): Promise<Firm | null> {
    try {
      return await apiClient.get<Firm>("/teams/me");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  /** POST /teams */
  async createTeam(name: string, description?: string): Promise<Firm> {
    return apiClient.post<Firm>("/teams", { name, description });
  },

  /**
   * GET /teams/{teamId}. The response embeds the team, the full member
   * roster, and the owner's profile, so a single call replaces what used
   * to be a team-fetch + roster-fetch fan-out.
   */
  async getTeam(teamId: string): Promise<TeamDetail> {
    const res = await apiClient.get<ApiTeamDetail>(`/teams/${teamId}`);
    return {
      team: {
        id: res.id,
        name: res.name,
        description: res.description ?? undefined,
        ownerId: res.ownerId,
        createdAt: res.createdAt,
        updatedAt: res.updatedAt,
      },
      members: res.members ?? [],
      owner: {
        id: res.ownerId,
        name: res.ownerName,
        email: res.ownerEmail,
      },
    };
  },

  /**
   * GET /teams/{teamId}/invitations — assumed; not documented yet. Returns
   * [] when the endpoint is unavailable so the UI degrades cleanly.
   */
  async getInvitations(teamId: string): Promise<TeamInvitation[]> {
    try {
      const rows = await apiClient.get<ApiInvitation[]>(
        `/teams/${teamId}/invitations`
      );
      return rows.map(mapInvitation);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return [];
      throw err;
    }
  },

  /** GET /cases/team/{teamId} — cases owned by this team. */
  async getTeamCases(teamId: string): Promise<Case[]> {
    const cases = await apiClient.get<ApiCase[]>(`/cases/team/${teamId}`);
    return cases.map(mapApiCase);
  },

  /**
   * POST /teams/{teamId}/members. Body: { email, role }.
   *
   * Per the API docs the response is a *member row* with `status:
   * "pending"`, NOT a separate invitation entity — invited users live in
   * the team's `members` array from the moment they're invited. We
   * stitch the email back in (the response only returns userId/status/
   * role/teamId) so the caller can render the new row immediately.
   */
  async inviteMember(
    email: string,
    teamId: string,
    role: UserRole = "assistant"
  ): Promise<TeamMember> {
    const row = await apiClient.post<{
      teamId: string;
      userId: string;
      role: UserRole;
      status: "pending" | "active" | "removed";
    }>(`/teams/${teamId}/members`, { email, role });
    return {
      teamId: row.teamId,
      userId: row.userId,
      role: row.role,
      status: row.status,
      email,
    };
  },

  /** POST /teams/{teamId}/members/accept. Used by an invitee on the link. */
  async acceptInvite(teamId: string): Promise<void> {
    await apiClient.post(`/teams/${teamId}/members/accept`);
  },

  /** PATCH /teams/{teamId}/members/{userId} — change a member's role. */
  async updateMemberRole(
    teamId: string,
    userId: string,
    role: UserRole
  ): Promise<TeamMember> {
    return apiClient.patch<TeamMember>(
      `/teams/${teamId}/members/${userId}`,
      { role }
    );
  },

  /** DELETE /teams/{teamId}/members/{userId} */
  async removeMember(teamId: string, userId: string): Promise<void> {
    await apiClient.delete(`/teams/${teamId}/members/${userId}`);
  },

  /**
   * DELETE /invitations/{invitationId} — assumed by REST convention.
   * Surfaces an error if the endpoint isn't there yet.
   */
  async revokeInvitation(invitationId: string): Promise<void> {
    await apiClient.delete(`/invitations/${invitationId}`);
  },
};
