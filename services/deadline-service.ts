/**
 * Deadline service. See `docs/case-deadlines.md` (mirrors the backend
 * `case-event` module).
 *
 * The backend models these as "events" on a case; the frontend keeps the
 * "Deadline" domain name. Wire format mirrors case-service:
 *   - Request bodies are camelCase and pass through the api-client unchanged.
 *   - Response bodies arrive snake_case and are camelized once at the
 *     api-client boundary, so the ApiDeadlineEvent shape below is the
 *     post-camelize view.
 *
 * Field renames (deadline internal ↔ event wire):
 *   date  ↔ eventDate  (full ISO datetime in UTC; allDay flag controls display)
 *   type  ↔ eventType
 *
 * Endpoints:
 *   POST   /cases/{caseId}/events                    create
 *   GET    /cases/{caseId}/events                    list (event_date ASC, joined creator_name)
 *   GET    /cases/{caseId}/events/{eventId}          detail
 *   PATCH  /cases/{caseId}/events/{eventId}          update (also flips completed)
 *   DELETE /cases/{caseId}/events/{eventId}          remove (owner or creator)
 *   GET    /cases/events/upcoming?limit=N            cross-case upcoming + uncompleted,
 *                                                    accessible, non-closed cases
 *
 * Access (server-enforced):
 *   - read / create:  case owner, assignee, or active team member
 *   - update / delete: case owner, or the user who created the event
 */

import type {
  Deadline,
  DeadlineType,
  UpcomingDeadline,
} from "@/types";
import { apiClient } from "@/lib/api-client";

/** Wire-format event after camelization. `eventType` is loosely typed because
 *  legacy rows may carry pre-migration values; we normalize at the boundary. */
interface ApiDeadlineEvent {
  id: string;
  caseId: string;
  title: string;
  description: string | null;
  eventType: string;
  eventDate: string;
  allDay: boolean;
  completed: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  /** Joined on the list endpoint; absent elsewhere. */
  creatorName?: string;
}

const DEADLINE_TYPES: readonly DeadlineType[] = [
  "hearing",
  "deadline",
  "filing",
  "meeting",
  "reminder",
  "other",
];

/**
 * Map any wire value to a known enum member. Anything we don't recognize
 * (including legacy "filing_deadline" / "court_date" / "follow_up" from
 * pre-migration rows) becomes "other" so editing such a row doesn't get
 * rejected by the server's strict enum validation.
 */
function normalizeDeadlineType(value: unknown): DeadlineType {
  return (DEADLINE_TYPES as readonly string[]).includes(value as string)
    ? (value as DeadlineType)
    : "other";
}

interface ApiUpcomingDeadlineEvent extends ApiDeadlineEvent {
  caseTitle: string;
  caseNumber: string | null;
}

function mapApiDeadline(api: ApiDeadlineEvent): Deadline {
  return {
    id: api.id,
    caseId: api.caseId,
    title: api.title,
    description: api.description ?? undefined,
    type: normalizeDeadlineType(api.eventType),
    date: api.eventDate,
    allDay: api.allDay,
    completed: api.completed,
    createdBy: api.createdBy,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    creatorName: api.creatorName,
  };
}

function mapApiUpcomingDeadline(api: ApiUpcomingDeadlineEvent): UpcomingDeadline {
  return {
    ...mapApiDeadline(api),
    caseTitle: api.caseTitle,
    caseNumber: api.caseNumber,
  };
}

export type DeadlineCreateInput = Omit<
  Deadline,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "createdBy"
  | "creatorName"
  | "completed"
> & { completed?: boolean };

function toApiCreate(data: DeadlineCreateInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    title: data.title,
    eventType: normalizeDeadlineType(data.type),
    eventDate: data.date,
    allDay: data.allDay,
  };
  if (data.description) payload.description = data.description;
  if (data.completed !== undefined) payload.completed = data.completed;
  return payload;
}

/**
 * `description: ""` from a form means "clear it" — the wire contract uses
 * explicit null for that. Other fields are sent as-is.
 */
function toApiUpdate(data: Partial<Deadline>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (data.title !== undefined) out.title = data.title;
  if (data.type !== undefined) out.eventType = normalizeDeadlineType(data.type);
  if (data.date !== undefined) out.eventDate = data.date;
  if (data.allDay !== undefined) out.allDay = data.allDay;
  if (data.completed !== undefined) out.completed = data.completed;
  if (data.description !== undefined) {
    out.description = data.description === "" ? null : data.description;
  }
  return out;
}

export const deadlineService = {
  /** GET /cases/{caseId}/events */
  async getDeadlines(caseId: string): Promise<Deadline[]> {
    const events = await apiClient.get<ApiDeadlineEvent[]>(
      `/cases/${caseId}/events`
    );
    return events.map(mapApiDeadline);
  },

  /** GET /cases/{caseId}/events/{eventId} */
  async getDeadline(caseId: string, eventId: string): Promise<Deadline> {
    const event = await apiClient.get<ApiDeadlineEvent>(
      `/cases/${caseId}/events/${eventId}`
    );
    return mapApiDeadline(event);
  },

  /**
   * GET /cases/events/upcoming?limit=N. Server-side filters: events on
   * accessible, non-closed/archived cases; `event_date >= NOW()`;
   * `completed = false`. `limit` is clamped to [1, 50] (default 10).
   */
  async getUpcomingDeadlines(limit = 10): Promise<UpcomingDeadline[]> {
    const events = await apiClient.get<ApiUpcomingDeadlineEvent[]>(
      `/cases/events/upcoming?limit=${limit}`
    );
    return events.map(mapApiUpcomingDeadline);
  },

  /** POST /cases/{caseId}/events */
  async createDeadline(data: DeadlineCreateInput): Promise<Deadline> {
    const event = await apiClient.post<ApiDeadlineEvent>(
      `/cases/${data.caseId}/events`,
      toApiCreate(data)
    );
    return mapApiDeadline(event);
  },

  /** PATCH /cases/{caseId}/events/{eventId} */
  async updateDeadline(
    caseId: string,
    eventId: string,
    data: Partial<Deadline>
  ): Promise<Deadline> {
    const event = await apiClient.patch<ApiDeadlineEvent>(
      `/cases/${caseId}/events/${eventId}`,
      toApiUpdate(data)
    );
    return mapApiDeadline(event);
  },

  /** PATCH /cases/{caseId}/events/{eventId} — short-circuit for the completed flag. */
  async setCompleted(
    caseId: string,
    eventId: string,
    completed: boolean
  ): Promise<Deadline> {
    const event = await apiClient.patch<ApiDeadlineEvent>(
      `/cases/${caseId}/events/${eventId}`,
      { completed }
    );
    return mapApiDeadline(event);
  },

  /** DELETE /cases/{caseId}/events/{eventId} */
  async deleteDeadline(caseId: string, eventId: string): Promise<void> {
    await apiClient.delete(`/cases/${caseId}/events/${eventId}`);
  },
};
