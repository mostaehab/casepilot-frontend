/**
 * Case service. See `casepilot-api/docs/api.md`.
 *
 * Wire format:
 *   - Request bodies are camelCase (caseNumber, courtName, filingDate,
 *     teamId, ...) and are sent through unchanged by the api-client.
 *   - Response bodies are snake_case (case_number, court_name, ...) and
 *     are camelized once at the api-client boundary, so the ApiCase
 *     interface below describes the post-camelize shape.
 *
 * This service handles only the field names that genuinely diverge:
 *
 *   API field   Internal field
 *   ---------   --------------
 *   type        caseType
 *   teamId      firmId
 *   ownerId     createdBy
 *
 * Documented endpoints:
 *   POST   /cases                              create
 *   GET    /cases/me                           cases I created
 *   GET    /cases/assigned                     cases I'm assigned to
 *   GET    /cases/upcoming?limit=N             cases with the next N hearings
 *   GET    /cases/team/{teamId}                cases in a team
 *   GET    /cases/{caseId}                     detail
 *   PATCH  /cases/{caseId}                     full update
 *   PATCH  /cases/{caseId}/status              { status }
 *   DELETE /cases/{caseId}                     archive
 *   POST   /cases/{caseId}/assignments         { userId }
 *   DELETE /cases/{caseId}/assignments/{userId}
 */

import type {
  Case,
  CaseStatus,
  CaseType,
  CasePriority,
} from "@/types";
import { apiClient } from "@/lib/api-client";

/**
 * Wire-format Case after the api-client has camelized snake_case keys.
 * This is NOT the on-the-wire JSON; it's the post-camelize object the
 * service receives.
 */
export interface ApiCase {
  id: string;
  caseNumber?: string;
  title: string;
  description: string;
  type: CaseType;
  priority: CasePriority;
  status: CaseStatus;
  courtName?: string;
  filingDate?: string;
  nextHearingDate?: string;
  clientName: string;
  clientPhone?: string;
  clientNationalNumber?: string;
  teamId?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export function mapApiCase(api: ApiCase): Case {
  return {
    id: api.id,
    caseNumber: api.caseNumber,
    title: api.title,
    description: api.description ?? "",
    caseType: api.type,
    status: api.status,
    priority: api.priority,
    courtName: api.courtName,
    filingDate: api.filingDate,
    nextHearingDate: api.nextHearingDate,
    clientName: api.clientName,
    clientPhone: api.clientPhone,
    clientNationalNumber: api.clientNationalNumber,
    firmId: api.teamId ?? undefined,
    createdBy: api.ownerId,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    /* The API doesn't return assignedTo on the Case shape (yet). Keep it
       empty so the UI types stay happy; assignment data lives on a
       separate endpoint. */
    assignedTo: [],
  };
}

/**
 * Build the create body. Server-derived fields (owner_id, created_at,
 * updated_at) are not sent. Fields the API doesn't know about
 * (clientEmail, assignedTo) are dropped here so we don't pollute the
 * request body.
 */
function toApiCreate(data: Omit<Case, "id" | "createdAt" | "updatedAt">) {
  const payload: Record<string, unknown> = {
    title: data.title,
    description: data.description,
    type: data.caseType,
    priority: data.priority,
    status: data.status,
    clientName: data.clientName,
  };

  if (data.caseNumber) payload.caseNumber = data.caseNumber;
  if (data.courtName) payload.courtName = data.courtName;
  if (data.filingDate) payload.filingDate = data.filingDate;
  if (data.nextHearingDate) payload.nextHearingDate = data.nextHearingDate;
  if (data.clientPhone) payload.clientPhone = data.clientPhone;
  if (data.clientNationalNumber)
    payload.clientNationalNumber = data.clientNationalNumber;
  if (data.firmId) payload.teamId = data.firmId;

  return payload;
}

function toApiUpdate(data: Partial<Case>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (data.title !== undefined) out.title = data.title;
  if (data.description !== undefined) out.description = data.description;
  if (data.caseType !== undefined) out.type = data.caseType;
  if (data.status !== undefined) out.status = data.status;
  if (data.priority !== undefined) out.priority = data.priority;
  if (data.caseNumber !== undefined) out.caseNumber = data.caseNumber;
  if (data.courtName !== undefined) out.courtName = data.courtName;
  if (data.filingDate !== undefined) out.filingDate = data.filingDate;
  if (data.nextHearingDate !== undefined)
    out.nextHearingDate = data.nextHearingDate;
  if (data.clientName !== undefined) out.clientName = data.clientName;
  if (data.clientPhone !== undefined) out.clientPhone = data.clientPhone;
  if (data.clientNationalNumber !== undefined)
    out.clientNationalNumber = data.clientNationalNumber;
  if (data.firmId !== undefined) out.teamId = data.firmId;
  return out;
}

export const caseService = {
  /** GET /cases/me — cases the user created. */
  async getCases(): Promise<Case[]> {
    const cases = await apiClient.get<ApiCase[]>("/cases/me");
    return cases.map(mapApiCase);
  },

  /** GET /cases/assigned — cases the user is assigned to but didn't create. */
  async getAssignedCases(): Promise<Case[]> {
    const cases = await apiClient.get<ApiCase[]>("/cases/assigned");
    return cases.map(mapApiCase);
  },

  /**
   * GET /cases/upcoming?limit=N. Returns the user's accessible cases that
   * have a `nextHearingDate` in the future, sorted ascending. `limit` is
   * clamped by the server to [1, 50] with a default of 5.
   */
  async getUpcomingCases(limit = 5): Promise<Case[]> {
    const cases = await apiClient.get<ApiCase[]>(
      `/cases/upcoming?limit=${limit}`
    );
    return cases.map(mapApiCase);
  },

  /** GET /cases/team/{teamId} */
  async getCasesByTeam(teamId: string): Promise<Case[]> {
    const cases = await apiClient.get<ApiCase[]>(`/cases/team/${teamId}`);
    return cases.map(mapApiCase);
  },

  /** GET /cases/{caseId} */
  async getCase(id: string): Promise<Case> {
    const apiCase = await apiClient.get<ApiCase>(`/cases/${id}`);
    return mapApiCase(apiCase);
  },

  /** POST /cases */
  async createCase(
    data: Omit<Case, "id" | "createdAt" | "updatedAt">
  ): Promise<Case> {
    const apiCase = await apiClient.post<ApiCase>("/cases", toApiCreate(data));
    return mapApiCase(apiCase);
  },

  /** PATCH /cases/{caseId} */
  async updateCase(id: string, data: Partial<Case>): Promise<Case> {
    const apiCase = await apiClient.patch<ApiCase>(
      `/cases/${id}`,
      toApiUpdate(data)
    );
    return mapApiCase(apiCase);
  },

  /** PATCH /cases/{caseId}/status — short-circuit for status transitions. */
  async updateCaseStatus(id: string, status: CaseStatus): Promise<Case> {
    const apiCase = await apiClient.patch<ApiCase>(`/cases/${id}/status`, {
      status,
    });
    return mapApiCase(apiCase);
  },

  /** DELETE /cases/{caseId} */
  async archiveCase(id: string): Promise<void> {
    await apiClient.delete(`/cases/${id}`);
  },

  /** POST /cases/{caseId}/assignments */
  async assignUser(caseId: string, userId: string): Promise<void> {
    await apiClient.post(`/cases/${caseId}/assignments`, { userId });
  },

  /** DELETE /cases/{caseId}/assignments/{userId} */
  async unassignUser(caseId: string, userId: string): Promise<void> {
    await apiClient.delete(`/cases/${caseId}/assignments/${userId}`);
  },
};
